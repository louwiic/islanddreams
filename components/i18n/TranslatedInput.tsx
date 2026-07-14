'use client';

import type { InputHTMLAttributes } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { TranslationKey } from '@/lib/i18n/translations';

export function TranslatedInput({ placeholderId, ...props }: InputHTMLAttributes<HTMLInputElement> & { placeholderId: TranslationKey }) {
  const { t } = useLanguage();
  return <input {...props} placeholder={t(placeholderId)} />;
}
