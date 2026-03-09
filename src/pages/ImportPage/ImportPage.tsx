import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../shared/ui/AppShell';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SectionCard } from '../../shared/ui/SectionCard';
import { useAppStore } from '../../app/store/appStore';
import { downloadBlob, downloadText } from '../../shared/lib/download';
import { serializeCharacterToJson, serializeCharacterToPng } from '../../core/card-serializer/cardSerializer';
import { createFallbackPngBlob } from '../../shared/lib/fallbackPng';

export function ImportPage() {
  const { characters, selectedIds, importResults, loadInitialData, importCharacterFiles, loadAssetBlob } = useAppStore();
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
        <SectionCard title="Import files" subtitle="Drop or pick JSON and PNG character cards from your device.">
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
            <span>Tap to select files or drop them here</span>
          </label>
          {!importResults.length ? (
            <EmptyState title="No import results yet" description="After import, every file gets a success, warning or error report." />
          ) : (
            <ul className="result-list">
              {importResults.map((result) => (
                <li key={`${result.fileName}-${result.status}`} className={`result-item result-item--${result.status}`}>
                  <strong>{result.fileName}</strong>
                  <span>{result.message}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Batch export" subtitle="Exports JSON and PNG for the currently selected cards from the library.">
          {!exportableCharacters.length ? (
            <EmptyState title="No selected cards" description="Go to Library and select one or more cards for batch export." />
          ) : (
            <div className="stack">
              <p className="muted">{exportableCharacters.length} cards are ready for export.</p>
              <button className="button button--primary" onClick={() => void handleExportAll()} disabled={isExporting}>
                {isExporting ? 'Exporting…' : 'Export selected as JSON + PNG'}
              </button>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
