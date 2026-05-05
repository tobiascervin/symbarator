## ADDED Requirements

### Requirement: The character-sheet header SHALL NOT carry a global Edit link to the wizard

The character-sheet page (`app/characters/[id]/page.tsx`) MUST NOT render a global "Edit" link/button in its header that returns the user to the wizard. The header MUST keep the existing Share, Export JSON, Print, and Level Up actions and MUST NOT replace the Edit affordance with any other global wizard re-entry control. Direct URL navigation to wizard routes (`/builder/<step>?id=<characterId>`) is NOT removed by this requirement; only the in-sheet affordance is removed.

#### Scenario: Sheet header has no Edit button

- **WHEN** any character's sheet at any level is rendered
- **THEN** the page header contains no element whose accessible name is "Edit" linking to `/builder/origin` (or any other wizard route)
- **AND** the Share, Export JSON, Print, and Level Up actions remain present

#### Scenario: Wizard URL still resolves

- **WHEN** the user manually navigates to `/builder/origin?id=<characterId>` for an existing character
- **THEN** the wizard renders normally (this requirement does NOT lock the wizard route)

### Requirement: The character-sheet Abilities panel SHALL expose an in-place editor at character level 1

When `Character.level === 1`, the sheet's Abilities panel MUST render a pencil-icon trigger inside the panel's section header (in the same `action` slot the Combat panel uses for its rucksack). Tapping the trigger MUST open a modal "Edit Ability Scores" dialog. When `Character.level !== 1`, the trigger MUST NOT render — neither hidden nor disabled — so the dialog is unreachable from the sheet UI.

The trigger MUST meet the touch tap-target floor (44 × 44 CSS px on `pointer: coarse` viewports) consistent with the responsive-layout requirements.

#### Scenario: Pencil icon opens the dialog at L1

- **WHEN** a level-1 character's sheet is rendered
- **THEN** the Abilities panel's section header contains a single icon button with accessible name "Edit ability scores"
- **AND** activating it opens the Edit Ability Scores dialog

#### Scenario: Pencil icon is absent at L≥2

- **WHEN** a level-2 (or higher) character's sheet is rendered
- **THEN** no Edit Ability Scores trigger is rendered in the Abilities panel header
- **AND** no equivalent affordance is rendered elsewhere on the sheet

#### Scenario: Trigger meets touch tap-target floor

- **WHEN** the trigger is inspected on a `pointer: coarse` viewport
- **THEN** its bounding box is at least 44 × 44 CSS pixels

### Requirement: The Edit Ability Scores dialog SHALL host every input that contributes to `computeFinalAbilities`

The dialog MUST present, in one surface:

- A method tabset matching `Character.abilityMethod` ∈ `{ "standard-array", "point-buy", "manual" }`. Switching tabs MUST update `Character.abilityMethod` on save and MUST seed the dialog's draft `abilities` per the corresponding default (standard array `[15, 14, 13, 12, 10, 8]`, point-buy all-8, manual leaves the current values).
- A base-score editor for the active method, identical in mechanics to the wizard's pickers: Standard Array (assign-by-swap, all six values consumed exactly once), Point Buy (range 8–15, exact 27-point budget), Manual (range 3–20, free entry).
- A floating-ASI allocator for the character's origin if and only if the origin declares `asi.floating` (count × size > 0). The allocator MUST honor `asi.floating.from` when present (only abilities in the list accept points). The total allocated MUST equal `count × size` to satisfy validation.
- An inline ability picker for every choice-boon currently in `Character.boons` whose `abilityBonus.ability === "choice"`. Each picker writes to `Character.boonAbilityChoices[boonId]`.
- An inline ability picker for every burden currently in `Character.burdens` whose bonus is `kind: "choose-one"` or `kind: "choose-two"`. Each picker writes to `Character.burdenAbilityChoices[burdenId]` with the appropriate length (1 or 2).
- A read-only summary of fixed origin ASI and origin-subchoice ASI so the player can see *all* contributors even when they cannot be edited from this surface.
- A "Final Ability Scores" readout sourced from `computeFinalAbilities(draft)` that updates live as any of the above inputs changes. The readout MUST display, per ability: total, base, summed bonus (if non-zero), and modifier — matching the wizard's Final Ability Scores card visually.

The dialog MUST NOT expose pickers for selecting (or unselecting) the boons or burdens themselves, nor for changing origin / subchoice / class / approach / fighting style / known spells.

#### Scenario: Dialog renders the right method tab

- **WHEN** the dialog opens for a character with `abilityMethod: "point-buy"`
- **THEN** the Point Buy tab is active and the Standard Array / Manual tabs are inactive but available
- **AND** switching to Standard Array seeds the draft to `[15, 14, 13, 12, 10, 8]` permuted by the existing `c.abilities` (or the canonical default if no permutation matches)

#### Scenario: Floating ASI is editable when the origin declares one

- **WHEN** a Human character (which has a floating ASI per origin definition) opens the dialog
- **THEN** the dialog renders a floating-ASI allocator showing the origin's `count × size` target
- **AND** the allocator only enables `+` for abilities in `asi.floating.from` (when set)

#### Scenario: Choice-boon ability is editable

