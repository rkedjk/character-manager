import { describe, expect, it } from 'vitest';
import { normalizeTags } from './normalizeTags';

describe('normalizeTags', () => {
  it('normalizes whitespace, lowercase and alias rules', () => {
    const result = normalizeTags(
      [' Tsundere ', 'cat girl', 'CAT GIRL', '', '  '],
      [{ id: '1', from: 'cat girl', to: 'catgirl', enabled: true }]
    );

    expect(result.tags).toEqual(['tsundere', 'catgirl']);
    expect(result.duplicates).toEqual(['catgirl']);
  });
});
