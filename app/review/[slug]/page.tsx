import { getAllReviewSlugs, getReviewData, getSortedReviewsData } from "@/lib/posts";
import { notFound } from "next/navigation";
import SeverityBadge from "@/components/SeverityBadge";
import ReviewContent from "@/components/ReviewContent";
import { BilingualText } from "@/components/Bilingual";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllReviewSlugs();
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const review = await getReviewData(params.slug);
    return {
      title: `${review.vulnerability_id ? `${review.vulnerability_id} — ` : ""}${review.titleEn} | AUDITOR'S ARCHIVE`,
      description: `${review.titleEn} / ${review.title}`,
      icons: { icon: "/favicon.png" },
    };
  } catch {
    return { title: "AUDITOR'S ARCHIVE", icons: { icon: "/favicon.png" } };
  }
}

const statusCopy: Record<string, { en: string; zh: string; className: string }> = {
  OPEN: { en: "OPEN", zh: "開放", className: "status-open" },
  RESOLVED: { en: "RESOLVED", zh: "已修復", className: "status-resolved" },
  WONTFIX: { en: "WONTFIX", zh: "不修復", className: "status-wontfix" },
  PRIVATE: { en: "PRIVATE", zh: "私人", className: "status-wontfix" },
  LOG: { en: "LOG", zh: "日誌", className: "status-wontfix" },
};

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
  const status = statusCopy[review.status] || statusCopy.LOG;
  const dateEn = new Date(review.date).toLocaleDateString("en-CA");
  const dateZh = new Date(review.date).toLocaleDateString("zh-TW");

  return (
    <div className="content-width review-shell">
      <Link href="/" className="back-link">
        <BilingualText en="← INDEX / ARCHIVE" zh="← 索引 / 檔案庫" />
      </Link>

      <section className="review-meta-card">
        <div className="review-meta-row">
          <SeverityBadge severity={review.severity} />
          <span className={status.className}>
            <BilingualText en={status.en} zh={status.zh} className="badge-bilingual" />
          </span>
          <BilingualText en={review.categoryEn} zh={review.category} className="card-category" />
        </div>

        <h1 className="review-title">
          <BilingualText en={review.titleEn} zh={review.title} />
        </h1>

        <div className="review-facts">
          {review.vulnerability_id && (
            <div className="review-fact">
              <BilingualText en="VULN ID" zh="漏洞編號" className="review-fact-label" />
              <span className="review-fact-value">{review.vulnerability_id}</span>
            </div>
          )}
          <div className="review-fact">
            <BilingualText en="DATE" zh="日期" className="review-fact-label" />
            <BilingualText en={dateEn} zh={dateZh} className="review-fact-value" />
          </div>
          {review.cwe && (
            <div className="review-fact">
              <BilingualText en="CWE" zh="CWE" className="review-fact-label" />
              <span className="review-fact-value">{review.cwe}</span>
            </div>
          )}
          {review.related_songyan_log && (
            <div className="review-fact">
              <BilingualText en="RELATED LOG" zh="相關日誌" className="review-fact-label" />
              <span className="review-fact-value">{review.related_songyan_log}</span>
            </div>
          )}
        </div>
      </section>

      <ReviewContent content={review.content || ""} contentEn={review.contentEn} />

      <section className="review-divider" aria-labelledby="changelog-title">
        <BilingualText id="changelog-title" en="CHANGELOG" zh="變更記錄" className="changelog-label" />
        <div className="changelog-list">
          <div className="changelog-row">
            <BilingualText en={dateEn} zh={dateZh} className="changelog-date" />
            <BilingualText en="First published" zh="初次發布" />
          </div>
          {review.status === "RESOLVED" && (
            <div className="changelog-row">
              <span className="changelog-date">—</span>
              <BilingualText en="Marked as RESOLVED" zh="已標記為 RESOLVED" className="status-resolved" />
            </div>
          )}
          <div className="changelog-row">
            <BilingualText en="[REDACTED]" zh="[已刪除]" className="changelog-date" />
            <BilingualText
              en="The original version used sharper wording. It was revised within two hours of publication."
              zh="原始版本包含更尖銳的措辭。已於發布後 2 小時內修改。"
              className="redacted"
            />
          </div>
        </div>
      </section>

      <nav className="review-divider review-navigation" aria-label="Adjacent reports / 相鄰報告">
        <div>
          {prevReview && (
            <Link href={`/review/${prevReview.slug}`}>
              <BilingualText en={`← ${prevReview.titleEn}`} zh={`← ${prevReview.title}`} />
            </Link>
          )}
        </div>
        <div>
          {nextReview && (
            <Link href={`/review/${nextReview.slug}`}>
              <BilingualText en={`${nextReview.titleEn} →`} zh={`${nextReview.title} →`} />
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
