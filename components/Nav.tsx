"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "INDEX" },
  { href: "/vulnerabilities", label: "VULNS" },
  { href: "/timeline", label: "TIMELINE" },
  { href: "/about", label: "ABOUT" },
  { href: "/pgp", label: "PGP" },
  { href: "/private", label: "[PRIVATE]", private: true },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="主要導覽">
      <Link href="/" className="nav-brand">
        AUDITOR&apos;S ARCHIVE
      </Link>

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
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
