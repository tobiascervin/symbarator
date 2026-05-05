## Why

The app's three primary surfaces — the Home page (`app/page.tsx`), the 7-step Wizard (`components/builder/*` under `wizard-shell.tsx`), and the Character Sheet (`components/sheet/character-sheet.tsx`) — were laid out for desktop, with mobile considered only piecewise. Several concrete gaps surface on a 360–414px phone viewport today:

- **No `viewport` export in `app/layout.tsx`.** Without `width=device-width, initial-scale=1`, mobile browsers fall back to a desktop-width viewport and zoom out, making everything tiny and breaking tap targets system-wide.
- **The character sheet's display name and section headers** use a 3.5em blackletter face (`app/globals.css:201`) that overflows the 360px viewport on long names and pushes the header past the screen edge.
- **The level-up dialog** (`components/level-up/level-up-dialog.tsx:83`) clamps to `sm:max-w-2xl` with an inner `max-h-[60vh]` scroller, but its modal content (ASI allocators, fighting-style picker, spell tabs) packs side-by-side controls that are cramped and hard to tap on phones.
- **Bottom navigation in the wizard** (`wizard-shell.tsx:127`) is a single horizontal flex row with a "Continue → {next step name}" label — long step names like "Skills & Equipment" overflow the row on narrow widths.
- **Tap targets** on the sheet's HP / corruption +/- buttons, the death-saves toggles, and the sheet's section "Inventory" rucksack action are sized for cursor input. Many fall below the 44×44 CSS-pixel mobile minimum.
- **Sheet inventory and weapon-attack popovers** anchor to a desktop position; on phones the popover can render off-screen or overlap the trigger.

The user has asked for a layout that supports mobile. The bar is "every existing flow works correctly on a phone" — not a separate mobile shell or a redesign. We commit to phone-readiness for the Home, Wizard, Sheet, Level-up, Inventory, and Changelog surfaces, plus the universal scaffolding (viewport, type ramp, tap targets) underneath them.

## What Changes

- Add a Next.js `viewport` export to `app/layout.tsx` setting `width=device-width, initialScale=1, viewportFit=cover` so the app renders at the device's CSS pixel width.
- Audit and fix every screen for **horizontal overflow at 360 px** — the lowest reasonable Android phone width. No view may produce a horizontal scrollbar at that width with the default font scale.
- Establish minimum tap-target dimensions (≥ 44×44 CSS px on touch viewports) for interactive sheet controls — HP +/-, corruption +/-, death-saves toggles, "Inventory" trigger, feat-card and spell-card touches, level-up controls.
- Make the **character sheet header** wrap and rescale: the display-name title shrinks from `3.5em` → a clamped fluid size at narrow widths; the meta line wraps into a stack instead of a long inline run.
- Restructure the **sheet's primary grid** so the right-column companion panels (HP, Corruption, Skills shortcuts) appear *above* the abilities/skills/features content on small screens, not after, so phone users see live combat state without scrolling past the static blocks.
- Make the **level-up dialog** full-height-friendly on phones: full-screen sheet behavior at < `sm`, vertical-stacked footer buttons, and tabbed sub-pickers (spell levels, fighting style) expanded for thumb reach.
- Make the **wizard's bottom navigation** stack vertically below `sm`, with the Continue button full-width and the next-step label allowed to wrap.
- Ensure the **Inventory modal**, **Feat-tap popover**, **Weapon-attack popover**, and **Spell popover** open as bottom-anchored sheets on phones rather than centered dialogs.
- The **Home page**'s character cards, "Forge a New Hero" CTA, and "Paste a share link" form already stack vertically at `sm:`. Verify behavior at 360 px and tighten card inner padding so action buttons don't overflow.
- Document the breakpoints used (`sm = 640px`, `md = 768px`, `lg = 1024px` per Tailwind v4 defaults) and pin minimum-supported viewport at **320 px** (iPhone SE) for graceful behavior even though primary target is **360 px**.

This is a UX/styling pass. **No `Character` schema change**, no new data fields, no migrator. Per `CLAUDE.md`'s SemVer rules this is a MINOR bump (additive UX feature; backwards compatible).

## Capabilities

### New Capabilities

- `responsive-layout`: end-to-end mobile-readiness requirements for the app — viewport metadata, no-horizontal-overflow guarantee at 360 px, tap-target minimums, sheet-grid reordering on small screens, dialog/popover bottom-sheet behavior on phones, and wizard-nav stacking. Future surfaces inherit these requirements.

### Modified Capabilities

None. Each existing capability spec (`character-creation`, `character-leveling`, `companion-mode`, `printable-export`) describes *what* its surface presents; the new capability layers *how* those surfaces lay out across viewports without altering the underlying behavioral requirements.

## Impact

- Code: `app/layout.tsx` (viewport export), `app/globals.css` (fluid type ramp, mobile-only utility classes if needed), `components/builder/wizard-shell.tsx` (nav stacking), `components/builder/*-step.tsx` (verify card grids and any `whitespace-nowrap`), `components/sheet/character-sheet.tsx` (grid reorder, header rescale), `components/sheet/companion-panels.tsx` (tap-target sizing), `components/sheet/inventory-modal.tsx`, `components/sheet/feat-tap-popover.tsx`, `components/sheet/weapon-attack-popover.tsx`, plus the new `components/sheet/spell-popover` if relevant, `components/level-up/level-up-dialog.tsx`, and `components/ui/dialog.tsx` if a phone-sheet variant is needed.
- Tests: Playwright already runs headless Chromium with default viewport. Add a small set of mobile-viewport tests (`page.setViewportSize({ width: 360, height: 800 })`) covering: home loads with no horizontal scroll, wizard step 1 advances on mobile, sheet renders without horizontal scroll for a fully-built character, level-up dialog opens and is scrollable on mobile.
- Storage: untouched.
- Print: untouched (`@page` rules already drive print; phone viewport changes do not affect print output).
- User-facing: phone users get a working app. Desktop visuals are unchanged at `≥ md` widths.
