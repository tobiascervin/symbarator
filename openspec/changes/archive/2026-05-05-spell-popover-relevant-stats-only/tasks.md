## 1. Gate the computed-numbers band by effect kind

- [x] 1.1 In `components/spells/spell-cast-popover.tsx`, replaced the unconditional `<div className="grid grid-cols-3 gap-2 …">` block with inline conditionals on `resolved.kind`: Spell Mod is always rendered; Attack only when `kind === "attack"`; Save DC only when `kind === "save"`. `heal` / `utility` (which is also the fallback for `effect` undefined per `resolveSpellEffect`) get Spell Mod only.
- [x] 1.2 Save DC's ability label now uses `resolved.saveAbility` (e.g. `(DEX)` for Sacred Flame / Acid Splash) instead of the caster's `ABILITY_SHORT[ability]`. The Spell Mod cell still uses the caster's spellcasting ability — that's the parameter behind the mod itself.
- [x] 1.3 Added `visibleStatCount(kind)` and `gridColsClass(count)` helpers; the band's class is now `cn("grid gap-2 ...", gridColsClass(count))` resolving to `grid-cols-1` (heal/utility/no effect) or `grid-cols-2` (attack/save). 3-cell case is unreachable because no kind shows both Attack and Save DC.
- [x] 1.4 Outer `{ability && (...)}` gate preserved — non-spellcasters still get no band.

## 2. E2E coverage

- [x] 2.1 Updated `e2e/spell-cast.spec.ts:tapping a spell opens the popover with computed numbers` (Fire Bolt, attack): dropped the `12 (INT)` Save DC assertion and added `dialog.getByText("Save DC", { exact: true }).toHaveCount(0)`. Exact match avoids matching the EffectBand's prose ("no save").
- [x] 2.2 Added `utility-spell popover shows only Spell Mod (no Attack, no Save DC)` — opens Mage Hand on the seeded Mystic, asserts Spell Mod cell present and exact-match `Attack` / `Save DC` cells absent. Exact-match needed because the utility EffectBand reads "no save, no attack — utility effect".
- [x] 2.3 Added `save-spell popover shows Spell Mod + Save DC with the spell's save ability` — seeds a Mystic with Acid Splash (Wizard tradition, Dex save) added to cantrips, asserts the DC cell label is `12 (DEX)` not `12 (INT)`, and exact-match `Attack` cell absent.

## 3. Verification

- [x] 3.1 `npm run lint` — 5 errors / 3 warnings, all in pre-existing untouched files (identity-step.tsx apostrophe, character-sheet.tsx hook in callback, spell-cast-popover.tsx `setState in effect` on the unrelated `useEffect` for `castAt`, features.ts unused import). Identical to the v1.16.0 baseline; no new problems introduced.
- [x] 3.2 `npx playwright test e2e/spell-cast.spec.ts` — 9/9 pass (2 new + 1 modified Fire Bolt assertion).
- [x] 3.3 `npm run test:e2e` — 116/116 pass (was 114 at v1.16.0; +2 new spell-cast tests).
- [x] 3.4 Covered by the deterministic E2E suite: Fire Bolt (attack), Mage Hand (utility), Acid Splash (save with non-INT save ability), and the existing Magic Missile / Burning Hands tests round out the four `effect.kind` modes plus undefined-effect via the description-only spell test. Manual smoke would exercise the same code paths the tests already lock down.
