import Link from "next/link";
import { ReviewData } from "@/lib/posts";
import SeverityBadge from "./SeverityBadge";
import { BilingualText } from "./Bilingual";

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
  const statusText: Record<string, { en: string; zh: string }> = {
    OPEN: { en: "OPEN", zh: "開放" },
    RESOLVED: { en: "RESOLVED", zh: "已修復" },
    WONTFIX: { en: "WONTFIX", zh: "不修復" },
    PRIVATE: { en: "PRIVATE", zh: "私人" },
    LOG: { en: "LOG", zh: "日誌" },
  };
  const copy = statusText[status] || statusText.LOG;

  return (
    <span className={statusMap[status] || "status-wontfix"}>
      <BilingualText en={copy.en} zh={copy.zh} className="badge-bilingual" />
    </span>
  );
}

export default function LogCard({ review }: LogCardProps) {
  const isPrivate = review.severity === "PRIVATE";
  const isAiDiary = review.ai_diary;
  const date = new Date(review.date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateZh = new Date(review.date).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <Link href={`/review/${review.slug}`} aria-label={`Read: ${review.titleEn} / 閱讀：${review.title}`}>
      <article className="vuln-card" data-severity={review.severity.toLowerCase()}>
        <div className="card-meta">
          {review.vulnerability_id && !isPrivate && <span className="card-id">{review.vulnerability_id}</span>}
          <SeverityBadge severity={review.severity} />
          <StatusBadge status={review.status} />
          <BilingualText en={review.categoryEn} zh={review.category} className="card-category" />
          {isAiDiary && <BilingualText en="AI DIARY" zh="AI 日記" className="card-category" />}
        </div>

        <h2 className="card-title">
          <BilingualText en={review.titleEn} zh={review.title} />
        </h2>

        <div className="card-footer">
          <BilingualText en={date} zh={dateZh} className="card-date" />
          <span className="card-arrow" aria-hidden="true"><small>OPEN FILE</small>↗</span>
        </div>
      </article>
    </Link>
  );
}
