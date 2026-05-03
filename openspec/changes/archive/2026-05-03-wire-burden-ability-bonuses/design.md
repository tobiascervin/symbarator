## Context

In v1.6.0 the L1 Boons & Burdens flow became opt-in via a per-character house rule, and the burden catalog filled out to the canonical 16 PG entries. The bonuses each burden grants — `+2 to X` for most, `+1/+1` for Dark Blood — are presently captured only as text in `data/feats.ts` descriptions. `BurdenDef` has no `abilityBonus` field, `Character` has no per-burden choice storage analogous to `boonAbilityChoices`, and `computeFinalAbilities` (in `lib/character/compute.ts`) folds in origin / floating ASI / subchoice ASI / boon bonuses but skips burdens entirely. Boons already work this way: `BoonDef.abilityBonus`, `Character.boonAbilityChoices`, `boonBonusesFor(c)` inside compute, and an inline ability picker on choice-boons in the wizard. The work here is to mirror that pattern for burdens, with a small extension to handle Dark Blood's `+1/+1` shape.

## Goals / Non-Goals

**Goals:**

- A picked burden's bonus shows up in `computeFinalAbilities` and therefore on the sheet's stat block, ability checks, and saves derived from those scores.
- Choice-burdens (Addiction, Impulsive, Seizures, Ward, Dark Blood) require the player to pick before the wizard advances — no quietly-zero bonus from an empty choice.
- The wizard picker visually surfaces each burden's bonus the same way boons do (`+2 CON` badge), so the trade-off is legible at pick time.
- Existing characters keep loading: any save without `burdenAbilityChoices` gets `{}` from the migrator and renders cleanly. A previously-picked fixed-bonus burden (e.g. Bestial) starts contributing to the stat block on the first load after upgrade.

**Non-Goals:**

- Auto-applying Dark Blood's `+2` permanent Corruption to `Character.corruption.permanent`. The wizard surfaces a one-line warning chip; the player adjusts the existing Corruption panel manually.
- Any new compute helper for derived burden side-effects beyond ability bonuses.
- Re-validating already-saved characters: the migration backfills the choice map but does not retroactively run `validateStep("boons-burdens", c)` against pre-v1.6 data. The next visit to the wizard will catch any missing choice, as the existing flow does for boons.

## Decisions

### Decision: shape `BurdenDef.abilityBonus` as a discriminated union, not three separate fields

```ts
export type BurdenBonus =
  | { kind: "fixed"; ability: Ability; amount: 2 }
  | { kind: "choose-one"; from?: ReadonlyArray<Ability>; amount: 2 }
  | { kind: "choose-two"; from?: ReadonlyArray<Ability>; amount: 1 };

export interface BurdenDef {
  // ... existing fields
  abilityBonus?: BurdenBonus;
  startingCorruption?: number;
}
```

The discriminator (`kind`) lets the picker, validator, and compute helper switch on shape without deriving it from field presence. Omitting `from` on a `choose-*` variant means "any of the six abilities" (used for Addiction, where the PG ties the ability to the drug type — encoded as a free choice for simplicity rather than a drug picker).

**Alternatives considered:**

- Mirror `BoonDef.abilityBonus = { ability: Ability | "choice"; amount: 1 }` exactly — would need a second field for the +1/+1 case (Dark Blood) and either an array of bonuses or a boolean discriminator. Less honest; `+2`-vs-`+1/+1` is genuinely different.
- A single `abilityBonus: BurdenBonus[]` array — overengineered for one case; current PG content has no burden granting more than one bonus shape.

### Decision: storage shape — `burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>`

A normalized array (length 1 for `choose-one`, length 2 for `choose-two`) avoids mixing single-vs-array union types. Fixed-bonus burdens never get an entry. The wizard's picker writes the ordered selection on click; validation requires `length === 1` or `length === 2` per the burden's `kind`.

**Alternatives considered:**

- `burdenAbilityChoices: Record<string, Ability | [Ability, Ability]>` — less ergonomic in compute and validation (`Array.isArray` branch); requires more careful typing.
- Two separate fields (`burdenAbilityChoice` for `choose-one`, `burdenAbilityChoicePair` for `choose-two`) — splits the storage across two keys for the same conceptual thing.

### Decision: compute integration mirrors `boonBonusesFor` exactly

```ts
function burdenBonusesFor(c: Character): Record<Ability, number> {
  const acc = emptyAbilityRecord();
  for (const id of c.burdens) {
    const b = BURDEN_BY_ID[id];
    const bonus = b?.abilityBonus;
    if (!bonus) continue;
    if (bonus.kind === "fixed") {
      acc[bonus.ability] += bonus.amount;
    } else {
      const choices = c.burdenAbilityChoices[id] ?? [];
      for (const ab of choices) acc[ab] += bonus.amount;
    }
  }
  return acc;
}
```

