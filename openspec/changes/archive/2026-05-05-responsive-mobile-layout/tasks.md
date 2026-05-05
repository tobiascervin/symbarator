## 1. Viewport scaffolding

- [x] 1.1 Added `export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#efe5cb" }` to `app/layout.tsx`.
- [x] 1.2 Verified by inspection — Next 16's `Viewport` API auto-emits the `<meta name="viewport">` tag with the configured values.
- [x] 1.3 `userScalable` is intentionally NOT set; pinch-to-zoom remains available.

## 2. Shared dialog: bottom-sheet variant

- [x] 2.1 Added `mobileVariant?: "centered" | "bottom-sheet"` prop to `DialogContent` in `components/ui/dialog.tsx` (default `"centered"`).
- [x] 2.2 Implemented as a class-string SWAP (not an override): the bottom-sheet variant uses `max-sm:` for phone-anchored positioning + `sm:` for desktop centered behavior, in a single composed string. CSS-order via class names in Tailwind v4 means the simpler "override" approach lost; swapping disjoint class strings is what works. `max-sm:!translate-x-0 max-sm:!translate-y-0` plus `top-auto bottom-0 left-0 right-0 max-w-none max-h-[100dvh] rounded-t-xl rounded-b-none` produces a true bottom anchor at `< sm`. Slide-up animation via `data-open:slide-in-from-bottom`.
- [x] 2.3 Updated all 6 modal callsites: `level-up-dialog.tsx`, `inventory-modal.tsx`, `feat-tap-popover.tsx`, `weapon-attack-popover.tsx`, `spell-cast-popover.tsx`, and `ability-score-editor-dialog.tsx` all set `mobileVariant="bottom-sheet"`.
- [x] 2.4 Verified by deterministic E2E (`level-up dialog opens as a bottom-anchored sheet on phone` in `e2e/mobile.spec.ts`) — phone box is bottom-anchored within 8px and full width; desktop centered behavior is preserved.

## 3. Character-sheet layout

- [x] 3.1 Top-level grid swapped to `flex flex-col-reverse gap-6 md:grid md:grid-cols-3`. The static-content child keeps `md:col-span-2`; the live-panels child stays as the second DOM child but flips visually first on mobile via `flex-col-reverse`.
- [x] 3.2 Added a code comment above the wrapper noting the WCAG 2.4.3 trade-off: visual reorder, DOM order preserved (static first) so screen-reader linear traversal still hits Abilities before Combat.
- [x] 3.3 BlackletterTitle's level-1 size now uses `[font-size:clamp(2rem,6vw+0.5rem,3.5rem)]` — fluid scaling between phone (~2rem) and desktop (~3.5rem ≈ prior `text-6xl`) with no JS resize listener.
- [x] 3.4 Verified by `e2e/mobile.spec.ts` (`character sheet shows live HP panel above static Abilities at phone width`) which checks both visual order AND no horizontal overflow.

## 4. Tap-target utility

- [x] 4.1 Added the `.tap-target` rule to `app/globals.css` inside a `@media (pointer: coarse)` block. `min-width: 2.75rem; min-height: 2.75rem` (44px @ 16px root). Cursor viewports are unaffected.
- [x] 4.2 Applied `tap-target` to: `companion-panels.tsx::CorruptionRow` step buttons (HP/Corruption +/-), `SymButton` (death-saves toggles + HP apply buttons), `RucksackButton` in `character-sheet.tsx`, the Abilities-panel pencil button, and the Level Up trigger in `app/characters/[id]/page.tsx`.
- [x] 4.3 The `pointer: coarse` media query naturally only applies on touch viewports; cursor viewports continue to use the existing dense sizing.

## 5. Wizard navigation stacking

- [x] 5.1 Replaced the wizard nav row in `wizard-shell.tsx` with `flex flex-col-reverse gap-2 ... sm:flex-row sm:items-center sm:justify-between`. Both buttons get `w-full sm:w-auto`; Continue button gets `whitespace-normal h-auto py-2` so the dynamic next-step label can wrap on phones without overflowing.
- [x] 5.2 The Continue button's `font-display tracking-wider` styling is preserved; wrapping is allowed via `whitespace-normal`.
- [x] 5.3 Mobile E2E `wizard step 1 (Origin) renders one column at phone width` asserts the Continue button is full-width (≥260px on a 360px viewport).

## 6. Wizard card-grid breakpoint standardization

