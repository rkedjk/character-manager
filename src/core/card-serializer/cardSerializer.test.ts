import { describe, expect, it } from 'vitest';
import { serializeCharacterToJson } from './cardSerializer';

describe('serializeCharacterToJson', () => {
  it('keeps unknown fields and extensions while writing edited card data', () => {
    const text = serializeCharacterToJson({
      id: 'character_1',
      sourceType: 'json',
      sourceFileName: 'alice.json',
      createdAt: '2026-03-09T00:00:00.000Z',
      updatedAt: '2026-03-09T00:00:00.000Z',
      importedAt: '2026-03-09T00:00:00.000Z',
      card: {
        spec: 'chara_card_v2',
        data: {
          name: 'Alice',
          description: 'Updated',
          tags: ['heroine'],
          extensions: {
            test: true
          }
        }
      },
      collections: [],
      tagsIndex: ['heroine'],
      textIndex: 'alice heroine',
      hasLorebook: false,
      validation: { isValid: true, issues: [] },
      rawOriginal: { spec: 'chara_card_v2', data: { name: 'Old' }, custom: { keep: true } },
      rawCurrent: { spec: 'chara_card_v2', data: { name: 'Old' }, custom: { keep: true } }
    });

    const parsed = JSON.parse(text) as Record<string, unknown>;
    expect((parsed.custom as Record<string, unknown>).keep).toBe(true);
    expect((parsed.data as Record<string, unknown>).description).toBe('Updated');
    expect(((parsed.data as Record<string, unknown>).extensions as Record<string, unknown>).test).toBe(true);
  });
});
