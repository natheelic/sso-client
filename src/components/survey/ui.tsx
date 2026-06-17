"use client";

/**
 * UI primitives matching the CMS design system (ported from shared.jsx).
 * Inline styles over CSS custom properties — same approach as the prototype,
 * so the tokens in globals.css drive everything (incl. dark mode).
 */
import {
  useEffect, useState, type ButtonHTMLAttributes, type CSSProperties,
  type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Icon } from "@/components/survey/icon";

export const cx = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

// ---- Button ----
type Variant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type Size = "default" | "sm" | "lg" | "icon" | "iconSm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
}

export function Button({ variant = "default", size = "default", children, style, active, ...rest }: ButtonProps) {
  const variants: Record<Variant, CSSProperties> = {
    default: { background: "var(--primary)", color: "var(--primary-foreground)", border: "1px solid transparent" },
    secondary: { background: "var(--secondary)", color: "var(--secondary-foreground)", border: "1px solid transparent" },
    outline: { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" },
    ghost: { background: active ? "var(--secondary)" : "transparent", color: active ? "var(--foreground)" : "var(--muted-foreground)", border: "1px solid transparent" },
    destructive: { background: "var(--destructive)", color: "var(--destructive-foreground)", border: "1px solid transparent" },
    link: { background: "transparent", color: "var(--primary)", border: "none", textDecoration: "underline", textUnderlineOffset: "4px", padding: 0, height: "auto" },
  };
  const sizes: Record<Size, CSSProperties> = {
    default: { height: 36, padding: "0 16px", fontSize: 14 },
    sm: { height: 32, padding: "0 12px", fontSize: 13 },
    lg: { height: 44, padding: "0 24px", fontSize: 15 },
    icon: { height: 36, width: 36, padding: 0 },
    iconSm: { height: 30, width: 30, padding: 0 },
  };
  return (
    <button
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        borderRadius: 6, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
        transition: "opacity .15s, background-color .15s, border-color .15s",
        fontFamily: "inherit", lineHeight: 1,
        ...variants[variant], ...sizes[size], ...style,
      }}
      onMouseEnter={(e) => {
        if (["default", "secondary", "destructive"].includes(variant)) e.currentTarget.style.opacity = ".9";
        else if (["outline", "ghost"].includes(variant) && !active) e.currentTarget.style.background = "var(--secondary)";
        if (variant === "outline") e.currentTarget.style.borderColor = "var(--ring)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        if (variant === "outline") e.currentTarget.style.borderColor = "var(--border)";
        if (["outline", "ghost"].includes(variant) && !active) e.currentTarget.style.background = "transparent";
      }}
      {...rest}
    >{children}</button>
  );
}

// ---- Badge ----
type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
export function Badge({ variant = "default", children, style }: { variant?: BadgeVariant; children: ReactNode; style?: CSSProperties }) {
  const variants: Record<BadgeVariant, CSSProperties> = {
    default: { background: "var(--primary)", color: "var(--primary-foreground)" },
    secondary: { background: "var(--secondary)", color: "var(--secondary-foreground)" },
    outline: { background: "transparent", color: "var(--foreground)", border: "1px solid var(--border)" },
    success: { background: "var(--success-bg)", color: "var(--success-fg)" },
    warning: { background: "var(--warning-bg)", color: "var(--warning-fg)" },
    destructive: { background: "var(--danger-bg)", color: "var(--danger-fg)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
      fontSize: 12, fontWeight: 600, borderRadius: 9999, border: "1px solid transparent",
      whiteSpace: "nowrap", ...variants[variant], ...style,
    }}>{children}</span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = { "เปิดรับ": "success", "ปิดแล้ว": "secondary", "ร่าง": "warning" };
  const dot: Record<string, string> = { "เปิดรับ": "var(--success-fg)", "ปิดแล้ว": "var(--muted-foreground)", "ร่าง": "var(--warning-fg)" };
  return (
    <Badge variant={map[status] ?? "secondary"}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: dot[status], display: "inline-block" }} />
      {status}
    </Badge>
  );
}

