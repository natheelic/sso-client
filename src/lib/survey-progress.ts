/**
 * Client-only local preferences. Completion/certificate state moved to the
 * database (see src/lib/submissions-db.ts) — this file now only holds the
 * admin's certificate-signature-variant pick, a cosmetic, non-identity
 * setting with nowhere durable to live until roadmap Phase 4 wires up
 * CollegeSettings.
 */
const SIG_KEY = "licec-signature-variant";

export function getSignatureVariant(): number {
  if (typeof window === "undefined") return 0;
  const v = Number(window.localStorage.getItem(SIG_KEY));
  return Number.isFinite(v) ? v : 0;
}

export function setSignatureVariant(v: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIG_KEY, String(v));
  } catch {
    /* ignore */
  }
}
