import { createId } from '../../shared/lib/id';
import { nowIso } from '../../shared/lib/date';
import type {
  CharacterCardDocument,
  CharacterRecord,
  ImportFileResult,
  SourceType,
  TagAliasRule
} from '../../shared/types/character';
import { extractCharacterMetadataFromPng } from '../png-metadata/pngMetadata';
import { normalizeTags, buildTextIndex } from '../normalization/normalizeTags';
import { validateCharacter } from '../validation/validateCharacter';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toCardDocument(raw: unknown): CharacterCardDocument {
  if (!isRecord(raw)) {
    throw new Error('Card payload must be an object.');
  }

  const rawData = isRecord(raw.data) ? raw.data : raw;
  const spec = typeof raw.spec === 'string' ? raw.spec : 'chara_card_v2';
  const tags = Array.isArray(rawData.tags) ? rawData.tags.filter((tag): tag is string => typeof tag === 'string') : [];

  return {
    spec: spec === 'chara_card_v2' ? 'chara_card_v2' : 'chara_card_v2',
    data: {
      ...rawData,
      name: typeof rawData.name === 'string' ? rawData.name : 'Untitled character',
      tags
    },
    extra: Object.fromEntries(Object.entries(raw).filter(([key]) => key !== 'spec' && key !== 'data'))
  };
}

function buildCharacterRecord(
  fileName: string,
  sourceType: SourceType,
  raw: unknown,
  aliasRules: TagAliasRule[]
): CharacterRecord {
  const card = toCardDocument(raw);
  const normalizedTags = normalizeTags(card.data.tags, aliasRules);
  card.data.tags = normalizedTags.tags;

  const importedAt = nowIso();
  const validation = validateCharacter(card);

  return {
    id: createId('character'),
    sourceType,
    sourceFileName: fileName,
    createdAt: importedAt,
    updatedAt: importedAt,
    importedAt,
    card,
    collections: [],
    tagsIndex: normalizedTags.tags,
    textIndex: buildTextIndex(
      [
        card.data.name,
        card.data.description,
        card.data.personality,
        card.data.scenario,
        card.data.first_mes,
        card.data.mes_example,
        card.data.creator_notes,
        card.data.system_prompt,
        card.data.post_history_instructions
      ],
      normalizedTags.tags
    ),
    hasLorebook: Boolean(card.data.character_book?.entries.length),
    lorebookName: card.data.character_book?.name,
    validation,
    rawOriginal: raw,
    rawCurrent: structuredClone(raw)
  };
}

export async function parseCharacterJson(
  file: File,
  aliasRules: TagAliasRule[]
): Promise<{ record?: CharacterRecord; result: ImportFileResult }> {
  try {
    const rawText = await file.text();
    const raw = JSON.parse(rawText) as unknown;
    const record = buildCharacterRecord(file.name, 'json', raw, aliasRules);
    return {
      record,
      result: {
        fileName: file.name,
        status: record.validation.isValid ? 'success' : 'warning',
        message: record.validation.isValid ? 'JSON imported.' : 'JSON imported with warnings.',
        characterId: record.id
      }
    };
  } catch (error) {
    return {
      result: {
        fileName: file.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown JSON import error.'
      }
    };
  }
}

export async function parseCharacterPng(
  file: File,
  aliasRules: TagAliasRule[]
): Promise<{ record?: CharacterRecord; result: ImportFileResult }> {
  try {
    const metadata = await extractCharacterMetadataFromPng(file);
    const raw = JSON.parse(metadata) as unknown;
    const record = buildCharacterRecord(file.name, 'png', raw, aliasRules);
    return {
      record,
      result: {
        fileName: file.name,
        status: record.validation.isValid ? 'success' : 'warning',
        message: record.validation.isValid ? 'PNG imported.' : 'PNG imported with warnings.',
        characterId: record.id
      }
    };
  } catch (error) {
    return {
      result: {
        fileName: file.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown PNG import error.'
      }
    };
  }
}
