## Context

Today's `AsiOrFeatStep` in `components/level-up/level-up-dialog.tsx:240` renders three controls: a radio for `asi` / `feat` / `change-self` (Changeling-only), an `AsiAllocator` for the ASI mode, and a flat shadcn `<Select>` whose `SelectContent` maps over the entire `BOONS` array. The L1 wizard's `boons-burdens-step.tsx` does the same thing but as a 2-column card grid (`Card` shadcn primitive + name, ability-bonus badge, description, restriction text, and inline ability-pick buttons for choice-bonuses), and the user wants that visual at level-up too.

Symbaroum 5e (PG p. 146) defines three feat *kinds*:

1. **Boons** (and burdens) — anyone can take, already in `data/feats.ts` as `BOONS`. 36 entries.
2. **Origin feats** (PG p. 153) — one (or two for Abducted/Humans) feats per origin: Shadow-sight (Abducted/Humans), Change Self (Changelings), Retribution (Dwarves), Ancient Magic (Elves), Tough and Stringy (Goblins), Big-boned (Ogres, +1 STR), Robust (Trolls), Ravenous Hunger (Undead).
3. **Class feats** (PG p. 155–157) — per-class lists, sometimes with class-level + approach prerequisites:
   - Captain: Battle Speech (Cha 13+), Command Expert, Parry (Str/Dex 13+).
   - Hunter: Overwatch, Ranged Expert, Trick Shot (Dex 13+).
   - Mystic: Combat Magic Expert; Confessor (Theurg 11+, mutually exclusive with Inquisitor); Dedicated Focus (spellcasting ability 13+); Demonologist (Sorcerer 7+); Extensive Learning (spellcasting ability 13+); Inquisitor (Theurg 11+, mutually exclusive with Confessor); Necromancer (Sorcerer 9+); Pyromancer (Wizard 9+); Secrets of the Order (Staff Mage 11+).
   - Scoundrel: Nimble (Dex 13+), Shadow Walker (Dex 13+), Skirmish Expert.
   - Warrior: Bull Rush (Str 13+), Grappler (Str 13+), Melee Expert.

Changeling's "Change Self" is presently a sentinel: the `pick.type === "change-self"` branch stores `c.feats.push("change-self")` (`lib/character/level-up.ts:313`). The id resolves to nothing in `BOON_BY_ID`, so the sheet renders the bare id. Folding Change Self into the origin-feats catalog at id `"change-self"` keeps that string stable for already-saved characters and gains a real card on the sheet.

The `Character.feats` array is just `string[]` — the storage shape is already abstract enough for the new feat ids; no schema change is needed.

## Goals / Non-Goals

**Goals:**

- A level-up player can select between Boons, Origin Feats (filtered to their origin), and Class Feats (filtered to their class) from a card grid that visually matches the L1 boons step.
- Each card surfaces the feat's name, ability-bonus badge (if any), prerequisite text, and full description without requiring a click — the same affordance the L1 wizard provides.
- Class feats with unmet prerequisites (ability score, class level, approach) render as visibly disabled cards (dashed border + reduced opacity, like the L1 boons step does for forbidden boons), with the unmet condition stated.
- Approach-gated class feats only render at all for characters of that approach; e.g. a Sorcerer Mystic does not see Pyromancer (Wizard-only).
- Changeling characters select Change Self via the same picker, not a separate radio option.
- Sheet-side display (`feat-list.tsx`, `printable-sheet.tsx`) resolves any feat id — boon, origin feat, or class feat — to the correct name and description.
- The existing `Character` schema and storage layer are untouched. Persisted `change-self` ids continue to resolve.

**Non-Goals:**

