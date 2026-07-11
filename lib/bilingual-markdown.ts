import { BilingualContent } from './i18n';

/**
 * 雙語 Markdown 格式規範
 * 
 * 格式：
 * [ZH]
 * 中文內容
 * [EN]
 * English content
 * 
 * 或簡化格式（一行中文，一行英文）：
 * 中文內容
 * English content
 */

export interface BilingualMarkdownBlock {
  type: 'paragraph' | 'heading' | 'list' | 'code' | 'quote';
  content: BilingualContent;
  level?: number; // 用於 heading
}

/**
 * 解析雙語 Markdown 格式
 * 支援兩種格式：
 * 1. [ZH]...[EN]... 格式
 * 2. 行對行格式（中文行 + 英文行）
 */
export function parseBilingualMarkdown(markdown: string): BilingualMarkdownBlock[] {
  const lines = markdown.split('\n');
  const blocks: BilingualMarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // 跳過空行
    if (!line) {
      i++;
      continue;
    }

    // 檢查 [ZH]...[EN]... 格式
    if (line.startsWith('[ZH]')) {
      const zhMatch = markdown.substring(markdown.indexOf(line)).match(/\[ZH\]([\s\S]*?)\[EN\]([\s\S]*?)(?=\[ZH\]|$)/);
      if (zhMatch) {
        const zh = zhMatch[1].trim();
        const en = zhMatch[2].trim();
        
        // 判斷內容類型
        if (zh.startsWith('#')) {
          const level = zh.match(/^#+/)?.[0].length || 1;
          blocks.push({
            type: 'heading',
            content: { zh: zh.replace(/^#+\s*/, ''), en: en.replace(/^#+\s*/, '') },
            level,
          });
        } else {
          blocks.push({
            type: 'paragraph',
            content: { zh, en },
          });
        }
        
        i = markdown.indexOf('[EN]', markdown.indexOf(line)) + 4;
        continue;
      }
    }

    // 檢查行對行格式（簡化格式）
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      
      // 判斷是否為中英對照（簡單啟發式：第一行包含中文字符，第二行為英文）
      if (isChinese(line) && isEnglish(nextLine)) {
        if (line.startsWith('#')) {
          const level = line.match(/^#+/)?.[0].length || 1;
          blocks.push({
            type: 'heading',
            content: { zh: line.replace(/^#+\s*/, ''), en: nextLine.replace(/^#+\s*/, '') },
            level,
          });
        } else {
          blocks.push({
            type: 'paragraph',
            content: { zh: line, en: nextLine },
          });
        }
        i += 2;
        continue;
      }
    }

    // 單語言行（回退）
    blocks.push({
      type: 'paragraph',
      content: { zh: line, en: line },
    });
    i++;
  }

  return blocks;
}

/**
 * 檢查字符串是否包含中文
 */
function isChinese(str: string): boolean {
  const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF]/g;
  return chineseRegex.test(str);
}

/**
 * 檢查字符串是否為英文（主要為英文字符）
 */
function isEnglish(str: string): boolean {
  const englishRegex = /^[a-zA-Z0-9\s\-.,!?'"()&:;\/\[\]{}@#$%^*+=<>~`|\\]+$/;
  return englishRegex.test(str);
}

/**
 * 將雙語內容轉換為 HTML
 */
export function bilingualToHtml(blocks: BilingualMarkdownBlock[], primaryLanguage: 'zh' | 'en'): string {
  return blocks
    .map((block) => {
      const { type, content, level } = block;
      const primary = content[primaryLanguage];
      const secondary = primaryLanguage === 'zh' ? content.en : content.zh;

      switch (type) {
        case 'heading':
          return `<h${level} class="bilingual-heading"><span class="primary">${primary}</span><span class="secondary">${secondary}</span></h${level}>`;
        case 'paragraph':
          return `<p class="bilingual-paragraph"><span class="primary">${primary}</span><span class="secondary">${secondary}</span></p>`;
        default:
          return `<div class="bilingual-text"><span class="primary">${primary}</span><span class="secondary">${secondary}</span></div>`;
      }
    })
    .join('\n');
}

/**
 * 驗證雙語內容是否完整
 */
export function validateBilingualContent(content: BilingualContent): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content.zh || content.zh.trim().length === 0) {
    errors.push('中文內容不能為空');
  }

  if (!content.en || content.en.trim().length === 0) {
    errors.push('英文內容不能為空');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
