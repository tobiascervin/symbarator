## Why

The spell catalog now has 297 entries across 9 spell levels, the level-up flow can hand a Mystic 21 known spells by L20, and feats accumulate across multiple ASI/feat slots — but the UI is still showing all of it as flat scrollable lists. The level-up dialog's spell picker dumps every accessible-level spell into one column. The character sheet renders cantrips and spells as two long bullet lists with no level grouping. Feats appear as a comma-joined string at the end of the Features section. Picking the right spell or remembering what feat does what becomes a chore the moment a character gets past L5.

Baldur's Gate 3 solves this with **tabs per spell level**: cantrips, 1st, 2nd, … each tab shows only that level, the active tab is obvious, and the same pattern works whether you're picking a spell, viewing your spellbook, or preparing for the day. We're going to apply that same pattern here for the level-up picker, the L1 builder, and the sheet's spellbook view, plus give feats a proper grouped card display instead of a comma string.

## What Changes

- **New `<SpellTabs>` component** (`components/spells/spell-tabs.tsx`): a tab row labelled "Cantrips · 1st · 2nd · …" with a count badge per tab, scoped content area underneath. Reusable across the three surfaces.
- **Level-up `SpellsLearnedStep`** uses `<SpellTabs>` for both the cantrip pool and the leveled-spell pool. Picking N new spells works across tabs (count badge tracks total picked, not per-tab). Tabs only render for levels the character has slots for; empty levels are hidden, not shown disabled.
- **L1 builder `ApproachStep`** spell pickers (Mystic / Templar / Witch Hunter approaches) use the same `<SpellTabs>` component for cantrip and 1st-level picks. At L1 there's only one leveled tab so the row is mostly informational, but the visual language matches what the player will see at level-up time.
- **Character sheet spellbook**: the existing `<SpellList title="Spells Known">` flat list becomes a tabbed view. Tab labels show level + count (`1st (4)`, `2nd (3)`, etc.). Active tab content shows full spell entries (name, school, ritual badge, description). Cantrips get their own tab.
- **Feats on the sheet**: replace the `c.feats.join(", ")` blurb with a proper section ("Feats") rendering one card per feat with its display name + description (resolved via `BOON_BY_ID` from `data/feats.ts`). Grouped/sorted: the Changeling sentinel `change-self` and any `fighting-style:*` markers go into their own muted "Special" group; everything else under "Boons".
- Existing `<SpellList>` component is repurposed or replaced — anywhere it's used today (sheet only) gets the tabbed view.

Out of scope: a full BG3-style spell-icon grid (we don't have spell icons), drag-and-drop spell preparation, search/filter input inside tabs, casting from the sheet, redesigning the cantrip picker layout for very large pools (>30 entries — current largest is Wizard's 13).

## Capabilities

### New Capabilities
<!-- None — the feature lives entirely under the existing `character-leveling` and `spell-catalog` capabilities; it's a UI-only enhancement. -->

### Modified Capabilities
- `character-leveling`: the spell-pick step's UI requirements need to be widened so the level-up flow's spell picker is required to be tabbed-per-level (currently the spec only mandates that pickable spells appear). Update one scenario plus add a new one for the tabbed surface.

## Impact

- **New files**:
  - `components/spells/spell-tabs.tsx` (the reusable tab component, ~80 lines)
  - `components/spells/spell-card.tsx` (one card per spell entry, used inside tabs)
  - `components/sheet/feat-list.tsx` (replaces the inline `feats.join(", ")` rendering)
- **Touched files**:
  - `components/level-up/level-up-dialog.tsx` — `SpellsLearnedStep` switches to `<SpellTabs>`
  - `components/builder/approach-step.tsx` — Mystic/Templar/Witch Hunter spell pickers switch to `<SpellTabs>`
  - `components/sheet/character-sheet.tsx` — replace `<SpellList>` with `<SpellTabs>` for the spellbook display; replace the feats blurb with `<FeatList>`
- **Tests**: the existing `SpellsLearnedStep` E2E assertions (Bless dedupe, "Pick from any level you have slots for") need their selectors updated for the tabbed layout. Add at least one new test asserting tab labels render and tab clicks switch the visible pool.
- **Risk**: low. Pure UI restructuring; persistence shapes (`spellPicks.cantrips`, `spellPicks.spellsKnown`, `Character.feats`) are unchanged. Existing data round-trips identically.
- **Out of scope**: feat catalog growth — `data/feats.ts` currently exports `BOONS`; we use whatever's there and rely on `BOON_BY_ID` lookup. Unknown ids (e.g. `change-self`, `fighting-style:archery`) get a muted "no description available" rendering and live in the Special group.
