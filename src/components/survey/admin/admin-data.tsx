"use client";

/**
 * AdminDataProvider — shared, mutable in-memory activity state for the admin
 * console (seeded from the mock data). Lives in the admin layout so edits,
 * new activities, and template assignments persist across admin navigation.
 * Respondent counts are derived once from the static respondent list.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ACTIVITIES, RESPONDENTS, type Activity, type TemplateId } from "@/lib/survey-data";

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
  createActivity: () => string;
  saveActivity: (form: Activity) => void;
  assignTemplate: (id: string, tmpl: TemplateId) => void;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

function cloneActivity(a: Activity): Activity {
  return { ...a, questions: a.questions.map((q) => ({ ...q, options: q.options ? [...q.options] : undefined })) };
}

export function AdminDataProvider({ adminUser, children }: { adminUser: AdminUser; children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(() => ACTIVITIES.map(cloneActivity));

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    RESPONDENTS.forEach((r) => { c[r.activityId] = (c[r.activityId] || 0) + 1; });
    return c;
  }, []);

  const createActivity = () => {
    const id = "act-new-" + Date.now();
    const blank: Activity = {
      id, code: "LICEC-68-0" + Math.floor(Math.random() * 90 + 10), title: "", type: "โครงการอบรม",
      hours: 6, location: "", dateLabel: "", issueDate: "2568-06-01", status: "ร่าง",
      certTemplate: "classic", target: 50, description: "", questions: [], __new: true,
    };
    setActivities((l) => [blank, ...l]);
    return id;
  };

  const saveActivity = (form: Activity) =>
    setActivities((l) => l.map((a) => (a.id === form.id ? { ...form, __new: false } : a)));

  const assignTemplate = (id: string, tmpl: TemplateId) =>
    setActivities((l) => l.map((a) => (a.id === id ? { ...a, certTemplate: tmpl } : a)));

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
