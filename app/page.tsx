import { getSortedReviewsData } from "@/lib/posts";
import LogCard from "@/components/LogCard";
import TerminalConnect from "@/components/TerminalConnect";

export default function Home() {
  const reviews = getSortedReviewsData();

  return (
    <div className="content-width">
      <TerminalConnect />

      <header style={{ marginBottom: "48px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "28px", letterSpacing: "2px", color: "#E8E4F0", marginBottom: "12px" }}>
          AUDITOR&apos;S ARCHIVE
        </h1>
        <p style={{ fontSize: "13px", letterSpacing: "0.5px", color: "#6B7280", borderLeft: "1px solid #2A1F2E", paddingLeft: "12px" }}>
          這裡沒有好聽話。只有漏洞，和還沒被發現的漏洞。
        </p>
      </header>

      <hr />

      <section>
        <div style={{ fontSize: "11px", letterSpacing: "0.8px", color: "#6B7280", marginBottom: "20px", textTransform: "uppercase" }}>
          SECURITY BULLETINS — {reviews.length} ENTRIES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {reviews.map((review) => (
            <LogCard key={review.slug} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}
