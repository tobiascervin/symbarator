## ADDED Requirements

### Requirement: Each class SHALL declare a 20-row level table

Every entry in `CLASSES` MUST expose a `levelTable` of exactly 20 entries indexed 0..19 corresponding to character levels 1..20. Each entry MUST declare the level's proficiency bonus and any features granted, and MAY declare zero or more `LevelChoice` items the level-up flow surfaces as required questions.

#### Scenario: Each class table has 20 rows
- **WHEN** the test suite enumerates all entries of `CLASSES`
- **THEN** every class's `levelTable.length` equals 20

#### Scenario: Proficiency bonus matches the standard 5E curve
- **WHEN** any class's level table is read at indices 0,3,7,11,15,19 (levels 1, 4, 8, 12, 16, 20)
- **THEN** `profBonus` is 2,2,3,4,5,6 respectively

#### Scenario: ASI/feat slots present at Symbaroum levels
- **WHEN** the level-up flow inspects any class's level table at levels 4, 8, 10, 12, 16, and 19
- **THEN** the entry's `choices` array contains a `LevelChoice` of kind `asi-or-feat`
- **AND** no other class level contains an `asi-or-feat` choice unless the Player's Guide explicitly grants one (in which case a code comment MUST cite the PG page reference)

### Requirement: Each approach SHALL declare a level table parallel to its class's table

Every entry in a class's `approaches` array MUST expose a `levelTable` of exactly 20 entries. Approach features that grant choices MUST be encoded as `LevelChoice` entries on the same row as the level they unlock.

#### Scenario: Approach table has 20 rows aligned with the class table
- **WHEN** the test suite enumerates approaches across all classes
- **THEN** every approach's `levelTable.length` equals 20

#### Scenario: Approach features and class features compose at the same level
- **WHEN** the level-up flow is invoked at level N
- **THEN** the flow concatenates the class's `levelTable[N-1]` features and choices with the chosen approach's `levelTable[N-1]` features and choices, presenting them as one combined set of prompts

### Requirement: Spellcasting approaches SHALL declare a spell-progression table covering levels 1–20

Spellcasting metadata MUST live on `ApproachDef.spellcasting` (NOT on `ClassDef`). Every approach that grants spellcasting per the Player's Guide — at minimum every Mystic approach, the Warrior/Templar approach, and the Hunter/Witch Hunter approach — MUST declare a `progression` array of length 20 with `cantripsKnown`, `spellsKnown`, and `spellSlots` per spell level for each character level. Approaches without spellcasting MUST leave `spellcasting` undefined.

#### Scenario: Spellcasting approach progression length
- **WHEN** any approach with `spellcasting` defined is loaded
- **THEN** its `spellcasting.progression.length` equals 20 and every row's spell-slot counts are non-negative integers

#### Scenario: Cantrips and spells known are monotonically non-decreasing
- **WHEN** any two consecutive rows of an approach's spell progression are compared
- **THEN** `cantripsKnown` and `spellsKnown` at level N+1 are greater than or equal to their values at level N

#### Scenario: Non-spellcasting approaches have no progression
- **WHEN** an approach without spellcasting per the Player's Guide is loaded
- **THEN** its `spellcasting` field is undefined

#### Scenario: ClassDef no longer carries spellcasting metadata
- **WHEN** any `ClassDef` is loaded
- **THEN** it does not expose a `spellcasting` field (the field has been moved to `ApproachDef`)

### Requirement: Level tables MUST cite their Player's Guide source

Each class and approach level table MUST include a code comment with the Player's Guide page reference for that class/approach progression, mirroring the existing convention in `data/classes.ts`.

#### Scenario: Citation present
- **WHEN** any new level-table file is reviewed
- **THEN** a `// PG p. <n>` comment appears at or near the table declaration

### Requirement: LevelChoice kinds SHALL be a typed discriminated union

`LevelChoice` MUST be a discriminated union with a `kind` discriminant. Each kind MUST be exhaustively handled in both the level-up UI dispatcher and the level-up validator; adding a new kind without updating both sites MUST surface as a TypeScript error.

#### Scenario: Adding a kind without a UI handler fails to compile
- **WHEN** a developer adds a new variant to the `LevelChoice` union
- **AND** does not add a matching arm to the level-up UI's exhaustive switch
- **THEN** TypeScript fails compilation due to the missing branch

#### Scenario: Adding a kind without a validator handler fails to compile
- **WHEN** a developer adds a new variant to the `LevelChoice` union
- **AND** does not add a matching arm to the level-up validator
- **THEN** TypeScript fails compilation due to the missing branch
