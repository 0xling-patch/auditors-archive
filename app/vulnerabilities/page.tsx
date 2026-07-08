"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";

interface Review {
  slug: string;
  title: string;
  date: string;
  category: string;
  vulnerability_id?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "PRIVATE";
  status: "OPEN" | "RESOLVED" | "WONTFIX" | "PRIVATE" | "LOG";
  cwe?: string;
}

export default function VulnerabilitiesPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/reviews.json")
      .then((r) => r.json())
      .then((data) => setReviews(data))
      .catch(() => {
        // fallback: 嘗試靜態數據
      });
  }, []);

  const filtered = reviews.filter((r) => {
    if (r.severity === "PRIVATE") return false;
    if (r.status === "LOG") return false;
    if (filterSeverity !== "ALL" && r.severity !== filterSeverity) return false;
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    return true;
  });

  const statusClass: Record<string, string> = {
    OPEN: "status-open",
    RESOLVED: "status-resolved",
    WONTFIX: "status-wontfix",
  };

  return (
    <div className="content-width">
      <header style={{ marginBottom: "32px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "20px", letterSpacing: "1px", color: "#E8E4F0", marginBottom: "8px" }}>
          VULNERABILITY INDEX
        </h1>
        <p style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
          $ query --db auditors-archive --format table
        </p>
      </header>

      {/* 篩選器 */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px" }}>SEVERITY:</span>
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              style={{
                fontSize: "10px",
                letterSpacing: "0.5px",
                padding: "2px 8px",
                borderRadius: "2px",
                border: "0.5px solid",
                borderColor: filterSeverity === s ? "#E85D3F" : "#2A2A30",
                background: filterSeverity === s ? "rgba(232,93,63,0.1)" : "transparent",
                color: filterSeverity === s ? "#E85D3F" : "#6B7280",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px" }}>STATUS:</span>
          {["ALL", "OPEN", "RESOLVED", "WONTFIX"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                fontSize: "10px",
                letterSpacing: "0.5px",
                padding: "2px 8px",
                borderRadius: "2px",
                border: "0.5px solid",
                borderColor: filterStatus === s ? "#E85D3F" : "#2A2A30",
                background: filterStatus === s ? "rgba(232,93,63,0.1)" : "transparent",
                color: filterStatus === s ? "#E85D3F" : "#6B7280",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ fontFamily: "monospace" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>SEVERITY</th>
              <th>TITLE</th>
              <th>STATUS</th>
              <th>CWE</th>
              <th>DATE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#6B7280", padding: "32px" }}>
                  NO RESULTS FOUND
                </td>
              </tr>
            ) : (
              filtered.map((review) => (
                <tr key={review.slug}>
                  <td style={{ fontFamily: "monospace", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {review.vulnerability_id || "—"}
                  </td>
                  <td>
                    <SeverityBadge severity={review.severity} />
                  </td>
                  <td>
                    <Link href={`/review/${review.slug}`} style={{ color: "#C8C8CC", fontSize: "13px" }}>
                      {review.title}
                    </Link>
                  </td>
                  <td>
                    <span className={statusClass[review.status] || "status-wontfix"} style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                      {review.status}
                    </span>
                  </td>
                  <td style={{ fontSize: "12px", color: "#6B7280", fontFamily: "monospace" }}>
                    {review.cwe || "—"}
                  </td>
                  <td style={{ fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {new Date(review.date).toLocaleDateString("zh-TW")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "16px", letterSpacing: "0.3px" }}>
          {filtered.length} result(s) returned.
        </p>
      )}
    </div>
  );
}
