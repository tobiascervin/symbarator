## Why

The spell popover (v1.8) made spells interactive — tap a card, see your live computed numbers and damage, click "Cast at L<n>" to spend a slot. Feats and class features are still static text on the sheet. A Warrior at L9 has Action Surge (1/rest), Indomitable (1/long rest), Brutal Critical (1d), and (if Berserker) Rage (proficiency-bonus uses per long rest) — all of which the player tracks on a piece of paper because the sheet doesn't know they exist as resources. Boons and burdens don't have active uses but DO have computed bonuses that scale with level (e.g., the proficiency bonus implicitly scales with character level). Same as spells: the data needed to surface this is already on the character; the UI just needs to ask for it on tap.

This change extends the tap-to-popover pattern from spells to **class/approach features** (the highest-value surface — that's where the active-use mechanics live) and to **boons / burdens / level-up feats** (where the popover is consistency-driven; mostly a focused single-thing view of the existing card content).

## What Changes

- New **`<FeatTapPopover>`** component (built on the same `Dialog` primitive as `<SpellCastPopover>`). Tapping any feat / boon / burden / class feature on the sheet in companion mode opens the popover with:
  - Header: the entry's name and source label ("Class L4 feat" / "Berserker L1" / "Boon (Archivist)" / "Burden (Bestial)" / "Origin: Abducted Human").
  - Computed band: any structured `+X ABL` badges already on the card (boon / burden bonuses), plus character-derived numbers when the entry has structured `effect` data (e.g., a temp-HP formula resolves to "1d4 + CON 3 = 1d4+3 temp HP" using the character's actual mod).
  - Usage band: when a class/approach feature has structured `usage` data (e.g., "proficiency bonus per long rest"), render a usage counter and a "Use" button. Clicking decrements the counter via a new `useFeature(c, featureId)` primitive in `lib/character/live-state.ts`. Long rest restores; short rest restores when `usage.per === "short-rest"`.
  - Description always renders at the bottom.
- Extend **`ClassLevelEntry.features`** and **`ApproachLevelEntry.features`** with optional `id?: string` (stable for usage tracking) and optional `usage?: FeatureUsage` and `effect?: FeatureEffect` fields. Existing `{ name, description }` entries keep working as today; adding `id`/`usage`/`effect` is purely additive.
- New `FeatureUsage` type:
  ```ts
  type FeatureUsageMax = number | "profBonus" | "level";
  interface FeatureUsage { count: FeatureUsageMax; per: "short-rest" | "long-rest" }
  ```
  `count: "profBonus"` resolves to `computeProficiencyBonus(c)` at display time; `count: "level"` resolves to `c.level`. Extensible if other counts (e.g., `"halfLevel"`) come up.
- New `FeatureEffect` type — narrow for v1 to the shapes that actually appear in the encoded class features:
  ```ts
  type FeatureEffect =
    | { kind: "tempHp"; dice: DiceExpression; addAbilityMod?: Ability }
    | { kind: "passive"; note?: string };
  ```
  Reuses the existing `DiceExpression` from spell types. `"passive"` is the explicit "we know this feature has no active roll" marker — distinct from a missing `effect` (which means "we haven't encoded one").
- New **`Character.featureUses: Record<string, number>`** — keyed by feature id, holds the *remaining* uses for tracked features. `{}` for new characters; backfilled by `migrateCharacter`. Rest transitions in `live-state.ts` restore counters to `resolveUsageMax(c, feature)` based on `per`.
- Extend `lib/character/live-state.ts`:
  - `useFeature(c, featureId): Character` — decrements `featureUses[featureId]` (floors at 0).
  - `restoreFeature(c, featureId): Character` — restores to max (used by long/short rest).
  - `shortRest(c)` / `longRest(c)` / `extendedRest(c)` extend to restore feature uses appropriately.
- **First-pass content fill**: encode `id` / `usage` / `effect` for the obvious Warrior class features (Battle Wind L1, Action Surge L2 + L17 upgrade, Indomitable L7) and the Berserker approach's Rage (L1, profBonus uses per long rest). Other classes/approaches stay description-only and degrade gracefully — the popover just shows "passive feature — see description". A follow-up change can fill the rest.
- The sheet's **Features section** (origin / background / class L1 / approach L1 / per-level features) becomes tappable. The Boons / Burdens / Feats sections also become tappable. Printable mode and wizard preview surfaces are unchanged.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `companion-mode`: extend the tap-to-popover pattern from spells to feats / boons / burdens / class features; add `useFeature` / `restoreFeature` primitives; long/short rest restores feature usage counters.
- `class-progression`: extend `ClassLevelEntry.features` and `ApproachLevelEntry.features` with optional `id` / `usage` / `effect` fields. Encode them for Warrior + Berserker as the first-pass example.

## Impact

- **Schema**: `Character` gains required `featureUses: Record<string, number>` (default `{}`). `ClassLevelEntry.features` and `ApproachLevelEntry.features` gain optional `id` / `usage` / `effect`. New `FeatureUsage` / `FeatureEffect` / `FeatureUsageMax` types in `lib/character/types.ts`. Reuses the existing `DiceExpression` from the spell-effect shapes.
- **Compute**: new `lib/character/features.ts` module with `resolveFeatureUsageMax(c, usage)`, `resolveFeatureEffect(c, feature)`, plus a `featureSourceLabel(c, feature)` helper that classifies where a feature came from for the popover header.
- **Live state**: `useFeature` / `restoreFeature` added to `lib/character/live-state.ts`; rest transitions extended.
- **UI**: new `components/sheet/feat-tap-popover.tsx`. `<FeatCard>` gains optional `onTap?: () => void` (mirrors `SpellCard.onCast?`). Feature paragraphs in the Features section are wrapped in a tappable button when companion-mode is active. Printable and wizard surfaces leave the prop undefined.
- **Migration**: `migrateCharacter` backfills `featureUses: {}` when missing. Idempotent.
- **Data fill**: `data/level-tables/warrior.ts` — add `id` and `usage` (and `effect` where applicable) for Battle Wind, Action Surge, Indomitable, Berserker Rage. Other classes/approaches untouched in this change.
- **Tests**: E2E covers: tap a boon → popover with badge + description, tap Battle Wind → popover with usage counter, click Use → counter decrements, long rest → counter restores. Plus the printable / wizard non-interactivity check, and a migration-backfill test for `featureUses`.
- **Out of scope**: encoding `usage` / `effect` for every class/approach across the catalog (that's the next content change); per-spell-school feature trackers; concentration tracking; auto-applying advantage/disadvantage to subsequent rolls (we display, the player rolls); rendering the popover in builder/wizard mode.
