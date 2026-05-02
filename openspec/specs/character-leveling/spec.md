# character-leveling Specification

## Purpose
TBD - created by archiving change add-character-leveling. Update Purpose after archive.
## Requirements
### Requirement: Character level field SHALL support 1 through 20

The `Character` type's `level` field MUST be a numeric value in the inclusive range 1..20. The builder continues to create characters at level 1; higher levels are reached only via the level-up flow.

#### Scenario: Builder creates a level-1 character
- **WHEN** the user finishes the L1 builder
- **THEN** the persisted `Character` has `level === 1`

#### Scenario: Existing pre-change saves remain loadable
- **WHEN** a character saved before this change is loaded
- **THEN** the storage layer normalizes it to a valid current-schema `Character` with `level: 1` and any newly-required fields defaulted

#### Scenario: Level cannot exceed 20
- **WHEN** the level-up flow is invoked on a level-20 character
- **THEN** the entry point is disabled and no level-up dialog opens

### Requirement: The character sheet SHALL expose a level-up entry point

The character sheet (`/characters/[id]`) MUST surface a "Level Up" control whenever the character's level is below 20. The builder route (`/builder/...`) MUST NOT contain a level-up entry point — it remains an L1-only path.

#### Scenario: Sheet shows Level Up button below max level
- **WHEN** a character with `level < 20` is viewed on the sheet
- **THEN** a "Level Up" control is visible and enabled

#### Scenario: Sheet hides or disables Level Up at max level
- **WHEN** a character with `level === 20` is viewed on the sheet
- **THEN** the "Level Up" control is either hidden or rendered disabled, and clicking it does not start a level-up flow

#### Scenario: Builder does not offer level-up
- **WHEN** the user is anywhere under `/builder/`
- **THEN** no level-up control is present; the wizard advances toward `/characters/[id]` with `level === 1`

### Requirement: A level-up SHALL collect every mechanically required choice for the gained level before persisting

A level-up from level N to N+1 MUST present every required choice declared by the class's and approach's level table for level N+1, in order, and MUST refuse to persist the new level until each required choice is answered. Optional flavor questions MAY be skipped.

#### Scenario: HP gain is required every level past 1
- **WHEN** a character levels up to any level greater than 1
- **THEN** the flow asks for HP gained (default: average for the origin's hit die plus current Constitution modifier; alternative: a manually entered value bounded by [1 + conMod, hitDie + conMod])
- **AND** the new HP value is added to the persisted `maxHp`

#### Scenario: ASI-or-feat is required when the level grants one
- **WHEN** the new level's table entry contains a `LevelChoice` of kind `asi-or-feat`
- **THEN** the flow asks the player to pick either an Ability Score Improvement (+2 to one or +1/+1 to two) or a feat from `data/feats.ts`
- **AND** an ASI mutates the persisted `abilities` directly; a feat appends to the persisted `feats` list
- **AND** these slots appear at character levels 4, 8, 10, 12, 16, and 19 (Symbaroum places one extra slot at L10 vs base 5E)

#### Scenario: Changeling may take Change Self in place of an ASI/feat
- **WHEN** the new level's table entry contains a `LevelChoice` of kind `asi-or-feat`
- **AND** the character's origin is Changeling
- **THEN** the flow's ASI/feat step offers a third option, **Change Self**
- **AND** picking Change Self consumes the same slot (no ASI is granted, no other feat is granted) and is recorded on the character (e.g. appended to `feats` with the canonical `change-self` id)

#### Scenario: Spells learned advance with level for any spellcasting approach
- **WHEN** the character's approach has `spellcasting.progression` defined (Mystic approaches, Warrior/Templar, Hunter/Witch Hunter)
- **AND** the new level's row of that progression grants additional cantrips known, additional spells known, or permits a known-spell swap
- **THEN** the flow asks the player to pick exactly the additional cantrips and spells, and (if permitted) one swap of an already-known spell
- **AND** the persisted `spellPicks` reflects the new totals

#### Scenario: Class- or approach-specific feature picks
- **WHEN** the new level's table entry contains a `LevelChoice` whose kind requires a player decision (e.g. `fighting-style`)
- **THEN** the flow asks the corresponding question and persists the resulting selection in the appropriate field

#### Scenario: Validation gates persistence
- **WHEN** the player attempts to confirm the level-up while any required question is unanswered or invalid
- **THEN** the flow displays the validation error and does not change `level`, `maxHp`, `abilities`, `feats`, or `spellPicks`

### Requirement: Level-up SHALL persist current totals only, not a per-level audit log

The system MUST NOT introduce a per-level history field. Each level-up applies its effects directly to the existing total fields (`abilities`, `feats`, `maxHp`, `spellPicks`) and bumps `level`.

#### Scenario: No history field is added
- **WHEN** a character is leveled up multiple times
- **THEN** the persisted JSON contains no array of past level-up choices; only the current `level` and the cumulative totals are present

#### Scenario: Level-down is unsupported
- **WHEN** any code path attempts to decrement `Character.level`
- **THEN** the system does not provide a UI affordance for it; reverting requires the user to manually edit and re-import the JSON

### Requirement: Computed sheet stats SHALL reflect the current level rather than being hardcoded to L1

`computeProficiencyBonus`, `computeSavingThrows`, `computeSkillScores`, `computeCorruptionThreshold`, `computeSpellcasting`, and any other sheet-displayed derivation MUST compute their result from `Character.level` (not a literal `1`) and from the level-aware data tables.

#### Scenario: Proficiency bonus advances with level
- **WHEN** a character at level 5 is rendered on the sheet
- **THEN** `computeProficiencyBonus` returns 3 and saves/skills incorporate it

#### Scenario: Spell slots advance with level for spellcasting approaches
- **WHEN** a character with a spellcasting approach (e.g. a Mystic, Templar, or Witch Hunter) at level 5 is rendered on the sheet
- **THEN** `computeSpellcasting` returns the level-5 row from the approach's spell progression (cantrips known, spells known, slot counts), not the L1 row

#### Scenario: Corruption threshold uses current proficiency bonus
- **WHEN** a character at level 9 with Cha mod +2 is rendered on the sheet
- **THEN** `computeCorruptionThreshold` returns max(2, 4×2 + 2) = 10 for `shadowFormula: "standard"` (using prof bonus 4 at L9)

