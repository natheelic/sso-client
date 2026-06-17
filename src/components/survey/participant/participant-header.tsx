"use client";

/**
 * UserHeader — sticky top chrome for the participant surface.
 * Shows the real SSO user, a theme toggle, and a sign-out form wired to the
 * real NextAuth signOut server action.
 */
import Link from "next/link";
import { signOutAction } from "@/lib/actions";
import { LogoLockup } from "@/components/survey/emblem";
import { Icon } from "@/components/survey/icon";
import { ThemeToggle } from "@/components/theme-toggle";

export interface ParticipantUser {
  name: string;
  email: string | null;
  image?: string | null;
}

export function UserHeader({ user }: { user: ParticipantUser }) {
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase() || "?";
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
              background: "var(--card)", color: "var(--muted-foreground)", cursor: "pointer",
            }}
          >
            <Icon name="log-out" size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
