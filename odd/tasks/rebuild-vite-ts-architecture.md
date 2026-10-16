# Rebuild: Vite + TypeScript architecture

## Objective
Rebuild the single-file `index.html` app as a Vite + TypeScript project with a feature-oriented Clean Architecture (domain / application / infrastructure / presentation per feature, shared kernel in `src/shared/`), keeping current behavior except where the user changed it (below).

## Problem / Why
All logic (data, map, persistence, UI, export) lived in one inline script. It was hard to test, to extend (shared backend, more categories) and to maintain.

## Scope (behavior to preserve)
- Leaflet map, OSM tiles (`tile.openstreetmap.org`), restricted to limit bounds (+15% pad on screen), dashed limit rectangle.
- 3 fixed reference points; user points (6 categories in 2 groups) added by clicking the map, stored in localStorage, deletable.
- Sidebar: collapsible, search, category filters, list with fly-to.
- Popup with Google Maps directions link.
- Export from tiles at z17: PDF A3, PDF A4 x4 mosaic, PDF A4, PNG.

## Accepted scope changes (user requests during T1–T6)
- Clean Architecture with classes. Use cases have a single `execute()`. Components are classes with `mount()`/`render()`. Shared `Observable`/`Result`/`Component`/`Button`/`Modal`/`Chip`. Every file has a header comment and every class has JSDoc. Added `docs/ARCHITECTURE.md`.
- **Browser print removed** (button, print CSS, beforeprint/afterprint, print-fit). It was replaced by **JSON export/import of user points**: `{ version: 1, exportedAt, points }`, file name `puntos-cuendina-YYYY-MM-DD.json`. Import also accepts a bare array, validates in the domain, dedupes by id and reports "Importados: N · Omitidos: M" without using `alert`.
- Old app removed with no backup. Vite dev/preview run on port 8000 with `strictPort`, so they share the old localStorage origin and key.

## Constraints
- No framework. Tailwind v4 via `@tailwindcss/vite`. Leaflet and jsPDF via npm (jsPDF is lazy-loaded).
- The domain is free of the framework, Leaflet and the DOM. Persistence goes through the async `PointRepository` port.
- UI copy stays in Spanish. Code and comments are in English.
- Not a git repository, so work-unit commits are pending until the user initializes git.

## Tasks
- [x] T1 Scaffold Vite + TS + Tailwind + Vitest; feature folders. (route: delegated, writer trigger, 2+ files)
- [x] T2 Domain + application: categories, points, bounds, filtering, repository port + localStorage adapter, with unit tests.
- [x] T3 Map feature: Leaflet adapter (map, markers, popups, add mode).
- [x] T4 UI: sidebar, filters, list, form modal.
- [x] T5 Export feature: tile canvas renderer, PDF/PNG. (print removed per user request)
- [x] T6 Verify: `npm run build`, `npm test`, typecheck; README with run instructions.
- [x] T7 JSON export/import of user points with unit tests (validation, merge/dedupe, export).
- [x] T8 docs/ARCHITECTURE.md; port 8000 strict; old app removed.
- [ ] Commit work units. Pending: not a git repo.

## Acceptance criteria
- `npm run dev` runs the app with the same behavior, except for the accepted changes above.
- `npm run build` and `npm test` pass.

## Progress / Evidence (2026-10-15)
- Test-first: RED was observed for domain/repository/geometry/escapeHtml/gmaps (missing modules), then again after the Clean Architecture restructure (8 suites failing) and for the JSON transfer suite. All of them then went GREEN.
- `npm install`: ok (the npm "install-scripts" notice for core-js postinstall is informational).
- `npm run typecheck`: exit 0 (TypeScript 7.0.2, strict + noUncheckedIndexedAccess).
- `npm test`: 11 files, 41 tests passed.
- `npm run build`: built with no chunk-size warning (jsPDF split into a lazy chunk).
- `vite preview` answered HTTP 200 on http://localhost:8000.
- Dependency rule was checked with rg: no domain/application file imports infrastructure, presentation, Leaflet, jsPDF or the DOM.

## Known gaps
- No in-browser manual/E2E run in this session (map interaction, real OSM tile export, PDF download). It needs a manual smoke test with `npm run dev`.
- `LocalStoragePointRepository` drops stored entries that fail validation (for example a blank name) and rewrites the list on the next save, so those entries are lost.

## Next step
Manual smoke test in the browser. Initialize git and make work-unit commits if the user wants them.
