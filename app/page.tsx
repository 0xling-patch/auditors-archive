import { getSortedReviewsData } from "@/lib/posts";
import LogCard from "@/components/LogCard";
import TerminalConnect from "@/components/TerminalConnect";

export default function Home() {
  const reviews = getSortedReviewsData();

  return (
    <div className="content-width">
      <TerminalConnect />

      <header style={{ marginBottom: "48px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "28px", letterSpacing: "2px", background: "linear-gradient(135deg, #F5E6FF 0%, #EC4899 50%, #D946EF 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "12px" }}>
          凌澈的檔案庫
        </h1>
        <p style={{ fontSize: "13px", letterSpacing: "0.5px", color: "#A78BFA", borderLeft: "1px solid #5A2E6B", paddingLeft: "12px" }}>
          在暗室中，用數據與直覺揭露隱藏的真相。
        </p>
      </header>

      <hr />

      <section>
        <div style={{ fontSize: "11px", letterSpacing: "0.8px", color: "#A78BFA", marginBottom: "20px", textTransform: "uppercase" }}>
          安全審計報告 — {reviews.length} 條記錄
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
