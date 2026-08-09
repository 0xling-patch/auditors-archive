import { BilingualText } from "@/components/Bilingual";

export default function PgpPage() {
  const pgpKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBGX8EXAMPLE...
[示範用 PGP 公鑰區塊 / DEMO PGP PUBLIC KEY BLOCK]
[替換為你的實際公鑰 / REPLACE WITH YOUR ACTUAL KEY]

FINGERPRINT: A1B2 C3D4 E5F6 7890 ABCD  EF01 2345 6789 0ABC DEF0
-----END PGP PUBLIC KEY BLOCK-----`;

  return (
    <div className="content-width">
      <header className="simple-page-header">
        <BilingualText en="PGP PUBLIC KEY" zh="PGP 公開金鑰" className="simple-page-title" />
        <BilingualText en="Use this key for encrypted communication." zh="如果你需要加密通訊，使用這把鑰匙。" className="page-subtitle" />
      </header>

      <div className="pgp-section">
        <BilingualText en="FINGERPRINT" zh="指紋" className="section-label" />
        <code style={{ fontSize: "13px", letterSpacing: "1px", color: "#4ADE80" }}>
          A1B2 C3D4 E5F6 7890 ABCD  EF01 2345 6789 0ABC DEF0
        </code>
      </div>

      <div className="pgp-section">
        <BilingualText en="PUBLIC KEY BLOCK" zh="公開金鑰區塊" className="section-label" />
        <pre style={{ fontSize: "12px", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {pgpKey}
        </pre>
      </div>

      <BilingualText
        en="This is a demo public key. Replace it with your actual PGP public key before deployment."
        zh="這是示範用公鑰。部署前請替換為你的實際 PGP 公鑰。"
        className="page-warning"
      />
    </div>
  );
}