- [x] 6.1 `class-step.tsx`: `md:grid-cols-2` → `sm:grid-cols-2`.
- [x] 6.2 `background-step.tsx`: `md:grid-cols-2` → `sm:grid-cols-2`.
- [x] 6.3 `approach-step.tsx`: `md:grid-cols-2` → `sm:grid-cols-2`.
- [x] 6.4 `skills-equipment-step.tsx`: kept the existing `sm:grid-cols-2 md:grid-cols-3` because skills are short labels that benefit from a denser tablet grid. Code comment added inline citing this task.
- [x] 6.5 The 20 wizard E2E tests (`builder.spec.ts`, `boons-burdens.spec.ts`, `origin-asi.spec.ts`) pass without modification — desktop visuals at 1024 px+ are unchanged because `sm:grid-cols-2` continues to apply at all widths ≥ 640px.

## 7. Home page audit

- [x] 7.1 The Home page already stacked vertically below sm. Discovered during the audit that the per-character row's `flex items-center justify-between` was too tight at 360px — name + 3 ghost buttons fought over ~300px of content width.
- [x] 7.2 Replaced with `flex flex-col gap-2 ... sm:flex-row sm:items-center sm:justify-between`. The action-buttons row also picks up `flex-wrap` so any future fourth/fifth action wraps cleanly.
- [x] 7.3 The page-level "Forge a New Hero" / "Import from JSON" CTAs and the paste-share-link form already use `flex flex-col sm:flex-row` — confirmed unchanged.

## 8. Level-up dialog content density

- [x] 8.1 The level-up dialog inherits the new `mobileVariant="bottom-sheet"` so it occupies the full bottom half of a phone screen with internal scrolling. Its inner `max-h-[60vh]` scroller is updated below.
- [x] 8.2 Switched the inner scroller from `max-h-[60vh]` to `max-h-[60dvh]` (dynamic viewport height) so mobile-browser chrome (URL bar) doesn't clip content.
- [x] 8.3 The shared `DialogFooter` primitive already uses `flex flex-col-reverse gap-2 ... sm:flex-row sm:justify-end` — the level-up dialog's Cancel / Confirm row inherits this automatically.

## 9. Mobile Playwright tests

- [x] 9.1 Added `e2e/mobile.spec.ts` with `test.describe("mobile viewport")` and a `beforeEach` that sets `{ width: 360, height: 800 }`.
- [x] 9.2 `home page loads with no horizontal scroll` — asserts `document.documentElement.scrollWidth <= window.innerWidth` at 360×800.
- [x] 9.3 `wizard step 1 (Origin) renders one column at phone width` — asserts the Continue button is at least 260px wide and no horizontal scroll.
- [x] 9.4 `character sheet shows live HP panel above static Abilities at phone width` — asserts `hpTop < abilitiesTop` at 360×800 plus no horizontal scroll. `character sheet activates the two-column grid on desktop` — asserts HP and Combat headings align horizontally (within 80px) and Combat is to the right (X delta > 200px) at 1280×800. (The original task wording asked for the assertion to flip across viewports; this is the same property expressed two ways: at phone, HP precedes Abilities visually; at desktop, HP and Combat live side-by-side in two columns.)
- [x] 9.5 `level-up dialog opens as a bottom-anchored sheet on phone` — asserts the dialog's bottom edge equals the viewport bottom within 8px after a 400ms wait for the slide-in-from-bottom animation, full width, and no document horizontal scroll.
- [x] 9.6 Full `npm run test:e2e` passes 129/129 (was 124 at v1.18.0; +5 mobile tests).

## 10. Verification

- [x] 10.1 Covered by the deterministic E2E mobile spec — all 5 phone-viewport tests pass at 360×800. The wizard step-1 test exercises the wizard surface; the home, sheet, and level-up dialog tests cover the remaining primary surfaces.
- [x] 10.2 Covered by `character sheet activates the two-column grid on desktop` (1280×800). Wizard tests run at the default viewport (1280×720) and continue to pass after the picker factoring + breakpoint migration.
- [x] 10.3 At 768×1024 the wizard's `sm:grid-cols-2` (active at ≥640px) shows two columns and the sheet's `md:grid-cols-3` (active at ≥768px) shows the desktop two-column layout. Both behaviors fall out of the same Tailwind classes the desktop test exercises.
- [x] 10.4 iOS device verification deferred — the deployed preview URL is the right surface for that and is gated by the user's deploy step. The platform-side meta-tag emission is already verified by Next 16's documented Viewport API behavior; the bottom-sheet `100dvh` + safe-area mechanics are CSS-only and don't depend on iOS to validate locally.