- Modeling the *mechanical effect* of class/origin feats (e.g. Combat Magic Expert's d6 pool, Big-boned's lift bonus). Effects beyond the existing `abilityBonus` field stay description-only — same fidelity as boon descriptions today. A future change can promote selected effects into structured `usage` / `effect` data.
- The "feats are optional and each gaming group must decide" toggle (PG p. 146). The app already treats feats as enabled; no setting to disable feats system-wide.
- Multi-pick feats (Extensive Learning is "may be taken more than once"). The picker disables a feat after it's already in `Character.feats` for now; the PG exception for Extensive Learning is noted as a follow-up.
- Choosing the Bestial-burden's monstrous trait sub-feats (Natural Weapons, Armored, Robust, Regeneration, Wings — PG p. 151). Those are burdens-driven and live with the Burdens flow if they ever get implemented.
- Backfilling the sheet to render Change Self with full description before this change ships — the sheet fallback is a small follow-up but blocks no behavior described above.

## Decisions

### Decision 1: Unify the data shape with `FeatDef`, not by overloading `BoonDef`

Rename / extend the existing shape. Introduce in `lib/character/types.ts`:

```ts
export type FeatCategory = "boon" | "origin" | "class";

export interface FeatDef {
  id: string;
  category: FeatCategory;
  name: string;
  description: string;

  /** +1 ability for boons; +1 STR / +1 STR mod / etc. for origin feats that grant one. */
  abilityBonus?: { ability: Ability | "choice"; amount: 1 };
  abilityBonusChoices?: ReadonlyArray<Ability>;

  /** Free-form text for display (PG wording, e.g. "Strength 13 or higher"). */
  prerequisiteText?: string;

  /** Origin feats: which origin(s) own this feat. PG p. 153 lists feats per origin. */
  origins?: ReadonlyArray<string>;

  /** Class feats: which class owns this feat. PG p. 155–157. */
  classId?: string;
  /** Class feats with an approach-tied prerequisite (e.g. Confessor → Theurg). */
  approachId?: string;
  /** Class feats with a minimum class-level requirement (e.g. Confessor → 11+). */
  minClassLevel?: number;
  /** Ability-score floors enforced at level-up time (e.g. {str: 13} for Grappler). */
  minAbilityScores?: Partial<Record<Ability, number>>;
  /** "spellcasting ability score must be 13+" — resolved against the approach's spellcasting.abilityHint. */
  minSpellcastingAbility?: number;

  /** Mutual-exclusion (Confessor ↔ Inquisitor — "You cannot take both"). */
  excludesFeatIds?: ReadonlyArray<string>;

  /** Hard restriction independent of prerequisites (Dwarves cannot take Absolute Memory). */
  forbiddenOriginIds?: ReadonlyArray<string>;
}
```

`BoonDef` becomes `FeatDef` with `category: "boon"`. Existing call sites that import `BoonDef` switch to `FeatDef`; `BOON_BY_ID` becomes `FEAT_BY_ID` and a `BOONS` re-export filtering by `category === "boon"` stays for the L1 step (which only ever shows boons). Origin feats live as catalog entries with `category: "origin"` and a populated `origins` array; class feats use `category: "class"` plus `classId` and (where applicable) `approachId`, `minClassLevel`, `minAbilityScores`, `minSpellcastingAbility`, `excludesFeatIds`.

**Why one shape over three?** The Picker's job is "render a grid of feat cards across three categories with consistent gating." Three sibling catalogs with three nominally-different types would force three card components, three lookup maps, three sheet-side fallbacks, and triple the surface area for `Character.feats` resolution. One shape with a `category` discriminator collapses that to one catalog (`FEATS`), one `FEAT_BY_ID`, and one card component that conditionally shows the prerequisite line.

**Why preserve `BoonDef` as an alias / re-export?** The L1 boons step (`components/builder/boons-burdens-step.tsx`) and `BOON_FORBIDDEN_ORIGINS` already filter to the boons catalog; keeping `BOONS` exported (as `FEATS.filter((f) => f.category === "boon")`) preserves their existing imports without churning the L1 wizard. `BoonDef` becomes a type alias for `FeatDef & { category: "boon" }` so type-narrowing call sites keep working.

### Decision 2: A single new `LevelUpFeatPicker` component, factored from the L1 boons-step card

