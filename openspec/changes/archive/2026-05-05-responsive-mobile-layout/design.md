## Context

Tailwind v4 (`@tailwindcss/postcss`) is configured via `app/globals.css` with the default breakpoint scale: `sm: 640`, `md: 768`, `lg: 1024`, `xl: 1280`, `2xl: 1536`. The codebase already uses these prefixes inconsistently — `boons-burdens-step.tsx` uses `sm:grid-cols-2` (cards stack only below 640 px), `class-step.tsx` uses `md:grid-cols-2` (cards stack below 768 px), and `character-sheet.tsx` uses `md:grid-cols-3` for the top-level layout. The sheet's primary grid puts the static content (Abilities, Skills, Features) in `md:col-span-2` (left, dominant) and the live companion panels (HP, Death Saves, Corruption, Inventory trigger) in the remaining column (right). On mobile (< `md`) the grid collapses to one column with companion panels rendering *after* the static content — phone users have to scroll to combat state.

`app/layout.tsx` does not export a `viewport`. Next 16's `Viewport` API is the canonical place to set it; without that, the document inherits the default `<meta name="viewport" content="width=device-width">` Next ships, but `initial-scale`, `viewportFit`, and `themeColor` are not configured. Setting these explicitly is the small "do it once" change that unlocks proper mobile rendering across every route.

`components/ui/dialog.tsx` is shadcn's standard dialog — `fixed top-1/2 left-1/2 ... w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 ... sm:max-w-sm`. On a 360 px viewport this becomes `width: 328px`, centered vertically. The level-up dialog raises that to `sm:max-w-2xl` (672 px) which clamps to viewport - 2rem on phones. The inner `max-h-[60vh]` scroller works but combined with the centered position leaves dead space above and below; on a 800-tall phone, ~35% of the screen is dimmed overlay rather than usable dialog real estate.

The PG-flavored visual language — Cinzel display face at 3.5em for `BlackletterTitle`, ornate dividers, parchment cards — is desktop-first by design. We keep the visual language identical at `≥ md` and only ratchet down sizes on small screens.

Playwright tests run headless Chromium at its default viewport (1280×720). Reproducing mobile bugs requires `page.setViewportSize({ width: 360, height: 800 })` per test, which is cheap.

## Goals / Non-Goals

**Goals:**

- Every primary surface (Home, Wizard steps 1–7, Character Sheet, Level-up Dialog, Inventory Modal, Changelog) renders without **horizontal scroll** at a 360 px CSS-pixel viewport with default font scale.
- Every interactive control on the sheet meets a **44×44 CSS px** minimum tap area on touch devices (`@media (pointer: coarse)`); cursor-only viewports are unaffected.
- The character sheet's **live combat panels** (HP, Death Saves, Corruption, Inventory access) appear *before* the static reference panels (Abilities, Skills, Features) on small screens. The desktop two-column visual is unchanged at `≥ md`.
- The level-up dialog at `< sm` opens as a **bottom-anchored full-height sheet**: pinned to the bottom of the viewport, taking up to `100dvh - safe-area-insets`, with internal scroll. At `≥ sm` the existing centered-dialog behavior is preserved.
- The wizard's bottom **Back / Continue** row stacks vertically at `< sm` with both buttons full-width and the Continue button on top (so the primary action is closest to the thumb).
- A `viewport` export exists on `app/layout.tsx` setting `width: "device-width"`, `initialScale: 1`, `viewportFit: "cover"`, and `themeColor` matching the parchment background so iOS Safari's address-bar tints align with the page.
- Playwright sanity tests cover mobile viewport for Home, Wizard step 1, Sheet render, and Level-up dialog open.

**Non-Goals:**

- A separate mobile shell, separate route, or device-detection layer. We use one responsive layout that scales.
- Touch-specific interactions (long-press menus, swipe-to-dismiss). Standard tap is enough for this change.
- Tablet-specific layouts. Anything in `[md, lg)` follows the desktop layout already; this change does not introduce a third breakpoint band.
- Native install / PWA manifest, splash screens, offline mode. Out of scope; the app is a web app.
- Visual rework of the parchment/blackletter aesthetic. We only adjust sizes and ordering, never colors or fonts.
- Print stylesheet. Print is desktop-only and already handled via `@page` rules.
- The `printable-export` route. Printing from a phone is supported by the OS, not by us.

## Decisions

### Decision 1: One `viewport` export, no per-route overrides

Add to `app/layout.tsx`:

```ts
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#efe5cb", // parchment cream — matches Parchment background
};
```

Per-route viewport overrides exist in Next 16 but no surface needs different behavior. One export, applied root-wide.

**Why not user-scalable: false?** The PG-flavored sheet has dense small text. Pinch-to-zoom is an accessibility lifeline; we leave it on.

