## ADDED Requirements

### Requirement: The shared spell list SHALL group spells into one collapsible section per spell level

The shared `<SpellTabs>` component (`components/spells/spell-tabs.tsx`), used by character creation, the level-up dialog, and the companion sheet, MUST render every visible spell level as its own collapsible section rather than as one tab in a tab strip. Each section MUST be implemented with the project's `<Collapsible>` primitive (`components/ui/collapsible.tsx`) and consist of a clickable trigger header and a content panel.

The grouping logic — which levels are visible, the per-level sort, and the level labels (`"Cantrips"`, `"1st"`, `"2nd"`, …) — MUST match what the tab implementation produced. Empty levels MUST NOT render a section.

#### Scenario: One collapsible section per accessible level

- **WHEN** `<SpellTabs>` is rendered with `levels=[0, 1, 2, 3]` and a non-empty spell list per level
- **THEN** the DOM contains four collapsible sections, in ascending level order, with header labels `"Cantrips"`, `"1st"`, `"2nd"`, `"3rd"`
- **AND** no `[role="tablist"]` element is present

#### Scenario: Empty level is hidden

- **WHEN** `<SpellTabs>` is rendered with a `levels` entry that has zero spells in the spell list
- **THEN** that level renders no collapsible section at all

### Requirement: All sections SHALL be expanded by default

When `<SpellTabs>` first renders (initial mount of the component, including each time the level-up dialog is opened or the wizard step is re-mounted), every visible level section MUST start in the expanded (`open`) state so the player sees the entire accessible catalog without any clicks.

Collapse state MUST be local component state. It MUST NOT be persisted to `Character`, to local storage, or across re-mounts of the component.

#### Scenario: Sections start expanded

- **WHEN** the level-up dialog is opened for a Mystic with access to spell levels 1–4
- **THEN** the trigger button for each of "1st", "2nd", "3rd", "4th" reports `aria-expanded="true"`
- **AND** every section's content panel is visible in the layout

#### Scenario: Re-mounting resets collapse state

- **WHEN** the player collapses the "1st" section, then closes and re-opens the level-up dialog
- **THEN** every section, including "1st", is expanded again

### Requirement: Each section header SHALL toggle that section's content via click or keyboard

Each level section's trigger MUST be a focusable, button-shaped control. Activating the trigger via mouse click, Enter, or Space MUST toggle that section between expanded and collapsed without affecting any sibling section's state.

The trigger MUST expose `aria-expanded` reflecting the current state.

#### Scenario: Click collapses one section without affecting siblings

- **WHEN** all four sections are expanded and the player clicks the "Cantrips" header
- **THEN** the "Cantrips" trigger reports `aria-expanded="false"` and its content panel is hidden
- **AND** the "1st", "2nd", and "3rd" triggers remain `aria-expanded="true"` with visible content

#### Scenario: Keyboard activation toggles the section

- **WHEN** the "2nd" trigger is keyboard-focused and the player presses Space (or Enter)
- **THEN** that section toggles its expanded state (collapsed → expanded or expanded → collapsed)
- **AND** focus stays on the trigger

### Requirement: Each section header SHALL show the total spell count for that level

Every collapsible header MUST display a count badge with the number of spells in that level's content panel. This badge MUST update reactively when the `spells` prop changes (e.g., the player switches tradition in the wizard before reaching the picker). The badge MUST be visible whether the section is expanded or collapsed.

#### Scenario: Total-count badge reflects the per-level spell count

- **WHEN** the "1st" section contains 12 spells from the current tradition
- **THEN** the "1st" header displays a count badge with the text `12`

#### Scenario: Badge stays visible when section collapses

- **WHEN** the player collapses the "1st" section
- **THEN** the count badge `12` is still rendered next to the level label

### Requirement: In picker mode, each header SHALL show how many of the player's current picks live in that level

When `<SpellTabs>` is rendered in picker mode (`mode.kind === "picker"`), every header whose level contains one or more spells in `mode.selected` MUST show an additional "selected" badge with the count of selected spells in that level. When the count is zero, the selected badge MUST NOT render.

The selected badge MUST be visually distinguishable from the total-count badge (e.g., primary fill vs. secondary fill).

In display mode (`mode.kind === "display"`), no selected badge is rendered.

#### Scenario: Selected badge counts only that level's picks

- **WHEN** the player has selected 2 spells at 1st level and 1 spell at 2nd level
- **THEN** the "1st" header displays a selected badge `2` and the "2nd" header displays a selected badge `1`
- **AND** other level headers (e.g., "Cantrips", "3rd") display no selected badge

#### Scenario: Selected badge persists when section is collapsed

- **WHEN** the player collapses the "1st" section after selecting 2 first-level spells
- **THEN** the selected badge `2` on the "1st" header is still rendered

#### Scenario: Display mode renders no selected badge

- **WHEN** `<SpellTabs>` is rendered in display mode on the companion sheet
- **THEN** no header displays a selected badge regardless of the character's prepared/known spells

### Requirement: Per-section scrolling SHALL be preserved

Each section's content panel MUST cap its visible height and scroll internally when the spell grid exceeds that height (matching the existing `max-h-72 overflow-y-auto` behavior of the tabs implementation). A single very-large level MUST NOT cause the dialog or sheet to scroll its outer chrome out of view.

#### Scenario: Large level scrolls within its own section

- **WHEN** the "1st" section contains 40 spells (more than fits in the visible cap)
- **THEN** the "1st" content panel renders an internal vertical scroll
- **AND** the "Cantrips" section above and "2nd" section below stay visible without forcing the outer dialog to scroll past them