- **WHEN** a character with the Blood Ties boon (choice-boon, `abilityBonusChoices: ["str", "dex", "con", "int", "wis", "cha"]`) opens the dialog
- **THEN** the dialog renders an ability picker for the boon
- **AND** changing the picker updates `Character.boonAbilityChoices["blood-ties"]` in the draft

#### Scenario: Choose-two burden picks are editable

- **WHEN** a character with the Dark Blood burden (`kind: "choose-two"`) opens the dialog
- **THEN** the dialog renders a 2-of-6 ability picker preselected to the character's existing two picks
- **AND** changing one pick updates the corresponding entry in `Character.burdenAbilityChoices["dark-blood"]`

#### Scenario: Final Ability Scores match the sheet's Abilities panel

- **WHEN** any input in the dialog changes
- **THEN** the dialog's Final Ability Scores readout for each ability equals `computeFinalAbilities(draft).total[ability]`
- **AND** when the dialog Saves, the sheet's Abilities panel re-renders with the same totals — no second source of truth

#### Scenario: Dialog does NOT offer to swap boons / burdens / origin / class

- **WHEN** the dialog is open at any time
- **THEN** the dialog renders no controls to add, remove, or swap the character's selected boon or burden, origin, subchoice, class, approach, fighting style, or known spells

### Requirement: The dialog SHALL gate Save with the same validation rules the wizard enforces

A `validateAbilityEdit(c): { ok: true } | { ok: false; reason: string }` helper MUST consolidate the four checks the dialog needs:

1. `validateStep("origin", c)` — total floating-ASI matches `count × size` and respects `from:`.
2. Point-buy budget exact at 27 when `c.abilityMethod === "point-buy"` (defensive — even if the UI prevents over-budget, hand-edited JSON or method-tab churn must not slip through).
3. Standard-array permutation complete when `c.abilityMethod === "standard-array"` (each of `[15, 14, 13, 12, 10, 8]` used exactly once).
4. `validateStep("boons-burdens", c)` — every choice-boon and choose-one/choose-two burden has its ability picks made.

The dialog's Save button MUST be disabled while `validateAbilityEdit(draft)` returns `ok: false`. The reason string MUST be displayed inline near the Save button so the player understands what to fix. Cancel MUST always be enabled. Closing the dialog (Escape, overlay click, Cancel) MUST discard the draft without persisting.

#### Scenario: Save is disabled with point-buy over budget

- **WHEN** the dialog is open in Point Buy mode and the draft's total cost exceeds 27 (e.g. via JSON-edited entry that the UI didn't catch)
- **THEN** Save is disabled and a message indicates "Point-buy budget exceeded" (or equivalent)

#### Scenario: Save is disabled with incomplete floating-ASI allocation

- **WHEN** a Human character's draft has only 1 of 2 floating ASI points allocated
- **THEN** Save is disabled and the reason cites the allocation gap

#### Scenario: Save is disabled when a choice-boon's ability is unset

- **WHEN** the character has the Blood Ties boon but the draft `boonAbilityChoices["blood-ties"]` is undefined
- **THEN** Save is disabled and the reason cites the missing pick

#### Scenario: Save persists the draft and closes the dialog

- **WHEN** the draft is valid and the player clicks Save
- **THEN** the persisted character's `abilities`, `abilityMethod`, `originAsiAllocation`, `boonAbilityChoices`, and `burdenAbilityChoices` are updated atomically
- **AND** the dialog closes
- **AND** the sheet re-renders with the new totals

#### Scenario: Cancel discards the draft

- **WHEN** the player makes any edits in the dialog and clicks Cancel (or closes via Escape / overlay click)
- **THEN** the persisted character is unchanged
- **AND** re-opening the dialog shows the pre-edit values

### Requirement: Wizard pickers SHALL be factored into shared components reused by the dialog

The wizard's `StandardArrayPicker`, `PointBuyPicker`, and `ManualPicker` (currently inline in `components/builder/abilities-step.tsx`), the floating-ASI allocator (currently inline in `components/builder/origin-step.tsx`), and the boon / burden ability-choice pickers (currently inline in `components/builder/boons-burdens-step.tsx`) MUST be factored into shared components consumed by both the wizard and the new sheet dialog. The shared components MUST accept a value-and-onChange prop pair (or equivalent) so they can drive either a `useDraft` hook or a local React-state draft without coupling to one or the other.

The wizard's behavior at L1 MUST be unchanged after the factoring — Playwright wizard scenarios that pass before the factoring MUST pass after. No new visual deviations are permitted.

#### Scenario: Wizard's Abilities step still passes its existing Playwright scenarios

- **WHEN** the existing Playwright wizard tests run after the factoring
- **THEN** all Abilities-step scenarios pass without modification
- **AND** the Wizard's Final Ability Scores card visual is unchanged at desktop and mobile widths

#### Scenario: Dialog and wizard share the standard-array picker

- **WHEN** the test suite reads the import graph for the standard-array picker
- **THEN** both `components/builder/abilities-step.tsx` and the new sheet dialog import the same `StandardArrayPicker` component
- **AND** no duplicated implementation exists in the dialog file
