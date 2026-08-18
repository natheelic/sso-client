"use server";

/**
 * Certificate email delivery via Resend. Requires RESEND_API_KEY in
 * .env.local — without it this throws a clear error rather than silently
 * doing nothing, so the "resend" button's failure state is honest about
 * why (see the Resend dashboard/docs to get a key: https://resend.com).
 */
import { Resend } from "resend";
import { db } from "@/lib/db";
import { getCollegeSettings } from "@/lib/college-db";
import { thaiLongDate, verifyUrlFor } from "@/lib/survey-data";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set in .env.local");
  return new Resend(key);
}

/** Re-sends a participant's certificate email by certificate number (admin action). */
export async function resendCertificateEmail(certNo: string): Promise<void> {
  const [cert, college] = await Promise.all([
    db.certificateRecord.findUnique({ where: { certNo }, include: { activity: true } }),
    getCollegeSettings(),
  ]);
  if (!cert) throw new Error("ไม่พบเกียรติบัตรนี้");

  const submission = await db.submission.findUnique({
    where: { activityId_userId: { activityId: cert.activityId, userId: cert.userId } },
    select: { userEmail: true },
  });
  const to = submission?.userEmail;
  if (!to) throw new Error("ไม่พบอีเมลของผู้รับเกียรติบัตรนี้ในระบบ");

  const verifyUrl = `https://${verifyUrlFor(cert.certNo)}`;
  const resend = getResend();
  const from = process.env.RESEND_FROM_EMAIL || "certificates@resend.dev";

  const { error } = await resend.emails.send({
    from: `${college.name} <${from}>`,
    to,
    subject: `เกียรติบัตร: ${cert.activity.title}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <h2 style="margin: 0 0 4px;">${college.name}</h2>
        <p style="color: #666; margin: 0 0 24px;">${college.affiliation}</p>
        <p>เรียน คุณ${cert.recipientName}</p>
        <p>ท่านได้รับเกียรติบัตรสำหรับการเข้าร่วม <strong>${cert.activity.title}</strong></p>
        <p>เลขที่เกียรติบัตร: <strong>${cert.certNo}</strong><br/>วันที่ออก: ${thaiLongDate(cert.issueDate)}</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: #1d2b4f; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
            ดูและดาวน์โหลดเกียรติบัตร
          </a>
        </p>
        <p style="color: #999; font-size: 12px;">หรือคัดลอกลิงก์: ${verifyUrl}</p>
      </div>
    `,
  });

  if (error) throw new Error(error.message || "ส่งอีเมลไม่สำเร็จ");
}