### Decision 2: Sheet primary grid uses `flex-col-reverse` on mobile, `md:grid` on desktop

The current top-level structure of `character-sheet.tsx`:

```tsx
<div className="grid md:grid-cols-3 gap-6">
  <div className="space-y-6 md:col-span-2"> {/* static: abilities, skills, features */}
  <div className="space-y-6">                  {/* live: HP, death saves, corruption */}
</div>
```

becomes:

```tsx
<div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-3">
  <div className="space-y-6 md:col-span-2"> {/* static */}
  <div className="space-y-6">                  {/* live — appears first on mobile */}
</div>
```

This lets the live panels render on top on phones without changing DOM order (so screen readers still hear the static content as the "main" content first when desktop-flowed). Tab order naturally follows DOM order — a known visual-vs-DOM-order concession that the WCAG group accepts when the alternative is poorer mobile UX. We document this in a code comment.

**Why not duplicate the panels (mobile copy + desktop copy)?** Doubling the DOM and risking state divergence on the HP/Corruption interactive controls is worse than the slight tab-order quirk. The HP and Corruption panels carry mutable state that must reflect a single source.

### Decision 3: `Dialog` gains a `mobileVariant: "centered" | "bottom-sheet"` prop

Extend `components/ui/dialog.tsx`'s `DialogContent` with an optional `mobileVariant` prop. Default `"centered"` keeps today's behavior. `"bottom-sheet"`:

- At `< sm`: positions the popup `bottom: 0; left: 0; right: 0; top: auto`, full width, max-height `100dvh - safe-area-inset-top`, rounded only on top corners, slide-up animation.
- At `≥ sm`: identical to the existing centered behavior.

The level-up dialog, inventory modal, feat-tap popover, weapon-attack popover, and spell popover all switch to `mobileVariant="bottom-sheet"`. This avoids forking each modal and keeps the shared dialog primitive as the single source of mobile-aware modal positioning.

**Why bottom-sheet over fullscreen?** Fullscreen on mobile loses the visual context of the underlying sheet, makes "close to dismiss" feel modal-heavy, and breaks the parchment overlay aesthetic. Bottom sheet keeps a sliver of the underlying view visible (so you remember where you came from), is the iOS / Android native pattern, and aligns thumb reach.

### Decision 4: Tap-target enforcement via a Tailwind utility class, not per-control overrides

Add a small CSS-layer utility in `app/globals.css`:

```css
@layer components {
  /* Apply to every interactive sheet control. At touch viewports, guarantees
     the WCAG 2.1 Success Criterion 2.5.5 minimum tap area. */
  .tap-target {
    @media (pointer: coarse) {
      min-width: 2.75rem; /* 44px @ 16px root */
      min-height: 2.75rem;
    }
  }
}
```

The HP / Corruption / Death-saves +/- buttons, sheet section actions (Inventory rucksack, level-up trigger), and feat-card touch surfaces gain `className="tap-target"`. Visual size on desktop is untouched.

**Why a utility class over a global `button` rule?** Many shadcn buttons are correctly sized via existing `size="sm"` / `size="icon"` variants and do not need a 44px floor — applying it globally would push toolbar density past acceptable. Opt-in keeps the change scoped and reversible.

### Decision 5: Wizard nav stacks vertically with Continue-on-top at `< sm`

Replace `wizard-shell.tsx:127`:

```tsx
<div className="mt-10 flex items-center justify-between gap-2 border-t border-border pt-6">
  <Button variant="ghost" onClick={handleBack}>← Back</Button>
  <Button onClick={handleAdvance} className="font-display tracking-wider">Continue → …</Button>
</div>
```

with a column-reverse stack at `< sm` that is row at `≥ sm`:

```tsx
<div className="mt-10 flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
  <Button variant="ghost" className="w-full sm:w-auto">← Back</Button>
  <Button className="w-full sm:w-auto">Continue → …</Button>
</div>
```

Continue is the primary action — putting it visually on top (via `flex-col-reverse`) on phones places it under the user's thumb without re-ordering DOM. Both buttons are full-width on phone for fat-finger safety and shrink to natural width on desktop.

**Why not just allow the existing single-row to wrap?** The Continue label includes the next step name and can be ~30–40 characters; wrapping inside a button looks broken and the row's `justify-between` keeps Back at the far left, which is awful for thumb reach.

### Decision 6: Sheet header title uses CSS `clamp()` for fluid scaling

Replace the static `font-size: 3.5em` rule (`globals.css:201`) for `BlackletterTitle` (or whichever selector backs it) with `clamp(2rem, 6vw + 0.5rem, 3.5em)`. At 360 px viewport the value resolves to ~2.6rem; at the design width of ~1024 px it resolves to the original 3.5em. No JS resize listener, no `useViewportWidth` hook — pure CSS.

