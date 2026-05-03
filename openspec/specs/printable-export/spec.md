# printable-export Specification

## Purpose
TBD - created by archiving change add-printable-pdf-export. Update Purpose after archive.
## Requirements
### Requirement: A dedicated print route SHALL render a printer-friendly view of any saved character

The app MUST expose `/characters/[id]/print` as a sibling route to `/characters/[id]`. The route MUST load the character via `LocalCharacterStore.load(id)` (the same code path the regular sheet uses) and render `<PrintableSheet character={c} />`. If the character id is unknown, the route MUST render a "character not found" message and a link back to the home route — it MUST NOT throw or render a blank page.

#### Scenario: Print route renders a known character
- **WHEN** the user navigates to `/characters/<known-id>/print`
- **THEN** the page renders the `<PrintableSheet>` populated with that character's static data

#### Scenario: Print route handles unknown character id
- **WHEN** the user navigates to `/characters/<unknown-id>/print`
- **THEN** the page renders a "character not found" message and a link back to home, with no console errors

### Requirement: The print route SHALL opt out of the global app chrome

The print route MUST NOT render the global header / footer / version badge / toaster that the screen routes use. The page MUST contain only the `<PrintableSheet>` content plus a small no-print control bar (a "Print again" button and a "← Back to sheet" link), both hidden under `@media print`.

#### Scenario: Print route omits the app header
- **WHEN** the print route is viewed on screen
- **THEN** the global app header / footer / version badge are NOT rendered above or below the sheet

#### Scenario: Control bar hides when printing
- **WHEN** the page is rendered for the print medium (`@media print`)
- **THEN** elements with `class="no-print"` (the "Print again" button and "← Back" link) are not visible in the printed output

### Requirement: The print route SHALL auto-fire the print dialog on mount

After the page renders, the route MUST call `window.print()` once, after a short delay (≥ 200ms) so custom fonts have time to load before the dialog snapshots the page. If the user dismisses the dialog, a visible "Print again" button MUST re-fire it on click. The route MUST NOT auto-fire `window.print()` more than once per mount.

#### Scenario: Print dialog opens automatically
- **WHEN** the print route mounts in a browser
- **THEN** `window.print()` is invoked exactly once after the paint settle delay

#### Scenario: User can re-fire the dialog manually
- **WHEN** the user clicks the "Print again" button on the print route
- **THEN** `window.print()` is invoked again

### Requirement: The printable sheet SHALL show the static character snapshot

`<PrintableSheet>` MUST render every static field needed to transfer the character to a paper PG sheet:
- Identity: name, pronouns, level, origin (+ subchoice), background, class, approach
- Ability scores with computed modifiers (origin / subchoice / boon bonuses applied)
- Saving throws with proficiency markers and modifiers
- All 18 skills with proficiency markers and modifiers
- Combat stats: max HP, hit die size, proficiency bonus, initiative, speed (in feet), corruption threshold
- Origin features (+ subchoice features), background feature, class L1 features, approach L1 features
- Per-level class features earned through the character's current level
- Per-level approach features earned through the character's current level
- Boons (with full descriptions), burdens (with full descriptions)
- Feats accumulated via level-up (with descriptions where the id resolves)
- Spells known: cantrips and leveled spells, grouped by spell level, displayed as name + level (no description text)
- Equipment: chosen class equipment lines + background equipment summary
- Identity tropes: personality trait, ideal, bond, flaw
- Notes: a "Notes" block reserving space for handwritten additions; renders empty if `c.notes` is blank

#### Scenario: Identity block renders core character info
- **WHEN** any character is rendered in the printable sheet
- **THEN** the identity block contains the character's name, level, origin (+ subchoice), background, class, and approach

#### Scenario: Skills list shows proficiency markers
- **WHEN** any character is rendered in the printable sheet
- **THEN** all 18 skill rows render with a proficiency marker (filled vs outlined) and the computed modifier

#### Scenario: Spells render as name + level only
- **WHEN** a spellcasting character is rendered in the printable sheet
- **THEN** known cantrips and leveled spells appear in a compact list grouped by spell level, showing only the spell name (no description text)

