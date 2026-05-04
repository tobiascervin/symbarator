## Why

The wizard's abilities step (`components/builder/abilities-step.tsx`) computes the displayed bonus on the "Final Ability Scores" card from `origin.asi.fixed + originAsiAllocation` only — sub-choice ASI (e.g. Human → Ambrian's `+1 INT`, Human → Barbarian's `+1 WIS`) is silently dropped from the wizard's display. The downstream sheet's `computeFinalAbilities` in `lib/character/compute.ts` already folds sub-choice ASI in correctly, so a Human/Ambrian character looks like they have INT 13 in the wizard but INT 14 once they reach the sheet. The discrepancy is invisible in the happy-path flow but actively misleading: a player picking a sub-choice for the +1 INT can't see the +1 in the wizard preview, so they'd reasonably assume the rule didn't apply.

The bug is currently tracked by `test.fail()` on `e2e/origin-asi.spec.ts:Human sub-choice ASI updates the abilities-step display when toggled` — the assertion was deliberately landed red in v1.14.0 to act as a regression tripwire for this fix.

## What Changes

- Update `abilities-step.tsx`'s "Final Ability Scores" computation to add sub-choice ASI (`origin.subchoices?.options.find(o => o.id === draft.originSubchoiceId)?.asi`) into the bonus addend, mirroring `computeFinalAbilities`.
- The displayed `bonus` and `total` MUST update reactively when the player switches sub-choices on `/builder/origin` (e.g. Ambrian ↔ Barbarian) without a full page reload.
- Flip the `test.fail()` annotation off the existing `e2e/origin-asi.spec.ts` "Human sub-choice ASI updates" test once the fix lands, so it becomes a regular passing assertion.
- Optional polish (decided in design.md): align how the floating-allocation eligibility rule treats abilities that already receive a sub-choice ASI bump — today's `eligibleForFloating` only considers `origin.asi.fixed`, so an Ambrian could still allocate floating to INT on top of the sub-choice +1. The PG's "any-other" rule is ambiguous on this; default decision is to leave it alone for now.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `character-creation`: tighten the abilities-step display requirement to include sub-choice ASI in the displayed bonus, matching the sheet's `computeFinalAbilities` behavior.

## Impact

- `components/builder/abilities-step.tsx` — read `originSubchoiceId` from the draft, resolve the sub-choice's `asi` map, fold its values into the per-ability `bonus` computation. ~5 lines of additive logic.
- `e2e/origin-asi.spec.ts` — flip `test.fail("Human sub-choice ASI updates …")` to a normal `test(…)` so the green assertion verifies the fix.
- No `Character` schema change. No storage shape change. No migration.
- Existing characters automatically pick up the corrected display on next render — they were always seeing the correct totals on the sheet; only the wizard preview catches up.