Then `computeFinalAbilities` adds `burden[k]` to each ability total, alongside the existing `boon[k]` add. The change is one new function and one term per ability — minimal blast radius.

### Decision: Dark Blood's permanent Corruption is a manual side-effect

The wizard surfaces a warning chip (`"+2 permanent Corruption — track manually"`) on the Dark Blood card when selected. `Character.corruption.permanent` is not auto-incremented by the burden pick. Two reasons:

1. `corruption.permanent` is a player-mutable field (the Corruption panel on the sheet has `+`/`−` adjusters used during play). Auto-incrementing on pick and decrementing on unpick assumes the player hasn't touched it in between, which they may have. A clean implementation would split "starting permanent corruption" from "earned permanent corruption" — out of scope.
2. The cost is small: the player gets a clear warning at pick time and uses the existing Corruption panel to tick it up.

If this proves annoying in practice, a follow-up could add a `Character.startingCorruption: number` field that compute folds into the displayed Corruption total without touching the player-mutable `permanent` field.

### Decision: wizard picker reuses the boon's choice-picker pattern, not a custom dual-pick widget for Dark Blood

For `choose-one` burdens, render the same row of ability buttons used for choice-boons. For `choose-two`, render the same row but in toggle-select mode (max 2 distinct picks; clicking a third deselects the oldest). The validation message strings differ but the interaction model stays familiar.

**Alternative:** a dedicated two-slot picker (two dropdowns, each defaulting to "—") for Dark Blood. Cleaner UX but a one-off widget for one burden. Toggle-select with a counter ("2 of 2 chosen") is good enough.

### Decision: badges on the sheet — one badge per `+X ABL` term

A `choose-two` Dark Blood character with `["str", "wis"]` renders two badges (`+1 STR` and `+1 WIS`) on its FeatCard, not one combined badge. Matches how boons render and reads cleanly alongside fixed `+2 CON` burdens.

## Risks / Trade-offs

- **Risk: a saved character with a previously-picked fixed-bonus burden (e.g. Bestial) suddenly has +2 to that ability after upgrade.** → Intended behavior, but worth calling out in the changelog: "burden bonuses are now mechanically applied; characters that already had a burden picked will see the corresponding +2 (or +1/+1) appear on their stat block on first load." If the player had already adjusted abilities to compensate, they may want to reset. Acceptable — this is the change in motion.
- **Risk: choice-burden picks made before the validator runs leave `burdenAbilityChoices` empty and contribute nothing.** → Same shape as choice-boons today; the validator catches this on Continue and the sheet shows the burden card without bonus badges.
- **Risk: hand-edited JSON imports may have `burdenAbilityChoices` entries with wrong-cardinality arrays (e.g. 3 abilities for a `choose-one` burden) or abilities outside the burden's `from` list.** → Compute tolerates extras (sum what's given), but the wizard's validator enforces length-and-list on the next visit. Acceptable; pre-existing pattern for boons.
- **Trade-off: the manual Dark Blood Corruption side-effect is a footgun.** → Mitigated by an explicit warning chip with copy. Tracked as a known limitation.
- **Risk: existing E2E `freshL1Hero` and other fixtures don't have `burdenAbilityChoices`.** → The makeBase helper adds the new field as `{}` once, propagates everywhere via spread.

## Migration Plan

1. Land the schema change (`BurdenDef.abilityBonus` + `Character.burdenAbilityChoices`) plus the `data/feats.ts` content additions in a single commit. Migrator backfills `burdenAbilityChoices: {}` for missing field.
2. Land the compute, validator, picker UI, and sheet badge changes in a follow-up commit (or the same — they're not risky in isolation, just cleaner reading split).
3. Update E2E fixtures and add new tests as part of the implementation work.

No production data is at risk — storage is per-browser localStorage. Anyone whose data needs adjusting after the bonuses go live can revisit the wizard, re-pick the burden (re-prompted for any choice), and re-tune their abilities if they had been compensating manually.

## Open Questions

- For Addiction, is "any of the six abilities" the right encoding, or should we constrain to the three drug-tied abilities (Con, Wis, Str) the PG names? Going with "any of six" for simplicity in v1; a follow-up could add a "drug type" sub-choice if the table cares. Worth flagging at picker design time.
- Should the wizard surface a tooltip on the Continue button when a choice-burden is unsatisfied (mirroring the Continue toast)? Today the validator fires on click; pre-disabling Continue would be nicer UX but is a broader pattern change.
