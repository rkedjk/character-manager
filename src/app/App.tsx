import { useEffect } from 'react';
import { AppRoutes } from './router/routes';
import { useAppStore } from './store/appStore';
import { I18nProvider } from '../shared/i18n/I18nProvider';
import { applyResolvedTheme, resolveThemeMode, watchSystemTheme } from '../shared/theme/theme';

export function App() {
  const { settings, loadSettings } = useAppStore();

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const applyTheme = (systemTheme?: 'light' | 'dark') => {
      applyResolvedTheme(resolveThemeMode(settings.themeMode, systemTheme));
    };

    applyTheme();

    if (settings.themeMode !== 'system') {
      return undefined;
    }

    return watchSystemTheme((theme) => applyTheme(theme));
  }, [settings.themeMode]);

  return (
    <I18nProvider>
      <AppRoutes />
    </I18nProvider>
  );
}
