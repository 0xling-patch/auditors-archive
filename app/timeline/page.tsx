import Link from "next/link";
import { getSortedReviewsData } from "@/lib/posts";
import SeverityBadge from "@/components/SeverityBadge";
import { BilingualText } from "@/components/Bilingual";

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
  const allMonths: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    allMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const displayMonths = Array.from(new Set([...allMonths, ...months])).sort((a, b) => b.localeCompare(a));

  return (
    <div className="content-width">
      <header className="simple-page-header">
        <BilingualText en="TIMELINE" zh="時間線" className="simple-page-title" />
        <BilingualText en="Public reports arranged by month. Private records are hidden here." zh="公開報告按月份排列。私人記錄不在此顯示。" className="page-subtitle" />
      </header>

      <div className="timeline-stack">
        {displayMonths.map((month) => {
          const entries = grouped[month] || [];
          const [year, m] = month.split("-");
          return (
            <section key={month}>
              <div className="timeline-month">{year} / {m}</div>
              {entries.length === 0 ? (
                <BilingualText en="No public reports this month." zh="這個月沒有公開報告。" className="timeline-empty" />
              ) : (
                <div className="timeline-entries">
                  {entries.map((review) => (
                    <div key={review.slug} className="timeline-entry">
                      <span className="timeline-id">{review.vulnerability_id || "—"}</span>
                      <SeverityBadge severity={review.severity} />
                      <Link href={`/review/${review.slug}`} className="timeline-link">
                        <BilingualText en={review.titleEn} zh={review.title} />
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
