## Why

`<SpellCastPopover>` currently renders an unconditional three-cell stats band — **Spell Mod / Attack / Save DC** — for every spell on every spellcaster. That misleads players because most spells use only a subset:

- Pure utility spells (Mage Hand, Light, Bless, Magic Missile) show "Attack +5" the player will never roll.
- Save spells (Burning Hands, Sacred Flame) show an "Attack +5" they don't roll either.
- Heal spells (Cure Wounds) show both "Attack +5" and "Save DC 13" — neither applies.
- Attack spells (Fire Bolt, Eldritch Blast) show a "Save DC 13" that's also irrelevant.

The existing structured `effect.kind` discriminator already tells us which mode the spell uses; the popover just doesn't gate on it. The fix is one render-time conditional, no schema or data work.

## What Changes

- **Gate the popover's computed-numbers band by `spell.effect?.kind`**, showing only the stats actually relevant to the spell's mode:
  - `kind: "attack"` → Spell Mod + Attack mod (no Save DC).
  - `kind: "save"` → Spell Mod + Save DC (with the save ability label) (no Attack).
  - `kind: "heal"` → Spell Mod only.
  - `kind: "utility"` → Spell Mod only (the magic-missile / mage-hand fallback).
  - `effect` undefined → Spell Mod only (description carries the mechanics).
- **Spell Mod is always shown** when the character has a spellcasting ability — it's the underlying parameter for damage/heal scaling, the auto-hit value for Magic Missile, and a useful reference even when the popover doesn't model the attack.
- **Adapt the band's grid layout** to the visible-stat count (1 cell, 2 cells, or 3 cells wide) so cells stay readable instead of stretching.
- **Update the existing E2E test** `tapping a spell opens the popover with computed numbers` (which uses Fire Bolt) to no longer assert the Save DC is shown. Add a new assertion that opening Bless (utility) does NOT show Attack or Save DC.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `companion-mode`: tighten the spell cast popover's "computed numbers" band so it only renders stats relevant to the spell's `effect.kind`.

## Impact

- `components/spells/spell-cast-popover.tsx` — replace the unconditional 3-cell `Spell Mod / Attack / Save DC` grid with a small helper that picks the visible stats based on `spell.effect?.kind`. ~15 lines changed.
- `e2e/spell-cast.spec.ts` — drop the Save DC assertion from the Fire Bolt test (kind: "attack"). Add a small new test or extend the existing one to assert Bless's popover hides both Attack and Save DC.
- No `Character` schema change. No data changes. No migration.
- Suite size: 87 → 88 tests after the new assertion.
