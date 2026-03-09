import { create } from 'zustand';
import type { CharacterFilters, CharacterRecord, ImportFileResult, TagAliasRule } from '../../shared/types/character';
import {
  applyTagsToCharacters,
  deleteCharacters,
  exportLibrarySnapshot,
  getAsset,
  getCharacter,
  importLibrarySnapshot,
  importFiles,
  listAliasRules,
  listCharacters,
  listCollections,
  moveCharactersToCollection,
  renameLorebookForCharacters,
  saveAliasRule,
  saveCharacter,
  saveCollection
} from '../../db/repositories/characterRepository';
import { createId } from '../../shared/lib/id';
import { nowIso } from '../../shared/lib/date';

interface AppState {
  characters: CharacterRecord[];
  filters: CharacterFilters;
  selectedCharacterId?: string;
  selectedIds: string[];
  aliasRules: TagAliasRule[];
  collections: { id: string; name: string; createdAt: string }[];
  importResults: ImportFileResult[];
  isLoading: boolean;
  loadInitialData: () => Promise<void>;
  setFilters: (patch: Partial<CharacterFilters>) => void;
  selectCharacter: (id?: string) => void;
  toggleCharacterSelection: (id: string) => void;
  clearSelection: () => void;
  refreshCharacters: () => Promise<void>;
  saveCharacterRecord: (record: CharacterRecord) => Promise<void>;
  importCharacterFiles: (files: FileList | File[]) => Promise<void>;
  saveAliasRule: (from: string, to: string) => Promise<void>;
  createCollection: (name: string) => Promise<void>;
  deleteSelectedCharacters: () => Promise<void>;
  bulkAddTag: (value: string) => Promise<void>;
  bulkRemoveTag: (value: string) => Promise<void>;
  bulkReplaceTag: (from: string, to: string) => Promise<void>;
  bulkMergeTags: (sources: string[], to: string) => Promise<void>;
  moveSelectedToCollection: (collectionId: string) => Promise<void>;
  renameSelectedLorebook: (name: string) => Promise<void>;
  loadCharacter: (id: string) => Promise<CharacterRecord | undefined>;
  loadAssetBlob: (id: string) => Promise<Blob | undefined>;
  exportLibraryData: () => Promise<{
    characters: CharacterRecord[];
    collections: { id: string; name: string; createdAt: string }[];
    tagAliasRules: TagAliasRule[];
  }>;
  importLibraryData: (snapshot: {
    characters?: CharacterRecord[];
    collections?: { id: string; name: string; createdAt: string }[];
    tagAliasRules?: TagAliasRule[];
  }) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  characters: [],
  filters: {
    query: '',
    tag: '',
    collectionId: '',
    sortBy: 'updatedAt'
  },
  selectedIds: [],
  aliasRules: [],
  collections: [],
  importResults: [],
  isLoading: false,

  async loadInitialData() {
    set({ isLoading: true });
    const [characters, aliasRules, collections] = await Promise.all([
      listCharacters(),
      listAliasRules(),
      listCollections()
    ]);
    set({ characters, aliasRules, collections, isLoading: false });
  },

  setFilters(patch) {
    set({ filters: { ...get().filters, ...patch } });
  },

  selectCharacter(id) {
    set({ selectedCharacterId: id });
  },

  toggleCharacterSelection(id) {
    const selectedIds = get().selectedIds.includes(id)
      ? get().selectedIds.filter((value) => value !== id)
      : [...get().selectedIds, id];
    set({ selectedIds });
  },

  clearSelection() {
    set({ selectedIds: [] });
  },

  async refreshCharacters() {
    set({ characters: await listCharacters() });
  },

  async saveCharacterRecord(record) {
    await saveCharacter(record);
    await get().refreshCharacters();
  },

  async importCharacterFiles(files) {
    const results = await importFiles(files, get().aliasRules);
    await get().loadInitialData();
    set({ importResults: results });
  },

  async saveAliasRule(from, to) {
    await saveAliasRule({
      id: createId('tag_rule'),
      from,
      to,
      enabled: true
    });
    await get().loadInitialData();
  },

  async createCollection(name) {
    await saveCollection({
      id: createId('collection'),
      name,
      createdAt: nowIso()
    });
    await get().loadInitialData();
  },

  async deleteSelectedCharacters() {
    await deleteCharacters(get().selectedIds);
    await get().loadInitialData();
    set({ selectedIds: [] });
  },

  async bulkAddTag(value) {
    await applyTagsToCharacters(get().selectedIds, { type: 'add', value }, get().aliasRules);
    await get().loadInitialData();
  },

  async bulkRemoveTag(value) {
    await applyTagsToCharacters(get().selectedIds, { type: 'remove', value }, get().aliasRules);
    await get().loadInitialData();
  },

  async bulkReplaceTag(from, to) {
    await applyTagsToCharacters(get().selectedIds, { type: 'replace', value: to, sources: [from] }, get().aliasRules);
    await get().loadInitialData();
  },

  async bulkMergeTags(sources, to) {
    await applyTagsToCharacters(get().selectedIds, { type: 'merge', value: to, sources }, get().aliasRules);
    await get().loadInitialData();
  },

  async moveSelectedToCollection(collectionId) {
    await moveCharactersToCollection(get().selectedIds, collectionId);
    await get().loadInitialData();
  },

  async renameSelectedLorebook(name) {
    await renameLorebookForCharacters(get().selectedIds, name);
    await get().loadInitialData();
  },

  async loadCharacter(id) {
    return getCharacter(id);
  },

  async loadAssetBlob(id) {
    return (await getAsset(id))?.blob;
  },

  async exportLibraryData() {
    return exportLibrarySnapshot();
  },

  async importLibraryData(snapshot) {
    await importLibrarySnapshot(snapshot);
    await get().loadInitialData();
  }
}));
