## ADDED Requirements

### Requirement: A typed catalog SHALL hold PG-sourced explanations for every weapon and armor property

A static module MUST export three records keyed by the existing union types in `lib/character/types.ts`:

- `WEAPON_FLAG_EXPLANATIONS: Record<WeaponProperty, PropertyExplanation>` covering every member of the `WeaponProperty` union (`finesse`, `light`, `heavy`, `two-handed`, `loading`, `reach`, `deep-impact`, `ensnaring`, `massive`, `restraining`, `returning`, `siege`, `special`, `balanced`, `concealed`, `immobile`).
- `WEAPON_DATA_EXPLANATIONS: Record<WeaponPropertyData["kind"], PropertyExplanation>` covering every parameterized weapon-property kind (`thrown`, `ammunition`, `range`, `versatile`, `area`).
- `ARMOR_FLAG_EXPLANATIONS: Record<ArmorProperty, PropertyExplanation>` covering every member of the `ArmorProperty` union (`concealable`, `cumbersome`, `noisy`).

A separate constant `WEIGHTY_EXPLANATION: PropertyExplanation` MUST be exported for the `ArmorDef.weightyStrMin?` field, since "weighty" is not a member of `ArmorProperty` but is shown as a property label.

`PropertyExplanation` MUST carry: `name: string` (display name in the tooltip header), `pgPage: number` (the Player's Guide page number where the canonical text lives), and `description: string` (the short PG-sourced paragraph). Descriptions MUST be drawn from PG p. 167–168 for weapons and PG p. 171 for armor and MAY be lightly adapted to fit a tooltip but MUST preserve the rule's mechanical meaning.

The catalog being typed as `Record<…, PropertyExplanation>` over the existing union types MUST be sufficient to make a missing entry a TypeScript error at build time.

#### Scenario: WEAPON_FLAG_EXPLANATIONS covers the WeaponProperty union exhaustively

- **WHEN** the test suite imports `WEAPON_FLAG_EXPLANATIONS` and lists its keys
- **THEN** the keys equal the members of the `WeaponProperty` union exactly (no missing entries, no extra entries)

#### Scenario: WEAPON_DATA_EXPLANATIONS covers every parameterized property kind

- **WHEN** the test suite imports `WEAPON_DATA_EXPLANATIONS` and lists its keys
- **THEN** the keys equal `["thrown", "ammunition", "range", "versatile", "area"]` (the union of `WeaponPropertyData["kind"]`)

#### Scenario: ARMOR_FLAG_EXPLANATIONS covers the ArmorProperty union exhaustively

- **WHEN** the test suite imports `ARMOR_FLAG_EXPLANATIONS` and lists its keys
- **THEN** the keys equal `["concealable", "cumbersome", "noisy"]`

#### Scenario: Every entry cites a PG page

- **WHEN** any catalog entry is read
- **THEN** its `pgPage` is a positive integer between 1 and the highest page in the Player's Guide (e.g. ≤ 250)
- **AND** its `description` is a non-empty string

#### Scenario: Every property used by data/equipment.ts is covered

- **WHEN** the test suite walks every entry in `WEAPONS` and `ARMOR` from `data/equipment.ts`
- **THEN** every property in any weapon's `flags` resolves via `WEAPON_FLAG_EXPLANATIONS`
- **AND** every property in any weapon's `properties[].kind` resolves via `WEAPON_DATA_EXPLANATIONS`
- **AND** every property in any armor's `flags` resolves via `ARMOR_FLAG_EXPLANATIONS`
- **AND** every armor with a `weightyStrMin` field resolves via `WEIGHTY_EXPLANATION`

### Requirement: An ExplainableBadge component SHALL render an interactive tooltip for property tags

A new shared component (`ExplainableBadge` or analogous) MUST render a property tag visually identical to the existing shadcn `<Badge variant="secondary">` and MUST attach a tooltip whose content is the matching `PropertyExplanation` from the catalog. The component MUST:

- Show the tooltip on hover and on keyboard focus on `pointer: fine` viewports (the existing Base UI / shadcn `Tooltip` behavior).
- Show the tooltip on tap on `pointer: coarse` viewports by toggling a controlled `open` state. A second tap (on the badge or anywhere outside) MUST close the tooltip.
- Stop click event propagation so tapping the badge inside a Dialog (e.g. the weapon-attack popover) MUST NOT dismiss the parent Dialog.
- Be keyboard-accessible: `role="button"`, `tabIndex={0}`, and Enter/Space toggle the open state.
- Apply the `tap-target` utility (or equivalent) so the badge meets the 44 × 44 CSS-pixel floor on touch viewports.

The tooltip body MUST display the explanation's `name` as a small uppercase header, the `description` as body text, and `PG p. <pgPage>` as a tertiary line so the player can audit the source.

#### Scenario: Hover on desktop reveals the explanation

- **WHEN** a desktop user (`pointer: fine`) hovers a `finesse` badge in the weapon-attack popover
- **THEN** a tooltip becomes visible whose body matches `WEAPON_FLAG_EXPLANATIONS.finesse.description`
- **AND** the tooltip header reads "Finesse" and the footer reads "PG p. 167" (or the actual page from the catalog)

#### Scenario: Tap on touch reveals the same explanation

- **WHEN** a touch user (`pointer: coarse`, e.g. viewport 360×800) taps a `finesse` badge
- **THEN** the same tooltip body becomes visible
- **AND** a second tap (on the badge or outside) closes it

#### Scenario: Tap inside a Dialog does not dismiss the Dialog

- **WHEN** a touch user opens the weapon-attack popover (a Dialog) and taps a property badge inside it
- **THEN** the Dialog remains open
- **AND** only the badge's tooltip toggles

#### Scenario: Keyboard activation toggles the tooltip

- **WHEN** a user tabs to a property badge and presses Enter
- **THEN** the tooltip opens
- **AND** pressing Enter again closes it

### Requirement: The weapon-attack popover SHALL render every property tag through ExplainableBadge

The properties row in `WeaponAttackPopover` (`components/sheet/weapon-attack-popover.tsx`) MUST render each weapon `flag` and each `properties[]` entry as an `ExplainableBadge`. Boolean flags MUST resolve their explanation via `WEAPON_FLAG_EXPLANATIONS[flag]`. Parameterized properties MUST keep their visible label including the parameter (e.g. `thrown (20/60 ft)`) and resolve their explanation via `WEAPON_DATA_EXPLANATIONS[kind]`. The order of badges in the row MUST be: boolean flags (in iteration order of the `Set<WeaponProperty>`) first, then parameterized entries (in array order of `properties`).

The popover's existing visual layout — the "Properties" inline header, the badge spacing, the secondary `Badge` variant — MUST be preserved.

#### Scenario: Dagger's properties are all explainable

- **WHEN** the weapon-attack popover opens for the `dagger` weapon (flags: `finesse`, `light`; properties: `thrown (20/60 ft)`)
- **THEN** the row contains three `ExplainableBadge`s with labels `finesse`, `light`, and `thrown (20/60 ft)`
- **AND** each badge's tooltip resolves to the matching catalog entry

#### Scenario: Versatile parameter persists in the badge label

- **WHEN** the popover opens for `longsword` (versatile 1d10)
- **THEN** the `versatile` badge label reads `versatile (1d10)`
- **AND** its tooltip body is the generic versatile explanation (no parameter mentioned in the description)

#### Scenario: Properties iteration order is stable

- **WHEN** the popover opens for any weapon
- **THEN** boolean flags appear before parameterized properties in the row

### Requirement: The sheet's Armor subsection SHALL render armor as tap-targets that open an ArmorDetailsPopover

The `SheetArmor` block in `components/sheet/character-sheet.tsx` MUST render each worn armor (and the equipped shield, if any) as a `<button>` whose accessible name is `Inspect <armor name>`. Tapping the button MUST open an `ArmorDetailsPopover` Dialog showing the armor's AC formula, weight, optional description, and — for body armor with at least one flag or a `weightyStrMin` value — a property row of `ExplainableBadge` entries. Boolean flags resolve via `ARMOR_FLAG_EXPLANATIONS`; the `weightyStrMin` field, when present, renders as a `weighty (N)` badge that resolves via `WEIGHTY_EXPLANATION`. Body armor with no properties (no flags and no `weightyStrMin`) MUST NOT render an empty property row in the popover. Shields MUST NOT render a property row.

This pattern mirrors the existing `WeaponAttackPopover` flow so a single mental model (`tap any combat item to inspect`) covers weapons and armor.

#### Scenario: Cumbersome armor opens a popover with a single explainable badge

- **WHEN** the sheet renders a character wearing Wolf Skin (flags: `cumbersome`) and the user taps the Wolf Skin row
- **THEN** an `ArmorDetailsPopover` opens with one `ExplainableBadge` labeled `cumbersome`
- **AND** its tooltip body matches `ARMOR_FLAG_EXPLANATIONS.cumbersome.description`

#### Scenario: Field Armor popover shows cumbersome and weighty (13)

- **WHEN** the sheet renders a character wearing Field Armor (flags: `cumbersome`; `weightyStrMin: 13`) and the user taps the Field Armor row
- **THEN** the popover includes badges `cumbersome` and `weighty (13)`
- **AND** the `weighty (13)` badge resolves to `WEIGHTY_EXPLANATION`

#### Scenario: Plain armor popover renders no property row

- **WHEN** the sheet renders a character wearing Studded Leather (no flags, no `weightyStrMin`) and the user taps the row
- **THEN** the popover opens with the AC and weight rows but no property row

#### Scenario: Shield popover renders no property row

- **WHEN** the sheet renders a character with a Shield equipped and the user taps the Shield row
- **THEN** the popover opens with the AC contribution
- **AND** no property row is rendered for the shield
