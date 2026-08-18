/**
 * survey-data.ts — reference data for the survey + certificate platform.
 * วิทยาลัยการอาชีพลอง (Long Industrial and Community Education College)
 *
 * Ported from the Claude Design handoff (survey/project/app/data.jsx).
 * ACTIVITIES is now only the seed source for the DB (see prisma/seed.ts) —
 * the live app reads activities from Postgres via src/lib/activities-db.ts.
 * RESPONDENTS is still mock/generated; real submissions are a later
 * roadmap phase.
 */

export type TemplateId = "classic" | "formal" | "modern" | "emerald";
export type QuestionType = "rating" | "radio" | "checkbox";
export type ActivityStatus = "เปิดรับ" | "ปิดแล้ว" | "ร่าง";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
}

export interface Activity {
  id: string;
  code: string;
  title: string;
  type: string;
  hours: number;
  location: string;
  dateLabel: string;
  /** Buddhist-era ISO-like date, e.g. "2568-05-14" */
  issueDate: string;
  status: ActivityStatus;
  certTemplate: TemplateId;
  target: number;
  description: string;
  questions: Question[];
  /** marks a freshly-created activity in the admin editor */
  __new?: boolean;
}

export interface CertTemplate {
  id: TemplateId;
  name: string;
  desc: string;
  swatch: [string, string, string];
}

export interface Respondent {
  id: string;
  prefix: string;
  first: string;
  last: string;
  name: string;
  activityId: string;
  certNo: string;
  dateISO: string;
  dateLabel: string;
  avg: string;
}

export interface College {
  name: string;
  nameEn: string;
  affiliation: string;
  province: string;
  director: string;
  directorTitle: string;
}

export const COLLEGE: College = {
  name: "วิทยาลัยการอาชีพลอง",
  nameEn: "Long Industrial and Community Education College",
  affiliation: "สำนักงานคณะกรรมการการอาชีวศึกษา · กระทรวงศึกษาธิการ",
  province: "จังหวัดแพร่",
  director: "นายประสิทธิ์  วงศ์ตา",
  directorTitle: "ผู้อำนวยการวิทยาลัยการอาชีพลอง",
};

// ---- Certificate templates (changeable backgrounds) ----
export const CERT_TEMPLATES: CertTemplate[] = [
  { id: "classic", name: "คลาสสิกทอง", desc: "ครีมงาช้าง ขอบทองคู่", swatch: ["#fbf8f1", "#b08a3e", "#1d2b4f"] },
  { id: "formal", name: "ทางการกรมท่า", desc: "ขาว ขอบกรมท่า ตราทอง", swatch: ["#ffffff", "#1d2b4f", "#b08a3e"] },
  { id: "modern", name: "มินิมอลโมเดิร์น", desc: "ขาวสะอาด เส้นเรขาคณิต", swatch: ["#ffffff", "#0a0a0a", "#737373"] },
  { id: "emerald", name: "มรกตวิจิตร", desc: "เขียวอ่อน ลายไทยประยุกต์", swatch: ["#f4f8f5", "#1f5d4c", "#b08a3e"] },
];

// ---- Question bank helpers ----
export const RATING_LABELS = ["น้อยที่สุด", "น้อย", "ปานกลาง", "มาก", "มากที่สุด"];

