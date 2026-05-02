## Why

The builder is hardcoded to level 1: `Character.level` is the literal type `1`, `emptyCharacter` always returns level 1, and the static rules data in `data/classes.ts` stops at the L1 entry. Players who want to run a higher-level character — common in mid-campaign joins or one-shot prep — have to track everything outside the app on paper, which defeats the purpose of a builder. Adding leveling unlocks the rest of the product: you can now bring a hero from L1 to L20 with the app driving every mechanical decision the rules require.

## What Changes

- **BREAKING**: `Character.level` widens from the literal `1` to `1..20`. Storage adapters, validation, and `computeProficiencyBonus` already accept arbitrary levels, but type signatures (and any `level: 1` literals in tests/seeds) need to widen.
- Encode full L1–20 progression for all five classes and every approach in `data/classes.ts`: per-level feature grants, ASI/feat slots (typically L4/8/12/16/19), Mystic spell-slot tables, cantrips/spells known per level.
- Add a `LevelUp` flow reachable from the character sheet only (the builder remains an L1 path). Each invocation walks the player through every mechanical pick the next level requires: HP gain (average or roll), ASI vs feat (when a slot is available), feature picks where the rules offer choice (e.g. fighting-style additions, Mystic spells learned/swapped), and any approach-specific prompts.
- Persist **current totals only** — no per-level audit log. Effects apply once, into fields like `abilities`, `feats`, `spellPicks`, `maxHp`, etc.; the level number plus the static class table is sufficient to know what's already been resolved.
- Extend `computeSpellcasting`, HP, and feature-list computations to honor the current level rather than only L1.
- Surface level on the home list and sheet header. Add a "Level Up" button to the sheet (disabled at L20).

Out of scope: multiclassing, retraining/respec, downloading a leveled-up character back into the L1 wizard.

## Capabilities

### New Capabilities
- `character-leveling`: Driving a character from level 1 toward level 20 — the per-level flow, what it asks, what it persists, and how the resulting character is rendered.
- `class-progression`: The rules data that the leveling flow consumes — the L1–20 table for each class and each approach (features per level, ASI/feat slots, Mystic spell progression).

### Modified Capabilities
<!-- None: openspec/specs/ is empty. -->

## Impact

- **Types**: `lib/character/types.ts` — widen `Character.level`; add `Character.feats`, `Character.maxHp`, optional `Character.asiHistory` is **not** added (we agreed: current totals only). `ClassDef` gains a `levelTable: ClassLevelEntry[]`; `ApproachDef` gains `levelTable: ApproachLevelEntry[]`.
- **Data**: `data/classes.ts` grows substantially — five classes × ≤5 approaches × 20 levels of features. Mystic also gains a spell-slot/known table. New file likely: `data/level-tables/<class>.ts` to keep `data/classes.ts` readable.
- **Compute**: `lib/character/compute.ts` — extend HP, spellcasting, feature aggregation, and skill/save totals to consider feats and per-level effects. No new caching layer needed.
- **Storage**: `lib/storage/local.ts` — schema migration. Existing saved characters need `level: 1` → number, and may be missing new required fields. Add a forward-only migration in `importJson` and on `load`.
- **UI**: New `components/level-up/` directory with the level-up wizard (mirrors the builder's step pattern but is a single-pass dialog). `app/characters/[id]/page.tsx` adds the entry point. The home list and sheet header already display level.
- **Validation**: New `validateLevelUp` per-step helper analogous to `validateStep`.
- **Out of scope**: feats catalog beyond what's already in `data/feats.ts` — additional feats are added incrementally; the flow accepts whatever the catalog exposes.
