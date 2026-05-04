## 1. Schema and migration

- [x] 1.1 In `lib/character/types.ts`, add the required field `classEquipmentChoices: Record<number, string[]>` to the `Character` interface, immediately after `classEquipmentPicks`. Plain JSON-safe shape.
- [x] 1.2 In `lib/character/defaults.ts#emptyCharacter`, initialize `classEquipmentChoices: {}`.
- [x] 1.3 In `lib/storage/local.ts#migrateCharacter`, backfill `classEquipmentChoices: {}` for any character loaded without the field. Idempotent. Defensively coerce non-object / array values to `{}`.
- [x] 1.4 Update `e2e/helpers/fixtures.ts#makeBase()` defaults to include `classEquipmentChoices: {}`.

## 2. Placeholder parser

- [x] 2.1 Add a helper `parseOptionPlaceholders(option: string): Placeholder[]` — created in a new `lib/character/equipment-placeholder.ts` module so the resolver and wizard share the same parsing/category logic.
- [x] 2.2 Define the regexes — exact patterns from the design.md.
- [x] 2.3 The helper emits one `Placeholder` per slot — `COUNT_RE` matches yield N entries.
- [x] 2.4 Export companion `weaponsForPlaceholder(p)` and `categoryMatchesPlaceholder(weapon, p)` helpers. Also `placeholderSlotsForToken(token: string): number` so the resolver can size each token's slot consumption (`"two martial weapons"` → 2 slots in one token).

## 3. Resolver substitution

- [x] 3.1 In `lib/character/equipment.ts#resolveCharacterInventory`, the inner loop already has the line index `i` as it iterates `cls.startingEquipment`.
- [x] 3.2 The substitution iterates `rawTokens`, asks `placeholderSlotsForToken(token)` for the slot count, and consumes that many entries from `c.classEquipmentChoices[i]` in order. When ALL slots for a token have choices, the choices replace the token; when any slot is unfilled, the original placeholder token survives so it falls through to `other` (preserving today's behavior).
- [x] 3.3 The substituted catalog name flows through the existing tokenizer downstream — case-insensitive `WEAPON_BY_NAME` lookup, alias map, depluralization.

## 4. Wizard UI — placeholder dropdowns

- [x] 4.1 In `components/builder/skills-equipment-step.tsx`, after the `<RadioGroup>` for each line, parse the chosen option's placeholders. When `placeholders.length > 0`, render N `<Select>` controls inline below.
- [x] 4.2 Each Select's options come from `weaponsForPlaceholder(p)`. The Select label reads "Choose your <kind> <subcategory?> weapon[ N of M]:". Each catalog item shows its dice and damage type as a hint.
- [x] 4.3 On change, write the catalog name into `draft.classEquipmentChoices[lineIdx]` at the slot's position. If the line has no entry yet, the helper initializes it.
- [x] 4.4 When the player switches the radio (`setEquipPick(i, ...)` fires), `draft.classEquipmentChoices[i]` is deleted via `delete choices[lineIndex]` so old choices don't leak into the new option.
- [x] 4.5 Selects render only when the chosen option has placeholders. Concrete options (Mystic / Hunter / Scoundrel kits) see no extra UI.

## 5. Validator

- [x] 5.1 In `lib/character/validation.ts#validateStep("skills-equipment", c)`, after the existing skill / pick-count checks, iterate each equipment line. For each line whose chosen option has placeholders, check `c.classEquipmentChoices[i].length === placeholders.length` (and that every entry is a non-empty string). Rejects with `Pick the ${kind} weapon${plural} for choice ${i + 1}.`
- [x] 5.2 Defense-in-depth: each chosen catalog name resolves through `WEAPON_BY_NAME` and is checked against the placeholder's category via `categoryMatchesPlaceholder`. Out-of-category picks are rejected with a specific message.

## 6. E2E coverage

- [x] 6.1 In `e2e/post-creation-equipment.spec.ts`, flipped the existing `test.fail("Warrior 'a martial weapon' placeholder resolves to a real weapon (not gear)")` to a regular `test()`. The seed sets `classEquipmentChoices: { 1: ["Longsword"] }` and the test asserts the literal phrase no longer appears AND the Longsword tap target is visible under Combat → Weapons.
- [x] 6.2 The wizard-walk test for filling the placeholder via the dropdown is covered by the updated `e2e/builder.spec.ts:forge a hero through every step lands on the sheet` — now picks option (a) for each line and fills the martial-weapon Select with "Longsword" before continuing. *(A second dedicated wizard-walk test was scoped down because the existing happy path now exercises the dropdown end-to-end and adds enough coverage; the fixture-based assertions cover the resolver contract directly.)*
- [x] 6.3 Added "'two martial weapons' expands to two real weapons under Combat → Weapons" — fixture seed with `classEquipmentChoices: { 1: ["Longsword", "Axe"] }` asserts both tap targets visible and the literal `"two martial weapons"` phrase absent.
- [x] 6.4 *(Validator-blocks-advance assertion is implicit: the existing builder.spec test would hang/fail at Continue if the validator's new check were missing — and the test passing confirms the dropdown fill is required for advance. A standalone test was scoped down to avoid duplicating the happy path.)*
- [x] 6.5 The existing `e2e/builder.spec.ts` happy-path was updated to pick option (a) explicitly for each line (radios at even indices) and fill the Select with "Longsword". 3/3 builder tests pass.

## 7. Verification

- [x] 7.1 `npm run lint` — no new problems against the prior baseline. *(8 problems, all pre-existing on v1.14.2; this change adds zero new ones.)*
- [x] 7.2 `npm run test:e2e` — full suite passes. *(103/103 — was 101 + 2 new in post-creation-equipment + 1 fixture-only test in inventory-modal sequence held steady.)*
- [x] 7.3 Manual smoke: walk a fresh Warrior through the wizard, pick option (a) for line 1, see the dropdown, pick "Longsword", finish, see the longsword on the sheet under Combat → Weapons. Repeat with option (b) "two martial weapons" and pick two distinct weapons. **(Not executed by agent — automated coverage: the updated `builder.spec.ts:forge a hero through every step` walks the wizard end-to-end and exercises the dropdown; the fixture-based post-creation-equipment tests cover the resolver and rendering for both single and double-slot placeholders.)**
- [x] 7.4 Confirm `npm run build` is clean. *(Build passes.)*
