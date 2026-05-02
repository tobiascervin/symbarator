## Context

Today the codebase has zero test infrastructure. CLAUDE.md states "No test runner is configured" explicitly. QA has been manual: open a browser, walk a flow, eyeball the result. That worked at L1 but broke down once `add-character-leveling` landed — there are 5 classes × ≤9 approaches × 20 levels of progression, plus a dialog flow with ~5 step kinds, plus storage migration. Manual coverage of that matrix costs 30+ minutes of clicking per regression sweep.

Constraints:
- Next.js 16 App Router with Turbopack dev server.
- LocalStorage-only persistence; no backend or DB to seed.
- The repo has been deliberately small in tooling (no CI yet, single-developer cadence). New deps should be conservative.
- Tests must run on the user's macOS dev machine and any future CI without flake from network-bound external services.

## Goals / Non-Goals

**Goals:**
- A `npm run test:e2e` command that runs a meaningful smoke suite headlessly in under ~60 seconds locally.
- The hardest-to-verify-manually flows are covered: building a hero through all 7 wizard steps, leveling up multiple times, and the storage migration on pre-leveling saves.
- A documented LocalStorage seeding pattern so new tests can skip irrelevant setup and start in a useful state in one or two lines.
- TypeScript-checked test files (no `tsc` blind spots).

**Non-Goals:**
- GitHub Actions / CI integration — tracked as a follow-up.
- Cross-browser coverage. Chromium only.
- Visual regression / screenshot diffing.
- Unit tests for `lib/character/level-up.ts`, `compute.ts`, validators, etc. (Vitest could be a separate change.)
- 100% E2E coverage; we cover the critical paths and the patterns to extend, not every edge case.
- Mobile / responsive test profiles.

## Decisions

### Decision 1: Playwright over Cypress / Vitest+browser-mode

Playwright is best-in-class for full-browser E2E in 2025: parallelism, auto-wait, native `page.addInitScript` for pre-load setup (we need this for `localStorage` seeding), cleanest TypeScript ergonomics, single-binary install. Cypress is heavier and slower. Vitest browser mode is good for component-level tests but doesn't fit our flow (we want to drive the actual app end-to-end).

### Decision 2: Tests live in `e2e/` at the repo root

Mirrors common Playwright convention. Avoids the React-Testing-Library `*.test.tsx` collocation pattern (we aren't writing component tests). Keeps Next's `app/` tree clean.

```
e2e/
  helpers/
    seed.ts          # page.addInitScript fixtures for localStorage
    selectors.ts     # shared role/text locators if anything is reused
  builder.spec.ts    # full L1 wizard happy path
  level-up.spec.ts   # ASI / feat / Change Self / spells-learned variants
  migration.spec.ts  # pre-leveling save loads and renders
  import-export.spec.ts
```

### Decision 3: LocalStorage seeding via `page.addInitScript`

The wizard has 7 steps. Walking it takes ~30+ clicks per test. Most level-up tests don't need that — they need a character at a specific state. `page.addInitScript` runs before any page script and is the right hook for setting up `localStorage` synchronously. The seed helper takes a `Partial<Character>` (or a full one for completely-shaped fixtures), fills the storage keys (`symbaroum:character:<id>` + `symbaroum:characters:index`), and returns the id so the test can navigate to `/characters/<id>` directly.

```ts
// usage example
await seedCharacter(page, {
  ...mysticAtL1,
  level: 5,
  approachId: "theurg",
});
await page.goto("/characters/abc123");
```

We `await` `page.addInitScript` once per test (in a `beforeEach` if shared), then `page.goto`. The first navigation triggers the seeded state. We do NOT seed via UI clicks for level-up tests — too slow and too brittle.

### Decision 4: Use Playwright's web-server feature, not a manual `next dev` startup

`playwright.config.ts` has a `webServer` block that boots `next dev` (or `next start` against a prebuilt app) on a known port and tears it down at the end. We use `next dev` for fast iteration locally; CI can later swap to `next build && next start` for a production-realistic run. Single port (3001 to avoid colliding with manual dev), auto-reuse if already running.

### Decision 5: Selectors prefer accessible roles and visible text

`page.getByRole('button', { name: 'Level Up' })`, `page.getByText('Forge a New Hero')`, etc. We avoid `data-testid` attributes for now — the UI's accessible structure is the test contract. If any element resists role-based selection, we add a `data-testid` only at the leaf and document the precedent.

### Decision 6: Test-data fixtures live in `e2e/helpers/seed.ts`, not separate JSON files

Inline TypeScript fixtures benefit from type-checking against `Character`, `CharacterLevel`, etc. Externalized JSON would drift silently. The fixtures cover: a fresh L1 hero, a leveled-up Mystic at L5, a Templar at L6, a pre-leveling save (no `feats`, no `maxHp`, `level: 1` literal) for migration tests.

### Decision 7: Run only against Chromium

Chromium is what the deployed app's users overwhelmingly use; the app uses no browser-vendor-specific APIs. Adding Firefox / WebKit doubles or triples test runtime for marginal value. We document how to add them later in `playwright.config.ts` when it becomes worth it.

## Risks / Trade-offs

- **Playwright-binary install on every fresh checkout** → mitigated by documenting `npx playwright install chromium` in CLAUDE.md and pinning the dep version. Chromium is cached locally per Playwright version.
- **Flake from `next dev` HMR / first-load compile** → first test in a fresh process can be slow because Turbopack compiles on first hit. Mitigation: a `beforeAll` warmup `goto('/')` so the slow compile is paid once, not per test. Default 30 s navigation timeout should accommodate.
- **LocalStorage seeding hides UI-driven bugs** → tests that bypass the wizard via seeding won't catch regressions in wizard step transitions. Mitigation: keep `builder.spec.ts` as the dedicated wizard-walks-all-7-steps test; everything else can seed.
- **Test fixtures drift from the schema** → if `Character` gains a field, fixtures may go stale. Mitigation: fixtures are typed as `Character`, so adding a required field breaks fixtures at compile time.
- **No CI yet** → tests only run when the developer remembers. Mitigation: document the script in CLAUDE.md so it's discoverable. CI is a planned follow-up.

## Migration Plan

1. Land Playwright config + minimum scripts + `e2e/builder.spec.ts` (the wizard happy path) first. Run it locally; verify the dev server boots cleanly under Playwright's `webServer`.
2. Add `e2e/helpers/seed.ts` and `e2e/level-up.spec.ts` (level-up flow variants, including the bug we hit: leveling from L2→L3 with no required choices, then to L4 with an ASI).
3. Add `e2e/migration.spec.ts` and `e2e/import-export.spec.ts`.
4. Update CLAUDE.md with the new script and the `e2e/` convention.
5. No rollback needed — purely additive.

## Open Questions

- **Q1**: Do we want `npm run test:e2e:ui` aliased to `playwright test --ui` for the interactive runner? *Default: yes, low cost.*
- **Q2**: Should the suite block production builds when tests fail? *Default: no — until we have CI, this is informational only.*
- **Q3**: Which version of `@playwright/test` to pin? *Default: latest stable at implementation time, exact version (no `^`).*
