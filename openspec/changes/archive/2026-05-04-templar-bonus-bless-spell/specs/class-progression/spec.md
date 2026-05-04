## ADDED Requirements

### Requirement: Spellcasting approaches MAY declare always-known spells granted in addition to player-chosen picks

`ApproachSpellcasting` MUST support an optional `alwaysKnownSpells: ReadonlyArray<SpellId>` field. Spells listed in this array MUST be treated as known by the character at every level the approach grants spellcasting, in addition to (not instead of) the player-chosen picks counted by `cantripsKnownAt1` / `spellsKnownAt1` and the per-level `progression` rows. Approaches that do not grant any always-known spells MUST omit the field (or set it to an empty array).

The Templar approach (`approaches[*].id === "templar"`) MUST declare `alwaysKnownSpells: ["bless"]`, matching the PG p. 143 rule "you learn 2 cantrips and 1 first-level spell from the Theurg tradition list, plus the bless spell".

#### Scenario: Templar approach declares bless as always-known
- **WHEN** the test suite reads the Templar approach's spellcasting metadata
- **THEN** `spellcasting.alwaysKnownSpells` contains exactly the id `"bless"`

#### Scenario: Always-known spell ids resolve to catalog entries
- **WHEN** any approach declares an `alwaysKnownSpells` array
- **THEN** every id in the array MUST exist in `SPELL_BY_ID`

#### Scenario: Always-known spells do not affect player-pick counts
- **WHEN** an approach declares both `cantripsKnownAt1: N`, `spellsKnownAt1: M`, and a non-empty `alwaysKnownSpells`
- **THEN** the L1 spell-pick validator continues to require exactly N cantrip picks and M leveled-spell picks from the player
- **AND** the granted spells in `alwaysKnownSpells` are not counted toward either limit

### Requirement: computeSpellcasting SHALL expose granted spells alongside per-level counts

`computeSpellcasting(character)` MUST return a `grantedSpells: ReadonlyArray<SpellId>` field sourced from the character's approach's `spellcasting.alwaysKnownSpells` (defaulting to an empty array when undefined). The field MUST be present whenever `computeSpellcasting` does not return `null`.

#### Scenario: Templar character exposes bless via computeSpellcasting
- **WHEN** `computeSpellcasting` is called on a Templar character at any level from 1 to 20
- **THEN** the returned object's `grantedSpells` array contains `"bless"`

#### Scenario: Non-Templar caster has empty grantedSpells by default
- **WHEN** `computeSpellcasting` is called on a Mystic character whose approach does not declare `alwaysKnownSpells`
- **THEN** the returned object's `grantedSpells` is an empty array

#### Scenario: Non-spellcasting approach returns null
- **WHEN** `computeSpellcasting` is called on a character whose approach has no `spellcasting`
- **THEN** the function returns `null` (granted spells are not a separate concept for non-casters)
