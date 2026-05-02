## Context

Three places render spell lists today:

- `components/builder/approach-step.tsx` — Mystic spell-picker UI (cantrip checkboxes + 1st-level checkboxes, two parallel grids).
- `components/level-up/level-up-dialog.tsx` `SpellsLearnedStep` — the level-up picker, which since the L7-Templar fix can show spells from multiple spell levels at once. Currently it concatenates them all into one grid with `(L1)` `(L2)` annotations after each name.
- `components/sheet/character-sheet.tsx` — the spellbook display via the existing `<SpellList>` component, which renders a flat `<ul>` of name + (optional ritual) + description.

Feats render as `c.feats.join(", ")` inside a `<Feature>` component within the Features section. With multiple ASI/feat picks in a 20-level career, that becomes opaque fast.

Constraints:
- Tailwind v4 + `@base-ui/react` + shadcn/ui (style `base-nova`). The `Tabs` primitive (`components/ui/tabs.tsx`) already exists and is used by `abilities-step.tsx` for Standard Array / Point Buy / Manual.
- All persistence shapes stay the same. The flat `cantrips: string[]` and `spellsKnown: string[]` arrays are still the source of truth — the tabbed UI just regroups them at render time.
- Server vs client: spell pickers and the sheet are all client components today (per `"use client"` at the top of each file). The tab component will be a pure client component with no special data fetching.

## Goals / Non-Goals

**Goals:**
- One reusable `<SpellTabs>` component used in three surfaces (builder approach step, level-up picker, sheet spellbook).
- Tabs render only the spell levels the consumer hands in (e.g. picker at L4→L5 hands in `[1, 2]`; sheet hands in every level the character knows spells at).
- Cantrips get their own tab labelled "Cantrips" (separate from "1st").
- Each tab label includes a count badge so a player can see at a glance how many spells live in each level.
- The picker variant tracks total picks across tabs and disables checkboxes once the limit is reached, regardless of which tab they're on.
- Feats on the sheet render as a real list grouped by source (Boons, Special).

**Non-Goals:**
- BG3-style spell icons / icon grid. No icon assets.
- Search or text-filter input inside tabs.
- Drag-and-drop preparation.
- Casting from the sheet.
- Restructuring `data/spells.ts` to add new fields (e.g. `concentration`, `range`, `casting_time`). The existing `description` is already a one-paragraph summary; that's enough.
- Mobile-specific responsive redesign — Tailwind's defaults handle stacking on narrow screens.

## Decisions

### Decision 1: Build on the existing shadcn `Tabs` primitive

`components/ui/tabs.tsx` already wraps Base UI's `Tabs` with project theming. Using it keeps the keyboard-nav, focus-ring, and motion-prefs handling consistent with the rest of the app. We import `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` and feed them dynamically per spell level.

**Alternative considered:** roll a custom tab strip with bare buttons + a managed selected state. Cheaper if we end up wanting custom interactions, but we don't, and we'd lose the focus/aria/keyboard niceties for free.

### Decision 2: Component shape — `<SpellTabs>` is a controlled-when-needed picker

```ts
type SpellTabsMode =
  | { kind: "display" }                                    // sheet, no checkboxes
  | { kind: "picker"; selected: ReadonlySet<string>;
      onToggle(spellId: string): void;
      remaining: number };                                 // builder + level-up

interface SpellTabsProps {
  spells: ReadonlyArray<SpellDef>;
  // Which levels to show as tabs; cantrips (0) auto-handled with label "Cantrips".
  levels: ReadonlyArray<SpellLevel>;
  // Optional: a default-active level. Defaults to the lowest in `levels`.
  defaultLevel?: SpellLevel;
  mode: SpellTabsMode;
}
```

The component itself is presentation-only: it groups `spells` by level, renders one `TabsTrigger` per `levels` entry with a count badge, and a `TabsContent` per level with a grid of `<SpellCard>` entries. In picker mode each card is a checkbox; in display mode it's a static info card.

`remaining` lets the picker disable unselected cards once the player has picked the required total. Already-selected cards stay clickable (so the player can deselect).

### Decision 3: Cantrip tab is just spell level 0 with a relabeled trigger

Internally the component groups by `s.level`. The trigger label uses `levelLabel(0) === "Cantrips"`, `levelLabel(1) === "1st"`, etc. No separate code path for cantrips.

### Decision 4: Picker total count lives in the consumer

`SpellsLearnedStep` already tracks `answer.newCantrips` and `answer.newSpells` separately because the level-up engine validates them as separate buckets (`choice.cantrips` vs `choice.spells`). The cantrip tab calls `onToggleCantrip`, leveled tabs call `onToggleSpell`. Two pickers, but both inside one `<SpellTabs>` instance with two onToggle callbacks — or two separate `<SpellTabs>` instances side by side.

After thinking it through: **two instances side by side** keeps the API simple. One `<SpellTabs>` for cantrips (single tab, no level switcher needed but the component still works) and one for leveled spells (multi-tab). Yes, this slightly contradicts the "one component" framing, but the alternative — overloading `<SpellTabs>` with two parallel selection states — is messier than just instantiating it twice.

