import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../../shared/ui/AppShell';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SectionCard } from '../../shared/ui/SectionCard';
import { useAppStore } from '../../app/store/appStore';
import type { CharacterRecord, LorebookEntry } from '../../shared/types/character';
import { buildCharacterDiff } from '../../core/diff/buildDiff';
import { normalizeTags } from '../../core/normalization/normalizeTags';
import { serializeCharacterToJson, serializeCharacterToPng } from '../../core/card-serializer/cardSerializer';
import { downloadBlob, downloadText } from '../../shared/lib/download';
import { createFallbackPngBlob } from '../../shared/lib/fallbackPng';
import { createId } from '../../shared/lib/id';
import { useI18n } from '../../shared/i18n/I18nProvider';

type TabId = 'core' | 'tags' | 'lorebook' | 'raw';

function cloneRecord(record: CharacterRecord): CharacterRecord {
  return structuredClone(record);
}

export function CharacterPage() {
  const { id } = useParams();
  const { aliasRules, loadCharacter, saveCharacterRecord, loadAssetBlob } = useAppStore();
  const { t } = useI18n();
  const [record, setRecord] = useState<CharacterRecord | null>(null);
  const [history, setHistory] = useState<CharacterRecord[]>([]);
  const [future, setFuture] = useState<CharacterRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('core');
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      return;
    }
    void loadCharacter(id).then((value) => {
      setRecord(value ? cloneRecord(value) : null);
      setHistory(value ? [cloneRecord(value)] : []);
      setFuture([]);
      setIsDirty(false);
    });
  }, [id, loadCharacter]);

  useEffect(() => {
    if (!record || !isDirty) {
      return;
    }

    window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      void saveCharacterRecord(record).then(() => setIsDirty(false));
    }, 500);

    return () => window.clearTimeout(saveTimeoutRef.current);
  }, [record, isDirty, saveCharacterRecord]);

  const diffLines = useMemo(
    () => (record ? buildCharacterDiff(record.rawOriginal, { spec: record.card.spec, data: record.card.data }) : []),
    [record]
  );
  const normalizedPreview = useMemo(
    () => (record ? normalizeTags(record.card.data.tags, aliasRules).tags : []),
    [record, aliasRules]
  );
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'core', label: t('character.tab.core') },
    { id: 'tags', label: t('character.tab.tags') },
    { id: 'lorebook', label: t('character.tab.lorebook') },
    { id: 'raw', label: t('character.tab.raw') }
  ];
  const coreFields: Array<[string, keyof CharacterRecord['card']['data']]> = [
    [t('character.field.name'), 'name'],
    [t('character.field.description'), 'description'],
    [t('character.field.personality'), 'personality'],
    [t('character.field.scenario'), 'scenario'],
    [t('character.field.firstMessage'), 'first_mes'],
    [t('character.field.exampleMessages'), 'mes_example'],
    [t('character.field.creatorNotes'), 'creator_notes'],
    [t('character.field.systemPrompt'), 'system_prompt'],
    [t('character.field.postHistoryInstructions'), 'post_history_instructions']
  ];

  function updateRecord(mutator: (draft: CharacterRecord) => void): void {
    if (!record) {
      return;
    }
    const draft = cloneRecord(record);
    mutator(draft);
    setHistory((current) => [...current, cloneRecord(draft)]);
    setFuture([]);
    setRecord(draft);
    setIsDirty(true);
  }

  function undo(): void {
    if (history.length < 2) {
      return;
    }
    const previous = history[history.length - 2];
    setFuture((current) => (record ? [cloneRecord(record), ...current] : current));
    setHistory((current) => current.slice(0, -1));
    setRecord(cloneRecord(previous));
    setIsDirty(true);
  }

  function redo(): void {
    if (!future.length) {
      return;
    }
    const [next, ...rest] = future;
    setHistory((current) => [...current, cloneRecord(next)]);
    setFuture(rest);
    setRecord(cloneRecord(next));
    setIsDirty(true);
  }

  async function exportJson(): Promise<void> {
    if (!record) {
      return;
    }
    downloadText(serializeCharacterToJson(record), `${record.card.data.name || record.id}.json`);
  }

  async function exportPng(): Promise<void> {
    if (!record) {
      return;
    }
    const asset = record.avatarAssetId ? await loadAssetBlob(record.avatarAssetId) : undefined;
    const blob = await serializeCharacterToPng(record, asset ?? createFallbackPngBlob());
    downloadBlob(blob, `${record.card.data.name || record.id}.png`);
  }

  function updateLorebookEntry(entryId: string, patch: Partial<LorebookEntry>): void {
    updateRecord((draft) => {
      const lorebook = draft.card.data.character_book;
      if (!lorebook) {
        return;
      }
      lorebook.entries = lorebook.entries.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry));
    });
  }

  if (!record) {
    return (
      <AppShell>
        <EmptyState title={t('character.notFound.title')} description={t('character.notFound.description')} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-grid">
        <SectionCard
          title={record.card.data.name}
          subtitle={isDirty ? t('character.status.pending') : t('character.status.saved')}
          actions={
            <div className="toolbar toolbar--compact">
              <button className="button button--ghost" onClick={undo} disabled={history.length < 2}>
                {t('character.undo')}
              </button>
              <button className="button button--ghost" onClick={redo} disabled={!future.length}>
                {t('character.redo')}
              </button>
              <button className="button" onClick={() => void exportJson()}>
                {t('character.exportJson')}
              </button>
              <button className="button button--primary" onClick={() => void exportPng()}>
                {t('character.exportPng')}
              </button>
            </div>
          }
        >
          <div className="tab-row">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button${activeTab === tab.id ? ' is-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'core' ? (
            <div className="form-grid">
              {coreFields.map(([label, field]) => (
                <label key={field} className="field">
                  <span>{label}</span>
                  {field === 'name' ? (
                    <input
                      className="input"
                      value={String(record.card.data[field] ?? '')}
                      onChange={(event) =>
                        updateRecord((draft) => {
                          draft.card.data[field] = event.target.value;
                        })
                      }
                    />
                  ) : (
                    <textarea
                      className="input textarea"
                      value={String(record.card.data[field] ?? '')}
                      onChange={(event) =>
                        updateRecord((draft) => {
                          draft.card.data[field] = event.target.value;
                        })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          ) : null}

          {activeTab === 'tags' ? (
            <div className="stack">
              <label className="field">
                <span>{t('character.tags.label')}</span>
                <textarea
                  className="input textarea"
                  value={record.card.data.tags.join(', ')}
                  onChange={(event) =>
                    updateRecord((draft) => {
                      draft.card.data.tags = event.target.value
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter(Boolean);
                    })
                  }
                />
              </label>
              <div className="stack">
                <p className="muted">{t('character.tags.normalizedPreview')}</p>
                <div className="tag-row">
                  {normalizedPreview.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'lorebook' ? (
            <div className="stack">
              <label className="field">
                <span>{t('character.lorebook.name')}</span>
                <input
                  className="input"
                  value={record.card.data.character_book?.name ?? ''}
                  onChange={(event) =>
                    updateRecord((draft) => {
                      draft.card.data.character_book = draft.card.data.character_book ?? { name: '', entries: [] };
                      draft.card.data.character_book.name = event.target.value;
                    })
                  }
                />
              </label>
              <button
                className="button"
                onClick={() =>
                  updateRecord((draft) => {
                    draft.card.data.character_book = draft.card.data.character_book ?? { name: '', entries: [] };
                    draft.card.data.character_book.entries.push({
                      id: createId('entry'),
                      keys: [''],
                      secondaryKeys: [],
                      content: '',
                      enabled: true,
                      order: draft.card.data.character_book.entries.length
                    });
                  })
                }
              >
                {t('character.lorebook.addEntry')}
              </button>
              {record.card.data.character_book?.entries.length ? (
                <div className="stack">
                  {record.card.data.character_book.entries.map((entry) => (
                    <article key={entry.id} className="subcard">
                      <div className="inline-form">
                        <input
                          className="input"
                          placeholder={t('character.lorebook.keys')}
                          value={entry.keys.join(', ')}
                          onChange={(event) =>
                            updateLorebookEntry(entry.id, {
                              keys: event.target.value.split(',').map((value) => value.trim()).filter(Boolean)
                            })
                          }
                        />
                        <input
                          className="input"
                          placeholder={t('character.lorebook.secondaryKeys')}
                          value={entry.secondaryKeys.join(', ')}
                          onChange={(event) =>
                            updateLorebookEntry(entry.id, {
                              secondaryKeys: event.target.value.split(',').map((value) => value.trim()).filter(Boolean)
                            })
                          }
                        />
                      </div>
                      <textarea
                        className="input textarea"
                        placeholder={t('character.lorebook.content')}
                        value={entry.content}
                        onChange={(event) => updateLorebookEntry(entry.id, { content: event.target.value })}
                      />
                      <div className="inline-form">
                        <label className="checkbox-line">
                          <input
                            type="checkbox"
                            checked={entry.enabled}
                            onChange={(event) => updateLorebookEntry(entry.id, { enabled: event.target.checked })}
                          />
                          <span>{t('common.enabled')}</span>
                        </label>
                        <input
                          className="input"
                          type="number"
                          aria-label={t('character.lorebook.order')}
                          value={entry.order}
                          onChange={(event) => updateLorebookEntry(entry.id, { order: Number(event.target.value) })}
                        />
                        <button
                          className="button button--danger"
                          onClick={() =>
                            updateRecord((draft) => {
                              if (!draft.card.data.character_book) {
                                return;
                              }
                              draft.card.data.character_book.entries = draft.card.data.character_book.entries.filter(
                                (value) => value.id !== entry.id
                              );
                            })
                          }
                        >
                          {t('character.lorebook.delete')}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title={t('character.lorebook.empty.title')} description={t('character.lorebook.empty.description')} />
              )}
            </div>
          ) : null}

          {activeTab === 'raw' ? (
            <div className="stack">
              <div className="inline-form">
                <Link className="button button--ghost" to="/">
                  {t('character.raw.back')}
                </Link>
              </div>
              <div className="subcard">
                <h3>{t('character.raw.validation')}</h3>
                {!record.validation.issues.length ? (
                  <p className="muted">{t('character.raw.validationEmpty')}</p>
                ) : (
                  <ul className="simple-list">
                    {record.validation.issues.map((issue) => (
                      <li key={`${issue.path}-${issue.message}`}>
                        <strong>{issue.level}</strong> {issue.path}:{' '}
                        {issue.messageKey ? t(issue.messageKey as never, issue.messageValues) : issue.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="subcard">
                <h3>{t('character.raw.diff')}</h3>
                <pre className="code-block">
                  {diffLines.map((line, index) => (
                    <div key={`${line.kind}-${index}`} className={`diff-line diff-line--${line.kind}`}>
                      {line.kind === 'added' ? '+ ' : line.kind === 'removed' ? '- ' : '  '}
                      {line.text}
                    </div>
                  ))}
                </pre>
              </div>
              <div className="subcard">
                <h3>{t('character.raw.json')}</h3>
                <pre className="code-block">{serializeCharacterToJson(record)}</pre>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </AppShell>
  );
}
