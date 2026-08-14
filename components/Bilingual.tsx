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

export type Language = "en" | "zh";
export type Locale = Language | "ja" | "ko" | "es" | "fr" | "de" | "pt" | "id" | "th" | "vi";
type TranslationStatus = "idle" | "downloading" | "translating" | "ready" | "error";

type LocaleDefinition = {
  code: Locale;
  label: string;
  nativeName: string;
  htmlLang: string;
};

type RegionDefinition = {
  code: string;
  en: string;
  zh: string;
  defaultLocale: Locale;
};

type WorkerResponse = {
  type: "status" | "progress" | "result" | "error";
  id?: string;
  status?: TranslationStatus;
  progress?: number | null;
  detail?: string;
  translations?: string[];
};

export const LOCALE_OPTIONS: LocaleDefinition[] = [
  { code: "zh", label: "Traditional Chinese", nativeName: "繁體中文", htmlLang: "zh-TW" },
  { code: "en", label: "English", nativeName: "English", htmlLang: "en" },
  { code: "ja", label: "Japanese", nativeName: "日本語", htmlLang: "ja" },
  { code: "ko", label: "Korean", nativeName: "한국어", htmlLang: "ko" },
  { code: "es", label: "Spanish", nativeName: "Español", htmlLang: "es" },
  { code: "fr", label: "French", nativeName: "Français", htmlLang: "fr" },
  { code: "de", label: "German", nativeName: "Deutsch", htmlLang: "de" },
  { code: "pt", label: "Portuguese", nativeName: "Português", htmlLang: "pt" },
  { code: "id", label: "Indonesian", nativeName: "Bahasa Indonesia", htmlLang: "id" },
  { code: "th", label: "Thai", nativeName: "ไทย", htmlLang: "th" },
  { code: "vi", label: "Vietnamese", nativeName: "Tiếng Việt", htmlLang: "vi" },
];

const REGION_OPTIONS: RegionDefinition[] = [
  { code: "TW", en: "Taiwan", zh: "臺灣", defaultLocale: "zh" },
  { code: "HK", en: "Hong Kong", zh: "香港", defaultLocale: "zh" },
  { code: "MO", en: "Macau", zh: "澳門", defaultLocale: "zh" },
  { code: "JP", en: "Japan", zh: "日本", defaultLocale: "ja" },
  { code: "KR", en: "South Korea", zh: "南韓", defaultLocale: "ko" },
  { code: "SG", en: "Singapore", zh: "新加坡", defaultLocale: "en" },
  { code: "US", en: "United States", zh: "美國", defaultLocale: "en" },
  { code: "GB", en: "United Kingdom", zh: "英國", defaultLocale: "en" },
  { code: "AU", en: "Australia", zh: "澳洲", defaultLocale: "en" },
  { code: "CA", en: "Canada", zh: "加拿大", defaultLocale: "en" },
  { code: "ES", en: "Spain", zh: "西班牙", defaultLocale: "es" },
  { code: "MX", en: "Mexico / Latin America", zh: "墨西哥／拉丁美洲", defaultLocale: "es" },
  { code: "FR", en: "France", zh: "法國", defaultLocale: "fr" },
  { code: "DE", en: "Germany", zh: "德國", defaultLocale: "de" },
  { code: "BR", en: "Brazil", zh: "巴西", defaultLocale: "pt" },
  { code: "ID", en: "Indonesia", zh: "印尼", defaultLocale: "id" },
  { code: "TH", en: "Thailand", zh: "泰國", defaultLocale: "th" },
  { code: "VN", en: "Vietnam", zh: "越南", defaultLocale: "vi" },
  { code: "OTHER", en: "Other region", zh: "其他地區", defaultLocale: "en" },
];

const PREFERENCES_KEY = "auditors-archive-preferences-v1";
const TRANSLATION_CACHE_PREFIX = "auditors-archive-local-translation-v1";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALE_OPTIONS.some((option) => option.code === value);
}

