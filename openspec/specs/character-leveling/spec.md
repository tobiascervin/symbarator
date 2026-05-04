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
- **THEN** the flow asks the player to pick either an Ability Score Improvement (+2 to one or +1/+1 to two) or a feat from the unified feat catalog (boons, origin feats, and class feats)
- **AND** an ASI mutates the persisted `abilities` directly; a feat appends to the persisted `feats` list
- **AND** these slots appear at character levels 4, 8, 10, 12, 16, and 19 (Symbaroum places one extra slot at L10 vs base 5E)

#### Scenario: Changeling may take Change Self via the unified feat picker
- **WHEN** the new level's table entry contains a `LevelChoice` of kind `asi-or-feat`
- **AND** the character's origin is Changeling
- **THEN** the Origin Feats section of the feat picker contains a Change Self card
- **AND** picking Change Self consumes the same slot (no ASI is granted, no other feat is granted) and is recorded on the character via `feats.push("change-self")`
- **AND** the dialog does NOT render a separate "Change Self" radio option alongside ASI / Feat

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

### Requirement: The level-up spell picker SHALL group selectable leveled spells by spell level via tabs

When the level-up flow renders the `spells-learned` step and the character has slots for more than one leveled spell level, the picker MUST present those leveled spells in a tabbed layout — one tab per accessible spell level — so the player can switch between pools without scrolling through a single concatenated list. Cantrips MAY render in a separate flat grid above the tabs.

#### Scenario: Tabs render for each accessible leveled spell level
- **WHEN** a Templar at L5 levels to L6 (1st-level slots: 4, 2nd-level slots: 2)
- **THEN** the leveled-spell area shows a tab labelled "1st" and a tab labelled "2nd"
- **AND** each tab label includes a count of how many spells are visible in that tab

#### Scenario: Switching tabs swaps the visible spell pool
- **WHEN** the user clicks the "2nd" tab
- **THEN** only 2nd-level Theurg spells are visible in the content area
- **AND** clicking "1st" returns to the 1st-level pool

#### Scenario: Empty levels are hidden, not disabled
- **WHEN** the character has zero spells available at a given level (because every spell at that level is already known)
- **THEN** that level's tab is omitted entirely

#### Scenario: Selection count is tracked across tabs
- **WHEN** the player picks a 1st-level spell on the "1st" tab and then switches to "2nd"
- **THEN** the running "X of N chosen" counter reflects the cross-tab total
- **AND** the player can continue picking on the "2nd" tab until the total reaches the required count

### Requirement: The character sheet SHALL group known spells by spell level via tabs

The sheet's spellbook section MUST present the character's known spells in a tabbed view, with one tab per spell level present in `spellPicks` (cantrips included as their own tab labelled "Cantrips"). Each tab MUST display the spell entries with name, school, ritual indicator (if applicable), and the catalog description.

#### Scenario: Sheet renders tabs for known spell levels only
- **WHEN** a character whose `spellPicks.spellsKnown` contains spells at 1st and 2nd level (no 3rd) is viewed on the sheet
- **THEN** the spellbook shows tabs for "Cantrips", "1st", and "2nd"
- **AND** no "3rd" tab is shown

#### Scenario: Default tab is the lowest level present
- **WHEN** the sheet first renders the spellbook
- **THEN** the active tab is "Cantrips" (if any cantrips are known) or otherwise the lowest leveled tab

#### Scenario: Each tab's count badge reflects spells in that tab
- **WHEN** a tab labelled "1st" is rendered
- **THEN** its label includes a count badge equal to the number of 1st-level spells in `spellPicks.spellsKnown`

### Requirement: The L1 builder's spell picker SHALL use the same tabbed visual language

When the builder's approach step renders a spell picker for a spellcasting approach (Mystic, Templar, Witch Hunter), the leveled-spell pick MUST use the same tabbed component as the level-up flow. At L1 there is typically only one leveled tab, but the visual structure MUST be consistent so the player learns one mental model.

#### Scenario: Builder picker uses the tab component
- **WHEN** the builder's approach step renders a Mystic spell picker
- **THEN** the leveled-spell selection is presented inside the same `<SpellTabs>` component used at level-up time
- **AND** the rendered tab(s) have a count badge in their label

### Requirement: The character sheet SHALL render feats as a grouped, resolved list

