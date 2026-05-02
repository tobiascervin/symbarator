## Context

The L1 wizard has 7 steps today (`origin → background → class → approach → abilities → skills-equipment → identity`). `Character.boons: string[]` and `Character.burdens: string[]` are persisted but no step writes to them, no validator reads them, no compute helper uses them, and the sheet doesn't surface them. `data/feats.ts` already exports a typed `BOONS` array (30 entries) and `BURDENS` array (4 entries) with a `BoonDef` shape that includes optional `abilityBonus` (`{ ability: Ability | "choice"; amount: 1 }`), `abilityBonusChoices`, `prerequisite`, and `restriction` (free-text).

Constraints:
- The schema needs to grow without breaking pre-1.3 saves. The storage migrator already handles forward-only normalization; we follow that pattern.
- The wizard step pattern is deliberately rigid: `STEPS` is the source of truth in `lib/character/validation.ts`, `STEP_LABELS` is its companion, the per-step UI is a switch in `app/builder/[step]/page.tsx`, and `WizardShell` validates on advance via `validateStep`. Adding a step touches all four sites.
- Boon `restriction` text is currently free-form prose ("Dwarves cannot take this boon (already part of their origin)"). Enforcing those restrictions programmatically requires a small structured rules layer or a per-restriction allow/deny check.
- The choice-boon UX (Wild Talent, Beast Tongue, etc.) needs a second selector inside the same step.

## Goals / Non-Goals

**Goals:**
- One coherent place in the wizard where the player picks a boon and (optionally) a burden, with full ability-bonus flow-through to the abilities sheet.
- Boon's chosen ability persists, so reloading or leveling up keeps the choice intact.
- The sheet shows a Boons section and a Burdens section, mirroring the new Feats section visually.
- Existing saved characters continue to load.

**Non-Goals:**
- Variant "trade burdens for extra boons" rule.
- A live preview of post-boon ability scores on the abilities step itself (the player will see the totals on the sheet; live cross-step preview would require restructuring how `computeFinalAbilities` is consumed).
- A general-purpose programmable restrictions DSL. We hand-encode the small set of restrictions that actually matter.
- Sheet-side editing of boons after creation. (Re-enter the wizard via Edit, same as today.)
- Boons granted by feats at level-up (e.g. taking a boon as the L4 ASI/feat alternative) — that pathway already exists via `Character.feats` and is independent.

## Decisions

### Decision 1: Place the step between `abilities` and `skills-equipment`

```
origin → background → class → approach → abilities → boons-burdens → skills-equipment → identity
```

Reasoning: Boons can grant ability bonuses, so the player should pick the boon AFTER setting their base abilities (so they can target the right ability). It also reads naturally — abilities first, then the small "extra" each character starts with, then equipment.

**Alternative considered:** Fold into the abilities step as a sub-section. Rejected because the abilities step already has three sub-tabs (Standard Array / Point Buy / Manual) and adding a fourth concern bloats it. Boons are a meaningful character-defining choice and deserve their own page.

### Decision 2: Persist boon ability choice via a new field, not by mutating `originAsiAllocation`

```ts
interface Character {
  ...
  boons: string[];                          // existing
  boonAbilityChoices: Record<string, Ability>;   // new — keyed by boon id
}
```

Empty `{}` when no boons or no choice-boons. Choice-boons must have an entry. Compute helpers read both arrays together.

**Alternative considered:** Store the choice as a suffix on the boon id (`"beast-tongue:wis"`). Rejected because every consumer would need to parse the id, and the canonical id stays in `BOON_BY_ID`.

**Alternative considered:** Reuse `originAsiAllocation`. Rejected because that field is an origin-only concern and mixing creates confusing math (origin floating ASI + boon +1 both flow through the same bucket).

### Decision 3: `computeFinalAbilities` adds a `boonBonuses` term

The function signature stays the same; the returned `bonuses` field aggregates `originFixed + originFloating + subchoiceAsi + boonBonuses`. We add a fourth term resolved at render time:

```ts
function boonBonusesFor(c: Character): Record<Ability, number> {
  const acc = zeroAbilities();
  for (const id of c.boons) {
    const boon = BOON_BY_ID[id];
    if (!boon?.abilityBonus) continue;
    const ability =
      boon.abilityBonus.ability === "choice"
        ? c.boonAbilityChoices[id]
        : boon.abilityBonus.ability;
    if (!ability) continue; // not yet picked — skip
    acc[ability] += boon.abilityBonus.amount;
  }
  return acc;
}
```

Edge case: if a boon is in `c.boons` but its `abilityBonus.ability === "choice"` and no entry exists in `c.boonAbilityChoices`, the bonus simply doesn't apply. The wizard validator catches this at advance-time, so the only way to land in this state is a hand-edited JSON.

### Decision 4: Restrictions are a small, hand-coded allow/deny check

