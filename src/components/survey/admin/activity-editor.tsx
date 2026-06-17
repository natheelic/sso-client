"use client";

/** ActivityEditor — detail form + per-activity question builder (ported from AdminActivities.jsx). */
import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { Activity, Question, QuestionType } from "@/lib/survey-data";
import { Badge, Button, Card, Empty, Field, Input, PageHeader, Select, Textarea } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { useAdminData } from "@/components/survey/admin/admin-data";
import { useToast } from "@/components/survey/toast";

const TYPE_OPTIONS = ["โครงการอบรม", "หลักสูตรระยะสั้น", "สัมมนาวิชาการ", "กิจกรรมวิชาการ", "ประชุมเชิงปฏิบัติการ"];
const STATUS_OPTIONS = ["เปิดรับ", "ปิดแล้ว", "ร่าง"];
const QTYPES: [QuestionType, string, string][] = [
  ["rating", "มาตรวัด 1–5", "star"],
  ["radio", "เลือกตอบข้อเดียว", "circle-dot"],
  ["checkbox", "เลือกได้หลายข้อ", "check-square"],
];

function iconCtl(disabled?: boolean, danger?: boolean): CSSProperties {
  return {
    width: 30, height: 30, borderRadius: 6, display: "grid", placeItems: "center",
    background: "transparent", border: "1px solid var(--border)", cursor: disabled ? "not-allowed" : "pointer",
    color: danger ? "var(--destructive)" : "var(--muted-foreground)", opacity: disabled ? 0.4 : 1, flexShrink: 0,
  };
}

export function ActivityEditorScreen({ id, initialTab = "detail" }: { id: string; initialTab?: string }) {
  const router = useRouter();
  const { activities, saveActivity } = useAdminData();
  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    return (
      <div style={{ padding: "28px clamp(20px,4vw,36px)" }} className="fade-in">
        <Card><Empty icon="search-x" title="ไม่พบกิจกรรม" hint="กิจกรรมนี้อาจถูกสร้างไว้ในเซสชันก่อนหน้า ลองกลับไปสร้างใหม่อีกครั้ง" action={<Button variant="outline" onClick={() => router.push("/admin/activities")}><Icon name="arrow-left" size={15} />กลับไปหน้ากิจกรรม</Button>} /></Card>
      </div>
    );
  }

  return <Editor key={activity.id} activity={activity} initialTab={initialTab} onSave={saveActivity} onBack={() => router.push("/admin/activities")} />;
}

function Editor({ activity, initialTab, onSave, onBack }: { activity: Activity; initialTab: string; onSave: (a: Activity) => void; onBack: () => void }) {
  const toast = useToast();
  const [tab, setTab] = useState(initialTab === "questions" ? "questions" : "detail");
  const [form, setForm] = useState<Activity>({ ...activity, questions: activity.questions.map((q) => ({ ...q })) });
  const upd = <K extends keyof Activity>(k: K, v: Activity[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => { onSave(form); toast("บันทึกการเปลี่ยนแปลงแล้ว"); onBack(); };

  return (
    <div style={{ padding: "24px clamp(20px,4vw,36px)" }} className="fade-in">
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: 13.5, fontFamily: "inherit", marginBottom: 14, padding: 0 }}>
        <Icon name="arrow-left" size={15} />กลับไปหน้ากิจกรรม
      </button>
      <PageHeader
        title={activity.__new ? "สร้างกิจกรรมใหม่" : "แก้ไขกิจกรรม"}
        subtitle={form.code}
        action={<div style={{ display: "flex", gap: 10 }}>
          <Button variant="outline" onClick={onBack}>ยกเลิก</Button>
          <Button onClick={save}><Icon name="check" size={16} />บันทึก</Button>
        </div>}
      />

      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {([["detail", "รายละเอียดกิจกรรม", "info"], ["questions", `ชุดคำถาม (${form.questions.length})`, "list-checks"]] as const).map(([tid, label, ic]) => (
          <button key={tid} onClick={() => setTab(tid)} style={{
            display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", background: "transparent",
            border: "none", borderBottom: `2px solid ${tab === tid ? "var(--primary)" : "transparent"}`,
            color: tab === tid ? "var(--foreground)" : "var(--muted-foreground)", cursor: "pointer", fontFamily: "inherit",
            fontSize: 14, fontWeight: 600, marginBottom: -1,
          }}><Icon name={ic} size={15} />{label}</button>
        ))}
      </div>

      {tab === "detail"
        ? <DetailForm form={form} upd={upd} />
        : <QuestionBuilder questions={form.questions} setQuestions={(q) => upd("questions", q)} />}
    </div>
  );
}

