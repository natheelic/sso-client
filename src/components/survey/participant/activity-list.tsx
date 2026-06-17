"use client";

/**
 * ActivityList — participant home: open activities to survey (ported from
 * UserFlow.jsx ActivityList). Completion state comes from the client progress
 * store; clicking a card routes to the activity intro.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITIES } from "@/lib/survey-data";
import { getRecords } from "@/lib/survey-progress";
import { Badge, Card } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { UserHeader, type ParticipantUser } from "@/components/survey/participant/participant-header";

function iconForType(type: string) {
  if (type.includes("ระยะสั้น")) return "wrench";
  if (type.includes("อบรม")) return "graduation-cap";
  if (type.includes("สัมมนา")) return "presentation";
  return "sparkles";
}

export function ActivityList({ user }: { user: ParticipantUser }) {
  const router = useRouter();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const recs = getRecords();
    const map: Record<string, boolean> = {};
    Object.keys(recs).forEach((id) => { map[id] = true; });
    setCompleted(map);
  }, []);

  const open = ACTIVITIES.filter((a) => a.status === "เปิดรับ");
  const firstName = (user.name || user.email || "ผู้เข้าร่วม").split("@")[0].split(" ")[0];

  return (
    <div style={{ minHeight: "100vh" }}>
      <UserHeader user={user} />
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(24px,5vw,48px) clamp(16px,5vw,24px) 80px" }} className="fade-in">
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13.5, color: "var(--muted-foreground)" }}>สวัสดี {firstName}</div>
          <h1 style={{ fontFamily: "var(--font-serif-th)", fontSize: "clamp(26px,4vw,34px)", fontWeight: 700, margin: "4px 0 8px" }}>กิจกรรมที่เปิดรับแบบสอบถาม</h1>
          <p style={{ fontSize: 15, color: "var(--muted-foreground)", margin: 0, maxWidth: 560 }}>
            เลือกกิจกรรมที่ท่านเข้าร่วม ทำแบบสอบถามให้ครบถ้วน แล้วรับเกียรติบัตรอิเล็กทรอนิกส์ได้ทันที
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {open.map((a) => {
            const done = completed[a.id];
            return (
              <Card key={a.id} hover style={{ padding: 0, cursor: "pointer", overflow: "hidden" }} onClick={() => router.push(`/activities/${a.id}`)}>
                <div style={{ display: "flex", gap: 18, padding: 22, alignItems: "flex-start" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--secondary)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name={iconForType(a.type)} size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <Badge variant="outline">{a.type}</Badge>
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{a.code}</span>
                      {done && <Badge variant="success"><Icon name="check" size={12} />ทำแล้ว</Badge>}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.4 }}>{a.title}</h3>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--muted-foreground)" }}>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="calendar" size={13} />{a.dateLabel}</span>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="clock" size={13} />{a.hours} ชั่วโมง</span>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center", minWidth: 0 }}><Icon name="map-pin" size={13} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.location}</span></span>
                    </div>
                  </div>
                  <Icon name="chevron-right" size={20} color="var(--muted-foreground)" style={{ alignSelf: "center", flexShrink: 0 }} />
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
