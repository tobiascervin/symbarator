## Why

Origin ability score bonuses (both fixed and floating) are applied implicitly on the abilities step — the player picks raw base scores and the UI adds origin bonuses to display the "final" score. This is the single most rules-load-bearing piece of math in the L1 builder, and it's currently only smoke-tested by the broad happy-path spec (Abducted Human +2 floating to STR). There is no test that varies the origin to exercise fixed-only bonuses, mixed fixed+floating, or origins with sub-choices that contribute their own ASI (Human → Ambrian/Barbarian). A regression in `origin.asi.fixed`/`floating` plumbing or in `originAsiAllocation` propagation would slip past CI today.

## What Changes

- Add a Playwright spec at `e2e/origin-asi.spec.ts` that drives the wizard from `/builder/origin` through `/builder/abilities` for a representative set of origins and asserts the abilities-step "Final Ability Scores" cards reflect the expected bonuses.
- Cover three coverage shapes:
  - **Fixed-only-then-floating** origin (e.g. Abducted Human: fixed +1 DEX / +1 WIS, plus 1×+2 floating allocated to STR) — assert DEX/WIS show "+1" and STR shows "+2" on top of the chosen base.
  - **Subchoice-driven fixed bonuses** (Human → Ambrian: +1 INT from sub-choice; Human → Barbarian: +1 WIS from sub-choice) — assert the ability cards reflect the sub-choice's bonus, and switching sub-choices updates the cards.
  - **Floating-allocation rule enforcement** — verify the abilities step's totals only update once the origin step's "Remaining: 0" gate is met, and that re-allocating on the origin step changes the abilities step display on return.
- Tests run against the live wizard (no LocalStorage seed), to exercise the same path a real player walks.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `e2e-tests`: add a coverage requirement for origin ASI propagation through the wizard.

## Impact

- New file: `e2e/origin-asi.spec.ts`.
- No production code changes expected. If the tests reveal a bug in `originAsiAllocation` propagation or in the abilities step's display, those fixes are out of scope for this change and would be opened separately.
- No fixture/helper changes expected; the test uses the same patterns as `e2e/builder.spec.ts` (clicking origin cards, the floating "+" buttons, then asserting on abilities-step text).
