export default function PgpPage() {
  const pgpKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGX8EXAMPLE...
[示範用 PGP 公鑰區塊]
[替換為你的實際公鑰]

FINGERPRINT: A1B2 C3D4 E5F6 7890 ABCD  EF01 2345 6789 0ABC DEF0
-----END PGP PUBLIC KEY BLOCK-----`;

  return (
    <div className="content-width">
      <header style={{ marginBottom: "32px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "20px", letterSpacing: "1px", color: "#E8E4F0", marginBottom: "8px" }}>
          PGP PUBLIC KEY
        </h1>
        <p style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
          如果你需要加密通訊，使用這把鑰匙。
        </p>
      </header>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", marginBottom: "8px" }}>
          FINGERPRINT
        </div>
        <code style={{ fontSize: "13px", letterSpacing: "1px", color: "#4ADE80" }}>
          A1B2 C3D4 E5F6 7890 ABCD  EF01 2345 6789 0ABC DEF0
        </code>
      </div>

      <div>
        <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", marginBottom: "8px" }}>
          PUBLIC KEY BLOCK
        </div>
        <pre style={{ fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {pgpKey}
        </pre>
      </div>

      <p style={{ marginTop: "24px", fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
        這是示範用公鑰。部署前請替換為你的實際 PGP 公鑰。
      </p>
    </div>
  );
}
