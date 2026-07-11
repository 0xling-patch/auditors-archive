"use client";

import Link from "next/link";
import { ReviewData } from "@/lib/posts";
import SeverityBadge from "./SeverityBadge";
import { useLanguage } from "./LanguageProvider";

interface LogCardProps {
  review: ReviewData;
}

function StatusBadge({ status }: { status: ReviewData["status"] }) {
  const statusMap: Record<string, string> = {
    OPEN: "status-open",
    RESOLVED: "status-resolved",
    WONTFIX: "status-wontfix",
    PRIVATE: "status-wontfix",
    LOG: "status-wontfix",
  };

  return (
    <span
      className={statusMap[status] || "status-wontfix"}
      style={{ fontSize: "11px", letterSpacing: "0.5px" }}
    >
      {status}
    </span>
  );
}

export default function LogCard({ review }: LogCardProps) {
  const { language } = useLanguage();
  const isPrivate = review.severity === "PRIVATE";
  const isAiDiary = review.ai_diary;

  // 獲取標題（支援雙語或單語）
  const getTitle = () => {
    if (typeof review.title === "object" && review.title !== null) {
      return language === "zh" ? review.title.zh : review.title.en;
    }
    return review.title as string;
  };

  // 獲取次語言標題
  const getSecondaryTitle = () => {
    if (typeof review.title === "object" && review.title !== null) {
      return language === "zh" ? review.title.en : review.title.zh;
    }
    return null;
  };

  const title = getTitle();
  const secondaryTitle = getSecondaryTitle();

  return (
    <Link href={`/review/${review.slug}`} style={{ display: "block" }}>
      <article className="vuln-card" style={{ padding: "16px 20px" }}>
        {/* 頂部 meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          {review.vulnerability_id && !isPrivate && (
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "0.5px",
                color: "#6B7280",
                fontFamily: "monospace",
              }}
            >
              {review.vulnerability_id}
            </span>
          )}

          <SeverityBadge severity={review.severity} />

          <StatusBadge status={review.status} />

          <span
            style={{
              fontSize: "11px",
              color: "#6B7280",
              letterSpacing: "0.3px",
            }}
          >
            {review.category}
          </span>

          {isAiDiary && (
            <span
              style={{
                fontSize: "10px",
                color: "#6B7280",
                border: "0.5px solid #2A2A30",
                padding: "1px 4px",
                borderRadius: "2px",
              }}
            >
              AI LOG
            </span>
          )}
        </div>

        {/* 主語言標題 */}
        <h2
          style={{
            fontSize: "15px",
            letterSpacing: "0.3px",
            color: "#C8C8CC",
            marginBottom: "4px",
            fontWeight: 500,
          }}
        >
          {title}
        </h2>

        {/* 次語言標題 */}
        {secondaryTitle && (
          <p
            style={{
              fontSize: "12px",
              letterSpacing: "0.2px",
              color: "#8B8B8F",
              marginBottom: "8px",
              opacity: 0.7,
            }}
          >
            {secondaryTitle}
          </p>
        )}

        {/* 底部日期 */}
        <div
          style={{
            fontSize: "11px",
            color: "#6B7280",
            letterSpacing: "0.3px",
          }}
        >
          {new Date(review.date).toLocaleDateString(language === "zh" ? "zh-TW" : "en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </div>
      </article>
    </Link>
  );
}
