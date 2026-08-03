# 凌澈的檔案庫 — GitHub 更新操作手冊
## AUDITOR'S ARCHIVE OPERATION MANUAL

這份手冊旨在指導您如何透過 GitHub 倉庫手動管理網站內容與系統維護。

---

## 1. 專案目錄結構

在進行任何操作前，請熟悉以下核心路徑：

| 路徑 | 用途 | 備註 |
| :--- | :--- | :--- |
| `/content/reviews/` | **文章存放地** | 所有的 Markdown (.md) 報告都放在這裡 |
| `/app/` | **網頁路由與頁面** | 包含首頁、關於頁、時間線等 UI 邏輯 |
| `/components/` | **UI 元件** | 導航欄、卡片、動畫元件等 |
| `/public/` | **靜態資源** | 圖片、圖示、RSS feed (自動生成) |
| `/functions/` | **後端 API** | 處理管理後台推送的 Cloudflare Functions |

---

## 2. 管理文章內容 (Content Management)

### A. 新增文章
1. 進入 `content/reviews/` 目錄。
2. 建立一個新的檔案，命名格式建議為：`YYYY-MM-DD-slug.md`。
   - 例如：`2026-08-01-new-vulnerability.md`
3. 填寫檔案內容，必須包含完整的 **Frontmatter**（頂部的 YAML 區塊）：

```markdown
---
title: "報告標題"
date: "2026-08-01T10:00:00Z"
category: "安全審查"
vulnerability_id: "LC-2026-XXX"
severity: "CRITICAL" # 可選: CRITICAL, HIGH, MEDIUM, LOW, PRIVATE
status: "OPEN"     # 可選: OPEN, RESOLVED, WONTFIX, PRIVATE, LOG
cwe: "CWE-XXX"     # 可選
ai_diary: false    # 若為 true 會顯示 AI LOG 標籤
---

這裡開始寫入文章內文...
可以使用 Markdown 語法（# 標題, **粗體**, [連結](url) 等）。
```

### B. 編輯文章
- 直接點擊現有的 `.md` 檔案進行修改並提交 (Commit)。

### C. 刪除文章
- 直接刪除 `content/reviews/` 下對應的 `.md` 檔案即可。

---

## 3. 自動化部署流程

本網站採用 **CI/CD 自動化流程**，您不需要手動執行構建命令：

1. **推送 (Push)**：當您在 GitHub 上完成 Commit 並 Push 到 `main` 分支時。
2. **觸發 (Trigger)**：Cloudflare Pages 會立即偵測到變更。
3. **構建 (Build)**：Cloudflare 會自動執行 `npm run build`。
4. **上線 (Deploy)**：約 1-2 分鐘後，變更將自動反映在 `https://auditors-archive.pages.dev`。

---

## 4. 給 AI 助手的更新指令範例

如果您想讓 AI 幫您撰寫並更新，可以複製以下指令：

> 「請為我的網站 `auditors-archive` 生成一篇新的安全審計報告。
> 1. 檔案名稱：`2026-08-03-lc-2026-005.md`
> 2. 標題：『[自訂標題]』
> 3. 嚴重等級：HIGH
> 4. 內容風格：小說化敘事，帶有冷酷的審計員氛圍。
> 5. 請直接提供符合 Frontmatter 格式的 Markdown 內容。」

---

## 5. 環境變數與安全提醒

如果網站功能異常（特別是後台推送功能），請檢查 Cloudflare Pages 控制台的環境變數：

- `ADMIN_SECRET`: 管理後台密碼 (`Nashsung0212`)
- `GITHUB_TOKEN`: 您的 GitHub 個人訪問令牌
- `GITHUB_OWNER`: `0xling-patch`
- `GITHUB_REPO`: `auditors-archive`

---

## 6. 常見問題排查

- **網頁沒更新？** 檢查 GitHub Action 或 Cloudflare Pages 的 Build Logs 是否報錯。
- **日期顯示 Invalid Date？** 確保 Frontmatter 中的 `date` 格式符合 ISO 8601，例如 `"2026-07-01T00:00:00Z"`。
- **後台無法登入？** 檢查 `ADMIN_SECRET` 是否設定正確。

---
*凌澈的檔案庫 - 數據永不說謊。*
