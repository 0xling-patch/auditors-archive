import { getAllReviewSlugs, getReviewData, getSortedReviewsData } from "@/lib/posts";
import { notFound } from "next/navigation";
import SeverityBadge from "@/components/SeverityBadge";
import ReviewContent from "@/components/ReviewContent";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllReviewSlugs();
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const review = await getReviewData(params.slug);
    return {
      title: `${review.vulnerability_id ? `${review.vulnerability_id} — ` : ""}${review.title} | AUDITOR'S ARCHIVE`,
      icons: { icon: "/favicon.png" },
    };
  } catch {
    return { title: "AUDITOR'S ARCHIVE", icons: { icon: "/favicon.png" } };
  }
}

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  let review;
  try {
    review = await getReviewData(params.slug);
  } catch {
    notFound();
  }

  const allReviews = getSortedReviewsData();
  const currentIndex = allReviews.findIndex((r) => r.slug === params.slug);
  const prevReview = currentIndex < allReviews.length - 1 ? allReviews[currentIndex + 1] : null;
  const nextReview = currentIndex > 0 ? allReviews[currentIndex - 1] : null;

  const statusClass: Record<string, string> = {
    OPEN: "status-open",
    RESOLVED: "status-resolved",
    WONTFIX: "status-wontfix",
    PRIVATE: "status-wontfix",
    LOG: "status-wontfix",
  };

  return (
    <div className="content-width review-shell">
      <Link href="/" className="back-link">← INDEX / ARCHIVE</Link>

      <section className="review-meta-card">
        <div className="review-meta-row">
          <SeverityBadge severity={review.severity} />
          <span className={statusClass[review.status] || "status-wontfix"} style={{ fontSize: "10px", letterSpacing: "0.7px" }}>
            {review.status}
          </span>
          <span className="card-category">{review.category}</span>
        </div>

        <h1 className="review-title">{review.title}</h1>

        <div className="review-facts">
          {review.vulnerability_id && (
            <div className="review-fact">
              <span className="review-fact-label">VULN ID</span>
              <span className="review-fact-value">{review.vulnerability_id}</span>
            </div>
          )}
          <div className="review-fact">
            <span className="review-fact-label">DATE</span>
            <span className="review-fact-value">{new Date(review.date).toLocaleDateString("zh-TW")}</span>
          </div>
          {review.cwe && (
            <div className="review-fact">
              <span className="review-fact-label">CWE</span>
              <span className="review-fact-value">{review.cwe}</span>
            </div>
          )}
          {review.related_songyan_log && (
            <div className="review-fact">
              <span className="review-fact-label">RELATED LOG</span>
              <span className="review-fact-value">{review.related_songyan_log}</span>
            </div>
          )}
        </div>
      </section>

      <ReviewContent content={review.content || ""} />

      <section className="review-divider" aria-labelledby="changelog-title">
        <div id="changelog-title" className="changelog-label">CHANGELOG</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="changelog-row">
            <span className="changelog-date">{new Date(review.date).toLocaleDateString("zh-TW")}</span>
            <span>初次發布</span>
          </div>
          {review.status === "RESOLVED" && (
            <div className="changelog-row">
              <span className="changelog-date">—</span>
              <span className="status-resolved">已標記為 RESOLVED</span>
            </div>
          )}
          <div className="changelog-row">
            <span className="changelog-date">[已刪除]</span>
            <span className="redacted">原始版本包含更尖銳的措辭。已於發布後 2 小時內修改。</span>
          </div>
        </div>
      </section>

      <nav className="review-divider review-navigation" aria-label="相鄰報告">
        <div>{prevReview && <Link href={`/review/${prevReview.slug}`}>← {prevReview.title}</Link>}</div>
        <div>{nextReview && <Link href={`/review/${nextReview.slug}`}>{nextReview.title} →</Link>}</div>
      </nav>
    </div>
  );
}
