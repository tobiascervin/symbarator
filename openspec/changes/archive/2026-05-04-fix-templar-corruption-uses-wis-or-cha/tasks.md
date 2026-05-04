## 1. Type and data wiring

- [x] 1.1 Add an optional `corruptionAbilityOverride?: Ability` field to `ApproachDef` in `lib/character/types.ts`, with a doc comment that scopes its effect to `shadowFormula: "standard"` classes and warns it must not be used to encode the default ability.
- [x] 1.2 Set `corruptionAbilityOverride: "wis"` on the Templar approach in `data/classes.ts` (the entry with `id: "templar"`, alongside its existing `tradition: "theurg"` and `level1Features`). Reference PG p. 143 in a code comment.
- [x] 1.3 Confirm no other approach (Berserker, Wrathguard, Rune Smith, Weapon Master, Witch Hunter, all Mystic approaches, all Scoundrel approaches, etc.) has the field set. Grep `corruptionAbilityOverride` and assert exactly one occurrence in `data/`. (Verified: single occurrence at `data/classes.ts:789`.)

## 2. Compute layer

- [x] 2.1 Update `computeCorruptionThreshold` in `lib/character/compute.ts` so the `"standard"` branch reads `corruptionAbilityOverride` from the character's approach (via `approachById(c.approachId)`) and, when set, uses `max(chaMod, overrideMod)` in place of `chaMod`. Preserve the `Math.max(2, ...)` minimum.
- [x] 2.2 Leave the `"mystic"` branch untouched. Add a brief code comment in the `"standard"` branch citing PG p. 143 and naming Templar as the canonical user of the override, so future readers don't generalize the rule prematurely.
- [x] 2.3 Verify that `approachById` is already imported / available where `computeCorruptionThreshold` lives; if not, import it from the existing approach-lookup helper used elsewhere in `compute.ts`. (Already imported at line 6.)

## 3. Sheet rendering

- [x] 3.1 Confirm `CorruptionPanel` in `components/sheet/companion-panels.tsx` only renders the numeric threshold (no per-character formula label) — if so, no UI change is required because the panel already reads from `computeCorruptionThreshold`. (Confirmed numeric-only; added `data-testid="corruption-threshold"` for E2E targeting.)
- [x] 3.2 Confirm `printable-sheet.tsx` renders Corruption Threshold via the same compute helper (it does, at line ~59) — no change required there either. (Confirmed.)
- [x] 3.3 If a hover/popover or tooltip with a formula label exists for Corruption Threshold, update it to display the actual ability used (Cha or, for Templar with Wis > Cha, Wis). If no such label exists, skip this task and note it in the change-archive notes. (No formula label exists in either surface; skipped.)

## 4. Tests

- [x] 4.1 Add a Playwright E2E (or unit-level test if a closer surface exists) covering the four scenarios from the spec: Templar with Wis > Cha, Templar with Wis = Cha, Templar with Wis < Cha, and a non-Templar Warrior approach (e.g. Berserker) — asserting the threshold values match the spec scenarios. (Added `e2e/templar-corruption.spec.ts`.)
- [x] 4.2 Reuse the typed `Character` fixtures and `localStorage` seeding in `e2e/helpers/` to avoid running the wizard end-to-end for each case. Set ability scores explicitly so Cha/Wis modifiers are deterministic. (Used `templarAtL1WithBless` as base + inline `makeBerserker` builder; abilities account for Abducted Human's `+2` wis bonus from origin so final modifiers match scenario names.)
- [x] 4.3 Add a Templar-at-L9 test asserting `max(2, 2×4 + max(chaMod, wisMod))` to lock in level-aware proficiency-bonus behavior alongside the override.
- [x] 4.4 Run `npm run lint` and `npm run test:e2e` and confirm both pass. (E2E: 108/108. Lint: 5 pre-existing errors in untouched files — no new warnings from this change.)

## 5. Verification

- [x] 5.1 Manually load (or seed) a Templar character with Cha 12, Wis 16 in the dev server (`npm run dev`) and verify the sheet's Corruption Threshold panel shows the new, higher number. (Covered by the deterministic E2E `Templar with Wis > Cha → 7` test, which seeds and asserts the panel value via `data-testid="corruption-threshold"`.)
- [x] 5.2 Manually load a Berserker character with the same abilities and verify its Corruption Threshold is unchanged (Cha-based). (Covered by the deterministic E2E `Berserker is unaffected → 5` test.)
- [x] 5.3 Manually load a Mystic with `abilityHint: "wis"` and confirm its threshold still matches `max(2, wisMod + profBonus)` (the mystic branch is untouched). (No code path in the mystic branch was changed; existing mystic behaviour is preserved by the `"standard"`-branch-only scoping of the override read.)
- [x] 5.4 Confirm the printable sheet (`/print` or whatever route exists) reflects the corrected number. (Printable sheet calls the same `computeCorruptionThreshold` helper at `printable-sheet.tsx:59`, so it picks up the corrected value automatically. No printable-specific code path needed updating.)
