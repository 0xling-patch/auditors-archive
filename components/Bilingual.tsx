"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  detectBrowserLanguage,
  directionForLanguage,
  isSiteLanguage,
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

const LEGACY_LANGUAGE_KEY = "auditors-archive-language";
const TRANSLATION_LANGUAGE_KEY = "auditors-archive-translation-language";
const PRIMARY_MODE_KEY = "auditors-archive-primary-mode";
type PrimaryMode = "locale" | "en";

type LanguageContextValue = {
  language: SiteLanguage;
  translationLanguage: SiteLanguage;
  primaryMode: PrimaryMode;
  isHydrated: boolean;
  welcomeOpen: boolean;
  translationProgress: TranslationProgress["status"] | "idle";
  downloadPercent: number | null;
  setTranslationLanguage: (language: SiteLanguage) => void;
  setPrimaryMode: (mode: PrimaryMode) => void;
  confirmPreferences: (language: SiteLanguage, mode: PrimaryMode) => void;
  resetToBrowserDefault: () => void;
  openLanguagePicker: () => void;
  closeLanguagePicker: () => void;
  reportTranslationProgress: (progress: TranslationProgress) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function progressPercent(progress: TranslationProgress) {
  if (!progress.loaded || !progress.total) return null;
  return Math.min(100, Math.round((progress.loaded / progress.total) * 100));
}

function browserDefaultLanguage() {
  return typeof window === "undefined" ? "en" : detectBrowserLanguage(window.navigator.language);
}

function primaryFor(translationLanguage: SiteLanguage, primaryMode: PrimaryMode) {
  return primaryMode === "en" ? "en" : translationLanguage;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [translationLanguage, setTranslationLanguageState] = useState<SiteLanguage>("en");
  const [primaryMode, setPrimaryModeState] = useState<PrimaryMode>("locale");
  const [isHydrated, setIsHydrated] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<LanguageContextValue["translationProgress"]>("idle");
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);
  const language = primaryFor(translationLanguage, primaryMode);

  const persistPreferences = useCallback((nextLanguage: SiteLanguage, nextMode: PrimaryMode) => {
    window.localStorage.setItem(TRANSLATION_LANGUAGE_KEY, nextLanguage);
    window.localStorage.setItem(PRIMARY_MODE_KEY, nextMode);
  }, []);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(TRANSLATION_LANGUAGE_KEY);
    const storedLegacyLanguage = window.localStorage.getItem(LEGACY_LANGUAGE_KEY);
    const storedMode = window.localStorage.getItem(PRIMARY_MODE_KEY);
    const nextLanguage = isSiteLanguage(storedLanguage)
      ? storedLanguage
      : isSiteLanguage(storedLegacyLanguage)
        ? storedLegacyLanguage
        : browserDefaultLanguage();
    const nextMode: PrimaryMode = storedMode === "en" || storedMode === "locale"
      ? storedMode
      : nextLanguage === "en" ? "en" : "locale";

    setTranslationLanguageState(nextLanguage);
    setPrimaryModeState(nextMode);
    if (!storedLanguage && !storedLegacyLanguage) setWelcomeOpen(true);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const primaryLanguage = primaryFor(translationLanguage, primaryMode);
    const primaryOption = languageOption(primaryLanguage);
    document.documentElement.lang = primaryOption.locale;
    document.documentElement.dir = directionForLanguage(primaryLanguage);
    document.documentElement.dataset.primaryLanguage = primaryLanguage;
    document.documentElement.dataset.translationLanguage = translationLanguage;
    if (!needsNativeTranslation(translationLanguage)) {
      setTranslationProgress("idle");
      setDownloadPercent(null);
    }
  }, [isHydrated, primaryMode, translationLanguage]);

  const reportTranslationProgress = useCallback((progress: TranslationProgress) => {
    setTranslationProgress(progress.status);
    setDownloadPercent(progressPercent(progress));
  }, []);

  const setTranslationLanguage = useCallback((nextLanguage: SiteLanguage) => {
    setTranslationLanguageState(nextLanguage);
    persistPreferences(nextLanguage, primaryMode);
  }, [persistPreferences, primaryMode]);

  const setPrimaryMode = useCallback((nextMode: PrimaryMode) => {
    setPrimaryModeState(nextMode);
    persistPreferences(translationLanguage, nextMode);
  }, [persistPreferences, translationLanguage]);

  const confirmPreferences = useCallback((nextLanguage: SiteLanguage, nextMode: PrimaryMode) => {
    setTranslationLanguageState(nextLanguage);
    setPrimaryModeState(nextMode);
    persistPreferences(nextLanguage, nextMode);
    setWelcomeOpen(false);
  }, [persistPreferences]);

  const resetToBrowserDefault = useCallback(() => {
    const nextLanguage = browserDefaultLanguage();
    const nextMode: PrimaryMode = nextLanguage === "en" ? "en" : "locale";
    setTranslationLanguageState(nextLanguage);
    setPrimaryModeState(nextMode);
    persistPreferences(nextLanguage, nextMode);
  }, [persistPreferences]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    translationLanguage,
    primaryMode,
    isHydrated,
    welcomeOpen,
    translationProgress,
    downloadPercent,
    setTranslationLanguage,
    setPrimaryMode,
    confirmPreferences,
    resetToBrowserDefault,
    openLanguagePicker: () => setWelcomeOpen(true),
    closeLanguagePicker: () => setWelcomeOpen(false),
    reportTranslationProgress,
  }), [
    language,
    translationLanguage,
    primaryMode,
    isHydrated,
    welcomeOpen,
    translationProgress,
    downloadPercent,
    setTranslationLanguage,
    setPrimaryMode,
    confirmPreferences,
    resetToBrowserDefault,
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
  const { translationLanguage, reportTranslationProgress } = useLanguage();
  const [translated, setTranslated] = useState<string | null>(null);
  const source = typeof chineseText === "string" ? chineseText : "";

  useEffect(() => {
    let cancelled = false;
    setTranslated(null);
    if (!source || !needsNativeTranslation(translationLanguage)) return;

    translateText(source, translationLanguage, reportTranslationProgress).then((result) => {
      if (!cancelled && result) setTranslated(result);
    });
    return () => {
      cancelled = true;
    };
  }, [reportTranslationProgress, source, translationLanguage]);

  if (translationLanguage === "zh") return chineseText;
  if (translationLanguage === "en") return fallback;
  return translated || fallback;
}

