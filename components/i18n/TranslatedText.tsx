'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { TranslationKey } from '@/lib/i18n/translations';

export function TranslatedText({ id, values }: { id: TranslationKey; values?: Record<string, string | number> }) {
  const { t } = useLanguage();
  return <>{t(id, values)}</>;
}
