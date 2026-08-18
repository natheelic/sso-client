"use client";

/**
 * SurveyFlow — the participant survey state machine (ported from
 * UserSurvey.jsx + main.jsx UserApp): question runner → name confirm →
 * generating animation → certificate delivery.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  COLLEGE, RATING_LABELS, VERIFY_HOST, thaiLongDate, type Activity, type Question,
} from "@/lib/survey-data";
import { getSignatureVariant } from "@/lib/survey-progress";
import { submitSurvey, type CertRecord } from "@/lib/submissions-db";
import { Badge, Button, Card, Field, Input, Progress, Select } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { CertificateFrame, type CertData } from "@/components/survey/certificate";
import { UserHeader, type ParticipantUser } from "@/components/survey/participant/participant-header";
import { useToast } from "@/components/survey/toast";

type AnswerMap = Record<string, number | string | string[] | undefined>;
type Phase = "survey" | "generating" | "cert";

// ---- question renderers ----
function RatingQ({ value, onChange }: { value?: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      <div style={{ display: "flex", gap: "clamp(8px,2vw,16px)", justifyContent: "center", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              width: 64, height: 64, borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
              border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
              background: active ? "var(--primary)" : "var(--card)",
              color: active ? "var(--primary-foreground)" : "var(--foreground)",
              fontSize: 24, fontWeight: 700, transition: "all .15s",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--ring)"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--border)"; }}>
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 380, fontSize: 12.5, color: "var(--muted-foreground)" }}>
        <span>{RATING_LABELS[0]}</span><span>{RATING_LABELS[4]}</span>
      </div>
      <div style={{ height: 22, fontSize: 14, fontWeight: 600, color: value ? "var(--primary)" : "transparent" }}>
        {value ? RATING_LABELS[value - 1] : "·"}
      </div>
    </div>
  );
}

function ChoiceQ({ options, value, multi, onChange }: { options: string[]; value?: string | string[]; multi?: boolean; onChange: (v: string | string[]) => void }) {
  const sel = multi ? ((value as string[]) || []) : value;
  const toggle = (opt: string) => {
    if (multi) {
      const s = new Set((value as string[]) || []);
      if (s.has(opt)) s.delete(opt); else s.add(opt);
      onChange([...s]);
    } else onChange(opt);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 520, margin: "0 auto", width: "100%" }}>
      {options.map((opt) => {
        const active = multi ? (sel as string[]).includes(opt) : sel === opt;
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            display: "flex", alignItems: "center", gap: 12, textAlign: "left", width: "100%",
            padding: "14px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 15,
            border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
            background: active ? "var(--secondary)" : "var(--card)", color: "var(--foreground)", transition: "all .15s",
          }}
          onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--ring)"; }}
          onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = "var(--border)"; }}>
            <span style={{
              width: 22, height: 22, flexShrink: 0, borderRadius: multi ? 6 : 999,
              border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
              background: active ? "var(--primary)" : "transparent",
              display: "grid", placeItems: "center", color: "var(--primary-foreground)",
            }}>{active && <Icon name="check" size={14} />}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ---- survey runner (questions + confirm) ----
function SurveyRunner({ activity, user, onExit, onFinish }: { activity: Activity; user: ParticipantUser; onExit: () => void; onFinish: (name: string, answers: AnswerMap) => void }) {
  const total = activity.questions.length;
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"q" | "confirm">("q");
  const [answers, setAnswers] = useState<AnswerMap>({});

  const q: Question | undefined = activity.questions[step];
  const ans = q ? answers[q.id] : undefined;
  const answered = !!q && (q.type === "checkbox" ? true : ans !== undefined && ans !== null);
  const set = (v: number | string | string[]) => { if (q) setAnswers((a) => ({ ...a, [q.id]: v })); };
  const progressPct = phase === "confirm" ? 100 : (step / total) * 100;

  const next = () => {
    if (!q) return;
    if (q.required && !answered && q.type !== "checkbox") return;
    if (step < total - 1) setStep(step + 1); else setPhase("confirm");
  };
  const prev = () => {
    if (phase === "confirm") { setPhase("q"); return; }
    if (step > 0) setStep(step - 1); else onExit();
  };

  const typeLabel: Record<string, string> = { rating: "ให้คะแนนความพึงพอใจ", radio: "เลือกหนึ่งคำตอบ", checkbox: "เลือกได้มากกว่าหนึ่งคำตอบ" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px clamp(16px,5vw,24px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activity.title}</div>
            <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", flexShrink: 0, fontFeatureSettings: "'tnum'" }}>
              {phase === "confirm" ? "ยืนยันข้อมูล" : `ข้อ ${step + 1} / ${total}`}
            </div>
          </div>
          <Progress value={progressPct} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 720, width: "100%", margin: "0 auto", padding: "clamp(28px,5vw,56px) clamp(16px,5vw,24px)" }}>
        {phase === "q" && q ? (
          <div key={step} className="fade-in" style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Badge variant="secondary">{typeLabel[q.type]}</Badge>
              {q.required && <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>· จำเป็นต้องตอบ</span>}
            </div>
            <h2 style={{ fontFamily: "var(--font-serif-th)", fontSize: "clamp(21px,3.2vw,27px)", fontWeight: 700, margin: "0 0 36px", lineHeight: 1.5 }}>{q.title}</h2>
            {q.type === "rating" && <RatingQ value={ans as number | undefined} onChange={set} />}
            {q.type === "radio" && q.options && <ChoiceQ options={q.options} value={ans as string | undefined} onChange={set} />}
            {q.type === "checkbox" && q.options && <ChoiceQ options={q.options} value={ans as string[] | undefined} multi onChange={set} />}
          </div>
        ) : (
          <ConfirmStep user={user} onFinish={(name) => onFinish(name, answers)} />
        )}

        {phase === "q" && q && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40, gap: 12 }}>
            <Button variant="ghost" onClick={prev}><Icon name="arrow-left" size={15} />{step === 0 ? "ออก" : "ก่อนหน้า"}</Button>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {!q.required && q.type !== "checkbox" && (
                <button onClick={next} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: 13.5, fontFamily: "inherit" }}>ข้ามข้อนี้</button>
              )}
              <Button onClick={next} disabled={q.required && !answered && q.type !== "checkbox"} style={(q.required && !answered && q.type !== "checkbox") ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
                ถัดไป<Icon name="arrow-right" size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmStep({ user, onFinish }: { user: ParticipantUser; onFinish: (name: string) => void }) {
  const [prefix, setPrefix] = useState("");
  const [name, setName] = useState((user.name || "").trim());
  return (
    <div className="fade-in" style={{ flex: 1, maxWidth: 480, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--success-bg)", color: "var(--success-fg)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
          <Icon name="check" size={26} />
        </div>
        <h2 style={{ fontFamily: "var(--font-serif-th)", fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>ทำแบบสอบถามครบแล้ว</h2>
        <p style={{ fontSize: 14.5, color: "var(--muted-foreground)", margin: 0 }}>ตรวจสอบชื่อ–สกุลที่จะปรากฏบนเกียรติบัตรให้ถูกต้อง</p>
      </div>
      <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 12 }}>
          <Field label="คำนำหน้า">
            <Select value={prefix} onChange={(e) => setPrefix(e.target.value)}>
              <option value="">ไม่ระบุ</option>
              {["นาย", "นาง", "นางสาว", "ดร.", "ผศ.", "อื่น ๆ"].map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="ชื่อ–สกุล">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="กรอกชื่อ–สกุลของท่าน" autoFocus />
          </Field>
        </div>
        <div style={{ background: "var(--secondary)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "var(--muted-foreground)", display: "flex", gap: 8 }}>
          <Icon name="info" size={15} style={{ flexShrink: 0, marginTop: 2 }} />
          ชื่อที่จะปรากฏ: <strong style={{ color: "var(--foreground)" }}>{prefix}{name || "—"}</strong>
        </div>
        <Button size="lg" onClick={() => onFinish((prefix + name).trim())} disabled={!name.trim()} style={{ width: "100%", ...(!name.trim() ? { opacity: 0.5, cursor: "not-allowed" } : {}) }}>
          <Icon name="award" size={17} />ออกเกียรติบัตร
        </Button>
      </Card>
    </div>
  );
}

function Generating() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div className="fade-in" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{ position: "relative", width: 96, height: 96 }}>
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ position: "absolute", inset: 0, animation: "spin 1.1s linear infinite" }}>
            <circle cx="48" cy="48" r="42" fill="none" stroke="var(--border)" strokeWidth="4" />
            <circle cx="48" cy="48" r="42" fill="none" stroke="var(--cert-gold)" strokeWidth="4" strokeLinecap="round" strokeDasharray="80 184" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <Icon name="award" size={36} color="var(--cert-gold)" />
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-serif-th)", fontSize: 22, fontWeight: 700 }}>กำลังออกเกียรติบัตร…</div>
          <div style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6 }}>ลงลายเซ็นผู้อำนวยการและออกเลขที่เกียรติบัตร</div>
        </div>
      </div>
    </main>
  );
}

function buildCertData(record: CertRecord, activity: Activity): CertData {
  return {
    template: activity.certTemplate,
    recipientName: record.name,
    activityTitle: activity.title,
    activityType: activity.type,
    hours: activity.hours,
    dateLabel: activity.dateLabel,
    issueDateLong: thaiLongDate(record.issueISO),
    certNo: record.certNo,
    college: COLLEGE,
    signatureVariant: record.signatureVariant,
    signatureName: COLLEGE.director,
    signatureTitle: COLLEGE.directorTitle,
    verifyUrl: VERIFY_HOST + "/c/" + encodeURIComponent(record.certNo).slice(0, 14),
  };
}

function CertificateDelivery({ record, activity, user }: { record: CertRecord; activity: Activity; user: ParticipantUser }) {
  const router = useRouter();
  const toast = useToast();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(880);

  useEffect(() => {
    const fit = () => { if (wrapRef.current) setW(Math.min(960, wrapRef.current.clientWidth)); };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div style={{ minHeight: "100vh" }}>
      <UserHeader user={user} />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(16px,5vw,24px) 90px" }} className="fade-in">
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <Badge variant="success" style={{ marginBottom: 12 }}><Icon name="party-popper" size={13} />ออกเกียรติบัตรสำเร็จ</Badge>
          <h1 style={{ fontFamily: "var(--font-serif-th)", fontSize: "clamp(26px,4vw,34px)", fontWeight: 700, margin: "0 0 8px" }}>ขอแสดงความยินดี</h1>
          <p style={{ fontSize: 15, color: "var(--muted-foreground)", margin: 0 }}>
            เลขที่เกียรติบัตร <strong style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>{record.certNo}</strong>
          </p>
        </div>

        <div ref={wrapRef} style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <CertificateFrame width={w} data={buildCertData(record, activity)} />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Button size="lg" onClick={() => toast("เริ่มดาวน์โหลดไฟล์ PDF แล้ว", "download")}><Icon name="download" size={16} />ดาวน์โหลด PDF</Button>
          <Button size="lg" variant="outline" onClick={() => toast("บันทึกรูปภาพ PNG แล้ว", "image")}><Icon name="image" size={16} />บันทึกรูปภาพ</Button>
          <Button size="lg" variant="outline" onClick={() => toast("คัดลอกลิงก์ตรวจสอบแล้ว", "share-2")}><Icon name="share-2" size={16} />แชร์</Button>
          <Button size="lg" variant="ghost" onClick={() => router.push("/")}><Icon name="shield-check" size={16} />กลับหน้าหลัก</Button>
        </div>
      </main>
    </div>
  );
}

export function SurveyFlow({
  activity, user, startAtCert, initialRecord,
}: { activity: Activity; user: ParticipantUser; startAtCert?: boolean; initialRecord: CertRecord | null }) {
  const router = useRouter();
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>(startAtCert && initialRecord ? "cert" : "survey");
  const [record, setRecord] = useState<CertRecord | null>(initialRecord);

  const finish = async (name: string, answers: AnswerMap) => {
    setPhase("generating");
    try {
      const rec = await submitSurvey(activity.id, name, answers, getSignatureVariant());
      setRecord(rec);
      setPhase("cert");
    } catch {
      toast("ออกเกียรติบัตรไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      // Answers are lost on failure — SurveyRunner remounts fresh. Acceptable
      // for now since this should only happen on a genuine network/DB error.
      setPhase("survey");
    }
  };

  if (phase === "generating") return <Generating />;
  if (phase === "cert" && record) return <CertificateDelivery record={record} activity={activity} user={user} />;
  return <SurveyRunner activity={activity} user={user} onExit={() => router.push(`/activities/${activity.id}`)} onFinish={finish} />;
}
