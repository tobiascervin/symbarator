## Why

Two of the five class starting-equipment kits — Captain (PG p. 116) and Warrior (PG p. 132) — include lines with **generic placeholders** instead of concrete catalog items:

- `"(a) a martial weapon and a shield OR (b) two martial weapons"`
- `"(a) a light crossbow and 20 bolts OR (b) two handaxes"` *(concrete; not a placeholder)*

The PG explicitly leaves "a martial weapon" / "two martial weapons" as a *player choice* — the player picks which specific martial weapon(s) they want from the martial list. Today's wizard's skills-equipment step doesn't ask. The string `"a martial weapon"` is stored verbatim in `classEquipmentPicks` (well, actually as a free-text token after the resolver tokenizes the chosen option), and the sheet's resolver tokenizer falls through to `inventory.other` — so the placeholder ends up displayed as a free-text bullet in the Equipment Gear list, not as a real weapon under Combat → Weapons.

Result: a Warrior who picks `(a)` for line 1 has a "shield" (correctly resolved) and a `"a martial weapon"` token in their gear list. They can't tap-to-attack with it; AC, attack mod, and damage rolls aren't computed. The character doesn't actually have a weapon in any meaningful sense.

This is tracked by `e2e/post-creation-equipment.spec.ts`'s `test.fail("Warrior 'a martial weapon' placeholder resolves to a real weapon")` — the test was deliberately landed red as a regression tripwire for this fix.

## What Changes

- **Wizard skills-equipment step gains follow-up dropdowns** for any equipment option that contains a placeholder. When the player picks an option with `"a martial weapon"`, a `<Select>` appears below it populated with the structured `MARTIAL_MELEE` + `MARTIAL_RANGED` catalog. `"two martial weapons"` renders **two** Selects. Each Select stores its choice (catalog name) into `Character.classEquipmentChoices[lineIdx]: string[]` in order.
- **`Character.classEquipmentChoices: Record<number, string[]>`** is the new persisted field. Keyed by the equipment line's index (matching `classEquipmentPicks`). Value is an ordered list of catalog names that fill the placeholders in that line's chosen option.
- **Resolver substitutes placeholders at tokenization time.** `resolveCharacterInventory(c)` walks each line's chosen option, detects placeholder tokens, and replaces them with the corresponding entries from `classEquipmentChoices[lineIdx]` (in order) before the existing catalog lookup runs.
- **Validator rejects advance from skills-equipment** when a chosen option contains placeholders that aren't fully filled. Error message names the missing slot ("Pick the martial weapon for line 2").
- **Migrator backfills `classEquipmentChoices: {}`** for pre-1.15 characters. Pre-existing Warriors / Captains keep their `"a martial weapon"` placeholder in the gear list until they revisit the wizard or pick the items via the inventory modal — the new field starts empty, so the resolver behaves exactly as before for unmigrated picks.
- **Placeholder detection** covers the canonical PG phrases:
  - `"a martial weapon"` / `"a simple weapon"` (one-of either category)
  - `"a martial melee weapon"` / `"a simple ranged weapon"` (one with sub-category constraint)
  - `"two martial weapons"` / `"two simple weapons"` / etc. (count-prefixed plural)
- The existing `e2e/post-creation-equipment.spec.ts:Warrior 'a martial weapon' placeholder resolves to a real weapon (not gear)` test (currently `test.fail`) flips to a normal `test()` once the fix lands and verifies the placeholder is gone from the gear list.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `character-creation`: tighten the skills-equipment step's validator so chosen equipment options with martial / simple weapon placeholders require follow-up choices before advancing, and persist those choices on the character.
- `companion-mode`: extend the inventory resolver so placeholder tokens (`"a martial weapon"`, `"two martial weapons"`, etc.) are substituted with the player's persisted choices before the catalog lookup, surfacing real weapons under Combat → Weapons instead of free-text gear bullets.

## Impact

- **`lib/character/types.ts`** — `Character` gains `classEquipmentChoices: Record<number, string[]>`. Required field; migrator backfills `{}`.
- **`lib/character/defaults.ts`** — `emptyCharacter` initializes `classEquipmentChoices: {}`.
- **`lib/storage/local.ts#migrateCharacter`** — backfills `{}` for pre-1.15 saves. Idempotent.
- **`e2e/helpers/fixtures.ts`** — `makeBase()` defaults include the new field.
- **New helper `lib/character/equipment-placeholder.ts`** (or extend `equipment.ts`) — exports `parseOptionPlaceholders(option: string): Placeholder[]` returning ordered placeholders with their constraints (`{ kind: "martial" | "simple", subcategory?: "melee" | "ranged", count: 1 }` per slot — count-prefixed lines yield N placeholders).
- **`lib/character/equipment.ts`** — `resolveCharacterInventory` extends to substitute placeholder tokens with `classEquipmentChoices[lineIdx]` values during tokenization.
- **`lib/character/validation.ts`** — `validateStep("skills-equipment", c)` checks each line's chosen option's placeholders against `classEquipmentChoices[lineIdx]`. Rejects with a specific error when a placeholder is unfilled.
- **`components/builder/skills-equipment-step.tsx`** — for each equipment line whose chosen option contains placeholders, render N `<Select>` controls populated with the appropriate catalog. Mutations write to `draft.classEquipmentChoices[lineIdx]`. Layout: indented under the option, label "Choose your martial weapon" or similar.
- **`e2e/post-creation-equipment.spec.ts`** — flip the `test.fail` to a regular `test()`. Add new tests: wizard walk for Captain picking option (a) and choosing "Longsword" via dropdown — assert it surfaces under Combat → Weapons.
- **`e2e/builder.spec.ts`** — the existing happy-path test uses Captain → all-radios-iterated; verify it still works (the validator's new check might require the test to pick a martial weapon explicitly).
- **No `Character` schema break.** Additive field; old saves load via the migrator.
- **Suite size**: 101 → ~104 tests after the new spec lands.
