import { enCatalog } from './catalogs/en';
import { ruCatalog } from './catalogs/ru';
import type { MessageCatalog } from './catalogs/en';

export interface LocaleDefinition {
  code: string;
  label: string;
  nativeLabel: string;
  messages: MessageCatalog;
}

export const fallbackLocale = 'en';

export const localeRegistry: LocaleDefinition[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    messages: enCatalog
  },
  {
    code: 'ru',
    label: 'Russian',
    nativeLabel: 'Русский',
    messages: ruCatalog
  }
];

export const localeCatalogMap = Object.fromEntries(localeRegistry.map((locale) => [locale.code, locale.messages])) as Record<
  string,
  MessageCatalog
>;
