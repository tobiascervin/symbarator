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

### Requirement: Templar L1 spell picker SHALL surface granted spells as read-only

When the wizard's approach step renders the spell picker for an approach whose `spellcasting.alwaysKnownSpells` is non-empty (currently the Templar), the picker MUST display each granted spell as a read-only "Always known" entry above (or alongside, but visually distinct from) the choice budgets for cantrips and leveled spells. The granted entry MUST NOT be selectable, MUST NOT consume a pick, and MUST NOT be included in the persisted `Character.spellPicks.cantrips` or `Character.spellPicks.spellsKnown`.

#### Scenario: Templar approach step shows bless as always-known
- **WHEN** a player selects the Templar approach in the wizard
- **THEN** the spell picker displays `Bless` in an "Always known" section that visually communicates it is granted, not chosen
- **AND** the cantrip picker still requires exactly 2 cantrips and the leveled-spell picker still requires exactly 1 first-level spell, with their respective remaining-picks counters unaffected by the granted bless

#### Scenario: Granted spells are not persisted to spellPicks
- **WHEN** a Templar character completes the approach step with the picker's required cantrip and spell picks
- **THEN** `Character.spellPicks.cantrips` contains exactly the 2 player-chosen cantrip ids
- **AND** `Character.spellPicks.spellsKnown` contains exactly the 1 player-chosen leveled-spell id
- **AND** neither array contains `"bless"` (unless the player happened to also pick it explicitly, which is allowed but non-canonical)

#### Scenario: Validation passes without picking bless
- **WHEN** a Templar character has picked exactly 2 cantrips and 1 first-level spell, and `"bless"` is in neither `Character.spellPicks.cantrips` nor `Character.spellPicks.spellsKnown`
- **THEN** `validateStep("approach", character)` returns `null` (no error)

### Requirement: Templar character sheet SHALL display granted spells in the spellbook

