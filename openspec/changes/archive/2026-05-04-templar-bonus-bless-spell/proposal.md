## Why

The Templar approach text in the Player's Guide and in `data/classes.ts` ("you learn 2 cantrips and 1 first-level spell from the Theurg tradition list, **plus the bless spell**") promises an automatically-granted *bless* on top of the player's spell picks, but the data model has no way to express a granted-by-default spell. As a result, a Templar character sheet is missing *bless* unless the player happens to spend their single 1st-level pick on it — which is not the rule.

## What Changes

- Add an `alwaysKnownSpells` (granted-spell) list to `ApproachSpellcasting` so any approach can grant fixed spells in addition to the player-chosen counts.
- Populate `TEMPLAR_SPELLCASTING.alwaysKnownSpells` with `["bless"]`.
- Have `computeSpellcasting` (and the sheet's spellbook resolution path) merge granted spells into the character's known-spell list — without inflating `spellsKnown` counters or the L1 picker validation.
- Builder approach step: when displaying the Templar's spell picker, surface granted spells as a read-only "Always known" line so the player understands *bless* is theirs without spending the 1 spell pick on it.
- Sheet spellbook: render granted spells alongside chosen ones so they appear in the Spellbook tabs and are castable through the existing Cast popover.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `class-progression`: extend the Spellcasting-approach requirement so an approach MAY also declare a list of *always-known* spells that are granted in addition to the player-chosen `cantripsKnown` / `spellsKnown` counts.
- `character-creation`: clarify that the Templar L1 spell picker grants *bless* on top of the 2 cantrips + 1 first-level pick, and that granted spells do not count toward the pick limits or block validation.

## Impact

- Types: `lib/character/types.ts` — `ApproachSpellcasting` gains an optional `alwaysKnownSpells: ReadonlyArray<SpellId>`.
- Data: `data/level-tables/warrior.ts` — `TEMPLAR_SPELLCASTING` declares `alwaysKnownSpells: ["bless"]`.
- Compute: `lib/character/compute.ts#computeSpellcasting` exposes the granted list; sheet spellbook merges it into the displayed known-spell set.
- Builder: `components/builder/approach-step.tsx` shows an "Always known" read-only entry for granted spells; spell-pick validation in `lib/character/validation.ts` is unchanged (granted spells do not count toward picks).
- Sheet: `components/sheet/character-sheet.tsx` and `components/sheet/printable-sheet.tsx` include granted spells in the spellbook list. Existing slot/cast logic already operates on any known spell id, so no further changes are needed there.
- Storage / `Character` JSON shape: unchanged — granted spells are derived from approach data, not stored on the character.
- Migrations: none. Existing Templar characters automatically gain *bless* on next render.
