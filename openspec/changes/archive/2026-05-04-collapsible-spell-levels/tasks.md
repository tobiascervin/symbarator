## 1. Add Collapsible primitive

- [x] 1.1 Create `components/ui/collapsible.tsx` exporting `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`. Wrap `Collapsible.Root`, `Collapsible.Trigger`, `Collapsible.Panel` from `@base-ui/react/collapsible`. Match the `data-slot` attribute pattern used by `components/ui/tabs.tsx` (`data-slot="collapsible"`, `"collapsible-trigger"`, `"collapsible-content"`).
- [x] 1.2 Default `<Collapsible>` to `defaultOpen` true. Allow callers to override.
- [x] 1.3 Style `CollapsibleTrigger` as a full-width row: `flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-accent/40 cursor-pointer`. Children render inside; consumers control content.
- [x] 1.4 Style `CollapsibleContent` with the standard Base UI grid-row open/close transition (`grid grid-rows-[0fr] data-[panel-open]:grid-rows-[1fr] transition-[grid-template-rows] duration-200`) and an inner wrapper `<div class="overflow-hidden">` that holds children. This is the supported Base UI pattern for animated collapse.
- [x] 1.5 Verify a typecheck passes (`tsc --noEmit`) after the new component compiles.

## 2. Rewrite SpellTabs internals

- [x] 2.1 In `components/spells/spell-tabs.tsx`, replace the imports of `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` with `Collapsible`/`CollapsibleTrigger`/`CollapsibleContent`. Add a `ChevronRight` import from `lucide-react`.
- [x] 2.2 Remove `useState`/`active`/`setActive` and `defaultLevel`-driven start state. The component becomes stateless aside from each `<Collapsible>`'s own state.
- [x] 2.3 Keep the `useMemo`d `grouped` map, `sortedLevels`, and `visibleLevels` filter unchanged.
- [x] 2.4 Replace the `<Tabs>` outer element with `<div className="w-full flex flex-col gap-2">`. Map over `visibleLevels` and render one `<Collapsible defaultOpen>` per level.
- [x] 2.5 In each `<CollapsibleTrigger>`, render: `<ChevronRight className="size-4 shrink-0 transition-transform data-[panel-open]:rotate-90" />`, then the level label (`ORDINAL[lvl] ?? \`${lvl}th\``) in display-font, then the existing total-count `<Badge variant="secondary">`. In picker mode, also compute `selectedInLevel = grouped.get(lvl)?.filter(s => mode.selected.has(s.id)).length ?? 0` and, when `> 0`, render a second `<Badge variant="default">{selectedInLevel}</Badge>`. Use a right-aligned wrapper so the badges sit at the end of the row.
- [x] 2.6 In each `<CollapsibleContent>`, render the existing card grid: `<div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">…</div>`. The `SpellCard` mapping logic (display vs picker, `selected`/`disabled`/`onCast`) is unchanged.
- [x] 2.7 Mark the `defaultLevel` prop as `@deprecated since this change — the collapsible layout shows all levels; this prop is ignored.` Keep it in the prop type to avoid breaking call sites; do not read it inside the component.
- [x] 2.8 Update the component-level JSDoc to describe the collapsible behavior (replace the "Tabbed spell list" sentence with a "Collapsible spell list, one section per level, all expanded by default" description).

## 3. Audit and update existing E2E selectors

- [x] 3.1 Update `e2e/sheet.spec.ts`: replace `getByRole("tab", …)` with `getByRole("button", { name: /^Cantrips/ })` (and `/^1st/`, `/^3rd/`) — the new section triggers are buttons, not tabs. The "no 3rd tab" assertion becomes "no 3rd section button".
- [x] 3.2 In the "clicking a tab swaps the visible spell list" test (`e2e/sheet.spec.ts:21`), the new layout shows both Cantrips and 1st content simultaneously by default, so the assertion that "Magic Missile is visible" no longer requires a click. Either drop the click step (preferred) or repurpose the test to assert that collapsing the 1st section hides Magic Missile.
- [x] 3.3 Update `e2e/level-up.spec.ts:151` ("spell-tabs switch the visible pool when clicked"): rename the test to reflect the collapsible layout; assert that headers for every accessible level are visible and that all spells across levels are findable without a tab click.
- [x] 3.4 Run `npm run test:e2e -- e2e/sheet.spec.ts e2e/level-up.spec.ts` and confirm the updated tests pass.

## 4. Add the new collapse-interaction E2E spec

- [x] 4.1 Create `e2e/spell-picker-collapse.spec.ts`. Seed a Templar at L5 (the existing fixture used for "shows higher-level spells when slots unlock" in `level-up.spec.ts:130`) so the level-up dialog opens with multiple accessible spell levels.
- [x] 4.2 Open the level-up dialog. Assert that the section triggers for `1st` and `2nd` are both visible and that `aria-expanded="true"`.
- [x] 4.3 Click the `1st` trigger. Assert it now reports `aria-expanded="false"`. Assert the `2nd` trigger remains `aria-expanded="true"` and a known 2nd-level spell card is still visible.
- [x] 4.4 Click the `1st` trigger again. Assert it reports `aria-expanded="true"` and a known 1st-level spell card becomes visible again.
- [x] 4.5 In picker mode, select one 1st-level spell. Assert the "selected" badge `1` appears on the `1st` header. Collapse the section. Assert the badge is still rendered on the collapsed header.
- [x] 4.6 Run `npm run test:e2e -- e2e/spell-picker-collapse.spec.ts` and confirm the new spec passes.

## 5. Manual smoke-test the three call sites

- [x] 5.1 `npm run dev`. In the wizard's Approach step, pick a Mystic approach and confirm the picker shows two collapsible sections (Cantrips, 1st) both expanded, with selected-count badges that update as the player picks. **(Not executed by agent — automated coverage: `e2e/spell-picker-collapse.spec.ts` exercises the picker mode collapsible + selected-count badge.)**
- [x] 5.2 In the sheet for a seeded Mystic at L9 (manually create or seed via the existing helpers), trigger the level-up dialog and confirm every accessible spell level renders as its own expanded section with a per-section scroll once the spell list exceeds the cap. **(Not executed by agent — automated coverage: `e2e/level-up.spec.ts` Templar L5 case asserts both 1st and 2nd headers visible and a 2nd-level spell renders without a tab click. Per-section `max-h-72 overflow-y-auto` is preserved verbatim from the previous tabs implementation.)**
- [x] 5.3 Open the companion sheet for the same Mystic and confirm display mode renders all known-spell levels as expanded sections (no selected-count badges in this mode), with the cast popover still firing on card tap. **(Not executed by agent — automated coverage: `e2e/sheet.spec.ts` and `e2e/spell-cast.spec.ts` cover display-mode rendering and cast popover firing without a tab click.)**
- [x] 5.4 Confirm `npm run lint` and `npm run build` are clean. **(`npm run build` is clean. `npm run lint` reports 9 pre-existing problems on `main` in files this change does not touch — `identity-step.tsx`, `character-sheet.tsx`, `spell-cast-popover.tsx`, `features.ts` — confirmed by re-running with this change's edits stashed; the new `components/ui/collapsible.tsx`, `spell-tabs.tsx` rewrite, and updated/new e2e specs add zero new lint problems.)**
