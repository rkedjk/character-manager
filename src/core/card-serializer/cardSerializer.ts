import type { CharacterRecord } from '../../shared/types/character';
import { embedCharacterMetadataInPng } from '../png-metadata/pngMetadata';

function mergeRawCurrent(record: CharacterRecord): Record<string, unknown> {
  const raw = typeof record.rawCurrent === 'object' && record.rawCurrent !== null
    ? structuredClone(record.rawCurrent as Record<string, unknown>)
    : {};

  const rawData = typeof raw.data === 'object' && raw.data !== null
    ? { ...(raw.data as Record<string, unknown>) }
    : {};

  raw.spec = record.card.spec;
  raw.data = {
    ...rawData,
    ...record.card.data
  };

  return raw;
}

export function serializeCharacterToJson(record: CharacterRecord): string {
  return JSON.stringify(mergeRawCurrent(record), null, 2);
}

export async function serializeCharacterToPng(record: CharacterRecord, imageBlob: Blob): Promise<Blob> {
  const metadata = serializeCharacterToJson(record);
  return embedCharacterMetadataInPng(imageBlob, metadata);
}
