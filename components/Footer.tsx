import { BilingualText } from "./Bilingual";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand-row">
          <BilingualText en="AUDITOR&apos;S ARCHIVE" zh="凌澈的檔案庫" />
          <BilingualText en="LINGCHE" zh="凌澈" />
        </div>

        <BilingualText
          en="She submits her sharpest vulnerability reports between midnight and 3 a.m. After writing, she usually sleeps for four hours."
          zh="她會在午夜到凌晨三點之間提交最尖銳的漏洞報告。寫完後，通常只睡四小時。"
          className="footer-secret"
        />

        <BilingualText
          en="Note: After finishing LC-2026-004, she sat at the terminal for twelve minutes without entering a command. I do not know what she was thinking."
          zh="備註：主人寫完 LC-2026-004 後，在終端機前坐了 12 分鐘，沒有輸入任何指令。我不確定她在想什麼。"
          className="footer-secret"
        />
      </div>
    </footer>
  );
}