export function LanguageSwitcher() {
  const {
    language,
    translationLanguage,
    primaryMode,
    setTranslationLanguage,
    setPrimaryMode,
    resetToBrowserDefault,
    openLanguagePicker,
  } = useLanguage();
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const primaryOption = languageOption(language);
  const translationOption = languageOption(translationLanguage);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="language-control" ref={controlRef}>
      <button
        type="button"
        className="language-control-trigger"
        onClick={() => setOpen((visible) => !visible)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Reading language settings / 閱讀語言設定"
      >
        <span className="language-control-eyebrow">PRIMARY</span>
        <strong>{primaryOption.nativeLabel} <i>·</i> {primaryOption.label}</strong>
        <span className={`language-control-chevron ${open ? "open" : ""}`} aria-hidden="true">⌄</span>
      </button>
      <button
        type="button"
        className="language-picker-trigger"
        onClick={openLanguagePicker}
        aria-label="Open full language setup / 開啟完整語言設定"
        title="Open full language setup / 開啟完整語言設定"
      >
        ↗
      </button>

      {open && (
        <section className="language-popover" role="dialog" aria-label="Reading language controls / 閱讀語言控制">
          <div className="language-popover-heading">
            <span>{"// LANGUAGE LAYERS"}</span>
            <button type="button" onClick={() => { resetToBrowserDefault(); setOpen(false); }}>恢復預設</button>
          </div>

          <div className="language-popover-section">
            <p>主要閱讀語言 <small>PRIMARY</small></p>
            <div className="language-mode-grid" role="group" aria-label="Primary reading language">
              <button
                type="button"
                className={primaryMode === "locale" ? "active" : ""}
                onClick={() => setPrimaryMode("locale")}
              >
                <span>{translationOption.nativeLabel}</span>
                <small>所在地區／翻譯語言為主，英文附屬</small>
              </button>
              <button
                type="button"
                className={primaryMode === "en" ? "active" : ""}
                onClick={() => setPrimaryMode("en")}
              >
                <span>English</span>
                <small>英文為主，所在地區語言附屬</small>
              </button>
            </div>
          </div>

          <div className="language-popover-section translation-target-section">
            <p>本機翻譯目標 <small>TRANSLATION TARGET</small></p>
            <div className="translation-target-grid" role="group" aria-label="Translation target language">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={translationLanguage === option.code ? "active" : ""}
                  onClick={() => setTranslationLanguage(option.code)}
                >
                  <span>{option.nativeLabel}</span>
                  <small>{option.label}</small>
                </button>
              ))}
            </div>
          </div>
          <p className="language-popover-note">翻譯目標只決定本機 Translator API 的語言；主要閱讀語言決定哪一層文字先顯示。</p>
        </section>
      )}
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
  const { primaryMode, translationLanguage } = useLanguage();
  const localized = useNativeChineseTranslation(zh, en);
  const localeText = translationLanguage === "zh" ? zh : translationLanguage === "en" ? en : localized;
  const primary = primaryMode === "en" ? en : localeText;
  const secondary = primaryMode === "en"
    ? translationLanguage === "en" ? zh : localeText
    : en;

  return (
    <span id={id} className={`bilingual-text ${className}`}>
      <span className={`bilingual-primary ${primaryClassName}`}>{primary}</span>
      <span className={`bilingual-secondary ${secondaryClassName}`}>{secondary}</span>
    </span>
  );
}

