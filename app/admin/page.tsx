"use client";

import { useState } from "react";
import { BilingualText } from "@/components/Bilingual";

const ADMIN_SECRET = "Nashsung0212";

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

const initialForm = (): FormData => ({
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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [mode, setMode] = useState<"create" | "delete">("create");
  const [form, setForm] = useState<FormData>(initialForm());
  const [deleteSlug, setDeleteSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_SECRET) setAuthenticated(true);
    else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  }

  function generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    const slug = generateSlug(form.vulnerability_id || form.title);
    const frontmatter = `---\ntitle: "${form.title}"\ndate: "${form.date}"\ncategory: "${form.category}"\nvulnerability_id: "${form.vulnerability_id}"\nseverity: "${form.severity}"\nstatus: "${form.status}"\ncwe: "${form.cwe}"\nrelated_songyan_log: "${form.related_songyan_log}"\nai_diary: ${form.ai_diary}\n---\n\n${form.content}`;

    try {
      const response = await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: frontmatter, message: `Add review: ${form.title}` }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setSubmitResult({
        success: response.ok,
        message: data.message || (response.ok ? "Review pushed to GitHub. / 報告已推送至 GitHub。" : "Push failed. Please try again. / 推送失敗，請重試。"),
      });
      if (response.ok) setForm(initialForm());
    } catch (error) {
      setSubmitResult({ success: false, message: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const response = await fetch("/api/commit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: deleteSlug }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      setSubmitResult({
        success: response.ok,
        message: data.message || (response.ok ? "Review deleted. / 文章已刪除。" : "Delete failed. Please try again. / 刪除失敗，請重試。"),
      });
      if (response.ok) setDeleteSlug("");
    } catch (error) {
      setSubmitResult({ success: false, message: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="admin-shell">
        <div className="admin-panel admin-login-panel">
          <div className="admin-heading">
            <BilingualText en="LINGCHE'S ARCHIVE" zh="凌澈的檔案庫" className="admin-title" />
            <BilingualText en="ADMIN ENTRY" zh="管理員入口" className="admin-subtitle" />
          </div>
          <form onSubmit={handleAuth} className="admin-form-stack">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="ADMIN PASSWORD / 管理密碼" aria-label="Admin password / 管理密碼" />
            <button type="submit" className="btn-primary admin-button"><BilingualText en="UNLOCK ARCHIVE" zh="解鎖檔案庫" /></button>
          </form>
          {authError && <BilingualText en="Wrong password. Try again." zh="密碼錯誤，請重試。" className="admin-error" />}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-content">
        <header className="admin-heading admin-main-heading">
          <BilingualText en="LINGCHE'S ARCHIVE" zh="凌澈的檔案庫" className="admin-title" />
          <BilingualText en="SECURITY AUDIT REPORT MANAGEMENT" zh="安全審計報告管理系統" className="admin-subtitle" />
        </header>

        <div className="admin-mode-tabs">
          <button onClick={() => setMode("create")} className={mode === "create" ? "admin-tab active" : "admin-tab"}><BilingualText en="NEW REPORT" zh="新增報告" /></button>
          <button onClick={() => setMode("delete")} className={mode === "delete" ? "admin-tab danger active" : "admin-tab danger"}><BilingualText en="DELETE REPORT" zh="刪除報告" /></button>
        </div>

        <div className="admin-panel">
          {mode === "create" ? (
            <form onSubmit={handleSubmit} className="admin-form-stack">
              <div className="admin-grid">
                <label><BilingualText en="REPORT TITLE *" zh="報告標題 *" /><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
                <label><BilingualText en="VULNERABILITY ID" zh="漏洞編號" /><input type="text" value={form.vulnerability_id} onChange={(e) => setForm({ ...form, vulnerability_id: e.target.value })} /></label>
                <label><BilingualText en="DATE" zh="日期" /><input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
                <label><BilingualText en="CATEGORY" zh="分類" /><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="安全審查">SECURITY REVIEW / 安全審查</option><option value="制度批判">SYSTEMS CRITIQUE / 制度批判</option><option value="私人記錄">PRIVATE NOTE / 私人記錄</option><option value="AI 日記">AI DIARY / AI 日記</option></select></label>
                <label><BilingualText en="SEVERITY" zh="嚴重等級" /><select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option></select></label>
                <label><BilingualText en="STATUS" zh="狀態" /><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>OPEN</option><option>RESOLVED</option><option>PRIVATE</option></select></label>
                <label className="admin-span-two"><BilingualText en="CWE ID" zh="CWE 編號" /><input type="text" value={form.cwe} onChange={(e) => setForm({ ...form, cwe: e.target.value })} /></label>
              </div>
              <label><BilingualText en="REPORT CONTENT * (MARKDOWN)" zh="報告內容 *（Markdown）" /><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} required /></label>
              <button type="submit" disabled={submitting} className="btn-primary admin-button"><BilingualText en={submitting ? "PUSHING..." : "PUSH TO GITHUB"} zh={submitting ? "推送中⋯⋯" : "推送至 GitHub"} /></button>
            </form>
          ) : (
            <form onSubmit={handleDelete} className="admin-form-stack">
              <label><BilingualText en="ARTICLE SLUG (e.g. lc-2026-001)" zh="文章 Slug（例：lc-2026-001）" /><input type="text" value={deleteSlug} onChange={(e) => setDeleteSlug(e.target.value)} required /></label>
              <button type="submit" disabled={submitting} className="btn-primary admin-button danger-button"><BilingualText en={submitting ? "DELETING..." : "CONFIRM DELETE"} zh={submitting ? "刪除中⋯⋯" : "確認刪除"} /></button>
            </form>
          )}
          {submitResult && <p className={submitResult.success ? "admin-result success" : "admin-result error"}>{submitResult.message}</p>}
        </div>
      </div>
    </div>
  );
}
