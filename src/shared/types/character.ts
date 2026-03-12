export type SourceType = 'json' | 'png';

export interface AlternateGreeting {
  id: string;
  value: string;
}

export interface LorebookEntry {
  id: string;
  keys: string[];
  secondaryKeys: string[];
  content: string;
  enabled: boolean;
  order: number;
  comment?: string;
  extra?: Record<string, unknown>;
}

export interface Lorebook {
  name?: string;
  entries: LorebookEntry[];
  extra?: Record<string, unknown>;
}

export interface CharacterCardDocument {
  spec: 'chara_card_v2';
  data: {
    name: string;
    description?: string;
    personality?: string;
    scenario?: string;
    first_mes?: string;
    mes_example?: string;
    creator_notes?: string;
    system_prompt?: string;
    post_history_instructions?: string;
    tags: string[];
    alternate_greetings?: string[];
    character_book?: Lorebook;
    extensions?: Record<string, unknown>;
    [key: string]: unknown;
  };
  extra?: Record<string, unknown>;
}

export interface ValidationIssue {
  level: 'warning' | 'error';
  path: string;
  message: string;
  messageKey?: string;
  messageValues?: Record<string, string | number>;
}

export interface ValidationSummary {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface CharacterRecord {
  id: string;
  sourceType: SourceType;
  sourceFileName: string;
  createdAt: string;
  updatedAt: string;
  importedAt: string;
  avatarAssetId?: string;
  card: CharacterCardDocument;
  collections: string[];
  tagsIndex: string[];
  textIndex: string;
  hasLorebook: boolean;
  lorebookName?: string;
  validation: ValidationSummary;
  rawOriginal: unknown;
  rawCurrent: unknown;
}

export interface CollectionRecord {
  id: string;
  name: string;
  createdAt: string;
}

export interface TagAliasRule {
  id: string;
  from: string;
  to: string;
  enabled: boolean;
}

export interface AssetRecord {
  id: string;
  type: 'avatar' | 'png';
  fileName: string;
  mimeType: string;
  blob: Blob;
  createdAt: string;
}

export interface JobRecord {
  id: string;
  type: 'import' | 'export' | 'normalization';
  status: 'queued' | 'running' | 'finished' | 'failed';
  createdAt: string;
  finishedAt?: string;
  payload?: Record<string, unknown>;
}

export interface AppSettings {
  id: 'app';
  collapseMultipleSpaces: boolean;
  lowercaseTags: boolean;
  trimTags: boolean;
  localeMode: 'auto' | 'manual';
  locale?: string;
  themeMode: 'system' | 'light' | 'dark';
}

export interface CharacterFormState {
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  creator_notes: string;
  system_prompt: string;
  post_history_instructions: string;
  tags: string[];
  alternate_greetings: AlternateGreeting[];
  lorebook?: Lorebook;
}

export interface ImportFileResult {
  fileName: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  messageKey?: string;
  messageValues?: Record<string, string | number>;
  characterId?: string;
}

export interface CharacterFilters {
  query: string;
  tag: string;
  collectionId: string;
  sortBy: 'name' | 'importedAt' | 'updatedAt';
}
