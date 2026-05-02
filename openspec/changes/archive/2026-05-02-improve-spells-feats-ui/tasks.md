## 1. Reusable components

- [x] 1.1 `components/spells/spell-card.tsx` — display + picker modes via discriminated union
- [x] 1.2 `components/spells/spell-tabs.tsx` — wraps shadcn `Tabs`; tabs per level with count badge; auto-hides empty levels; default-active = lowest level
- [x] 1.3 `components/sheet/feat-list.tsx` — resolves boons via `BOON_BY_ID`, special markers (`change-self`, `fighting-style:*`) get a separate group; renders `null` on empty

## 2. Sheet integration (display mode)

- [x] 2.1 `<SpellTabs mode={{ kind: "display" }}>` replaces the two `<SpellList>` calls in `character-sheet.tsx`; new local `SheetSpellbook` helper computes the levels prop from `spellPicks.cantrips` + `spellPicks.spellsKnown`
- [x] 2.2 `<FeatList feats={c.feats} />` replaces the inline feats blurb; the section is wrapped in its own `<Parchment>` and only renders when `feats.length > 0`
- [x] 2.3 The legacy `<SpellList>` helper deleted from `character-sheet.tsx`

## 3. Level-up picker (picker mode)

- [x] 3.1 `SpellsLearnedStep` uses `<SpellTabs>` for leveled spells; cantrips remain a flat grid above
- [x] 3.2 `selected: ReadonlySet<string>` derived from `answer.newSpells`; `onToggle` calls existing `toggle("newSpells", id)`; `remaining = (choice.spells ?? 0) - answer.newSpells.length`
- [x] 3.3 Inline `(L{s.level})` annotation removed — the tab itself shows the level
- [x] 3.4 "Pick from any level you have slots for: 1, 2" hint paragraph removed; empty-state error retained

## 4. L1 builder picker

- [x] 4.1 `<SpellTabs ... levels={[1]}>` replaces the 1st-level grid in `approach-step.tsx`; cantrips stay as a flat grid
- [x] 4.2 `spellsSelected` memoized from `draft.spellPicks?.spellsKnown`; `onToggle` calls existing `toggleSpell`

## 5. Test updates

- [x] 5.1 Bless dedupe test still passes against the tabbed picker (the `getByLabel(/^Bless\b/)` assertion is structurally unchanged)
- [x] 5.2 "Higher-level spells when slots unlock" test rewritten: asserts `getByRole("tab", { name: /^1st\s/ })` and `/^2nd\s/` are visible
- [x] 5.3 New "spell-tabs switch the visible pool when clicked" test: clicks the 2nd tab and asserts a 2nd-level Theurg spell ("Aid") becomes visible
- [x] 5.4 New `e2e/sheet.spec.ts` with two tests: tabs render for known spell levels (Cantrips + 1st, no 3rd); clicking the 1st tab swaps the visible pool to spells like Magic Missile

## 6. Verification

- [x] 6.1 `npx tsc --noEmit` clean
- [x] 6.2 `npm run build` green
- [x] 6.3 `npm run test:e2e` — 24/24 pass (was 21; +3 new tests)
- [x] 6.4 Manual spot-check deferred — left to user; the E2E coverage above exercises every surface (sheet display, level-up picker, builder L1 picker via the unchanged Bless-dedupe + Mystic-progression tests)
