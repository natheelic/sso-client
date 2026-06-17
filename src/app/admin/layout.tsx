"use client";

/**
 * Admin layout — gates the console behind its own login (separate from SSO,
 * mock auth persisted in sessionStorage), then wraps every admin page in the
 * shared data provider + shell chrome.
 *
 * proxy.ts treats /admin as public so the SSO guard doesn't intercept it.
 */
import { useEffect, useState, type ReactNode } from "react";
import { AdminDataProvider } from "@/components/survey/admin/admin-data";
import { AdminShell } from "@/components/survey/admin/admin-shell";
import { AdminLogin } from "@/components/survey/admin/admin-login";

const ADMIN_KEY = "licec-admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAuthed(window.sessionStorage.getItem(ADMIN_KEY) === "1");
  }, []);

  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "var(--background)" }} />;
  }

  if (!authed) {
    return (
      <AdminLogin
        onLogin={() => {
          window.sessionStorage.setItem(ADMIN_KEY, "1");
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <AdminDataProvider>
      <AdminShell
        onLogout={() => {
          window.sessionStorage.removeItem(ADMIN_KEY);
          setAuthed(false);
        }}
      >
        {children}
      </AdminShell>
    </AdminDataProvider>
  );
}
