"use client";

/**
 * AdminLogin — admin account login, intentionally separate from SSO
 * (ported from AdminLogin.jsx). Mock auth: any submit logs in.
 */
import { useState, type FormEvent } from "react";
import { COLLEGE } from "@/lib/survey-data";
import { Button, Card, Field, Input } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { Emblem } from "@/components/survey/emblem";

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@licec.ac.th");
  const [pw, setPw] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const go = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(onLogin, 750);
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "var(--background)" }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <Emblem size={56} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>ระบบจัดการเกียรติบัตร</div>
            <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>{COLLEGE.name}</div>
          </div>
        </div>
        <Card style={{ padding: 30, boxShadow: "var(--shadow-lg)" }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 4px" }}>เข้าสู่ระบบผู้ดูแล</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 22px", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="shield" size={13} />บัญชีผู้ดูแลแยกจากระบบ SSO
          </p>
          <form onSubmit={go} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="อีเมลผู้ดูแล"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="รหัสผ่าน"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
            <Button type="submit" size="lg" style={{ width: "100%", marginTop: 4 }} disabled={loading}>
              {loading
                ? <><Icon name="loader-circle" size={16} style={{ animation: "spin 1s linear infinite" }} />กำลังเข้าสู่ระบบ…</>
                : <>เข้าสู่ระบบ<Icon name="arrow-right" size={15} /></>}
            </Button>
          </form>
        </Card>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted-foreground)", marginTop: 16 }}>เฉพาะเจ้าหน้าที่ผู้ได้รับอนุญาตเท่านั้น</p>
      </div>
    </main>
  );
}
