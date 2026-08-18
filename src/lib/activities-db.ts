"use server";

/**
 * DB-backed reads/writes for activities + questions — replaces the static
 * ACTIVITIES array (survey-data.ts) and admin-data.tsx's in-memory state.
 * Returned shapes match the app's existing `Activity`/`Question` types so
 * every consumer (activity-list, activity-intro, the admin screens) keeps
 * working unchanged.
 */
import { db } from "@/lib/db";
import { getDefaultCollegeId } from "@/lib/college-db";
import type { Activity, Question, QuestionType, TemplateId } from "@/lib/survey-data";

function toQuestion(q: { id: string; type: string; title: string; required: boolean; options: string[] }): Question {
  return { id: q.id, type: q.type as QuestionType, title: q.title, required: q.required, options: q.options };
}

function toActivity(a: {
  id: string; code: string; title: string; type: string; hours: number; location: string;
  dateLabel: string; issueDate: string; status: string; certTemplate: string; target: number;
  description: string; questions: Parameters<typeof toQuestion>[0][];
}): Activity {
  return {
    id: a.id, code: a.code, title: a.title, type: a.type, hours: a.hours, location: a.location,
    dateLabel: a.dateLabel, issueDate: a.issueDate, status: a.status as Activity["status"],
    certTemplate: a.certTemplate as TemplateId, target: a.target, description: a.description,
    questions: a.questions.map(toQuestion),
  };
}

export async function getActivities(): Promise<Activity[]> {
  const rows = await db.activity.findMany({
    include: { questions: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toActivity);
}

export async function getActivity(id: string): Promise<Activity | null> {
  const row = await db.activity.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  return row ? toActivity(row) : null;
}

/** Creates a blank draft activity in the DB and returns it. */
export async function createActivity(): Promise<Activity> {
  // TEMPORARY: defaults to the one migrated college until Phase 5.4 adds
  // real per-session "which college am I managing" context.
  const collegeId = await getDefaultCollegeId();
  const id = "act-new-" + Date.now();
  const row = await db.activity.create({
    data: {
      id, collegeId,
      code: "LICEC-68-" + String(Date.now()).slice(-6),
      title: "", type: "โครงการอบรม", hours: 6, location: "", dateLabel: "",
      issueDate: "2568-06-01", status: "ร่าง", certTemplate: "classic", target: 50, description: "",
    },
    include: { questions: true },
  });
  return toActivity(row);
}

/** Upserts an activity's detail fields and replaces its full question set. */
export async function saveActivity(form: Activity): Promise<void> {
  await db.$transaction([
    db.activity.update({
      where: { id: form.id },
      data: {
        code: form.code, title: form.title, type: form.type, hours: form.hours, location: form.location,
        dateLabel: form.dateLabel, issueDate: form.issueDate, status: form.status,
        certTemplate: form.certTemplate, target: form.target, description: form.description,
      },
    }),
    db.question.deleteMany({ where: { activityId: form.id } }),
    db.question.createMany({
      data: form.questions.map((q, i) => ({
        id: q.id, activityId: form.id, type: q.type, title: q.title, required: q.required,
        options: q.options ?? [], order: i,
      })),
    }),
  ]);
}

export async function assignTemplate(id: string, tmpl: TemplateId): Promise<void> {
  await db.activity.update({ where: { id }, data: { certTemplate: tmpl } });
}
