"use client";

/** AdminTemplates — certificate background/template manager + signature & logo upload (ported from AdminTemplates.jsx). */
import { useEffect, useRef, useState } from "react";
import { CERT_TEMPLATES, COLLEGE, thaiLongDate, type TemplateId } from "@/lib/survey-data";
import { getSignatureVariant, setSignatureVariant } from "@/lib/survey-progress";
import { Button, Card, Field, PageHeader, Select } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { Emblem } from "@/components/survey/emblem";
import { CertificateFrame, SignatureMark, type CertData } from "@/components/survey/certificate";
import { useAdminData } from "@/components/survey/admin/admin-data";
import { useToast } from "@/components/survey/toast";

function PreviewFit({ data }: { data: CertData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const fit = () => { if (ref.current) setW(Math.min(820, ref.current.clientWidth)); };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return <div ref={ref} style={{ width: "100%" }}><CertificateFrame width={w} data={data} /></div>;
}

export function TemplatesScreen() {
  const { activities, assignTemplate } = useAdminData();
  const toast = useToast();
  const [selActivity, setSelActivity] = useState(activities[0]?.id ?? "");
  const activity = activities.find((a) => a.id === selActivity) ?? activities[0];
  const [tmpl, setTmpl] = useState<TemplateId>(activity?.certTemplate ?? "classic");
  const [sigVariant, setSigVariant] = useState(0);

  useEffect(() => { setSigVariant(getSignatureVariant()); }, []);
  useEffect(() => {
    const a = activities.find((x) => x.id === selActivity);
    if (a) setTmpl(a.certTemplate);
  }, [selActivity, activities]);

  if (!activity) return null;

  const sampleRecord: CertData = {
    template: tmpl, recipientName: "นางสาวสุชาดา  มากมี", activityTitle: activity.title || "กิจกรรมตัวอย่าง",
    activityType: activity.type, hours: activity.hours, dateLabel: activity.dateLabel || "—",
    issueDateLong: thaiLongDate(activity.issueDate), certNo: "LICEC " + activity.code.slice(-3) + "/0001",
    college: COLLEGE, signatureVariant: sigVariant, signatureName: COLLEGE.director, signatureTitle: COLLEGE.directorTitle,
    verifyUrl: "verify.licec.ac.th/c/sample",
  };

  const apply = () => {
    assignTemplate(selActivity, tmpl);
    setSignatureVariant(sigVariant);
    toast("บันทึกเทมเพลตเกียรติบัตรแล้ว");
  };

  return (
    <div style={{ padding: "28px clamp(20px,4vw,36px)" }} className="fade-in">
      <PageHeader title="เทมเพลตเกียรติบัตร" subtitle="เปลี่ยนพื้นหลัง ตราวิทยาลัย และลายเซ็นผู้อำนวยการของแต่ละกิจกรรม" />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: 24, alignItems: "start" }} className="tmpl-grid">
        <div>
          <Card style={{ padding: 22, background: "var(--secondary)", display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "100%", overflow: "hidden" }}>
              <PreviewFit data={sampleRecord} />
            </div>
          </Card>
          <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", marginTop: 10, textAlign: "center" }}>ตัวอย่างเกียรติบัตรของ “{activity.title || "กิจกรรมตัวอย่าง"}”</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 18 }}>
            <Field label="เลือกกิจกรรม">
              <Select value={selActivity} onChange={(e) => setSelActivity(e.target.value)}>
                {activities.map((a) => <option key={a.id} value={a.id}>{a.title || "(ไม่มีชื่อ)"}</option>)}
              </Select>
            </Field>
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>พื้นหลัง / เทมเพลต</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CERT_TEMPLATES.map((t) => {
                const active = t.id === tmpl;
                return (
                  <button key={t.id} onClick={() => setTmpl(t.id)} style={{
                    textAlign: "left", padding: 10, borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                    border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
                    background: active ? "var(--secondary)" : "var(--card)", transition: "all .15s",
                  }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                      {t.swatch.map((c, i) => <span key={i} style={{ width: 18, height: 18, borderRadius: 5, background: c, border: "1px solid rgba(0,0,0,0.1)" }} />)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      {active && <Icon name="check" size={13} color="var(--primary)" />}{t.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginTop: 2 }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>ลายเซ็นผู้อำนวยการ</div>
            <div style={{ padding: "14px 16px", border: "1px dashed var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--card)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SignatureMark color="var(--cert-navy)" width={96} variant={sigVariant} />
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600, color: "var(--foreground)" }}>{COLLEGE.director}</div>
                  ลายเซ็นปัจจุบัน
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[0, 1].map((v) => (
                <button key={v} onClick={() => setSigVariant(v)} style={{
                  flex: 1, padding: 8, borderRadius: 8, cursor: "pointer", background: sigVariant === v ? "var(--secondary)" : "var(--card)",
                  border: `1.5px solid ${sigVariant === v ? "var(--primary)" : "var(--border)"}`, display: "grid", placeItems: "center",
                }}>
                  <SignatureMark color="var(--cert-navy)" width={80} variant={v} />
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => toast("เลือกไฟล์ลายเซ็น (PNG พื้นโปร่ง)", "upload")}><Icon name="upload" size={14} />อัปโหลดลายเซ็น (PNG)</Button>
            <div style={{ height: 1, background: "var(--border)" }} />
            <div style={{ fontSize: 13, fontWeight: 600 }}>ตราวิทยาลัย / โลโก้</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid var(--border)", display: "grid", placeItems: "center", background: "var(--card)" }}>
                <Emblem size={30} />
              </div>
              <Button variant="outline" size="sm" onClick={() => toast("เลือกไฟล์โลโก้", "upload")} style={{ flex: 1 }}><Icon name="upload" size={14} />อัปโหลดโลโก้</Button>
            </div>
          </Card>

          <Button size="lg" onClick={apply}><Icon name="check" size={16} />บันทึกเทมเพลตให้กิจกรรมนี้</Button>
        </div>
      </div>

      <style>{`@media (max-width: 920px){ .tmpl-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
