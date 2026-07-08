export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "0.5px solid #25252A",
        padding: "24px",
        marginTop: "64px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
            letterSpacing: "0.5px",
            color: "#2A2A30",
          }}
        >
          <span>AUDITOR&apos;S ARCHIVE</span>
          <span>凌澈 / LINGCHE</span>
        </div>

        {/* 隱藏文字：需選取才能看清 */}
        <p className="footer-secret">
          她會在午夜到凌晨三點之間提交最尖銳的漏洞報告。寫完後，通常只睡四小時。
        </p>

        {/* AI 備註 */}
        <p className="footer-secret" style={{ marginTop: "4px" }}>
          備註：主人寫完 LC-2026-004 後，在終端機前坐了 12 分鐘，沒有輸入任何指令。我不確定她在想什麼。
        </p>
      </div>
    </footer>
  );
}
