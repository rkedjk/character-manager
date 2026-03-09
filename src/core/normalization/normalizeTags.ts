import type { TagAliasRule } from '../../shared/types/character';

function normalizeSingleTag(tag: string): string {
  return tag.trim().replace(/\s+/g, ' ').toLowerCase();
}

export interface NormalizedTagsResult {
  tags: string[];
  duplicates: string[];
}

export function normalizeTags(tags: string[], aliasRules: TagAliasRule[]): NormalizedTagsResult {
  const aliases = new Map(
    aliasRules
      .filter((rule) => rule.enabled)
      .map((rule) => [normalizeSingleTag(rule.from), normalizeSingleTag(rule.to)])
  );

  const deduped = new Set<string>();
  const duplicates = new Set<string>();

  for (const rawTag of tags) {
    const normalized = normalizeSingleTag(rawTag);
    if (!normalized) {
      continue;
    }

    const aliased = aliases.get(normalized) ?? normalized;
    if (deduped.has(aliased)) {
      duplicates.add(aliased);
      continue;
    }

    deduped.add(aliased);
  }

  return {
    tags: [...deduped],
    duplicates: [...duplicates]
  };
}

export function buildTextIndex(fields: Array<string | undefined>, tags: string[]): string {
  return [...fields, ...tags]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .toLowerCase();
}
