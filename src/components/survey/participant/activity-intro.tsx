"use client";

/**
 * ActivityIntro — activity overview + start CTA (ported from UserFlow.jsx
 * ActivityIntro). Routes into the survey, or back to the cert if already done.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Activity } from "@/lib/survey-data";
import { getRecord } from "@/lib/survey-progress";
import { Badge, Button, Card } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { UserHeader, type ParticipantUser } from "@/components/survey/participant/participant-header";

export function ActivityIntro({ activity, user, fromQR }: { activity: Activity; user: ParticipantUser; fromQR?: boolean }) {
  const router = useRouter();
  const [done, setDone] = useState(false);
  useEffect(() => { setDone(!!getRecord(activity.id)); }, [activity.id]);

  const facts: [string, string, string][] = [
    ["calendar", "วันที่จัด", activity.dateLabel],
    ["clock", "ระยะเวลา", activity.hours + " ชั่วโมง"],
    ["map-pin", "สถานที่", activity.location],
    ["help-circle", "จำนวนคำถาม", activity.questions.length + " ข้อ"],
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <UserHeader user={user} />
      <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(20px,4vw,40px) clamp(16px,5vw,24px) 80px" }} className="fade-in">
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--muted-foreground)", fontSize: 13.5, marginBottom: 18, textDecoration: "none" }}>
          <Icon name="arrow-left" size={15} />กลับไปหน้ากิจกรรม
        </Link>

        {fromQR && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--success-bg)", color: "var(--success-fg)", borderRadius: 8, fontSize: 13, marginBottom: 18, fontWeight: 500 }}>
            <Icon name="qr-code" size={16} />เข้าสู่กิจกรรมผ่านการสแกน QR สำเร็จ
          </div>
        )}

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "30px 32px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <Badge variant="outline">{activity.type}</Badge>
              <span style={{ fontSize: 12.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{activity.code}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-serif-th)", fontSize: 26, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.4 }}>{activity.title}</h1>
            <p style={{ fontSize: 15, color: "var(--foreground)", margin: 0, lineHeight: 1.75 }}>{activity.description}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 1, background: "var(--border)" }}>
            {facts.map(([ic, l, v]) => (
              <div key={l} style={{ background: "var(--card)", padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--muted-foreground)", marginBottom: 5 }}><Icon name={ic} size={13} />{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "22px 32px", background: "var(--secondary)", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--card)", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon name="award" size={20} color="var(--cert-gold)" />
            </div>
            <div style={{ fontSize: 13.5, color: "var(--foreground)", lineHeight: 1.6 }}>
              เมื่อทำแบบสอบถามครบถ้วน ระบบจะออก<strong>เกียรติบัตรอิเล็กทรอนิกส์</strong>พร้อมลายเซ็นผู้อำนวยการ และเลขที่สำหรับตรวจสอบให้โดยอัตโนมัติ
            </div>
          </div>

          <div style={{ padding: "22px 32px", display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
            {done ? (
              <>
                <Button variant="outline" onClick={() => router.push(`/activities/${activity.id}/survey`)}><Icon name="rotate-ccw" size={15} />ทำแบบสอบถามอีกครั้ง</Button>
                <Button onClick={() => router.push(`/activities/${activity.id}/survey?cert=1`)}><Icon name="award" size={16} />ดูเกียรติบัตรของฉัน</Button>
              </>
            ) : (
              <Button size="lg" onClick={() => router.push(`/activities/${activity.id}/survey`)}>เริ่มทำแบบสอบถาม<Icon name="arrow-right" size={16} /></Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