The sheet MUST render `Character.feats` as a structured list with each feat's display name and description resolved from `BOON_BY_ID` in `data/feats.ts`. Special markers (`change-self`, `fighting-style:<id>`) MUST be rendered with human-readable labels in a separate "Special" group. Each feat entry MUST be rendered using the shared `FeatCard` component (sheet-themed, parchment palette), so the visual treatment matches the spell cards and the boons/burdens cards on the same sheet.

#### Scenario: Boons render with name and description as a card
- **WHEN** a character's `feats` array contains the id of a boon (e.g. `archivist`)
- **THEN** the sheet shows a `FeatCard` with the boon's display name and description (looked up from `BOON_BY_ID`)

#### Scenario: Change Self is grouped under Special
- **WHEN** a character's `feats` array contains `change-self`
- **THEN** the sheet shows a `FeatCard` for "Change Self" in a "Special" subsection with a brief PG citation

#### Scenario: Fighting style markers are humanized
- **WHEN** a character's `feats` array contains `fighting-style:archery`
- **THEN** the sheet shows a `FeatCard` for "Fighting Style — Archery" in the "Special" subsection

#### Scenario: Empty feats hide the section
- **WHEN** a character's `feats` array is empty
- **THEN** the sheet does not render the Feats section at all

#### Scenario: Card visual structure matches spell cards
- **WHEN** any feat is rendered on the sheet
- **THEN** the card has a bordered container, a display-font name, an optional badge row, and a description row — the same visual structure used by `SpellCard` in display mode

### Requirement: The level-up known-spell swap SHALL be reversible from within the dialog

When the level-up flow's `spells-learned` step renders the optional "swap a known spell" picker, the player MUST be able to return either or both of the swap fields (swap-out, swap-in) to the unset state without closing the level-up dialog. The picker MUST expose a clear affordance whenever at least one of the two swap fields is set, and activating it MUST reset both fields to undefined so the answer represents "no swap."

#### Scenario: Clear control appears once a swap value is chosen
- **WHEN** the player has selected a value in the swap-out select (or the swap-in select) but not yet confirmed the level-up
- **THEN** a "Clear swap" control is visible alongside the two swap selects
- **AND** the control is hidden when both swap fields are unset

#### Scenario: Clearing resets the swap to no-op
- **WHEN** the player activates the clear control after picking a swap-out value
- **THEN** the answer's `swappedSpellOut` and `swappedSpellIn` are both undefined
- **AND** the swap selects display their placeholder text again
- **AND** the player can confirm the level-up without performing any swap

#### Scenario: Clearing does not affect new-spell or new-cantrip picks
- **WHEN** the player has selected new spells/cantrips for the level and also started a swap
- **AND** the player activates the clear control
- **THEN** only the swap fields reset; the new-spell and new-cantrip selections in the same step remain intact

### Requirement: The feat catalog SHALL distinguish boons, origin feats, and class feats

The static feat data MUST be a single unified catalog where each entry declares a `category: "boon" | "origin" | "class"`. Origin feats MUST declare an `origins: ReadonlyArray<OriginId>` listing the origins that may take them (PG p. 153 lists Shadow-sight for Abducted/Humans, Change Self for Changelings, Retribution for Dwarves, Ancient Magic for Elves, Tough and Stringy for Goblins, Big-boned for Ogres, Robust for Trolls, Ravenous Hunger for Undead). Class feats MUST declare a `classId: ClassId` and MAY declare any of `approachId`, `minClassLevel`, `minAbilityScores`, `minSpellcastingAbility`, and `excludesFeatIds` per the PG-stated prerequisite for that feat. Boons MUST NOT declare any of `origins`, `classId`, or `approachId`.

The catalog MUST cover at minimum the canonical PG entries: 36 boons (already shipped), 8 origin feats per PG p. 153, and the per-class lists from PG p. 155–157 — Captain (Battle Speech, Command Expert, Parry); Hunter (Overwatch, Ranged Expert, Trick Shot); Mystic (Combat Magic Expert, Confessor, Dedicated Focus, Demonologist, Extensive Learning, Inquisitor, Necromancer, Pyromancer, Secrets of the Order); Scoundrel (Nimble, Shadow Walker, Skirmish Expert); Warrior (Bull Rush, Grappler, Melee Expert).

A unified `FEAT_BY_ID` lookup MUST resolve every catalog id, including `"change-self"`. The legacy `BOON_BY_ID` MAY be re-exported as a filtered view of `FEAT_BY_ID` to avoid churning L1-only call sites; if so, it MUST contain only `category: "boon"` entries.

#### Scenario: Origin-feat entries declare their origins

