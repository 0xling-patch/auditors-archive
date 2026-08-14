"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "zh";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("auditors-archive-language");
    if (stored === "zh" || stored === "en") setLanguageState(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("auditors-archive-language", language);
    document.documentElement.lang = language === "en" ? "en" : "zh-TW";
    document.documentElement.dataset.primaryLanguage = language;
  }, [language]);

  const setLanguage = (next: Language) => setLanguageState(next);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher" role="group" aria-label="Primary language">
      <button
        type="button"
        className={language === "en" ? "language-option active" : "language-option"}
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
      >
        EN
      </button>
      <span className="language-divider" aria-hidden="true">/</span>
      <button
        type="button"
        className={language === "zh" ? "language-option active" : "language-option"}
        onClick={() => setLanguage("zh")}
        aria-pressed={language === "zh"}
      >
        中文
      </button>
    </div>
  );
}

type BilingualTextProps = {
  en: React.ReactNode;
  zh: React.ReactNode;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  id?: string;
};

export function BilingualText({
  en,
  zh,
  className = "",
  primaryClassName = "",
  secondaryClassName = "",
  id,
}: BilingualTextProps) {
  const { language } = useLanguage();
  const primary = language === "en" ? en : zh;
  const secondary = language === "en" ? zh : en;

  return (
    <span id={id} className={`bilingual-text ${className}`}>
      <span className={`bilingual-primary ${primaryClassName}`}>{primary}</span>
      <span className={`bilingual-secondary ${secondaryClassName}`}>{secondary}</span>
    </span>
  );
}

export type { Language };
