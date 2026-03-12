import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { useAppStore } from '../../app/store/appStore';
import { localeRegistry } from './catalogRegistry';
import type { MessageKey } from './catalogs/en';
import { detectLocale, translate, type MessageParams } from './messages';

interface I18nContextValue {
  locale: string;
  resolvedLocale: string;
  availableLocales: typeof localeRegistry;
  localeMode: 'auto' | 'manual';
  setLocaleMode: (mode: 'auto' | 'manual', locale?: string) => Promise<void>;
  t: (key: MessageKey, params?: MessageParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const { settings, updateLocale } = useAppStore();
  const resolvedLocale = settings.localeMode === 'manual' ? settings.locale ?? 'en' : detectLocale();

  useEffect(() => {
    document.documentElement.lang = resolvedLocale;
  }, [resolvedLocale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: settings.locale ?? 'en',
      resolvedLocale,
      availableLocales: localeRegistry,
      localeMode: settings.localeMode,
      setLocaleMode: updateLocale,
      t: (key, params) => translate(resolvedLocale, key, params)
    }),
    [resolvedLocale, settings.locale, settings.localeMode, updateLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider.');
  }

  return context;
}
