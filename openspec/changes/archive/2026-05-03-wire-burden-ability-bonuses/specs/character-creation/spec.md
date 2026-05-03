## ADDED Requirements

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

## MODIFIED Requirements

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
