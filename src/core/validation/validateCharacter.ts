import { z } from 'zod';
import type { CharacterCardDocument, ValidationIssue, ValidationSummary } from '../../shared/types/character';

const cardSchema = z.object({
  spec: z.literal('chara_card_v2'),
  data: z.object({
    name: z.string().min(1, 'Name is required'),
    tags: z.array(z.string()).default([]),
    extensions: z.record(z.unknown()).optional()
  }).passthrough()
}).passthrough();

export function validateCharacter(card: CharacterCardDocument): ValidationSummary {
  const issues: ValidationIssue[] = [];
  const parsed = cardSchema.safeParse(card);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        level: 'error',
        path: issue.path.join('.'),
        message: issue.message
      });
    }
  }

  if (!card.data.description?.trim()) {
    issues.push({
      level: 'warning',
      path: 'data.description',
      message: 'Description is empty.',
      messageKey: 'validation.descriptionEmpty'
    });
  }

  if (!card.data.first_mes?.trim()) {
    issues.push({
      level: 'warning',
      path: 'data.first_mes',
      message: 'First message is empty.',
      messageKey: 'validation.firstMessageEmpty'
    });
  }

  return {
    isValid: issues.every((issue) => issue.level !== 'error'),
    issues
  };
}
