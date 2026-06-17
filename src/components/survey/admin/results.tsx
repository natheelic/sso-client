"use client";

/** AdminResults — per-activity, per-question result summary (ported from AdminResults.jsx). */
import { useState } from "react";
import { RATING_LABELS, type Question } from "@/lib/survey-data";
import { Badge, Button, Card, Empty, PageHeader, Select } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { useAdminData } from "@/components/survey/admin/admin-data";
import { useToast } from "@/components/survey/toast";

export function ResultsScreen() {
  const { activities, counts } = useAdminData();
  const toast = useToast();
  const withResp = activities.filter((a) => (counts[a.id] || 0) > 0);
  const [sel, setSel] = useState(withResp[0]?.id || activities[0]?.id || "");
  const activity = activities.find((a) => a.id === sel);
  const n = counts[sel] || 0;

  const seedFor = (qid: string) => {
    let h = 0;
    const s = sel + qid;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  return (
    <div style={{ padding: "28px clamp(20px,4vw,36px)" }} className="fade-in">
      <PageHeader
        title="สรุปผลแบบสอบถาม"
        subtitle="ภาพรวมคำตอบรายข้อของแต่ละกิจกรรม"
        action={<Button variant="outline" onClick={() => toast("ส่งออกรายงานสรุป PDF แล้ว", "download")}><Icon name="download" size={15} />ส่งออกรายงาน</Button>}
      />

      <Card style={{ padding: 14, marginBottom: 20, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <Select value={sel} onChange={(e) => setSel(e.target.value)} style={{ minWidth: 280, flex: 1 }}>
          {activities.map((a) => <option key={a.id} value={a.id}>{a.title || "(ไม่มีชื่อ)"}</option>)}
        </Select>
        <Badge variant="secondary"><Icon name="users" size={13} />{n.toLocaleString()} ผู้ตอบ</Badge>
      </Card>

      {n === 0 || !activity ? (
        <Card><Empty icon="inbox" title="ยังไม่มีผู้ตอบแบบสอบถาม" hint="กิจกรรมนี้ยังไม่มีข้อมูลคำตอบสำหรับสรุปผล" /></Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activity.questions.map((q, qi) => (
            <ResultBlock key={q.id} q={q} index={qi} n={n} seed={seedFor(q.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultBlock({ q, index, n, seed }: { q: Question; index: number; n: number; seed: number }) {
  const rnd = (i: number) => { const x = Math.sin(seed * 9301 + i * 49297) * 233280; return x - Math.floor(x); };

  let body;
  if (q.type === "rating") {
    const weights = [0.04, 0.07, 0.18, 0.34, 0.37].map((w, i) => w * (0.8 + rnd(i) * 0.4));
    const sum = weights.reduce((a, b) => a + b, 0);
    const dist = weights.map((w) => w / sum);
    const cnt = dist.map((d) => Math.round(d * n));
    const avg = dist.reduce((a, d, i) => a + d * (i + 1), 0).toFixed(2);
    const maxD = Math.max(...dist);
    body = (
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 30, fontWeight: 700, color: "var(--primary)" }}>{avg}</span>
          <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>คะแนนเฉลี่ย (จาก 5)</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const d = dist[star - 1];
            return (
              <div key={star} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 78, fontSize: 12.5, color: "var(--muted-foreground)", flexShrink: 0 }}>{star} · {RATING_LABELS[star - 1]}</span>
                <div style={{ flex: 1, height: 18, background: "var(--secondary)", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (d / maxD) * 100 + "%", background: star >= 4 ? "var(--primary)" : "var(--border)", borderRadius: 5, transition: "width .4s" }} />
                </div>
                <span style={{ width: 64, textAlign: "right", fontSize: 12.5, fontWeight: 600, flexShrink: 0, fontFeatureSettings: "'tnum'" }}>{cnt[star - 1]} ({Math.round(d * 100)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    const opts = q.options ?? [];
    const weights = opts.map((_, i) => 0.3 + rnd(i) * 0.7);
    const sum = weights.reduce((a, b) => a + b, 0);
    const dist = weights.map((w) => w / sum);
    const cnt = dist.map((d) => Math.round(d * n * (q.type === "checkbox" ? 1.6 : 1)));
    const maxC = Math.max(1, ...cnt);
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {opts.map((opt, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 160, fontSize: 13, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
            <div style={{ flex: 1, height: 18, background: "var(--secondary)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: (cnt[i] / maxC) * 100 + "%", background: "var(--primary)", borderRadius: 5, transition: "width .4s" }} />
            </div>
            <span style={{ width: 56, textAlign: "right", fontSize: 12.5, fontWeight: 600, flexShrink: 0, fontFeatureSettings: "'tnum'" }}>{cnt[i].toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }

  const typeBadge: Record<string, [string, string]> = {
    rating: ["มาตรวัด 1–5", "star"], radio: ["เลือกตอบข้อเดียว", "circle-dot"], checkbox: ["เลือกได้หลายข้อ", "check-square"],
  };
  const tb = typeBadge[q.type];

  return (
    <Card style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--secondary)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, lineHeight: 1.5 }}>{q.title}</h3>
          <div style={{ marginTop: 5 }}><Badge variant="secondary"><Icon name={tb[1]} size={12} />{tb[0]}</Badge></div>
        </div>
      </div>
      {body}
    </Card>
  );
}
