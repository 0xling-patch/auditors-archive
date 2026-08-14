"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  detectBrowserLanguage,
  directionForLanguage,
  LANGUAGE_OPTIONS,
  languageOption,
  needsNativeTranslation,
  type SiteLanguage,
} from "@/lib/i18n";
import {
  supportsNativeTranslation,
  translateText,
  type TranslationProgress,
} from "@/lib/liveTranslation";

const LANGUAGE_STORAGE_KEY = "auditors-archive-language";

type LanguageContextValue = {
  language: SiteLanguage;
  isHydrated: boolean;
  welcomeOpen: boolean;
  translationProgress: TranslationProgress["status"] | "idle";
  downloadPercent: number | null;
  setLanguage: (language: SiteLanguage) => void;
  confirmLanguage: (language: SiteLanguage) => void;
  openLanguagePicker: () => void;
  closeLanguagePicker: () => void;
  reportTranslationProgress: (progress: TranslationProgress) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function progressPercent(progress: TranslationProgress) {
  if (!progress.loaded || !progress.total) return null;
  return Math.min(100, Math.round((progress.loaded / progress.total) * 100));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SiteLanguage>("en");
  const [isHydrated, setIsHydrated] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<LanguageContextValue["translationProgress"]>("idle");
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);

  const applyLanguage = useCallback((nextLanguage: SiteLanguage, persist: boolean) => {
    setLanguageState(nextLanguage);
    if (persist) window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && LANGUAGE_OPTIONS.some((option) => option.code === stored)) {
      applyLanguage(stored as SiteLanguage, false);
    } else {
      applyLanguage(detectBrowserLanguage(window.navigator.language), false);
      setWelcomeOpen(true);
    }
    setIsHydrated(true);
  }, [applyLanguage]);

  useEffect(() => {
    if (!isHydrated) return;
    const option = languageOption(language);
    document.documentElement.lang = option.locale;
    document.documentElement.dir = directionForLanguage(language);
    document.documentElement.dataset.primaryLanguage = language === "zh" ? "zh" : "en";
    document.documentElement.dataset.displayLanguage = language;
    if (!needsNativeTranslation(language)) {
      setTranslationProgress("idle");
      setDownloadPercent(null);
    }
  }, [isHydrated, language]);

  const reportTranslationProgress = useCallback((progress: TranslationProgress) => {
    setTranslationProgress(progress.status);
    setDownloadPercent(progressPercent(progress));
  }, []);

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    applyLanguage(nextLanguage, true);
  }, [applyLanguage]);

  const confirmLanguage = useCallback((nextLanguage: SiteLanguage) => {
    applyLanguage(nextLanguage, true);
    setWelcomeOpen(false);
  }, [applyLanguage]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    isHydrated,
    welcomeOpen,
    translationProgress,
    downloadPercent,
    setLanguage,
    confirmLanguage,
    openLanguagePicker: () => setWelcomeOpen(true),
    closeLanguagePicker: () => setWelcomeOpen(false),
    reportTranslationProgress,
  }), [
    language,
    isHydrated,
    welcomeOpen,
    translationProgress,
    downloadPercent,
    setLanguage,
    confirmLanguage,
    reportTranslationProgress,
  ]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <LanguageWelcome />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

function useNativeChineseTranslation(chineseText: React.ReactNode, fallback: React.ReactNode) {
  const { language, reportTranslationProgress } = useLanguage();
  const [translated, setTranslated] = useState<string | null>(null);
  const source = typeof chineseText === "string" ? chineseText : "";

  useEffect(() => {
    let cancelled = false;
    setTranslated(null);
    if (!source || !needsNativeTranslation(language)) return;

    translateText(source, language, reportTranslationProgress).then((result) => {
      if (!cancelled && result) setTranslated(result);
    });
    return () => {
      cancelled = true;
    };
  }, [language, reportTranslationProgress, source]);

  if (!needsNativeTranslation(language)) return null;
  return translated || fallback;
}