function isAutoTranslationLocale(locale: Locale) {
  return locale !== "zh" && locale !== "en";
}

function localeDefinition(locale: Locale) {
  return LOCALE_OPTIONS.find((option) => option.code === locale) || LOCALE_OPTIONS[1];
}

function regionDefinition(region: string) {
  return REGION_OPTIONS.find((option) => option.code === region) || REGION_OPTIONS[REGION_OPTIONS.length - 1];
}

function browserLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const browserLanguage = window.navigator.language.toLowerCase();
  if (browserLanguage.startsWith("zh")) return "zh";
  if (browserLanguage.startsWith("ja")) return "ja";
  if (browserLanguage.startsWith("ko")) return "ko";
  if (browserLanguage.startsWith("es")) return "es";
  if (browserLanguage.startsWith("fr")) return "fr";
  if (browserLanguage.startsWith("de")) return "de";
  if (browserLanguage.startsWith("pt")) return "pt";
  if (browserLanguage.startsWith("id")) return "id";
  if (browserLanguage.startsWith("th")) return "th";
  if (browserLanguage.startsWith("vi")) return "vi";
  return "en";
}

function browserRegion(locale: Locale) {
  const regionByLocale: Partial<Record<Locale, string>> = {
    zh: "TW",
    ja: "JP",
    ko: "KR",
    es: "ES",
    fr: "FR",
    de: "DE",
    pt: "BR",
    id: "ID",
    th: "TH",
    vi: "VN",
  };
  return regionByLocale[locale] || "OTHER";
}

function translationKey(locale: Locale, source: string) {
  let hash = 2166136261;
  const value = `${locale}:${source}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${locale}-${(hash >>> 0).toString(36)}`;
}

