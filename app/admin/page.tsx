"use client";

import { useState } from "react";

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || "Nashsung0212";

interface FormData {
  title: string;
  date: string;
  category: string;
  vulnerability_id: string;
  severity: string;
  status: string;
  cwe: string;
  related_songyan_log: string;
  ai_diary: boolean;
  content: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [form, setForm] = useState<FormData>({
    title: "",
    date: new Date().toISOString().slice(0, 16),
    category: "安全審查",
    vulnerability_id: "",
    severity: "HIGH",
    status: "OPEN",
    cwe: "",
    related_songyan_log: "",
    ai_diary: false,
    content: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setAuthenticated(true);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  }

  function generateSlug(): string {
    const date = form.date.slice(0, 10);
    const titleSlug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    return `${date}-${titleSlug || "untitled"}`;
  }

  function generateMarkdown(): string {
    const frontmatter = [
      "---",
      `title: "${form.title}"`,
      `date: "${new Date(form.date).toISOString()}"`,
      `category: "${form.category}"`,
      form.vulnerability_id ? `vulnerability_id: "${form.vulnerability_id}"` : null,
      `severity: "${form.severity}"`,
      `status: "${form.status}"`,
      form.cwe ? `cwe: "${form.cwe}"` : null,
      form.related_songyan_log ? `related_songyan_log: "${form.related_songyan_log}"` : null,
      `ai_diary: ${form.ai_diary}`,
      "---",
    ]
      .filter(Boolean)
      .join("\n");

    return `${frontmatter}\n\n${form.content}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) {
      setSubmitResult({ success: false, message: "標題和內容不能為空。" });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    const slug = generateSlug();
    const markdown = generateMarkdown();

    try {
      const response = await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content: markdown,
          message: `feat: add ${form.vulnerability_id || form.title}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: `已推送至 GitHub。檔案：content/reviews/${slug}.md`,
        });
        // 重置表單
        setForm({
          title: "",
          date: new Date().toISOString().slice(0, 16),
          category: "安全審查",
          vulnerability_id: "",
          severity: "HIGH",
          status: "OPEN",
          cwe: "",
          related_songyan_log: "",
          ai_diary: false,
          content: "",
        });
      } else {
        setSubmitResult({
          success: false,
          message: `推送失敗：${data.error || "未知錯誤"}`,
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: `網路錯誤：無法連接至 API。請確認 Cloudflare Pages Functions 已正確設定。`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="content-width">
        <div
          style={{
            paddingTop: "80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "16px", letterSpacing: "1px", color: "#E8E4F0", marginBottom: "8px" }}>
              ADMIN ACCESS
            </h1>
            <p style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
              需要驗證。
            </p>
          </div>

          <form
            onSubmit={handleAuth}
            style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "320px" }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理密碼"
              style={{
                width: "100%",
                borderColor: authError ? "#FF4444" : "#2A2A30",
              }}
            />
            <button type="submit" className="btn-primary" style={{ width: "100%", textAlign: "center" }}>
              AUTHENTICATE
            </button>
            {authError && (
              <p style={{ fontSize: "12px", color: "#FF4444", textAlign: "center", letterSpacing: "0.3px" }}>
                ACCESS DENIED
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="content-width">
      <header style={{ marginBottom: "32px", paddingTop: "32px" }}>
        <h1 style={{ fontSize: "20px", letterSpacing: "1px", color: "#E8E4F0", marginBottom: "8px" }}>
          NEW REPORT
        </h1>
        <p style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
          提交後將自動推送至 GitHub，觸發 Cloudflare Pages 重新構建。
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* 基本資訊 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              TITLE *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="報告標題"
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              DATE *
            </label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={{ width: "100%" }}
              required
            />
          </div>
        </div>

        {/* 漏洞特有欄位 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              VULN ID
            </label>
            <input
              type="text"
              value={form.vulnerability_id}
              onChange={(e) => setForm({ ...form, vulnerability_id: e.target.value })}
              placeholder="LC-2026-NNN"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              SEVERITY *
            </label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              style={{ width: "100%" }}
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              STATUS *
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{ width: "100%" }}
            >
              <option value="OPEN">OPEN</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="WONTFIX">WONTFIX</option>
              <option value="PRIVATE">PRIVATE</option>
              <option value="LOG">LOG</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              CATEGORY *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ width: "100%" }}
            >
              <option value="安全審查">安全審查</option>
              <option value="制度批判">制度批判</option>
              <option value="私人記錄">私人記錄</option>
              <option value="AI 日記">AI 日記</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              CWE
            </label>
            <input
              type="text"
              value={form.cwe}
              onChange={(e) => setForm({ ...form, cwe: e.target.value })}
              placeholder="CWE-XXX"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
              RELATED SONGYAN LOG
            </label>
            <input
              type="text"
              value={form.related_songyan_log}
              onChange={(e) => setForm({ ...form, related_songyan_log: e.target.value })}
              placeholder="關聯的宋言日誌"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.ai_diary}
              onChange={(e) => setForm({ ...form, ai_diary: e.target.checked })}
              style={{ width: "auto", padding: 0 }}
            />
            <span style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
              AI 日記模式
            </span>
          </label>
        </div>

        {/* 內容編輯器 */}
        <div>
          <label style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
            CONTENT * (Markdown)
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="### 摘要&#10;&#10;在此撰寫報告內容...&#10;&#10;### 技術細節&#10;&#10;### 重現步驟&#10;&#10;### 建議修復"
            style={{ width: "100%", minHeight: "400px", resize: "vertical", lineHeight: "1.6" }}
            required
          />
        </div>

        {/* 預覽 slug */}
        {form.title && (
          <div style={{ fontSize: "11px", color: "#6B7280", letterSpacing: "0.3px" }}>
            檔案路徑：<code style={{ color: "#4ADE80", fontSize: "11px" }}>content/reviews/{generateSlug()}.md</code>
          </div>
        )}

        {/* 提交結果 */}
        {submitResult && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "2px",
              border: `0.5px solid ${submitResult.success ? "#4ADE80" : "#FF4444"}`,
              backgroundColor: submitResult.success ? "rgba(74,222,128,0.08)" : "rgba(255,68,68,0.08)",
              fontSize: "13px",
              color: submitResult.success ? "#4ADE80" : "#FF4444",
              letterSpacing: "0.3px",
            }}
          >
            {submitResult.message}
          </div>
        )}

        {/* 提交按鈕 */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ opacity: submitting ? 0.5 : 1 }}
          >
            {submitting ? "PUSHING..." : "PUSH TO GITHUB"}
          </button>

          <button
            type="button"
            onClick={() => {
              const md = generateMarkdown();
              const blob = new Blob([md], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${generateSlug()}.md`;
              a.click();
            }}
            style={{
              background: "transparent",
              color: "#6B7280",
              border: "0.5px solid #2A2A30",
              borderRadius: "2px",
              padding: "8px 16px",
              fontFamily: "inherit",
              fontSize: "13px",
              letterSpacing: "0.5px",
              cursor: "pointer",
            }}
          >
            DOWNLOAD MD
          </button>
        </div>
      </form>
    </div>
  );
}
