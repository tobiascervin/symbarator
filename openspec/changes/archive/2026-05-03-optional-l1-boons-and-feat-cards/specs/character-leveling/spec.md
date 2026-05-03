## MODIFIED Requirements

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
