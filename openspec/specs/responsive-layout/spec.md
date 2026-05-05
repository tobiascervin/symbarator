# responsive-layout Specification

## Purpose

End-to-end mobile-readiness requirements for the app — viewport metadata, no-horizontal-overflow guarantee at 360 px, tap-target minimums, sheet-grid reordering on small screens, dialog/popover bottom-sheet behavior on phones, and wizard-nav stacking. Future surfaces inherit these requirements without needing a per-feature responsive audit.

## Requirements

### Requirement: The application SHALL declare a mobile-friendly viewport

`app/layout.tsx` MUST export a Next 16 `viewport: Viewport` object that sets `width: "device-width"`, `initialScale: 1`, and `viewportFit: "cover"`. The export MUST also declare a `themeColor` matching the parchment cream used by the home and sheet surfaces so iOS Safari's tinted address bar aligns with the page background. The export MUST NOT set `userScalable: false`; pinch-to-zoom MUST remain available as an accessibility lifeline.

#### Scenario: Viewport meta is emitted

- **WHEN** any route is rendered and the response HTML is inspected
- **THEN** the `<head>` contains a `<meta name="viewport">` tag whose content includes `width=device-width`, `initial-scale=1`, and `viewport-fit=cover`

#### Scenario: Pinch-to-zoom remains enabled

- **WHEN** any route is rendered
- **THEN** the viewport meta does NOT include `user-scalable=no` or `maximum-scale=1`

#### Scenario: Theme color matches parchment background

- **WHEN** any route is rendered
- **THEN** the response HTML includes a `<meta name="theme-color">` whose color value matches the parchment background hex used by the sheet's header

### Requirement: Every primary surface SHALL render without horizontal overflow at 360 px viewport width

The Home page (`/`), every Wizard step (`/builder/{step}?id=...`), the Character Sheet (`/characters/{id}`), the Changelog (`/changelog`), and the Import handoff route MUST render with `document.documentElement.scrollWidth` less than or equal to `window.innerWidth` at a viewport size of 360×800 CSS pixels with the document's default font scale. Modals (level-up dialog, inventory modal, feat-tap popover, weapon-attack popover, spell popover) MUST also render without producing a horizontal scrollbar on the viewport when open at the same width.

Surfaces MAY use horizontal scroll *inside* a localized container (e.g. a tab strip or a carousel) so long as the page-level document does not scroll horizontally.

#### Scenario: Home page has no horizontal scroll at 360 px

- **WHEN** the home page is rendered at viewport 360×800 with two saved characters in storage
- **THEN** `document.documentElement.scrollWidth` is less than or equal to `360`

#### Scenario: Character sheet has no horizontal scroll at 360 px

- **WHEN** a fully-built character at L1 (origin Goblin, Warrior/Berserker, full equipment, 2 spells if caster) is rendered on the sheet at viewport 360×800
- **THEN** the document does not scroll horizontally
- **AND** the sheet's display name title wraps within the viewport without truncation cutting off characters

#### Scenario: Level-up dialog open does not introduce horizontal scroll

- **WHEN** the level-up dialog is opened on the sheet at viewport 360×800
- **THEN** the dialog content stays within the viewport horizontally

### Requirement: Touch interactive controls on the sheet SHALL meet a 44×44 CSS-pixel minimum tap area

Every primary interactive control on the character sheet — HP +/- adjusters, Corruption +/- adjusters, Death Saves toggles, the "Inventory" rucksack action, the "Level Up" action, weapon-attack triggers, feat-card touch surfaces, and spell-card touch surfaces — MUST present a hit area of at least 44 × 44 CSS pixels on touch viewports (`@media (pointer: coarse)`). Cursor-only viewports (pointer: fine) MAY use the existing dense sizing.

This is enforced via a single `tap-target` utility class (or equivalent CSS-layer rule). Adding the class to a control MUST be sufficient to satisfy the requirement; controls that already exceed 44 px in their default size MAY omit the class.

#### Scenario: Corruption adjuster is touch-friendly

- **WHEN** the sheet's Corruption +/- buttons are inspected on a touch viewport
- **THEN** each button's bounding box is at least 44 × 44 CSS pixels

