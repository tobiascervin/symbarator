## ADDED Requirements

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

## MODIFIED Requirements

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

### Requirement: The character sheet SHALL render Boons and Burdens

The sheet MUST surface `Character.boons` and `Character.burdens` as their own visible sections, separately from the level-up `Character.feats`. Each entry MUST be rendered using the shared `FeatCard` component (sheet-themed, parchment palette) so the visual treatment matches the spell cards rendered in the same sheet. Each card MUST display the resolved name (via `BOON_BY_ID` / `BURDEN_BY_ID`) and description. Choice-boons MUST also display the chosen ability as a badge.

#### Scenario: Boons section renders one card per boon
- **WHEN** a character with `boons: ["archivist", "augur"]` is viewed (hand-edited; the wizard caps at 1, but compute and render must tolerate >1)
- **THEN** the sheet shows two cards rendered by `FeatCard`, each with the boon's display name and description

#### Scenario: Choice-boons display the chosen ability as a badge
- **WHEN** a character with `boons: ["wild-talent"]` and `boonAbilityChoices: { "wild-talent": "cha" }` is viewed
- **THEN** the wild-talent card includes a badge labelled "+1 CHA"

#### Scenario: Burdens section renders separately
- **WHEN** a character with `burdens: ["haunted"]` is viewed
- **THEN** the sheet shows a "Burdens" section with the haunted entry rendered by `FeatCard`; this is NOT mixed into Boons or Feats

#### Scenario: Empty boons and empty burdens hide their sections
- **WHEN** a character has `boons: []` and `burdens: []`
- **THEN** neither section is rendered (no empty headings)

#### Scenario: Card visual structure matches spell cards
- **WHEN** any boon or burden is rendered on the sheet
- **THEN** the card has a bordered container, a display-font name, an optional badge row, and a description row — the same visual structure used by `SpellCard` in display mode
