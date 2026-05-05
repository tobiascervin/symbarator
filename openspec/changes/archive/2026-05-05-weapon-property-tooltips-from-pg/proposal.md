## Why

Weapon-attack cards in the character sheet (`components/sheet/weapon-attack-popover.tsx:116–131`) and similar surfaces render PG property tags — *finesse*, *light*, *heavy*, *two-handed*, *loading*, *reach*, *thrown (20/60 ft)*, *versatile (1d8)*, *deep impact*, *ensnaring*, *massive*, *restraining*, *returning*, *balanced*, *concealed*, *immobile*, *siege*, *special* — as terse uppercase secondary badges. The intent is correct (the badge text is the right name from the PG), but the player has to leave the app and open the PG to find out what each property does. New players don't know what *deep impact* or *balanced* or *ensnaring* mean; even D&D-experienced players bump on Symbaroum-specific terms that diverge from base 5E.

Armor-property tags have the same shape: *concealable*, *cumbersome*, *noisy*, *weighty (15)* (PG p. 171). They're rendered today through inventory and printable-sheet labels with the same gap.

The fix is small in scope and large in payoff: every property badge becomes a tooltip-bearing affordance whose content is the PG's own one-paragraph definition. Hover on desktop, tap on mobile. No mechanical changes; no schema touch. Players can read what a property does in-context without leaving the sheet.

## What Changes

- Introduce a single static catalog in `data/property-explanations.ts` (or analogous) keyed by the existing `WeaponProperty` enum, the `WeaponPropertyData` `kind` discriminator, and the `ArmorProperty` enum. Each entry stores: a display name (e.g. "Two-Handed"), a short PG description (one paragraph, lifted near-verbatim from PG p. 167–168 for weapons and PG p. 171 for armor), and the PG page reference (e.g. `pgPage: 168`).
- Replace the bare `<Badge>` in the weapon-attack popover's properties row with an `<ExplainableBadge>` (new shared component) that wraps the badge in a Tooltip on hover-capable viewports and a Popover-style click-toggle on touch viewports, sourced from the catalog by property key.
- The same `<ExplainableBadge>` is reused for armor-property labels in the sheet's Armor subsection (currently rendered in `character-sheet.tsx::SheetArmor`) so both use one component and one catalog.
- Parameterized properties (`thrown (20/60 ft)`, `versatile (1d8)`, `ammunition (range 80/320)`, `area (5-ft radius)`, `weighty (15)`) keep their parameter rendering in the badge label and use the explanation for the underlying property kind. The parameter values themselves are not part of the tooltip text — only the property's definition is.
- The catalog ships with PG-sourced text for every entry already present in `WeaponProperty` / `WeaponPropertyData["kind"]` / `ArmorProperty`. Missing entries cause a TypeScript error at build time (the catalog is typed `Record<WeaponProperty, ...>`), so future property additions force a corresponding tooltip text.
- Print output (`components/sheet/printable-sheet.tsx`) is **not** changed — print already lays out properties as flat comma-joined text and the printable surface has no interactive affordances. Tooltips are an on-screen-only feature.
- Per `CLAUDE.md`'s SemVer rules this is a MINOR bump (additive UI feature, no schema break, fully backwards compatible).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-mode`: extends the weapon-attack popover and armor display to render PG-sourced explanations for every property tag via a shared `ExplainableBadge` component, with hover-on-desktop and tap-on-touch interaction parity.

## Impact

- Code: new `data/property-explanations.ts` (typed catalog with PG text), new `components/sheet/explainable-badge.tsx` (the wrapper component), updates to `components/sheet/weapon-attack-popover.tsx` (replace `Badge` with `ExplainableBadge` in the properties row), and `components/sheet/character-sheet.tsx::SheetArmor` (wrap armor-property labels in `ExplainableBadge`). The shadcn `Tooltip` primitive (`components/ui/tooltip.tsx`) is already wired up at the layout level via `<TooltipProvider>` in `app/layout.tsx`.
- For touch interactions: shadcn's `Tooltip` is pointer-only (Base UI Tooltip activates on hover, not tap). We add a tiny click-controlled state in `ExplainableBadge` that toggles the tooltip open on tap so phone users get the same content. Pinch-to-zoom remains unaffected.
- Tests: a Playwright e2e adds: (a) hovering the "finesse" badge inside the weapon-attack popover reveals its PG explanation, (b) tapping the badge on a 360 px viewport opens the same content, (c) every property currently rendered in the popover for a sample loadout has a corresponding entry in the catalog (no missing-key console warning).
- Storage / migration: untouched. No `Character` schema change, no migrator.
- Sheet rendering elsewhere (inventory modal item lists, builder skills-equipment step's weapon hints): out of scope for v1; those are picker affordances that don't surface property badges. If a follow-up wants tooltips in the inventory modal too, the same component drops in.
- Mobile / responsive: aligns with the in-flight responsive-mobile-layout work — the click-toggle behavior on touch viewports is the same pattern that change introduces for other on-sheet controls.
