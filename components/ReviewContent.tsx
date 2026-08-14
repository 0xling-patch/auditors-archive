"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "./Bilingual";
import { needsNativeTranslation } from "@/lib/i18n";
import { translateText } from "@/lib/liveTranslation";

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
      if (heading) return { kind: "heading" as const, level: heading[1].length as 1 | 2 | 3, text: heading[2] };
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

function RenderBlock({ block, className }: { block: Block; className: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: blockHtml(block) }} />;
}

function LayeredReviewBlock({ chinese, english, isTechnical }: { chinese: Block; english: Block; isTechnical: boolean }) {
  const { primaryMode, translationLanguage, reportTranslationProgress } = useLanguage();
  const [translated, setTranslated] = useState<string | null>(null);
  const techRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setTranslated(null);
    if (!needsNativeTranslation(translationLanguage)) return;
    translateText(chinese.text, translationLanguage, reportTranslationProgress).then((result) => {
      if (!cancelled && result) setTranslated(result);
    });
    return () => {
      cancelled = true;
    };
  }, [chinese.text, reportTranslationProgress, translationLanguage]);

  const localized = translationLanguage === "zh"
    ? chinese
    : translationLanguage === "en"
      ? english
      : { ...chinese, text: translated || english.text || chinese.text };
  const primary = primaryMode === "en" ? english : localized;
  const secondary = primaryMode === "en"
    ? translationLanguage === "en" ? chinese : localized
    : english;

  return (
    <div
      ref={isTechnical ? techRef : undefined}
      className={`bilingual-review-block bilingual-review-${primary.kind}`}
    >
      <RenderBlock block={primary} className="bilingual-review-primary" />
      <RenderBlock block={secondary} className="bilingual-review-secondary" />
    </div>
  );
}

export default function ReviewContent({ content, contentEn }: ReviewContentProps) {
  const [isActive, setIsActive] = useState(false);
  const chineseBlocks = useMemo(() => parseBlocks(content), [content]);
  const englishBlocks = useMemo(() => parseBlocks(contentEn || content), [content, contentEn]);
  const blockCount = Math.max(chineseBlocks.length, englishBlocks.length);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setIsActive(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.1 }
    );
    const technicalBlock = document.querySelector<HTMLElement>(".review-content .bilingual-review-block");
    if (technicalBlock) observer.observe(technicalBlock);
    return () => observer.disconnect();
  }, [blockCount]);

  return (
    <div className={`left-plum-line review-content ${isActive ? "active" : ""}`}>
      {Array.from({ length: blockCount }).map((_, index) => {
        const zh = chineseBlocks[index] || chineseBlocks[chineseBlocks.length - 1] || { kind: "paragraph" as const, text: "" };
        const en = englishBlocks[index] || englishBlocks[englishBlocks.length - 1] || zh;
        const isTechnical = /技術|technical|technical analysis/i.test(`${zh.text} ${en.text}`);
        return <LayeredReviewBlock key={blockKey(zh, index)} chinese={zh} english={en} isTechnical={isTechnical} />;
      })}
    </div>
  );
}
