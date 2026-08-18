/**
 * Certificate.tsx — official landscape certificate (fixed 1000×707), with 4
 * templates, ornamental seal, director signature, and a verification QR.
 * Ported from Certificate.jsx. Pure render — no hooks.
 *
 * The certificate is a *document surface*: it keeps its own paper palette
 * (ivory/navy/gold) regardless of the app's light/dark theme.
 */
import type { ReactNode } from "react";
import QRCode from "qrcode";
import type { TemplateId, College } from "@/lib/survey-data";

export interface CertData {
  template?: TemplateId;
  recipientName: string;
  activityTitle: string;
  activityType: string;
  hours: number;
  dateLabel: string;
  issueDateLong: string;
  certNo: string;
  college: College;
  signatureVariant?: number;
  /** Uploaded signature PNG (data: URI); falls back to the placeholder squiggle when absent. */
  signatureImage?: string | null;
  signatureName: string;
  signatureTitle: string;
  /** Uploaded logo/seal PNG (data: URI); falls back to the built-in emblem when absent. */
  logoImage?: string | null;
  verifyUrl: string;
}

// Round trig-derived SVG coords so server/client Math.sin/cos differences
// don't cause hydration mismatches if a certificate is ever server-rendered.
const r3 = (n: number) => Math.round(n * 1000) / 1000;

// ---------- verification QR — encodes the real verify URL ----------
export function CertQR({ value, size = 96, fg = "#1a1a1a", bg = "#ffffff" }: { value: string; size?: number; fg?: string; bg?: string }) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "M" });
  const N = modules.size, cell = size / N;
  const cells: ReactNode[] = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (modules.get(r, c)) cells.push(<rect key={r + "-" + c} x={c * cell} y={r * cell} width={cell + 0.5} height={cell + 0.5} fill={fg} />);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill={bg} />
      {cells}
    </svg>
  );
}

// ---------- ornamental seal / medallion ----------
export function Seal({ size = 92, ink = "#b08a3e", ring = "#1d2b4f", label = "วิทยาลัยการอาชีพลอง" }: { size?: number; ink?: string; ring?: string; label?: string }) {
  const id = "seal" + Math.round(size);
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <path id={id} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
      </defs>
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return <circle key={i} cx={r3(60 + Math.cos(a) * 56)} cy={r3(60 + Math.sin(a) * 56)} r="3.4" fill={ink} opacity="0.9" />;
      })}
      <circle cx="60" cy="60" r="52" fill="none" stroke={ink} strokeWidth="2.5" />
      <circle cx="60" cy="60" r="40" fill="none" stroke={ring} strokeWidth="1.4" />
      <text fontSize="8.4" fontWeight="700" fill={ring} letterSpacing="0.5">
        <textPath href={`#${id}`} startOffset="2%">★ {label} ★ เกียรติบัตรอิเล็กทรอนิกส์ ★</textPath>
      </text>
      <path d="M60 38 C 53 49, 55 58, 60 64 C 65 58, 67 49, 60 38 Z" fill={ink} />
      <rect x="58" y="62" width="4" height="18" rx="1.6" fill={ring} />
      <path d="M50 81 H70 L67 86 H53 Z" fill={ring} />
    </svg>
  );
}