- **WHEN** the test suite reads the catalog entry for `change-self`
- **THEN** `category` is `"origin"` and `origins` contains exactly `"changeling"`

#### Scenario: Class-feat entries declare their class and any approach gate

- **WHEN** the test suite reads the catalog entry for Confessor
- **THEN** `category` is `"class"`, `classId` is `"mystic"`, `approachId` is `"theurg"`, and `minClassLevel` is `11`

#### Scenario: Class-feat entries with ability prerequisites declare them structurally

- **WHEN** the test suite reads the catalog entry for Grappler
- **THEN** `classId` is `"warrior"` and `minAbilityScores.str === 13`

#### Scenario: Mutually exclusive class feats reference each other

- **WHEN** the test suite reads the catalog entries for Confessor and Inquisitor
- **THEN** Confessor's `excludesFeatIds` contains `"inquisitor"` and Inquisitor's `excludesFeatIds` contains `"confessor"`

### Requirement: The level-up `asi-or-feat` step SHALL render available feats as a card grid sectioned by category

When the level-up flow displays the `asi-or-feat` step in feat mode, the picker MUST render every catalog entry visible to the character as a clickable card mirroring the L1 boons step's visual: name, optional ability-bonus badge, prerequisite text (when present), and full description, all visible without selecting the card. The picker MUST group cards into three labelled sections in this order: **Boons** (every `category: "boon"` entry not forbidden by the character's origin), **Origin Feats** (every `category: "origin"` entry whose `origins` includes the character's origin), and **Class Feats** (every `category: "class"` entry matching the character's `classId`, further filtered by `approachId` when set on the entry). Sections MUST be omitted when they would contain zero cards. The picker MUST NOT render a flat `<select>` / `<combobox>` for feats.

The L1 boons step in `components/builder/boons-burdens-step.tsx` and this level-up picker SHOULD share the same card component so the visual stays in lock-step.

#### Scenario: Picker renders three sections for a Warrior with origin feats and class feats

- **WHEN** a Warrior/Berserker Goblin at L3 reaches the L4 ASI/feat step in feat mode
- **THEN** the picker shows a "Boons" section with every non-forbidden boon, an "Origin Feats" section containing exactly one card (Tough and Stringy), and a "Class Feats" section containing the Warrior class feats (Bull Rush, Grappler, Melee Expert)
- **AND** none of the cards is rendered as a `<select>` option
- **AND** Skirmish Expert (a Scoundrel feat per PG p. 156) MUST NOT appear in the Class Feats section

#### Scenario: Approach-gated class feats are filtered out for the wrong approach

- **WHEN** a Mystic/Sorcerer at L7 reaches an ASI/feat step
- **THEN** the Class Feats section includes Demonologist (Sorcerer-gated) and excludes Pyromancer (Wizard-gated) and Secrets of the Order (Staff Mage-gated)

#### Scenario: Sections with no entries are omitted

- **WHEN** a Captain Human at L4 reaches an ASI/feat step
- **THEN** the picker shows the Boons and Class Feats sections, and omits the Origin Feats section because Humans have no origin feat per PG p. 153 (Abducted-only)

#### Scenario: Picker visual matches the L1 boons step

- **WHEN** any feat card is rendered in either the L1 boons step or the level-up picker
- **THEN** both surfaces use the same card component, badges, and disabled-state styling
- **AND** snapshot drift between the two is detectable by reading the same component identifier in tests

### Requirement: Cards for feats with unmet prerequisites SHALL render disabled with the specific reason

