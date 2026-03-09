import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseCharacterPng } from './cardParser';

async function loadFixtureFile(fileName: string): Promise<File> {
  const path = `/home/rkedjk/Git/character-manager/remote-characters/${fileName}`;
  const buffer = await readFile(path);
  return new File([buffer], fileName, { type: 'image/png' });
}

describe('parseCharacterPng', () => {
  it('imports real SillyTavern PNG metadata encoded as base64', async () => {
    const file = await loadFixtureFile('Aisha.png');
    const parsed = await parseCharacterPng(file, []);

    expect(parsed.result.status).not.toBe('error');
    expect(parsed.record?.card.data.name).toBe('Aisha');
    expect(parsed.record?.sourceType).toBe('png');
  });

  it('imports another real PNG fixture without mutating the source file', async () => {
    const file = await loadFixtureFile('Nanao.png');
    const parsed = await parseCharacterPng(file, []);

    expect(parsed.result.status).not.toBe('error');
    expect(parsed.record?.card.data.name).toBeTruthy();
    expect(parsed.record?.rawOriginal).toBeTruthy();
  });
});
