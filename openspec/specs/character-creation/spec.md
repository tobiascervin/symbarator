# character-creation Specification

## Purpose
TBD - created by archiving change add-boons-burdens-to-wizard. Update Purpose after archive.
## Requirements
### Requirement: The L1 builder SHALL include a Boons & Burdens step

The wizard's active step list MUST include a `"boons-burdens"` step between `"abilities"` and `"skills-equipment"` when `Character.houseRules.allowL1BoonBurden === true`, and MUST omit it when the flag is `false`. A new exported helper `stepsFor(character): ReadonlyArray<Step>` MUST be the single source of truth for the active step list, used by `nextStep`, `prevStep`, the wizard step indicator, and the "Step N of M" header. When the step is included, it MUST be reachable at `/builder/boons-burdens?id=<id>` and MUST render via the same `WizardShell` pattern as every other step.

#### Scenario: House-rules ON — step appears in the wizard order
- **WHEN** a character has `houseRules.allowL1BoonBurden: true` and advances from the abilities step
- **THEN** they land on `/builder/boons-burdens?id=<id>`
- **AND** the step indicator shows "Boons & Burdens" highlighted as the active step

#### Scenario: House-rules ON — Continue from boons-burdens leads to skills-equipment
- **WHEN** a character with the flag enabled clicks Continue on the boons-burdens step (with valid picks or none)
- **THEN** they land on `/builder/skills-equipment?id=<id>`

#### Scenario: House-rules ON — Back from skills-equipment lands on boons-burdens
- **WHEN** a character with the flag enabled clicks Back from the skills-equipment step
- **THEN** they land on `/builder/boons-burdens?id=<id>` (not on abilities)

#### Scenario: House-rules OFF — Continue from abilities skips to skills-equipment
- **WHEN** a character with `houseRules.allowL1BoonBurden: false` clicks Continue on the abilities step
- **THEN** they land on `/builder/skills-equipment?id=<id>`
- **AND** the step indicator does NOT contain a Boons & Burdens entry

#### Scenario: House-rules OFF — Back from skills-equipment lands on abilities
- **WHEN** a character with the flag disabled clicks Back from the skills-equipment step
- **THEN** they land on `/builder/abilities?id=<id>`

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

The sheet MUST surface `Character.boons` and `Character.burdens` as their own visible sections, separately from the level-up `Character.feats`. Each entry MUST be rendered using the shared `FeatCard` component (sheet-themed, parchment palette) so the visual treatment matches the spell cards rendered in the same sheet. Each card MUST display the resolved name (via `BOON_BY_ID` / `BURDEN_BY_ID`) and description. Choice-boons MUST also display the chosen ability as a badge. Burdens MUST display their ability bonus as one badge per `+X ABL` term: a fixed-bonus burden shows one badge (e.g. `+2 CON`); a `choose-one` burden shows one badge with the chosen ability (e.g. `+2 STR`); a `choose-two` burden shows two badges (e.g. `+1 STR`, `+1 WIS`). Burdens without an `abilityBonus` MUST render no bonus badges.

#### Scenario: Boons section renders one card per boon
- **WHEN** a character with `boons: ["archivist", "augur"]` is viewed (hand-edited; the wizard caps at 1, but compute and render must tolerate >1)
- **THEN** the sheet shows two cards rendered by `FeatCard`, each with the boon's display name and description

#### Scenario: Choice-boons display the chosen ability as a badge
- **WHEN** a character with `boons: ["wild-talent"]` and `boonAbilityChoices: { "wild-talent": "cha" }` is viewed
- **THEN** the wild-talent card includes a badge labelled "+1 CHA"

#### Scenario: Burdens section renders separately
- **WHEN** a character with `burdens: ["nightmares"]` is viewed
- **THEN** the sheet shows a "Burdens" section with the nightmares entry rendered by `FeatCard`; this is NOT mixed into Boons or Feats

#### Scenario: Empty boons and empty burdens hide their sections
- **WHEN** a character has `boons: []` and `burdens: []`
- **THEN** neither section is rendered (no empty headings)

#### Scenario: Card visual structure matches spell cards
- **WHEN** any boon or burden is rendered on the sheet
- **THEN** the card has a bordered container, a display-font name, an optional badge row, and a description row — the same visual structure used by `SpellCard` in display mode

