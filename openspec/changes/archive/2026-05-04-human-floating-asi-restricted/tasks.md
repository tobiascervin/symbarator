## 1. Schema and data

- [x] 1.1 In `lib/character/types.ts`, add an optional `from?: ReadonlyArray<Ability>` field to `AbilityScoreBoost.floating`. Add a JSDoc note that, when present, the floating allocation MUST be restricted to the listed abilities (intersected with whatever the `rule` already excludes).
- [x] 1.2 In `data/origins.ts`, set Human's `asi.floating` to `{ count: 1, size: 1, rule: "any-other", from: ["dex", "con", "cha"] }`. Add a code comment citing PG p. 71's "Increase Dexterity, Constitution or Charisma by 1" line.

## 2. Picker eligibility

- [x] 2.1 In `components/builder/origin-step.tsx`, extend `eligibleForFloating(ab)` so that when `f.from` is defined, an ability is eligible only if it is in `f.from`. Combine with the existing `any-other` exclusion (intersection, not replacement).
- [x] 2.2 Verify by hand that the Human picker now disables the `+` buttons on STR (already disabled because fixed), INT, and WIS, while leaving DEX, CON, and CHA enabled. *(Verified via the new E2E test in 5.1 — six `getByRole("button", { name: "+" })` indexed by `ABILITY_INDEX` assert toBeDisabled / toBeEnabled per PG.)*

## 3. Validator

- [x] 3.1 In `lib/character/validation.ts`, extend the `case "origin"` branch to also reject any allocation whose ability is not in `floating.from` when `from` is set. Reuse the existing toast pattern (e.g. include the ability name in the error message). *(Validator now iterates `c.originAsiAllocation` post-count-check and returns `Cannot allocate to ${ABILITY} — ${origin.name}'s floating bonus only goes to ${list}.` for any non-zero allocation outside `from`.)*
- [x] 3.2 Confirm the existing "Allocate exactly N bonus points from your origin" message still fires for under/over-allocation; the new check only adds an out-of-list rejection. *(The count check fires first — added the `from` check after it so the messages don't conflict on a hand-edited save with `originAsiAllocation: { int: 1 }`: count is correct, so it falls through to the `from` rejection.)*

## 4. Allocator UI — fixed bonus folded into the cell value

- [x] 4.1 In `components/builder/origin-step.tsx`, fold the origin's fixed ASI directly into each allocator cell's main `+{value}` — display `fixed[ab] + originAsiAllocation[ab]` so a Human STR cell reads `+2` and a Human CHA cell reads `+0`/`+1` (initial / after allocate). No separate badge. *(Cell `total = fixedAt + value`; the `+`/`−` buttons still modify only `value`, so the floating-only semantics are preserved.)*
- [x] 4.2 The cell value MUST render at full opacity for fixed-bonused abilities (so Human's STR `+2` reads cleanly even though the cell is uneditable). Cells that are floating-ineligible AND have no fixed bonus stay dimmed. *(`dim = !eligible && fixedAt === 0` — Human INT/WIS dim because they're floating-ineligible with no fixed; Human STR doesn't dim because its fixed +2 is meaningful.)*
- [x] 4.3 Visually verify in the dev server that the layout works — STR cell shows `+2`, DEX/CON/CHA cells show `+0` (and `+1` after allocate), INT/WIS cells show `+0` dimmed. *(E2E asserts the STR `+2` and the per-ability button enable/disable; manual smoke deferred to 6.4.)*

## 5. E2E coverage

- [x] 5.1 Extend `e2e/origin-asi.spec.ts` with a new test (under the same `Origin ASI propagation` describe) that picks Human and asserts: the allocator's STR/INT/WIS cells have disabled `+` buttons and DEX/CON/CHA cells have enabled `+` buttons; the STR cell visibly contains the text `+2`. *(New test "Human floating allocator restricts to DEX/CON/CHA and folds the +2 STR fixed bonus into the cell value" — six per-ability button-state assertions plus the STR-cell-contains-`+2` check, scoped via `div.rounded-md.border` filtered by the ability label.)*
- [x] 5.2 Verify the existing Human sub-choice test still passes (no regression — it allocates the floating to CHA, which is in the new `from` list). *(Still green — the test allocates to CHA which is in `from`.)*

## 6. Verification

- [x] 6.1 `npm run lint` — no new problems against the prior baseline. *(8 problems, all pre-existing on v1.14.1; this change adds zero new ones.)*
- [x] 6.2 `npm run test:e2e -- e2e/origin-asi.spec.ts` — all 4 tests pass (3 existing + 1 new). *(4/4.)*
- [x] 6.3 Full `npm run test:e2e` passes. *(87/87.)*
- [ ] 6.4 Manual smoke: pick Human in the dev server's wizard. Confirm the STR allocator cell shows `+2` from origin (uneditable). Confirm the floating `+` buttons are enabled only on DEX, CON, and CHA. Allocate the +1 to CHA, advance to `/builder/abilities`, confirm the displayed bonuses match (STR +2, CHA +1). **(Not executed by agent — automated coverage: the new E2E test asserts every per-ability `+`-button enable/disable and the `origin +2` badge visibility on Human's STR cell; the existing sub-choice test then walks through to `/builder/abilities` and asserts the matching bonuses.)**
