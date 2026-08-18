"use server";

/**
 * DB-backed survey submission + certificate issuance — replaces the
 * sessionStorage-based getRecord/saveRecord in survey-progress.ts. The
 * server, not the client, is the source of truth for who submitted what and
 * which certificate they hold: every function here re-derives the caller's
 * identity from the SSO session rather than trusting a client-supplied
 * userId.
 */
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface CertRecord {
  name: string;
  certNo: string;
  /** Buddhist-era ISO-like issue date, e.g. "2568-05-14" */
  issueISO: string;
  activityId: string;
  signatureVariant: number;
}

type AnswerMap = Record<string, number | string | string[] | undefined>;

function pad(n: number, len: number) {
  return String(n).padStart(len, "0");
}

function isCertNoConflict(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    Array.isArray(err.meta?.target) &&
    (err.meta.target as string[]).includes("certNo")
  );
}

/** Upserts a certificate for (activityId, userId), retrying with a bumped serial on a certNo collision. */
async function issueCertificate(
  activity: { id: string; code: string; issueDate: string },
  userId: string,
  recipientName: string,
  signatureVariant: number,
): Promise<CertRecord> {
  const yearShort = activity.issueDate.slice(2, 4);
  const base = await db.certificateRecord.count({ where: { activityId: activity.id } });

  for (let attempt = 0; attempt < 5; attempt++) {
    const serial = pad(base + 1 + attempt, 4);
    const certNo = `LICEC ${yearShort}-${activity.code.slice(-3)}/${serial}`;
    try {
      const row = await db.certificateRecord.upsert({
        where: { activityId_userId: { activityId: activity.id, userId } },
        create: { certNo, activityId: activity.id, userId, recipientName, issueDate: activity.issueDate, signatureVariant },
        update: { certNo, recipientName, issueDate: activity.issueDate, signatureVariant, issuedAt: new Date() },
      });
      return { name: row.recipientName, certNo: row.certNo, issueISO: row.issueDate, activityId: row.activityId, signatureVariant: row.signatureVariant };
    } catch (err) {
      if (isCertNoConflict(err) && attempt < 4) continue;
      throw err;
    }
  }
  throw new Error("Could not generate a unique certificate number");
}

/**
 * Records the signed-in participant's answers and issues (or re-issues, on
 * a retake) their certificate for an activity. Trusts only the session for
 * identity — activityId is re-validated against the DB, not the client's
 * copy of the activity.
 */
export async function submitSurvey(
  activityId: string,
  recipientName: string,
  answers: AnswerMap,
  signatureVariant: number,
): Promise<CertRecord> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  const userId = session.user.id;

  const activity = await db.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new Error("Activity not found");

  await db.submission.upsert({
    where: { activityId_userId: { activityId, userId } },
    create: {
      activityId, userId, answers: answers as Prisma.InputJsonValue,
      userName: session.user.name ?? recipientName, userEmail: session.user.email ?? null,
    },
    update: {
      answers: answers as Prisma.InputJsonValue,
      userName: session.user.name ?? recipientName, userEmail: session.user.email ?? null,
      submittedAt: new Date(),
    },
  });

  return issueCertificate(activity, userId, recipientName, signatureVariant);
}

/** The signed-in participant's certificate for an activity, if they've completed it. */
export async function getMyCertificate(activityId: string): Promise<CertRecord | null> {
  const session = await auth();
  if (!session?.user) return null;
  const row = await db.certificateRecord.findUnique({
    where: { activityId_userId: { activityId, userId: session.user.id } },
  });
  return row
    ? { name: row.recipientName, certNo: row.certNo, issueISO: row.issueDate, activityId: row.activityId, signatureVariant: row.signatureVariant }
    : null;
}

/** Activity ids the signed-in participant already holds a certificate for. */
export async function getMyCompletedActivityIds(): Promise<Record<string, boolean>> {
  const session = await auth();
  if (!session?.user) return {};
  const rows = await db.certificateRecord.findMany({
    where: { userId: session.user.id },
    select: { activityId: true },
  });
  const map: Record<string, boolean> = {};
  rows.forEach((r) => { map[r.activityId] = true; });
  return map;
}
