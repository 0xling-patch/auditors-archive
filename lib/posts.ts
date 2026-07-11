import fs from "fs";
import path from "path";
import matter from "gray-matter";

const reviewsDirectory = path.join(process.cwd(), "content/reviews");

export interface BilingualField {
  zh: string;
  en: string;
}

export interface ReviewData {
  slug: string;
  title: BilingualField | string; // 支援雙語或單語
  date: string;
  category: string;
  vulnerability_id?: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "PRIVATE";
  status: "OPEN" | "RESOLVED" | "WONTFIX" | "PRIVATE" | "LOG";
  cwe?: string;
  related_songyan_log?: string;
  ai_diary: boolean;
  content?: string;
  contentHtml?: string;
  language_primary?: "zh" | "en"; // 此版本的主要語言
  title_zh?: string;
  title_en?: string;
  description_zh?: string;
  description_en?: string;
  tags_zh?: string[];
  tags_en?: string[];
  author_zh?: string;
  author_en?: string;
}

/**
 * 規範化標題：如果有 title_zh 和 title_en，轉換為 BilingualField
 */
function normalizeBilingualFields(data: Record<string, unknown>): ReviewData {
  const normalized = { ...data } as unknown as ReviewData;

  // 標題雙語化
  if (data.title_zh && data.title_en) {
    normalized.title = {
      zh: String(data.title_zh),
      en: String(data.title_en),
    };
  } else if (!normalized.title) {
    normalized.title = "Untitled";
  }

  return normalized;
}

export function getSortedReviewsData(): ReviewData[] {
  if (!fs.existsSync(reviewsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(reviewsDirectory);
  
  // 分組同一篇文章的不同語言版本
  const groupedBySlug = new Map<string, string[]>();
  
  fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .forEach((fileName) => {
      // 移除 -zh.md 或 -en.md 後綴
      const baseSlug = fileName
        .replace(/-(zh|en)\.md$/, "")
        .replace(/\.md$/, "");
      
      if (!groupedBySlug.has(baseSlug)) {
        groupedBySlug.set(baseSlug, []);
      }
      groupedBySlug.get(baseSlug)!.push(fileName);
    });

  const allReviewsData: ReviewData[] = [];

  // 為每個文章組合，只取一個版本（優先取中文版本）
  groupedBySlug.forEach((fileNames, baseSlug) => {
    const selectedFile = fileNames.find((f) => f.endsWith("-zh.md")) || fileNames[0];
    
    const fullPath = path.join(reviewsDirectory, selectedFile);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    const reviewData = normalizeBilingualFields({
      slug: baseSlug,
      ...(matterResult.data as Omit<ReviewData, "slug">),
    });

    allReviewsData.push(reviewData);
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
  const slugs = new Set<string>();

  fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .forEach((fileName) => {
      // 移除 -zh.md 或 -en.md 後綴
      const baseSlug = fileName
        .replace(/-(zh|en)\.md$/, "")
        .replace(/\.md$/, "");
      slugs.add(baseSlug);
    });

  return Array.from(slugs).map((slug) => ({
    slug,
  }));
}

export async function getReviewData(slug: string): Promise<ReviewData> {
  // 嘗試讀取中文版本，如果不存在則讀取英文版本
  let fullPath = path.join(reviewsDirectory, `${slug}-zh.md`);
  
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(reviewsDirectory, `${slug}-en.md`);
  }
  
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(reviewsDirectory, `${slug}.md`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  return normalizeBilingualFields({
    slug,
    content: matterResult.content,
    ...(matterResult.data as Omit<ReviewData, "slug" | "content">),
  });
}

/**
 * 取得特定語言版本的報告
 */
export async function getReviewDataByLanguage(
  slug: string,
  language: "zh" | "en"
): Promise<ReviewData> {
  const fullPath = path.join(reviewsDirectory, `${slug}-${language}.md`);
  
  if (!fs.existsSync(fullPath)) {
    // 回退至預設版本
    return getReviewData(slug);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);

  return normalizeBilingualFields({
    slug,
    content: matterResult.content,
    language_primary: language,
    ...(matterResult.data as Omit<ReviewData, "slug" | "content">),
  });
}

/**
 * 解析雙語 Markdown 內容
 * 支援格式：[ZH]...[EN]... 或行對行格式
 */
export interface BilingualMarkdownBlock {
  type: "paragraph" | "heading" | "list" | "code" | "quote";
  zh: string;
  en: string;
  level?: number;
}

export function parseBilingualMarkdown(markdown: string): BilingualMarkdownBlock[] {
  const blocks: BilingualMarkdownBlock[] = [];
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // 跳過空行
    if (!line) {
      i++;
      continue;
    }

    // 檢查 [ZH]...[EN]... 格式
    if (line.startsWith("[ZH]")) {
      let zh = "";
      let en = "";
      let inZh = true;

      i++;
      while (i < lines.length) {
        const currentLine = lines[i];

        if (currentLine.trim().startsWith("[EN]")) {
          inZh = false;
          i++;
          continue;
        }

        if (currentLine.trim().startsWith("[ZH]")) {
          break;
        }

        if (inZh) {
          zh += currentLine + "\n";
        } else {
          en += currentLine + "\n";
        }

        i++;
      }

      zh = zh.trim();
      en = en.trim();

      if (zh || en) {
        blocks.push({
          type: "paragraph",
          zh,
          en,
        });
      }
      continue;
    }

    // 檢查行對行格式
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();

      // 簡單啟發式：如果當前行包含中文，下一行不包含中文，則認為是對照
      if (containsChinese(line) && !containsChinese(nextLine) && nextLine.length > 0) {
        blocks.push({
          type: "paragraph",
          zh: line,
          en: nextLine,
        });
        i += 2;
        continue;
      }
    }

    // 單語言行（回退）
    blocks.push({
      type: "paragraph",
      zh: line,
      en: line,
    });
    i++;
  }

  return blocks;
}

/**
 * 檢查字符串是否包含中文
 */
function containsChinese(str: string): boolean {
  const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF]/g;
  return chineseRegex.test(str);
}
