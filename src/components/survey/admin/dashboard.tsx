"use client";

/** AdminDashboard — overview metrics + charts + recent (ported from AdminDashboard.jsx). */
import { useRouter } from "next/navigation";
import { getInitial } from "@/lib/format";
import { Button, Card, PageHeader, Stat } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { useAdminData } from "@/components/survey/admin/admin-data";

export function DashboardScreen() {
  const router = useRouter();
  const { activities, respondents, counts } = useAdminData();

  const totalCerts = respondents.length;
  const openCount = activities.filter((a) => a.status === "เปิดรับ").length;
  const avgSat = (respondents.reduce((s, r) => s + parseFloat(r.avg), 0) / (respondents.length || 1)).toFixed(2);

  const perAct = activities.map((a) => ({ a, n: counts[a.id] || 0 })).sort((x, y) => y.n - x.n);
  const maxN = Math.max(1, ...perAct.map((p) => p.n));

  const buckets = [0, 0, 0, 0, 0];
  respondents.forEach((r) => { const b = Math.min(4, Math.max(0, Math.round(parseFloat(r.avg)) - 1)); buckets[b]++; });
  const maxB = Math.max(1, ...buckets);

  const targetTotal = activities.reduce((s, a) => s + a.target, 0);
  const responseRate = targetTotal > 0 ? Math.round((totalCerts / targetTotal) * 100) : 0;

  const recent = respondents.slice(0, 6);

  return (
    <div style={{ padding: "28px clamp(20px,4vw,36px)" }} className="fade-in">
      <PageHeader title="ภาพรวม" subtitle="สรุปการออกเกียรติบัตรและผลแบบสอบถามทั้งระบบ" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 16, marginBottom: 24 }}>
        <Stat label="เกียรติบัตรที่ออกแล้ว" value={totalCerts.toLocaleString()} sub="ฉบับ" icon="award" />
        <Stat label="กิจกรรมทั้งหมด" value={activities.length} sub={`เปิดรับ ${openCount}`} icon="clipboard-list" accent="var(--success-fg)" />
        <Stat label="ความพึงพอใจเฉลี่ย" value={avgSat} sub="จาก 5.00" icon="smile" accent="var(--success-fg)" />
        <Stat label="อัตราการตอบกลับ" value={`${responseRate}%`} sub="ของเป้าหมาย" icon="trending-up" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }} className="dash-grid">
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>เกียรติบัตรแยกตามกิจกรรม</h3>
              <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--muted-foreground)" }}>จำนวนผู้รับเกียรติบัตรในแต่ละกิจกรรม</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/activities")}>ดูทั้งหมด<Icon name="arrow-right" size={14} /></Button>
          </div>
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            {perAct.map(({ a, n }) => (
              <div key={a.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, gap: 12 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title || "(ไม่มีชื่อ)"}</span>
                  <span style={{ fontWeight: 700, fontFeatureSettings: "'tnum'", flexShrink: 0 }}>{n.toLocaleString()}</span>
                </div>
                <div style={{ height: 8, background: "var(--secondary)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (n / maxN) * 100 + "%", background: "var(--primary)", borderRadius: 999, transition: "width .4s" }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 0 }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>การกระจายความพึงพอใจ</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--muted-foreground)" }}>ระดับคะแนนเฉลี่ยของผู้ตอบ</p>
          </div>
          <div style={{ padding: "20px 22px", display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
            {buckets.map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)" }}>{b}</span>
                <div style={{ width: "100%", height: (b / maxB) * 130 + "px", background: i >= 3 ? "var(--primary)" : "var(--border)", borderRadius: "6px 6px 0 0", transition: "height .4s" }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>เกียรติบัตรล่าสุด</h3>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/respondents")}>ดูรายชื่อทั้งหมด<Icon name="arrow-right" size={14} /></Button>
        </div>
        <div>
          {recent.map((r, i) => {
            const act = activities.find((a) => a.id === r.activityId);
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px", borderBottom: i < recent.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--secondary)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{getInitial(r.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{act?.title}</div>
                </div>
                <span className="hide-sm" style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)", flexShrink: 0 }}>{r.certNo}</span>
                <span className="hide-sm" style={{ fontSize: 12.5, color: "var(--muted-foreground)", flexShrink: 0, width: 96, textAlign: "right" }}>{r.dateLabel}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <style>{`@media (max-width: 860px){ .dash-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
