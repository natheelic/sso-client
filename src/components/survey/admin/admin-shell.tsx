"use client";

/**
 * AdminShell — fixed sidebar + header for the admin console (ported from
 * AdminShell.jsx), made route-aware: nav uses Next links and the active item
 * is derived from the pathname. Collapses to an off-canvas drawer < 900px.
 */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions";
import { Emblem } from "@/components/survey/emblem";
import { Icon } from "@/components/survey/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAdminData } from "@/components/survey/admin/admin-data";
import { getInitial } from "@/lib/format";

const ADMIN_NAV: [string, string, string, string][] = [
  ["dashboard", "ภาพรวม", "layout-dashboard", "/admin"],
  ["activities", "กิจกรรม", "clipboard-list", "/admin/activities"],
  ["respondents", "ผู้รับเกียรติบัตร", "users", "/admin/respondents"],
  ["templates", "เทมเพลตเกียรติบัตร", "award", "/admin/templates"],
  ["results", "สรุปผลแบบสอบถาม", "bar-chart-3", "/admin/results"],
  ["settings", "ตั้งค่า", "settings", "/admin/settings"],
];

function sectionFor(pathname: string): string {
  if (pathname === "/admin") return "dashboard";
  for (const [id, , , href] of ADMIN_NAV) {
    if (href !== "/admin" && pathname.startsWith(href)) return id;
  }
  return "dashboard";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = sectionFor(pathname);
  const { adminUser } = useAdminData();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)" }}>
      {/* backdrop (mobile) */}
      {mobileOpen && (
        <button
          aria-label="ปิดเมนู"
          onClick={() => setMobileOpen(false)}
          className="admin-backdrop"
          style={{ position: "fixed", inset: 0, zIndex: 45, background: "rgba(10,10,10,0.45)", border: "none", cursor: "pointer" }}
        />
      )}

      {/* sidebar */}
      <aside className={"admin-aside" + (mobileOpen ? " open" : "")} style={{
        position: "fixed", insetBlock: 0, left: 0, width: 248, zIndex: 50,
        display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--card)",
      }}>
        <div style={{ height: 64, padding: "0 18px", display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Emblem size={32} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "-0.01em" }}>การอาชีพลอง</div>
              <div style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>ระบบจัดการเกียรติบัตร</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", padding: "8px 12px 4px", letterSpacing: "0.04em" }}>เมนูหลัก</div>
          {ADMIN_NAV.map(([id, label, icon, href]) => {
            const isActive = id === active;
            return (
              <Link key={id} href={href} onClick={() => setMobileOpen(false)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 7, fontSize: 14,
                textDecoration: "none", textAlign: "left", width: "100%",
                background: isActive ? "var(--primary)" : "transparent",
                color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                fontWeight: isActive ? 600 : 500, transition: "background .15s, color .15s",
              }}>
                <Icon name={icon} size={17} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <Icon name="chevron-right" size={14} style={{ opacity: 0.7 }} />}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 2 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 7, fontSize: 14, color: "var(--muted-foreground)", textDecoration: "none" }}>
            <Icon name="external-link" size={16} />ดูเว็บผู้ใช้
          </Link>
          <form action={signOutAction}>
            <button type="submit" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 7, fontSize: 14, color: "var(--muted-foreground)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
              <Icon name="log-out" size={16} />ออกจากระบบ (SSO)
            </button>
          </form>
        </div>
      </aside>

      {/* header */}
      <header className="admin-header" style={{
        position: "fixed", top: 0, left: 248, right: 0, height: 64, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--border)", background: "var(--header-bg)", backdropFilter: "blur(8px)", padding: "0 24px",
      }}>
        <button className="admin-burger" onClick={() => setMobileOpen((m) => !m)} aria-label="เมนู" style={{ display: "none", background: "transparent", border: "none", cursor: "pointer", color: "var(--foreground)" }}>
          <Icon name="menu" size={20} />
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="hide-sm" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted-foreground)", padding: "5px 10px", borderRadius: 999, background: "var(--secondary)" }}>
            <Icon name="shield" size={13} />เข้าสู่ระบบผ่าน SSO
          </span>
          <ThemeToggle />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--primary)", color: "var(--primary-foreground)", display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600 }}>{getInitial(adminUser.name, adminUser.email)}</div>
            <div style={{ lineHeight: 1.2 }} className="hide-sm">
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{adminUser.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{adminUser.role || "ผู้สร้างแบบสอบถาม"}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main" style={{ marginLeft: 248, paddingTop: 64, minHeight: "100vh" }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 900px){
          .admin-aside{ transform: translateX(-100%); transition: transform .2s; box-shadow: var(--shadow-lg); }
          .admin-aside.open{ transform: translateX(0); }
          .admin-header{ left: 0 !important; }
          .admin-main{ margin-left: 0 !important; }
          .admin-burger{ display: inline-flex !important; }
        }
        @media (min-width: 901px){ .admin-backdrop{ display: none !important; } }
      `}</style>
    </div>
  );
}
