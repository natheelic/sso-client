"use client";

/**
 * Client-side certificate export — renders the certificate DOM to a PNG via
 * html-to-image, then either downloads it directly or wraps it in a PDF via
 * jsPDF. No server round-trip: the certificate is already fully rendered in
 * the browser, so there's nothing a server-side render would add here.
 */
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

export function useCertificateExport() {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"" | "pdf" | "png">("");

  async function capture(): Promise<string> {
    if (!ref.current) throw new Error("Certificate element not mounted");
    return toPng(ref.current, { pixelRatio: 2, width: 1000, height: 707, backgroundColor: "#ffffff" });
  }

  async function downloadPdf(filename: string) {
    setBusy("pdf");
    try {
      const dataUrl = await capture();
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1000, 707] });
      pdf.addImage(dataUrl, "PNG", 0, 0, 1000, 707);
      pdf.save(filename);
    } finally {
      setBusy("");
    }
  }

  async function downloadPng(filename: string) {
    setBusy("png");
    try {
      const dataUrl = await capture();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setBusy("");
    }
  }

  return { ref, busy, downloadPdf, downloadPng };
}
