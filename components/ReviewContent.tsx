"use client";

import { useEffect, useRef, useState } from "react";

interface ReviewContentProps {
  content: string;
}

// 簡易 Markdown 轉 HTML（不使用外部庫避免 SSR 問題）
function parseMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^(\d+\. .+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|l|p])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

export default function ReviewContent({ content }: ReviewContentProps) {
  const [isActive, setIsActive] = useState(false);
  const techRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsActive(true);
          } else {
            setIsActive(false);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (techRef.current) {
      observer.observe(techRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const html = parseMarkdown(content);

  // 找到技術細節段落
  const hasTechSection = content.includes("技術細節");

  return (
    <div
      className={`left-plum-line review-content ${isActive ? "active" : ""}`}
      style={{ paddingLeft: "32px" }}
    >
      {hasTechSection ? (
        <>
          {/* 技術細節之前的內容 */}
          <div
            dangerouslySetInnerHTML={{
              __html: html.split("<h3>技術細節</h3>")[0],
            }}
          />
          {/* 技術細節段落（觸發垂直線亮起） */}
          <div ref={techRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: "<h3>技術細節</h3>" + (html.split("<h3>技術細節</h3>")[1] || ""),
              }}
            />
          </div>
        </>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}