#### Scenario: Inventory rucksack is touch-friendly

- **WHEN** the sheet's "Inventory" action is inspected on a touch viewport
- **THEN** its bounding box is at least 44 × 44 CSS pixels

#### Scenario: Cursor viewports are not bloated

- **WHEN** the same controls are inspected on a `pointer: fine` viewport
- **THEN** the controls retain their existing dense sizing and the 44 px floor does NOT apply

### Requirement: The character sheet SHALL prioritize live combat panels above static reference content on small viewports

At viewport widths below the `md` breakpoint (768 px), the sheet MUST render the live combat panels (HP & Vitals, Death Saves when applicable, Corruption) *visually before* the static reference content (Abilities, Skills, Features, Equipment). At `md` and above the existing two-column layout (live panels in the right column, reference content in the dominant left column) MUST be preserved unchanged.

DOM order for assistive technology MUST keep "main content first" — i.e. the visual reordering is allowed to invert via `flex-col-reverse` (or equivalent) without inverting the underlying DOM order. A code comment MUST document this concession.

#### Scenario: Phone viewport shows HP first

- **WHEN** the character sheet is rendered at viewport 360×800
- **THEN** the HP & Vitals panel appears above the Abilities panel in the visual layout

#### Scenario: Desktop viewport keeps the two-column layout

- **WHEN** the character sheet is rendered at viewport 1280×800
- **THEN** the live panels render in the right column and the reference content renders in the left, two-thirds-wide column

#### Scenario: DOM order is preserved across viewports

- **WHEN** the sheet is rendered at any viewport
- **THEN** the DOM order is: static reference content first, live panels second
- **AND** screen-reader linear traversal reaches Abilities before HP regardless of viewport

### Requirement: Modal surfaces SHALL render as a bottom-anchored sheet on small viewports

The level-up dialog, inventory modal, feat-tap popover, weapon-attack popover, and spell popover MUST render as a bottom-anchored sheet on viewports below the `sm` breakpoint (640 px): full width, anchored to the bottom edge, with rounded top corners only, slide-up animation on open, and a maximum height of `100dvh` minus the safe-area inset top. At `sm` and above, the existing centered-dialog rendering MUST be preserved.

This MUST be implemented as a `mobileVariant` opt-in on the shared `DialogContent` primitive (or equivalent) so other dialogs in the codebase can opt in without forking the modal layer.

#### Scenario: Level-up dialog is a bottom sheet on phone

- **WHEN** the level-up dialog opens at viewport 360×800
- **THEN** its element is positioned at the bottom of the viewport with `border-radius` only on the top corners
- **AND** the dialog occupies the full viewport width

#### Scenario: Level-up dialog is centered on desktop

- **WHEN** the level-up dialog opens at viewport 1280×800
- **THEN** its element is positioned in the vertical and horizontal center, with full border-radius and the existing `sm:max-w-2xl` width

#### Scenario: Inventory modal scrolls within the bottom-sheet at phone width

- **WHEN** the inventory modal opens on a character with many items at viewport 360×800
- **THEN** the modal's inner content area scrolls vertically while the sheet header stays pinned at the top of the modal

### Requirement: The wizard's step navigation SHALL stack vertically with the primary action on top at small viewports

At viewport widths below the `sm` breakpoint, the wizard's bottom Back / Continue row MUST stack vertically with the Continue button rendered visually above the Back button (`flex-col-reverse` or equivalent). Both buttons MUST stretch to full container width at this breakpoint. At `sm` and above the row MUST render horizontally with Back at the left, Continue at the right, both at natural width — preserving today's behavior.

#### Scenario: Phone viewport stacks the wizard nav

- **WHEN** any wizard step is rendered at viewport 360×800 with a valid draft loaded
- **THEN** the Continue button renders above the Back button visually, both spanning the full width of the wizard container

#### Scenario: Desktop viewport keeps the row layout

- **WHEN** any wizard step is rendered at viewport 1280×800 with a valid draft loaded
- **THEN** the Back button is left-aligned and the Continue button is right-aligned in a single horizontal row at natural widths

#### Scenario: Continue label may wrap on phone

