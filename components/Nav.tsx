"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BilingualText, LanguageSwitcher } from "./Bilingual";

const navLinks = [
  { href: "/", en: "INDEX", zh: "索引" },
  { href: "/vulnerabilities", en: "VULNS", zh: "漏洞" },
  { href: "/timeline", en: "TIMELINE", zh: "時間線" },
  { href: "/updates", en: "UPDATES", zh: "動態" },
  { href: "/about", en: "ABOUT", zh: "關於" },
  { href: "/pgp", en: "PGP", zh: "公鑰" },
  { href: "/private", en: "[PRIVATE]", zh: "[私人]", private: true },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="Primary navigation / 主要導覽">
      <Link href="/" className="nav-brand">
        <BilingualText en="AUDITOR&apos;S ARCHIVE" zh="凌澈的檔案庫" />
      </Link>

      <div className="nav-actions">
        <div className="nav-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${link.private ? "nav-private" : ""} ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <BilingualText en={link.en} zh={link.zh} />
              </Link>
            );
          })}
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}
