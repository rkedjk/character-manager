import { describe, expect, it } from 'vitest';
import { resolveThemeMode } from './theme';

describe('theme resolution', () => {
  it('resolves manual and system theme modes', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('light');
    expect(resolveThemeMode('dark', 'light')).toBe('dark');
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
    expect(resolveThemeMode('system', 'light')).toBe('light');
  });
});