- **WHEN** the wizard is on a step whose next step has a long label (e.g. "Skills & Equipment") at viewport 360×800
- **THEN** the Continue button label is allowed to wrap to two lines without overflow

### Requirement: The character-sheet display title SHALL scale fluidly between 360 px and the desktop design width

The blackletter display title used by the character-sheet header (and any analogous on-page title) MUST scale fluidly via CSS `clamp()` so that:

- At viewport widths around 360 px the title resolves to approximately `2rem`–`2.6rem`,
- At viewport widths at or above the design target (~1024 px) the title resolves to its existing pre-change size (`3.5em`).

The implementation MUST NOT introduce viewport-listening JavaScript; CSS-only `clamp()` (or `min()` / `max()`) is the chosen mechanism. The clamp upper bound MUST equal the current desktop size so that desktop visuals are unchanged.

#### Scenario: Title is readable on phone

- **WHEN** the character sheet is rendered at viewport 360×800 for a character with a 12-character name
- **THEN** the rendered title's computed `font-size` is between `2rem` and `2.75rem` and the title fits on a single line within the viewport

#### Scenario: Title is unchanged on desktop

- **WHEN** the character sheet is rendered at viewport 1280×800
- **THEN** the rendered title's computed `font-size` is approximately `3.5em` (matching the pre-change static size to within 5%)

### Requirement: Wizard card-grid breakpoints SHALL be standardized

Card-pick grids in wizard steps (Origin, Class, Approach, Background, Boons & Burdens, Skills & Equipment) MUST stack to a single column at viewport widths below the `sm` breakpoint (640 px) and present two columns at `sm` and above. Mixed usage of `md:grid-cols-2` for these grids MUST be migrated to `sm:grid-cols-2` so the "two-column band" begins at the same breakpoint across the wizard.

The Identity step's free-form fields (already mostly single-column) and the Abilities step's six-cell ability grid (already correctly responsive at `grid-cols-3 sm:grid-cols-6`) are out of scope for this requirement.

#### Scenario: Origin step grid is two columns at sm and above

- **WHEN** the Origin step is rendered at viewport 640×800
- **THEN** origin cards lay out in a 2-column grid

#### Scenario: Class step grid is one column at phone width

- **WHEN** the Class step is rendered at viewport 360×800
- **THEN** class cards lay out in a single column

#### Scenario: Background step grid migrates from md:grid-cols-2 to sm:grid-cols-2

- **WHEN** the Background step is rendered at viewport 640×800
- **THEN** background cards lay out in a 2-column grid (no longer waiting for the `md` breakpoint to switch)

### Requirement: Mobile-viewport regression tests SHALL exist for the primary surfaces

The Playwright suite MUST include a dedicated set of mobile-viewport tests using `page.setViewportSize({ width: 360, height: 800 })` covering at minimum: Home page, Wizard step 1 (Origin), Character Sheet for a seeded character, and an open Level-up dialog. Each test MUST assert no horizontal scroll on the document element. The Sheet test MUST additionally assert that the HP panel appears earlier in document layout order than the Abilities panel on phone width but later on desktop width.

These tests MAY live in a single `mobile.spec.ts` (or analogous) file that uses `test.describe("mobile viewport")` with a shared `beforeEach` setting the viewport size — they MUST NOT require a separate Playwright project.

#### Scenario: Home renders without horizontal scroll on mobile

- **WHEN** the mobile spec navigates to `/` at 360×800
- **THEN** the test asserts `document.documentElement.scrollWidth ≤ window.innerWidth`

#### Scenario: Sheet panel order differs by viewport

- **WHEN** the mobile spec navigates to `/characters/<id>` for a seeded character at 360×800
- **THEN** the HP panel's `boundingClientRect.top` is less than the Abilities panel's `boundingClientRect.top`
- **WHEN** the same test re-runs at 1280×800
- **THEN** the HP panel's `boundingClientRect.top` is greater than the Abilities panel's `boundingClientRect.top`

#### Scenario: Level-up dialog opens cleanly on mobile

- **WHEN** the mobile spec opens the level-up dialog at 360×800 for an L1 character that can level
- **THEN** the dialog's bounding box is anchored at the bottom of the viewport
- **AND** the dialog scrolls vertically without producing a horizontal scrollbar
