"use client";

/** VerifyCertificate — public certificate verification result (found case). */
import { useEffect, useRef, useState } from "react";
import { COLLEGE, thaiLongDate, verifyUrlFor, type TemplateId } from "@/lib/survey-data";
import type { PublicCertificate } from "@/lib/submissions-db";
import { Badge, Card } from "@/components/survey/ui";
import { Icon } from "@/components/survey/icon";
import { CertificateFrame, type CertData } from "@/components/survey/certificate";

export function VerifyCertificate({ cert }: { cert: PublicCertificate }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(880);

  useEffect(() => {
    const fit = () => { if (wrapRef.current) setW(Math.min(960, wrapRef.current.clientWidth)); };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const data: CertData = {
    template: cert.activity.certTemplate as TemplateId,
    recipientName: cert.recipientName,
    activityTitle: cert.activity.title,
    activityType: cert.activity.type,
    hours: cert.activity.hours,
    dateLabel: cert.activity.dateLabel,
    issueDateLong: thaiLongDate(cert.issueDate),
    certNo: cert.certNo,
    college: COLLEGE,
    signatureVariant: cert.signatureVariant,
    signatureName: COLLEGE.director,
    signatureTitle: COLLEGE.directorTitle,
    verifyUrl: verifyUrlFor(cert.certNo),
  };

  return (
    <div className="fade-in">
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Badge variant="success" style={{ marginBottom: 12 }}><Icon name="shield-check" size={13} />เกียรติบัตรนี้ถูกต้อง</Badge>
        <h1 style={{ fontFamily: "var(--font-serif-th)", fontSize: "clamp(22px,3.6vw,30px)", fontWeight: 700, margin: "0 0 8px" }}>
          {cert.recipientName}
        </h1>
        <p style={{ fontSize: 14.5, color: "var(--muted-foreground)", margin: 0 }}>
          ผ่านการเข้าร่วม <strong style={{ color: "var(--foreground)" }}>{cert.activity.title}</strong>
        </p>
      </div>

      <div ref={wrapRef} style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <CertificateFrame width={w} data={data} />
      </div>

      <Card style={{ padding: 20, maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 16px", fontSize: 13.5 }}>
          <span style={{ color: "var(--muted-foreground)" }}>เลขที่เกียรติบัตร</span>
          <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{cert.certNo}</span>
          <span style={{ color: "var(--muted-foreground)" }}>วันที่ออกเกียรติบัตร</span>
          <span style={{ fontWeight: 600 }}>{thaiLongDate(cert.issueDate)}</span>
          <span style={{ color: "var(--muted-foreground)" }}>ระยะเวลา</span>
          <span style={{ fontWeight: 600 }}>{cert.activity.hours} ชั่วโมง</span>
          <span style={{ color: "var(--muted-foreground)" }}>สถาบันผู้ออก</span>
          <span style={{ fontWeight: 600 }}>{COLLEGE.name}</span>
        </div>
      </Card>
    </div>
  );
}
