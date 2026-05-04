## Context

`<SpellTabs>` (`components/spells/spell-tabs.tsx`) is the single shared component for rendering grouped spell lists. It's used in three call sites:

1. **`approach-step.tsx`** — character creation, picker mode, only Cantrips + 1st-level levels passed in.
2. **`level-up-dialog.tsx`** — level-up flow, picker mode, can pass in any subset of `[1..9]` based on the approach's progression at the target level.
3. **`character-sheet.tsx`** — companion sheet, display mode, passes in every spell level the character can cast.

It's built on Base UI `Tabs` (`@base-ui/react/tabs`) re-exported via `components/ui/tabs.tsx` (variant `line`). The user-facing pain only shows up once you have ≥3 levels — character creation is fine, level-up and the high-level companion sheet are not. The catalog itself (`data/spells.ts`) and the per-level grouping logic (`useMemo` over `levels`/`spells`) are unchanged by this design; the only thing changing is the wrapping layout primitive.

The proposal commits to: replace tabs with collapsibles, expand-by-default, per-section "# selected" badge in picker mode, no global expand/collapse all in v1, no persisted state. The design picks the primitive, the prop shape, the keyboard semantics, and the migration path for tests.

## Goals / Non-Goals

**Goals:**

- Let the player see every accessible spell level at once when picking, with the ability to compress sections they don't care about.
- Preserve the existing `<SpellTabs>` public API so consumer source files don't need to change.
- Keep the per-section scroll behavior (`max-h-72 overflow-y-auto`) so a level with hundreds of spells doesn't blow out the dialog.
- Match the project's `base-nova` shadcn style and existing keyboard conventions.

**Non-Goals:**

