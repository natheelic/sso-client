"use client";

/** AdminSettings — college info + admin account + SSO connection (ported from AdminResults.jsx AdminSettings). */
import { useState, type ChangeEvent } from "react";
import { Badge, Button, Card, Field, Input, PageHeader } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { useToast } from "@/components/survey/toast";
import { useAdminData } from "@/components/survey/admin/admin-data";
import { getInitial } from "@/lib/format";

export function SettingsScreen() {
  const toast = useToast();
  const { adminUser: admin, college, saveCollegeInfo } = useAdminData();
  const [form, setForm] = useState(college);
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await saveCollegeInfo({
        name: form.name, nameEn: form.nameEn, affiliation: form.affiliation,
        province: form.province, director: form.director, directorTitle: form.directorTitle,
      });
      toast("บันทึกข้อมูลวิทยาลัยแล้ว");
    } catch {
      toast("บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "28px clamp(20px,4vw,36px)", maxWidth: 760 }} className="fade-in">
      <PageHeader title="ตั้งค่า" subtitle="ข้อมูลวิทยาลัยและบัญชีผู้ดูแลระบบ" />

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>ข้อมูลวิทยาลัย</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="ชื่อวิทยาลัย"><Input value={form.name} onChange={upd("name")} /></Field>
            <Field label="สังกัด"><Input value={form.affiliation} onChange={upd("affiliation")} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="ชื่อผู้อำนวยการ"><Input value={form.director} onChange={upd("director")} /></Field>
              <Field label="ตำแหน่ง"><Input value={form.directorTitle} onChange={upd("directorTitle")} /></Field>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Button onClick={save} disabled={saving} style={saving ? { opacity: 0.6, cursor: "not-allowed" } : {}}>
              <Icon name="check" size={15} />{saving ? "กำลังบันทึก…" : "บันทึก"}
            </Button>
          </div>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>บัญชีผู้สร้างแบบสอบถาม</div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="shield" size={14} />เข้าสู่ระบบและได้รับสิทธิ์ผ่าน SSO กลางของวิทยาลัย
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "var(--secondary)", borderRadius: 10, marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--primary)", color: "var(--primary-foreground)", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 600 }}>{getInitial(admin.name, admin.email)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{admin.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin.email ?? "—"}{admin.role ? " · " + admin.role : ""}</div>
            </div>
            <Badge variant="success"><span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--success-fg)" }} />ใช้งานอยู่</Badge>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="outline" onClick={() => toast("จัดการสิทธิ์ผู้สร้างแบบสอบถามในระบบ SSO", "shield")}><Icon name="key-round" size={15} />จัดการสิทธิ์ใน SSO</Button>
          </div>
        </Card>

        <Card style={{ padding: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>การเชื่อมต่อ SSO</div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 16px" }}>ผู้เข้าร่วมยืนยันตัวตนผ่านเซิร์ฟเวอร์ SSO กลางของวิทยาลัย</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1px solid var(--border)", borderRadius: 10, gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="key-round" size={18} color="var(--muted-foreground)" />
              <div style={{ fontSize: 13.5 }}><div style={{ fontWeight: 600 }}>sso.licec.ac.th</div><div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>OAuth 2.0 · เชื่อมต่อแล้ว</div></div>
            </div>
            <Badge variant="success">เชื่อมต่อแล้ว</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
