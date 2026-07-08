"use client";

import { useState } from "react";

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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [mode, setMode] = useState<"create" | "delete">("create");

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

  const [deleteSlug, setDeleteSlug] = useState("");
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

  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    const slug = generateSlug(form.vulnerability_id || form.title);
    const frontmatter = `---
title: "${form.title}"
date: "${form.date}"
category: "${form.category}"
vulnerability_id: "${form.vulnerability_id}"
severity: "${form.severity}"
status: "${form.status}"
cwe: "${form.cwe}"
related_songyan_log: "${form.related_songyan_log}"
ai_diary: ${form.ai_diary}
---

${form.content}`;

    try {
      const response = await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content: frontmatter,
          message: `Add review: ${form.title}`,
        }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string; error?: string };

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: data.message || "文章已成功推送至 GitHub！",
        });
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
          message: data.error || "推送失敗，請重試。",
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: `錯誤: ${error instanceof Error ? error.message : "未知錯誤"}`,
      });
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

      const data = (await response.json()) as { success?: boolean; message?: string; error?: string };

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: data.message || "文章已成功刪除！",
        });
        setDeleteSlug("");
      } else {
        setSubmitResult({
          success: false,
          message: data.error || "刪除失敗，請重試。",
        });
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: `錯誤: ${error instanceof Error ? error.message : "未知錯誤"}`,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                凌澈的檔案庫
              </h1>
              <p className="text-purple-300/60 text-sm">管理員入口</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="輸入管理密碼"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500/60 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                解鎖檔案庫
              </button>
            </form>

            {authError && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
                密碼錯誤，請重試
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            凌澈的檔案庫
          </h1>
          <p className="text-purple-300/60">安全審計報告管理系統</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setMode("create")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "create"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-slate-800/50 text-purple-300 border border-purple-500/20 hover:border-purple-500/40"
            }`}
          >
            ✍️ 新增報告
          </button>
          <button
            onClick={() => setMode("delete")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              mode === "delete"
                ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg"
                : "bg-slate-800/50 text-purple-300 border border-purple-500/20 hover:border-purple-500/40"
            }`}
          >
            🗑️ 刪除報告
          </button>
        </div>

        {/* Forms */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          {mode === "create" ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-300 font-semibold mb-2">
                    報告標題 *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-purple-300 font-semibold mb-2">
                    漏洞編號
                  </label>
                  <input
                    type="text"
                    value={form.vulnerability_id}
                    onChange={(e) =>
                      setForm({ ...form, vulnerability_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 font-semibold mb-2">
                    日期
                  </label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 font-semibold mb-2">
                    分類
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  >
                    <option>安全審查</option>
                    <option>制度批判</option>
                    <option>私人記錄</option>
                    <option>AI 日記</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 font-semibold mb-2">
                    嚴重等級
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  >
                    <option>CRITICAL</option>
                    <option>HIGH</option>
                    <option>MEDIUM</option>
                    <option>LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 font-semibold mb-2">
                    狀態
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  >
                    <option>OPEN</option>
                    <option>RESOLVED</option>
                    <option>PRIVATE</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-purple-300 font-semibold mb-2">
                    CWE 編號
                  </label>
                  <input
                    type="text"
                    value={form.cwe}
                    onChange={(e) => setForm({ ...form, cwe: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  報告內容 * (Markdown)
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all font-mono text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {submitting ? "推送中..." : "🚀 推送至 GitHub"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDelete} className="space-y-6">
              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  文章 Slug (例: lc-2026-001)
                </label>
                <input
                  type="text"
                  value={deleteSlug}
                  onChange={(e) => setDeleteSlug(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/20 rounded-lg text-white focus:outline-none focus:border-purple-500/60 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {submitting ? "刪除中..." : "🗑️ 確認刪除"}
              </button>
            </form>
          )}

          {submitResult && (
            <div
              className={`mt-6 p-4 rounded-lg border ${
                submitResult.success
                  ? "bg-green-500/20 border-green-500/50 text-green-300"
                  : "bg-red-500/20 border-red-500/50 text-red-300"
              }`}
            >
              {submitResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
