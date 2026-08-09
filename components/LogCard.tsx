import Link from "next/link";
import { ReviewData } from "@/lib/posts";
import SeverityBadge from "./SeverityBadge";

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
    <span className={statusMap[status] || "status-wontfix"} style={{ fontSize: "10px", letterSpacing: "0.7px" }}>
      {status}
    </span>
  );
}

export default function LogCard({ review }: LogCardProps) {
  const isPrivate = review.severity === "PRIVATE";
  const isAiDiary = review.ai_diary;

  return (
    <Link href={`/review/${review.slug}`} aria-label={`閱讀：${review.title}`}>
      <article className="vuln-card">
        <div className="card-meta">
          {review.vulnerability_id && !isPrivate && <span className="card-id">{review.vulnerability_id}</span>}
          <SeverityBadge severity={review.severity} />
          <StatusBadge status={review.status} />
          <span className="card-category">{review.category}</span>
          {isAiDiary && <span className="card-category">AI LOG</span>}
        </div>

        <h2 className="card-title">{review.title}</h2>

        <div className="card-footer">
          <span className="card-date">
            {new Date(review.date).toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
          <span className="card-arrow" aria-hidden="true">↗</span>
        </div>
      </article>
    </Link>
  );
}
