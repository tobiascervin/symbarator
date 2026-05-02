## ADDED Requirements

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

The sheet MUST render `Character.feats` as a structured list with each feat's display name and description resolved from `BOON_BY_ID` in `data/feats.ts`. Special markers (`change-self`, `fighting-style:<id>`) MUST be rendered with human-readable labels in a separate "Special" group.

#### Scenario: Boons render with name and description
- **WHEN** a character's `feats` array contains the id of a boon (e.g. `archivist`)
- **THEN** the sheet shows a card with the boon's display name and description (looked up from `BOON_BY_ID`)

#### Scenario: Change Self is grouped under Special
- **WHEN** a character's `feats` array contains `change-self`
- **THEN** the sheet shows "Change Self" in a "Special" subsection with a brief PG citation

#### Scenario: Fighting style markers are humanized
- **WHEN** a character's `feats` array contains `fighting-style:archery`
- **THEN** the sheet shows "Fighting Style — Archery" in the "Special" subsection

#### Scenario: Empty feats hide the section
- **WHEN** a character's `feats` array is empty
- **THEN** the sheet does not render the Feats section at all
