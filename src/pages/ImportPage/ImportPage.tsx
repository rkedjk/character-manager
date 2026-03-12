import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../shared/ui/AppShell';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SectionCard } from '../../shared/ui/SectionCard';
import { useAppStore } from '../../app/store/appStore';
import { downloadBlob, downloadText } from '../../shared/lib/download';
import { serializeCharacterToJson, serializeCharacterToPng } from '../../core/card-serializer/cardSerializer';
import { createFallbackPngBlob } from '../../shared/lib/fallbackPng';
import { useI18n } from '../../shared/i18n/I18nProvider';

export function ImportPage() {
  const { characters, selectedIds, importResults, loadInitialData, importCharacterFiles, loadAssetBlob } = useAppStore();
  const { t } = useI18n();
  const [isExporting, setIsExporting] = useState(false);
  const exportableCharacters = useMemo(
    () => characters.filter((character) => selectedIds.includes(character.id)),
    [characters, selectedIds]
  );

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  async function handleExportAll(): Promise<void> {
    setIsExporting(true);
    try {
      for (const character of exportableCharacters) {
        downloadText(serializeCharacterToJson(character), `${character.card.data.name || character.id}.json`);
        const assetBlob = character.avatarAssetId ? await loadAssetBlob(character.avatarAssetId) : undefined;
        const pngBlob = await serializeCharacterToPng(character, assetBlob ?? createFallbackPngBlob());
        downloadBlob(pngBlob, `${character.card.data.name || character.id}.png`);
      }
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AppShell>
      <div className="page-grid">
        <SectionCard title={t('import.title')} subtitle={t('import.subtitle')}>
          <label className="dropzone">
            <input
              type="file"
              multiple
              accept=".json,.png"
              onChange={(event) => {
                if (event.target.files) {
                  void importCharacterFiles(event.target.files);
                }
              }}
            />
            <span>{t('import.dropzone')}</span>
          </label>
          {!importResults.length ? (
            <EmptyState title={t('import.empty.title')} description={t('import.empty.description')} />
          ) : (
            <ul className="result-list">
              {importResults.map((result) => (
                <li key={`${result.fileName}-${result.status}`} className={`result-item result-item--${result.status}`}>
                  <strong>{result.fileName}</strong>
                  <span>{result.messageKey ? t(result.messageKey as never, result.messageValues) : result.message}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={t('import.batch.title')} subtitle={t('import.batch.subtitle')}>
          {!exportableCharacters.length ? (
            <EmptyState title={t('import.batch.empty.title')} description={t('import.batch.empty.description')} />
          ) : (
            <div className="stack">
              <p className="muted">{t('import.batch.ready', { count: exportableCharacters.length })}</p>
              <button className="button button--primary" onClick={() => void handleExportAll()} disabled={isExporting}>
                {isExporting ? t('import.batch.exporting') : t('import.batch.exportAction')}
              </button>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
