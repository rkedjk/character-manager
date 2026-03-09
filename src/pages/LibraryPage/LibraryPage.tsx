import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../shared/ui/AppShell';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SectionCard } from '../../shared/ui/SectionCard';
import { useAppStore } from '../../app/store/appStore';
import { filterAndSortCharacters } from '../../features/library/librarySelectors';

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
        <SectionCard title="Library" subtitle="Search, filter and open local character cards.">
          <div className="toolbar">
            <input
              className="input"
              placeholder="Search by name, tag or text"
              value={filters.query}
              onChange={(event) => setFilters({ query: event.target.value })}
            />
            <select className="input" value={filters.tag} onChange={(event) => setFilters({ tag: event.target.value })}>
              <option value="">All tags</option>
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
              <option value="">All collections</option>
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
              <option value="updatedAt">Last updated</option>
              <option value="importedAt">Imported</option>
              <option value="name">Name</option>
            </select>
          </div>
          {isLoading ? <p className="muted">Loading library…</p> : null}
          {!visibleCharacters.length ? (
            <EmptyState title="No characters yet" description="Import JSON or PNG cards to start your local library." />
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
                    <span>Select</span>
                  </label>
                  <div className="character-card__content">
                    <div>
                      <p className="eyebrow">{character.sourceType.toUpperCase()}</p>
                      <h3>{character.card.data.name}</h3>
                    </div>
                    <p className="muted clamp">{character.card.data.description || 'No description yet.'}</p>
                    <div className="tag-row">
                      {character.tagsIndex.map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="meta-row">
                      <span>{character.hasLorebook ? 'Lorebook' : 'No lorebook'}</span>
                      <span>{new Date(character.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <Link className="button button--primary" to={`/character/${character.id}`}>
                      Open editor
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Bulk actions"
          subtitle="Preview mentally first: changes apply to the current selection."
          actions={selectedIds.length ? <span className="pill">{selectedIds.length} selected</span> : null}
        >
          {!selectedIds.length ? (
            <EmptyState title="Nothing selected" description="Select one or more cards in the library to unlock bulk actions." />
          ) : (
            <div className="stack">
              <div className="inline-form">
                <input
                  className="input"
                  placeholder="Tag name"
                  value={bulkTag}
                  onChange={(event) => setBulkTag(event.target.value)}
                />
                <button className="button" onClick={() => void bulkAddTag(bulkTag)} disabled={!bulkTag.trim()}>
                  Add tag
                </button>
                <button className="button" onClick={() => void bulkRemoveTag(bulkTag)} disabled={!bulkTag.trim()}>
                  Remove tag
                </button>
              </div>
              <div className="inline-form">
                <input
                  className="input"
                  placeholder="Replace from"
                  value={replaceFrom}
                  onChange={(event) => setReplaceFrom(event.target.value)}
                />
                <input
                  className="input"
                  placeholder="Replace to"
                  value={replaceTo}
                  onChange={(event) => setReplaceTo(event.target.value)}
                />
                <button
                  className="button"
                  onClick={() => void bulkReplaceTag(replaceFrom, replaceTo)}
                  disabled={!replaceFrom.trim() || !replaceTo.trim()}
                >
                  Replace tag
                </button>
              </div>
              <div className="inline-form">
                <input
                  className="input"
                  placeholder="Merge tags: a, b, c"
                  value={mergeSources}
                  onChange={(event) => setMergeSources(event.target.value)}
                />
                <input
                  className="input"
                  placeholder="Canonical tag"
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
                  Merge tags
                </button>
              </div>
              <div className="inline-form">
                <input
                  className="input"
                  placeholder="Lorebook name"
                  value={lorebookName}
                  onChange={(event) => setLorebookName(event.target.value)}
                />
                <button
                  className="button"
                  onClick={() => void renameSelectedLorebook(lorebookName)}
                  disabled={!lorebookName.trim()}
                >
                  Rename lorebook
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
                  <option value="">Move to collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
                <button className="button button--danger" onClick={() => void deleteSelectedCharacters()}>
                  Delete selected
                </button>
                <button className="button button--ghost" onClick={clearSelection}>
                  Clear selection
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
