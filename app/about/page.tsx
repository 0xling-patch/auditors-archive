export default function AboutPage() {
  return (
    <div className="content-width">
      <header style={{ marginBottom: "32px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "20px", letterSpacing: "1px", color: "#E8E4F0", marginBottom: "8px" }}>
          ABOUT
        </h1>
      </header>

      <div
        className="left-plum-line"
        style={{ paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <section>
          <p style={{ fontSize: "14px", letterSpacing: "0.3px", lineHeight: "1.6" }}>
            凌澈。獨立安全審計師。
          </p>
          <p style={{ fontSize: "14px", letterSpacing: "0.3px", lineHeight: "1.6", marginTop: "8px" }}>
            不屬於任何公司。偶爾有人贊助，偶爾沒有。
          </p>
          <p style={{ fontSize: "14px", letterSpacing: "0.3px", lineHeight: "1.6", marginTop: "8px" }}>
            在新大陸邊緣長大。沒上過正式學校。全靠自學。
          </p>
        </section>

        <hr />

        <section>
          <p style={{ fontSize: "13px", color: "#6B7280", letterSpacing: "0.3px", lineHeight: "1.6" }}>
            不接受採訪。不參加研討會。不提供顧問服務。
          </p>
          <p style={{ fontSize: "13px", color: "#6B7280", letterSpacing: "0.3px", lineHeight: "1.6", marginTop: "8px" }}>
            如果你想聯絡我，你知道該怎麼做。
          </p>
        </section>

        <hr />

        <section style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", minWidth: "60px" }}>PGP</span>
            <a href="/pgp" style={{ fontSize: "13px", fontFamily: "monospace", color: "#C8C8CC" }}>
              → /pgp
            </a>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", minWidth: "60px" }}>X</span>
            <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#C8C8CC" }}>
              @lingche_audit
            </span>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", minWidth: "60px" }}>GITHUB</span>
            <span style={{ fontSize: "13px", fontFamily: "monospace", color: "#C8C8CC" }}>
              github.com/lingche
            </span>
          </div>
        </section>

        <hr />

        <section>
          <p
            style={{
              fontSize: "12px",
              color: "#2A2A30",
              letterSpacing: "0.3px",
              lineHeight: "1.6",
              borderLeft: "1px solid #2A1F2E",
              paddingLeft: "12px",
            }}
          >
            她的溫柔是：她不會為你擋雨，但她會在雨停之後，幫你檢查屋頂哪裡漏水。
          </p>
        </section>
      </div>
    </div>
  );
}