// ---------- handwritten signature (placeholder for an uploaded signature) ----------
export function SignatureMark({ color = "#1d2b4f", width = 180, variant = 0 }: { color?: string; width?: number; variant?: number }) {
  const paths = [
    "M6 40 C 30 6, 40 60, 60 28 C 72 10, 78 50, 96 30 C 110 16, 120 44, 150 22 C 165 12, 172 30, 178 24",
    "M8 36 C 22 14, 34 50, 52 30 S 78 8, 92 34 C 104 54, 120 16, 138 32 C 150 42, 160 18, 176 30",
  ];
  return (
    <svg width={width} height={Math.round(width * 0.33)} viewBox="0 0 184 60" style={{ display: "block" }}>
      <path d={paths[variant % paths.length]} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M120 44 C 130 40, 140 46, 150 40" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// ---------- template visual definitions ----------
interface TemplateDef {
  page: string; ink: string; accent: string; gold: string; eyebrow: string; nameColor: string;
  border: (c: { g: string; a: string }) => ReactNode;
}

const TEMPLATES: Record<TemplateId, TemplateDef> = {
  classic: {
    page: "#fbf8f1", ink: "#2a2a24", accent: "#1d2b4f", gold: "#b08a3e", eyebrow: "#1d2b4f", nameColor: "#1d2b4f",
    border: ({ g, a }) => (
      <>
        <rect x="22" y="22" width="956" height="663" fill="none" stroke={g} strokeWidth="3" />
        <rect x="34" y="34" width="932" height="639" fill="none" stroke={g} strokeWidth="1" opacity="0.7" />
        <rect x="40" y="40" width="920" height="627" fill="none" stroke={a} strokeWidth="0.8" opacity="0.5" />
        {([[22, 22, 0], [978, 22, -90], [978, 685, 180], [22, 685, 90]] as const).map(([x, y, rot], i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
            <path d="M0 0 L60 0 M0 0 L0 60" stroke={g} strokeWidth="3" fill="none" />
            <path d="M10 10 q 30 4, 44 30" stroke={a} strokeWidth="1.2" fill="none" opacity="0.6" />
            <circle cx="0" cy="0" r="5" fill={g} />
          </g>
        ))}
      </>
    ),
  },
  formal: {
    page: "#ffffff", ink: "#1f2937", accent: "#1d2b4f", gold: "#b08a3e", eyebrow: "#1d2b4f", nameColor: "#1d2b4f",
    border: ({ g }) => (
      <>
        <rect x="0" y="0" width="1000" height="707" fill="#1d2b4f" />
        <rect x="16" y="16" width="968" height="675" fill="#ffffff" />
        <rect x="30" y="30" width="940" height="647" fill="none" stroke={g} strokeWidth="1.6" />
        <rect x="0" y="0" width="1000" height="10" fill={g} />
        <rect x="0" y="697" width="1000" height="10" fill={g} />
      </>
    ),
  },
  modern: {
    page: "#ffffff", ink: "#0a0a0a", accent: "#0a0a0a", gold: "#737373", eyebrow: "#737373", nameColor: "#0a0a0a",
    border: () => (
      <>
        <rect x="0" y="0" width="1000" height="707" fill="#ffffff" />
        <rect x="0" y="0" width="14" height="707" fill="#0a0a0a" />
        <rect x="48" y="48" width="904" height="611" fill="none" stroke="#e5e5e5" strokeWidth="1.4" />
        <circle cx="860" cy="150" r="120" fill="none" stroke="#f0f0f0" strokeWidth="40" opacity="0.7" />
      </>
    ),
  },
  emerald: {
    page: "#f4f8f5", ink: "#22332c", accent: "#1f5d4c", gold: "#b08a3e", eyebrow: "#1f5d4c", nameColor: "#1f5d4c",
    border: ({ g, a }) => (
      <>
        <rect x="0" y="0" width="1000" height="707" fill="#f4f8f5" />
        <rect x="26" y="26" width="948" height="655" fill="none" stroke={a} strokeWidth="2.5" />
        <rect x="36" y="36" width="928" height="635" fill="none" stroke={g} strokeWidth="1" opacity="0.8" />
        {([[26, 26, 0], [974, 26, 90], [974, 681, 180], [26, 681, 270]] as const).map(([x, y, rot], i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
            <path d="M0 70 C 0 30, 30 0, 70 0" fill="none" stroke={g} strokeWidth="6" opacity="0.5" />
            <path d="M14 54 q 16 -40, 54 -40" fill="none" stroke={a} strokeWidth="1.4" opacity="0.5" />
          </g>
        ))}
      </>
    ),
  },
};

function CertEmblem({ accent, gold }: { accent: string; gold: string }) {
  return (
    <svg width="58" height="58" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="32" cy="32" r="24" fill="none" stroke={gold} strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={r3(32 + Math.cos(a) * 27)} y1={r3(32 + Math.sin(a) * 27)} x2={r3(32 + Math.cos(a) * 30)} y2={r3(32 + Math.sin(a) * 30)} stroke={accent} strokeWidth="1.3" />;
      })}
      <path d="M32 16 C 27 24, 28 30, 32 34 C 36 30, 37 24, 32 16 Z" fill={gold} />
      <rect x="30.5" y="33" width="3" height="13" rx="1.2" fill={accent} />
      <path d="M24 47 H40 L38 50 H26 Z" fill={accent} />
    </svg>
  );
}

