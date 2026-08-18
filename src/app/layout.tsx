import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/survey/toast";

export const metadata: Metadata = {
  title: "ระบบแบบสอบถาม & เกียรติบัตร — วิทยาลัยการอาชีพลอง",
  description: "ระบบตอบแบบสอบถามและออกเกียรติบัตรอิเล็กทรอนิกส์ ป้องกันด้วย SSO กลางของวิทยาลัย",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Don't disable user zoom — keep pinch-to-zoom for accessibility.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&family=Noto+Serif+Thai:wght@400;500;600;700&family=Sarabun:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Google+Sans+Text:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')})()`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
