## Why

The recent leveling change exposed how much we lean on manual click-through for QA: tasks 9.1–9.4 in `add-character-leveling` were all browser-only verification steps that nobody could run from the harness, and the regressions we hit during implementation (duplicate Bless on Templar, L7 spell-pool exhaustion, dialog-state retention across opens) were each found by the user manually replaying the same flow. With levelable characters, persisted maxHp, schema migration, and a forking dialog UI, the surface area is now too big to keep verifying by hand on every change. Playwright tests let us cover the critical paths once, run them in seconds before each commit, and catch the same kinds of regressions automatically.

## What Changes

- Add Playwright as a dev dependency with a Chromium-only configuration; `npm run test:e2e` runs the suite headlessly against `next dev`.
- Add an end-to-end test suite covering the load-bearing user paths: home → forge a new hero → walk all 7 wizard steps → view sheet, level up an existing character through several levels (including ASI/feat/Change Self / spells-learned variants), JSON import/export round-trip, schema migration of a pre-leveling save, and the "Level Up" button being disabled at L20.
- Add a small test-utility module (`e2e/helpers/`) for seeding `localStorage` directly via `page.addInitScript` so level-up tests can start at any character state without re-walking the L1 wizard.
- Wire `tests/` (or `e2e/`) into `tsconfig.json` and `eslint.config.mjs` so test files type-check and lint alongside source.
- Document the workflow in `CLAUDE.md`: how to run the suite, where new tests should live, and the LocalStorage seeding pattern.

Out of scope for this change: GitHub Actions CI integration (separate change), visual regression / screenshot testing, cross-browser (Firefox/WebKit) coverage, unit tests for `lib/character/level-up.ts` (could come later as a separate change with Vitest if useful), and load/perf testing.

## Capabilities

### New Capabilities
- `e2e-tests`: Playwright-driven end-to-end test suite covering the critical user paths and the patterns for seeding state via `localStorage` so future changes can extend coverage cheaply.

### Modified Capabilities
<!-- None — this introduces test infrastructure; it doesn't change any product capability's requirements. -->

## Impact

- **Dependencies**: `@playwright/test` added to `devDependencies`. `npx playwright install chromium` after `npm install` — captured in CLAUDE.md.
- **Scripts**: new `test:e2e` (and likely `test:e2e:ui` for the Playwright UI runner) in `package.json`.
- **Files**: new `playwright.config.ts`, `e2e/` directory with at least one spec per critical path, `e2e/helpers/seed.ts` for `localStorage` seeding fixtures.
- **TypeScript / ESLint**: extend `tsconfig.json` `include` and `eslint.config.mjs` to cover the test directory.
- **Docs**: short paragraph in `CLAUDE.md` under stack & commands explaining the new script and where tests live.
- **Repo size**: Playwright pulls a Chromium binary on first install (~150 MB local cache); not committed.
- **Out of scope** (explicit): unit-level coverage of `lib/character/*` (a separate change can add Vitest if we want to assert math/validators directly without spinning up a browser).
