interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  ADMIN_SECRET: string;
}

interface CommitRequest {
  slug: string;
  content: string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestPost = async (context: any) => {
  const { request, env }: { request: Request; env: Env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // 驗證必要環境變數
  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return new Response(
      JSON.stringify({
        error: "伺服器設定不完整。請在 Cloudflare Pages 控制台設定 GITHUB_TOKEN、GITHUB_OWNER、GITHUB_REPO 環境變數。",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  let body: CommitRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "無效的請求格式。" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const { slug, content, message } = body;

  if (!slug || !content) {
    return new Response(
      JSON.stringify({ error: "slug 和 content 為必填欄位。" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const filePath = `content/reviews/${slug}.md`;
  const encodedContent = btoa(unescape(encodeURIComponent(content)));

  // 先嘗試取得現有檔案的 SHA（用於更新）
  let existingSha: string | undefined;
  try {
    const checkResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "auditors-archive-admin",
        },
      }
    );

    if (checkResponse.ok) {
      const fileData = await checkResponse.json() as { sha: string };
      existingSha = fileData.sha;
    }
  } catch {
    // 檔案不存在，繼續創建
  }

  // 推送至 GitHub
  const commitBody: Record<string, unknown> = {
    message: message || `feat: add ${slug}`,
    content: encodedContent,
    committer: {
      name: "凌澈 / Auditor",
      email: "auditor@boundary.local",
    },
  };

  if (existingSha) {
    commitBody.sha = existingSha;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "auditors-archive-admin",
        },
        body: JSON.stringify(commitBody),
      }
    );

    const responseData = await response.json() as { message?: string; content?: { html_url?: string } };

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: `GitHub API 錯誤：${responseData.message || response.statusText}`,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "已成功推送至 GitHub。Cloudflare Pages 將自動觸發重新構建。",
        url: responseData.content?.html_url,
        file: filePath,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: `推送失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestDelete = async (context: any) => {
  const { request, env }: { request: Request; env: Env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO) {
    return new Response(
      JSON.stringify({
        error: "伺服器設定不完整。",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  let body: { slug: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "無效的請求格式。" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const { slug } = body;

  if (!slug) {
    return new Response(
      JSON.stringify({ error: "slug 為必填欄位。" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const filePath = `content/reviews/${slug}.md`;

  try {
    // 先取得檔案的 SHA
    const getResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "auditors-archive-admin",
        },
      }
    );

    if (!getResponse.ok) {
      return new Response(
        JSON.stringify({ error: "檔案不存在。" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const fileData = await getResponse.json() as { sha: string };
    const sha = fileData.sha;

    // 刪除檔案
    const deleteResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "auditors-archive-admin",
        },
        body: JSON.stringify({
          message: `Delete review: ${slug}`,
          sha: sha,
          committer: {
            name: "凌澈 / Auditor",
            email: "auditor@boundary.local",
          },
        }),
      }
    );

    const responseData = await deleteResponse.json() as { message?: string };

    if (!deleteResponse.ok) {
      return new Response(
        JSON.stringify({
          error: `GitHub API 錯誤：${responseData.message || deleteResponse.statusText}`,
        }),
        {
          status: deleteResponse.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "已成功刪除文章。Cloudflare Pages 將自動觸發重新構建。",
        file: filePath,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: `刪除失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