#### Scenario: Notes block reserves space when blank
- **WHEN** a character with empty `c.notes` is rendered in the printable sheet
- **THEN** a "Notes" header is present with an empty content area underneath

### Requirement: The printable sheet SHALL omit live companion-mode state

`<PrintableSheet>` MUST NOT render `currentHp`, `tempHp`, `currentSpellSlots`, `hitDiceRemaining`, or `deathSaves`. The intent of the print is paper transfer of the character snapshot, not a session-state report. Corruption permanent / temporary counters likewise MUST NOT appear — only the computed `Threshold` is printed.

#### Scenario: currentHp does not appear in the printable sheet
- **WHEN** any character is rendered in the printable sheet
- **THEN** `currentHp`, `tempHp`, current-spell-slot counts, `hitDiceRemaining`, and `deathSaves` are NOT shown anywhere on the page

#### Scenario: Only max HP appears for HP-related stats
- **WHEN** any character is rendered in the printable sheet
- **THEN** the combat block shows max HP and hit die size, with no current-HP readout, temp-HP readout, or HD-remaining counter

#### Scenario: Corruption threshold appears, counters do not
- **WHEN** any character is rendered in the printable sheet
- **THEN** the computed Corruption Threshold is shown, and the `corruption.permanent` / `corruption.temporary` counters are NOT shown

### Requirement: The printable sheet SHALL use a paper-friendly visual style

The print stylesheet MUST set page background to white, body text to near-black (`#1d1814`), and remove all gradient / parchment / shadow effects when rendered for print. A single crimson accent color (`#7a1f1f`) MUST be used only as a thin underline rule beneath section headers and on the ornate divider strokes. All interactive controls (buttons, inputs, hover states) MUST be hidden in the printed output. The page MUST default to A4 paper size with `12mm 14mm` margins (`@page` rule); Letter is acceptable as a fallback when the user's print dialog overrides the size.

#### Scenario: Print stylesheet sets white background
- **WHEN** the print route is rendered for the print medium
- **THEN** the body background is white and the body color is near-black

#### Scenario: Section headers use crimson underline only
- **WHEN** any section header is rendered in print
- **THEN** the only colored element on the line is a thin crimson underline (`#7a1f1f`) — no fills, gradients, or shaded backgrounds

#### Scenario: A4 page size is the default
- **WHEN** the page is sent to the printer
- **THEN** the `@page` rule declares `size: A4` with `12mm 14mm` margins

### Requirement: Sections SHALL hint at page-break preferences

Each top-level section card (Identity, Abilities, Skills, Combat, Features, Boons, Burdens, Feats, Spells, Equipment, Notes) MUST set CSS `break-inside: avoid` so the printer does not split a section mid-paragraph. The print MUST NOT enforce specific page breaks — content SHOULD flow naturally.

#### Scenario: Sections use break-inside: avoid
- **WHEN** any printable-sheet section card is rendered
- **THEN** the section element has `break-inside: avoid` applied (so the printer pushes the whole section to the next page rather than splitting it)

### Requirement: The regular sheet SHALL expose a "Print" entry point

`/characters/[id]` MUST display a "Print" link in the existing action bar (next to "Export JSON" / "Level Up"). The link MUST navigate to `/characters/[id]/print` in a new browser tab (`target="_blank"`).

#### Scenario: Print link sits in the action bar
- **WHEN** the regular character sheet is viewed
- **THEN** a "Print" link is visible alongside "Export JSON" and "Level Up"

#### Scenario: Print link opens in a new tab
- **WHEN** the user clicks the "Print" link
- **THEN** the print route opens in a new browser tab (the original sheet tab remains)

### Requirement: A footer SHALL identify the source of the printout

The printable sheet MUST render a small footer line at the bottom of the page reading `Generated by symbarator v<APP_VERSION> on <YYYY-MM-DD>`, in faint grey, suitable for traceability without dominating the page. The version MUST come from `lib/version.ts` (`APP_VERSION`).

#### Scenario: Footer shows version and date
- **WHEN** any character is rendered in the printable sheet
- **THEN** the footer shows `Generated by symbarator vX.Y.Z on YYYY-MM-DD` where `X.Y.Z` matches `package.json#version` and `YYYY-MM-DD` is today's date in ISO format
