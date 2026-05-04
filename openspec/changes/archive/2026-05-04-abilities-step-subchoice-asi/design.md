## Context

`AbilitiesStep` (`components/builder/abilities-step.tsx`) renders a "Final Ability Scores" card with one cell per ability. Each cell's `bonus` is computed as:

```ts
const fixed = origin?.asi.fixed ?? {};
const floating = draft.originAsiAllocation;
// ...
const bonus = (fixed[ab] ?? 0) + (floating[ab] ?? 0);
```

This omits `subchoice.asi` — the ASI map carried by an origin sub-choice (e.g. Human → Ambrian declares `asi: { int: 1 }`, Human → Barbarian declares `asi: { wis: 1 }`). The downstream sheet uses `computeFinalAbilities` from `lib/character/compute.ts`, which already folds sub-choice ASI in alongside fixed, floating, boon, and burden bonuses, so the persisted character is correct — only the wizard preview is stale.

The two affected origins today are **Human** (`{ ambrian: int +1, barbarian: wis +1 }`) and **Goblin** (its sub-choices also carry per-clan ASI per `data/origins.ts`). Origins without sub-choices (Abducted Human, Changeling, Dwarf, Elf, etc.) are unaffected. The fix has a tiny blast radius: a single extra `useMemo`-style lookup against `origin.subchoices?.options.find(o => o.id === draft.originSubchoiceId)?.asi`, summed alongside the existing fixed and floating values.

## Goals / Non-Goals

**Goals:**
- The wizard's "Final Ability Scores" card displays the correct bonus and total for every origin, including those with sub-choice ASI (Human Ambrian/Barbarian, Goblin clans).
- Switching the sub-choice on `/builder/origin` re-renders the abilities step with the new bonus on next visit (existing draft-state plumbing already provides this — no changes needed beyond the read).
- The displayed total continues to match what `computeFinalAbilities` produces for the same `Character` shape, so the wizard preview and the post-finish sheet agree.

**Non-Goals:**
- Refactoring `abilities-step.tsx` to call `computeFinalAbilities` directly. The compute helper folds in boons / burdens / floating that are not finalized at this step (boons & burdens come from a later step). Mirroring just the origin portion keeps the wizard's preview aligned with what's known so far.
- Changing the floating-allocation eligibility rule. Today's `eligibleForFloating(ab)` only considers `origin.asi.fixed`, so a Human → Ambrian could still allocate floating to INT on top of the sub-choice +1. The PG's "any-other" rule is ambiguous on this — leaving it alone for now matches the v1.14.0 behavior.
- Touching `computeFinalAbilities`. It's already correct.
- Changing the sub-choice picker UI on the origin step.

## Decisions

### Decision: read sub-choice ASI inside the existing bonus computation, not via `computeFinalAbilities`

The simplest fix is one extra lookup in `AbilitiesStep`:

```ts
const subchoice = origin?.subchoices?.options.find(
  (o) => o.id === draft.originSubchoiceId,
);
const subAsi = subchoice?.asi ?? {};
// ...
const bonus = (fixed[ab] ?? 0) + (floating[ab] ?? 0) + (subAsi[ab] ?? 0);
```

This keeps the abilities step in charge of its own preview math (boons & burdens aren't picked yet, so the step computes a partial bonus by design). Calling `computeFinalAbilities` would force an awkward "subset of bonuses" carve-out and tie the wizard preview to the sheet's compute path more tightly than necessary.

**Alternative considered:** call `computeFinalAbilities(draft).bonuses[ab]` for the displayed bonus. Rejected because the helper assumes a fully-populated `Character` (boons + burdens + boon-ability-choices + burden-ability-choices). Calling it mid-wizard would either need defaulting (a partial character with empty boons works, but the contract is fuzzy) or a new helper. The 3-line read is clearer.

### Decision: do not change `eligibleForFloating`

Today's eligibility rule only considers `origin.asi.fixed` — a sub-choice ASI on INT does NOT exclude INT from receiving floating. This is preserved by the fix. If the PG's "any-other" rule is later reinterpreted to also exclude sub-choice ASI'd abilities, that's a separate change with its own scenarios.

### Decision: flip the existing `test.fail()` to a regular `test()` as part of this change

The v1.14.0 release left a `test.fail()` annotation on `e2e/origin-asi.spec.ts:Human sub-choice ASI updates the abilities-step display when toggled` deliberately so the green pass would catch the moment the bug got fixed. Removing the `.fail()` is a one-character edit and makes the assertion a normal forward-going regression guard. Doing it in the same change keeps the bug-and-fix bracketed in git history.

## Risks / Trade-offs

- [Risk] A hand-edited save with a `subchoice.id` that doesn't exist in the origin's `subchoices.options` would `.find(...)` to `undefined` and contribute 0 — same as today. → No mitigation needed; matches existing handling for malformed `originSubchoiceId`.
- [Risk] Sub-choice ASI on an ability that *also* receives a floating allocation would now stack visibly (+1 from sub-choice +1 from floating = +2). The total is correct per `computeFinalAbilities`, but the displayed addend is "+2" without a breakdown by source. → Acceptable for v1; if players complain, a future change can split the addend into fixed/floating/sub-choice with tooltip detail.
- [Trade-off] Slight duplication between the abilities step's bonus math and `computeFinalAbilities`. Both now know about origin fixed + floating + sub-choice. The cost is a few lines and a comment pointing at `compute.ts` so future contributors keep them aligned.

## Migration Plan

UI-only change. No `Character` schema, persistence, or migration impact. Existing characters automatically pick up the corrected display on next render.

Steps:
1. Edit `abilities-step.tsx`: read `originSubchoiceId`, resolve sub-choice via `origin?.subchoices?.options.find(...)`, fold its `asi` into the bonus.
2. Flip `test.fail("Human sub-choice ASI updates the abilities-step display when toggled", ...)` to `test(...)` in `e2e/origin-asi.spec.ts`.
3. `npm run test:e2e` — the previously red test goes green; remaining suite unchanged.

Rollback: revert the two file edits.

## Open Questions

- Should the displayed addend visually distinguish sub-choice ASI from fixed and floating (e.g. `+1 (origin) +1 (sub) +1 (floating) = +3`)? Default no; the total + base is the load-bearing readout. Re-evaluate if a player flags confusion.
