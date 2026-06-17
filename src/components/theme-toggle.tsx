"use client";

/**
 * Light / dark theme toggle.
 *
 * Reads the initial state from the `.dark` class that the inline script in
 * `layout.tsx` applies before paint (so there's no flash), then persists the
 * user's choice to `localStorage` and toggles the class on <html>.
 *
 * A mount guard renders a neutral placeholder on the server / first client
 * render so the icon never causes a hydration mismatch.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { Icon } from "@/components/survey/icon";

export function ThemeToggle({ style }: { style?: CSSProperties }) {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* localStorage may be unavailable (private mode) — ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? (dark ? "สลับเป็นธีมสว่าง" : "สลับเป็นธีมมืด") : "สลับธีม"}
      title="สลับธีม"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)",
        background: "var(--card)", color: "var(--muted-foreground)", cursor: "pointer",
        flexShrink: 0, ...style,
      }}
    >
      {mounted ? <Icon name={dark ? "sun" : "moon"} size={18} /> : <span style={{ width: 18, height: 18 }} />}
    </button>
  );
}