#### Scenario: Fixed-bonus burden renders its bonus badge
- **WHEN** a character with `burdens: ["bestial"]` is viewed
- **THEN** the bestial card includes a badge labelled "+2 CON"

#### Scenario: Choose-one burden renders its chosen ability badge
- **WHEN** a character with `burdens: ["impulsive"]` and `burdenAbilityChoices: { impulsive: ["str"] }` is viewed
- **THEN** the impulsive card includes one badge labelled "+2 STR"

#### Scenario: Choose-two burden renders two badges
- **WHEN** a character with `burdens: ["dark-blood"]` and `burdenAbilityChoices: { "dark-blood": ["str", "wis"] }` is viewed
- **THEN** the dark-blood card includes two badges: "+1 STR" and "+1 WIS"

### Requirement: Hand-coded boon restrictions SHALL prevent invalid origin pairings

For boons whose PG `restriction` text excludes specific origins (e.g. "Dwarves cannot take this boon — already part of their origin"), the validator MUST reject the pick when the character's `originId` is on the disallowed list.

#### Scenario: Origin-restricted boon rejects mismatched origin
- **WHEN** a Dwarf character attempts to pick a boon whose restriction names Dwarves
- **THEN** the toast displays the restriction text and the boon does NOT persist into `Character.boons`

#### Scenario: Origin-allowed boon persists normally
- **WHEN** an Abducted Human picks the same restricted boon (which only excludes Dwarves)
- **THEN** the boon persists into `Character.boons` without warnings

### Requirement: The schema SHALL gain a `houseRules` namespace with `allowL1BoonBurden`

`Character.houseRules: { allowL1BoonBurden: boolean }` MUST be a required field on the `Character` interface. New characters created via `emptyCharacter(id)` MUST default `allowL1BoonBurden` to `false`. The `houseRules` namespace MUST be JSON-safe (plain object, no methods) so it round-trips through export/import unchanged.

#### Scenario: New character defaults to RAW
- **WHEN** `emptyCharacter(id)` is called
- **THEN** the returned character's `houseRules.allowL1BoonBurden` is `false`

#### Scenario: Exported JSON includes the namespace
- **WHEN** a character with `houseRules.allowL1BoonBurden: true` is exported via the home-page Export JSON action
- **THEN** the exported JSON contains a `houseRules` object with `allowL1BoonBurden: true`
- **AND** importing that JSON on another browser reproduces the same flag value

### Requirement: The migrator SHALL backfill `houseRules.allowL1BoonBurden` from existing data

`migrateCharacter` MUST set `houseRules.allowL1BoonBurden` to `true` when the loaded character has a non-empty `boons` array OR a non-empty `burdens` array, and to `false` otherwise. The migration MUST be idempotent — running it twice on the same character produces the same value.

#### Scenario: Pre-change save with no boons defaults to RAW
- **WHEN** a character JSON without a `houseRules` field and with `boons: []` and `burdens: []` is loaded
- **THEN** `migrateCharacter` returns a character with `houseRules.allowL1BoonBurden === false`

#### Scenario: Pre-change save with a boon flips the flag on
- **WHEN** a character JSON without a `houseRules` field and with `boons: ["archivist"]` is loaded
- **THEN** `migrateCharacter` returns a character with `houseRules.allowL1BoonBurden === true`
- **AND** the character's `boons` array is preserved

#### Scenario: Pre-change save with only a burden flips the flag on
- **WHEN** a character JSON without a `houseRules` field and with `boons: []` and `burdens: ["haunted"]` is loaded
- **THEN** `migrateCharacter` returns a character with `houseRules.allowL1BoonBurden === true`

### Requirement: The wizard SHALL surface a house-rules toggle on the abilities step

The abilities step MUST render a labelled toggle (`"GM allows L1 Boons & Burdens — house rule"`) bound to `Character.houseRules.allowL1BoonBurden`, with a one-line explainer indicating that this is not RAW. Toggling the control MUST update the persisted character's flag and immediately update the wizard's step list, indicator, and Continue label.

#### Scenario: Toggle starts off for new characters
- **WHEN** a player begins a new character and reaches the abilities step
- **THEN** the toggle is visible and unchecked

#### Scenario: Enabling the toggle inserts the boons-burdens step
- **WHEN** the player checks the toggle on the abilities step
- **THEN** the wizard's step indicator gains a "Boons & Burdens" entry between Abilities and Skills & Equipment
- **AND** the "Step N of M" header increments M by one

