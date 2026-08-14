"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "auditors-archive-translation-suggestion-dismissed";

function isChineseOrEnglish(language: string) {
  const normalized = language.toLowerCase();
  return normalized.startsWith("zh") || normalized.startsWith("en");
}

export default function TranslationSuggestion() {
  const [browserLanguage, setBrowserLanguage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const languages = window.navigator.languages?.length
      ? window.navigator.languages
      : [window.navigator.language];
    const preferredLanguage = languages.find((language) => !isChineseOrEnglish(language));

    if (!preferredLanguage) return;
    if (window.sessionStorage.getItem(DISMISS_KEY) === "1") return;

    setBrowserLanguage(preferredLanguage);
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  return (
    <aside className="translation-suggestion" role="status" aria-label="Translation tool suggestion">
      <div className="translation-suggestion-copy">
        <span className="translation-suggestion-label">READING NOTE</span>
        <p>
          偵測到你的瀏覽器偏好語言為 <strong>{browserLanguage}</strong>。本站目前提供中英對照；如需要其他語言，可自行使用翻譯工具。
        </p>
        <p className="translation-suggestion-subcopy">
          Detected browser language: <strong>{browserLanguage}</strong>. This archive is available in Chinese and English. You may choose an external translation tool for another language.
        </p>
      </div>
      <div className="translation-suggestion-actions">
        <a href="https://translate.google.com/" target="_blank" rel="noreferrer">Google 翻譯 <span aria-hidden="true">↗</span></a>
        <a href="https://fanyi.qq.com/" target="_blank" rel="noreferrer">騰訊翻譯 <span aria-hidden="true">↗</span></a>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.setItem(DISMISS_KEY, "1");
            setIsVisible(false);
          }}
        >
          知道了 <span aria-hidden="true">×</span>
        </button>
      </div>
      <p className="translation-suggestion-privacy">文章不會由本站自動傳送至任何第三方翻譯服務。 / No article text is automatically sent by this site.</p>
    </aside>
  );
}