type LanguageContextValue = {
  language: Language;
  locale: Locale;
  region: string;
  isHydrated: boolean;
  isAutoTranslationLocale: boolean;
  translations: Record<string, string>;
  translationStatus: TranslationStatus;
  translationProgress: number | null;
  translationDetail: string;
  setLanguage: (language: Language) => void;
  setLocale: (locale: Locale) => void;
  setRegion: (region: string) => void;
  savePreferences: (region: string, locale: Locale) => void;
  requestTranslations: (texts: string[]) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  preferencesOpen: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [locale, setLocaleState] = useState<Locale>("en");
  const [region, setRegionState] = useState("OTHER");
  const [isHydrated, setIsHydrated] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationStatus, setTranslationStatus] = useState<TranslationStatus>("idle");
  const [translationProgress, setTranslationProgress] = useState<number | null>(null);
  const [translationDetail, setTranslationDetail] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const queueRef = useRef(new Set<string>());
  const pendingRef = useRef(new Set<string>());
  const requestsRef = useRef(new Map<string, { locale: Locale; texts: string[] }>());
  const timerRef = useRef<number | null>(null);

  const persistPreferences = useCallback((nextRegion: string, nextLocale: Locale) => {
    window.localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ region: nextRegion, locale: nextLocale, complete: true })
    );
  }, []);

  const createWorker = useCallback(() => {
    if (workerRef.current || typeof window === "undefined") return workerRef.current;

    try {
      const worker = new Worker(new URL("./translation.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === "progress") {
          setTranslationStatus("downloading");
          setTranslationProgress(typeof message.progress === "number" ? message.progress : null);
          setTranslationDetail(message.detail || "正在準備本機翻譯模型 / Preparing local model");
          return;
        }
        if (message.type === "status") {
          setTranslationStatus(message.status || "idle");
          setTranslationDetail(message.detail || "");
          if (message.status === "ready") setTranslationProgress(100);
          return;
        }

        const request = message.id ? requestsRef.current.get(message.id) : undefined;
        if (!request) return;
        requestsRef.current.delete(message.id as string);

        if (message.type === "result") {
          const nextTranslations: Record<string, string> = {};
          request.texts.forEach((source, index) => {
            const translated = message.translations?.[index];
            if (!translated) return;
            const key = translationKey(request.locale, source);
            nextTranslations[key] = translated;
            try {
              window.localStorage.setItem(`${TRANSLATION_CACHE_PREFIX}:${key}`, translated);
            } catch {
              // Browser storage is a performance enhancement, not a requirement.
            }
          });
          if (Object.keys(nextTranslations).length) {
            setTranslations((current) => ({ ...current, ...nextTranslations }));
          }
          request.texts.forEach((source) => pendingRef.current.delete(`${request.locale}:${source}`));
          return;
        }

        request.texts.forEach((source) => pendingRef.current.delete(`${request.locale}:${source}`));
        setTranslationStatus("error");
        setTranslationDetail(message.detail || "本機翻譯暫時無法啟動；已保留原有中英文內容。 / Local translation could not start.");
      };
      worker.onerror = () => {
        setTranslationStatus("error");
        setTranslationDetail("你的瀏覽器不支援本機翻譯。 / This browser cannot run local translation.");
      };
      workerRef.current = worker;
      return worker;
    } catch {
      setTranslationStatus("error");
      setTranslationDetail("你的瀏覽器不支援本機翻譯。 / This browser cannot run local translation.");
      return null;
    }
  }, []);

  const flushTranslationQueue = useCallback(() => {
    const activeLocale = locale;
    if (!isAutoTranslationLocale(activeLocale)) return;

    const texts = Array.from(queueRef.current).slice(0, 24);
    texts.forEach((text) => queueRef.current.delete(text));
    if (!texts.length) return;

    const worker = createWorker();
    if (!worker) {
      texts.forEach((text) => pendingRef.current.delete(`${activeLocale}:${text}`));
      return;
    }

    const id = `${activeLocale}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    requestsRef.current.set(id, { locale: activeLocale, texts });
    setTranslationStatus((status) => status === "ready" ? "translating" : status);
    worker.postMessage({ type: "translate", id, targetLanguage: activeLocale, texts });
  }, [createWorker, locale]);

  const requestTranslations = useCallback((texts: string[]) => {
    const activeLocale = locale;
    if (!isAutoTranslationLocale(activeLocale) || typeof window === "undefined") return;

    let queued = false;
    texts.forEach((source) => {
      const normalized = source.trim();
      if (!normalized) return;
      const key = translationKey(activeLocale, normalized);
      const pendingKey = `${activeLocale}:${normalized}`;
      try {
        const cached = window.localStorage.getItem(`${TRANSLATION_CACHE_PREFIX}:${key}`);
        if (cached) {
          setTranslations((current) => (current[key] ? current : { ...current, [key]: cached }));
          return;
        }
      } catch {
        // Translation remains functional even when persistent browser storage is unavailable.
      }
      if (pendingRef.current.has(pendingKey)) return;
      pendingRef.current.add(pendingKey);
      queueRef.current.add(normalized);
      queued = true;
    });

    if (queued && !timerRef.current) {
      setTranslationStatus("downloading");
      setTranslationDetail("正在準備你的裝置進行本機翻譯。 / Preparing local translation on your device.");
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        flushTranslationQueue();
      }, 240);
    }
  }, [flushTranslationQueue, locale]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) || "null");
      if (stored?.complete && isLocale(stored.locale)) {
        setLocaleState(stored.locale);
        setLanguageState(stored.locale === "zh" ? "zh" : "en");
        setRegionState(typeof stored.region === "string" ? stored.region : "OTHER");
      } else {
        const detectedLocale = browserLocale();
        setLocaleState(detectedLocale);
        setLanguageState(detectedLocale === "zh" ? "zh" : "en");
        setRegionState(browserRegion(detectedLocale));
        setPreferencesOpen(true);
      }
    } catch {
      setPreferencesOpen(true);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = localeDefinition(locale).htmlLang;
    document.documentElement.dataset.primaryLanguage = language;
    document.documentElement.dataset.displayLocale = locale;
    if (!isAutoTranslationLocale(locale)) {
      setTranslationStatus("idle");
      setTranslationProgress(null);
      setTranslationDetail("");
    }
  }, [language, locale]);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    workerRef.current?.terminate();
  }, []);

  const savePreferences = useCallback((nextRegion: string, nextLocale: Locale) => {
    setRegionState(nextRegion);
    setLocaleState(nextLocale);
    setLanguageState(nextLocale === "zh" ? "zh" : "en");
    persistPreferences(nextRegion, nextLocale);
    setPreferencesOpen(false);
  }, [persistPreferences]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    setLocaleState(nextLanguage);
    persistPreferences(region, nextLanguage);
  }, [persistPreferences, region]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    setLanguageState(nextLocale === "zh" ? "zh" : "en");
    persistPreferences(region, nextLocale);
  }, [persistPreferences, region]);

  const setRegion = useCallback((nextRegion: string) => {
    setRegionState(nextRegion);
    persistPreferences(nextRegion, locale);
  }, [locale, persistPreferences]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    locale,
    region,
    isHydrated,
    isAutoTranslationLocale: isAutoTranslationLocale(locale),
    translations,
    translationStatus,
    translationProgress,
    translationDetail,
    setLanguage,
    setLocale,
    setRegion,
    savePreferences,
    requestTranslations,
    openPreferences: () => setPreferencesOpen(true),
    closePreferences: () => setPreferencesOpen(false),
    preferencesOpen,
  }), [
    language,
    locale,
    region,
    isHydrated,
    translations,
    translationStatus,
    translationProgress,
    translationDetail,
    setLanguage,
    setLocale,
    setRegion,
    savePreferences,
    requestTranslations,
    preferencesOpen,
  ]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <LocalePreferencesDialog />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function useAutoTranslations(texts: string[], fallbackTexts: string[] = []) {
  const { locale, translations, requestTranslations, isAutoTranslationLocale: shouldTranslate } = useLanguage();
  const signature = texts.join("\u0001");
  const uniqueTexts = useMemo(
    () => Array.from(new Set(signature.split("\u0001").map((text) => text.trim()).filter(Boolean))),
    [signature]
  );

  useEffect(() => {
    if (shouldTranslate) requestTranslations(uniqueTexts);
  }, [locale, requestTranslations, shouldTranslate, uniqueTexts]);

  return texts.map((text, index) => {
    if (!shouldTranslate) return text;
    return translations[translationKey(locale, text.trim())] || fallbackTexts[index] || text;
  });
}

export function LanguageSwitcher() {
  const { language, locale, setLanguage, openPreferences } = useLanguage();
  const localizedLabel = localeDefinition(locale).nativeName;

  return (
    <div className="language-switcher" role="group" aria-label="Language and region settings">
      <button
        type="button"
        className={locale === "en" && language === "en" ? "language-option active" : "language-option"}
        onClick={() => setLanguage("en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <span className="language-divider" aria-hidden="true">/</span>
      <button
        type="button"
        className={locale === "zh" && language === "zh" ? "language-option active" : "language-option"}
        onClick={() => setLanguage("zh")}
        aria-pressed={locale === "zh"}
      >
        中文
      </button>
      <button
        type="button"
        className={locale !== "en" && locale !== "zh" ? "locale-settings-trigger active" : "locale-settings-trigger"}
        onClick={openPreferences}
        aria-label="Change region and reading language / 變更所在地區與閱讀語言"
        title={`Language: ${localizedLabel}`}
      >
        {locale !== "en" && locale !== "zh" ? localizedLabel : "◎"}
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
  const { language, locale, translations, requestTranslations, isAutoTranslationLocale: shouldTranslate } = useLanguage();
  const chineseSource = typeof zh === "string" ? zh : "";
  const cacheKey = chineseSource ? translationKey(locale, chineseSource.trim()) : "";

  useEffect(() => {
    if (shouldTranslate && chineseSource) requestTranslations([chineseSource]);
  }, [chineseSource, requestTranslations, shouldTranslate]);

  const primary = shouldTranslate
    ? (translations[cacheKey] || en)
    : language === "en" ? en : zh;
  const secondary = shouldTranslate
    ? zh
    : language === "en" ? zh : en;

  return (
    <span id={id} className={`bilingual-text ${className}`}>
      <span className={`bilingual-primary ${primaryClassName}`}>{primary}</span>
      <span className={`bilingual-secondary ${secondaryClassName}`}>{secondary}</span>
    </span>
  );
}

export function LocalTranslationStatus() {
  const {
    isAutoTranslationLocale: isActive,
    translationStatus,
    translationProgress,
    translationDetail,
  } = useLanguage();

  if (!isActive || translationStatus === "idle" || translationStatus === "ready") return null;

  const progressText = translationProgress === null ? "" : ` ${translationProgress}%`;
  return (
    <div className={`local-translation-status ${translationStatus}`} role="status" aria-live="polite">
      <span className="local-translation-status-label">LOCAL TRANSLATION</span>
      <span>{translationDetail}{progressText}</span>
    </div>
  );
}

function LocalePreferencesDialog() {
  const {
    locale,
    region,
    isHydrated,
    preferencesOpen,
    savePreferences,
    closePreferences,
  } = useLanguage();
  const [draftRegion, setDraftRegion] = useState(region);
  const [draftLocale, setDraftLocale] = useState<Locale>(locale);

  useEffect(() => {
    if (preferencesOpen) {
      setDraftRegion(region);
      setDraftLocale(locale);
    }
  }, [locale, preferencesOpen, region]);

  if (!isHydrated || !preferencesOpen) return null;

  const isFirstVisit = !window.localStorage.getItem(PREFERENCES_KEY);

  return (
    <div className="locale-dialog-backdrop" role="presentation">
      <section
        className="locale-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="locale-dialog-title"
      >
        <div className="locale-dialog-kicker">{"// ACCESS PREFERENCE"}</div>
        <h2 id="locale-dialog-title">閱讀位置與語言</h2>
        <p className="locale-dialog-lead">Choose your region and reading language before entering the archive.</p>
        <p className="locale-dialog-note">中文與英文保留原始版本；其他語言由你的裝置下載開源模型並於本機翻譯，文章不會送往翻譯 API。</p>

        <label className="locale-field">
          <span>所在地區 <small>REGION</small></span>
          <select
            value={draftRegion}
            onChange={(event) => {
              const nextRegion = event.target.value;
              setDraftRegion(nextRegion);
              setDraftLocale(regionDefinition(nextRegion).defaultLocale);
            }}
          >
            {REGION_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>{option.zh} · {option.en}</option>
            ))}
          </select>
        </label>

        <label className="locale-field">
          <span>閱讀語言 <small>READING LANGUAGE</small></span>
          <select value={draftLocale} onChange={(event) => setDraftLocale(event.target.value as Locale)}>
            {LOCALE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>{option.nativeName} · {option.label}</option>
            ))}
          </select>
        </label>

        <p className="locale-device-note">本機模式：首次使用第三語言時，瀏覽器會下載模型並快取；下載量與速度取決於裝置與網路。</p>

        <div className="locale-dialog-actions">
          {!isFirstVisit && (
            <button type="button" className="locale-cancel" onClick={closePreferences}>取消 / Cancel</button>
          )}
          <button type="button" className="locale-confirm" onClick={() => savePreferences(draftRegion, draftLocale)}>
            進入檔案庫 <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export type { LocaleDefinition, RegionDefinition };
