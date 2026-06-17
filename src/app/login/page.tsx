/**
 * SSO login — participant authentication (styled to match the design's
 * SSOLogin). The button triggers the real OAuth2 Authorization Code flow via
 * NextAuth against the central SSO server.
 */
import { signIn } from "@/lib/auth";
import { COLLEGE } from "@/lib/survey-data";
import { Emblem } from "@/components/survey/emblem";
import { Icon } from "@/components/survey/icon";
import { Button, Card } from "@/components/survey/ui";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  return (
    <main style={{ position: "relative", minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "var(--background)" }}>
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <ThemeToggle />
      </div>

      <div className="fade-in" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <Emblem size={66} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-serif-th)", fontSize: 22, fontWeight: 700 }}>{COLLEGE.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>ระบบแบบสอบถามและเกียรติบัตรออนไลน์</div>
          </div>
        </div>

        <Card style={{ padding: 30, display: "flex", flexDirection: "column", gap: 20, boxShadow: "var(--shadow-lg)" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>เข้าสู่ระบบ</h1>
            <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", margin: "8px 0 0", lineHeight: 1.6 }}>
              ระบบจะนำท่านไปยังเซิร์ฟเวอร์ SSO กลางของวิทยาลัยเพื่อยืนยันตัวตน ก่อนเริ่มทำแบบสอบถาม
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("sso", { redirectTo: callbackUrl ?? "/" });
            }}
          >
            <Button size="lg" type="submit" style={{ width: "100%" }}>
              เข้าสู่ระบบด้วย SSO <Icon name="arrow-right" size={16} />
            </Button>
          </form>
        </Card>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted-foreground)", marginTop: 16 }}>
          ขับเคลื่อนด้วยเซิร์ฟเวอร์ SSO กลาง · {COLLEGE.affiliation}
        </p>
      </div>
    </main>
  );
}