const satisfactionSet = (subject: string): Question[] => [
  { id: "q1", type: "rating", required: true, title: `ความเหมาะสมของ${subject}โดยภาพรวม` },
  { id: "q2", type: "rating", required: true, title: "ความรู้ความเข้าใจที่ได้รับเพิ่มขึ้น" },
  { id: "q3", type: "rating", required: true, title: "การนำความรู้ไปประยุกต์ใช้ได้จริง" },
  {
    id: "q4", type: "radio", required: true,
    title: "ท่านทราบข่าวกิจกรรมนี้จากช่องทางใด",
    options: ["เว็บไซต์ / เพจวิทยาลัย", "อาจารย์ / เจ้าหน้าที่แจ้ง", "เพื่อน / รุ่นพี่แนะนำ", "ไลน์กลุ่ม / กลุ่มแผนก", "อื่น ๆ"],
  },
  {
    id: "q5", type: "checkbox", required: false,
    title: "หัวข้อที่ท่านสนใจให้จัดในครั้งต่อไป (เลือกได้มากกว่า 1)",
    options: ["ทักษะดิจิทัล", "ภาษาอังกฤษเพื่ออาชีพ", "ความปลอดภัยในงานช่าง", "การเป็นผู้ประกอบการ", "เทคโนโลยียานยนต์ไฟฟ้า", "พลังงานทดแทน"],
  },
  { id: "q6", type: "rating", required: true, title: "ความพร้อมของสถานที่และอุปกรณ์" },
];

// ---- Activities ----
export const ACTIVITIES: Activity[] = [
  {
    id: "act-ev", code: "LICEC-68-014",
    title: "อบรมเชิงปฏิบัติการ การติดตั้งและบำรุงรักษาระบบโซลาร์เซลล์",
    type: "หลักสูตรระยะสั้น", hours: 18,
    location: "อาคารปฏิบัติการช่างไฟฟ้า วิทยาลัยการอาชีพลอง",
    dateLabel: "12 – 14 พฤษภาคม 2568", issueDate: "2568-05-14",
    status: "เปิดรับ", certTemplate: "classic", target: 60,
    description: "พัฒนาทักษะการออกแบบ ติดตั้ง และบำรุงรักษาระบบผลิตไฟฟ้าจากพลังงานแสงอาทิตย์ สำหรับนักศึกษาแผนกช่างไฟฟ้าและผู้สนใจทั่วไป",
    questions: satisfactionSet("หลักสูตรอบรม"),
  },
  {
    id: "act-digital", code: "LICEC-68-009",
    title: "พัฒนาทักษะดิจิทัลสำหรับครูอาชีวศึกษา",
    type: "โครงการอบรม", hours: 12,
    location: "ห้องประชุมศรีลอง ชั้น 3 อาคารอำนวยการ",
    dateLabel: "28 – 29 เมษายน 2568", issueDate: "2568-04-29",
    status: "เปิดรับ", certTemplate: "formal", target: 45,
    description: "ยกระดับสมรรถนะด้านเทคโนโลยีดิจิทัลของครูผู้สอน ทั้งการผลิตสื่อ การจัดการเรียนรู้ออนไลน์ และการวัดผลด้วยเครื่องมือดิจิทัล",
    questions: satisfactionSet("การอบรม"),
  },
  {
    id: "act-safety", code: "LICEC-68-021",
    title: "สัมมนาความปลอดภัยในงานช่างยนต์และการป้องกันอุบัติเหตุ",
    type: "สัมมนาวิชาการ", hours: 6,
    location: "หอประชุมวิทยาลัยการอาชีพลอง",
    dateLabel: "20 มิถุนายน 2568", issueDate: "2568-06-20",
    status: "ร่าง", certTemplate: "emerald", target: 120,
    description: "สร้างความตระหนักด้านความปลอดภัยในการปฏิบัติงานช่างยนต์ การใช้อุปกรณ์ป้องกันส่วนบุคคล และการจัดการความเสี่ยงในโรงฝึกงาน",
    questions: satisfactionSet("การสัมมนา"),
  },
  {
    id: "act-openhouse", code: "LICEC-68-003",
    title: "เปิดบ้านวิชาการ Long Open House 2568",
    type: "กิจกรรมวิชาการ", hours: 8,
    location: "วิทยาลัยการอาชีพลอง",
    dateLabel: "7 กุมภาพันธ์ 2568", issueDate: "2568-02-07",
    status: "ปิดแล้ว", certTemplate: "modern", target: 300,
    description: "เปิดพื้นที่จัดแสดงผลงานนวัตกรรมและสิ่งประดิษฐ์ของนักศึกษาทุกแผนกวิชา พร้อมกิจกรรมแนะแนวการศึกษาต่อสายอาชีพ",
    questions: satisfactionSet("กิจกรรม"),
  },
];

