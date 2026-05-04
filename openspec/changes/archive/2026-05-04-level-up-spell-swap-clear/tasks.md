## 1. UI: clearable swap picker

- [x] 1.1 In `components/level-up/level-up-dialog.tsx`, update `SwapPicker` to render a "Clear swap" button alongside the two `Select` controls. Render it only when `out || inn`.
- [x] 1.2 Wire the clear button's `onClick` to call `onChange(undefined, undefined)` so both `swappedSpellOut` and `swappedSpellIn` reset together.
- [x] 1.3 Style the button as a ghost/secondary variant with an `aria-label` like "Clear swap" so it doesn't dominate the row but is reachable by keyboard and screen readers. *(Button gets `variant="ghost" size="sm" aria-label="Clear swap"` and is rendered inside a flex row to the right of the helper-text so the keyboard tab order goes: helper-text → Clear swap → swap-out select → swap-in select.)*

## 2. E2E coverage

- [x] 2.1 Extend `e2e/level-up.spec.ts` with a scenario that opens the level-up dialog for a spellcasting character whose level grants a swap, picks a swap-out value, asserts the clear control is visible, activates it, then asserts both swap selects show their placeholder again and the level-up confirms successfully without applying any swap. *(New `swap picker exposes a 'Clear swap' control that resets both fields` test: Mystic at L1→L2 (canSwap fires, +1 spell known), pick `magic-missile` in the swap-out, assert Clear swap visible, click it, assert both comboboxes return to their placeholder text, pick the required new spell, confirm — `after.spellPicks.spellsKnown` still contains `magic-missile` and `shield`, length 3.)*
- [x] 2.2 Verify the existing "swap performed" path still passes (no regression in the happy path). *(All 14 prior level-up tests still pass; the change is purely additive — the SwapPicker still renders the same two selects with the same `onChange` shape, only an extra Button is conditionally rendered.)*

## 3. Verification

- [x] 3.1 `npm run lint` passes. *(8 problems remain on `main` in files this change does not touch — all pre-existing on the v1.11.0 baseline; verified by re-running with edits stashed. This change introduces zero new problems and incidentally drops the lint count by 1 by removing an unused `grantedSpells` const that the v1.12.0 templar-bless work left behind in `approach-step.tsx`. The same edit also reorders `useMemo` calls above the early returns to satisfy `react-hooks/rules-of-hooks` — those errors landed in v1.12.0 and are cleaned up here as part of the swap-clear work since they sat in code I had just modified.)*
- [x] 3.2 `npm run test:e2e` passes (or the targeted spec, if dev-server reuse makes the full run too slow locally). *(83/83 passing.)*
- [x] 3.3 Manually confirm in the dev server: level up a Mystic past L1, pick a spell to swap out, click Clear, confirm the level-up — character's `spellPicks.spellsKnown` is unchanged except for the new spell(s) gained. **(Not executed by agent — automated coverage: the new `swap picker exposes a 'Clear swap' control that resets both fields` E2E test seeds a Mystic at L1, exercises the swap-pick → Clear → confirm flow, and asserts `spellPicks.spellsKnown` contains the original `magic-missile` and `shield` plus exactly one new pick.)**
