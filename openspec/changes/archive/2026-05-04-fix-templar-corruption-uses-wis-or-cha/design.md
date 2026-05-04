## Context

`computeCorruptionThreshold` in `lib/character/compute.ts:174` branches on `ClassDef.shadowFormula`:

- `"standard"` → `max(2, 2 × profBonus + chaMod)` — used by Warrior (Templar's parent class), Hunter, Scoundrel.
- `"mystic"` → `max(2, abilityMod + profBonus)` — used by Mystic, where the ability comes from the approach's `spellcasting.abilityHint`.

The Templar approach (Warrior/Templar) is a half-caster of the Theurg tradition with `spellcasting.abilityHint: "wis"` (`data/level-tables/warrior.ts:458`). Per PG p. 143 it has a *unique* corruption-threshold rule that no other approach in the game shares: the formula stays the standard `2 × profBonus + ability mod`, but the ability is `max(chaMod, wisMod)` instead of just `chaMod`. The current implementation ignores this and always uses Cha because the formula selection happens at the class layer and the approach has no way to influence it.

The Corruption Threshold is surfaced on the character sheet (`components/sheet/character-sheet.tsx`) and the printable export (`components/sheet/printable-sheet.tsx`); both already consume `computeCorruptionThreshold`, so a fix at the compute layer fixes the displayed values everywhere automatically. The current "Corruption Threshold" header tooltip/popover, if any, may also display the formula text — that may need updating to show the correct ability name when the override fires.

The `Character` JSON shape is untouched, so no migrator and no MAJOR bump are needed; this is a PATCH-level rules fix.

## Goals / Non-Goals

**Goals:**

- Templar characters with `wisMod > chaMod` get a Corruption Threshold of `max(2, 2 × profBonus + wisMod)`.
- Templar characters with `wisMod ≤ chaMod` keep today's behavior — `max(2, 2 × profBonus + chaMod)`.
- Non-Templar `"standard"` classes are unaffected.
- The data model expresses the override declaratively on the Templar approach so future approaches with the same shape can opt in by setting one field, and unrelated approaches stay untouched.
- The sheet's Corruption Threshold rendering (header chip, popover, printable export) reads correctly for Templar regardless of which ability won.

**Non-Goals:**

- Touching the Mystic (`"mystic"`) formula or any of the ten Mystic approaches; the bug is confined to the `"standard"` branch.
- Generalizing to "use the higher of any two abilities" for arbitrary approaches — the rule the PG documents is specifically `max(cha, X)` and Templar is the only PG approach using it. Over-generalizing now is YAGNI.
- Adding a per-class `shadowFormula: "templar"` discriminator. The override is approach-level data, not a third class formula, and modelling it as a class formula would forfeit the data-driven approach pattern already used for `spellcasting.abilityHint` and `alwaysKnownSpells`.
- Changing `Character` schema, storage layout, or the migrator. No version of `Character` JSON needs to differ.
- Backfilling persisted data — Corruption Threshold is computed on render, never stored.

## Decisions

### Decision 1: Add `corruptionAbilityOverride?: Ability` to `ApproachDef`

Add an optional field to `ApproachDef` (`lib/character/types.ts`):

```ts
/**
 * For approaches whose corruption threshold uses an ability OTHER than the
 * class's default. Currently used only by Templar (PG p. 143): when set, and
 * when the class's `shadowFormula` is `"standard"`, the corruption-threshold
 * formula uses `max(chaMod, override mod)` instead of `chaMod` alone. Mystic
 * approaches do NOT use this — their ability is read from `spellcasting.abilityHint`.
 */
corruptionAbilityOverride?: Ability;
```

`computeCorruptionThreshold` becomes:

```ts
if (cls?.shadowFormula === "mystic") { /* unchanged */ }

const override = approachById(c.approachId)?.corruptionAbilityOverride;
const standardAbilityMod = override
  ? Math.max(finals.modifiers.cha, finals.modifiers[override])
  : finals.modifiers.cha;
return Math.max(2, profBonus * 2 + standardAbilityMod);
```

Templar's approach entry in `data/classes.ts` (or the Warrior approach builder there) gets `corruptionAbilityOverride: "wis"`.

**Why this shape**

- *Why a new field instead of reusing `spellcasting.abilityHint`?* The Witch Hunter (`hunter.ts:314`) also has `abilityHint: "wis"` and Sorcerer (`mystic.ts:501`) has `cha`; using `abilityHint` would silently change the corruption threshold for every spellcasting approach. The PG only assigns this rule to Templar. A separate field keeps the rule scoped to where the PG puts it.
- *Why `Ability` instead of `{ kind: "max-of"; abilities: Ability[] }`?* The only documented variant is `max(cha, X)`. A scalar ability captures it minimally; if a future approach needs `max(int, wis)` the field can be widened then. YAGNI.
- *Why approach-level instead of a third `shadowFormula` value?* The formula shape (`2× profBonus + abilityMod`) is unchanged — only the ability source differs. A new `shadowFormula: "templar"` would duplicate the standard arithmetic and split logic that wants to stay together.

### Decision 2: Override only fires when the class formula is `"standard"`

`computeCorruptionThreshold` reads `corruptionAbilityOverride` only inside the `"standard"` branch. If a future Mystic approach were given the override by mistake, it would be silently ignored rather than double-applied — the mystic formula already keys off `spellcasting.abilityHint`. This avoids cross-contamination between the two formulas.

### Decision 3: Update the corruption-threshold popover/tooltip on the sheet to reflect the actual ability used

If the sheet's Corruption Threshold header includes a formula line (e.g. *"2 × prof + Cha"*), it must read the same source of truth so a Templar with Wis > Cha sees *"2 × prof + Wis"*. The cleanest approach is to expose a sibling helper alongside `computeCorruptionThreshold` — for example `computeCorruptionThresholdAbility(c): Ability` — that returns which ability won, so UI strings stay in sync without re-deriving the rule. This avoids divergence between the number and the formula label.

If the existing UI does not render a per-character formula label, this decision collapses to "no change required"; the implementation tasks will confirm before adding the helper.

### Decision 4: This is a PATCH release

Per `CLAUDE.md`'s release rules: MAJOR is for `Character` schema breaks, MINOR for additive features, PATCH for fixes. This change adds one optional field on `ApproachDef` (a static-data type, not `Character`), fixes a miscalculation, and breaks no save files. It is a PATCH. The release commit follows the standard `release: vX.Y.Z` flow described in `CLAUDE.md`.

## Risks / Trade-offs

- **[Risk] A Templar character whose Corruption Threshold value players had memorised will appear to "increase" after the fix → Mitigation:** Add a CHANGELOG entry under `Fixed` calling out the rule reference (PG p. 143) so the change is visible. The new value is the correct one; no players' data is invalidated.
- **[Risk] Future approaches gain similar overrides and someone copy-pastes `corruptionAbilityOverride: "cha"` thinking it's "the standard" → Mitigation:** Document on the field that it is *only* the override and that the default ability is already Cha. Naming the field `…Override` (not `…Ability`) reduces the temptation to set it to the default value.
- **[Risk] `corruptionAbilityOverride` accidentally placed on a class with `shadowFormula: "mystic"` → Mitigation:** The compute layer scopes the read to the `"standard"` branch, so a misplaced field is inert. A spec scenario asserts this explicitly so a future generalisation can't quietly start applying it.
- **[Trade-off] Approach-level data over class-level discriminator:** A `shadowFormula: "templar"` would localise the rule in one switch; the approach-level field requires both a class-formula check and an approach lookup. Picked the latter to keep parity with the existing approach-driven spellcasting model and to keep the formula-arithmetic a single expression.
