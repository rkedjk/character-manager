import { fallbackLocale, localeCatalogMap, localeRegistry } from './catalogRegistry';
import type { MessageCatalog, MessageKey } from './catalogs/en';

export interface MessageParams {
  [key: string]: string | number;
}

export function resolveLocale(preferredLocales: readonly string[] | undefined, availableLocales = localeRegistry): string {
  const supported = new Set(availableLocales.map((locale) => locale.code.toLowerCase()));
  const candidates = preferredLocales?.filter(Boolean).map((locale) => locale.toLowerCase()) ?? [];

  for (const locale of candidates) {
    if (supported.has(locale)) {
      return locale;
    }

    const baseLocale = locale.split('-')[0];
    if (supported.has(baseLocale)) {
      return baseLocale;
    }
  }

  return fallbackLocale;
}

export function detectLocale(): string {
  if (typeof navigator === 'undefined') {
    return fallbackLocale;
  }

  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];
  return resolveLocale(locales);
}

export function getMessages(locale: string): MessageCatalog {
  return localeCatalogMap[locale] ?? localeCatalogMap[fallbackLocale];
}

export function formatMessage(template: string, params?: MessageParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export function translate(locale: string, key: MessageKey, params?: MessageParams): string {
  return formatMessage(getMessages(locale)[key], params);
}

export function getCatalogKeys(): MessageKey[] {
  return Object.keys(localeCatalogMap[fallbackLocale]) as MessageKey[];
}
