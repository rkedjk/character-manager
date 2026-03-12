import { db } from '../dexie';
import { nowIso } from '../../shared/lib/date';
import type {
  AppSettings,
  AssetRecord,
  CharacterRecord,
  CollectionRecord,
  ImportFileResult,
  TagAliasRule
} from '../../shared/types/character';
import { buildTextIndex, normalizeTags } from '../../core/normalization/normalizeTags';
import { validateCharacter } from '../../core/validation/validateCharacter';
import { parseCharacterJson, parseCharacterPng } from '../../core/card-parser/cardParser';
import { createId } from '../../shared/lib/id';

export async function listCharacters(): Promise<CharacterRecord[]> {
  return db.characters.orderBy('updatedAt').reverse().toArray();
}

export async function getCharacter(id: string): Promise<CharacterRecord | undefined> {
  return db.characters.get(id);
}

export async function saveCharacter(record: CharacterRecord): Promise<void> {
  record.updatedAt = nowIso();
  record.validation = validateCharacter(record.card);
  record.tagsIndex = record.card.data.tags;
  record.textIndex = buildTextIndex(
    [
      record.card.data.name,
      record.card.data.description,
      record.card.data.personality,
      record.card.data.scenario,
      record.card.data.first_mes,
      record.card.data.mes_example,
      record.card.data.creator_notes,
      record.card.data.system_prompt,
      record.card.data.post_history_instructions
    ],
    record.card.data.tags
  );
  record.hasLorebook = Boolean(record.card.data.character_book?.entries.length);
  record.lorebookName = record.card.data.character_book?.name;
  record.rawCurrent = {
    ...(typeof record.rawCurrent === 'object' && record.rawCurrent !== null ? (record.rawCurrent as Record<string, unknown>) : {}),
    spec: record.card.spec,
    data: {
      ...(typeof record.rawCurrent === 'object' &&
      record.rawCurrent !== null &&
      typeof (record.rawCurrent as Record<string, unknown>).data === 'object' &&
      (record.rawCurrent as Record<string, unknown>).data !== null
        ? ((record.rawCurrent as Record<string, unknown>).data as Record<string, unknown>)
        : {}),
      ...record.card.data
    }
  };
  await db.characters.put(record);
}

export async function deleteCharacters(ids: string[]): Promise<void> {
  await db.characters.bulkDelete(ids);
}

export async function importFiles(files: FileList | File[], aliasRules: TagAliasRule[]): Promise<ImportFileResult[]> {
  const results: ImportFileResult[] = [];

  for (const file of Array.from(files)) {
    const normalizedName = file.name.toLowerCase();
    const parsed = normalizedName.endsWith('.json')
      ? await parseCharacterJson(file, aliasRules)
      : normalizedName.endsWith('.png')
        ? await parseCharacterPng(file, aliasRules)
        : {
            result: {
              fileName: file.name,
              status: 'error' as const,
              message: 'Unsupported file type.',
              messageKey: 'import.result.unsupportedType'
            }
          };

    if (parsed.record) {
      if (parsed.record.sourceType === 'png') {
        const assetId = createId('asset');
        const asset: AssetRecord = {
          id: assetId,
          type: 'png',
          fileName: file.name,
          mimeType: file.type || 'image/png',
          blob: file,
          createdAt: nowIso()
        };
        parsed.record.avatarAssetId = assetId;
        await db.assets.put(asset);
      }
      await db.characters.put(parsed.record);
    }

    results.push(parsed.result);
  }

  return results;
}

export async function getAsset(id: string): Promise<AssetRecord | undefined> {
  return db.assets.get(id);
}

export async function exportLibrarySnapshot(): Promise<{
  characters: CharacterRecord[];
  collections: CollectionRecord[];
  tagAliasRules: TagAliasRule[];
}> {
  const [characters, collections, tagAliasRules] = await Promise.all([
    db.characters.toArray(),
    db.collections.toArray(),
    db.tagAliasRules.toArray()
  ]);

  return { characters, collections, tagAliasRules };
}

export async function importLibrarySnapshot(snapshot: {
  characters?: CharacterRecord[];
  collections?: CollectionRecord[];
  tagAliasRules?: TagAliasRule[];
}): Promise<void> {
  await db.transaction('rw', db.characters, db.collections, db.tagAliasRules, async () => {
    await db.characters.clear();
    await db.collections.clear();
    await db.tagAliasRules.clear();

    if (snapshot.characters?.length) {
      await db.characters.bulkPut(snapshot.characters);
    }

    if (snapshot.collections?.length) {
      await db.collections.bulkPut(snapshot.collections);
    }

    if (snapshot.tagAliasRules?.length) {
      await db.tagAliasRules.bulkPut(snapshot.tagAliasRules);
    }
  });
}

export async function listCollections(): Promise<CollectionRecord[]> {
  return db.collections.orderBy('name').toArray();
}

export async function saveCollection(collection: CollectionRecord): Promise<void> {
  await db.collections.put(collection);
}

export async function listAliasRules(): Promise<TagAliasRule[]> {
  return db.tagAliasRules.toArray();
}

export async function saveAliasRule(rule: TagAliasRule): Promise<void> {
  await db.tagAliasRules.put(rule);
}

export async function getAppSettings(): Promise<AppSettings | undefined> {
  return db.settings.get('app');
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await db.settings.put({
    ...settings,
    id: 'app'
  });
}

export async function applyTagsToCharacters(
  ids: string[],
  operation: { type: 'add' | 'remove' | 'replace' | 'merge'; value: string; sources?: string[] },
  aliasRules: TagAliasRule[]
): Promise<void> {
  const records = await db.characters.bulkGet(ids);

  for (const record of records) {
    if (!record) {
      continue;
    }

    let tags = [...record.card.data.tags];
    if (operation.type === 'add') {
      tags.push(operation.value);
    } else if (operation.type === 'remove') {
      tags = tags.filter((tag) => tag !== operation.value);
    } else if (operation.type === 'replace') {
      tags = tags.map((tag) => (tag === (operation.sources?.[0] ?? '') ? operation.value : tag));
    } else if (operation.type === 'merge') {
      const sources = new Set(operation.sources ?? []);
      tags = tags.map((tag) => (sources.has(tag) ? operation.value : tag));
    }

    record.card.data.tags = normalizeTags(tags, aliasRules).tags;
    await saveCharacter(record);
  }
}

export async function moveCharactersToCollection(ids: string[], collectionId: string): Promise<void> {
  const records = await db.characters.bulkGet(ids);

  for (const record of records) {
    if (!record) {
      continue;
    }

    record.collections = [...new Set([...record.collections, collectionId])];
    await saveCharacter(record);
  }
}

export async function renameLorebookForCharacters(ids: string[], lorebookName: string): Promise<void> {
  const records = await db.characters.bulkGet(ids);

  for (const record of records) {
    if (!record?.card.data.character_book) {
      continue;
    }

    record.card.data.character_book.name = lorebookName;
    await saveCharacter(record);
  }
}
