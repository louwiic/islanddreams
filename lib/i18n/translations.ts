import fr from './messages/fr.json';
import en from './messages/en.json';
import pt from './messages/pt.json';
import de from './messages/de.json';
import es from './messages/es.json';
import type { Locale } from './config';

export type TranslationKey = keyof typeof fr;
export type Dictionary = Record<TranslationKey, string>;

export const translations: Record<Locale, Dictionary> = { fr, en, pt, de, es };
