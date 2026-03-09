# Character Manager

Local-first PWA for importing, editing, organizing, and exporting character cards in `JSON` and `PNG` formats.

## What It Does
- Imports character cards from `JSON` and embedded `PNG` metadata
- Stores the library locally in IndexedDB via Dexie
- Provides a mobile-friendly library view with search, filters, collections, and bulk actions
- Edits core card fields, tags, lorebook entries, and shows raw JSON + diff
- Exports cards back to `JSON` and `PNG`

This project is a character card manager, not a chat app.

## Stack
- `Vite`
- `React`
- `TypeScript`
- `vite-plugin-pwa`
- `Dexie`
- `Zod`
- `Zustand`
- `Vitest`

## Development
```bash
npm install
npm run dev
```

Useful commands:

```bash
npm test
npm run build
npm run preview
```

## Project Layout
```text
src/
  app/        App shell, router, store
  core/       Parsing, serialization, validation, normalization, PNG metadata
  db/         Dexie schema and repositories
  pages/      Route-level screens
  shared/     Shared types, utilities, UI primitives
```

## Current MVP Scope
- Library dashboard
- Character editor with `Core`, `Tags`, `Lorebook`, `Raw`
- Tag normalization and alias rules
- Local backup/restore of app data
- PWA build with auto-update enabled

## Notes
- Data is stored locally in the browser.
- Imported files should be treated as untrusted input.
- Unknown fields and `extensions` should be preserved through import/export flows where possible.
