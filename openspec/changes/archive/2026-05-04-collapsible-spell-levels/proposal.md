## Why

The shared `<SpellTabs>` component renders one tab per spell level — fine when the picker only exposes Cantrips + 1st-level (initial character creation), but increasingly painful at higher levels. A Mystic levelling to L9 sees five tabs (Cantrips, 1st, 2nd, 3rd, 4th, 5th) and has to click through each to scan the catalog before deciding what to learn. The same friction shows up in companion mode for any mid-to-high-level spellcaster: only one level of spells is visible at a time, you can't compare across tiers without losing your place, and the tab strip becomes an alphabet soup of `1st 2nd 3rd 4th 5th`. The pick-spells flow is the most affected because that's where players want to deliberately scan the whole catalog before committing.

Players have asked for a layout that lets them see — and skim — every accessible level at once, while still being able to compress sections they're not interested in.

## What Changes

- Replace the level **tabs** in `<SpellTabs>` with **collapsible level sections**. Each spell level renders as its own collapsible block (header = level label + spell count badge + chevron; body = the same `SpellCard` grid that already renders inside each tab today).
- Every level section is **expanded by default** so the picker opens with the full catalog visible. Clicking a header (or pressing Enter/Space when focused) toggles that section. The "expand all / collapse all" affordance is implicit through individual headers — no extra global toggle for v1.
- A new **"# selected"** badge on each level header in `picker` mode shows how many of the player's current picks live in that level (lets the player verify their distribution at a glance with everything collapsed).
- Collapse state is **local component state** — it does not persist across re-mounts or get written to `Character`. Closing and reopening the level-up dialog resets every section to expanded.
- The component keeps its existing `SpellTabsMode` API (`display` / `picker`) and prop shape so all three call sites (`approach-step`, `level-up-dialog`, `character-sheet`) get the new layout for free without changes at the consumer level. The component name stays `SpellTabs` (the export and file are unchanged) — renaming would just churn imports for no benefit; the JSDoc updates to describe the new layout.
- A new shadcn-style `components/ui/collapsible.tsx` primitive is added (Base UI `Collapsible` wrapper) since the project doesn't have one yet. Used here, but available for future surfaces.
- Existing scroll behavior inside each level (`max-h-72 overflow-y-auto`) is preserved per-section so a single level with hundreds of spells still scrolls within its own block rather than blowing out the dialog.
- An E2E test exercises the new collapse / expand interaction on the level-up dialog (most realistic multi-level case): picker opens with all levels expanded, a click on a level header collapses just that section, and a pick made in another section still updates the "remaining" counter.

## Capabilities

### New Capabilities

- `spell-picker-ui`: behavior of the shared spell-list component used by character creation, level-up, and the companion sheet — how levels are grouped, how the user expands/collapses, and what counts/badges each section header shows.

### Modified Capabilities

(none — no existing spec mandates the tabs-vs-collapsibles structure today)

## Impact

- **Component**: `components/spells/spell-tabs.tsx` — reworked from `Tabs`/`TabsList`/`TabsContent` to a list of `Collapsible` sections. Public props (`spells`, `levels`, `defaultLevel`, `mode`) unchanged. The `defaultLevel` prop becomes informational only (no longer drives an active tab) — kept for now to avoid breaking call sites; design.md decides whether to deprecate it.
- **New primitive**: `components/ui/collapsible.tsx` — a small shadcn-style wrapper around Base UI `Collapsible` matching the existing style (`base-nova`).
- **Consumers** (`components/builder/approach-step.tsx`, `components/level-up/level-up-dialog.tsx`, `components/sheet/character-sheet.tsx`): no source changes required. They already pass `levels`/`mode` and rely on `<SpellTabs>` for layout. Visual behavior changes; data flow is identical.
- **Printable sheet** (`components/sheet/printable-sheet.tsx`): unaffected — it does not use `<SpellTabs>` and renders its own grouped list for print.
- **Tests**: existing E2E suites that interact with the spell picker via tab role (if any) will need their selectors updated. New E2E spec covers the collapse interaction. The companion-mode tests that simply scroll to a spell card by name still pass since cards are now rendered in a single page rather than behind a tab switch.
- **Dependencies**: the project already uses Base UI primitives via shadcn `base-nova` style. No new package needed if `@base-ui-components/react` is already a dependency; otherwise, add it.
