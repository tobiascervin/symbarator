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
