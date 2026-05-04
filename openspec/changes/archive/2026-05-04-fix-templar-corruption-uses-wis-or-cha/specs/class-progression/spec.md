## ADDED Requirements

### Requirement: Approaches MAY override the ability used by the standard corruption-threshold formula

`ApproachDef` MUST support an optional `corruptionAbilityOverride: Ability` field. When set on an approach whose parent class has `shadowFormula: "standard"`, the corruption-threshold formula MUST become `max(2, 2 × profBonus + max(chaMod, overrideMod))` instead of the default `max(2, 2 × profBonus + chaMod)`. When the field is unset, the existing standard formula MUST apply unchanged. The field MUST be ignored for classes whose `shadowFormula` is `"mystic"` — mystic approaches continue to use `spellcasting.abilityHint` exclusively. The field is independent of `spellcasting.abilityHint` and MUST NOT be conflated with it: an approach may declare both, neither, or either.

The Templar approach (`approaches[*].id === "templar"`) MUST declare `corruptionAbilityOverride: "wis"`, encoding the PG p. 143 rule: *"If your Wisdom modifier is higher than your Charisma modifier, you can use it instead of Charisma to calculate your Corruption Threshold."* No other approach in the catalog SHALL declare this field unless and until the Player's Guide assigns the same rule to that approach.

#### Scenario: Templar approach declares wis as the corruption ability override

- **WHEN** the test suite reads the Templar approach (Warrior approaches, `id === "templar"`)
- **THEN** `corruptionAbilityOverride` equals `"wis"`

#### Scenario: Templar with Wis higher than Cha uses Wis for corruption threshold

- **WHEN** a level-1 Warrior/Templar with `chaMod = +1` and `wisMod = +3` is rendered on the sheet
- **THEN** `computeCorruptionThreshold` returns `max(2, 2×2 + 3) = 7`
- **AND** the value differs from the same character's pre-fix result of `max(2, 2×2 + 1) = 5`

#### Scenario: Templar with Wis equal to Cha uses Cha for corruption threshold

- **WHEN** a level-1 Warrior/Templar with `chaMod = +2` and `wisMod = +2` is rendered on the sheet
- **THEN** `computeCorruptionThreshold` returns `max(2, 2×2 + 2) = 6`
- **AND** the result is identical to the standard formula's pre-fix result for that character

#### Scenario: Templar with Wis lower than Cha uses Cha for corruption threshold

- **WHEN** a level-1 Warrior/Templar with `chaMod = +3` and `wisMod = -1` is rendered on the sheet
- **THEN** `computeCorruptionThreshold` returns `max(2, 2×2 + 3) = 7`
- **AND** the negative Wis modifier is NOT used because Cha is higher

#### Scenario: Non-Templar Warrior approach is unaffected by the override

- **WHEN** a Warrior/Berserker (an approach without `corruptionAbilityOverride`) with `chaMod = +1` and `wisMod = +4` is rendered on the sheet at level 1
- **THEN** `computeCorruptionThreshold` returns `max(2, 2×2 + 1) = 5` using the unmodified standard formula
- **AND** the Wis modifier is not consulted

#### Scenario: Override is ignored when the class formula is "mystic"

- **WHEN** a hypothetical mystic-formula class declares an approach with both `corruptionAbilityOverride: "wis"` and `spellcasting.abilityHint: "int"`
- **THEN** `computeCorruptionThreshold` MUST use the mystic formula `max(2, intMod + profBonus)` based on `spellcasting.abilityHint`
- **AND** `corruptionAbilityOverride` MUST NOT contribute to the result

#### Scenario: Override applies at every character level for Templar

- **WHEN** a level-9 Warrior/Templar with `chaMod = +1`, `wisMod = +3`, and `profBonus = 4` is rendered
- **THEN** `computeCorruptionThreshold` returns `max(2, 2×4 + 3) = 11`
- **AND** the formula uses the level-aware proficiency bonus, consistent with the existing leveling behavior for `computeCorruptionThreshold`
