# character-creation Specification

## Purpose
TBD - created by archiving change add-boons-burdens-to-wizard. Update Purpose after archive.
## Requirements
### Requirement: The L1 builder SHALL include a Boons & Burdens step

The wizard's `STEPS` array MUST include a `"boons-burdens"` step between `"abilities"` and `"skills-equipment"`. The step MUST be reachable at `/builder/boons-burdens?id=<id>` and MUST render via the same `WizardShell` pattern as every other step.

#### Scenario: Step appears in the wizard order
- **WHEN** the user advances from the abilities step
- **THEN** they land on `/builder/boons-burdens?id=<id>`
- **AND** the step indicator nav shows "Boons & Burdens" highlighted as the active step

#### Scenario: Continuing from boons-burdens leads to skills-equipment
- **WHEN** the user clicks Continue on the boons-burdens step (with valid picks or none)
- **THEN** they land on `/builder/skills-equipment?id=<id>`

#### Scenario: Going back from skills-equipment lands on boons-burdens
- **WHEN** the user clicks Back from the skills-equipment step
- **THEN** they land on `/builder/boons-burdens?id=<id>` (not on abilities)

### Requirement: A character MAY take 0 or 1 boon and 0 or 1 burden at L1

The boons-burdens step MUST accept zero or one boon selection and zero or one burden selection. Selecting two or more of either type MUST be rejected by the validator.

#### Scenario: Zero picks is valid
- **WHEN** the user advances from boons-burdens with no boon and no burden selected
- **THEN** validation passes and the user advances to skills-equipment

#### Scenario: One boon is valid
- **WHEN** the user picks one boon and advances
- **THEN** validation passes and the persisted `Character.boons` contains exactly that boon's id

#### Scenario: One burden is valid
- **WHEN** the user picks one burden and advances
- **THEN** validation passes and the persisted `Character.burdens` contains exactly that burden's id

### Requirement: Choice-boons SHALL require an ability selection before advance

When a boon's `abilityBonus.ability === "choice"`, the wizard MUST surface a secondary picker for the player to choose the target ability from the boon's `abilityBonusChoices` array. The validator MUST reject advance if the boon is selected but no ability has been picked.

#### Scenario: Choice-boon with no ability picked rejects advance
- **WHEN** the user picks a choice-boon (e.g. Wild Talent) and clicks Continue without picking an ability
- **THEN** the toast displays a validation error
- **AND** the URL remains on `/builder/boons-burdens`

#### Scenario: Choice-boon with ability picked persists the choice
- **WHEN** the user picks a choice-boon and selects an ability
- **THEN** advancing persists the chosen ability into `Character.boonAbilityChoices[<boonId>]`

#### Scenario: Deselecting a choice-boon clears its ability choice
- **WHEN** the user previously picked a choice-boon with an ability, then unselects the boon
- **THEN** that boon's entry in `Character.boonAbilityChoices` is removed (or `Character.boons` no longer contains the id, whichever the implementation does first; both produce a coherent state)

### Requirement: Boon ability bonuses SHALL flow through `computeFinalAbilities`

`computeFinalAbilities` MUST add the +1 from each boon's `abilityBonus` to the character's totals, applied to the boon's `ability` (or to `boonAbilityChoices[id]` if the boon's ability is `"choice"`). Boons without an `abilityBonus` add 0.

#### Scenario: Fixed-ability boon raises that ability
- **WHEN** a character with `boons: ["archivist"]` (which grants `int +1`) is rendered
- **THEN** `computeFinalAbilities(character).total.int` is 1 higher than the same character without that boon

#### Scenario: Choice-boon raises the chosen ability only
- **WHEN** a character with `boons: ["wild-talent"]` and `boonAbilityChoices: { "wild-talent": "wis" }` is rendered
- **THEN** `computeFinalAbilities(character).total.wis` is 1 higher than without the boon
- **AND** other ability totals are unchanged

#### Scenario: Choice-boon with no choice yet adds nothing
- **WHEN** a character has the choice-boon in `boons` but no entry in `boonAbilityChoices` (only reachable via hand-edited JSON)
- **THEN** `computeFinalAbilities` adds 0 for that boon and the renderer still produces a valid sheet

### Requirement: The schema SHALL gain `boonAbilityChoices` and the migrator SHALL backfill it

`Character.boonAbilityChoices: Record<string, Ability>` MUST be a required field on the `Character` interface, defaulting to `{}` for new characters. `migrateCharacter` MUST backfill `{}` for characters loaded from storage that lack the field.

#### Scenario: New character has empty choices
- **WHEN** `emptyCharacter(id)` is called
- **THEN** the returned character's `boonAbilityChoices` is `{}`

#### Scenario: Pre-1.3 saves get backfilled
- **WHEN** a character JSON without `boonAbilityChoices` is loaded
- **THEN** `migrateCharacter` returns a character whose `boonAbilityChoices` is `{}`
- **AND** the character renders on the sheet without errors

### Requirement: The character sheet SHALL render Boons and Burdens

The sheet MUST surface `Character.boons` and `Character.burdens` as their own visible sections, separately from the level-up `Character.feats`. Each entry MUST display the resolved name (via `BOON_BY_ID` / `BURDEN_BY_ID`) and description. Choice-boons MUST also display the chosen ability.

#### Scenario: Boons section renders one card per boon
- **WHEN** a character with `boons: ["archivist", "augur"]` is viewed (hand-edited; the wizard caps at 1, but compute and render must tolerate >1)
- **THEN** the sheet shows two boon cards with names and descriptions

#### Scenario: Choice-boons display the chosen ability
- **WHEN** a character with `boons: ["wild-talent"]` and `boonAbilityChoices: { "wild-talent": "cha" }` is viewed
- **THEN** the wild-talent card includes a small chip or label indicating "+1 CHA"

#### Scenario: Burdens section renders separately
- **WHEN** a character with `burdens: ["haunted"]` is viewed
- **THEN** the sheet shows a "Burdens" section with the haunted entry; this is NOT mixed into Boons or Feats

#### Scenario: Empty boons and empty burdens hide their sections
- **WHEN** a character has `boons: []` and `burdens: []`
- **THEN** neither section is rendered (no empty headings)

### Requirement: Hand-coded boon restrictions SHALL prevent invalid origin pairings

For boons whose PG `restriction` text excludes specific origins (e.g. "Dwarves cannot take this boon — already part of their origin"), the validator MUST reject the pick when the character's `originId` is on the disallowed list.

#### Scenario: Origin-restricted boon rejects mismatched origin
- **WHEN** a Dwarf character attempts to pick a boon whose restriction names Dwarves
- **THEN** the toast displays the restriction text and the boon does NOT persist into `Character.boons`

#### Scenario: Origin-allowed boon persists normally
- **WHEN** an Abducted Human picks the same restricted boon (which only excludes Dwarves)
- **THEN** the boon persists into `Character.boons` without warnings

