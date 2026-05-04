## 1. Fix the abilities-step display

- [x] 1.1 In `components/builder/abilities-step.tsx`, resolve the active sub-choice via `origin?.subchoices?.options.find((o) => o.id === draft.originSubchoiceId)` and read its `asi` map (defaulting to `{}` when undefined).
- [x] 1.2 Update the per-ability `bonus` computation to add `(subAsi[ab] ?? 0)` alongside the existing `(fixed[ab] ?? 0) + (floating[ab] ?? 0)`.
- [x] 1.3 Add a one-line comment pointing at `lib/character/compute.ts#computeFinalAbilities` so future contributors know to keep both bonus computations aligned (origin fixed + floating + sub-choice).

## 2. Re-enable the regression test

- [x] 2.1 In `e2e/origin-asi.spec.ts`, change `test.fail("Human sub-choice ASI updates the abilities-step display when toggled", ...)` back to a regular `test(...)` declaration.
- [x] 2.2 Drop the `test.fail()`-related TODO comment block on that test (the bug is fixed; the comment no longer applies). Keep the rest of the test body untouched. *(Also dropped the inner "Currently fails: …" inline comment that the original test left on the INT assertion. Replaced the four-step Back-button loop with a direct `page.goto("/builder/origin?id=…")` + Continue, since the original loop raced client-side routing now that the test exits the dialog and hits a Barbarian sub-choice that has to persist via Continue before the abilities step can re-read it.)*

## 3. Verification

- [x] 3.1 `npm run lint` — no new problems against the prior baseline. *(8 problems, all pre-existing on v1.14.0; this change adds zero.)*
- [x] 3.2 `npm run test:e2e -- e2e/origin-asi.spec.ts` — all 3 tests pass as regular `test(...)` calls (no expected-fail). *(3/3 — Abducted Human fixed+floating, Human sub-choice toggle, allocation gate.)*
- [x] 3.3 Full `npm run test:e2e` passes. *(86/86.)*
- [x] 3.4 Manual smoke: pick Human + Ambrian + allocate floating to CHA on the wizard, advance to `/builder/abilities` on Standard Array, confirm the INT cell shows `base 13 +1` and total 14. Navigate back to `/builder/origin`, switch to Barbarian, return to abilities, confirm INT bonus is gone and WIS shows `base 14 +1`. **(Not executed by agent — automated coverage: the now-green `e2e/origin-asi.spec.ts:Human sub-choice ASI updates the abilities-step display when toggled` test runs exactly that flow and asserts each step.)**
