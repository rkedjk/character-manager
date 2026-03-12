# Repository Guidelines

## Project Structure & Module Organization
This repository is a local-first React + TypeScript PWA for managing character cards.

- `src/app/`: app shell, router, global store
- `src/pages/`: route-level screens (`LibraryPage`, `CharacterPage`, `ImportPage`, `SettingsPage`)
- `src/core/`: format logic kept outside the UI (`card-parser`, `card-serializer`, `validation`, `normalization`, `png-metadata`, `diff`)
- `src/db/`: Dexie schema and repository helpers
- `src/shared/`: reusable types, utilities, and UI primitives
- `public/`: static assets
- `test-characters/`: small repository-owned JSON fixtures for import and editor testing
- Tests live next to source files as `*.test.ts`

Keep UI concerns out of `src/core/`, and keep file-format logic out of page components.

## Build, Test, and Development Commands
- `npm install`: install dependencies
- `npm run dev`: start the Vite dev server
- `npm test`: run Vitest unit tests once
- `npm run build`: type-check and produce a production build in `dist/`
- `npm run preview`: serve the production build locally

Use `npm run build` before opening a PR; it catches both TypeScript and bundling issues.

## Coding Style & Naming Conventions
- Use TypeScript with `strict` mode and prefer explicit types at public boundaries.
- Use 2-space indentation and keep files ASCII unless existing content requires otherwise.
- React components: `PascalCase` filenames and exports, e.g. `CharacterPage.tsx`.
- Functions, variables, and store actions: `camelCase`.
- Keep domain types in `src/shared/types/character.ts` unless a new module boundary is justified.
- Prefer small repository helpers over direct Dexie access inside components.

No formatter or linter is configured yet, so keep style consistent with existing files.

## Testing Guidelines
- Framework: Vitest.
- Name tests `*.test.ts` beside the implementation file.
- Focus coverage on round-trip safety: parsing, serialization, validation, tag normalization, and diff behavior.
- Add regression tests for any change that touches import/export or unknown-field preservation.
- Prefer committed fixtures from `test-characters/` for stable tests.
- `remote-characters/` is for local, non-repo test data only; do not commit files from it or depend on it for required CI coverage.

## Commit & Pull Request Guidelines
Git history currently starts with `Initial commit`, so use short, imperative commit subjects such as:
- `Add PNG metadata export fallback`
- `Fix tag merge normalization`

PRs should include:
- a brief summary of user-visible changes
- notes about storage or import/export risks
- screenshots or short recordings for UI changes
- test/build status (`npm test`, `npm run build`)

## Security & Configuration Tips
This app is local-first. Do not add cloud sync, telemetry, or server dependencies without explicit product direction. Treat imported card data as untrusted input and validate before storing or exporting it.
Large local datasets such as `remote-characters/` must stay ignored by git.

## Auto-Update Rule
Keep PWA auto-update enabled. The current app uses `vite-plugin-pwa` with automatic service worker updates; do not switch to manual update prompts or disable update registration unless the task explicitly requires it. If update behavior changes, document the reason in the PR.