function DetailForm({ form, upd }: { form: Activity; upd: <K extends keyof Activity>(k: K, v: Activity[K]) => void }) {
  return (
    <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 18 }}>
      <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="ชื่อกิจกรรม / หลักสูตร" required>
          <Input value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="เช่น อบรมเชิงปฏิบัติการ…" />
        </Field>
        <Field label="คำอธิบาย">
          <Textarea value={form.description} onChange={(e) => upd("description", e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="ประเภท">
            <Select value={form.type} onChange={(e) => upd("type", e.target.value)}>{TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}</Select>
          </Field>
          <Field label="สถานะ">
            <Select value={form.status} onChange={(e) => upd("status", e.target.value as Activity["status"])}>{STATUS_OPTIONS.map((t) => <option key={t}>{t}</option>)}</Select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Field label="วันที่จัด"><Input value={form.dateLabel} onChange={(e) => upd("dateLabel", e.target.value)} /></Field>
          <Field label="จำนวนชั่วโมง"><Input type="number" value={form.hours} onChange={(e) => upd("hours", +e.target.value)} /></Field>
          <Field label="เป้าหมายผู้เข้าร่วม"><Input type="number" value={form.target} onChange={(e) => upd("target", +e.target.value)} /></Field>
        </div>
        <Field label="สถานที่"><Input value={form.location} onChange={(e) => upd("location", e.target.value)} /></Field>
      </Card>
    </div>
  );
}

function QuestionBuilder({ questions, setQuestions }: { questions: Question[]; setQuestions: (q: Question[]) => void }) {
  const add = (type: QuestionType) => {
    const base: Question = { id: "q" + Date.now(), type, title: "", required: true };
    if (type !== "rating") base.options = ["ตัวเลือก 1", "ตัวเลือก 2"];
    setQuestions([...questions, base]);
  };
  const update = (id: string, patch: Partial<Question>) => setQuestions(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const remove = (id: string) => setQuestions(questions.filter((q) => q.id !== id));
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const next = [...questions];
    [next[i], next[j]] = [next[j], next[i]];
    setQuestions(next);
  };

  return (
    <div style={{ maxWidth: 760, display: "flex", flexDirection: "column", gap: 14 }}>
      {questions.length === 0 && (
        <Card><Empty icon="list-plus" title="ยังไม่มีคำถาม" hint="เพิ่มคำถามข้อแรกเพื่อเริ่มสร้างแบบสอบถามของกิจกรรมนี้" /></Card>
      )}
      {questions.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i} total={questions.length} onUpdate={(p) => update(q.id, p)} onRemove={() => remove(q.id)} onMove={(d) => move(i, d)} />
      ))}

      <Card style={{ padding: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted-foreground)", marginRight: 4 }}>เพิ่มคำถาม:</span>
        {QTYPES.map(([t, label, ic]) => (
          <Button key={t} variant="outline" size="sm" onClick={() => add(t)}><Icon name={ic} size={14} />{label}</Button>
        ))}
      </Card>
    </div>
  );
}

function QuestionCard({ q, index, total, onUpdate, onRemove, onMove }: { q: Question; index: number; total: number; onUpdate: (p: Partial<Question>) => void; onRemove: () => void; onMove: (d: number) => void }) {
  const meta = QTYPES.find((t) => t[0] === q.type)!;
  const opts = q.options ?? [];
  const setOpt = (i: number, v: string) => { const o = [...opts]; o[i] = v; onUpdate({ options: o }); };
  const addOpt = () => onUpdate({ options: [...opts, "ตัวเลือกใหม่"] });
  const delOpt = (i: number) => onUpdate({ options: opts.filter((_, x) => x !== i) });

  return (
    <Card style={{ padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--secondary)", borderRadius: "12px 12px 0 0" }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--card)", border: "1px solid var(--border)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
        <Badge variant="secondary"><Icon name={meta[2]} size={12} />{meta[1]}</Badge>
        <div style={{ flex: 1 }} />
        <button onClick={() => onMove(-1)} disabled={index === 0} style={iconCtl(index === 0)}><Icon name="chevron-up" size={15} /></button>
        <button onClick={() => onMove(1)} disabled={index === total - 1} style={iconCtl(index === total - 1)}><Icon name="chevron-down" size={15} /></button>
        <button onClick={onRemove} style={iconCtl(false, true)}><Icon name="trash-2" size={15} /></button>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <Input value={q.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="พิมพ์คำถาม…" style={{ fontWeight: 600, height: 40 }} />
        {q.type === "rating" ? (
          <div style={{ display: "flex", gap: 8, color: "var(--muted-foreground)", fontSize: 13, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((n) => <span key={n} style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)", display: "grid", placeItems: "center", fontWeight: 600 }}>{n}</span>)}
            <span style={{ alignSelf: "center", marginLeft: 4 }}>น้อยที่สุด → มากที่สุด</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opts.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Icon name={q.type === "checkbox" ? "square" : "circle"} size={16} color="var(--muted-foreground)" />
                <Input value={opt} onChange={(e) => setOpt(i, e.target.value)} style={{ height: 34 }} />
                <button onClick={() => delOpt(i)} disabled={opts.length <= 1} style={iconCtl(opts.length <= 1)}><Icon name="x" size={14} /></button>
              </div>
            ))}
            <button onClick={addOpt} style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: "4px 2px" }}>
              <Icon name="plus" size={14} />เพิ่มตัวเลือก
            </button>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4, borderTop: "1px solid var(--border)", marginTop: 2 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted-foreground)", cursor: "pointer", paddingTop: 10 }}>
            <input type="checkbox" checked={q.required} onChange={(e) => onUpdate({ required: e.target.checked })} style={{ accentColor: "var(--primary)", width: 15, height: 15 }} />
            จำเป็นต้องตอบ
          </label>
        </div>
      </div>
    </Card>
  );
}
