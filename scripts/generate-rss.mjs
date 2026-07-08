import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reviewsDir = path.join(__dirname, "../content/reviews");
const outputPath = path.join(__dirname, "../public/feed.xml");

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const files = fs
  .readdirSync(reviewsDir)
  .filter((f) => f.endsWith(".md"))
  .map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const content = fs.readFileSync(path.join(reviewsDir, fileName), "utf8");
    const { data } = matter(content);
    return { slug, ...data };
  })
  .filter((r) => r.severity !== "PRIVATE" && !r.ai_diary)
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const siteUrl = "https://auditors-archive.pages.dev";

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AUDITOR'S ARCHIVE</title>
    <link>${siteUrl}</link>
    <description>這裡沒有好聽話。只有漏洞，和還沒被發現的漏洞。</description>
    <language>zh-TW</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${files
      .map(
        (review) => `
    <item>
      <title>${escapeXml(review.title || "")}</title>
      <link>${siteUrl}/review/${review.slug}/</link>
      <guid isPermaLink="true">${siteUrl}/review/${review.slug}/</guid>
      <pubDate>${new Date(review.date).toUTCString()}</pubDate>
      <category>${escapeXml(review.category || "")}</category>
      ${review.vulnerability_id ? `<description>${escapeXml(review.vulnerability_id)} — ${escapeXml(review.severity)}</description>` : ""}
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

fs.writeFileSync(outputPath, rss);
console.log(`RSS feed generated: ${outputPath} (${files.length} entries)`);
