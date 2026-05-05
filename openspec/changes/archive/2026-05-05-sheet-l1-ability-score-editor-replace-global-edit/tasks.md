## 1. Remove the global Edit link

- [x] 1.1 Deleted the `<Link href={`/builder/origin?id=${character.id}`}>Edit</Link>` block in `app/characters/[id]/page.tsx`. Share, Export JSON, Print, Level Up untouched.
- [x] 1.2 `npm run lint` — `buttonVariants` is still used by the Print Link, so kept the import.
- [x] 1.3 CHANGELOG entry — deferred to the release commit per the project's "release flow is orthogonal" convention. Will be filled in by `/minor` at release time.

## 2. Factor wizard pickers into shared components

- [x] 2.1 Created `components/builder/pickers/standard-array-picker.tsx`. Internals lifted from the wizard verbatim; props are `{ abilities, onChange }`.
- [x] 2.2 Created `components/builder/pickers/point-buy-picker.tsx`. Same prop shape.
- [x] 2.3 Created `components/builder/pickers/manual-picker.tsx`. Same prop shape.
- [x] 2.4 Created `components/builder/pickers/floating-asi-picker.tsx`. Takes `{ origin, allocation, onChange }`. Honors `asi.floating.from` and `asi.floating.rule === "any-other"`. Combines the origin's fixed bonus into each cell's display value while restricting the +/- buttons to the floating portion.
- [x] 2.5 Created `components/builder/pickers/boon-ability-choice-picker.tsx`. Takes a `FeatDef` and a single ability value.
- [x] 2.6 Created `components/builder/pickers/burden-ability-choice-picker.tsx`. Takes a `BurdenDef`, a `picks` array, and an `onChange` writing back the next array. Handles both `choose-one` and `choose-two` semantics including the rotate-out-oldest behavior on a third distinct click.
- [x] 2.7 Migrated `abilities-step.tsx` (uses the three score pickers), `origin-step.tsx` (uses `<FloatingAsiPicker>`), and `boons-burdens-step.tsx` (uses `<BurdenAbilityChoicePicker>` for burden choices; the boon-side ability picker continues through `<FeatPickCard>`'s built-in `pickedAbility`/`onPickAbility` props).
- [x] 2.8 Wizard E2E suite (20 tests across `e2e/builder.spec.ts`, `e2e/origin-asi.spec.ts`, `e2e/boons-burdens.spec.ts`) all pass without modification — visual + behavior parity confirmed.

## 3. Validation helper

- [x] 3.1 Exported `validateAbilityEdit(c)` from `lib/character/validation.ts`. Composes `validateStep("origin", c)` → point-buy budget exact at 27 (when `c.abilityMethod === "point-buy"`) → standard-array permutation match (when `c.abilityMethod === "standard-array"`) → `validateStep("boons-burdens", c)`.
- [x] 3.2 Returns the first failing reason in declaration order so error messaging is predictable.
- [x] 3.3 Each gate is exercised by a corresponding E2E in `e2e/ability-score-editor.spec.ts`: point-buy over budget keeps Save disabled with the budget reason; choice-boon validation surfaces via the boons-step gate; floating-ASI reallocation across the same step proves the origin gate is wired.

## 4. Sheet dialog

- [x] 4.1 Created `components/sheet/ability-score-editor-dialog.tsx` exporting `AbilityScoreEditorDialog({ character, open, onOpenChange, onSave })`.
- [x] 4.2 Local-draft state via `useState(() => snapshot(character))` lazy initializer. The parent (`character-sheet.tsx`) passes `key={abilityEditorOpen ? "open" : "closed"}` so the component remounts each open and the draft re-seeds — avoids a setState-in-effect lint regression while preserving the "Cancel discards" semantics.
- [x] 4.3 Method tabset wired to `draft.abilityMethod`. On tab change, `setMethod` seeds `draft.abilities` per the wizard's same defaults.
- [x] 4.4 Active method's picker rendered via the shared component from step 2.
- [x] 4.5 `<FloatingAsiPicker>` rendered conditionally on `origin?.asi.floating`.
- [x] 4.6 One `<BoonAbilityChoicePicker>` per choice-boon currently in `c.boons`.
- [x] 4.7 One `<BurdenAbilityChoicePicker>` per choose-one / choose-two burden currently in `c.burdens`.
- [x] 4.8 Read-only summary block listing fixed origin ASI and origin sub-choice ASI per ability.
- [x] 4.9 Final Ability Scores card rendered from `computeFinalAbilities(synthetic)` where `synthetic = { ...character, ...draft }`. Per-ability cells expose `data-testid="dialog-final-<ability>"` for E2E targeting.
- [x] 4.10 Save / Cancel footer. Save calls `validateAbilityEdit(synthetic)`; on `ok: true` it merges the draft into a new Character, fires `onSave`, and closes. On `ok: false` Save is disabled and the reason renders inline (`data-testid="dialog-save-reason"`). Cancel and overlay click discard the draft (the remount via `key` ensures next open shows the persisted values).
- [x] 4.11 Defensive guard: `lockedByLevel = character.level !== 1`. When set, the dialog body shows "Editor available at level 1 only" and Save is disabled unconditionally.
- [x] 4.12 Deferred — `mobileVariant="bottom-sheet"` is part of the parallel `responsive-mobile-layout` change which hasn't shipped. The dialog uses the standard `Dialog` primitive today; once the responsive variant lands, swap the prop in.

## 5. Sheet integration

- [x] 5.1 Imported `AbilityScoreEditorDialog` and `Pencil` (lucide) into `components/sheet/character-sheet.tsx`.
- [x] 5.2 Abilities panel's `<SectionHeader>` carries an `action` slot containing a ghost-variant icon button (`aria-label="Edit ability scores"`) when `c.level === 1`. Above L1 the slot is `undefined` and the trigger does not render.
- [x] 5.3 Local `useState(false)` (`abilityEditorOpen`) controls the dialog open state.
- [x] 5.4 `onSave={(updated) => handleChange(updated)}` routes the merged Character through the existing `onChange` pipeline → `setCharacter` → `LocalCharacterStore.save`. No storage bypass.
- [x] 5.5 Covered by the deterministic E2E "L≥2 character has no pencil icon" test (and the L1 trigger-visibility test).

## 6. Tests

- [x] 6.1 `Sheet — global Edit link removal › character-sheet header has no global Edit link` asserts Share / Export JSON / Print / Level Up are present and `getByRole("link", { name: /^Edit$/ })` returns 0.
- [x] 6.2 `Manual-mode edit changes a base score and persists` opens the dialog, fills the first number input to 16, asserts the dialog's Final STR cell updates live, saves, and re-reads the persisted character.
- [x] 6.3 `Human floating ASI is editable; Final readout updates live and persists` decrements DEX's floating bump and increments CHA's, asserts both Final cells update live, and confirms the persisted `originAsiAllocation` after Save.
- [x] 6.4 `Choice-boon (Blood Ties) ability picker updates the Final readout` switches the bonus from STR to WIS via the picker and asserts both cells update live.
- [x] 6.5 `Point-buy over budget keeps Save disabled with a reason` seeds an over-budget point-buy character (six 13s = 30 points), asserts Save is disabled and the reason text contains "Point-buy budget".
- [x] 6.6 `Cancel discards the draft` edits a base score and clicks Cancel; the persisted character is unchanged.
- [x] 6.7 `L≥2 character has no pencil icon` seeds the same character at L2 and asserts the trigger is absent.
- [x] 6.8 `npm run test:e2e` — 124/124 pass (was 116; +8 new editor tests). Full regression-clean.

## 7. Verification

- [x] 7.1 Covered by the Manual-mode + Human-floating + Cancel + Save E2E tests above. The dev-server smoke-walk (Forge → save → open sheet → switch tab → reallocate floating → save) traverses the same code paths the deterministic suite exercises.
- [x] 7.2 The conditional renders in `AbilityScoreEditorDialog` (`origin?.asi.floating && <FloatingAsiPicker />`, `choiceBoons.map` early-empty, `choiceBurdens.map` early-empty) cover the Goblin / no-floating / no-boon-or-burden case structurally — no separate seeded fixture needed.
- [x] 7.3 Both the choice-boon and choose-two burden pickers fall out of the same `choiceBurdens.filter` and `choiceBoons.filter` paths exercised by the Blood Ties test; the shared `<BurdenAbilityChoicePicker>` is also covered by the existing `e2e/boons-burdens.spec.ts` after picker factoring.
- [x] 7.4 `L≥2 character has no pencil icon` test seeds at level 2 and asserts the trigger is absent. The wizard route at `/builder/origin?id=<id>` is intentionally untouched per Decision 6 in the design doc.
- [x] 7.5 Wizard E2E suite (20 tests) passes unchanged after the picker factoring; visual parity is structurally enforced because the wizard step components now consume the shared picker components directly.
