## Why

The Human origin's floating ASI is currently encoded as `rule: "any-other"` in `data/origins.ts`, which lets the player allocate the +1 to any of the five non-STR abilities (DEX, CON, INT, WIS, or CHA). The Player's Guide v1.0.2 p. 71 restricts the choice explicitly:

> **Ability Score Increase.** Your Strength score increases by 2. Increase Dexterity, Constitution or Charisma by 1.

So a Human currently allocating the floating +1 to INT or WIS produces a character that doesn't match RAW. (Sub-choices already grant +1 INT for Ambrian and +1 WIS for Barbarian — the floating point is additional and capped to physical/social abilities.)

The bug is silent: the validator accepts the over-permissive allocation, the abilities step displays the result correctly, and the sheet computes totals that pass schema checks. Only the rule is wrong.

## What Changes

- Extend `AbilityScoreBoost.floating` with an optional `from?: ReadonlyArray<Ability>` field that, when present, restricts the floating allocation to that list of abilities (over and above the existing `rule` filter).
- Set Human's floating to `from: ["dex", "con", "cha"]`, citing PG p. 71 in a code comment.
- Update the origin step's `eligibleForFloating(ab)` to honor `from` when present (intersect with whatever `rule` already excludes, e.g. fixed for `any-other`).
- Audit every other origin's `floating` rule against the PG. If any other origin (Abducted Human, Changeling, Dwarf, Elf, Goblin, Ogre, Troll, Undead) has a similarly restricted RAW rule, encode the same `from` field. If they're all "any-other", document the audit in the change so future-me knows it was checked.
- **Fold the origin's fixed ASI directly into each allocator cell's main value** so the player sees the full origin contribution per ability while distributing the floating points (e.g. for Human: STR cell reads `+2` directly from the fixed bonus; DEX/CON/CHA cells read `+0` initially, `+1` after the player allocates). The cell's `+`/`−` buttons modify only the floating portion — they're disabled on STR (fixed) and on INT/WIS (not in Human's `from` list).
- E2E coverage: extend `e2e/origin-asi.spec.ts` with one Human-specific test that asserts: (a) the floating allocator's INT and WIS `+` buttons are disabled while DEX, CON, and CHA are enabled; (b) the STR allocator cell's value reads `+2` directly (no separate badge — the value IS the fixed bonus).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `character-creation`: tighten the origin floating-ASI eligibility rule so an origin MAY further restrict the eligible abilities to a fixed list, and apply that restriction to Human per PG p. 71. Also tighten the origin step's allocator UI so it surfaces the origin's fixed bonus inline alongside the player's floating allocation per ability.

## Impact

- `lib/character/types.ts` — `AbilityScoreBoost.floating` gains an optional `from?: ReadonlyArray<Ability>`. Additive; existing origin defs without the field continue to validate.
- `data/origins.ts` — Human's `asi.floating` declares `from: ["dex", "con", "cha"]`. Other origins are audited; any with similar PG restrictions also get a `from` field.
- `components/builder/origin-step.tsx` — `eligibleForFloating` honors `from` when present; allocator cells render the origin's fixed ASI alongside the floating allocation (e.g. STR cell shows `+2 (origin)` for Human even though the cell's `+`/`−` are disabled because STR is fixed).
- `lib/character/validation.ts` — origin-step validator rejects allocations whose abilities are not in `from` (defense in depth; the picker disables the `+` buttons, but a hand-edited save shouldn't slip through).
- `e2e/origin-asi.spec.ts` — new assertions on the Human floating allocator's enabled/disabled buttons and on the inline fixed-bonus rendering.
- No `Character` schema change. No persistence/migration impact. Existing characters that allocated their Human floating +1 to INT or WIS keep their saved allocation as-is on first load (the validator only rejects on advance from the origin step, not on load); the next time they revisit the origin step, the `−` button still works to reduce the allocation back to 0, but the `+` button on INT/WIS is now disabled. The displayed total drops by 1 once they re-allocate to a legal ability.
- E2E suite: 86 → 88 tests after the new assertions land.
