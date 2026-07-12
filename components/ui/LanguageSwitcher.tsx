'use client';

import { Languages } from 'lucide-react';
import { localeNames, locales, type Locale } from '@/lib/i18n/config';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  return <label className="relative inline-flex items-center text-cream">
    <Languages size={17} className="pointer-events-none absolute left-2" />
    <span className="sr-only">{t('language.label')}</span>
    <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={t('language.label')} className="cursor-pointer appearance-none rounded-full border border-cream/30 bg-jungle-700 py-1.5 pl-8 pr-7 text-xs font-bold uppercase outline-none hover:border-sun-400 focus:border-sun-400">
      {locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}
    </select>
  </label>;
}
