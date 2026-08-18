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
import * as collegeDb from "@/lib/college-db";
import type { CollegeInfo } from "@/lib/college-db";

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
  college: CollegeInfo;
  /** create a blank draft activity, returns its id */
  createActivity: () => Promise<string>;
  saveActivity: (form: Activity) => Promise<void>;
  assignTemplate: (id: string, tmpl: TemplateId) => Promise<void>;
  saveCollegeInfo: (info: Omit<CollegeInfo, "signatureImage" | "logoImage" | "signatureVariant">) => Promise<void>;
  saveSignature: (signatureImage: string | null, signatureVariant: number) => Promise<void>;
  saveLogo: (logoImage: string | null) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataValue | null>(null);

export function AdminDataProvider({
  adminUser, initialActivities, respondents, initialCollege, children,
}: { adminUser: AdminUser; initialActivities: Activity[]; respondents: Respondent[]; initialCollege: CollegeInfo; children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [college, setCollege] = useState<CollegeInfo>(initialCollege);

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

  const saveCollegeInfo: AdminDataValue["saveCollegeInfo"] = async (info) => {
    await collegeDb.saveCollegeInfo(info);
    setCollege((c) => ({ ...c, ...info }));
  };

  const saveSignature = async (signatureImage: string | null, signatureVariant: number) => {
    await collegeDb.saveSignature(signatureImage, signatureVariant);
    setCollege((c) => ({ ...c, signatureImage, signatureVariant }));
  };

  const saveLogo = async (logoImage: string | null) => {
    await collegeDb.saveLogo(logoImage);
    setCollege((c) => ({ ...c, logoImage }));
  };

  return (
    <AdminDataContext.Provider value={{
      adminUser, activities, respondents, counts, college,
      createActivity, saveActivity, assignTemplate, saveCollegeInfo, saveSignature, saveLogo,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}
