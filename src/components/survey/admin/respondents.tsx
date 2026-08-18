"use client";

/** AdminRespondents — searchable/filterable certificate holders + preview modal (ported from AdminRespondents.jsx). */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { COLLEGE, thaiLongDate, verifyUrlFor, type Activity, type Respondent } from "@/lib/survey-data";
import { getSignatureVariant } from "@/lib/survey-progress";
import { getInitial } from "@/lib/format";
import { Badge, Button, Card, Empty, Input, Modal, PageHeader, Select } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { CertificateFrame, type CertData } from "@/components/survey/certificate";
import { useAdminData } from "@/components/survey/admin/admin-data";
import { useToast } from "@/components/survey/toast";

const th: CSSProperties = { padding: "12px 16px", fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", whiteSpace: "nowrap" };
const td: CSSProperties = { padding: "11px 16px", verticalAlign: "middle" };
const PER = 12;

export function RespondentsScreen() {
  const { activities, respondents } = useAdminData();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [act, setAct] = useState("all");
  const [range, setRange] = useState("all");
  const [preview, setPreview] = useState<Respondent | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [q, act, range]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return respondents.filter((r) => {
      if (act !== "all" && r.activityId !== act) return false;
      if (term && !(r.name.toLowerCase().includes(term) || r.certNo.toLowerCase().includes(term))) return false;
      if (range !== "all") {
        const m = r.dateISO.slice(5, 7);
        if (range === "q1" && !["01", "02", "03"].includes(m)) return false;
        if (range === "q2" && !["04", "05", "06"].includes(m)) return false;
      }
      return true;
    });
  }, [q, act, range, respondents]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const slice = filtered.slice((page - 1) * PER, page * PER);

  return (
    <div style={{ padding: "28px clamp(20px,4vw,36px)" }} className="fade-in">
      <PageHeader
        title="ผู้รับเกียรติบัตร"
        subtitle={`ค้นหาและตรวจสอบผู้ที่ทำแบบสอบถามแล้ว ${respondents.length.toLocaleString()} คน`}
        action={<div style={{ display: "flex", gap: 10 }}>
          <Button variant="outline" onClick={() => toast("ส่งออกไฟล์ CSV แล้ว", "download")}><Icon name="file-spreadsheet" size={15} />CSV</Button>
          <Button variant="outline" onClick={() => toast("ส่งออกไฟล์ PDF แล้ว", "download")}><Icon name="file-text" size={15} />PDF</Button>
        </div>}
      />

      <Card style={{ padding: 14, marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Icon name="search" size={16} color="var(--muted-foreground)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อ–สกุล หรือเลขที่เกียรติบัตร…" style={{ paddingLeft: 36 }} />
        </div>
        <Select value={act} onChange={(e) => setAct(e.target.value)} style={{ minWidth: 200, flex: "0 0 auto" }}>
          <option value="all">ทุกกิจกรรม</option>
          {activities.map((a) => <option key={a.id} value={a.id}>{a.title || "(ไม่มีชื่อ)"}</option>)}
        </Select>
        <Select value={range} onChange={(e) => setRange(e.target.value)} style={{ minWidth: 150, flex: "0 0 auto" }}>
          <option value="all">ทุกช่วงเวลา</option>
          <option value="q1">ม.ค. – มี.ค.</option>
          <option value="q2">เม.ย. – มิ.ย.</option>
        </Select>
        {(q || act !== "all" || range !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setQ(""); setAct("all"); setRange("all"); }}><Icon name="x" size={14} />ล้าง</Button>
        )}
      </Card>

      <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 12 }}>พบ {filtered.length.toLocaleString()} รายการ</div>

      {filtered.length === 0 ? (
        <Card><Empty icon="search-x" title="ไม่พบรายการที่ค้นหา" hint="ลองปรับคำค้นหรือเปลี่ยนตัวกรองกิจกรรม/ช่วงเวลา" /></Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "var(--secondary)", textAlign: "left" }}>
                  <th style={th}>ชื่อ–สกุล</th>
                  <th style={th}>กิจกรรม</th>
                  <th style={th}>เลขที่เกียรติบัตร</th>
                  <th style={th}>วันที่ออก</th>
                  <th style={{ ...th, textAlign: "center" }}>คะแนน</th>
                  <th style={{ ...th, textAlign: "right" }} aria-label="การกระทำ"></th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => {
                  const a = activities.find((x) => x.id === r.activityId);
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }} className="resp-row">
                      <td style={td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--secondary)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{getInitial(r.name)}</div>
                          <span style={{ fontWeight: 600 }}>{r.name}</span>
                        </div>
                      </td>
                      <td style={{ ...td, maxWidth: 240 }}><span style={{ color: "var(--muted-foreground)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a?.title}</span></td>
                      <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{r.certNo}</td>
                      <td style={{ ...td, color: "var(--muted-foreground)" }}>{r.dateLabel}</td>
                      <td style={{ ...td, textAlign: "center" }}><Badge variant={parseFloat(r.avg) >= 4 ? "success" : "secondary"}>{r.avg}</Badge></td>
                      <td style={{ ...td, textAlign: "right" }}>
                        <Button variant="outline" size="sm" onClick={() => setPreview(r)}><Icon name="eye" size={14} />ดูเกียรติบัตร</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>หน้า {page} จาก {pages}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={page === 1 ? { opacity: 0.5 } : {}}><Icon name="chevron-left" size={15} />ก่อนหน้า</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} style={page === pages ? { opacity: 0.5 } : {}}>ถัดไป<Icon name="chevron-right" size={15} /></Button>
            </div>
          </div>
        </Card>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)} width={920} title="เกียรติบัตร">
        {preview && <CertModalBody record={preview} activity={activities.find((a) => a.id === preview.activityId)!} />}
      </Modal>

      <style>{`.resp-row:hover{ background: var(--secondary); }`}</style>
    </div>
  );
}

function CertModalBody({ record, activity }: { record: Respondent; activity: Activity }) {
  const toast = useToast();
  const data: CertData = {
    template: activity.certTemplate, recipientName: record.name, activityTitle: activity.title,
    activityType: activity.type, hours: activity.hours, dateLabel: activity.dateLabel,
    issueDateLong: thaiLongDate(record.dateISO), certNo: record.certNo, college: COLLEGE,
    signatureVariant: getSignatureVariant(), signatureName: COLLEGE.director, signatureTitle: COLLEGE.directorTitle,
    verifyUrl: verifyUrlFor(record.certNo),
  };
  return (
    <div style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18, overflowX: "auto" }}>
        <CertificateFrame width={840} data={data} />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Button onClick={() => toast("เริ่มดาวน์โหลด PDF แล้ว", "download")}><Icon name="download" size={15} />ดาวน์โหลด PDF</Button>
        <Button variant="outline" onClick={() => toast("ส่งอีเมลให้ผู้รับแล้ว", "mail")}><Icon name="mail" size={15} />ส่งอีเมลซ้ำ</Button>
      </div>
    </div>
  );
}
