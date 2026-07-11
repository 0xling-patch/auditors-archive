import { getSortedReviewsData } from "@/lib/posts";
import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";

function getTitleString(title: string | { zh: string; en: string }): string {
  return typeof title === "object" ? title.zh : title;
}

function groupByMonth(reviews: ReturnType<typeof getSortedReviewsData>) {
  const groups: Record<string, typeof reviews> = {};

  reviews.forEach((review) => {
    if (review.severity === "PRIVATE" || review.ai_diary) return;
    const date = new Date(review.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(review);
  });

  return groups;
}

export default function TimelinePage() {
  const reviews = getSortedReviewsData();
  const grouped = groupByMonth(reviews);

  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // 生成過去6個月的月份列表（包含空白月份）
  const allMonths: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    allMonths.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }

  const displayMonths = Array.from(
    new Set([...allMonths, ...months])
  ).sort((a, b) => b.localeCompare(a));

  return (
    <div className="content-width">
      <header style={{ marginBottom: "32px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "20px", letterSpacing: "1px", color: "#E8E4F0", marginBottom: "8px" }}>
          TIMELINE
        </h1>
        <p style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
          公開報告按月份排列。私人記錄不在此顯示。
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {displayMonths.map((month) => {
          const entries = grouped[month] || [];
          const [year, m] = month.split("-");
          const monthLabel = `${year} / ${m}`;

          return (
            <section key={month}>
              <div className="timeline-month">{monthLabel}</div>

              {entries.length === 0 ? (
                <p className="timeline-empty">這個月沒有公開報告。</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {entries.map((review) => (
                    <div
                      key={review.slug}
                      style={{ display: "flex", alignItems: "center", gap: "12px" }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#6B7280",
                          fontFamily: "monospace",
                          minWidth: "100px",
                        }}
                      >
                        {review.vulnerability_id || "—"}
                      </span>

                      <SeverityBadge severity={review.severity} />

                      <Link
                        href={`/review/${review.slug}`}
                        style={{ fontSize: "13px", color: "#C8C8CC" }}
                      >
                        {getTitleString(review.title)}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