Actually — simpler: support an optional second-tier count via prop. Or skip the cantrip tab inside the leveled `<SpellTabs>` and render cantrips as their own simple checkbox grid above (no tabs needed for a single category). We'll go with: **`<SpellTabs>` only handles leveled spells; cantrips render in a separate small grid above**. This matches BG3, where cantrip selection is usually a flat list and only leveled spells are tabbed by spell slot.

### Decision 5: Sheet spellbook uses one `<SpellTabs>` with all known levels visible

On the sheet, we know the character's full list of spells known. Compute distinct levels present in the character's known spells (cantrips and leveled), and render those as tabs. The cantrip tab is included here (it's natural to have "Cantrips" alongside "1st", "2nd", etc., in a passive view).

Yes, this means cantrips appear in `<SpellTabs>` for the sheet but not for the picker. That asymmetry is fine — picker has a hard "0 vs 1+" mechanical distinction; sheet doesn't. Both are correct for their use case.

### Decision 6: `<SpellCard>` is the leaf

```tsx
<SpellCard
  spell={spell}
  selected={picker?.selected.has(spell.id)}
  onToggle={picker?.onToggle}
  disabled={picker && picker.remaining <= 0 && !picker.selected.has(spell.id)}
/>
```

Renders: name (font-display), badges (school chip, ritual chip if `spell.ritual`), description (small muted text). In picker mode the card is wrapped in a `<Label>` containing a `<Checkbox>`. In display mode it's just a card with no input.

### Decision 7: `<FeatList>` resolves names + descriptions from `BOON_BY_ID`

```tsx
<FeatList feats={c.feats} />
```

The component:
- Splits `feats` into recognized boons (looked up via `BOON_BY_ID`) and special markers (`change-self`, `fighting-style:*`).
- Renders boons as cards with name + description.
- Renders special markers as a muted "Special" subsection. `change-self` shows "Change Self" with PG p. 51 reference; `fighting-style:archery` parses to "Fighting Style — Archery".
- Empty state: section is hidden if `feats` is empty.

### Decision 8: Update `character-leveling` capability spec, not introduce a new capability

This is a UI improvement to an existing capability. The proposal already commits to widening the `character-leveling` spec to require a tabbed picker. We add **one new requirement** ("The level-up spell picker SHALL group selectable spells by spell level via tabs"), and modify the existing "Spells learned advance with level for any spellcasting approach" requirement's scenarios to acknowledge the tabbed surface (e.g. "the player switches to the 2nd-level tab and the new pool of options is visible").

We don't add a `spell-catalog` requirement update because the catalog itself isn't changing.

## Risks / Trade-offs

- **Existing E2E selectors break.** `e2e/level-up.spec.ts`'s "spells-learned filters known spells (Bless dedupe)" test currently asserts `getByText(/New spells/i)` and `getByLabel(/^Bless\b/)`. Both still apply structurally inside the tabbed layout, but the "Pick from any level you have slots for: 1, 2" line is replaced by tab labels. The "higher-level spells when slots unlock" test will be tightened to assert that a "2nd" tab exists and clicking it shows 2nd-level Theurg spells.
- **Two `<SpellTabs>` rendering modes (picker vs display) make the component slightly busy.** Mitigation: discriminated union on `mode` so type checker forces consumers to handle one shape at a time. ~80 lines is the budget; if it grows past that, split into `<SpellPickerTabs>` and `<SpellDisplayTabs>`.
- **Tab proliferation at high levels.** A L20 Mystic could have known spells at every level 0–9 → 10 tabs. Mitigation: only render tabs for levels with at least one known spell. Empty tabs are hidden.
- **Cantrip-grid-above-picker layout** is slightly inconsistent with the tabs-only sheet view. Acceptable: pickers and sheet have different ergonomic constraints, and the visual divergence is subtle.

## Migration Plan

This is purely additive UI. No data migrations.

1. Land `<SpellCard>` and `<SpellTabs>` first (small, no consumer changes).
2. Switch `character-sheet.tsx` to `<SpellTabs>` (display mode). Verify visually + E2E suite green.
3. Switch `SpellsLearnedStep` to use `<SpellTabs>` for leveled spells (cantrips stay as a flat grid). Update affected E2E selectors.
4. Switch builder `ApproachStep` to use `<SpellTabs>` for the L1 picker.
5. Land `<FeatList>` and switch `character-sheet.tsx` to use it.
6. Run full suite; commit.

Rollback: revert the commit. Persistence is unchanged so saved characters render identically on whichever version of the UI they hit.

## Open Questions

- **Q1**: Should the spellbook tabs on the sheet show all 0–9 levels even when empty (with `0` count, disabled)? Or only levels with spells?
  *Default: only levels with spells.* If we ever surface "spells you could prepare from your tradition list" we'd want all 10, but that's out of scope here.
- **Q2**: Default-active tab on first render?
  *Default: lowest-numbered level present.* Familiar from BG3.
- **Q3**: Mobile width — do tabs wrap or scroll horizontally?
  *Default: let the existing `<TabsList>` wrap.* If it gets crowded we revisit.
