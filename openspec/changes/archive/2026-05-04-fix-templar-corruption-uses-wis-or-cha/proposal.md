## Why

The Templar approach (Warrior/Templar, PG p. 143) explicitly states: *"If your Wisdom modifier is higher than your Charisma modifier, you can use it instead of Charisma to calculate your Corruption Threshold."* The current `computeCorruptionThreshold` ignores this rule and always uses Charisma for any class with `shadowFormula: "standard"`, undercounting the threshold for Templar characters whose Wis exceeds their Cha. This produces an incorrect sheet and a misleading printable export for a core canonical approach.

## What Changes

- Introduce an approach-level data field that lets an approach override the ability used in the `"standard"` corruption-threshold formula by taking `max(cha, override)` instead of plain Cha.
- Set this override on the Templar approach so its Corruption Threshold reads `2 × profBonus + max(chaMod, wisMod)`, minimum 2.
- Update `computeCorruptionThreshold` in `lib/character/compute.ts` to honor the new field when the class formula is `"standard"`.
- Update the character sheet's Corruption Threshold tooltip/popover so the formula shown for a Templar reflects which ability was actually used (Wis or Cha).
- Add a unit/E2E scenario verifying Templar with Wis > Cha gets the higher value, and Templar with Wis ≤ Cha falls back to the existing standard result.

This is a behavior fix, not a schema change: `Character` JSON shape is unchanged, no migration needed, no `Character` schema bump.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `class-progression`: adds an approach-level rule for overriding the standard corruption-threshold ability with the higher of Cha and a named ability, and pins this rule to Templar with Wis.

## Impact

- Code: `lib/character/types.ts` (new optional field on `ApproachDef`), `lib/character/compute.ts` (`computeCorruptionThreshold`), `data/level-tables/warrior.ts` or `data/classes.ts` (declare the override on the Templar approach), and the corruption threshold display in `components/sheet/character-sheet.tsx` / `components/sheet/printable-sheet.tsx` if the formula is rendered.
- Tests: a new scenario in the leveling/compute tests covering Wis-higher and Cha-higher Templars; existing standard-formula scenarios for non-Templar warriors must still pass unchanged.
- Data/storage: no `Character` schema change, no migrator change, no version bump beyond a PATCH per the release process.
- User-facing: existing Templar characters in localStorage will see a corrected (and usually higher) Corruption Threshold the next time their sheet renders. No data loss.
