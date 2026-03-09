import { describe, expect, it } from 'vitest';
import { validateCharacter } from './validateCharacter';

describe('validateCharacter', () => {
  it('returns warnings for empty optional-but-important fields', () => {
    const result = validateCharacter({
      spec: 'chara_card_v2',
      data: {
        name: 'Alice',
        tags: []
      }
    });

    expect(result.isValid).toBe(true);
    expect(result.issues.some((issue) => issue.path === 'data.description')).toBe(true);
    expect(result.issues.some((issue) => issue.path === 'data.first_mes')).toBe(true);
  });
});
