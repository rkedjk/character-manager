import { useEffect, useState } from 'react';
import { AppShell } from '../../shared/ui/AppShell';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SectionCard } from '../../shared/ui/SectionCard';
import { useAppStore } from '../../app/store/appStore';
import { downloadText } from '../../shared/lib/download';

export function SettingsPage() {
  const { aliasRules, collections, loadInitialData, saveAliasRule, createCollection, exportLibraryData, importLibraryData } =
    useAppStore();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [collectionName, setCollectionName] = useState('');

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  return (
    <AppShell>
      <div className="page-grid">
        <SectionCard title="Tag alias rules" subtitle="Normalize tags with explicit from → to mappings.">
          <div className="inline-form">
            <input className="input" placeholder="from" value={from} onChange={(event) => setFrom(event.target.value)} />
            <input className="input" placeholder="to" value={to} onChange={(event) => setTo(event.target.value)} />
            <button
              className="button"
              disabled={!from.trim() || !to.trim()}
              onClick={() => void saveAliasRule(from, to).then(() => {
                setFrom('');
                setTo('');
              })}
            >
              Add rule
            </button>
          </div>
          {!aliasRules.length ? (
            <EmptyState title="No alias rules" description="Add your first canonicalization rule, for example cat girl → catgirl." />
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

        <SectionCard title="Collections" subtitle="App-level groups for the local library.">
          <div className="inline-form">
            <input
              className="input"
              placeholder="Collection name"
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
            />
            <button
              className="button"
              disabled={!collectionName.trim()}
              onClick={() => void createCollection(collectionName).then(() => setCollectionName(''))}
            >
              Create collection
            </button>
          </div>
          {!collections.length ? (
            <EmptyState title="No collections yet" description="Collections help group cards without depending on disk folders." />
          ) : (
            <ul className="simple-list">
              {collections.map((collection) => (
                <li key={collection.id}>{collection.name}</li>
              ))}
            </ul>
          )}
        </SectionCard>
        <SectionCard title="Library backup" subtitle="Export or restore the local app library as JSON.">
          <div className="inline-form">
            <button
              className="button"
              onClick={() =>
                void exportLibraryData().then((snapshot) => {
                  downloadText(JSON.stringify(snapshot, null, 2), 'character-manager-library-backup.json');
                })
              }
            >
              Export library backup
            </button>
            <label className="button button--ghost">
              Restore backup
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
