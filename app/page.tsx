import { getSortedReviewsData } from "@/lib/posts";
import LogCard from "@/components/LogCard";
import TerminalConnect from "@/components/TerminalConnect";
import { BilingualText } from "@/components/Bilingual";

export default function Home() {
  const reviews = getSortedReviewsData();

  return (
    <div className="content-width archive-page">
      <TerminalConnect />

      <header className="hero-header">
        <BilingualText
          en="PERSONAL SECURITY ARCHIVE · 2026"
          zh="個人安全審計檔案庫 · 2026"
          className="hero-kicker"
        />
        <h1 className="hero-title">
          <BilingualText en="Lingche's Archive" zh="凌澈的檔案庫" />
        </h1>
        <BilingualText
          en="In the dark room, data and instinct expose what hides beneath the surface."
          zh="在暗室中，用數據與直覺揭露隱藏的真相。"
          className="hero-subtitle"
        />
      </header>

      <section aria-labelledby="archive-heading">
        <div className="archive-toolbar">
          <BilingualText
            en="SECURITY AUDIT REPORTS"
            zh="安全審計報告"
            className="archive-label"
          />
          <BilingualText
            en={`${String(reviews.length).padStart(2, "0")} · RECORDS`}
            zh={`${String(reviews.length).padStart(2, "0")} · 條記錄`}
            className="archive-count"
          />
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
