## Context

The L1 builder applies origin ASI in two places:

1. The **origin step** (`components/builder/origin-step.tsx`) lets the player allocate floating bonuses (`originAsiAllocation`) and pick a sub-choice (`originSubchoiceId`) when the origin offers one.
2. The **abilities step** (`components/builder/abilities-step.tsx`) displays each ability's final score as `base + fixed[ab] + floating[ab]`, where `base = draft.abilities[ab]`, `fixed = origin.asi.fixed`, and `floating = draft.originAsiAllocation`.

The downstream sheet uses `computeFinalAbilities` from `lib/character/compute.ts`, which additionally folds in sub-choice ASI (Human → Ambrian +1 INT, Human → Barbarian +1 WIS) and any boon/burden ability bonuses. The wizard's abilities step today reads `origin.asi.fixed` and `originAsiAllocation` only — it does **not** add `subchoice.asi`. This may be an existing bug; if the test exposes it, the fix is a separate change.

The existing builder happy-path spec walks Abducted Human (+2 floating to STR) but never asserts on the abilities step's display values — it just clicks through Standard Array. The proposed spec is the first one to read the abilities-step UI back and verify origin math.

## Goals / Non-Goals

**Goals:**
- New `e2e/origin-asi.spec.ts` that drives the wizard to `/builder/abilities` for several origins and asserts the Final Ability Scores cards display the correct base, bonus, and total.
- Coverage shapes: fixed-only-then-floating (Abducted Human), an origin with sub-choice ASI (Human), and the floating "Remaining: 0" gate's effect on advancing.
- Tests share the patterns already used by `e2e/builder.spec.ts` (no LocalStorage seed, click cards, click "+" buttons by index, assert on visible text).

**Non-Goals:**
- Fixing any production bug the spec uncovers (e.g. sub-choice ASI not surfacing on the abilities step's display). If the test asserts the correct behavior and fails, file a separate change.
- Adding sheet-level assertions about `computeFinalAbilities` — sheet math is already covered by `e2e/sheet.spec.ts` and unit-style tests via the existing fixtures.
- Refactoring the abilities step to expose `data-testid` attributes; the test reads visible text matching what a player sees.

## Decisions

### Decision: Assert on visible text, not test-ids

The Final Ability Scores cards render `{total}` and `base {base} +{bonus}` (`abilities-step.tsx:91-99`). Playwright can match on these text fragments scoped to the ability's row. This keeps the source code free of test-only attributes and matches the assertion style of the rest of the suite (which uses role/text locators).

Alternative considered: add `data-testid="ability-final-{ab}"` attributes. Rejected — the existing suite consistently avoids this pattern.

### Decision: Three test cases, not a parametrized sweep

The spec adds three discrete tests rather than parametrizing across all 9 origins. Each origin has a different sub-choice/floating shape, and a per-origin loop would obscure assertion intent. The three cases below cover the meaningful permutations:

1. **Abducted Human** — fixed `{dex: 1, wis: 1}` + floating `{count: 1, size: 2}`. Allocate +2 to STR. Assert on the abilities step: STR shows "+2", DEX shows "+1", WIS shows "+1", and untouched abilities show no bonus.
2. **Human → Ambrian** — fixed `{str: 2}` + floating `{count: 1, size: 1}` + sub-choice `{int: 1}`. Allocate +1 to CHA. Assert: STR shows "+2", CHA shows "+1", INT shows "+1" (from the sub-choice). Then click the Barbarian sub-choice tile; INT bonus disappears, WIS shows "+1".
3. **Floating-allocation gate** — pick Abducted Human but do not allocate the floating point. The "Continue" toast on the origin step should mention remaining floating bonuses (per `validateStep`); the URL must not advance to `/builder/background`. Allocate, advance, and on the abilities step verify the bonus is present.

### Decision: Use Standard Array on the abilities step for stable assertions

`abilities-step.tsx:41` sets the Standard Array bases (`str:8, dex:10, con:12, int:13, wis:14, cha:15`) when the tab is active, which is the default. Asserting against these known bases makes the expected totals deterministic without computing any values in the test.

## Risks / Trade-offs

- [Risk] The Human sub-choice assertion may fail today because the abilities step reads `origin.asi.fixed` only, not `subchoice.asi`. → Mitigation: write the assertion against the correct expected behavior anyway. If it fails, treat the failure as the spec's signal of a real bug; open a follow-up change to fix `abilities-step.tsx` to include `subchoice.asi` in the displayed bonus, mirroring `computeFinalAbilities`. Document this risk on the failing test with a `// TODO(...)` if it lands red.
- [Risk] Locating the floating "+" buttons by index is brittle if `ABILITY_ORDER` changes. → Mitigation: matches the existing `e2e/builder.spec.ts` approach; if the order ever changes, both specs adjust together.
- [Trade-off] Three tests instead of a sweep means new origins won't be auto-covered. Acceptable: rule shapes (fixed-only, fixed+floating, fixed+floating+subchoice) are stable.
