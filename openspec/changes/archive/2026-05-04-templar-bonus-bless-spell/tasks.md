## 1. Schema & data

- [x] 1.1 Add optional `alwaysKnownSpells?: ReadonlyArray<SpellId>` to the `ApproachSpellcasting` interface in `lib/character/types.ts` (with a short doc comment explaining it grants spells *in addition to* the player picks)
- [x] 1.2 Set `TEMPLAR_SPELLCASTING.alwaysKnownSpells = ["bless"]` in `data/level-tables/warrior.ts` and update the surrounding comment to cite PG p. 143's "plus the bless spell" clause

## 2. Compute layer

- [x] 2.1 Update `computeSpellcasting` in `lib/character/compute.ts` to include `grantedSpells: ReadonlyArray<SpellId>` in its return value (sourced from `approach.spellcasting.alwaysKnownSpells ?? []`)
- [x] 2.2 Add a sanity check (module-load assertion or a unit test) that every approach's `alwaysKnownSpells` ids exist in `SPELL_BY_ID` *(folded into the existing `data/classes.ts` IIFE that asserts level-table shapes; new check loops `sc.alwaysKnownSpells ?? []` and `fail()`s on any missing id, dev-throw / prod-`console.error` parity with the surrounding rules)*

## 3. Builder UI — approach step

- [x] 3.1 In `components/builder/approach-step.tsx`, when `selected.spellcasting?.alwaysKnownSpells?.length` is non-zero, render a read-only "Always known (granted by your approach)" section listing each granted spell by name above the cantrip / 1st-level pickers
- [x] 3.2 Confirm `validateStep("approach", c)` in `lib/character/validation.ts` is unchanged and granted spells do not affect the picker counters or remaining-pick badges *(validator only inspects `c.spellPicks.cantrips.length` / `c.spellPicks.spellsKnown.length`; granted spells live on the approach and never touch `spellPicks`, so no edit needed)*

## 4. Sheet UI — spellbook

- [x] 4.1 In `components/sheet/character-sheet.tsx#SheetSpellbook`, merge `computeSpellcasting(c)?.grantedSpells ?? []` into the `known` list so granted spells appear in `SpellTabs` *(plus de-dup via `new Set([...cantrips, ...spellsKnown, ...granted])` so a save that has both "bless" picked AND granted doesn't render twice; mirrored in the printable sheet)*
- [x] 4.2 Pass a `grantedSpellIds: Set<SpellId>` through to `SpellTabs` (or render-time prop) so granted spells display a "Granted" badge in their card *(extended `SpellTabsMode.display` with `grantedSpellIds?: ReadonlySet<string>`; threaded into `SpellCard` via a new `granted?: boolean` prop on the display variant; the badge sits alongside school/ritual)*
- [x] 4.3 Make the same merge in `components/sheet/printable-sheet.tsx` so the printable export includes granted spells (badge optional in print) *(merge applied; no badge in print — the printed list is name-only by design)*
- [x] 4.4 Verify granted spells route through `SpellCastPopover` like any other known spell — no additional plumbing needed *(SheetSpellbook merges granted ids into `known`, `SpellTabs` display mode wires `onCast` per card; the bless card's `Cast Bless` button opens the popover and the existing `spendSlot(c, n)` runs unchanged — covered by `templar-bless.spec.ts` "granted Bless can be cast through the standard cast popover")*

## 5. Tests & verification

- [x] 5.1 Add a Playwright e2e step (or extend an existing Templar fixture in `e2e/`) that creates a Templar, completes the spell picker with non-bless picks, and asserts the sheet's spellbook contains a `Bless` card with the "Granted" badge *(new `e2e/templar-bless.spec.ts`: seeds a Templar whose `spellsKnown: ["cure-wounds"]` so any visible bless must come from the grant; asserts the `Cast Bless` card and its inner "Granted" badge are visible)*
- [x] 5.2 Add a unit-level assertion (in compute or validation tests if present, otherwise a dedicated small test) that `computeSpellcasting` for a Templar returns `grantedSpells: ["bless"]` and that `validateStep("approach", c)` accepts a Templar with 2 cantrips + 1 non-bless leveled spell *(folded into the same spec — Playwright tests run in Node so direct module imports work; sweeps L1..L20, plus a `TEMPLAR_SPELLCASTING.alwaysKnownSpells === ["bless"]` + `SPELL_BY_ID["bless"]` resolution check)*
- [x] 5.3 Run `npm run lint`, `npm run build`, and `npm run test:e2e` — all pass *(80/80 e2e tests pass; build is clean; lint shows the same 9 pre-existing problems on `main` — none in files this change touches, confirmed during the v1.11.0 release flow with edits stashed)*
- [x] 5.4 Manual smoke: create a Templar in the dev server, finish the wizard, open the sheet, confirm `Bless` appears in the 1st-level spellbook tab with a Granted badge and is castable via the cast popover (spending one 1st-level slot) **(Not executed by agent — automated coverage: `templar-bless.spec.ts` exercises the sheet's bless card with the Granted badge and the cast popover's enabled "Cast at L1" button.)**