A feat card MUST render in a visibly disabled state (dashed border + reduced opacity + `aria-disabled="true"`, matching the L1 step's forbidden-boon affordance) when any of the following hold for the current character at the moment of leveling: an `minAbilityScores` entry is unmet against `Character.abilities`; `minSpellcastingAbility` is unmet against the approach's spellcasting ability score; `minClassLevel` is greater than the target level; an entry in `excludesFeatIds` is already in `Character.feats`; the character's origin appears in `forbiddenOriginIds`; or the feat is already in `Character.feats` (one-shot feats only). Each disabled card MUST display a one-line reason explaining *why* it is disabled (e.g. "Requires Strength 13 — you have 12", "Requires Theurg approach", "Already taken").

Disabled cards MUST NOT be selectable; clicking or pressing Enter/Space on them MUST be a no-op and MUST NOT record a feat answer.

#### Scenario: Ability prerequisite displayed and enforced

- **WHEN** a Warrior/Berserker character with `str: 12` views the Grappler card in the level-up picker
- **THEN** Grappler is rendered with the disabled affordance and the reason text "Requires Strength 13 — you have 12"
- **AND** clicking Grappler does not change the answer state

#### Scenario: Class-level prerequisite displayed and enforced

- **WHEN** a Mystic/Theurg leveling from 9 to 10 views the Confessor card
- **THEN** Confessor is rendered disabled with reason "Requires class level 11"

#### Scenario: Mutual exclusion between Confessor and Inquisitor

- **WHEN** a character whose `feats` already contains `"confessor"` views the level-up picker
- **THEN** the Inquisitor card is disabled with reason citing the conflict
- **AND** the validator rejects an answer with `featId: "inquisitor"`

#### Scenario: Already-taken feat is disabled

- **WHEN** a character whose `feats` already contains `"melee-expert"` reaches another ASI/feat slot
- **THEN** the Melee Expert card is rendered disabled with reason "Already taken"

### Requirement: Validation SHALL gate the chosen feat by origin, class, approach, level, and ability prerequisites

`validateChoiceAnswer` for an `asi-or-feat` answer with `pick.type === "feat"` MUST resolve `pick.featId` against the unified feat catalog and reject the answer with a user-facing error string when any declared gate (`origins`, `classId`, `approachId`, `minClassLevel`, `minAbilityScores`, `minSpellcastingAbility`, `excludesFeatIds`, `forbiddenOriginIds`) is unmet. Ability gates MUST be evaluated against the character's abilities *before* applying any pending answer in the same level-up — picking a feat does not get to claim ASI gains earned in the same step. An unknown `featId` MUST yield "Pick a feat." (or equivalent), preserving today's behavior for unselected feats.

`applyChoiceAnswer` MUST append `pick.featId` to `Character.feats` for any valid feat answer, regardless of category. No category-specific application logic is permitted in the apply path; the catalog is the single source of truth for what an id represents.

#### Scenario: Origin feat selected by mismatched origin is rejected

- **WHEN** a Warrior/Berserker Dwarf submits an answer with `featId: "change-self"`
- **THEN** validation returns an error citing the origin mismatch
- **AND** the persisted `feats` is unchanged

#### Scenario: Class feat selected by mismatched class is rejected

- **WHEN** a Captain submits an answer with `featId: "grappler"`
- **THEN** validation returns an error citing the class mismatch

#### Scenario: Class feat selected without meeting an ability prerequisite is rejected

- **WHEN** a Warrior/Berserker with `str: 12` submits an answer with `featId: "grappler"`
- **THEN** validation returns an error citing Str 13+ requirement

#### Scenario: Spellcasting-ability prerequisite consults the approach's ability hint

- **WHEN** a Mystic/Wizard whose Int score is 12 submits an answer with `featId: "extensive-learning"`
- **THEN** validation rejects the answer because Wizard's `spellcasting.abilityHint` is `"int"` and Int 12 < 13

#### Scenario: Mutually exclusive feat with prior pick is rejected

- **WHEN** a Mystic/Theurg whose `feats` already contains `"confessor"` submits `featId: "inquisitor"`
- **THEN** validation returns an error citing the mutual exclusion

### Requirement: Change Self SHALL be selected via the unified picker, not a separate radio option

The Changeling-specific "Change Self" option MUST be a normal entry in the feat catalog (`id: "change-self"`, `category: "origin"`, `origins: ["changeling"]`), and MUST be selected through the same `pick.type === "feat"` answer shape used by every other feat. The `LevelChoiceAnswer` discriminated union MUST NOT carry a separate `{ type: "change-self" }` arm. Persisted `Character.feats` containing `"change-self"` from earlier versions MUST continue to resolve via `FEAT_BY_ID` and render as a card on the sheet.

#### Scenario: Changeling sees Change Self in Origin Feats

- **WHEN** a Changeling Scoundrel/Nimble levels to 4
- **THEN** the picker's Origin Feats section contains exactly one card, Change Self
- **AND** the picker has no `change-self` radio option

#### Scenario: Persisted change-self ids resolve on the sheet

- **WHEN** a character whose `feats` array contains `"change-self"` (from before this change) is loaded
- **THEN** the sheet's feat list renders a card with the Change Self name and PG p. 153 description
- **AND** no unresolved-id placeholder is shown

#### Scenario: Non-Changeling cannot pick Change Self

- **WHEN** a Goblin character submits an answer with `featId: "change-self"`
- **THEN** validation returns an error citing the origin mismatch and the answer is rejected