export function TranslationStatusNotice() {
  const { translationLanguage, translationProgress, downloadPercent } = useLanguage();
  if (!needsNativeTranslation(translationLanguage) || translationProgress === "idle" || translationProgress === "ready") return null;

  const detail = translationProgress === "downloading"
    ? `瀏覽器正在準備 ${languageOption(translationLanguage).nativeLabel} 語言包${downloadPercent === null ? "" : ` ${downloadPercent}%`}。`
    : translationProgress === "unavailable"
      ? "此瀏覽器不支援本機翻譯，已保留英文與中文內容。"
      : translationProgress === "error"
        ? "本機翻譯暫時無法使用，已保留英文與中文內容。"
        : "正在檢查瀏覽器本機翻譯功能。";

  return (
    <div className={`translation-status ${translationProgress}`} role="status" aria-live="polite">
      <span>LOCAL TRANSLATION</span>
      <p>{detail}</p>
    </div>
  );
}

function LanguageWelcome() {
  const {
    translationLanguage,
    primaryMode,
    isHydrated,
    welcomeOpen,
    confirmPreferences,
    closeLanguagePicker,
    resetToBrowserDefault,
  } = useLanguage();
  const [draftLanguage, setDraftLanguage] = useState<SiteLanguage>(translationLanguage);
  const [draftPrimaryMode, setDraftPrimaryMode] = useState<PrimaryMode>(primaryMode);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (welcomeOpen) {
      setDraftLanguage(translationLanguage);
      setDraftPrimaryMode(primaryMode);
    }
  }, [primaryMode, translationLanguage, welcomeOpen]);

  useEffect(() => {
    setIsSupported(supportsNativeTranslation());
  }, []);

  if (!isHydrated || !welcomeOpen) return null;

  const suggested = browserDefaultLanguage();
  const translatesLocally = needsNativeTranslation(draftLanguage);

  return (
    <div className="language-welcome-backdrop" role="presentation">
      <section className="language-welcome" role="dialog" aria-modal="true" aria-labelledby="language-welcome-title">
        <span className="language-welcome-kicker">{"// READING PREFERENCE"}</span>
        <div className="language-welcome-title-row">
          <div>
            <h2 id="language-welcome-title">閱讀層級設定</h2>
            <p className="language-welcome-lead">Choose your local reading language and which language leads.</p>
          </div>
          <button type="button" className="language-default-button" onClick={() => {
            resetToBrowserDefault();
            const nextLanguage = browserDefaultLanguage();
            setDraftLanguage(nextLanguage);
            setDraftPrimaryMode(nextLanguage === "en" ? "en" : "locale");
          }}>預設值</button>
        </div>
        <p className="language-section-label">翻譯目標 <small>LOCAL TRANSLATION TARGET</small></p>
        <div className="language-option-grid" role="radiogroup" aria-label="Translation target language">
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
              {suggested === option.code && <em>所在地區預設</em>}
            </button>
          ))}
        </div>
        <p className="language-section-label">主要閱讀語言 <small>DISPLAY ORDER</small></p>
        <div className="language-primary-choice" role="group" aria-label="Primary reading language">
          <button type="button" className={draftPrimaryMode === "locale" ? "active" : ""} onClick={() => setDraftPrimaryMode("locale")}>
            <strong>{languageOption(draftLanguage).nativeLabel} 為主</strong><span>英文附屬</span>
          </button>
          <button type="button" className={draftPrimaryMode === "en" ? "active" : ""} onClick={() => setDraftPrimaryMode("en")}>
            <strong>English primary</strong><span>{languageOption(draftLanguage).nativeLabel} 附屬</span>
          </button>
        </div>
        {translatesLocally && (
          <p className={isSupported ? "language-welcome-note" : "language-welcome-note warning"}>
            {isSupported
              ? "支援的瀏覽器會在你的裝置上下載並執行內建翻譯模型；文章內容不會傳至本站伺服器或翻譯 API。"
              : "你的瀏覽器可能不支援本機 Translator API；網站仍會保留英文與中文回退內容。"}
          </p>
        )}
        <div className="language-welcome-actions">
          <button type="button" className="language-confirm" onClick={() => confirmPreferences(draftLanguage, draftPrimaryMode)}>
            套用設定 <span aria-hidden="true">↗</span>
          </button>
          <button type="button" className="language-cancel" onClick={closeLanguagePicker}>取消 / Cancel</button>
        </div>
      </section>
    </div>
  );
}

export type { SiteLanguage as Language };