export function LanguageSwitcher() {
  const { language, setLanguage, openLanguagePicker } = useLanguage();

  return (
    <div className="language-switcher language-select-control" role="group" aria-label="Language settings">
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as SiteLanguage)}
        aria-label="Reading language / 閱讀語言"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeLabel} · {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="language-picker-trigger"
        onClick={openLanguagePicker}
        aria-label="Choose language / 選擇閱讀語言"
        title="Choose language / 選擇閱讀語言"
      >
        ↗
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
  const translated = useNativeChineseTranslation(zh, en);
  const isNativeLanguage = needsNativeTranslation(language);
  const primary = isNativeLanguage ? translated : language === "en" ? en : zh;
  const secondary = isNativeLanguage ? zh : language === "en" ? zh : en;

  return (
    <span id={id} className={`bilingual-text ${className}`}>
      <span className={`bilingual-primary ${primaryClassName}`}>{primary}</span>
      <span className={`bilingual-secondary ${secondaryClassName}`}>{secondary}</span>
    </span>
  );
}

export function TranslationStatusNotice() {
  const { language, translationProgress, downloadPercent } = useLanguage();
  if (!needsNativeTranslation(language) || translationProgress === "idle" || translationProgress === "ready") return null;

  const detail = translationProgress === "downloading"
    ? `瀏覽器正在準備 ${languageOption(language).nativeLabel} 語言包${downloadPercent === null ? "" : ` ${downloadPercent}%`}。`
    : translationProgress === "unavailable"
      ? "此瀏覽器不支援本機翻譯，已保留中英文內容。"
      : translationProgress === "error"
        ? "本機翻譯暫時無法使用，已保留中英文內容。"
        : "正在檢查瀏覽器本機翻譯功能。";

  return (
    <div className={`translation-status ${translationProgress}`} role="status" aria-live="polite">
      <span>LOCAL TRANSLATION</span>
      <p>{detail}</p>
    </div>
  );
}

function LanguageWelcome() {
  const { language, isHydrated, welcomeOpen, confirmLanguage, closeLanguagePicker } = useLanguage();
  const [draftLanguage, setDraftLanguage] = useState<SiteLanguage>(language);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (welcomeOpen) setDraftLanguage(language);
  }, [language, welcomeOpen]);

  useEffect(() => {
    setIsSupported(supportsNativeTranslation());
  }, []);

  if (!isHydrated || !welcomeOpen) return null;

  const suggested = detectBrowserLanguage(window.navigator.language);
  const translatesLocally = needsNativeTranslation(draftLanguage);

  return (
    <div className="language-welcome-backdrop" role="presentation">
      <section className="language-welcome" role="dialog" aria-modal="true" aria-labelledby="language-welcome-title">
        <span className="language-welcome-kicker">{"// READING PREFERENCE"}</span>
        <h2 id="language-welcome-title">選擇閱讀語言</h2>
        <p className="language-welcome-lead">Choose your preferred reading language for the archive.</p>
        <div className="language-option-grid" role="radiogroup" aria-label="Reading language">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              role="radio"
              aria-checked={draftLanguage === option.code}
              className={draftLanguage === option.code ? "language-card selected" : "language-card"}
              onClick={() => setDraftLanguage(option.code)}
            >
              <span>{option.nativeLabel}</span>
              <small>{option.label}</small>
              {suggested === option.code && <em>Suggested</em>}
            </button>
          ))}
        </div>
        {translatesLocally && (
          <p className={isSupported ? "language-welcome-note" : "language-welcome-note warning"}>
            {isSupported
              ? "支援的瀏覽器會在你的裝置上下載並執行內建翻譯模型；文章內容不會傳至本站伺服器或翻譯 API。"
              : "你的瀏覽器可能不支援本機 Translator API；網站仍會保留可閱讀的英文與中文回退內容。"}
          </p>
        )}
        <div className="language-welcome-actions">
          <button type="button" className="language-confirm" onClick={() => confirmLanguage(draftLanguage)}>
            進入檔案庫 <span aria-hidden="true">↗</span>
          </button>
          <button type="button" className="language-cancel" onClick={closeLanguagePicker}>取消 / Cancel</button>
        </div>
      </section>
    </div>
  );
}

export type { SiteLanguage as Language };
