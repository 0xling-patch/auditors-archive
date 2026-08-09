import Link from "next/link";
import { getSortedReviewsData } from "@/lib/posts";
import LogCard from "@/components/LogCard";
import TerminalConnect from "@/components/TerminalConnect";
import { BilingualText } from "@/components/Bilingual";

export default function Home() {
  const reviews = getSortedReviewsData();
  const openReports = reviews.filter((review) => review.status === "OPEN").length;
  const latestDate = reviews[0]?.date
    ? new Date(reviews[0].date).toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" })
    : "—";
  const latestDateZh = reviews[0]?.date
    ? new Date(reviews[0].date).toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" })
    : "—";

  return (
    <div className="content-width archive-page">
      <TerminalConnect />

      <header className="hero-header">
        <div className="hero-copy">
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
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="hero-orbit-core">LC</span>
        </div>
      </header>

      <section className="archive-signal-bar" aria-label="Archive overview / 檔案庫概覽">
        <div className="signal-cell">
          <span className="signal-label">SIGNAL / 訊號</span>
          <BilingualText en="Archive online" zh="檔案庫在線" />
        </div>
        <div className="signal-cell">
          <span className="signal-label">OPEN / 開放</span>
          <BilingualText en={`${String(openReports).padStart(2, "0")} active reports`} zh={`${String(openReports).padStart(2, "0")} 份開放報告`} />
        </div>
        <div className="signal-cell">
          <span className="signal-label">LATEST / 最新</span>
          <BilingualText en={latestDate} zh={latestDateZh} />
        </div>
        <div className="signal-actions">
          <Link className="signal-link" href="/timeline">
            <BilingualText en="Trace the timeline" zh="查看時間線" />
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="archive-heading">
        <div className="archive-toolbar">
          <BilingualText
            en="SECURITY AUDIT REPORTS"
            zh="安全審計報告"
            className="archive-label"
            id="archive-heading"
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
