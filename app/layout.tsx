import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHalo from "@/components/PageHalo";
import ReadingProgress from "@/components/ReadingProgress";
import { TimeOfDayTheme } from "@/components/TimeOfDay";
import { LanguageProvider, TranslationStatusNotice } from "@/components/Bilingual";

export const metadata: Metadata = {
  metadataBase: new URL("https://auditors-archive.pages.dev"),
  title: "AUDITOR'S ARCHIVE",
  description: "No soft words. Only vulnerabilities—and the vulnerabilities not yet found. 沒有好聽話，只有漏洞，和還沒被發現的漏洞。",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "AUDITOR'S ARCHIVE",
    description: "Lingche's personal security audit archive. 凌澈的個人安全審計檔案庫。",
    type: "website",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Auditor's Archive" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="dark">
      <body>
        <LanguageProvider>
          <TimeOfDayTheme />
          <PageHalo />
          <Nav />
          <ReadingProgress />
          <TranslationStatusNotice />
          <main className="px-5 py-6 md:px-10 lg:px-20">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