// ---------- the certificate board (fixed 1000×707) ----------
export function CertificateBoard({ data }: { data: CertData }) {
  const {
    template = "classic", recipientName, activityTitle, activityType, hours,
    dateLabel, issueDateLong, certNo, college, signatureVariant = 0, signatureImage, signatureName, signatureTitle,
    logoImage, verifyUrl,
  } = data;
  const t = TEMPLATES[template] || TEMPLATES.classic;

  return (
    <div style={{ width: 1000, height: 707, position: "relative", background: t.page, fontFamily: "var(--font-doc)", color: t.ink, overflow: "hidden" }}>
      <svg width="1000" height="707" viewBox="0 0 1000 707" style={{ position: "absolute", inset: 0 }}>
        {t.border({ g: t.gold, a: t.accent })}
      </svg>

      <div style={{ position: "absolute", right: 70, top: 250, opacity: 0.05 }}>
        <Seal size={360} ink={t.accent} ring={t.accent} />
      </div>

      <div style={{ position: "absolute", inset: 0, padding: "58px 80px 56px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {logoImage
            ? <img src={logoImage} alt="" width={58} height={58} style={{ objectFit: "contain" }} />
            : <CertEmblem accent={t.accent} gold={t.gold} />}
          <div style={{ fontFamily: "var(--font-serif-th)", fontSize: 23, fontWeight: 700, color: t.accent, marginTop: 8 }}>{college.name}</div>
          <div style={{ fontSize: 13.5, color: t.ink, opacity: 0.7 }}>{college.affiliation}</div>
        </div>

        <div style={{ marginTop: 18, fontFamily: "var(--font-serif-th)", fontSize: 38, fontWeight: 700, letterSpacing: "0.04em", color: t.eyebrow }}>
          เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
        </div>

        <div style={{ marginTop: 14, fontFamily: "var(--font-serif-th)", fontSize: 52, fontWeight: 700, color: t.nameColor, lineHeight: 1.1 }}>
          {recipientName}
        </div>
        <div style={{ width: 420, height: 1.5, background: t.gold, marginTop: 8, opacity: 0.7 }} />

        <div style={{ marginTop: 22, fontSize: 19, lineHeight: 1.7, maxWidth: 720 }}>
          เป็นผู้ผ่านการเข้าร่วม{activityType}
          <div style={{ fontWeight: 700, fontSize: 22, color: t.accent, marginTop: 6, fontFamily: "var(--font-serif-th)" }}>
            “{activityTitle}”
          </div>
          <div style={{ marginTop: 8, fontSize: 17 }}>
            ระยะเวลา {hours} ชั่วโมง · จัดขึ้นเมื่อวันที่ {dateLabel}
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 16 }}>ให้ไว้ ณ วันที่ {issueDateLong}</div>

        <div style={{ position: "absolute", left: 80, right: 80, bottom: 52, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", textAlign: "left" }}>
            <div style={{ border: `1px solid ${t.gold}`, padding: 4, background: "#fff", borderRadius: 4 }}>
              {/* Encodes the same URL printed below — requires VERIFY_HOST to be routed to this app in production (see survey-data.ts). */}
              <CertQR value={`https://${verifyUrl}`} size={74} fg={t.accent} />
            </div>
            <div style={{ fontSize: 11.5, lineHeight: 1.5, color: t.ink, opacity: 0.85 }}>
              <div style={{ fontWeight: 700 }}>เลขที่ {certNo}</div>
              <div>สแกนเพื่อตรวจสอบความถูกต้อง</div>
              <div style={{ opacity: 0.65 }}>{verifyUrl}</div>
            </div>
          </div>

          <div style={{ alignSelf: "center", marginBottom: 4 }}>
            <Seal size={86} ink={t.gold} ring={t.accent} label={college.name} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 230 }}>
            {signatureImage
              ? <img src={signatureImage} alt="" style={{ width: 150, height: 50, objectFit: "contain" }} />
              : <SignatureMark color={t.accent} width={150} variant={signatureVariant} />}
            <div style={{ width: 200, height: 1, background: t.ink, opacity: 0.35, marginTop: 2 }} />
            <div style={{ marginTop: 7, fontWeight: 700, fontSize: 16 }}>( {signatureName} )</div>
            <div style={{ fontSize: 13.5, opacity: 0.8 }}>{signatureTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- scaling frame ----------
export function CertificateFrame({ data, width = 1000, shadow = true }: { data: CertData; width?: number; shadow?: boolean }) {
  const scale = width / 1000;
  return (
    <div style={{ width, height: 707 * scale, position: "relative" }}>
      <div style={{ width: 1000, height: 707, transformOrigin: "top left", transform: `scale(${scale})`, boxShadow: shadow ? "var(--shadow-lg)" : "none" }}>
        <CertificateBoard data={data} />
      </div>
    </div>
  );
}
