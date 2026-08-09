"use client";

import { useState } from "react";
import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";
import { BilingualText } from "@/components/Bilingual";
import type { ReviewData } from "@/lib/posts";

const statusCopy: Record<string, { en: string; zh: string }> = {
  ALL: { en: "ALL", zh: "全部" },
  OPEN: { en: "OPEN", zh: "開放" },
  RESOLVED: { en: "RESOLVED", zh: "已修復" },
  WONTFIX: { en: "WONTFIX", zh: "不修復" },
};

const severityCopy: Record<string, string> = {
  ALL: "全部",
  CRITICAL: "嚴重",
  HIGH: "高風險",
  MEDIUM: "中風險",
  LOW: "低風險",
};

interface VulnerabilitiesTableProps {
  reviews: ReviewData[];
}

export default function VulnerabilitiesTable({ reviews }: VulnerabilitiesTableProps) {
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = reviews.filter((review) => {
    if (review.severity === "PRIVATE" || review.status === "LOG") return false;
    if (filterSeverity !== "ALL" && review.severity !== filterSeverity) return false;
    if (filterStatus !== "ALL" && review.status !== filterStatus) return false;
    return true;
  });

  const filterButtonStyle = (selected: boolean) => ({
    fontSize: "10px",
    letterSpacing: "0.5px",
    padding: "2px 8px",
    borderRadius: "2px",
    border: "0.5px solid",
    borderColor: selected ? "#E85D3F" : "#2A2A30",
    background: selected ? "rgba(232,93,63,0.1)" : "transparent",
    color: selected ? "#E85D3F" : "#6B7280",
    cursor: "pointer",
    fontFamily: "inherit",
  });

  const statusClass: Record<string, string> = {
    OPEN: "status-open",
    RESOLVED: "status-resolved",
    WONTFIX: "status-wontfix",
  };

  return (
    <>
      <div className="bilingual-filter-row">
        <div className="bilingual-filter-group">
          <BilingualText en="SEVERITY:" zh="嚴重度：" className="filter-label" />
          {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((severity) => (
            <button key={severity} onClick={() => setFilterSeverity(severity)} style={filterButtonStyle(filterSeverity === severity)}>
              <BilingualText en={severity} zh={severityCopy[severity]} />
            </button>
          ))}
        </div>

        <div className="bilingual-filter-group">
          <BilingualText en="STATUS:" zh="狀態：" className="filter-label" />
          {["ALL", "OPEN", "RESOLVED", "WONTFIX"].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} style={filterButtonStyle(filterStatus === status)}>
              <BilingualText en={status} zh={statusCopy[status].zh} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ fontFamily: "monospace" }}>
          <thead>
            <tr>
              <th><BilingualText en="ID" zh="編號" /></th>
              <th><BilingualText en="SEVERITY" zh="嚴重度" /></th>
              <th><BilingualText en="TITLE" zh="標題" /></th>
              <th><BilingualText en="STATUS" zh="狀態" /></th>
              <th><BilingualText en="CWE" zh="CWE" /></th>
              <th><BilingualText en="DATE" zh="日期" /></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#6B7280", padding: "32px" }}>
                  <BilingualText en="NO RESULTS FOUND" zh="找不到結果" />
                </td>
              </tr>
            ) : filtered.map((review) => (
              <tr key={review.slug}>
                <td style={{ fontFamily: "monospace", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{review.vulnerability_id || "—"}</td>
                <td><SeverityBadge severity={review.severity} /></td>
                <td>
                  <Link href={`/review/${review.slug}`} style={{ color: "#C8C8CC", fontSize: "13px" }}>
                    <BilingualText en={review.titleEn || review.title} zh={review.title} />
                  </Link>
                </td>
                <td>
                  <span className={statusClass[review.status] || "status-wontfix"} style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
                    <BilingualText en={review.status} zh={statusCopy[review.status]?.zh || review.status} className="badge-bilingual" />
                  </span>
                </td>
                <td style={{ fontSize: "12px", color: "#6B7280", fontFamily: "monospace" }}>{review.cwe || "—"}</td>
                <td style={{ fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                  <BilingualText en={new Date(review.date).toLocaleDateString("en-CA")} zh={new Date(review.date).toLocaleDateString("zh-TW")} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BilingualText en={`${filtered.length} result(s) returned.`} zh={`返回 ${filtered.length} 筆結果。`} className="result-count" />
    </>
  );
}
