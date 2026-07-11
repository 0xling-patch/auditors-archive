'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, LanguageContextType, LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE } from '@/lib/i18n';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [mounted, setMounted] = useState(false);

  // 初始化語言設定（從本地存儲讀取）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      if (stored && (stored === 'zh' || stored === 'en')) {
        setLanguageState(stored);
      }
    } catch (e) {
      // localStorage 可能在 SSR 環境中不可用
      console.warn('localStorage not available:', e);
    }
    setMounted(true);
  }, []);

  // 保存語言設定至本地存儲
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      } catch (e) {
        console.warn('Failed to save language preference:', e);
      }
    }
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // 在 SSG/SSR 期間，返回預設值；在客戶端，返回實際上下文
  const value: LanguageContextType = {
    language: mounted ? language : DEFAULT_LANGUAGE,
    toggleLanguage,
    setLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // 回退至預設值，而不是拋出錯誤
    return {
      language: DEFAULT_LANGUAGE,
      toggleLanguage: () => {},
      setLanguage: () => {},
    };
  }
  return context;
};
