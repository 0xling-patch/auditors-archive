"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "INDEX" },
  { href: "/vulnerabilities", label: "VULNS" },
  { href: "/timeline", label: "TIMELINE" },
  { href: "/about", label: "ABOUT" },
  { href: "/pgp", label: "PGP" },
  { href: "/private", label: "[PRIVATE]" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        borderBottom: "0.5px solid #25252A",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 10,
        backgroundColor: "rgba(22,22,26,0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: "14px",
          letterSpacing: "1px",
          color: "#E8E4F0",
          fontWeight: 600,
        }}
      >
        AUDITOR&apos;S ARCHIVE
      </Link>

      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: "11px",
              letterSpacing: "0.8px",
              color:
                pathname === link.href
                  ? "#E8E4F0"
                  : link.label === "[PRIVATE]"
                  ? "#6B7280"
                  : "#C8C8CC",
              transition: "color 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              borderBottom:
                pathname === link.href
                  ? "0.5px solid #E8E4F0"
                  : "0.5px solid transparent",
              paddingBottom: "2px",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
