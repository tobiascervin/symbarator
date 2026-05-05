## Context

`<SpellCastPopover>` (`components/spells/spell-cast-popover.tsx:102-109`) renders an unconditional 3-column stats grid:

```tsx
{ability && (
  <div className="grid grid-cols-3 gap-2 ...">
    <Stat label="Spell Mod" value={`${signed(spellMod)} (${ABILITY_SHORT[ability]})`} />
    <Stat label="Attack" value={signed(atkMod)} />
    <Stat label="Save DC" value={`${dc} (${ABILITY_SHORT[ability]})`} />
  </div>
)}
```

The popover already knows the spell's effect kind via `spell.effect?.kind` (used by the `<EffectBand>` switch below). The data exists; only the upper band ignores it.

## Goals / Non-Goals

**Goals:**
- The popover only shows mods the player will actually use for the spell open in front of them.
- Spell Mod stays visible for any spellcaster on any spell — it's the load-bearing parameter and a useful reference.
- Layout adapts cleanly when only 1 or 2 stats are shown — cells don't stretch awkwardly.

**Non-Goals:**
- Changing the EffectBand below (it already gates by kind correctly).
- Reworking the spell catalog's `effect` shape.
- Adding a new "show all stats" toggle. The whole point is to surface only relevant ones; an opt-in to see the rest re-introduces the noise.
- Hiding Spell Mod for non-spellcasters or characters without an ability — that gate already exists (`{ability && (...)}`).

## Decisions

### Decision: Spell Mod is always shown when the band renders

Spell Mod is the parameter behind every other stat (Attack = prof + spellMod; Save DC = 8 + prof + spellMod) and feeds into damage and healing dice via `addSpellMod`. It's also the auto-hit value for Magic Missile and Cure Wounds. Always showing it gives the player one stable reference point regardless of the spell's mode.

**Alternative considered:** hide Spell Mod for utility spells. Rejected — even utility spells like Magic Missile use Spell Mod for damage; hiding it would re-create the same kind of confusion this change fixes, just inverted.

### Decision: visible-stat selection by `effect.kind`

| `effect.kind` | Spell Mod | Attack | Save DC |
|---|---|---|---|
| `attack` | ✓ | ✓ | ✗ |
| `save` | ✓ | ✗ | ✓ (with save ability) |
| `heal` | ✓ | ✗ | ✗ |
| `utility` | ✓ | ✗ | ✗ |
| `effect` undefined | ✓ | ✗ | ✗ |

Save DC's label uses `resolved.saveAbility` (e.g. "DC 13 DEX") for save spells where the target rolls a specific save, not the caster's own spellcasting ability — `spellSaveDc(c)` returns the DC value, but the *ability target* comes from the spell. The existing computed-numbers band uses the caster's `ABILITY_SHORT[ability]` everywhere, which is wrong for save spells whose save ability differs from the caster's spellcasting ability. Fix this here while we're at it: pull the save ability from `resolved.saveAbility` for `kind: "save"`.

**Alternative considered:** keep the simpler caster-ability label. Rejected — Sacred Flame's save is DEX regardless of the caster's spellcasting ability; showing "DC 13 (INT)" on a Wizard Sacred Flame is technically wrong even though the DC value is correct.

### Decision: grid columns adapt to visible-stat count

Today's layout is `grid-cols-3`. With variable stat counts:

- 1 stat (heal/utility/no effect) → `grid-cols-1` (single cell, max width)
- 2 stats (attack or save) → `grid-cols-2`
- 3 stats — no longer possible; we never show all three together

Use a small helper `gridColsClass(count)` returning the right Tailwind class. Keeping the 3-stat case in the helper for forward-compat costs nothing.

**Alternative considered:** keep `grid-cols-3` and just hide cells. Rejected — empty grid cells leave odd whitespace and the centered text becomes off-balance.

## Risks / Trade-offs

- [Risk] A future `effect.kind` (e.g. a new "buff" or "summon" mode) lands without updating the visible-stat table → the popover defaults to showing only Spell Mod, which is the safe fallback. New modes flag themselves the moment a contributor adds one and notices the band doesn't show what they expected.
- [Risk] Spells without `effect` data (the current "see description below" fallback) show only Spell Mod, but a player might expect to see Attack mod for a spell whose description involves an attack roll the catalog hasn't structured yet (e.g. higher-tier spells we haven't encoded). → Mitigation: the description always renders below the band; a player can see "make a spell attack" in prose and recall their +mod from the sheet's Spellcraft section. If this becomes a real complaint, we extend `SpellEffect` to the missing spells rather than over-show stats.
- [Trade-off] Slight asymmetry between the upper "computed numbers" band (now mode-aware) and the lower "EffectBand" (already mode-aware). The two are now consistent — both gate on `effect.kind`, which is the design intent.

## Migration Plan

UI only. Steps:

1. Edit `components/spells/spell-cast-popover.tsx`: replace the unconditional 3-cell grid with a helper that picks visible stats by `effect.kind`, using `resolved.saveAbility` for save spells' DC label.
2. Update `e2e/spell-cast.spec.ts` Fire Bolt assertion to drop the `12 (INT)` Save DC check.
3. Add a new assertion (in the same spec) that Bless's popover hides Attack and Save DC.
4. `npm run lint` / `npm run test:e2e`.

Rollback: revert the two file edits.

## Open Questions

- Should an attack spell's popover also show its damage's `addSpellMod` flag visually (e.g. "+spell mod to damage")? Currently the EffectBand renders the resolved dice with the mod baked in (`1d10+2 fire`), which is sufficient. Skipping for now.
