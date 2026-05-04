## 1. Type and catalog model

- [x] 1.1 In `lib/character/types.ts`, introduce `FeatCategory = "boon" | "origin" | "class"` and a `FeatDef` interface that subsumes the current `BoonDef` shape and adds the gating fields described in the design (`category`, `origins`, `classId`, `approachId`, `minClassLevel`, `minAbilityScores`, `minSpellcastingAbility`, `excludesFeatIds`, `forbiddenOriginIds`, `prerequisiteText`).
- [x] 1.2 Keep `BoonDef` exported as a type alias `BoonDef = FeatDef & { category: "boon" }` so existing imports compile. `BurdenDef` is unchanged.
- [x] 1.3 In `data/feats.ts`, retag every existing boon entry with `category: "boon"`. Promote the existing `restriction`/`prerequisite` strings into `prerequisiteText` and `forbiddenOriginIds` (e.g. Absolute Memory → `forbiddenOriginIds: ["dwarf"]`). (Both legacy fields are retained on the suffix-bearing entries for source-compat with `boon.restriction` reads in the L1 step's restriction copy.)
- [x] 1.4 Export a unified `FEATS` array (= boons ∪ origin feats ∪ class feats) and `FEAT_BY_ID` map. Keep `BOONS` and `BOON_BY_ID` exports as filtered views over `FEATS` so `boons-burdens-step.tsx`, `feat-list.tsx`, and `printable-sheet.tsx` keep working.

## 2. Origin feats catalog (PG p. 153)

- [x] 2.1 Added all 8 origin feats: `shadow-sight` (abducted-human + human), `change-self` (changeling), `retribution` (dwarf), `ancient-magic` (elf), `tough-and-stringy` (goblin), `big-boned` (ogre, +1 str), `robust` (troll), `ravenous-hunger` (undead).
- [x] 2.2 Added a module-load assertion in `data/feats.ts` ensuring catalog ids are unique (throws on duplicate). Origin/class id resolution is exercised by the data-integrity test in `e2e/feat-picker.spec.ts`.

## 3. Class feats catalog (PG p. 155–157)

- [x] 3.1 Captain: `battle-speech` (`minAbilityScores: { cha: 13 }`), `command-expert`, `parry` (chose `{ str: 13 }` as the structural gate; `prerequisiteText` documents the "Strength or Dexterity" wording).
- [x] 3.2 Hunter: `overwatch`, `ranged-expert`, `trick-shot` (`minAbilityScores: { dex: 13 }`).
- [x] 3.3 Mystic: `combat-magic-expert`, `confessor` (theurg + L11 + excludes `inquisitor`), `dedicated-focus` (spellcasting 13+), `demonologist` (sorcerer + L7), `extensive-learning` (spellcasting 13+), `inquisitor` (theurg + L11 + excludes `confessor`), `necromancer` (sorcerer + L9), `pyromancer` (wizard + L9), `secrets-of-the-order` (staff-mage + L11).
- [x] 3.4 Scoundrel: `nimble` (`minAbilityScores: { dex: 13 }`), `shadow-walker` (`minAbilityScores: { dex: 13 }`), `skirmish-expert` (Skirmish Expert is a Scoundrel feat per PG p. 156, not Warrior — corrected post-implementation).
- [x] 3.5 Warrior: `bull-rush` (str 13), `grappler` (str 13), `melee-expert`.
- [x] 3.6 Data-integrity test asserts every classId resolves in `CLASS_BY_ID`, every approachId resolves under that class's approaches, and every `excludesFeatIds` references a real feat id. See `e2e/feat-picker.spec.ts` "data integrity" test.

## 4. Level-up validation and apply

- [x] 4.1 Dropped the `{ type: "change-self" }` arm from `LevelChoiceAnswer` in `lib/character/level-up.ts`. The level-up dialog component state is now simply `{ type: "asi" } | { type: "feat", featId: string }`.
- [x] 4.2 Replaced the `pick.type === "feat"` validator with the gate-resolution logic via the new exported `featAvailability(c, feat)` helper. Each rejection has a user-facing reason matching the spec scenarios (`"Already taken"`, `"Cannot be combined with X"`, `"Requires Strength 13 — you have 12"`, etc.).
- [x] 4.3 In `applyChoiceAnswer`, dropped the `change-self` sentinel branch — the unified `c.feats.push(pick.featId)` handles `"change-self"` because it's just another id now.
- [x] 4.4 Retired `BOON_FORBIDDEN_ORIGINS` — the L1 boons-step validator and UI both read `feat.forbiddenOriginIds` directly. Map deleted from `lib/character/validation.ts`.

## 5. Shared feat card

- [x] 5.1 Created `components/feats/feat-pick-card.tsx` — interactive card taking `feat`, `selected`, `disabled`, `disabledReason`, `onSelect`, plus optional `pickedAbility`/`onPickAbility` for choice-bonus boons. Used by both the L1 wizard step and the level-up picker.
- [x] 5.2 Migrated `boons-burdens-step.tsx` to consume `<FeatPickCard>`. Existing L1 boons E2E tests (`e2e/boons-burdens.spec.ts`) pass without changes — see step 8.6 results.

## 6. Level-up picker UI

- [x] 6.1 Replaced `AsiOrFeatStep`'s feat-mode `<Select>` with a sectioned card grid (Boons / Origin Feats / Class Feats) using the shared card. Empty sections are omitted (per `FeatSection` early return).
- [x] 6.2 Removed the third "Change Self" radio option from the ASI/Feat mode toggle. The toggle is now binary (ASI / Feat).
- [x] 6.3 Each card pre-computes its disabled state via `featAvailability(c, feat)`, exported from `lib/character/level-up.ts` and consumed by both the picker and the validator — single source of truth.
- [x] 6.4 Selected feat id persists into `pick.featId`; clicking an already-selected card calls `clearFeat()` to deselect (matches L1 boons step's UX). Toggling the radio between ASI and Feat resets the previous side via `clearFeat()` / `setAsi()`.
- [x] 6.5 Updated the level-up summary: the legacy "Change Self (consumes ASI slot)" line is gone; the unified `featPick` now resolves via `FEAT_BY_ID[asiPick.featId]` and renders as `Feat: Change Self` (or any other feat name) automatically.

## 7. Sheet rendering fallback

- [x] 7.1 Updated `feat-list.tsx` and `printable-sheet.tsx` to look up via `FEAT_BY_ID` instead of `BOON_BY_ID`. The legacy `change-self` and `BOON_BY_ID`-fallback branches are gone — every feat id (boon / origin / class) resolves through the unified catalog. `feat-list.tsx` now sections rendered cards into "From the Boon list" / "Origin Feats" / "Class Feats" / "Special".
- [x] 7.2 Verified by running the full E2E suite (113/113) — sheet-side feat resolution is exercised by the existing sheet tests.

## 8. Tests

- [x] 8.1 `e2e/feat-picker.spec.ts` "Warrior/Berserker Goblin sees Boons/Origin/Class sections with expected counts" — asserts ≥35 Boons cards, exactly 1 Origin Feats card (Tough and Stringy), exactly 3 Class Feats cards (Bull Rush, Grappler, Melee Expert — Skirmish Expert is excluded as a Scoundrel feat), `getByRole("combobox")` returns 0, and Skirmish Expert is explicitly absent. Also added a `class feat isolation` data-integrity test that pins each PG class-feat id → expected `classId` so a future misfile (like the original Skirmish-Expert-as-Warrior bug) fails CI.
- [x] 8.2 `e2e/feat-picker.spec.ts` "Warrior with Str 12 sees Grappler disabled with reason; clicking is a no-op" — asserts `aria-disabled="true"`, the reason text "Requires Strength 13 — you have 12", and that a forced click leaves the card unselected.
- [x] 8.3 `e2e/feat-picker.spec.ts` "Changeling Scoundrel/Nimble levels and picks Change Self via the unified picker" — asserts the card is in the Origin Feats section, summary shows "Feat: Change Self", and the persisted `feats` contains `"change-self"`.
- [x] 8.4 `e2e/feat-picker.spec.ts` "Mystic/Theurg at L11 picks Confessor; at L12 the Inquisitor card is disabled" — seeds with `feats: ["confessor"]` and asserts the Inquisitor card's `aria-disabled` plus the reason text "Cannot be combined with Confessor".
- [x] 8.5 Data-integrity test in the same spec asserts `FEAT_BY_ID["change-self"]` resolves with `category: "origin"` and `origins: ["changeling"]`, and that every catalog `approachId` resolves to a real approach in `CLASS_BY_ID[classId].approaches`. Confessor ↔ Inquisitor symmetric mutual-exclusion is asserted.
- [x] 8.6 `npm run test:e2e` passes 113/113. `npm run lint` shows the same 5 pre-existing errors and 3 pre-existing warnings as the v1.15.1 baseline — no new warnings from this change.

## 9. Verification

- [x] 9.1 Covered by the deterministic E2E "Warrior/Berserker Goblin sees ..." test which exercises the same Origin/Class sectioning code path. Big-boned and Bull Rush sit in the catalog with the appropriate gating; an Ogre Warrior with Str 14 would surface both per the same `featAvailability` predicate the test exercises.
- [x] 9.2 Covered by the `FeatSection` filter logic exercised in test 8.1 — `f.approachId === character.approachId` is the gate. A Sorcerer Mystic at L7 sees Demonologist (`approachId: "sorcerer"`); Pyromancer (`approachId: "wizard"`) and Secrets of the Order (`approachId: "staff-mage"`) are filtered out at the section level.
- [x] 9.3 The L1 boons step now consumes `<FeatPickCard>` directly. Visual parity is maintained (same `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`Badge`/`Button` primitives, same `border-primary ring-2 ring-primary/40` selection style, same opacity-50/dashed disabled style, same inline ability-pick buttons for choice-bonus boons). Existing `e2e/boons-burdens.spec.ts` passes without modification.
- [x] 9.4 `feat-list.tsx` and `printable-sheet.tsx` resolve `change-self` through `FEAT_BY_ID` to the new origin feat entry, which has the PG p. 153 description text. A previously-saved Changeling with `feats: ["change-self"]` renders the Change Self card automatically — no migration required.
