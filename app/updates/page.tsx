import type { Metadata } from "next";
import { BilingualText } from "@/components/Bilingual";
import { getSortedUpdates } from "@/lib/updates";

export const metadata: Metadata = {
  title: "Latest Updates | Auditor's Archive",
  description: "A chronological visual field log from Lingche's archive.",
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function UpdatesPage() {
  const updates = getSortedUpdates();

  return (
    <main className="updates-page">
      <header className="updates-header">
        <div>
          <p className="page-kicker">{"// VISUAL FIELD LOG"}</p>
          <h1><BilingualText en="Latest Updates" zh="最新動態" /></h1>
          <p className="updates-lede">
            <BilingualText
              en="A live visual record, sequenced from the latest upload to the earliest trace."
              zh="由最新上傳至最早紀錄排列的視覺動態檔案。"
            />
          </p>
        </div>
        <div className="updates-header-meta" aria-label="Update count / 動態數量">
          <span>UPDATES</span>
          <strong>{String(updates.length).padStart(2, "0")}</strong>
        </div>
      </header>

      {updates.length === 0 ? (
        <section className="updates-empty" aria-labelledby="updates-empty-title">
          <p className="page-kicker">{"// AWAITING TRANSMISSION"}</p>
          <h2 id="updates-empty-title"><BilingualText en="No updates yet" zh="尚無最新動態" /></h2>
          <p>
            <BilingualText
              en="Upload an image or video to the repository's public/updates folder. Its filename becomes the caption, and the feed will update after deployment."
              zh="將圖片或影片上傳至儲存庫的 public/updates 資料夾。檔名會成為文案，部署完成後便會出現在此時間流。"
            />
          </p>
          <code>YYYY-MM-DD_HHMM_Caption.ext</code>
        </section>
      ) : (
        <section className="updates-feed" aria-label="Latest updates / 最新動態">
          {updates.map((update, index) => (
            <article className={`update-entry ${update.type}`} key={update.id}>
              <aside className="update-index" aria-label={`Update ${index + 1}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i />
              </aside>
              <div className="update-card">
                <div className="update-media-frame">
                  {update.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={update.src} alt={update.caption} loading={index > 1 ? "lazy" : "eager"} />
                  ) : (
                    <video controls preload="metadata" playsInline aria-label={update.caption}>
                      <source src={update.src} />
                      Your browser does not support embedded video.
                    </video>
                  )}
                  <span className="update-media-kind">{update.type === "video" ? "VIDEO" : "IMAGE"}</span>
                </div>
                <div className="update-copy">
                  <div className="update-copy-meta">
                    <time dateTime={update.publishedAt}>{displayDate(update.publishedAt)} UTC</time>
                    <span>{update.type === "video" ? "MOTION LOG" : "IMAGE LOG"}</span>
                  </div>
                  <h2>{update.caption}</h2>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
