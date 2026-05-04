## ADDED Requirements

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
