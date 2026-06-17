"use client";

/**
 * Toast — small transient confirmations (ported from shared.jsx ToastHost).
 * Wrap a tree in <ToastProvider> and call useToast()(msg, iconName).
 */
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Icon } from "@/components/survey/icon";

type PushFn = (msg: string, icon?: string) => void;
interface ToastItem { id: string; msg: string; icon: string }

const ToastCtx = createContext<PushFn>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback<PushFn>((msg, icon = "check") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 400, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", pointerEvents: "none" }}>
        {toasts.map((t) => (
          <div key={t.id} className="fade-in" style={{
            display: "flex", alignItems: "center", gap: 9, padding: "10px 16px",
            background: "var(--primary)", color: "var(--primary-foreground)",
            borderRadius: 999, fontSize: 13.5, fontWeight: 500, boxShadow: "var(--shadow-lg)",
          }}>
            <Icon name={t.icon} size={15} />{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
