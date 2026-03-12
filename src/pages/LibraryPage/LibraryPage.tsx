import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../shared/ui/AppShell';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SectionCard } from '../../shared/ui/SectionCard';
import { useAppStore } from '../../app/store/appStore';
import { filterAndSortCharacters } from '../../features/library/librarySelectors';
import { useI18n } from '../../shared/i18n/I18nProvider';

export function LibraryPage() {
  const {
    characters,
    filters,
    collections,
    selectedIds,
    isLoading,
    loadInitialData,
    setFilters,
    toggleCharacterSelection,
    clearSelection,
    deleteSelectedCharacters,
    bulkAddTag,
    bulkRemoveTag,
    bulkReplaceTag,
    bulkMergeTags,
    moveSelectedToCollection,
    renameSelectedLorebook
  } = useAppStore();
  const { resolvedLocale, t } = useI18n();
  const [bulkTag, setBulkTag] = useState('');
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [mergeSources, setMergeSources] = useState('');
  const [mergeTarget, setMergeTarget] = useState('');
  const [lorebookName, setLorebookName] = useState('');
  const visibleCharacters = useMemo(() => filterAndSortCharacters(characters, filters), [characters, filters]);
  const tags = useMemo(() => [...new Set(characters.flatMap((character) => character.tagsIndex))].sort(), [characters]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  return (
    <AppShell>
      <div className="page-grid">
        <SectionCard title={t('library.title')} subtitle={t('library.subtitle')}>
          <div className="toolbar">
            <input
              className="input"
              placeholder={t('library.searchPlaceholder')}
              value={filters.query}
              onChange={(event) => setFilters({ query: event.target.value })}
            />
            <select className="input" value={filters.tag} onChange={(event) => setFilters({ tag: event.target.value })}>
              <option value="">{t('library.allTags')}</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={filters.collectionId}
              onChange={(event) => setFilters({ collectionId: event.target.value })}
            >
              <option value="">{t('library.allCollections')}</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={filters.sortBy}
              onChange={(event) => setFilters({ sortBy: event.target.value as typeof filters.sortBy })}
            >
              <option value="updatedAt">{t('library.sort.updatedAt')}</option>
              <option value="importedAt">{t('library.sort.importedAt')}</option>
              <option value="name">{t('library.sort.name')}</option>
            </select>
          </div>
          {isLoading ? <p className="muted">{t('library.loading')}</p> : null}
          {!visibleCharacters.length ? (
            <EmptyState title={t('library.empty.title')} description={t('library.empty.description')} />
          ) : (
            <div className="card-grid">
              {visibleCharacters.map((character) => (
                <article key={character.id} className="character-card">
                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(character.id)}
                      onChange={() => toggleCharacterSelection(character.id)}
                    />
                    <span>{t('common.select')}</span>
                  </label>
                  <div className="character-card__content">
                    <div>
                      <p className="eyebrow">{character.sourceType.toUpperCase()}</p>
                      <h3>{character.card.data.name}</h3>
                    </div>
                    <p className="muted clamp">{character.card.data.description || t('library.card.noDescription')}</p>
                    <div className="tag-row">
                      {character.tagsIndex.map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="meta-row">
                      <span>{character.hasLorebook ? t('library.card.lorebook') : t('library.card.noLorebook')}</span>
                      <span>{new Date(character.updatedAt).toLocaleDateString(resolvedLocale)}</span>
                    </div>
                    <Link className="button button--primary" to={`/character/${character.id}`}>
                      {t('library.card.openEditor')}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={t('library.bulk.title')}
          subtitle={t('library.bulk.subtitle')}
          actions={selectedIds.length ? <span className="pill">{t('library.bulk.selected', { count: selectedIds.length })}</span> : null}
        >
          {!selectedIds.length ? (
            <EmptyState title={t('library.bulk.empty.title')} description={t('library.bulk.empty.description')} />
          ) : (
            <div className="stack">
              <div className="inline-form">
                <input
                  className="input"
                  placeholder={t('library.bulk.tagName')}
                  value={bulkTag}
                  onChange={(event) => setBulkTag(event.target.value)}
                />
                <button className="button" onClick={() => void bulkAddTag(bulkTag)} disabled={!bulkTag.trim()}>
                  {t('library.bulk.addTag')}
                </button>
                <button className="button" onClick={() => void bulkRemoveTag(bulkTag)} disabled={!bulkTag.trim()}>
                  {t('library.bulk.removeTag')}
                </button>
              </div>
              <div className="inline-form">
                <input
                  className="input"
                  placeholder={t('library.bulk.replaceFrom')}
                  value={replaceFrom}
                  onChange={(event) => setReplaceFrom(event.target.value)}
                />
                <input
                  className="input"
                  placeholder={t('library.bulk.replaceTo')}
                  value={replaceTo}
                  onChange={(event) => setReplaceTo(event.target.value)}
                />
                <button
                  className="button"
                  onClick={() => void bulkReplaceTag(replaceFrom, replaceTo)}
                  disabled={!replaceFrom.trim() || !replaceTo.trim()}
                >
                  {t('library.bulk.replaceTag')}
                </button>
              </div>
              <div className="inline-form">
                <input
                  className="input"
                  placeholder={t('library.bulk.mergeSources')}
                  value={mergeSources}
                  onChange={(event) => setMergeSources(event.target.value)}
                />
                <input
                  className="input"
                  placeholder={t('library.bulk.mergeTarget')}
                  value={mergeTarget}
                  onChange={(event) => setMergeTarget(event.target.value)}
                />
                <button
                  className="button"
                  onClick={() =>
                    void bulkMergeTags(
                      mergeSources.split(',').map((value) => value.trim()).filter(Boolean),
                      mergeTarget
                    )
                  }
                  disabled={!mergeSources.trim() || !mergeTarget.trim()}
                >
                  {t('library.bulk.mergeTags')}
                </button>
              </div>
              <div className="inline-form">
                <input
                  className="input"
                  placeholder={t('library.bulk.lorebookName')}
                  value={lorebookName}
                  onChange={(event) => setLorebookName(event.target.value)}
                />
                <button
                  className="button"
                  onClick={() => void renameSelectedLorebook(lorebookName)}
                  disabled={!lorebookName.trim()}
                >
                  {t('library.bulk.renameLorebook')}
                </button>
              </div>
              <div className="inline-form">
                <select
                  className="input"
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) {
                      void moveSelectedToCollection(event.target.value);
                    }
                  }}
                >
                  <option value="">{t('library.bulk.moveToCollection')}</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                <button className="button button--danger" onClick={() => void deleteSelectedCharacters()}>
                  {t('library.bulk.deleteSelected')}
                </button>
                <button className="button button--ghost" onClick={clearSelection}>
                  {t('library.bulk.clearSelection')}
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
