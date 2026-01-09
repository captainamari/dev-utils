export type Locale = 'zh-CN' | 'en';

export interface LocaleConfig {
  code: Locale;
  name: string;
  shortName: string;
  font: string;
}

export const localeConfigs: Record<Locale, LocaleConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: '简体中文',
    shortName: '中',
    font: 'Inter, "Noto Sans SC", system-ui, sans-serif',
  },
  'en': {
    code: 'en',
    name: 'English',
    shortName: 'EN',
    font: 'Inter, system-ui, sans-serif',
  },
};

export const defaultLocale: Locale = 'zh-CN';
