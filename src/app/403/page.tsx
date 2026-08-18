/**
 * 403 Forbidden — shown when the authenticated SSO user's token does not
 * include this app's SSO_CLIENT_ID in the apps[] claim.
 */
import { auth, signOut } from "@/lib/auth";
import { getCollegeSettings } from "@/lib/college-db";
import { Icon } from "@/components/survey/icon";
import { Button } from "@/components/survey/ui";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function ForbiddenPage() {
  const [session, college] = await Promise.all([auth(), getCollegeSettings()]);
  const user = session?.user as { email?: string | null; name?: string | null } | undefined;

  return (
    <main style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: "40px 20px", textAlign: "center", background: "var(--background)" }}>
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--danger-bg)", border: "2px solid var(--danger-fg)", display: "grid", placeItems: "center", color: "var(--danger-fg)" }}>
        <Icon name="shield" size={36} />
      </div>

      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: "var(--foreground)" }}>403</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>ไม่มีสิทธิ์เข้าใช้งาน</div>
        {user?.email ? (
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 10, lineHeight: 1.7 }}>
            บัญชี <strong style={{ color: "var(--foreground)" }}>{user.email}</strong> ยังไม่ได้รับสิทธิ์เข้าใช้งาน
            <strong> ระบบแบบสอบถามและเกียรติบัตร</strong> ของ{college.name} กรุณาติดต่อผู้ดูแลระบบ
          </p>
        ) : (
          <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 10, lineHeight: 1.7 }}>
            ท่านยังไม่ได้รับสิทธิ์เข้าใช้งานระบบนี้ กรุณาติดต่อผู้ดูแลระบบ
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <Button variant="outline"><Icon name="arrow-left" size={15} />กลับหน้าหลัก</Button>
        </a>
        {user && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="destructive"><Icon name="log-out" size={15} />ออกจากระบบ</Button>
          </form>
        )}
      </div>
    </main>
  );
}
