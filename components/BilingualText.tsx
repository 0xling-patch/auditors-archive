'use client';

import React from 'react';
import { useLanguage } from './LanguageProvider';
import { BilingualContent } from '@/lib/i18n';

interface BilingualTextProps {
  content: BilingualContent;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}

/**
 * 雙語對照文本元件
 * 根據語言設定顯示主次語言
 * 主語言字體較大，次語言字體較小
 */
export const BilingualText: React.FC<BilingualTextProps> = ({
  content,
  className = '',
  primaryClassName = 'text-base md:text-lg font-semibold',
  secondaryClassName = 'text-xs md:text-sm opacity-75',
}) => {
  const { language } = useLanguage();

  const isPrimary = (lang: 'zh' | 'en') => language === lang;

  return (
    <div className={`space-y-1 ${className}`}>
      {/* 主語言 */}
      <div className={isPrimary('zh') ? primaryClassName : secondaryClassName}>
        {content.zh}
      </div>
      {/* 次語言 */}
      <div className={isPrimary('en') ? primaryClassName : secondaryClassName}>
        {content.en}
      </div>
    </div>
  );
};

interface BilingualParagraphProps {
  content: BilingualContent;
  className?: string;
}

/**
 * 雙語段落元件
 * 用於較長的文本內容
 */
export const BilingualParagraph: React.FC<BilingualParagraphProps> = ({
  content,
  className = '',
}) => {
  const { language } = useLanguage();

  return (
    <div className={`space-y-2 ${className}`}>
      <p className={language === 'zh' ? 'text-base leading-relaxed' : 'text-sm opacity-80'}>
        {content.zh}
      </p>
      <p className={language === 'en' ? 'text-base leading-relaxed' : 'text-sm opacity-80'}>
        {content.en}
      </p>
    </div>
  );
};
