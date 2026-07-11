'use client';

import React, { Suspense } from 'react';
import { useLanguage } from './LanguageProvider';
import { LANGUAGE_LABELS } from '@/lib/i18n';

interface LanguageToggleProps {
  className?: string;
}

/**
 * 語言切換按鈕內容
 */
const LanguageToggleContent: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`
        px-4 py-2 rounded-lg
        bg-gradient-to-r from-purple-600/20 to-pink-600/20
        border border-purple-500/30 hover:border-purple-500/60
        text-sm font-medium
        transition-all duration-300
        hover:shadow-lg hover:shadow-purple-500/20
        flex items-center gap-2
        ${className}
      `}
      title={`切換至 ${language === 'zh' ? 'English' : '中文'}`}
    >
      <span className="text-lg">{LANGUAGE_LABELS[language].flag}</span>
      <span className="hidden sm:inline">{LANGUAGE_LABELS[language].label}</span>
      <span className="text-xs opacity-60 ml-1">
        {language === 'zh' ? '→ EN' : '→ 中'}
      </span>
    </button>
  );
};

/**
 * 語言切換按鈕
 * 顯示當前語言，點擊切換
 */
export const LanguageToggle: React.FC<LanguageToggleProps> = (props) => {
  return (
    <Suspense fallback={<div className="w-20 h-10" />}>
      <LanguageToggleContent {...props} />
    </Suspense>
  );
};
