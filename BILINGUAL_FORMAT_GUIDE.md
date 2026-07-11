# 凌澈的檔案庫 — 雙語上傳格式指南
# Auditor's Archive — Bilingual Upload Format Guide

---

## 📋 概述 | Overview

本指南定義了如何為「凌澈的檔案庫」上傳**雙語對照內容**。每次更新時，您需要上傳**兩個版本**的 Markdown 檔案：
- **中文為主版本** (`*-zh.md`)：中文字體較大，英文為輔助
- **英文為主版本** (`*-en.md`)：英文字體較大，中文為輔助

This guide defines how to upload **bilingual content** to "Auditor's Archive". For each update, you need to upload **two versions** of Markdown files:
- **Chinese-primary version** (`*-zh.md`): Chinese text is larger, English is secondary
- **English-primary version** (`*-en.md`): English text is larger, Chinese is secondary

---

## 🎯 雙語格式規範 | Bilingual Format Specification

### 方法 1：標籤格式（推薦用於長篇內容）
### Method 1: Tag Format (Recommended for long content)

```markdown
[ZH]
中文標題或段落內容
[EN]
English title or paragraph content

[ZH]
下一段中文內容
[EN]
Next paragraph in English
```

**範例 | Example:**

```markdown
---
title-zh: "核心權限越權漏洞：深淵的低語"
title-en: "Critical Privilege Escalation: Whispers from the Abyss"
slug: 2026-07-01-lc-2026-001
severity: CRITICAL
cwe: CWE-269
status: RESOLVED
---

[ZH]
# 核心權限越權漏洞：深淵的低語

在代碼的黑暗角落，我發現了一個足以動搖整個系統的裂縫。
[EN]
# Critical Privilege Escalation: Whispers from the Abyss

In the dark corners of the code, I discovered a crack that could shake the entire system.

[ZH]
## 漏洞描述

系統在處理用戶角色驗證時存在邏輯缺陷...
[EN]
## Vulnerability Description

The system has a logical flaw in handling user role verification...
```

---

### 方法 2：行對行格式（用於簡短內容）
### Method 2: Line-by-Line Format (For short content)

```markdown
中文第一行
English first line

中文第二行
English second line
```

**範例 | Example:**

```markdown
---
title-zh: "私人記錄"
title-en: "Private Notes"
slug: 2026-07-03-private-note
status: PRIVATE
---

夏曉與那片星空
Xiaoxiao and That Starry Sky

她說，審計員的眼睛能看穿代碼的謊言。
She said that an auditor's eyes can see through the lies of code.

但我想，也許我們都在騙自己。
But I think, perhaps we're all lying to ourselves.
```

---

## 📝 Frontmatter 規範 | Frontmatter Specification

每個 Markdown 檔案的頂部必須包含 YAML Frontmatter，定義文章的元數據：

```yaml
---
title-zh: "中文標題"
title-en: "English Title"
slug: YYYY-MM-DD-unique-identifier
severity: CRITICAL | HIGH | MEDIUM | LOW | PRIVATE
cwe: CWE-XXX (如果適用)
status: RESOLVED | OPEN | PRIVATE | LOG
date: YYYY-MM-DD
author-zh: "作者名稱"
author-en: "Author Name"
tags-zh: ["標籤1", "標籤2"]
tags-en: ["Tag1", "Tag2"]
---
```

### Frontmatter 欄位說明 | Field Description

| 欄位 | 說明 | 必需 |
|------|------|------|
| `title-zh` | 中文標題 | ✓ |
| `title-en` | 英文標題 | ✓ |
| `slug` | 唯一識別符（用於 URL） | ✓ |
| `severity` | 嚴重等級 | ✓ |
| `cwe` | CWE 編號 | ✗ |
| `status` | 狀態 | ✓ |
| `date` | 發佈日期 | ✓ |
| `author-zh` | 中文作者名稱 | ✗ |
| `author-en` | 英文作者名稱 | ✗ |
| `tags-zh` | 中文標籤列表 | ✗ |
| `tags-en` | 英文標籤列表 | ✗ |

---

## 🔄 上傳工作流程 | Upload Workflow

### 步驟 1：準備內容 | Step 1: Prepare Content

使用您的 AI 助手生成或編輯雙語內容。確保：
- 中文內容準確、自然
- 英文內容準確、專業
- 兩個版本的含義一致

Prepare bilingual content using your AI assistant. Ensure:
- Chinese content is accurate and natural
- English content is accurate and professional
- Both versions convey the same meaning

### 步驟 2：建立兩個版本 | Step 2: Create Two Versions

根據同一個內容，建立兩個檔案：

