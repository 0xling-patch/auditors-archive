import { getAllReviewSlugs, getReviewData } from "@/lib/posts";
import { notFound } from "next/navigation";
import SeverityBadge from "@/components/SeverityBadge";
import ReviewContent from "@/components/ReviewContent";
import Link from "next/link";
import { getSortedReviewsData } from "@/lib/posts";

export async function generateStaticParams() {
  const slugs = getAllReviewSlugs();
  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const review = await getReviewData(params.slug);
    const titleStr = typeof review.title === "object" ? review.title.zh : review.title;
    return {
      title: `${review.vulnerability_id ? review.vulnerability_id + " — " : ""}${titleStr} | AUDITOR'S ARCHIVE`,
    };
  } catch {
    return { title: "AUDITOR'S ARCHIVE" };
  }
}

function getTitleString(title: string | { zh: string; en: string }): string {
  return typeof title === "object" ? title.zh : title;
}

export default async function ReviewPage({
  params,
}: {
  params: { slug: string };
}) {
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
    <div className="content-width">
      <div style={{ paddingTop: "32px" }}>
        {/* 頂部返回 */}
        <Link
          href="/"
          style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px", display: "inline-block", marginBottom: "32px" }}
        >
          ← INDEX
        </Link>

        {/* 頂部後設資料區 */}
        <div
          style={{
            border: "0.5px solid #2A2A30",
            borderRadius: "2px",
            padding: "20px",
            marginBottom: "32px",
            backgroundColor: "#141414",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <SeverityBadge severity={review.severity} />
            <span className={statusClass[review.status] || "status-wontfix"} style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
              {review.status}
            </span>
            <span style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.3px" }}>
              {review.category}
            </span>
          </div>

          <h1 style={{ fontSize: "22px", letterSpacing: "0.5px", color: "#E8E4F0", marginBottom: "16px" }}>
            {getTitleString(review.title)}
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
            {review.vulnerability_id && (
              <div>
                <span style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>
                  VULN ID
                </span>
                <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#C8C8CC" }}>
                  {review.vulnerability_id}
                </span>
              </div>
            )}

            <div>
              <span style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>
                DATE
              </span>
              <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#C8C8CC" }}>
                {new Date(review.date).toLocaleDateString("zh-TW")}
              </span>
            </div>

            {review.cwe && (
              <div>
                <span style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>
                  CWE
                </span>
                <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#C8C8CC" }}>
                  {review.cwe}
                </span>
              </div>
            )}

            {review.related_songyan_log && (
              <div>
                <span style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "2px" }}>
                  RELATED LOG
                </span>
                <span style={{ fontSize: "13px", color: "#C8C8CC" }}>
                  {review.related_songyan_log}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 報告內文（含垂直線滾動效果） */}
        <ReviewContent content={review.content || ""} />

        {/* 更新記錄 */}
        <div style={{ marginTop: "48px", borderTop: "0.5px solid #25252A", paddingTop: "24px" }}>
          <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.8px", marginBottom: "16px" }}>
            CHANGELOG
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
              <span style={{ color: "#6B7280", fontFamily: "monospace", minWidth: "100px" }}>
                {new Date(review.date).toLocaleDateString("zh-TW")}
              </span>
              <span style={{ color: "#C8C8CC" }}>初次發布</span>
            </div>
            {review.status === "RESOLVED" && (
              <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                <span style={{ color: "#6B7280", fontFamily: "monospace", minWidth: "100px" }}>
                  —
                </span>
                <span className="status-resolved">已標記為 RESOLVED</span>
              </div>
            )}
            {/* 刻意保留的「已刪除」痕跡 */}
            <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
              <span style={{ color: "#6B7280", fontFamily: "monospace", minWidth: "100px" }}>
                [已刪除]
              </span>
              <span className="redacted">
                原始版本包含更尖銳的措辭。已於發布後 2 小時內修改。
              </span>
            </div>
          </div>
        </div>

        {/* 上一篇 / 下一篇 */}
        <div
          style={{
            marginTop: "48px",
            borderTop: "0.5px solid #25252A",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            {prevReview && (
              <Link href={`/review/${prevReview.slug}`} style={{ fontSize: "12px", color: "#6B7280" }}>
                ← {getTitleString(prevReview.title)}
              </Link>
            )}
          </div>
          <div>
            {nextReview && (
              <Link href={`/review/${nextReview.slug}`} style={{ fontSize: "12px", color: "#6B7280", textAlign: "right", display: "block" }}>
                {getTitleString(nextReview.title)} →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
