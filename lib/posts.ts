import fs from "fs";
import path from "path";
import matter from "gray-matter";

const reviewsDirectory = path.join(process.cwd(), "content/reviews");

export interface ReviewData {
  slug: string;
  title: string;
  date: string;
  category: string;
  vulnerability_id?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "PRIVATE";
  status: "OPEN" | "RESOLVED" | "WONTFIX" | "PRIVATE" | "LOG";
  cwe?: string;
  related_songyan_log?: string;
  ai_diary: boolean;
  contentHtml?: string;
  content?: string;
}

export function getSortedReviewsData(): ReviewData[] {
  if (!fs.existsSync(reviewsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(reviewsDirectory);
  const allReviewsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(reviewsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        slug,
        ...(matterResult.data as Omit<ReviewData, "slug">),
      };
    });

  return allReviewsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllReviewSlugs() {
  if (!fs.existsSync(reviewsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(reviewsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      return {
        slug: fileName.replace(/\.md$/, ""),
      };
    });
}

export async function getReviewData(slug: string): Promise<ReviewData> {
  const fullPath = path.join(reviewsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  return {
    slug,
    content: matterResult.content,
    ...(matterResult.data as Omit<ReviewData, "slug" | "content">),
  };
}