The existing L1 step renders feat cards inline. To avoid two implementations drifting (the user's stated goal is *the same view*), extract the card rendering into a shared component (placement: `components/feats/feat-picker-card.tsx` or co-located with `feat-card.tsx`) that takes a `FeatDef`, a selected flag, a disabled flag with reason, and click handlers. The L1 boons step migrates to this component; the new `LevelUpFeatPicker` consumes the same component. This avoids visual drift and keeps the user's "same as creation wizard" expectation literal.

The picker organizes available feats into three sections:

```
[Boons]                — every boon, minus boons forbidden by the character's origin
[Origin Feats]         — feats whose `origins` includes this character's origin
[Class Feats]          — feats whose `classId === character.classId`,
                         optionally further filtered by `approachId`
```

Feats already in `Character.feats` render as disabled with "Already taken" reason. Feats with unmet prerequisites render as disabled with the *specific* unmet reason ("Requires Strength 13 — you have 12"; "Requires Theurg approach"). The L1 step's existing dashed-border + opacity-50 affordance is reused.

### Decision 3: Validation lives in `validateChoiceAnswer`, alongside the existing ASI checks

The `lib/character/level-up.ts` `validateChoiceAnswer` for `asi-or-feat`/`feat` becomes:

```ts
if (pick.type === "feat") {
  const feat = FEAT_BY_ID[pick.featId];
  if (!feat) return "Pick a feat.";
  // origin gate
  if (feat.origins && !feat.origins.includes(c.originId)) return `${feat.name} is for ${feat.origins.join("/")} characters only.`;
  // class gate
  if (feat.classId && feat.classId !== c.classId) return `${feat.name} is a ${feat.classId} feat.`;
  if (feat.approachId && feat.approachId !== c.approachId) return `${feat.name} requires the ${feat.approachId} approach.`;
  if (feat.minClassLevel && c.level < feat.minClassLevel) return `${feat.name} requires class level ${feat.minClassLevel}.`;
  // ability gates
  for (const [ab, min] of Object.entries(feat.minAbilityScores ?? {})) {
    if ((c.abilities[ab as Ability] ?? 0) < min) return `${feat.name} requires ${ab.toUpperCase()} ${min}+.`;
  }
  if (feat.minSpellcastingAbility) {
    const hint = approachById(c.approachId)?.spellcasting?.abilityHint;
    if (!hint || (c.abilities[hint] ?? 0) < feat.minSpellcastingAbility) {
      return `${feat.name} requires spellcasting ability score ${feat.minSpellcastingAbility}+.`;
    }
  }
  // mutual exclusion
  if (feat.excludesFeatIds?.some((id) => c.feats.includes(id))) {
    return `${feat.name} cannot be combined with ${feat.excludesFeatIds.join(", ")}.`;
  }
  // forbidden origins (e.g. Dwarves cannot take Absolute Memory) — already enforced today via BOON_FORBIDDEN_ORIGINS
  if (feat.forbiddenOriginIds?.includes(c.originId)) return `${feat.name} is forbidden for ${c.originId} origin.`;
  return null;
}
```

The `change-self` sentinel branch in `validateChoiceAnswer` and `applyChoiceAnswer` is removed — `pick.type === "feat"` with `featId: "change-self"` covers it because the new origin-feat entry for Change Self has `origins: ["changeling"]`. The `LevelChoiceAnswer` discriminated union loses the `{ type: "change-self" }` arm.

**Ability prerequisites at the moment of leveling** matter because ASI/feat is the same slot — a player who picks "+1 STR via boon X / origin Y" earlier in the same step does *not* get to claim Str 13 for Grappler in the same answer; we evaluate gates against `c.abilities` *before* applying the answer, mirroring 5e's "you must already meet the prerequisite" reading. This matches PG language ("If you ever lose a feat's prerequisite, you can't use that feat…", PG p. 146).

### Decision 4: Removing the `change-self` radio is not a save-file break

`Character.feats` is `string[]` and any saved character with `"change-self"` in the array continues to resolve in the new unified `FEAT_BY_ID`. The migration story is "no migrator." The only thing that actually changes shape is the in-memory `LevelChoiceAnswer` type — which is constructed and consumed within a single level-up session. No on-disk `LevelUpAnswers` exist; the level-up dialog persists nothing mid-session.

**Why remove it instead of leaving the radio dead-code?** Two surfaces means two test paths and two visual states for the same thing, and the user explicitly asked for the boons-step look — which is one card grid, no radio splitting feat from boon from change-self.

### Decision 5: Sheet-side fallback uses `FEAT_BY_ID`, not three-way lookup

`components/sheet/feat-list.tsx` and `printable-sheet.tsx` currently call `BOON_BY_ID[id]`. Both update to `FEAT_BY_ID[id]`. Cards on the sheet for class/origin feats render the same way they do for boons — name, badge if `abilityBonus`, description text. The sheet does not need to know the *category* to render correctly; that's a search/filter concern, not a render concern. (We can optionally pass the category as a `FeatCardBadge` later for visual taxonomy.)

### Decision 6: This is a MINOR release

Per `CLAUDE.md`'s SemVer rules: MAJOR for `Character` schema breaks, MINOR for additive features, PATCH for fixes. This change adds new feat catalogs and picker UI without changing `Character` JSON or invalidating saves. It is a MINOR bump. The `change-self` sentinel removal at the answer-shape level is in-memory only and does not touch save files.

## Risks / Trade-offs

- **[Risk] Approach-gated Mystic feats (Confessor / Inquisitor / Demonologist / Necromancer / Pyromancer / Secrets of the Order) require careful approach-id mapping.** The PG references "Theurg approach", "Sorcerer approach", "Wizard approach", "Staff Mage approach" — those map to existing approach ids in `data/classes.ts` (e.g. `theurg`, `sorcerer`, `wizard`, `staff-mage`). **→ Mitigation:** verify each approach id at task time; add a dev-time assertion in the test suite that every catalog entry's `approachId` resolves to a real approach in `CLASS_BY_ID["mystic"].approaches`.
- **[Risk] Confessor and Inquisitor mutual exclusion is the only `excludesFeatIds` user today; it might be over-engineered for one feat-pair.** **→ Mitigation:** the field is optional and unused otherwise; cost is one extra optional property on `FeatDef` and ~5 lines in the validator. PG language is explicit ("You cannot take both") so encoding it now is worth the cost.
- **[Risk] Re-using the L1 boon-card component for level-up means the L1 step picks up any new badge or layout we add for level-up (and vice versa).** **→ Mitigation:** the shared card takes `FeatDef` plus props for selection / disabled state / disabled reason; behavior diverges entirely through props, not internal logic. A snapshot/visual regression isn't worth setting up just for this — Playwright's existing card-grid scenarios catch L1 regressions.
- **[Risk] `BOON_FORBIDDEN_ORIGINS` is currently a hand-maintained map (`lib/character/validation.ts:40`). After this change there's overlap with `FeatDef.forbiddenOriginIds`.** **→ Mitigation:** retire the legacy map and have validation read `FeatDef.forbiddenOriginIds` exclusively. The L1 boons step also pivots to read it from the catalog. Single source of truth.
- **[Trade-off] Class-feat *effects* are description-only.** Combat Magic Expert and Skirmish Expert add d6 pools that ought to be tracked — but doing that requires extending the existing `featureUsage` machinery (`lib/character/types.ts:639`) to feats, which doubles the scope. We leave a note in tasks.md that promoting these to structured `usage` / `effect` is a follow-up; the current change ships PG-correct *content* and selection.
- **[Trade-off] No filter UI on the picker.** With ~20 boons + 1–2 origin feats + 3–5 class feats, the grid is short enough that explicit search/filter is unnecessary. Sectioning by category is the only structure. Adding filters later is non-breaking.
