import fs from "fs";
import path from "path";
import matter from "gray-matter";

const reviewsDirectory = path.join(process.cwd(), "content/reviews");
const englishReviewsDirectory = path.join(reviewsDirectory, "en");

export interface ReviewData {
  slug: string;
  title: string;
  titleEn: string;
  date: string;
  category: string;
  categoryEn: string;
  vulnerability_id?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "PRIVATE";
  status: "OPEN" | "RESOLVED" | "WONTFIX" | "PRIVATE" | "LOG";
  cwe?: string;
  related_songyan_log?: string;
  ai_diary: boolean;
  contentHtml?: string;
  content?: string;
  contentEn?: string;
}

function readEnglishReview(slug: string) {
  const fullPath = path.join(englishReviewsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return { titleEn: "", categoryEn: "", contentEn: "" };

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const result = matter(fileContents);
  return {
    titleEn: String(result.data.title || ""),
    categoryEn: String(result.data.category || ""),
    contentEn: result.content.trim(),
  };
}

export function getSortedReviewsData(): ReviewData[] {
  if (!fs.existsSync(reviewsDirectory)) return [];

  const fileNames = fs
    .readdirSync(reviewsDirectory)
    .filter((fileName) => fileName.endsWith(".md"));

  const allReviewsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(reviewsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);
    const english = readEnglishReview(slug);

    return {
      slug,
      titleEn: english.titleEn || String(matterResult.data.title || ""),
      categoryEn: english.categoryEn || String(matterResult.data.category || ""),
      contentEn: english.contentEn || matterResult.content.trim(),
      ...(matterResult.data as Omit<ReviewData, "slug" | "titleEn" | "categoryEn" | "contentEn">),
    };
  });

  return allReviewsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllReviewSlugs() {
  if (!fs.existsSync(reviewsDirectory)) return [];
  return fs
    .readdirSync(reviewsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => ({ slug: fileName.replace(/\.md$/, "") }));
}

export async function getReviewData(slug: string): Promise<ReviewData> {
  const fullPath = path.join(reviewsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const english = readEnglishReview(slug);

  return {
    slug,
    content: matterResult.content.trim(),
    titleEn: english.titleEn || String(matterResult.data.title || ""),
    categoryEn: english.categoryEn || String(matterResult.data.category || ""),
    contentEn: english.contentEn || matterResult.content.trim(),
    ...(matterResult.data as Omit<ReviewData, "slug" | "content" | "titleEn" | "categoryEn" | "contentEn">),
  };
}
