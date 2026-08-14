export type SiteLanguage = "zh" | "en" | "ja" | "ko" | "es" | "fr" | "de" | "pt" | "ar" | "hi" | "it";

export type LanguageOption = {
  code: SiteLanguage;
  locale: string;
  nativeLabel: string;
  label: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "zh", locale: "zh-Hant", nativeLabel: "繁體中文", label: "Traditional Chinese" },
  { code: "en", locale: "en", nativeLabel: "English", label: "English" },
  { code: "ja", locale: "ja", nativeLabel: "日本語", label: "Japanese" },
  { code: "ko", locale: "ko", nativeLabel: "한국어", label: "Korean" },
  { code: "es", locale: "es", nativeLabel: "Español", label: "Spanish" },
  { code: "fr", locale: "fr", nativeLabel: "Français", label: "French" },
  { code: "de", locale: "de", nativeLabel: "Deutsch", label: "German" },
  { code: "pt", locale: "pt", nativeLabel: "Português", label: "Portuguese" },
  { code: "ar", locale: "ar", nativeLabel: "العربية", label: "Arabic" },
  { code: "hi", locale: "hi", nativeLabel: "हिन्दी", label: "Hindi" },
  { code: "it", locale: "it", nativeLabel: "Italiano", label: "Italian" },
];

export const DEFAULT_LANGUAGE: SiteLanguage = "en";

export function isSiteLanguage(value: unknown): value is SiteLanguage {
  return typeof value === "string" && LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function languageOption(language: SiteLanguage): LanguageOption {
  return LANGUAGE_OPTIONS.find((option) => option.code === language) || LANGUAGE_OPTIONS[1];
}

export function detectBrowserLanguage(browserLanguage: string | undefined): SiteLanguage {
  const normalized = (browserLanguage || "").toLowerCase();
  if (normalized.startsWith("zh")) return "zh";
  if (normalized.startsWith("ja")) return "ja";
  if (normalized.startsWith("ko")) return "ko";
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("fr")) return "fr";
  if (normalized.startsWith("de")) return "de";
  if (normalized.startsWith("pt")) return "pt";
  if (normalized.startsWith("ar")) return "ar";
  if (normalized.startsWith("hi")) return "hi";
  if (normalized.startsWith("it")) return "it";
  return "en";
}

export function needsNativeTranslation(language: SiteLanguage) {
  return language !== "zh" && language !== "en";
}

export function directionForLanguage(language: SiteLanguage) {
  return language === "ar" ? "rtl" : "ltr";
}