- Persisting collapse state across re-mounts or to `Character`. (Out of scope; trivial to add later if asked.)
- A global "Expand all / Collapse all" button. (Skipping for v1 — the per-header chevrons are sufficient and the dialog defaults to fully expanded.)
- Refactoring `data/spells.ts` or the per-level grouping logic.
- Touching the printable sheet (it doesn't use `<SpellTabs>`).
- Renaming `<SpellTabs>` or its file path. The export name and import path stay the same to avoid churn across three call sites; the JSDoc updates.

## Decisions

### Primitive choice: Base UI `Collapsible`, not Accordion

Base UI exposes both `Collapsible` and `Accordion`. Accordion enforces single-open or multi-open semantics across a *group* of items and is opinionated about its layout. Collapsible is a single open/close primitive that we render N times in a flex column.

We choose **N independent `Collapsible` instances** because:

- We want every section open by default and then independently togglable. Accordion's `multiple` mode supports that, but we'd be paying for the group abstraction without using its other affordances (single-open enforcement, controlled value, etc.).
- Per-section state stays local to each `Collapsible.Root`. We never need to ask "which one is open" globally.
- The level data is heterogeneous (Cantrips uses the label "Cantrips" while 1+ uses "1st", "2nd", etc.) — the simpler primitive composes more cleanly.

**Alternative considered:** keep `Tabs` and add a "show all levels" toggle that flips between tabs and a flat list. Rejected — two layouts to maintain, and the user explicitly asked for collapsing per level, not a flat list.

### `components/ui/collapsible.tsx`: shadcn-style Base UI wrapper

Following the project's existing `components/ui/*` pattern (e.g. `tabs.tsx`, `dialog.tsx`), add `components/ui/collapsible.tsx` exporting:

- `Collapsible` — wraps `Collapsible.Root`, `data-slot="collapsible"`, default `defaultOpen` true.
- `CollapsibleTrigger` — wraps `Collapsible.Trigger`, `data-slot="collapsible-trigger"`. Default styling: a row with chevron icon (rotates 90°/0° on `data-panel-open`), display-font header text, count badges. The chevron is a `lucide-react` `ChevronRight` rotated via `data-[panel-open]:rotate-90 transition-transform`.
- `CollapsibleContent` — wraps `Collapsible.Panel`, `data-slot="collapsible-content"`. Uses Base UI's CSS-grid open/close animation (`grid-template-rows: 0fr` ↔ `1fr`) — the standard idiom for animated collapse, and consistent with how `dialog.tsx` already opts into Base UI animations.

This file lives in `components/ui/` rather than inside `components/spells/` because the primitive is generic. Future surfaces (e.g. boon/burden picker, grouped feature lists) can use it.

### `<SpellTabs>` rework

The component name and file path stay the same to keep the consumer diff minimal. Internally:

- The outer `<Tabs>`/`<TabsList>` is replaced with a `<div className="flex flex-col gap-2">`.
- For each visible level, render `<Collapsible defaultOpen>` with:
  - **Trigger** = a full-width `flex items-center justify-between` row containing:
    - Left: chevron + level label (`ORDINAL[lvl]` — unchanged) + a `Badge` showing the total count (existing badge).
    - Right (picker mode only): a second `Badge` showing `selected.size` *for that level* — derived inline from `mode.selected` and `grouped.get(lvl)`. In display mode, no second badge.
  - **Content** = the existing `grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1` block of `SpellCard`s. The grid and scroll behavior are unchanged.
- The internal `useMemo` `grouped` map and `visibleLevels` filter survive verbatim.
- `defaultLevel` is no longer used to drive any state. It's left in the props as `defaultLevel?: SpellLevel` and ignored. Removing it would break consumers; deprecating in JSDoc is sufficient. A follow-up cleanup change can drop it later.
- The `useState`/`active` state for the active tab is removed.

### Keyboard / a11y

`Collapsible.Trigger` from Base UI is a `<button>` and handles Enter/Space toggling, focus ring, and `aria-expanded` automatically. Tab order: each level header is one focusable stop; tabbing into the open content lands on the first interactive element (a `SpellCard` checkbox in picker mode, the card itself in display mode if it has an `onCast` handler). No additional ARIA wiring needed beyond what the primitive provides.

### Default open state

All sections start expanded. Rationale: the proposal calls out that players want to *see* the catalog before committing, and the most common picker use case is "I want to compare across tiers". Starting collapsed would force every player to click N times before they can browse — net regression vs. tabs (one click vs. zero).

For display mode in companion view, this means a high-level Mystic sees a long page of spells. That's fine because the page is already scrollable and the per-level chevrons let the player compress it. If we discover this is too much screen real estate post-launch, a follow-up change can default display mode to collapsed-but-cantrips-open.

### Selected-count badge in picker mode

A new on-header indicator: in picker mode, when `mode.selected` overlaps a level's spells, show `Badge` text like `2`. (Not `2 selected` — the badge is small, the count is the signal.) The total-count badge keeps its current style (`variant="secondary"`); the selected-count badge uses `variant="default"` (primary fill) so the eye distinguishes "how many here total" vs. "how many of mine are here". When the count is zero, the selected badge is omitted entirely.

This badge is the entire reason to allow collapsing without losing context: a player can collapse a level they already finished picking from and still see at a glance that it has their picks.

### E2E test placement

A new spec `e2e/spell-picker-collapse.spec.ts` covers:

- Open the level-up dialog for a mid-level Mystic seeded into localStorage.
- Assert all level headers are visible and their content panels are open.
- Click the "Cantrips" header; assert that panel collapses (`aria-expanded="false"` on its trigger) while other levels stay open.
- Click a spell card in another level; assert the global "remaining" counter decrements.
- Click the collapsed "Cantrips" header again; assert it re-expands.

Existing E2E specs that select spell-picker controls by tab role (if any — to be audited during apply) get migrated to look for the new `data-slot="collapsible-trigger"` button by accessible name. The seed helpers in `e2e/helpers/` don't need to change.

## Risks / Trade-offs

- **Long page in companion mode** → the sheet is already scroll-heavy and the new layout makes it longer for high-level Mystics. Mitigation: per-section scroll caps the worst-case at ~72rem of catalog per level; players who don't want a level expanded can collapse it. If feedback is bad, we add a "default collapsed in display mode" prop in a follow-up.
- **Lost tab muscle memory** → players used to clicking "2nd" to jump to 2nd-level spells now scroll-and-click. Mitigation: each section header still reads "2nd" with the same total-count badge and is reachable by Tab key — visual scan time is comparable. The header click is still a one-click affordance to expand/collapse.
- **E2E selector churn** → tests written against tab semantics break. Mitigation: audit during apply; the count is small (the project has only one spell-picker E2E currently per `grep -r "SpellTabs\|spell-pick" e2e/`). The new selector pattern is `getByRole('button', { name: /1st/i })` against the `Collapsible.Trigger`.
- **Animation jank on slow devices** → the CSS-grid open/close animation is GPU-cheap but renders the panel content during transition. Acceptable for v1; if profiling flags this, we can swap to a `display: none` after-transitionend pattern.
- **`defaultLevel` prop becomes a no-op** → existing call sites pass it (or don't); silently ignoring could mask bugs in future code that relies on it. Mitigation: JSDoc the prop as deprecated with a `@deprecated since vX.Y.Z — collapsible layout shows all levels; this prop is ignored.` A follow-up change can drop the prop entirely.

## Migration Plan

This is a UI-only change. No data migration, no `Character` schema impact, no storage adapter touch. Steps:

1. Add `components/ui/collapsible.tsx`.
2. Rewrite `components/spells/spell-tabs.tsx` internals.
3. Update existing E2E selectors that depended on tab roles.
4. Add the new collapse-interaction E2E spec.
5. Manual smoke-test the three call sites (character creation, level-up at L9, companion sheet at L9).

Rollback: revert the two component edits and the test changes; no data or schema rollback needed.

## Open Questions

- Should the companion-mode display variant default to collapsed (showing only the lowest level expanded) instead of fully expanded? Leaning **no** for consistency with the picker, but the answer changes if real-world Mystics complain about page length.
- Should the selected-count badge be shown in display mode for the cast popover variant? Currently no — selection is a picker concept. If we later add a "favorites" or "prepared" notion to display mode, this badge becomes relevant again.
