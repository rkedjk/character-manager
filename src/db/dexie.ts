import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  AssetRecord,
  CharacterRecord,
  CollectionRecord,
  JobRecord,
  TagAliasRule
} from '../shared/types/character';

export class CharacterManagerDatabase extends Dexie {
  characters!: Table<CharacterRecord, string>;
  assets!: Table<AssetRecord, string>;
  collections!: Table<CollectionRecord, string>;
  tagAliasRules!: Table<TagAliasRule, string>;
  jobs!: Table<JobRecord, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('character-manager');

    this.version(1).stores({
      characters: 'id, sourceType, sourceFileName, updatedAt, importedAt, *collections, *tagsIndex, hasLorebook, lorebookName',
      assets: 'id, type, fileName, createdAt',
      collections: 'id, name, createdAt',
      tagAliasRules: 'id, from, to, enabled',
      jobs: 'id, type, status, createdAt',
      settings: 'id'
    });
  }
}

export const db = new CharacterManagerDatabase();