**版本 A - 中文為主 (`*-zh.md`):**
```yaml
---
language-primary: zh
language-secondary: en
---
```

**版本 B - 英文為主 (`*-en.md`):**
```yaml
---
language-primary: en
language-secondary: zh
---
```

### 步驟 3：上傳至 GitHub | Step 3: Upload to GitHub

將兩個檔案上傳至 `/content/reviews/` 目錄：

```
content/reviews/
├── 2026-07-01-lc-2026-001-zh.md  (中文為主)
├── 2026-07-01-lc-2026-001-en.md  (英文為主)
├── 2026-07-03-private-note-zh.md
├── 2026-07-03-private-note-en.md
└── ...
```

### 步驟 4：提交並推送 | Step 4: Commit and Push

```bash
git add content/reviews/*
git commit -m "Add bilingual content: [ZH/EN] Title"
git push origin main
```

Cloudflare Pages 將自動偵測更新並重新構建您的網站。

---

## 💡 AI 助手指令範例 | AI Assistant Instruction Examples

### 用於生成雙語報告的提示詞 | Prompt for generating bilingual report

```
請為「凌澈的檔案庫」生成一篇雙語安全審計報告。

要求：
1. 使用 [ZH]...[EN]... 標籤格式
2. 包含完整的 Frontmatter
3. 中文部分應該帶有小說化的敘事風格
4. 英文部分應該專業、技術性強
5. 漏洞編號：LC-2026-XXX
6. 嚴重等級：CRITICAL/HIGH/MEDIUM
7. 字數：中英各 500-1000 字

輸出格式應該能直接保存為 Markdown 檔案。
```

### 用於轉換現有內容的提示詞 | Prompt for converting existing content

```
請將以下中文安全審計報告轉換為雙語對照格式（[ZH]...[EN]...）。

原文：
[貼上中文內容]

要求：
1. 保留原有的中文內容
2. 提供專業的英文翻譯
3. 確保技術術語的準確性
4. 使用標籤格式分隔中英內容
5. 生成完整的 Frontmatter

輸出應該包含兩個版本：
- 中文為主版本（用於 *-zh.md）
- 英文為主版本（用於 *-en.md）
```

---

## 🎨 前端顯示邏輯 | Frontend Display Logic

### 語言切換行為 | Language Toggle Behavior

用戶點擊導航欄的語言按鈕時：

1. **主語言文本** → 字體大小：`text-base md:text-lg`，不透明度：`100%`
2. **次語言文本** → 字體大小：`text-xs md:text-sm`，不透明度：`75%`

當用戶切換語言時，上述樣式互換。

When user clicks the language toggle button:

1. **Primary language text** → Font size: `text-base md:text-lg`, Opacity: `100%`
2. **Secondary language text** → Font size: `text-xs md:text-sm`, Opacity: `75%`

The styles swap when user switches language.

### 儲存語言偏好 | Save Language Preference

用戶的語言選擇會自動保存至瀏覽器本地存儲（`localStorage`），下次訪問時自動應用。

User's language preference is automatically saved to browser's `localStorage` and applied on next visit.

---

## ✅ 檢查清單 | Checklist

上傳前，請確認：

- [ ] 中文內容完整、無錯別字
- [ ] 英文內容準確、語法正確
- [ ] Frontmatter 包含所有必需欄位
- [ ] 檔案名稱遵循格式：`YYYY-MM-DD-slug-{zh|en}.md`
- [ ] 兩個版本（中文為主 + 英文為主）已準備
- [ ] 內容已上傳至 `/content/reviews/` 目錄
- [ ] Git 提交訊息清晰、有意義

Before uploading, confirm:

- [ ] Chinese content is complete and error-free
- [ ] English content is accurate and grammatically correct
- [ ] Frontmatter includes all required fields
- [ ] Filename follows format: `YYYY-MM-DD-slug-{zh|en}.md`
- [ ] Both versions (Chinese-primary + English-primary) are ready
- [ ] Content is uploaded to `/content/reviews/` directory
- [ ] Git commit message is clear and meaningful

---

## 📞 技術支援 | Technical Support

如有任何問題，請參考：
- 前端語言管理：`/components/LanguageProvider.tsx`
- 雙語解析工具：`/lib/bilingual-markdown.ts`
- 雙語渲染元件：`/components/BilingualText.tsx`

For any issues, refer to:
- Frontend language management: `/components/LanguageProvider.tsx`
- Bilingual parsing utility: `/lib/bilingual-markdown.ts`
- Bilingual rendering component: `/components/BilingualText.tsx`

---

**最後更新 | Last Updated:** 2026-07-11
**版本 | Version:** 1.0