The 30 boons have a few "X cannot take this" prose lines (e.g. Absolute Memory + Dwarves, Beast Tongue + certain origins). Rather than build a DSL, we add a small `boonRestrictions(boon, character): string | null` helper next to the validator that returns a user-facing error or null. For boons whose only restriction is "X cannot take this — already part of their origin", we hard-code the origin id. For boons with no machine-checkable restriction, we just show the `restriction` text as a warning and let the player proceed.

**Alternative considered:** Add structured `forbiddenOrigins: string[]` to `BoonDef`. We may do this in a future iteration; for v1 hand-coding ~3–5 specific cases keeps the data model untouched.

### Decision 5: The step is optional

A character with no boons and no burdens is valid. The validator accepts 0 picks of each. This matches the PG default ("0 boons unless GM allows"). Players whose tables don't use boons just click Continue.

This also means the step is fast: most characters spend 5 seconds on it.

### Decision 6: Sheet integration via `<FeatList>` extension, not a third component

`<FeatList>` already groups feats into "Boons" (resolved via BOON_BY_ID) and "Special". Looking at it now: the "Boons" group there is misnamed — it's resolved boon ids that landed via the LEVEL-UP flow (i.e. `Character.feats`, not `Character.boons`). Fixing that ambiguity:

- Rename the existing FeatList "Boons" group to "Feats (Boons)" or just "Feats".
- On the sheet, add separate "Boons" and "Burdens" sections that read from `Character.boons` / `Character.burdens` and render via the same card style. Reuse `FeatList`'s internal `Group` helper or factor it out.

Actually, the cleanest split: factor `Group` into a shared `<FeatGroup>` and have the sheet render three groups in their own Parchment section: "Origin Boons" (from `Character.boons`), "Burdens" (from `Character.burdens`), and "Level-up Feats" (from `Character.feats`). Or keep them in one Parchment with three subheadings. Either works; we'll go with separate Parchments since the sheet already uses Parchments per concern.

### Decision 7: STEPS is widened with `"boons-burdens"`; a forward-only schema migration handles legacy saves

```ts
export const STEPS = [
  "origin",
  "background",
  "class",
  "approach",
  "abilities",
  "boons-burdens",   // new
  "skills-equipment",
  "identity",
] as const;
```

For legacy saves: characters created before this change have `boons: []`, `burdens: []`, and (after migration) `boonAbilityChoices: {}`. The boons-burdens step's validator accepts 0/0, so legacy characters re-entering the wizard via "Edit" land cleanly on each step in turn.

For URLs already referenced: `/builder/skills-equipment?id=...` still works. The new step lives at `/builder/boons-burdens?id=...`.

## Risks / Trade-offs

- **Breaks the existing builder happy-path E2E test** — the test walks all 7 steps; now it'll fail at the new boons-burdens step. Mitigation: update the test to either skip the new step (fast forward by clicking Continue with no picks, which is valid) or pick a simple boon. Trivial fix.
- **Sheet-side rename of FeatList "Boons" group** — there's an internal label ambiguity to clean up. Mitigation: factor out `<FeatGroup>` and use it explicitly per source. Touching `FeatList` requires re-running its tests.
- **Hand-coded restrictions don't cover every PG constraint** — we'll only encode 3–5 specific cases (e.g. Dwarves blocked from boons that duplicate their origin features). The rest fall through to "show the restriction text, let the player decide". Acceptable tradeoff; a structured `forbiddenOrigins`/`requiredOrigin` extension to BoonDef can land later if it becomes annoying.
- **Choice-boons require two clicks (pick boon, pick ability)** — the UX needs to surface the second prompt clearly. Mitigation: the boon card expands inline when selected to show the ability picker. Same pattern as the origin step's subchoices.

## Migration Plan

1. Land schema + migration first (additive). All existing saves load identically.
2. Land compute changes (`computeFinalAbilities` + boonBonusesFor).
3. Land the wizard step.
4. Land the sheet integration.
5. Update the builder happy-path E2E test.
6. Add a new E2E test for the boon flow.
7. `/minor` release.

Rollback: revert the change. Persisted characters with boons keep their `boons` field (it's a string array), the bonus just isn't applied on the older build.

## Open Questions

- **Q1**: Should the wizard step show a "Skip" button explicitly, or rely on the player just clicking Continue with nothing selected?
  *Default: rely on Continue. Both result in 0 picks; the explicit "Skip" adds noise.*
- **Q2**: When a player swaps origin after picking a boon (back-button to origin step, then forward), should the boon validation re-run if the new origin restricts that boon?
  *Default: yes. `validateStep` already runs on each Continue; if the player's chosen boon is now restricted, the toast surfaces it and they can re-pick.*
- **Q3**: For boons with no `abilityBonus` field at all (some PG boons grant only a flavor effect), do we still need a wizard prompt?
  *Default: yes — the wizard lists every BOON; flavor-only boons are picked the same way as bonus-granting ones. The compute helper just adds 0.*
