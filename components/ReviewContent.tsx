"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LOCALE_OPTIONS, useAutoTranslations, useLanguage } from "./Bilingual";

type Block = {
  kind: "heading" | "list" | "paragraph";
  level?: 1 | 2 | 3;
  marker?: string;
  text: string;
};

interface ReviewContentProps {
  content: string;
  contentEn?: string;
}

function parseBlocks(markdown: string): Block[] {
  return markdown
    .trim()
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        return {
          kind: "heading" as const,
          level: heading[1].length as 1 | 2 | 3,
          text: heading[2],
        };
      }

      const list = line.match(/^((?:\d+\.)|-)\s+(.+)$/);
      if (list) return { kind: "list" as const, marker: list[1], text: list[2] };
      return { kind: "paragraph" as const, text: line };
    });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function blockHtml(block: Block) {
  const body = inlineMarkdown(block.text);
  if (block.kind === "heading") return `<h${block.level}>${body}</h${block.level}>`;
  if (block.kind === "list") return `<div class="review-list-item"><span class="review-list-marker">${block.marker}</span>${body}</div>`;
  return `<p>${body}</p>`;
}

function blockKey(block: Block | undefined, index: number) {
  return `${block?.kind || "empty"}-${index}`;
}

export default function ReviewContent({ content, contentEn }: ReviewContentProps) {
  const { language, locale, isAutoTranslationLocale } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const techRef = useRef<HTMLDivElement>(null);
  const chineseBlocks = useMemo(() => parseBlocks(content), [content]);
  const englishBlocks = useMemo(() => parseBlocks(contentEn || content), [content, contentEn]);
  const translatedChineseBlocks = useAutoTranslations(
    chineseBlocks.map((block) => block.text),
    englishBlocks.map((block) => block.text)
  );
  const blockCount = Math.max(chineseBlocks.length, englishBlocks.length);
  const localeName = LOCALE_OPTIONS.find((option) => option.code === locale)?.nativeName || locale;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setIsActive(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.1 }
    );
    if (techRef.current) observer.observe(techRef.current);
    return () => observer.disconnect();
  }, [blockCount]);

  return (
    <div className={`left-plum-line review-content ${isActive ? "active" : ""}`}>
      {isAutoTranslationLocale && (
        <div className="machine-translation-note" role="status">
          <span>AUTO TRANSLATION</span>
          <span>{localeName} · 中文原文附於下方</span>
        </div>
      )}
      {Array.from({ length: blockCount }).map((_, index) => {
        const zh = chineseBlocks[index] || chineseBlocks[chineseBlocks.length - 1];
        const en = englishBlocks[index] || englishBlocks[englishBlocks.length - 1];
        const translatedText = translatedChineseBlocks[index] || en?.text || zh?.text || "";
        const translatedBlock = zh ? { ...zh, text: translatedText } : en;
        const isTechnical = /技術|technical|technical analysis/i.test(`${zh?.text || ""} ${en?.text || ""}`);
        const primaryBlock = isAutoTranslationLocale ? translatedBlock : language === "en" ? en : zh;
        const secondaryBlock = isAutoTranslationLocale ? zh : language === "en" ? zh : en;

        return (
          <div
            key={blockKey(primaryBlock, index)}
            ref={isTechnical ? techRef : undefined}
            className={`bilingual-review-block bilingual-review-${primaryBlock?.kind || "paragraph"}`}
          >
            <div
              className="bilingual-review-primary"
              dangerouslySetInnerHTML={{ __html: blockHtml(primaryBlock || { kind: "paragraph", text: "" }) }}
            />
            <div
              className="bilingual-review-secondary"
              dangerouslySetInnerHTML={{ __html: blockHtml(secondaryBlock || { kind: "paragraph", text: "" }) }}
            />
          </div>
        );
      })}
    </div>
  );
}
