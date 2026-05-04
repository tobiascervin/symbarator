## Context

`AbilityScoreBoost.floating` (`lib/character/types.ts:107`) is `{ count: number; size: 1 | 2; rule: "any-one" | "any-other" }`. The two rules cover:

- `any-one` — pick any ability (used by some origins where the floating goes anywhere).
- `any-other` — pick any ability *except* one already named in `fixed`.

`origin-step.tsx`'s `eligibleForFloating(ab)` reads the rule:

```ts
const eligibleForFloating = (ab: Ability): boolean => {
  if (!selectedOrigin) return false;
  const rule = selectedOrigin.asi.floating?.rule;
  if (rule === "any-other") return !(ab in fixed);
  return true;
};
```

PG p. 71 says Human's +1 floating must go to DEX, CON, *or* CHA — a stricter rule than "any non-STR" (the current `any-other` interpretation). The sub-choice ASI (Ambrian +1 INT, Barbarian +1 WIS) is layered on top and is **not** a player choice that competes with the floating, so the `from` list isn't affected by the active sub-choice.

## Goals / Non-Goals

**Goals:**
- The wizard's floating allocator only enables abilities the origin actually allows. For Human, that's DEX/CON/CHA.
- The validator on advance from `/builder/origin` rejects allocations to abilities outside the allowed list (defense in depth — the picker disables the `+` buttons, but a hand-edited save shouldn't slip through).
- Audit all other origins for similar PG restrictions and encode them while the file is open. (Catching one bug doesn't excuse leaving the others uncited.)

**Non-Goals:**
- Renaming or restructuring the `rule` discriminator. The simplest fix is an additive optional `from` field; touching the rule names would churn every origin.
- Migrating saved characters that previously allocated to a now-disallowed ability. Persisted state is fine — only the wizard's pickers and the origin-step validator change.
- Touching the abilities step's display. It already correctly shows whatever is allocated, regardless of legality.

## Decisions

### Decision: add an optional `from?: ReadonlyArray<Ability>` to `floating`

```ts
floating?: {
  count: number;
  size: 1 | 2;
  rule: "any-one" | "any-other";
  /** When present, restricts allocation to this exact list of abilities,
   *  intersected with whatever `rule` already excludes. */
  from?: ReadonlyArray<Ability>;
};
```

`eligibleForFloating(ab)` becomes:

```ts
const eligibleForFloating = (ab: Ability): boolean => {
  const f = selectedOrigin?.asi.floating;
  if (!f) return false;
  if (f.rule === "any-other" && ab in fixed) return false;
  if (f.from && !f.from.includes(ab)) return false;
  return true;
};
```

The validator (`lib/character/validation.ts`) already only checks the *count*, not the per-ability legality. We add a per-ability check for `from` when set, so a hand-edited save with an illegal allocation is rejected on advance.

**Alternative considered:** introduce a new rule variant `"from"` and require `from` when set. Rejected because it makes the existing rules harder to compose (`any-other` AND `from` is a natural intersection — encoding it as a single `"from"` rule would make Human's restriction silently lose the implicit "exclude STR fixed" guard).

### Decision: audit every origin while we're here

The fix is a few lines, but the audit catches latent bugs in other origins. Decision: read the PG entries for all 9 origins (Abducted Human, Changeling, Dwarf, Elf, Goblin, Human, Ogre, Troll, Undead). If any has a restricted floating list per RAW, encode it and cite the page. Document the audit results in design.md so a future contributor knows it was checked.

Output of audit (PG v1.0.2):
- **Abducted Human** (p. 64): `Increase your Dexterity and Wisdom scores by 1 each, then add 2 to any other ability score of your choice.` → `rule: "any-other"` is correct. **No `from` needed.**
- **Changeling** (p. 65): `Your Wisdom score increases by 2. Increase any other ability score by 1.` → `rule: "any-other"` is correct. **No `from` needed.**
- **Dwarf** (p. 67): `Your Constitution score increases by 2. Increase any other ability score by 1.` → `any-other`, no restriction. **No `from` needed.**
- **Elf** (p. 68): `Your Wisdom score increases by 2. Increase any other ability score by 1.` → `any-other`, no restriction. **No `from` needed.**
- **Goblin** (p. 69): `Your Dexterity score increases by 2. Increase any other ability score by 1.` → `any-other`, no restriction. **No `from` needed.**
- **Human** (p. 71): `Your Strength score increases by 2. Increase Dexterity, Constitution or Charisma by 1.` → **restricted; needs `from: ["dex", "con", "cha"]`.**
- **Ogre** (p. 81): `Your Strength score increases by 2. Increase any other ability score by 1.` → `any-other`. **No `from` needed.**
- **Troll** (p. 87): `Your Constitution score increases by 2. Increase any other ability score by 1.` → `any-other`. **No `from` needed.**
- **Undead** (p. 91): `Your Constitution score increases by 2. Increase any other ability score by 1.` → `any-other`. **No `from` needed.**

So Human is the only origin with a restricted floating list under RAW. Apply the fix exactly to Human; all other origins remain `rule: "any-other"`.

### Decision: fold the origin's fixed ASI directly into the allocator cell value

Today's allocator (`origin-step.tsx:230-265`) renders one cell per ability with the player's *floating* allocation as the headline number (e.g. `+0`, `+1`, `+2`). The origin's fixed ASI is not visible inside the allocator — it appears only in the origin card's summary text ("ASI: STR +2 · +1 to 1 other"). For a player on Human distributing the floating point, the disconnect can mask the full picture: STR is greyed-out (because it's fixed) but the cell shows `+0`, hiding the underlying `+2`.

Fix: each cell's main `+{value}` displays the *total* origin contribution per ability — `fixed[ab] + originAsiAllocation[ab]`. The `+`/`−` buttons modify only the floating portion (`originAsiAllocation[ab]`), so STR on Human reads `+2` (uneditable; the `+`/`−` are disabled), and CHA reads `+0` initially → `+1` after the player allocates. INT/WIS on Human read `+0` and are dimmed (no fixed bonus, and not in `from`).

**Alternative considered (rejected):** render a separate "origin +N" badge above the cell value, keeping the cell's main number as the floating portion only. Rejected because the user's intent (verbalized during apply) is "just show the static bonus directly in the value slot, no separate card." A separate badge added visual clutter without buying anything — the source distinction (fixed vs floating) is implicit in whether the buttons are enabled. The simpler folded value is what the player wants to read.

In the current data, no origin has both a `fixed[ab]` entry and floating allowed on the same ability (the `any-other` rule excludes fixed, and Human's `from` excludes its STR). So the "fixed + floating" sum on a single ability is always one or the other in practice, and the displayed `+{total}` reads cleanly.

### Decision: do not migrate saves with an existing illegal Human allocation

Existing characters that picked Human and allocated the floating +1 to INT or WIS keep their saved `originAsiAllocation` on load (the migrator runs once and doesn't touch `originAsiAllocation`). The next time they visit `/builder/origin`, the picker shows the illegal value but the `+` button on INT/WIS is now disabled — they can `−` back to 0 and re-allocate. The Continue button on the origin step is gated by the validator's per-ability check, so they can't advance with the illegal allocation still set.

This is consistent with the project's general migration philosophy (additive, non-destructive). A migration that auto-rebalanced the allocation would silently change the player's stats; preferring an explicit re-allocate keeps player intent visible.

## Risks / Trade-offs

- [Risk] An existing Human character with `originAsiAllocation: { int: 1 }` re-visits the origin step and is forced to re-allocate, which could feel disruptive. → **Mitigation**: the disabled `+` button + the visible `Remaining: 1` (after they `−`) make the new constraint obvious; no silent stat changes.
- [Risk] Future origins added by Symbaroum content packs may also have restricted lists; a contributor might forget to add `from`. → **Mitigation**: design.md's audit table lists every origin and its rule; this change adds a regression test that asserts Human's restricted list, so a contributor accidentally widening Human will trip the test.
- [Trade-off] Two ways to express "any non-fixed" eligibility (`rule: "any-other"` alone or `rule: "any-other"` + redundant `from`). The intersection semantics make this safe — the implementation accepts both — but readers should prefer omitting `from` when the rule alone suffices.

## Migration Plan

UI/data only. No `Character` schema, persistence, or migration impact for the `Character` type itself.

Steps:
1. Edit `lib/character/types.ts`: add optional `from?: ReadonlyArray<Ability>` to `AbilityScoreBoost.floating`.
2. Edit `data/origins.ts`: add `from: ["dex", "con", "cha"]` to Human's floating; cite PG p. 71 in a comment.
3. Edit `components/builder/origin-step.tsx`: extend `eligibleForFloating` to honor `from`; render an "origin +N" badge in each allocator cell when `origin.asi.fixed[ab]` is non-zero.
4. Edit `lib/character/validation.ts`: extend the origin-step validator to reject allocations whose abilities are not in `from` (when `from` is set).
5. Extend `e2e/origin-asi.spec.ts` with two assertions: (a) Human floating allocator's INT and WIS `+` buttons are disabled while DEX, CON, and CHA are enabled; (b) Human's STR allocator cell visibly displays the `+2` fixed-bonus badge.
6. `npm run lint` / `npm run test:e2e`.

Rollback: revert the four file edits and the test. Nothing else is affected.

## Open Questions

- Should the abilities step's "Final Ability Scores" card visually flag an out-of-RAW allocation on a legacy save (e.g. an asterisk on the disallowed ability)? Default no — the wizard picker constraint will guide the player back into RAW on next visit, and the sheet doesn't need to advertise stale state.
