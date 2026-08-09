import { getSortedReviewsData } from "@/lib/posts";
import LogCard from "@/components/LogCard";
import TerminalConnect from "@/components/TerminalConnect";

export default function Home() {
  const reviews = getSortedReviewsData();

  return (
    <div className="content-width archive-page">
      <TerminalConnect />

      <header className="hero-header">
        <div className="hero-kicker">PERSONAL SECURITY ARCHIVE · 2026</div>
        <h1 className="hero-title"><span>凌澈的檔案庫</span></h1>
        <p className="hero-subtitle">在暗室中，用數據與直覺揭露隱藏的真相。</p>
      </header>

      <section aria-labelledby="archive-heading">
        <div className="archive-toolbar">
          <div id="archive-heading" className="archive-label">安全審計報告</div>
          <div className="archive-count">{String(reviews.length).padStart(2, "0")} · 條記錄</div>
        </div>
        <div className="vuln-list">
          {reviews.map((review) => (
            <LogCard key={review.slug} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}