#### Scenario: Disabling the toggle with picks present prompts confirmation
- **WHEN** the player unchecks the toggle while `boons` or `burdens` is non-empty
- **THEN** a confirmation prompt appears warning that the picks will be cleared
- **AND** confirming clears `boons`, `burdens`, and `boonAbilityChoices` to empty
- **AND** declining keeps the toggle on and the picks intact

#### Scenario: Disabling the toggle with no picks is silent
- **WHEN** the player unchecks the toggle while `boons` and `burdens` are both empty
- **THEN** the toggle flips off without a confirmation prompt
- **AND** the boons-burdens step is removed from the indicator

### Requirement: Direct navigation to a disabled step SHALL redirect to abilities

When `Character.houseRules.allowL1BoonBurden === false` and the URL `/builder/boons-burdens?id=<id>` is loaded directly (typed, bookmarked, or arrived at via stale Back navigation), the page MUST redirect to `/builder/abilities?id=<id>` rather than render the step.

#### Scenario: RAW character deep-link to boons-burdens redirects
- **WHEN** a character with `houseRules.allowL1BoonBurden: false` is loaded at `/builder/boons-burdens?id=<id>`
- **THEN** the browser is redirected to `/builder/abilities?id=<id>`
- **AND** no validation toast is fired

### Requirement: BurdenDef SHALL describe the burden's ability bonus shape

Each `BurdenDef` MAY carry an optional `abilityBonus: BurdenBonus` field. `BurdenBonus` MUST be a discriminated union with three `kind`s: `"fixed"` (one named ability gets `+amount`), `"choose-one"` (player picks one ability — optionally restricted via `from: ReadonlyArray<Ability>`; default any of the six — that gets `+amount`), and `"choose-two"` (player picks two distinct abilities, each gets `+amount`). For canonical PG burdens, `fixed` and `choose-one` use `amount: 2`; `choose-two` uses `amount: 1` (Dark Blood). A burden with no `abilityBonus` contributes no ability bonus.

A burden MAY also carry `startingCorruption: number` (PG: Dark Blood adds `+2 permanent Corruption`). This is informational only — the wizard surfaces a warning but the player adjusts the existing `Character.corruption.permanent` field manually.

#### Scenario: Fixed-bonus burden defines a single ability and amount
- **WHEN** the catalog defines Bestial as `{ kind: "fixed", ability: "con", amount: 2 }`
- **THEN** the burden's bonus shape is mechanically representable as `+2 CON`

#### Scenario: Choose-one burden defines an ability list
- **WHEN** the catalog defines Impulsive as `{ kind: "choose-one", from: ["str", "cha"], amount: 2 }`
- **THEN** the wizard's picker offers exactly Strength and Charisma when Impulsive is selected

#### Scenario: Choose-two burden has no `from` list (any-of-six)
- **WHEN** the catalog defines Dark Blood as `{ kind: "choose-two", amount: 1 }` and `startingCorruption: 2`
- **THEN** the picker offers all six abilities and accepts exactly two distinct picks
- **AND** the picker surfaces a "+2 permanent Corruption (track manually)" warning chip when Dark Blood is selected

### Requirement: The schema SHALL gain `burdenAbilityChoices` and the migrator SHALL backfill it

`Character.burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>` MUST be a required field on the `Character` interface, defaulting to `{}` for new characters. For each picked choice-burden, the value MUST be an array of the chosen abilities (length 1 for `choose-one`, length 2 for `choose-two`). Fixed burdens have no entry. `migrateCharacter` MUST backfill `{}` for characters loaded from storage that lack the field.

#### Scenario: New character has empty burden choices
- **WHEN** `emptyCharacter(id)` is called
- **THEN** the returned character's `burdenAbilityChoices` is `{}`

#### Scenario: Pre-1.7 saves get backfilled
- **WHEN** a character JSON without `burdenAbilityChoices` is loaded
- **THEN** `migrateCharacter` returns a character whose `burdenAbilityChoices` is `{}`
- **AND** the character renders on the sheet without errors

#### Scenario: Existing fixed-burden picks contribute their bonus immediately
- **WHEN** a pre-upgrade character has `burdens: ["bestial"]` and is loaded after this change ships
- **THEN** the migrator backfills `burdenAbilityChoices: {}` (no entry needed for a fixed burden)
- **AND** `computeFinalAbilities(character).total.con` is 2 higher than the same character without the burden

