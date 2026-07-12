'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLocale, isLocale, type Locale } from './config';
import { translations, type TranslationKey } from './translations';

type Variables = Record<string, string | number>;
type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey, variables?: Variables) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem('islanddreams_locale');
    const cookie = document.cookie.match(/(?:^|; )islanddreams_locale=([^;]+)/)?.[1];
    const browser = navigator.language.split('-')[0];
    const initial = [saved, cookie, browser].find(isLocale) ?? defaultLocale;
    queueMicrotask(() => updateLocale(initial));
  }, []);

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    updateLocale(next);
    localStorage.setItem('islanddreams_locale', next);
    document.cookie = `islanddreams_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({ locale, setLocale, t: (key, variables) => {
    let value: string = translations[locale][key] ?? translations.fr[key];
    for (const [name, replacement] of Object.entries(variables ?? {})) value = value.replaceAll(`{${name}}`, String(replacement));
    return value;
  }}), [locale, setLocale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
