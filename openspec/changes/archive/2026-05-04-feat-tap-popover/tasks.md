## 1. Schema

- [x] 1.1 In `lib/character/types.ts`, add `FeatureUsageMax = number | "profBonus" | "level"`, `FeatureUsage = { count: FeatureUsageMax; per: "short-rest" | "long-rest" }`, `FeatureEffect = { kind: "tempHp"; dice: DiceExpression; addAbilityMod?: Ability } | { kind: "passive"; note?: string }`.
- [x] 1.2 Extend the inline feature shape used by `ClassLevelEntry.features` and `ApproachLevelEntry.features` with optional `id?: string`, `usage?: FeatureUsage`, `effect?: FeatureEffect`. Same shape for `ClassDef.level1Features` and `ApproachDef.level1Features`.
- [x] 1.3 Add required `featureUses: Record<string, number>` to `Character`.
- [x] 1.4 In `lib/character/defaults.ts`, default `featureUses: {}` in `emptyCharacter(id)`.
- [x] 1.5 In `lib/storage/local.ts`, update `migrateCharacter` to backfill `featureUses: {}` when missing or non-object. Idempotent.

## 2. Compute helpers

- [x] 2.1 Create `lib/character/features.ts` (new module).
- [x] 2.2 Export `resolveFeatureUsageMax(c, usage): number`. Resolves `"profBonus"` via `computeProficiencyBonus(c)` and `"level"` via `c.level`.
- [x] 2.3 Export `resolveFeatureEffect(c, feature)` that returns a popover-ready resolved effect (e.g., `{ kind: "tempHp", diceFormula: "2d4+3" }` for a CON +3 character with `addAbilityMod: "con"`).
- [x] 2.4 Export `featureSourceLabel(c, feature, source: { kind: "origin" | "subchoice" | "background" | "class-l1" | "class" | "approach-l1" | "approach" | "boon" | "burden" | "feat"; level?: number })`. Used by both the FeatCard popover wiring and the Features-section wiring to label where each entry came from.
- [x] 2.5 Export `findTrackedFeatures(c): Array<{ id: string; usage: FeatureUsage; feature: ... }>` — walks `computeFeatures(c)` (plus L1 features) and returns every feature with both `id` and `usage` set. Used by the rest primitives to know which counters to restore.

## 3. Live state — useFeature, restoreFeature, rest extensions

- [x] 3.1 In `lib/character/live-state.ts`, export `useFeature(c, featureId): Character`. Lazy-init from max if `featureUses[featureId]` is undefined; decrement; floor at 0.
- [x] 3.2 Export `restoreFeature(c, featureId): Character` — sets the counter to `resolveFeatureUsageMax` for that feature.
- [x] 3.3 Extend `shortRest(c)` to restore every tracked feature whose `usage.per === "short-rest"`.
- [x] 3.4 Extend `longRest(c)` to restore every tracked feature whose `usage.per === "short-rest"` OR `"long-rest"` (long rest = short rest + more).
- [x] 3.5 `extendedRest(c)` already calls `longRest` — verify it inherits the new behavior.

## 4. FeatTapPopover component

- [x] 4.1 Create `components/sheet/feat-tap-popover.tsx`. Props: `{ open, onOpenChange, entry, source, character, onUse?(featureId): void }`. `entry` carries name, description, optional badges, optional usage, optional effect, optional id. `source` is the result of `featureSourceLabel`.
- [x] 4.2 Render header: name + source label + optional badge list (parchment palette to match the sheet).
- [x] 4.3 Render usage band: when `entry.usage` is present and `entry.id` is set, show "<remaining> of <max> left" and a "Use" button. Disabled when `remaining === 0`.
- [x] 4.4 Render effect band: when `entry.effect` is structured, show the resolved formula (e.g., "2d4+3 temp HP" for tempHp; nothing for passive).
- [x] 4.5 Render description always at the bottom.

## 5. FeatCard onTap + Features tap targets

- [x] 5.1 In `components/sheet/feat-card.tsx`, extend `FeatCardProps` with optional `onTap?: () => void`. When defined, the card becomes a `<button>` with hover/focus rings (mirrors `SpellCard.onCast`).
- [x] 5.2 In `components/sheet/feat-list.tsx`, drill an optional `onTap?: (entry) => void` through `FeatGroup` so each card can fire it.
- [x] 5.3 In `components/sheet/character-sheet.tsx`, the `<Feature>` paragraph component (origin / background / class / approach / per-level features section) becomes a tappable `<button>` when an `onTap` handler is provided.

