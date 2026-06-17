/**
 * Client-side progress store for the prototype (sessionStorage).
 * Tracks which activities a participant has completed and the issued cert
 * record, so the activity list/intro can show "ทำแล้ว" and re-open the cert.
 * No backend yet — clears when the tab closes.
 */
export interface CertRecord {
  name: string;
  certNo: string;
  /** Buddhist-era ISO-like issue date, e.g. "2568-05-14" */
  issueISO: string;
  activityId: string;
}

const RECORDS_KEY = "licec-survey-records";
const SIG_KEY = "licec-signature-variant";

export function getRecords(): Record<string, CertRecord> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(RECORDS_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getRecord(activityId: string): CertRecord | null {
  return getRecords()[activityId] ?? null;
}

export function saveRecord(rec: CertRecord): void {
  if (typeof window === "undefined") return;
  const all = getRecords();
  all[rec.activityId] = rec;
  try {
    window.sessionStorage.setItem(RECORDS_KEY, JSON.stringify(all));
  } catch {
    /* storage may be unavailable — ignore */
  }
}

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