// ---- Thai dates ----
export const THAI_MONTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
export const THAI_MONTH_FULL = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

export function thaiLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${THAI_MONTH_FULL[m - 1]} พ.ศ. ${y}`;
}

// ---- Thai given/sur names for mock respondents ----
const PREFIXES = ["นาย", "นางสาว", "นาง"];
const FIRST = ["ธนกร", "ศิริพร", "ณัฐวุฒิ", "กมลชนก", "พงศกร", "ปวีณา", "อนุชา", "สุดารัตน์", "วีรภัทร", "จิราพร", "ภาคิน", "อรอุมา", "ชัยวัฒน์", "นภัสสร", "ธีรเดช", "พิมพ์ชนก", "กิตติศักดิ์", "วรรณวิสา", "เอกรัตน์", "ศศิธร"];
const LAST = ["วงศ์ตา", "ใจงาม", "แสนสุข", "คำมูล", "อินต๊ะ", "ธรรมชาติ", "บุญมา", "ศรีวิชัย", "ปัญญา", "มะลิวัลย์", "เขียวคำ", "ทองดี", "สมบูรณ์", "ดวงแก้ว", "กันทะวงค์", "นันตา", "จันทร์ตา", "ไชยวงศ์", "ตาคำ", "พรมมินทร์"];

const pad = (n: number, len: number) => String(n).padStart(len, "0");

function makeRespondents(): Respondent[] {
  const out: Respondent[] = [];
  const serial: Record<string, number> = { "act-ev": 0, "act-digital": 0, "act-openhouse": 0, "act-safety": 0 };
  const counts: Record<string, number> = { "act-ev": 38, "act-digital": 41, "act-openhouse": 263, "act-safety": 0 };
  let gid = 1;
  ACTIVITIES.forEach((act) => {
    const yearShort = act.issueDate.slice(2, 4);
    const n = counts[act.id];
    for (let i = 0; i < n; i++) {
      serial[act.id]++;
      const prefix = PREFIXES[gid % PREFIXES.length];
      const first = FIRST[(gid * 7) % FIRST.length];
      const last = LAST[(gid * 13) % LAST.length];
      const day = pad(((i * 3) % 28) + 1, 2);
      const month = act.issueDate.slice(5, 7);
      const ratingAvg = 3.4 + (gid % 16) / 10;
      out.push({
        id: "r" + gid,
        prefix, first, last,
        name: prefix + first + "  " + last,
        activityId: act.id,
        certNo: `LICEC ${yearShort}-${act.code.slice(-3)}/${pad(serial[act.id], 4)}`,
        dateISO: `25${yearShort}-${month}-${day}`,
        dateLabel: `${parseInt(day, 10)} ${THAI_MONTH[parseInt(month, 10) - 1]} 25${yearShort}`,
        avg: Math.min(5, ratingAvg).toFixed(2),
      });
      gid++;
    }
  });
  return out.reverse(); // newest first
}

export const RESPONDENTS: Respondent[] = makeRespondents();

/**
 * Branded short domain printed on certificates. In production this must be
 * routed (DNS + reverse proxy, or a redirect) to this app's own
 * /verify/[certNo] page — verifyPath()/verifyUrlFor() below are what that
 * route actually serves.
 */
export const VERIFY_HOST = "verify.licec.ac.th";

/** In-app path for a certificate's public verification page. */
export function verifyPath(certNo: string): string {
  return `/verify/${encodeURIComponent(certNo)}`;
}

/** Full printed/QR verification URL for a certificate. */
export function verifyUrlFor(certNo: string): string {
  return VERIFY_HOST + verifyPath(certNo);
}
