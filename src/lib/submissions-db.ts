"use server";

/**
 * DB-backed survey submission + certificate issuance. The server, not the
 * client, is the source of truth for who submitted what and which
 * certificate they hold: every function here re-derives the caller's
 * identity from the SSO session rather than trusting a client-supplied
 * userId.
 */
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { thaiShortDate, type Respondent } from "@/lib/survey-data";
import { getCollegeSettings } from "@/lib/college-db";

export interface CertRecord {
  name: string;
  certNo: string;
  /** Buddhist-era ISO-like issue date, e.g. "2568-05-14" */
  issueISO: string;
  activityId: string;
}

export type AnswerMap = Record<string, number | string | string[] | undefined>;

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

/**
 * Upserts a certificate for (activityId, userId), retrying with a bumped
 * serial on a certNo collision. signatureVariant is recorded as-issued but
 * every render path (survey delivery, verify page, admin preview) actually
 * displays the college's *current* signature/logo settings, not this frozen
 * value — see getCollegeSettings().
 */
async function issueCertificate(
  activity: { id: string; collegeId: string; code: string; issueDate: string },
  userId: string,
  recipientName: string,
): Promise<CertRecord> {
  const yearShort = activity.issueDate.slice(2, 4);
  const [base, college] = await Promise.all([
    db.certificateRecord.count({ where: { activityId: activity.id } }),
    getCollegeSettings(),
  ]);

  for (let attempt = 0; attempt < 5; attempt++) {
    const serial = pad(base + 1 + attempt, 4);
    const certNo = `LICEC ${yearShort}-${activity.code.slice(-3)}/${serial}`;
    try {
      const row = await db.certificateRecord.upsert({
        where: { activityId_userId: { activityId: activity.id, userId } },
        create: { certNo, collegeId: activity.collegeId, activityId: activity.id, userId, recipientName, issueDate: activity.issueDate, signatureVariant: college.signatureVariant },
        update: { certNo, recipientName, issueDate: activity.issueDate, signatureVariant: college.signatureVariant, issuedAt: new Date() },
      });
      return { name: row.recipientName, certNo: row.certNo, issueISO: row.issueDate, activityId: row.activityId };
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
): Promise<CertRecord> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  const userId = session.user.id;

  const activity = await db.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw new Error("Activity not found");

  await db.submission.upsert({
    where: { activityId_userId: { activityId, userId } },
    create: {
      collegeId: activity.collegeId, activityId, userId, answers: answers as Prisma.InputJsonValue,
      userName: session.user.name ?? recipientName, userEmail: session.user.email ?? null,
    },
    update: {
      answers: answers as Prisma.InputJsonValue,
      userName: session.user.name ?? recipientName, userEmail: session.user.email ?? null,
      submittedAt: new Date(),
    },
  });

  return issueCertificate(activity, userId, recipientName);
}

/** The signed-in participant's certificate for an activity, if they've completed it. */
export async function getMyCertificate(activityId: string): Promise<CertRecord | null> {
  const session = await auth();
  if (!session?.user) return null;
  const row = await db.certificateRecord.findUnique({
    where: { activityId_userId: { activityId, userId: session.user.id } },
  });
  return row ? { name: row.recipientName, certNo: row.certNo, issueISO: row.issueDate, activityId: row.activityId } : null;
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

export interface PublicCertificate {
  certNo: string;
  recipientName: string;
  issueDate: string;
  activity: {
    title: string;
    type: string;
    hours: number;
    dateLabel: string;
    certTemplate: string;
  };
}

/**
 * Public certificate lookup by number, for the /verify/[certNo] page —
 * anyone with a certificate number (printed or from its QR code) can look
 * it up, no login required. Deliberately excludes userId/email: this is
 * meant to be shown to strangers verifying a credential.
 */
export async function getCertificateByCertNo(certNo: string): Promise<PublicCertificate | null> {
  const row = await db.certificateRecord.findUnique({
    where: { certNo },
    include: { activity: true },
  });
  if (!row) return null;
  return {
    certNo: row.certNo,
    recipientName: row.recipientName,
    issueDate: row.issueDate,
    activity: {
      title: row.activity.title,
      type: row.activity.type,
      hours: row.activity.hours,
      dateLabel: row.activity.dateLabel,
      certTemplate: row.activity.certTemplate,
    },
  };
}

/** Average of a submission's rating-type answers (the only numeric-valued answers). */
function ratingAverage(answers: unknown): number {
  const values = Object.values((answers as Record<string, unknown>) ?? {}).filter((v): v is number => typeof v === "number");
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

/**
 * Every certificate holder across all activities, for the admin respondents
 * screen — newest first. Joins each certificate to its matching submission
 * (same activityId + userId) to compute a satisfaction average.
 */
export async function getRespondents(): Promise<Respondent[]> {
  const [certs, submissions] = await Promise.all([
    db.certificateRecord.findMany({ orderBy: { issuedAt: "desc" } }),
    db.submission.findMany({ select: { activityId: true, userId: true, answers: true, userEmail: true } }),
  ]);
  const subByKey = new Map(submissions.map((s) => [`${s.activityId}:${s.userId}`, s]));

  return certs.map((c) => {
    const sub = subByKey.get(`${c.activityId}:${c.userId}`);
    return {
      id: c.id,
      name: c.recipientName,
      email: sub?.userEmail ?? null,
      activityId: c.activityId,
      certNo: c.certNo,
      dateISO: c.issueDate,
      dateLabel: thaiShortDate(c.issueDate),
      avg: ratingAverage(sub?.answers).toFixed(2),
    };
  });
}

/** Raw answers for every submission of one activity, for the admin results screen. */
export async function getSubmissionAnswers(activityId: string): Promise<AnswerMap[]> {
  const rows = await db.submission.findMany({ where: { activityId }, select: { answers: true } });
  return rows.map((r) => r.answers as AnswerMap);
}