The character sheet's spellbook (and the printable sheet's spellbook section) MUST include every spell id from the character's approach's `spellcasting.alwaysKnownSpells` in the displayed spell list, in addition to the player-chosen cantrips and spells. Granted spells MUST be visually labelled (e.g. a "Granted" badge) so the player can distinguish them from chosen spells. Granted spells MUST be castable through the standard cast popover (using the character's existing spell slots) the same way chosen spells are.

#### Scenario: Templar sheet shows bless in the 1st-level tab
- **WHEN** a Templar character is rendered on the sheet
- **THEN** the spellbook's 1st-level tab contains a card for `Bless`
- **AND** the bless card carries a "Granted" badge (or an equivalent visual marker)

#### Scenario: Granted spell can be cast like any other known spell
- **WHEN** the player taps the granted bless card on the sheet and confirms casting at 1st level
- **THEN** the cast popover spends one 1st-level slot using the standard cast pipeline
- **AND** the spellbook continues to display bless as known (it is not consumed)

#### Scenario: Printable sheet includes granted spells
- **WHEN** the printable sheet is generated for a Templar character
- **THEN** the printed spellbook section lists `Bless` alongside the player-chosen cantrips and spells

### Requirement: The wizard's abilities step SHALL fold origin sub-choice ASI into its displayed bonus

The "Final Ability Scores" card on `/builder/abilities` (`components/builder/abilities-step.tsx`) MUST include each origin sub-choice's `asi` map in the displayed bonus addend, summed with `origin.asi.fixed` and `originAsiAllocation`. The displayed total MUST equal `base + fixed + floating + subchoice` for every ability, matching the origin portion of what `computeFinalAbilities` produces on the sheet.

The displayed values MUST update reactively when the player navigates back to `/builder/origin` and switches the sub-choice — the abilities step on next visit MUST reflect the new sub-choice's ASI without a full page reload.

#### Scenario: Human → Ambrian sub-choice +1 INT surfaces on the abilities step

- **WHEN** a character with `originId: "human"`, `originSubchoiceId: "ambrian"`, and `originAsiAllocation: { cha: 1 }` is rendered on `/builder/abilities` with Standard Array bases (str:8, dex:10, con:12, int:13, wis:14, cha:15)
- **THEN** the STR cell shows `base 8 +2` and total 10 (origin fixed)
- **AND** the INT cell shows `base 13 +1` and total 14 (sub-choice ASI)
- **AND** the CHA cell shows `base 15 +1` and total 16 (floating)
- **AND** the DEX, CON, and WIS cells show no bonus addend on the base line

#### Scenario: Switching from Ambrian to Barbarian moves the sub-choice bonus

- **WHEN** the player has rendered the abilities step with `originSubchoiceId: "ambrian"` and the INT cell showing `+1`
- **AND** the player navigates back to `/builder/origin` and switches the sub-choice to Barbarian (`asi: { wis: 1 }`)
- **THEN** on returning to `/builder/abilities`, the INT cell no longer shows the `+1` addend
- **AND** the WIS cell now shows `base 14 +1` and total 15

#### Scenario: Origins without sub-choices are unaffected

- **WHEN** a character with an origin that has no `subchoices` (e.g. Abducted Human, Changeling, Dwarf, Elf) is rendered on the abilities step
- **THEN** the displayed bonus per ability equals `origin.asi.fixed[ab] + originAsiAllocation[ab]` exactly
- **AND** no sub-choice term is added

#### Scenario: Wizard preview agrees with the sheet's `computeFinalAbilities`

- **WHEN** any L1 character is rendered on `/builder/abilities` and then has its draft persisted and the sheet rendered
- **THEN** for every ability, `total` displayed on the abilities step (base + fixed + floating + sub-choice) equals the corresponding `computeFinalAbilities(c).total[ab]` minus any boon/burden bonus contributed by `c.boons` and `c.burdens` (which the abilities step does not display since boons and burdens are picked on a later step)

### Requirement: Origin floating-ASI MAY restrict the eligible abilities to a fixed list

`AbilityScoreBoost.floating` MUST support an optional `from: ReadonlyArray<Ability>` field. When set, the player MUST only be able to allocate the floating point(s) to abilities listed in `from`, intersected with whatever the existing `rule` already excludes (e.g. `rule: "any-other"` continues to exclude abilities named in `fixed`). When unset, the existing `rule`-only behavior MUST be preserved.

The Human origin (`origins[*].id === "human"`) MUST declare `floating.from: ["dex", "con", "cha"]`, matching the PG p. 71 rule "Increase Dexterity, Constitution or Charisma by 1." The Human origin MUST be the only origin in `data/origins.ts` to declare `from`; all other origins remain `rule`-only per their respective PG entries.

#### Scenario: Human floating allocator only enables DEX, CON, and CHA

- **WHEN** a player selects the Human origin in the wizard
- **THEN** the floating-allocator cells for DEX, CON, and CHA each have an enabled `+` button
- **AND** the floating-allocator cells for STR, INT, and WIS each have a disabled `+` button (STR because it's fixed; INT and WIS because they are not in `from`)

#### Scenario: Origin step validator rejects out-of-list allocation

- **WHEN** a Human character has `originAsiAllocation: { int: 1 }` (only reachable via hand-edited JSON, since the picker disables the `+` button for INT)
- **THEN** `validateStep("origin", character)` returns an error string indicating the allocation is not allowed

#### Scenario: Origins without `from` keep `any-other` semantics

- **WHEN** a player selects an origin whose `floating` declares `rule: "any-other"` and no `from` (e.g. Abducted Human, Changeling, Dwarf, Elf, Goblin, Ogre, Troll, Undead)
- **THEN** the floating-allocator cells for every ability except those named in `fixed` have enabled `+` buttons
- **AND** the cells for abilities named in `fixed` have disabled `+` buttons

### Requirement: The origin step's allocator SHALL surface the origin's fixed ASI per ability

Each cell in the floating-allocator grid (`components/builder/origin-step.tsx`) MUST display the sum of the origin's `asi.fixed[ab]` and the player's floating allocation as the cell's main `+{value}` number — no separate badge or label. The cell's `+`/`−` buttons MUST modify only the floating portion. Abilities with a fixed bonus but no floating allocation (e.g. Human STR) MUST therefore display the fixed value directly (e.g. `+2`) with the buttons disabled.

#### Scenario: Human STR cell shows `+2` directly

- **WHEN** a player selects the Human origin in the wizard
- **THEN** the floating-allocator's STR cell renders `+2` as its main value (the origin's fixed bonus, folded directly into the displayed value)
- **AND** the cell's `+` and `−` buttons are disabled (STR is in `fixed`, not allocatable)

#### Scenario: Allocating to a non-fixed ability updates the cell value

- **WHEN** a player selects the Human origin and clicks the CHA `+` button
- **THEN** the CHA cell's main value updates from `+0` to `+1`
- **AND** the STR cell's value remains `+2` (the fixed portion is unaffected)

#### Scenario: Abilities ineligible for the floating with no fixed bonus render dimmed

- **WHEN** a player selects the Human origin (whose `floating.from` is `["dex", "con", "cha"]`, excluding INT and WIS)
- **THEN** the INT and WIS cells display `+0` and are visually dimmed
- **AND** their `+` buttons are disabled

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

