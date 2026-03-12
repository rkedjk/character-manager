import { describe, expect, it } from 'vitest';
import { localeRegistry } from './catalogRegistry';
import { getCatalogKeys, resolveLocale, translate } from './messages';

describe('i18n locale resolution', () => {
  it('resolves exact and base locales with fallback', () => {
    expect(resolveLocale(['ru-RU'])).toBe('ru');
    expect(resolveLocale(['en-US'])).toBe('en');
    expect(resolveLocale(['de-DE'])).toBe('en');
  });

  it('translates messages with params', () => {
    expect(translate('ru', 'library.bulk.selected', { count: 3 })).toBe('Выбрано: 3');
    expect(translate('en', 'import.batch.ready', { count: 2 })).toBe('2 cards are ready for export.');
  });

  it('keeps all locale catalogs in sync with the fallback catalog', () => {
    const fallbackKeys = getCatalogKeys().sort();

    for (const locale of localeRegistry) {
      expect(Object.keys(locale.messages).sort()).toEqual(fallbackKeys);
    }
  });
});
