export interface DiffLine {
  kind: 'added' | 'removed' | 'unchanged';
  text: string;
}

function formatValue(value: unknown): string[] {
  return JSON.stringify(value, null, 2).split('\n');
}

export function buildCharacterDiff(original: unknown, current: unknown): DiffLine[] {
  const before = formatValue(original);
  const after = formatValue(current);
  const max = Math.max(before.length, after.length);
  const lines: DiffLine[] = [];

  for (let index = 0; index < max; index += 1) {
    const left = before[index];
    const right = after[index];

    if (left === right && left !== undefined) {
      lines.push({ kind: 'unchanged', text: left });
      continue;
    }

    if (left !== undefined) {
      lines.push({ kind: 'removed', text: left });
    }

    if (right !== undefined) {
      lines.push({ kind: 'added', text: right });
    }
  }

  return lines;
}