## 6. Sheet wiring

- [x] 6.1 In `character-sheet.tsx`, manage local state `{ openEntry: TappedEntry | null }`.
- [x] 6.2 Wire `onTap` into Boons, Burdens, and Feats FeatGroup invocations: each card click sets `openEntry` to a normalized entry shape.
- [x] 6.3 Wire `onTap` into the Features section paragraphs: walk `computeFeatures(c)` (plus class/approach L1 features) and render each as a tappable button.
- [x] 6.4 Render `<FeatTapPopover>` once at the bottom, controlled by `openEntry`. The `onUse` handler calls `handleChange(useFeature(c, featureId))` and re-renders the popover with the decremented count (the entry passed in re-resolves remaining from the latest `c.featureUses`).
- [x] 6.5 Confirm the printable sheet (`components/sheet/printable-sheet.tsx`) does NOT pass `onTap`, so its cards/features stay non-interactive.
- [x] 6.6 Confirm the wizard's preview surfaces (boons-burdens-step picker, level-up dialog) are unaffected.

## 7. Data fill — Warrior + Berserker

- [x] 7.1 In `data/level-tables/warrior.ts`, encode Battle Wind (Warrior L1 — found in `ClassDef.level1Features` for the Warrior, NOT the per-level table — verify the path) with `id: "warrior:battle-wind"`, `usage: { count: "profBonus", per: "long-rest" }`, `effect: { kind: "tempHp", dice: { count: 2, faces: 4 }, addAbilityMod: "con" }`.
- [x] 7.2 Encode Action Surge L2 with `id: "warrior:action-surge"`, `usage: { count: 1, per: "short-rest" }`.
- [x] 7.3 Encode the L17 Action Surge upgrade with the same `id: "warrior:action-surge"` and `usage: { count: 2, per: "short-rest" }` so the higher-level entry overrides the lower at character L17.
- [x] 7.4 Encode Indomitable L7 with `id: "warrior:indomitable"`, `usage: { count: 1, per: "long-rest" }`.
- [x] 7.5 Encode Berserker Rage L1 with `id: "berserker:rage"`, `usage: { count: "profBonus", per: "long-rest" }` (Rage is on the Berserker approach's L1 features).

## 8. E2E coverage

- [x] 8.1 Add `e2e/feat-tap.spec.ts`.
- [x] 8.2 Test: tapping a boon (Archivist) opens the popover with name, source label "Boon", "+1 INT" badge, and the description.
- [x] 8.3 Test: tapping Battle Wind on a Warrior at L1 opens the popover with usage counter "2 of 2 left" (profBonus at L1 = 2), the resolved effect "2d4+<conMod> temp HP", and an enabled Use button. Click Use, verify counter shows "1 of 2 left" and `featureUses["warrior:battle-wind"] === 1` in storage.
- [x] 8.4 Test: long rest restores Battle Wind back to full. Use it twice (counter 0, button disabled), click Long Rest in the Rest panel, re-open the popover, verify "2 of 2 left" again.
- [x] 8.5 Test: short rest restores Action Surge but NOT Indomitable. Seed a L7 Warrior with both at 0, take a short rest, verify Action Surge restored to 1 and Indomitable still 0.
- [x] 8.6 Test: migration backfill — seed a pre-1.10-shape raw save without `featureUses`, load via `readMigratedCharacter`, assert `featureUses` is `{}`.
- [x] 8.7 Test: printable sheet has no tappable feat/feature buttons.
- [x] 8.8 Test: features without `id`/`usage` (e.g., origin's Cannot Read Elvish) still open the popover and render description-only with no Use button.

## 9. Verification

- [x] 9.1 `npm run build` — clean (TypeScript strict passes; new optional fields don't break existing entries).
- [x] 9.2 `npm run test:e2e` — all passing.
- [x] 9.3 Manual smoke: open a Warrior in companion mode, tap Battle Wind, click Use, watch the counter drop. Take a long rest, watch it restore. Tap an origin feature with no encoded data, confirm the popover opens with just description.
- [x] 9.4 `npx openspec validate "feat-tap-popover" --strict` — clean.
