"use client";

/**
 * AdminDataProvider — shared activity state for the admin console, seeded
 * from the DB by the server layout. Mutations write through to the DB via
 * the server actions in activities-db.ts, then update local state
 * optimistically so admin navigation doesn't need a full refetch.
 * Respondent counts are still derived from the static mock respondent list
 * (real submissions land in a later roadmap phase).
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { RESPONDENTS, type Activity, type TemplateId } from "@/lib/survey-data";
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
  counts: Record<string, number>;
  /** create a blank draft activity, returns its id */
  createActivity: () => Promise<string>;
  saveActivity: (form: Activity) => Promise<void>;
  assignTemplate: (id: string, tmpl: TemplateId) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function AdminDataProvider({
  adminUser, initialActivities, children,
}: { adminUser: AdminUser; initialActivities: Activity[]; children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    RESPONDENTS.forEach((r) => { c[r.activityId] = (c[r.activityId] || 0) + 1; });
    return c;
  }, []);

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
    <AdminDataContext.Provider value={{ adminUser, activities, counts, createActivity, saveActivity, assignTemplate }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
