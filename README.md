# AUDITOR'S ARCHIVE

> 這裡沒有好聽話。只有漏洞，和還沒被發現的漏洞。

凌澈的個人安全審計網站。基於 Next.js 14 靜態匯出，透過 Cloudflare Pages 自動部署。

---

## 技術架構

| 層級 | 技術 |
|------|------|
| 框架 | Next.js 14 (App Router, `output: 'export'`) |
| 樣式 | Tailwind CSS + CSS Variables（強制暗色主題） |
| 字體 | SF Mono / Consolas / Menlo（系統等寬字） |
| 內容 | Markdown + gray-matter（`content/reviews/*.md`） |
| 部署 | Cloudflare Pages（Git 整合，自動構建） |
| 後台 API | Cloudflare Pages Functions（`functions/api/commit.ts`） |

---

## 部署步驟

### 1. 準備 GitHub 倉庫

```bash
git init
git add .
git commit -m "feat: initial commit — auditor's archive"
git remote add origin https://github.com/YOUR_USERNAME/auditors-archive.git
git push -u origin main
```

### 2. 連結 Cloudflare Pages

1. 登入 Cloudflare Dashboard → Pages → Create a project
2. 選擇 **Connect to Git**（絕對不要使用直接上傳）
3. 授權 GitHub，選擇 `auditors-archive` 倉庫
4. 設定構建參數：
   - Build command: `npm run build`
   - Build output directory: `out`

### 3. 設定環境變數

在 Cloudflare Pages → Settings → Environment variables：

| 變數名稱 | 說明 |
|----------|------|
| `ADMIN_SECRET` | 管理後台密碼（預設：Nashsung0212） |
| `GITHUB_TOKEN` | GitHub Personal Access Token（需要 repo 權限） |
| `GITHUB_OWNER` | GitHub 用戶名 |
| `GITHUB_REPO` | 倉庫名稱（auditors-archive） |

---

## 管理後台

訪問 `/admin`，密碼：`Nashsung0212`

填寫報告資訊後點擊 **PUSH TO GITHUB**，Cloudflare Pages 自動重新構建。

---

## 目錄結構

```
auditors-archive/
├── app/                    # Next.js App Router 頁面
│   ├── review/[slug]/      # 單篇報告動態路由
│   ├── vulnerabilities/    # 漏洞索引
│   ├── timeline/           # 時間線
│   ├── about/              # 關於頁
│   ├── pgp/                # PGP 公鑰
│   ├── private/            # 加密角落
│   └── admin/              # 管理後台
├── components/             # React 元件
├── content/reviews/        # Markdown 報告
├── functions/api/
│   └── commit.ts           # Cloudflare Pages Functions
├── lib/posts.ts            # Markdown 工具函式
└── scripts/generate-rss.mjs
```

---

*凌澈的溫柔是：她不會為你擋雨，但她會在雨停之後，幫你檢查屋頂哪裡漏水。*
