import { needsNativeTranslation, type SiteLanguage } from "./i18n";

type TranslationProgress = {
  status: "checking" | "downloading" | "ready" | "unavailable" | "error";
  loaded?: number;
  total?: number;
};

type NativeTranslator = {
  translate: (text: string) => Promise<string>;
  destroy?: () => void;
};

type NativeTranslatorApi = {
  availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
  create: (options: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (monitor: EventTarget) => void;
  }) => Promise<NativeTranslator>;
};

const SOURCE_LANGUAGE = "zh-Hant";
const CACHE_PREFIX = "auditors-archive-translation";
const memoryCache = new Map<string, string>();
const translatorPromises = new Map<SiteLanguage, Promise<NativeTranslator | null>>();

function nativeTranslatorApi(): NativeTranslatorApi | null {
  if (typeof globalThis === "undefined") return null;
  return (globalThis as typeof globalThis & { Translator?: NativeTranslatorApi }).Translator || null;
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

function cacheKey(language: SiteLanguage, text: string) {
  return `${CACHE_PREFIX}:${language}:${hash(text)}`;
}

function protectTechnicalParts(text: string) {
  const protectedParts: string[] = [];
  const value = text.replace(/```[\s\S]*?```|`[^`\n]+`|https?:\/\/[^\s)]+/g, (part) => {
    const placeholder = `__AA_PROTECTED_${protectedParts.length}__`;
    protectedParts.push(part);
    return placeholder;
  });

  return {
    value,
    restore: (translated: string) => protectedParts.reduce(
      (result, part, index) => result.replace(`__AA_PROTECTED_${index}__`, part),
      translated
    ),
  };
}

function readCache(key: string) {
  if (memoryCache.has(key)) return memoryCache.get(key) || null;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) memoryCache.set(key, stored);
    return stored;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: string) {
  memoryCache.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Persistent cache is optional; the in-memory value remains available for this visit.
  }
}

export function supportsNativeTranslation() {
  return Boolean(nativeTranslatorApi());
}

async function getTranslator(language: SiteLanguage, onProgress?: (progress: TranslationProgress) => void) {
  if (!needsNativeTranslation(language)) return null;
  const api = nativeTranslatorApi();
  if (!api) {
    onProgress?.({ status: "unavailable" });
    return null;
  }

  const existing = translatorPromises.get(language);
  if (existing) return existing;

  const promise = (async () => {
    try {
      onProgress?.({ status: "checking" });
      const availability = await api.availability({ sourceLanguage: SOURCE_LANGUAGE, targetLanguage: language });
      if (availability === "unavailable") {
        onProgress?.({ status: "unavailable" });
        return null;
      }

      if (availability === "downloadable" || availability === "downloading") {
        onProgress?.({ status: "downloading" });
      }

      const translator = await api.create({
        sourceLanguage: SOURCE_LANGUAGE,
        targetLanguage: language,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) => {
            const progressEvent = event as Event & { loaded?: number; total?: number };
            onProgress?.({
              status: "downloading",
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            });
          });
        },
      });
      onProgress?.({ status: "ready" });
      return translator;
    } catch {
      onProgress?.({ status: "error" });
      return null;
    }
  })();

  translatorPromises.set(language, promise);
  return promise;
}

export async function translateText(
  chineseText: string,
  language: SiteLanguage,
  onProgress?: (progress: TranslationProgress) => void
) {
  if (!chineseText.trim() || !needsNativeTranslation(language)) return null;
  if (typeof window === "undefined") return null;

  const key = cacheKey(language, chineseText);
  const cached = readCache(key);
  if (cached) return cached;

  const translator = await getTranslator(language, onProgress);
  if (!translator) return null;

  try {
    const protectedText = protectTechnicalParts(chineseText);
    const translated = await translator.translate(protectedText.value);
    const restored = protectedText.restore(translated);
    writeCache(key, restored);
    return restored;
  } catch {
    onProgress?.({ status: "error" });
    return null;
  }
}

export type { TranslationProgress };
