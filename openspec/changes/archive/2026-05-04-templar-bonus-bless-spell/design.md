## Context

`ApproachSpellcasting` (in `lib/character/types.ts`) currently models only player-chosen spells: `cantripsKnownAt1`, `spellsKnownAt1`, `spellSlotsAt1`, and a 20-row `progression`. The Templar approach (`data/level-tables/warrior.ts#TEMPLAR_SPELLCASTING`) follows the same shape, so the player picks 2 cantrips + 1 first-level spell from the Theurg list — matching the chart in PG p. 143 — but the always-granted *bless* described in PG p. 143 (and quoted in `data/classes.ts` for the Templar level-1 feature) is not represented anywhere in the data, in `computeSpellcasting`, or on the sheet.

The Templar is the only L1 approach in the game that grants a bonus spell beyond its choice budget, but the same shape recurs at higher levels for many casters (e.g. Mystic subclass spells, deity-granted spells, oath spells in vanilla 5e). Modelling the concept as a generic "always-known" list on the approach keeps the door open for future approaches without further schema work.

## Goals / Non-Goals

**Goals:**
- Templar characters automatically have *bless* in their spellbook from L1 onward, regardless of which spells they pick in the wizard.
- Granted spells are visible (and clearly labelled as granted) in the builder's approach step, and they appear in the sheet's spellbook tabs the same way chosen spells do.
- The schema is generic — adding a granted spell to any other approach in the future is a one-line data change with no code changes.

**Non-Goals:**
- Granting different spells at higher levels (e.g. Templar bonus spells at L3, L5). The PG only grants *bless* at L1, so the granted list is flat per-approach for now.
- Removing or replacing granted spells (no swap logic). Granted spells are immutable.
- Changing slot counts. *Bless* uses the standard 1st-level slots already on the Templar progression.
- Storing granted spells on the `Character` JSON. They stay derived from the approach, so existing characters and saved JSON exports remain valid.

## Decisions

### 1. Add `alwaysKnownSpells?: ReadonlyArray<SpellId>` to `ApproachSpellcasting`

`SpellId` is already used elsewhere in the codebase as the spell identifier type (e.g. `Character.spellPicks`). Making the field optional and defaulting to "no granted spells" keeps every other approach untouched. The list lives on `ApproachSpellcasting` (not on `ApproachDef`) because granted spells are part of the spellcasting feature — an approach without `spellcasting` cannot grant spells.

**Alternative considered:** add a `grantedFeatures.spells` slot directly on `ApproachDef`. Rejected — it would need to bypass the `ApproachSpellcasting` validation (counts, slots) and would duplicate the "spell catalog id" plumbing. Keeping it inside `ApproachSpellcasting` co-locates all spell-related approach data.

### 2. Granted spells do NOT count toward `spellsKnownAt1` / `cantripsKnownAt1`

`validateStep("approach", c)` in `lib/character/validation.ts` checks that the player picked exactly `spellsKnownAt1` spells and `cantripsKnownAt1` cantrips. Granted spells are *additional*, so the validator and the picker counters must continue to operate on the player's `spellPicks` only. A Templar finishes the approach step having picked 2 cantrips + 1 1st-level spell, and the granted *bless* sits on top.

**Why:** the PG explicitly says "**plus** the bless spell", and counting it against the budget would functionally remove a 1st-level pick from the player.

### 3. `computeSpellcasting` exposes `grantedSpells`; the spellbook merges it into the displayed list

`computeSpellcasting(c)` returns the per-level row plus tradition / ability hint. We add `grantedSpells: ReadonlyArray<SpellId>` to the return value (sourced from `approach.spellcasting.alwaysKnownSpells ?? []`). The two sheet components that build the displayed known-spell set (`character-sheet.tsx#SheetSpellbook` and `printable-sheet.tsx`) concatenate `[...cantrips, ...spellsKnown, ...grantedSpells]` instead of just `[...cantrips, ...spellsKnown]`.

The existing `SpellTabs` / `SpellCastPopover` already operate on a flat `SpellDef[]`, so granted spells get the same UI affordances (tabs grouped by level, cast button, slot selector) for free.

**Alternative considered:** materialize granted spells into `Character.spellPicks.spellsKnown` at character creation. Rejected — it would (a) require a migration for existing Templar characters, (b) make the spell pick budget look wrong (3 instead of 1), and (c) couple persisted state to approach data that could change between releases.

### 4. Builder approach step shows granted spells as a read-only "Always known" line

In the Templar's spell picker (`components/builder/approach-step.tsx`), render an "Always known (granted by your approach)" entry above the cantrip/1st-level pickers when `selected.spellcasting.alwaysKnownSpells?.length`. The entry is informational only — no checkbox, no toggle. This makes the rule visible during creation so a player isn't surprised that *bless* is in their spellbook later.

### 5. Display label for granted spells

Granted spells render with a small "Granted" badge in the sheet's spellbook tabs so the player can tell at a glance which spells they cannot swap. Implementation: pass a `Set<SpellId>` of granted ids into `SpellTabs` and badge matching cards. (No change to the catalog data shape.)

## Risks / Trade-offs

- **Risk:** Granted spell ids are validated only at runtime — a typo (`"bles"` instead of `"bless"`) would silently render nothing in the sheet.
  → **Mitigation:** add a small one-time check at module load (or in a unit test) that every approach's `alwaysKnownSpells` ids exist in `SPELL_BY_ID`. Cheap to add and prevents regressions if a future approach lists a non-existent id.

- **Risk:** Future approaches may want granted spells *only above a certain level* (e.g. Mystic L3 subclass spells in vanilla 5e). The flat per-approach list cannot express that.
  → **Mitigation:** explicitly out of scope. When that need arises, evolve the field to `ReadonlyArray<{ spellId: SpellId; minLevel?: number }>`. Today's flat list is forward-compatible (a string id is just sugar for `{ spellId, minLevel: 1 }`).

- **Risk:** A player might assume *bless* is one of their picks and try to swap it on level-up.
  → **Mitigation:** the level-up flow's spell-swap UI already operates on `character.spellPicks`, which does not include granted spells. The "Granted" badge in the sheet's spellbook reinforces the rule visually.

- **Trade-off:** Slightly more complex spellbook composition (three lists merged instead of two). Acceptable — the merge is a one-liner and the resulting `SpellDef[]` flows through unchanged downstream.
