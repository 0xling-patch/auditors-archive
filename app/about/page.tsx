import { BilingualText } from "@/components/Bilingual";

const socialLinks = [
  { platform: "Threads", handle: "@0xlingpatch", href: "https://www.threads.com/@0xlingpatch" },
  { platform: "Instagram", handle: "@0xlingpatch", href: "https://www.instagram.com/0xlingpatch/" },
  { platform: "X", handle: "@0xlingpatch", href: "https://x.com/0xlingpatch" },
  { platform: "Substack", handle: "@0xlingpatch", href: "https://substack.com/@0xlingpatch" },
  { platform: "Facebook", handle: "0xlingpatch", href: "https://www.facebook.com/profile.php?id=61593067474897&locale=zh_TW" },
];

export default function AboutPage() {
  return (
    <div className="content-width">
      <header className="simple-page-header">
        <BilingualText en="ABOUT" zh="關於" className="simple-page-title" />
      </header>

      <div className="left-plum-line simple-page-body">
        <section>
          <BilingualText en="Lingche. Independent security auditor." zh="凌澈。獨立安全審計師。" className="about-lead" />
          <BilingualText en="Belongs to no company. Sometimes sponsored, sometimes not." zh="不屬於任何公司。偶爾有人贊助，偶爾沒有。" className="about-lead" />
          <BilingualText en="Raised at the edge of the New World. Never attended formal school. Entirely self-taught." zh="在新大陸邊緣長大。沒上過正式學校。全靠自學。" className="about-lead" />
        </section>

        <hr />

        <section>
          <BilingualText en="No interviews. No conferences. No consulting." zh="不接受採訪。不參加研討會。不提供顧問服務。" className="about-muted" />
          <BilingualText en="If you want to reach me, you know what to do." zh="如果你想聯絡我，你知道該怎麼做。" className="about-muted" />
        </section>

        <hr />

        <section className="about-links" aria-label="Public links / 公開連結">
          <div><span className="about-link-label">PGP</span><a href="/pgp">→ /pgp</a></div>
          <div><span className="about-link-label">GITHUB</span><a href="https://github.com/0xling-patch" target="_blank" rel="noreferrer">github.com/0xling-patch ↗</a></div>
        </section>

        <section className="social-links-panel" aria-label="Social profiles / 社群平台">
          <div className="social-links-heading">
            <BilingualText en="PUBLIC CHANNELS" zh="公開平台" />
            <BilingualText en="Follow the archive beyond this terminal." zh="在這座終端機之外，繼續追蹤檔案庫。" className="social-links-note" />
          </div>
          <div className="social-links-grid">
            {socialLinks.map((link) => (
              <a key={link.platform} href={link.href} target="_blank" rel="noreferrer" className="social-link-card" aria-label={`Open ${link.platform} / 開啟 ${link.platform}`}>
                <span className="social-link-platform">{link.platform}</span>
                <span className="social-link-handle">{link.handle}</span>
                <span className="social-link-arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <hr />

        <section>
          <BilingualText
            en="Her kindness is this: she will not keep the rain off you, but after it stops, she will inspect the roof for leaks."
            zh="她的溫柔是：她不會為你擋雨，但她會在雨停之後，幫你檢查屋頂哪裡漏水。"
            className="about-quote"
          />
        </section>
      </div>
    </div>
  );
}