// ---- Card ----
interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}
export function Card({ children, style, hover, onClick }: CardProps) {
  const [h, setH] = useState(false);
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 12,
        border: `1px solid ${hover && h ? "rgba(10,10,10,0.5)" : "var(--border)"}`,
        background: "var(--card)", color: "var(--card-foreground)",
        boxShadow: "var(--shadow-sm)", transition: "border-color .15s, box-shadow .15s, transform .15s",
        ...style,
      }}
      onMouseEnter={() => hover && setH(true)}
      onMouseLeave={() => hover && setH(false)}
    >{children}</div>
  );
}

// ---- Input / Textarea / Select ----
const fieldBase: CSSProperties = {
  display: "block", width: "100%", fontSize: 14,
  background: "var(--card)", color: "var(--foreground)",
  border: "1px solid var(--input)", borderRadius: 6,
  boxShadow: "var(--shadow-sm)", outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
  transition: "border-color .15s, box-shadow .15s",
};
function focusOn(e: { currentTarget: HTMLElement }) { e.currentTarget.style.borderColor = "var(--ring)"; e.currentTarget.style.boxShadow = "0 0 0 1px var(--ring)"; }
function focusOff(e: { currentTarget: HTMLElement }) { e.currentTarget.style.borderColor = "var(--input)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }

export function Input({ style, ...p }: InputHTMLAttributes<HTMLInputElement>) {
  return <input style={{ ...fieldBase, height: 36, padding: "4px 12px", ...style }} onFocus={focusOn} onBlur={focusOff} {...p} />;
}
export function Textarea({ style, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea style={{ ...fieldBase, minHeight: 84, padding: "8px 12px", lineHeight: 1.6, resize: "vertical", ...style }} onFocus={focusOn} onBlur={focusOff} {...p} />;
}
export function Select({ style, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      style={{
        ...fieldBase, height: 36, padding: "4px 30px 4px 12px", appearance: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", cursor: "pointer", ...style,
      }}
      onFocus={focusOn} onBlur={focusOff} {...p}
    >{children}</select>
  );
}

export function Field({ label, hint, required, children }: { label?: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600 }}>{label}{required && <span style={{ color: "var(--destructive)", marginInlineStart: 4 }}>*</span>}</span>}
      {children}
      {hint && <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{hint}</span>}
    </label>
  );
}

// ---- Page header ----
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.25 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 6, marginBottom: 0 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---- Stat tile ----
export function Stat({ label, value, sub, icon, accent }: { label: string; value: ReactNode; sub?: string; icon: string; accent?: string }) {
  return (
    <Card style={{ padding: 0 }}>
      <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted-foreground)" }}>{label}</span>
          <Icon name={icon} size={16} color="var(--muted-foreground)" />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, fontFeatureSettings: "'tnum'" }}>{value}</div>
          {sub && <div style={{ fontSize: 12.5, color: accent || "var(--muted-foreground)", marginBottom: 3 }}>{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

// ---- Progress bar ----
export function Progress({ value }: { value: number }) {
  return (
    <div style={{ height: 6, background: "var(--secondary)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, value))}%`, background: "var(--primary)", borderRadius: 999, transition: "width .35s ease" }} />
    </div>
  );
}

// ---- Empty state ----
export function Empty({ icon, title, hint, action }: { icon: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "56px 24px", textAlign: "center" }}>
      <Icon name={icon} size={40} style={{ opacity: 0.2 }} />
      <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
      {hint && <div style={{ fontSize: 13.5, color: "var(--muted-foreground)", maxWidth: 320 }}>{hint}</div>}
      {action}
    </div>
  );
}

// ---- Modal ----
export function Modal({ open, onClose, children, width = 520, title }: { open: boolean; onClose: () => void; children: ReactNode; width?: number; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 300, background: "rgba(10,10,10,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(2px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{
        width: "100%", maxWidth: width, maxHeight: "90vh", overflowY: "auto",
        background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
      }}>
        {title && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
            <button onClick={onClose} aria-label="ปิด" style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground)", display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 6 }}>
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
