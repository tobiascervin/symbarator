## Why

`data/spells.ts` is a 45-spell MVP that was sized for L1 picks only. The leveling change exposed the gap: Templars hit a dead-end at L7 because the Theurg 1st-level pool was exhausted, and every other tradition (Sorcerer, Wizard, Witch, Staff Mage, Symbolist, Troll Singer) will hit the same wall as soon as a Mystic levels past L1. The Player's Guide spans pp. 187–223 of spell content (tradition lists + 0th–9th level descriptions); transcribing it makes the level-up flow's spell pickers actually usable through L20.

## What Changes

- Encode every spell from PG sect. 5 (pp. 187–223) into `data/spells.ts`: the full set of cantrips and 1st–9th level spells, with the `traditions` field tagging each spell with every Mystic-tradition list it appears on per pp. 187–190.
- Cover every tradition referenced by `SpellTradition` in `lib/character/types.ts`: `sorcerer`, `theurg`, `troll-singer`, `witch`, `wizard`, plus `staff-mage` and `symbolist` (resolve from PG how those two derive their lists — typically by inheriting from another tradition or by extension).
- Each spell entry retains the existing `SpellDef` shape: `id` (kebab-case), `name`, `level: SpellLevel`, `school`, `traditions: SpellTradition[]`, optional `ritual`, and a one-paragraph mechanical `description`. No new fields are introduced.
- No changes to the leveling flow, the level-up dialog, or class progression are required — those already consume `SPELLS` / `spellsForTradition`.

Out of scope: spell upcasting tables (e.g. "At Higher Levels: …"), boon/burden additions, any rule errata, illustrations.

## Capabilities

### New Capabilities
- `spell-catalog`: The complete encoded spell list — every spell in the Player's Guide, tagged by tradition and level, ready to be consumed by the level-up flow and the character sheet.

### Modified Capabilities
<!-- None: this only fills out content; the existing leveling capability is unchanged. -->

## Impact

- **Data**: `data/spells.ts` grows from ~45 entries to whatever the PG total is (estimated 250–350 spells). No structural changes to the file.
- **Types**: none. `SpellLevel = 0..9` and `SpellTradition` were both already widened during the leveling change.
- **UI**: none. `level-up-dialog.tsx`'s spell picker already shows entries from any tradition+level it's given.
- **Risk**: copyrighted text — descriptions must be terse mechanical paraphrases (consistent with the existing entries), not verbatim transcriptions. No flavor prose.
