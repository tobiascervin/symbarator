## Why

`Character.boons` and `Character.burdens` are wired into the schema and 30 boons + 4 burdens are encoded in `data/feats.ts`, but the L1 builder never asks for them. PG p. 147–155 makes a Boon a meaningful character-defining choice — most carry a +1 to an ability score and a flavor effect (Archivist, Beast Tongue, Sturdy, …) — and many tables let players take 1 boon at L1 by default. Today the only way to get a boon onto a saved character is to manually edit the JSON and reimport. The sheet doesn't show boons or burdens either, so even if the JSON is correct the player can't tell at a glance.

This change closes that loop: a builder step where the player picks a boon (and optionally a burden), the boon's ability bonus actually applies in `computeFinalAbilities`, and the sheet renders both alongside feats.

## What Changes

- **New wizard step** `boons-burdens` between `abilities` and `skills-equipment`. Each character may take 0 or 1 boon at L1 and 0 or 1 burden. (PG variant rules let players trade extra burdens for extra boons; out of scope for v1 — we ship the canonical 0–1/0–1 and add the trade later if anyone asks.)
- **Boon ability bonus is honored.** When a boon's `abilityBonus.ability` is a fixed `Ability`, the +1 flows through `computeFinalAbilities` as a new `boonBonuses` term alongside `originAsiAllocation`. When the boon's ability is `"choice"`, the player picks the target ability from the boon's `abilityBonusChoices` list during the wizard step; the choice is persisted on the character.
- **`Character.boonAbilityChoices: Record<string, Ability>`** added — a map keyed by boon id to the chosen ability. Empty `{}` for boons without a choice (or for characters with no boons). Storage migrator backfills it as `{}` for legacy saves.
- **Sheet integration.** The existing `<FeatList>` component (or a sibling) gains a "Boons" group and a "Burdens" group, each rendering name + description and (for choice-boons) the chosen ability.
- **Validation.** The new step's validator accepts 0–1 boon and 0–1 burden, requires choice-boons to have a chosen ability, and rejects boons whose `restriction` is incompatible with the character's origin (e.g. Absolute Memory restricted from Dwarves; we use the existing `restriction` text and a small lookup table for origin-tagged restrictions).

Out of scope for this change:
- The PG's "trade burdens for extra boons" variant rule (pure additive, can land later).
- Adding more boons or burdens beyond what's already in `data/feats.ts`.
- Mid-campaign editing of boons via the sheet (separate change — sheet-side editing is a broader thread).
- Re-asking the boon question on Changeling's Change Self feat (boons taken at level-up are a different track from L1 creation boons).

## Capabilities

### New Capabilities
- `character-creation`: The L1 builder's wizard flow as a first-class spec subject. Currently the wizard is implemented but not specced; this change introduces the capability and lays down the boons-and-burdens requirements as its first set of scenarios.

### Modified Capabilities
<!-- None — the leveling capability isn't changing; the L1 wizard wasn't previously specced under any capability. -->

## Impact

- **Types** (`lib/character/types.ts`): add `boonAbilityChoices: Record<string, Ability>` to `Character`.
- **Defaults** (`lib/character/defaults.ts`): `emptyCharacter` returns `boonAbilityChoices: {}`.
- **Storage** (`lib/storage/local.ts`): `migrateCharacter` backfills `boonAbilityChoices: {}` for pre-1.3.0 saves.
- **Compute** (`lib/character/compute.ts`): `computeFinalAbilities` adds a `boonBonuses` term resolved via `BOON_BY_ID` for each id in `c.boons`, using `boonAbilityChoices[id]` for choice-boons.
- **Validation** (`lib/character/validation.ts`): new step `"boons-burdens"` added to `STEPS`; `validateStep` validates count and choice rules.
- **Wizard UI**:
    - New `components/builder/boons-burdens-step.tsx` rendering the BOONS list (with restriction badges), an optional ability picker for choice-boons, and the BURDENS list.
    - `components/builder/wizard-shell.tsx` — `STEP_LABELS` gets `"Boons & Burdens"`.
    - `app/builder/[step]/page.tsx` — switch arm dispatches to the new step.
- **Sheet** (`components/sheet/character-sheet.tsx`): a new "Boons & Burdens" parchment section using `<FeatList>`-style cards (or extend `<FeatList>` to accept boon/burden ids and render them under labelled groups).
- **E2E**: a new `e2e/boons-burdens.spec.ts` test that walks the builder, picks a boon, confirms the ability bonus shows on the sheet, and asserts the boon is rendered. Existing builder happy-path test must still pass.
- **Risk**: low. Schema widening is additive with a default; migrator handles pre-existing saves; new wizard step is gated cleanly via `STEPS`. The only place a regression could land is the abilities computation — but that's compute-side and covered by computing on a character with a boon vs without.
- **Versioning**: minor bump (additive feature, no breaking schema changes since the new field is optional with a default).
