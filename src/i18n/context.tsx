"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, localeConfigs, defaultLocale } from './types';
import zhCN from './locales/zh-CN';
import en from './locales/en';

type TranslationData = typeof zhCN;

const translations: Record<Locale, TranslationData> = {
  'zh-CN': zhCN,
  'en': en,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationData;
  localeConfig: typeof localeConfigs[Locale];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'dev-utils-locale';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isHydrated, setIsHydrated] = useState(false);

  // 从 localStorage 恢复语言设置
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
    setIsHydrated(true);
  }, []);

  // 设置语言并持久化
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    
    // 更新 html lang 属性
    document.documentElement.lang = newLocale;
    
    // 更新字体
    const config = localeConfigs[newLocale];
    document.body.style.fontFamily = config.font;
  }, []);

  // 初始化时设置字体
  useEffect(() => {
    if (isHydrated) {
      const config = localeConfigs[locale];
      document.body.style.fontFamily = config.font;
      document.documentElement.lang = locale;
    }
  }, [isHydrated, locale]);

  const value: LanguageContextType = {
    locale,
    setLocale,
    t: translations[locale],
    localeConfig: localeConfigs[locale],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 导出便捷 hook
export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
