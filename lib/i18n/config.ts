export const locales = ['fr', 'en', 'pt', 'de', 'es'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  pt: 'Português',
  de: 'Deutsch',
  es: 'Español',
};

export function isLocale(value: string | null | undefined): value is Locale {
  return locales.includes(value as Locale);
}
