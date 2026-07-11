// 語言狀態管理與類型定義
export type Language = 'zh' | 'en';

export interface BilingualContent {
  zh: string;
  en: string;
}

export interface BilingualParagraph {
  zh: string;
  en: string;
}

// 語言上下文類型
export interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

// 本地存儲鍵值
export const LANGUAGE_STORAGE_KEY = 'auditors-archive-language';

// 預設語言
export const DEFAULT_LANGUAGE: Language = 'zh';

// 語言標籤
export const LANGUAGE_LABELS: Record<Language, { label: string; flag: string }> = {
  zh: { label: '中文', flag: '🇹🇼' },
  en: { label: 'English', flag: '🇺🇸' },
};
