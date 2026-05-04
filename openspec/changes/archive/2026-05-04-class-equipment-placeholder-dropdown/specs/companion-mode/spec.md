## ADDED Requirements

### Requirement: `resolveCharacterInventory(c)` SHALL substitute placeholder tokens with `classEquipmentChoices` values

When `resolveCharacterInventory(c)` (in `lib/character/equipment.ts`) walks each line's chosen option and tokenizes it, any token matching a known placeholder phrase (`"a martial weapon"`, `"a simple weapon"`, `"two martial weapons"`, `"a martial melee weapon"`, etc.) MUST be replaced — in left-to-right order — with the corresponding entries from `classEquipmentChoices[lineIdx]`. The substituted catalog names then flow through the existing tokenizer (alias map, depluralization, `WEAPON_BY_NAME` lookup), producing real weapon entries in `inventory.weapons`.

When a placeholder slot has no corresponding choice (mid-wizard state, hand-edited save, pre-1.15 character that hasn't visited the wizard), the placeholder token MUST remain unsubstituted and fall through to `inventory.other` — preserving today's behavior so nothing visually regresses.

#### Scenario: Warrior with a chosen martial weapon surfaces it under Combat → Weapons

- **WHEN** a Warrior with `classEquipmentPicks[1]: 0` (option (a) "a martial weapon and a shield") and `classEquipmentChoices[1]: ["Longsword"]` is rendered on the sheet
- **THEN** `resolveCharacterInventory(c).weapons` contains a Longsword entry
- **AND** the Combat → Weapons subsection includes a `Cast Longsword`-style tap target
- **AND** the Equipment Gear list does NOT contain `"a martial weapon"`

#### Scenario: "two martial weapons" expands to two real weapons

- **WHEN** a Warrior with `classEquipmentPicks[1]: 1` (option (b) "two martial weapons") and `classEquipmentChoices[1]: ["Longsword", "Battleaxe"]` is rendered
- **THEN** `inventory.weapons` contains both Longsword and Battleaxe entries

#### Scenario: Unfilled placeholder falls through to gear

- **WHEN** a pre-1.15 Warrior loaded with empty `classEquipmentChoices` and option (a) chosen for line 1 is rendered
- **THEN** `inventory.other` still includes `"a martial weapon"` exactly as it did before this change
- **AND** the Combat → Weapons subsection does not include a phantom weapon
