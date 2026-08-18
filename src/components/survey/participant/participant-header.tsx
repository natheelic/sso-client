"use client";

/**
 * Participant header (authenticated). Taking a survey requires SSO login —
 * because every survey issues a certificate tied to a verified identity — so
 * this shows the signed-in user, a theme toggle, and a real sign-out. A shield
 * link points staff to the creator console (proxy 403s unauthorized users).
 */
import Link from "next/link";
import { signOutAction } from "@/lib/actions";
import { LogoLockup } from "@/components/survey/emblem";
import { Icon } from "@/components/survey/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { getInitial } from "@/lib/format";

export interface ParticipantUser {
  name: string;
  email: string | null;
  image?: string | null;
}

export function UserHeader({ user }: { user: ParticipantUser }) {
  const initial = getInitial(user.name, user.email);
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 30, height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(16px, 5vw, 48px)", background: "var(--header-bg)",
        backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <LogoLockup size={36} />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link
          href="/admin"
          title="สร้างแบบสอบถาม (เจ้าหน้าที่)"
          aria-label="สร้างแบบสอบถาม (เจ้าหน้าที่)"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)",
            background: "var(--card)", color: "var(--muted-foreground)", textDecoration: "none", flexShrink: 0,
          }}
        >
          <Icon name="shield" size={16} />
        </Link>

        <div style={{ textAlign: "right", lineHeight: 1.3 }} className="hide-sm">
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--foreground)" }}>{user.name || "ผู้เข้าร่วม"}</div>
          {user.email && <div style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>{user.email}</div>}
        </div>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary)", color: "var(--primary-foreground)", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
          {initial}
        </div>
        <ThemeToggle />
        <form action={signOutAction}>
          <button
            type="submit"
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)",
              background: "var(--card)", color: "var(--muted-foreground)", cursor: "pointer", flexShrink: 0,
            }}
          >
            <Icon name="log-out" size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
