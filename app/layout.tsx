import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageHalo from "@/components/PageHalo";

export const metadata: Metadata = {
  title: "AUDITOR'S ARCHIVE",
  description: "這裡沒有好聽話。只有漏洞，和還沒被發現的漏洞。",
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
        <main className="px-6 py-8 md:px-12 lg:px-24">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