### Requirement: Choice-burdens SHALL require an ability selection before advance

When a chosen burden's `abilityBonus.kind` is `"choose-one"`, the wizard MUST surface an ability picker constrained to the burden's `from` list (or all six abilities when `from` is undefined). The validator MUST reject advance from the boons-burdens step if a choice-one burden is selected and `burdenAbilityChoices[<id>]` does not have exactly one ability that's a member of the allowed list.

When a chosen burden's `abilityBonus.kind` is `"choose-two"`, the wizard MUST surface an ability picker that requires exactly two distinct ability picks from the burden's `from` list (or all six). The validator MUST reject advance if `burdenAbilityChoices[<id>]` does not have exactly two distinct allowed abilities.

#### Scenario: Choose-one burden with no ability picked rejects advance
- **WHEN** the player picks Impulsive (choose-one) and clicks Continue without picking the ability
- **THEN** the toast displays a validation error
- **AND** the URL remains on `/builder/boons-burdens`

#### Scenario: Choose-one burden with ability picked persists the choice
- **WHEN** the player picks Impulsive and selects Strength
- **THEN** advancing persists `Character.burdenAbilityChoices["impulsive"]` as `["str"]`

#### Scenario: Choose-two burden with one ability picked rejects advance
- **WHEN** the player picks Dark Blood (choose-two) and selects only Wisdom
- **THEN** the toast displays a validation error indicating two distinct abilities are required
- **AND** the URL remains on `/builder/boons-burdens`

#### Scenario: Choose-two burden with duplicate abilities rejects advance
- **WHEN** the player attempts to persist Dark Blood with `["str", "str"]` (only reachable via hand-edited JSON)
- **THEN** the validator rejects on the next visit with a duplicate-ability error

#### Scenario: Choose-two burden with two distinct abilities persists both
- **WHEN** the player picks Dark Blood and selects Strength and Wisdom
- **THEN** advancing persists `Character.burdenAbilityChoices["dark-blood"]` as `["str", "wis"]` (order preserved)

#### Scenario: Deselecting a choice-burden clears its ability choice
- **WHEN** the player previously picked a choice-burden with abilities, then unselects the burden
- **THEN** that burden's entry in `Character.burdenAbilityChoices` is removed (or `Character.burdens` no longer contains the id, whichever the implementation does first; both produce a coherent state)

### Requirement: Burden ability bonuses SHALL flow through `computeFinalAbilities`

`computeFinalAbilities` MUST add each burden's `abilityBonus` to the character's totals, applied:
- For `kind: "fixed"`, to `bonus.ability`.
- For `kind: "choose-one"`, to the single ability in `burdenAbilityChoices[id]`, when present.
- For `kind: "choose-two"`, to each of the abilities in `burdenAbilityChoices[id]`, when present.

A burden without an `abilityBonus`, or a choice-burden missing its choice entry, MUST contribute zero — `computeFinalAbilities` MUST NOT throw on incomplete data, allowing the sheet to render even on hand-edited JSON.

#### Scenario: Fixed-bonus burden raises the named ability
- **WHEN** a character with `burdens: ["bestial"]` (which grants `con +2`) is rendered
- **THEN** `computeFinalAbilities(character).total.con` is 2 higher than the same character without that burden

#### Scenario: Choose-one burden raises only the chosen ability
- **WHEN** a character with `burdens: ["impulsive"]` and `burdenAbilityChoices: { impulsive: ["str"] }` is rendered
- **THEN** `computeFinalAbilities(character).total.str` is 2 higher than without the burden
- **AND** other ability totals are unchanged

#### Scenario: Choose-two burden raises both chosen abilities
- **WHEN** a character with `burdens: ["dark-blood"]` and `burdenAbilityChoices: { "dark-blood": ["str", "wis"] }` is rendered
- **THEN** `computeFinalAbilities(character).total.str` is 1 higher than without the burden
- **AND** `computeFinalAbilities(character).total.wis` is 1 higher than without the burden
- **AND** the other four ability totals are unchanged

#### Scenario: Choice-burden with no choice yet adds nothing
- **WHEN** a character has a choice-burden in `burdens` but no entry in `burdenAbilityChoices` (only reachable via hand-edited JSON)
- **THEN** `computeFinalAbilities` adds 0 for that burden and the renderer still produces a valid sheet

