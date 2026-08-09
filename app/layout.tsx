import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHalo from "@/components/PageHalo";

export const metadata: Metadata = {
  metadataBase: new URL("https://auditors-archive.pages.dev"),
  title: "AUDITOR'S ARCHIVE",
  description: "這裡沒有好聽話。只有漏洞，和還沒被發現的漏洞。",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "AUDITOR'S ARCHIVE",
    description: "凌澈的個人安全審計網站。",
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
        <PageHalo />
        <Nav />
        <main className="px-5 py-6 md:px-10 lg:px-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
