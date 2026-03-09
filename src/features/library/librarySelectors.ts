import type { CharacterFilters, CharacterRecord } from '../../shared/types/character';

export function filterAndSortCharacters(characters: CharacterRecord[], filters: CharacterFilters): CharacterRecord[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = characters.filter((character) => {
    if (filters.tag && !character.tagsIndex.includes(filters.tag)) {
      return false;
    }

    if (filters.collectionId && !character.collections.includes(filters.collectionId)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      character.card.data.name.toLowerCase().includes(query) ||
      character.tagsIndex.some((tag) => tag.includes(query)) ||
      character.textIndex.includes(query)
    );
  });

  return filtered.sort((left, right) => {
    if (filters.sortBy === 'name') {
      return left.card.data.name.localeCompare(right.card.data.name);
    }

    return right[filters.sortBy].localeCompare(left[filters.sortBy]);
  });
}
