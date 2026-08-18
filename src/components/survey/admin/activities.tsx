"use client";

/** AdminActivities — activity cards with progress + quick actions (ported from AdminActivities.jsx). */
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageHeader, StatusPill } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { useAdminData } from "@/components/survey/admin/admin-data";

function cellBtn(border: boolean): CSSProperties {
  return {
    flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: 12, background: "transparent", border: "none", borderRight: border ? "1px solid var(--border)" : "none",
    cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "var(--foreground)", transition: "background .15s",
  };
}

export function ActivitiesScreen() {
  const router = useRouter();
  const { activities, counts, createActivity } = useAdminData();

  const onCreate = async () => router.push(`/admin/activities/${await createActivity()}`);

  return (
    <div style={{ padding: "28px clamp(20px,4vw,36px)" }} className="fade-in">
      <PageHeader
        title="กิจกรรม"
        subtitle={`จัดการกิจกรรมและชุดคำถามทั้งหมด ${activities.length} กิจกรรม`}
        action={<Button onClick={onCreate}><Icon name="plus" size={16} />สร้างกิจกรรม</Button>}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
        {activities.map((a) => {
          const done = counts[a.id] || 0;
          const pct = Math.min(100, Math.round((done / a.target) * 100));
          return (
            <Card key={a.id} hover style={{ padding: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "18px 20px 14px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                  <StatusPill status={a.status} />
                  <span style={{ fontSize: 11.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{a.code}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.45, minHeight: 46 }}>{a.title || "(กิจกรรมใหม่ — ยังไม่มีชื่อ)"}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5, color: "var(--muted-foreground)" }}>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="calendar" size={13} />{a.dateLabel || "—"}</span>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="help-circle" size={13} />{a.questions.length} คำถาม · {a.hours} ชั่วโมง</span>
                </div>
              </div>
              <div style={{ padding: "0 20px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--muted-foreground)" }}>ผู้ตอบแล้ว</span>
                  <span style={{ fontWeight: 600, fontFeatureSettings: "'tnum'" }}>{done.toLocaleString()} / {a.target}</span>
                </div>
                <div style={{ height: 5, background: "var(--secondary)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", background: a.status === "ร่าง" ? "var(--warning-fg)" : "var(--primary)", borderRadius: 999 }} />
                </div>
              </div>
              <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
                <button onClick={() => router.push(`/admin/activities/${a.id}?tab=questions`)} style={cellBtn(true)}><Icon name="list-checks" size={15} />คำถาม</button>
                <button onClick={() => router.push(`/admin/activities/${a.id}`)} style={cellBtn(false)}><Icon name="pencil" size={14} />แก้ไข</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
