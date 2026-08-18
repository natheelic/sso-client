"use client";

/**
 * AdminDataProvider — shared activity + respondent state for the admin
 * console, seeded from the DB by the server layout. Activity mutations
 * write through to the DB via the server actions in activities-db.ts, then
 * update local state optimistically so admin navigation doesn't need a full
 * refetch. Respondents are read-only from the admin console, so they're
 * just the snapshot fetched when the admin session started.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Activity, Respondent, TemplateId } from "@/lib/survey-data";
import * as activitiesDb from "@/lib/activities-db";

/** The signed-in SSO survey creator (passed down from the server layout). */
export interface AdminUser {
  name: string;
  email: string | null;
  role: string;
}

interface AdminDataValue {
  adminUser: AdminUser;
  activities: Activity[];
  respondents: Respondent[];
  counts: Record<string, number>;
  /** create a blank draft activity, returns its id */
  createActivity: () => Promise<string>;
  saveActivity: (form: Activity) => Promise<void>;
  assignTemplate: (id: string, tmpl: TemplateId) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function AdminDataProvider({
  adminUser, initialActivities, respondents, children,
}: { adminUser: AdminUser; initialActivities: Activity[]; respondents: Respondent[]; children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    respondents.forEach((r) => { c[r.activityId] = (c[r.activityId] || 0) + 1; });
    return c;
  }, [respondents]);

  const createActivity = async () => {
    const created = await activitiesDb.createActivity();
    setActivities((l) => [{ ...created, __new: true }, ...l]);
    return created.id;
  };

  const saveActivity = async (form: Activity) => {
    await activitiesDb.saveActivity(form);
    setActivities((l) => l.map((a) => (a.id === form.id ? { ...form, __new: false } : a)));
  };

  const assignTemplate = async (id: string, tmpl: TemplateId) => {
    await activitiesDb.assignTemplate(id, tmpl);
    setActivities((l) => l.map((a) => (a.id === id ? { ...a, certTemplate: tmpl } : a)));
  };

  return (
    <AdminDataContext.Provider value={{ adminUser, activities, respondents, counts, createActivity, saveActivity, assignTemplate }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
