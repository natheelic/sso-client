/**
 * Admin (survey-creator) layout.
 *
 * proxy.ts already enforces SSO login + app authorization for /admin at the
 * middleware level; requireAdminSession() repeats that check here so this
 * layout doesn't depend solely on the matcher being configured correctly.
 */
import type { ReactNode } from "react";
import { requireAdminSession } from "@/lib/auth";
import { AdminDataProvider } from "@/components/survey/admin/admin-data";
import { AdminShell } from "@/components/survey/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  const u = session.user;
  const adminUser = {
    name: u.name ?? "ผู้ดูแลระบบ",
    email: u.email ?? null,
    role: u.role ?? "",
  };

  return (
    <AdminDataProvider adminUser={adminUser}>
      <AdminShell>{children}</AdminShell>
    </AdminDataProvider>
  );
}
