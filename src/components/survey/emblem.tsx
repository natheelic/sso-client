/**
 * Emblem + LogoLockup — the college torch-and-gear mark used across the app.
 * Pure SVG (ported from shared.jsx). Usable from server or client components.
 */
import type { CSSProperties } from "react";

// Round trig-derived SVG coords to a stable precision so server (Node) and
// client (browser) Math.sin/cos differences don't cause a hydration mismatch.
const r = (n: number) => Math.round(n * 1000) / 1000;

export function Emblem({ size = 40, tone = "navy" }: { size?: number; tone?: "navy" | "light" }) {
  const ring = tone === "light" ? "#fafafa" : "var(--cert-navy)";
  const gold = "var(--cert-gold)";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="ตราวิทยาลัย" style={{ flexShrink: 0 }}>
      <circle cx="32" cy="32" r="30" fill="none" stroke={ring} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24.5" fill="none" stroke={gold} strokeWidth="1" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = r(32 + Math.cos(a) * 27), y1 = r(32 + Math.sin(a) * 27);
        const x2 = r(32 + Math.cos(a) * 30), y2 = r(32 + Math.sin(a) * 30);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ring} strokeWidth="1.4" />;
      })}
      <path d="M32 16 C 27 24, 28 30, 32 34 C 36 30, 37 24, 32 16 Z" fill={gold} />
      <rect x="30.5" y="33" width="3" height="13" rx="1.2" fill={ring} />
      <path d="M24 47 H40 L38 50 H26 Z" fill={ring} />
    </svg>
  );
}

export function LogoLockup({ size = 40, inverse, style }: { size?: number; inverse?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, ...style }}>
      <Emblem size={size} tone={inverse ? "light" : "navy"} />
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: inverse ? "#fafafa" : "var(--foreground)" }}>
          วิทยาลัยการอาชีพลอง
        </div>
        <div style={{ fontSize: 11.5, color: inverse ? "rgba(250,250,250,0.7)" : "var(--muted-foreground)" }}>
          ระบบแบบสอบถาม &amp; เกียรติบัตรออนไลน์
        </div>
      </div>
    </div>
  );
}
