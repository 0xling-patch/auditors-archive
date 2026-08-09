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
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
            <button
              key={severity}
              type="button"
              className={`filter-chip ${filterSeverity === severity ? "active" : ""}`}
              onClick={() => setFilterSeverity(severity)}
              aria-pressed={filterSeverity === severity}
            >
              <BilingualText en={severity} zh={severityCopy[severity]} />
            </button>
          ))}
        </div>

        <div className="bilingual-filter-group">
          <BilingualText en="STATUS:" zh="狀態：" className="filter-label" />
          {['ALL', 'OPEN', 'RESOLVED', 'WONTFIX'].map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-chip ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
              aria-pressed={filterStatus === status}
            >
              <BilingualText en={status} zh={statusCopy[status].zh} />
            </button>
          ))}
        </div>
      </div>

      <div className="table-shell">
        <table className="archive-table">
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
                <td colSpan={6} className="table-empty">
                  <BilingualText en="NO RESULTS FOUND" zh="找不到結果" />
                </td>
              </tr>
            ) : filtered.map((review) => (
              <tr key={review.slug}>
                <td className="table-id">{review.vulnerability_id || "—"}</td>
                <td><SeverityBadge severity={review.severity} /></td>
                <td>
                  <Link href={`/review/${review.slug}`} className="table-title-link">
                    <BilingualText en={review.titleEn || review.title} zh={review.title} />
                  </Link>
                </td>
                <td>
                  <span className={`table-status ${statusClass[review.status] || "status-wontfix"}`}>
                    <BilingualText en={review.status} zh={statusCopy[review.status]?.zh || review.status} className="badge-bilingual" />
                  </span>
                </td>
                <td className="table-cwe">{review.cwe || "—"}</td>
                <td className="table-date">
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
