import { useEffect, useState } from 'react';
import { AppShell } from '../../shared/ui/AppShell';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SectionCard } from '../../shared/ui/SectionCard';
import { useAppStore } from '../../app/store/appStore';
import { downloadText } from '../../shared/lib/download';
import { useI18n } from '../../shared/i18n/I18nProvider';

export function SettingsPage() {
  const {
    aliasRules,
    collections,
    settings,
    loadInitialData,
    saveAliasRule,
    createCollection,
    exportLibraryData,
    importLibraryData,
    updateThemeMode
  } = useAppStore();
  const { availableLocales, locale, localeMode, setLocaleMode, t } = useI18n();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [collectionName, setCollectionName] = useState('');

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  return (
    <AppShell>
      <div className="page-grid">
        <SectionCard title={t('settings.language.title')} subtitle={t('settings.language.subtitle')}>
          <div className="stack">
            <label className="field">
              <span>{t('settings.language.mode')}</span>
              <select
                className="input"
                value={localeMode}
                onChange={(event) => void setLocaleMode(event.target.value as 'auto' | 'manual', locale)}
              >
                <option value="auto">{t('settings.language.mode.auto')}</option>
                <option value="manual">{t('settings.language.mode.manual')}</option>
              </select>
            </label>
            <label className="field">
              <span>{t('settings.language.select')}</span>
              <select
                className="input"
                value={locale}
                disabled={localeMode !== 'manual'}
                onChange={(event) => void setLocaleMode('manual', event.target.value)}
              >
                {availableLocales.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </SectionCard>

        <SectionCard title={t('settings.theme.title')} subtitle={t('settings.theme.subtitle')}>
          <label className="field">
            <span>{t('settings.theme.select')}</span>
            <select
              className="input"
              value={settings.themeMode}
              onChange={(event) => void updateThemeMode(event.target.value as typeof settings.themeMode)}
            >
              <option value="system">{t('common.system')}</option>
              <option value="light">{t('settings.theme.light')}</option>
              <option value="dark">{t('settings.theme.dark')}</option>
            </select>
          </label>
        </SectionCard>

        <SectionCard title={t('settings.alias.title')} subtitle={t('settings.alias.subtitle')}>
          <div className="inline-form">
            <input className="input" placeholder={t('settings.alias.from')} value={from} onChange={(event) => setFrom(event.target.value)} />
            <input className="input" placeholder={t('settings.alias.to')} value={to} onChange={(event) => setTo(event.target.value)} />
            <button
              className="button"
              disabled={!from.trim() || !to.trim()}
              onClick={() => void saveAliasRule(from, to).then(() => {
                setFrom('');
                setTo('');
              })}
            >
              {t('settings.alias.addRule')}
            </button>
          </div>
          {!aliasRules.length ? (
            <EmptyState title={t('settings.alias.empty.title')} description={t('settings.alias.empty.description')} />
          ) : (
            <ul className="simple-list">
              {aliasRules.map((rule) => (
                <li key={rule.id}>
                  <strong>{rule.from}</strong> → {rule.to}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={t('settings.collections.title')} subtitle={t('settings.collections.subtitle')}>
          <div className="inline-form">
            <input
              className="input"
              placeholder={t('settings.collections.name')}
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
            />
            <button
              className="button"
              disabled={!collectionName.trim()}
              onClick={() => void createCollection(collectionName).then(() => setCollectionName(''))}
            >
              {t('settings.collections.create')}
            </button>
          </div>
          {!collections.length ? (
            <EmptyState title={t('settings.collections.empty.title')} description={t('settings.collections.empty.description')} />
          ) : (
            <ul className="simple-list">
              {collections.map((collection) => (
                <li key={collection.id}>{collection.name}</li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title={t('settings.backup.title')} subtitle={t('settings.backup.subtitle')}>
          <div className="inline-form">
            <button
              className="button"
              onClick={() =>
                void exportLibraryData().then((snapshot) => {
                  downloadText(JSON.stringify(snapshot, null, 2), 'character-manager-library-backup.json');
                })
              }
            >
              {t('settings.backup.export')}
            </button>
            <label className="button button--ghost">
              {t('settings.backup.restore')}
              <input
                hidden
                type="file"
                accept=".json,application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  void file.text().then((text) => {
                    const snapshot = JSON.parse(text) as Parameters<typeof importLibraryData>[0];
                    return importLibraryData(snapshot);
                  });
                }}
              />
            </label>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
