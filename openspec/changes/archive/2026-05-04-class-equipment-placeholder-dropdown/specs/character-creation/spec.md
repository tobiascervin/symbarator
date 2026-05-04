## ADDED Requirements

### Requirement: `Character` SHALL carry `classEquipmentChoices` for placeholder weapon picks

`Character.classEquipmentChoices: Record<number, string[]>` MUST be a required field on the `Character` interface, defaulting to `{}` for new characters created via `emptyCharacter(id)`. The keys MUST match equipment line indices used by `classEquipmentPicks`. The values MUST be ordered arrays of catalog weapon names (e.g. `["Longsword", "Battleaxe"]`) — one entry per placeholder slot in the chosen option, in left-to-right order.

`migrateCharacter` MUST backfill the field with `{}` for any character loaded from storage that lacks it. The migration MUST be idempotent.

#### Scenario: New character has empty choices

- **WHEN** `emptyCharacter(id)` is called
- **THEN** the returned character's `classEquipmentChoices` is `{}`

#### Scenario: Pre-1.15 saves get backfilled

- **WHEN** a character JSON without `classEquipmentChoices` is loaded
- **THEN** `migrateCharacter` returns a character whose `classEquipmentChoices` is `{}`
- **AND** the character renders on the sheet without errors

### Requirement: The skills-equipment step SHALL render placeholder dropdowns for chosen options that include generic weapon placeholders

When the player picks an equipment option in `components/builder/skills-equipment-step.tsx` that contains placeholder phrases (`"a martial weapon"`, `"a simple weapon"`, `"two martial weapons"`, `"a martial melee weapon"`, etc.), the wizard MUST render N inline `<Select>` controls below the option — one per placeholder slot. Each Select MUST be populated with catalog weapons matching the placeholder's category and (when present) subcategory:

- `kind: "martial"` → `MARTIAL_MELEE` ∪ `MARTIAL_RANGED`
- `kind: "simple"` → `SIMPLE_MELEE` ∪ `SIMPLE_RANGED`
- subcategory `"melee"` / `"ranged"` narrows the union accordingly

Selecting a value MUST write the catalog name into `Character.classEquipmentChoices[lineIdx]` at the slot's index. Switching the radio (changing `classEquipmentPicks[lineIdx]`) MUST clear `classEquipmentChoices[lineIdx]`.

Equipment options without placeholders MUST NOT render extra controls.

#### Scenario: Warrior picking option (a) sees a martial-weapon Select

- **WHEN** the player picks Warrior at the class step and reaches skills-equipment, then selects radio (a) "a martial weapon and a shield" for line 1
- **THEN** a Select labelled "Choose your martial weapon" appears below the option
- **AND** the Select's options include every entry in `MARTIAL_MELEE` and `MARTIAL_RANGED` (e.g. Longsword, Greatsword, Battleaxe, Longbow, Composite Bow)
- **AND** the Select's options do NOT include simple weapons (e.g. Dagger, Quarterstaff)

#### Scenario: Picking "two martial weapons" renders two Selects

- **WHEN** the player picks radio (b) "two martial weapons" for line 1
- **THEN** two Selects appear below the option, both populated with the martial catalog
- **AND** the player must pick a value in each before advancing

#### Scenario: Switching radios resets the choices

- **WHEN** the player has picked option (a) and chosen "Longsword" in the Select, then switches to option (b)
- **THEN** `Character.classEquipmentChoices[1]` resets to `[]`
- **AND** the new Selects (for "two martial weapons") render empty

### Requirement: The skills-equipment validator SHALL reject advance when placeholders are unfilled

`validateStep("skills-equipment", character)` MUST iterate each equipment line, parse the chosen option for placeholders, and reject the advance when `classEquipmentChoices[lineIdx]` does not have one entry per placeholder. The error message MUST identify which line is incomplete.

The validator MUST also reject when a chosen catalog name doesn't match the placeholder's category (e.g. picking a simple weapon for a "martial weapon" slot via hand-edited save).

#### Scenario: Unfilled placeholder blocks advance

- **WHEN** the player has picked Warrior option (a) "a martial weapon and a shield" for line 1 but hasn't picked anything in the Select
- **THEN** clicking Continue surfaces a toast naming the unfilled choice
- **AND** the URL stays on `/builder/skills-equipment`

#### Scenario: Filled placeholder permits advance

- **WHEN** the player has picked the Longsword in the Select
- **THEN** Continue advances the URL to `/builder/identity`
- **AND** `Character.classEquipmentChoices[1]` is `["Longsword"]`

#### Scenario: Out-of-category catalog name rejected

- **WHEN** a hand-edited save has `classEquipmentChoices[1]: ["Dagger"]` for a "martial weapon" placeholder (Dagger is a simple weapon)
- **THEN** `validateStep("skills-equipment", c)` returns an error message naming the mismatch
