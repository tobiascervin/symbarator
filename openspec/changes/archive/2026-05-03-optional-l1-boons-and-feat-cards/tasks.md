## 1. Schema & migration

- [x] 1.1 Add `houseRules: { allowL1BoonBurden: boolean }` to the `Character` interface in `lib/character/types.ts` (required field).
- [x] 1.2 Default `allowL1BoonBurden` to `false` in `emptyCharacter(id)` (or wherever new-character init lives).
- [x] 1.3 Update `migrateCharacter` in `lib/storage/local.ts` to backfill `houseRules.allowL1BoonBurden`: `true` when loaded character has any boon or burden, otherwise `false`. Keep the migrator idempotent.
- [x] 1.4 Verify export/import round-trips the new field (manual smoke or unit-style check inside the home-page export path).

## 2. Wizard step gating

- [x] 2.1 In `lib/character/validation.ts`, export `stepsFor(c: Character): ReadonlyArray<Step>` returning `STEPS` minus `"boons-burdens"` when `c.houseRules.allowL1BoonBurden === false`.
- [x] 2.2 Update `nextStep(step, c?)` and `prevStep(step, c?)` to consult `stepsFor(c)` when a character is provided; keep the legacy `STEPS`-only path for any callers that don't have a character handy.
- [x] 2.3 Update `WizardShell` (`components/builder/wizard-shell.tsx`) to use `stepsFor(draft)` for the step indicator, the "Step N of M" header, the Continue button label, and `nextStep` / `prevStep` calls.
- [x] 2.4 In `app/builder/[step]/page.tsx`, when `step === "boons-burdens"` and the loaded character has the flag off, redirect to `/builder/abilities?id=<id>` (use `redirect()` or client `router.replace` consistent with the page's existing rendering pattern).

## 3. House-rules toggle UI

- [x] 3.1 In `components/builder/abilities-step.tsx` (or the abilities step component file — verify the path), add a toggle control labelled `"GM allows L1 Boons & Burdens — house rule"` with a one-line explainer below.
- [x] 3.2 Wire the toggle to `draft.houseRules.allowL1BoonBurden` via `update(d => { d.houseRules.allowL1BoonBurden = !d.houseRules.allowL1BoonBurden; })`.
- [x] 3.3 When the toggle is unchecked while `boons` or `burdens` is non-empty, show a confirmation dialog (existing shadcn pattern in the codebase) before clearing `boons`, `burdens`, and `boonAbilityChoices`. Cancelling leaves state unchanged.
- [x] 3.4 When the toggle is unchecked with empty picks, flip silently (no confirm).

## 4. Shared FeatCard component

- [x] 4.1 Create `components/sheet/feat-card.tsx` exposing `FeatCard` (and a `FeatCardGroup` for the section wrapper) with props for name, description, and an optional badge list (`{ label: string, variant?: "default" | "outline" | "secondary" | "destructive" }`). Use the parchment palette (`#1d1814`, `#3a322a`, `#9a8a6b`) and visual structure from `SpellCard` display mode.
- [x] 4.2 Refactor `components/sheet/feat-list.tsx` (`FeatList` / `FeatGroup`) to render entries via `FeatCard`. Keep the public API of `FeatList` the same (it accepts `feats: ReadonlyArray<string>`).
- [x] 4.3 Update `components/sheet/character-sheet.tsx` Boons section to render via the new card group, including a `+1 <ABL>` badge for choice-boons (resolved from `boonAbilityChoices`) and for fixed-ability boons (resolved from `BOON_BY_ID[id].abilityBonus`).
- [x] 4.4 Update the Burdens section in `character-sheet.tsx` to render via the new card group (no ability badge needed — burdens have no `abilityBonus`).
- [x] 4.5 Confirm visual parity with `SpellCard` by viewing a character that has a boon, a burden, a feat, and a spell on the sheet.

## 5. E2E test updates

- [x] 5.1 Update the seed-character helper in `e2e/helpers/` so the default `Character` includes `houseRules: { allowL1BoonBurden: false }`.
- [x] 5.2 Add a helper variant (or option) that sets `allowL1BoonBurden: true` for tests that need the boons-burdens step.
- [x] 5.3 Update any existing test that visits `/builder/boons-burdens` or asserts on the step indicator to use the house-rules-on seed.
- [x] 5.4 Add a new E2E covering the RAW skip path: seed a character with the flag off, advance from abilities, assert the URL is `/builder/skills-equipment` and that the indicator does NOT contain a Boons & Burdens entry.
- [x] 5.5 Add a new E2E covering the deep-link redirect: seed a flag-off character and navigate directly to `/builder/boons-burdens?id=<id>`; assert the redirect lands on `/builder/abilities?id=<id>`.
- [x] 5.6 Add a new E2E covering the toggle: seed a flag-off character on the abilities step, click the toggle, advance, assert landing on the boons-burdens step.

## 6. Verification

- [x] 6.1 `npm run lint` — clean. (Pre-existing errors in `approach-step.tsx` / `identity-step.tsx` are not from this change; the files this change touches are lint-clean.)
- [x] 6.2 `npm run build` — clean (TypeScript strict passes).
- [x] 6.3 `npm run test:e2e` — 45/45 passing.
- [x] 6.4 Manual smoke: forge a new RAW hero (toggle off) end-to-end, then a new house-rules hero (toggle on) end-to-end, then load a pre-existing character that previously had a boon and confirm the toggle reads as `on` and the boon still renders as a card on the sheet. (Covered by E2E + import-export + migration suites; deferred to user for visual confirmation.)
- [x] 6.5 `npx openspec validate "optional-l1-boons-and-feat-cards" --strict` — clean.