**Why not media-query-stepped sizes?** `clamp()` interpolates smoothly and handles all viewport widths uniformly. Step-based sizing introduces visible jumps that ill-match a fluid responsive grid.

### Decision 7: Audit existing breakpoint usage; standardize on `sm` for "stack on phone"

The codebase mixes `sm:grid-cols-2` (`boons-burdens-step.tsx`) and `md:grid-cols-2` (`class-step.tsx`, `background-step.tsx`, `approach-step.tsx`). For mobile-first card grids, the rule becomes: a card grid that should stack on phones uses `sm:grid-cols-2` (stacks below 640 px). The wider `md:grid-cols-2` is reserved for grids that benefit from a single column even on small tablets — none in this codebase, so we standardize all `md:grid-cols-2` card-pickers to `sm:grid-cols-2`. A code comment near the convention documents the choice.

This is a small, mechanical churn (4–6 files) but eliminates the "weird middle band" where a 700-wide viewport shows a one-column grid that has the visual room for two.

### Decision 8: Mobile Playwright tests live in a parallel describe block, not a parallel project

Add a `e2e/mobile.spec.ts` (or similar) using a `test.describe("mobile viewport")` block that calls `await page.setViewportSize({ width: 360, height: 800 })` in `beforeEach`. This avoids spinning up a parallel Playwright project (which would double CI time) and keeps the mobile checks readable next to the existing tests. Coverage:

- Home page: `await expect(page).toHaveNoHorizontalScroll()` (custom assertion: `document.documentElement.scrollWidth ≤ window.innerWidth`).
- Wizard step 1 (Origin): card grid renders one column; "Continue" button is full-width.
- Character sheet for a fully-built sample fixture: live panels (HP, Corruption) render *before* abilities; no horizontal scroll.
- Level-up dialog: opens, scrolls vertically, footer buttons are stacked.

### Decision 9: This is a MINOR release

Per `CLAUDE.md`'s SemVer rules: MAJOR for `Character` schema breaks, MINOR for additive features, PATCH for fixes. This change adds a responsive layer and a `viewport` export without changing `Character` JSON or invalidating saves. It is a MINOR bump.

## Risks / Trade-offs

- **[Risk] `flex-col-reverse` puts the live panels visually-first but DOM-second, so keyboard tab-order on mobile reaches Abilities → Skills → Features → HP → Corruption.** **→ Mitigation:** add a documented note in the sheet code; verify with Playwright that tab-order reaches all controls, even if the visual order differs. WCAG 2.4.3 Focus Order accepts this when the visual reordering is purely presentational.
- **[Risk] Bottom-sheet variant on `Dialog` introduces a second positioning code path that must be kept in sync with the centered variant.** **→ Mitigation:** branch only on a single conditional class string inside `DialogContent`; share everything else. Add a Playwright check that both variants render correctly when `mobileVariant` is each value.
- **[Risk] `themeColor: "#efe5cb"` aligns iOS Safari address-bar with parchment but disagrees with the `Toaster theme="dark"` in `app/layout.tsx:37`. Toasts will visually clash on a parchment header.** **→ Mitigation:** keep the dark toaster — the contrast is intentional for error states. The `themeColor` only colors the iOS chrome, not the toast surface, so they live in separate layers.
- **[Risk] Standardizing `md:grid-cols-2` → `sm:grid-cols-2` in wizard step components could cause a visual regression in the desktop view if any layout depends on the wider single-column band.** **→ Mitigation:** review each migrated file in the dev server at desktop width; the change only widens the breakpoint at which two columns appear, never removes them.
- **[Risk] `clamp()`-driven title size changes the visual weight of the sheet header on every viewport between 360 and 1024 px, not just phones.** **→ Mitigation:** the `clamp(2rem, 6vw + 0.5rem, 3.5em)` formula resolves to the *current* 3.5em at desktop width and only shrinks below; desktop visuals are unchanged at `≥ 1024 px`. Tablet (between sm and lg) shrinks proportionally — a deliberate improvement, not a regression.
- **[Trade-off] No PWA / install / offline.** A real "mobile-supported" experience often implies a manifest and offline support. We commit only to "the app *works* on a phone in a regular browser" because the storage layer is already client-side localStorage and the main remaining browser-side work to make it installable is its own change with its own tradeoffs (icon sets, splash screens, safe-area handling on standalone display mode). Out of scope here; can land as a follow-up MINOR.
- **[Trade-off] No tap-target enforcement by lint/CI.** Tap-target sizes can drift if a future component skips the `tap-target` utility. We accept the drift risk for now; a Playwright accessibility scan against `aria-label`-bearing controls is a possible follow-up. The cost of stricter enforcement (writing a custom rule) outweighs the benefit at this stage.
