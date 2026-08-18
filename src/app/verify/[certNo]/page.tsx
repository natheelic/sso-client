import Link from "next/link";
import { getCertificateByCertNo } from "@/lib/submissions-db";
import { VerifyCertificate } from "@/components/survey/verify-certificate";
import { Card, Empty } from "@/components/survey/ui";
import { LogoLockup } from "@/components/survey/emblem";
import { ThemeToggle } from "@/components/theme-toggle";

/** Public certificate verification — anyone with a certificate number (printed or from its QR) can look it up, no login required. */
export default async function VerifyPage({ params }: { params: Promise<{ certNo: string }> }) {
  const { certNo: rawCertNo } = await params;
  const certNo = decodeURIComponent(rawCertNo);
  const cert = await getCertificateByCertNo(certNo);

  return (
    <div style={{ minHeight: "100vh" }}>
      <header
        style={{
          position: "sticky", top: 0, zIndex: 30, height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 clamp(16px, 5vw, 48px)", background: "var(--header-bg)",
          backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <LogoLockup size={36} />
        </Link>
        <ThemeToggle />
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(24px,4vw,40px) clamp(16px,5vw,24px) 90px" }}>
        {cert ? (
          <VerifyCertificate cert={cert} />
        ) : (
          <Card>
            <Empty
              icon="search-x"
              title="ไม่พบเกียรติบัตรนี้ในระบบ"
              hint={`ไม่พบข้อมูลของเลขที่ "${certNo}" กรุณาตรวจสอบเลขที่เกียรติบัตรอีกครั้ง`}
            />
          </Card>
        )}
      </main>
    </div>
  );
}
