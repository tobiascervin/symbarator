## Why

Companion mode (v1.4) made the sheet interactive for HP, slots, hit dice, rests, corruption, and death saves — but spells stayed read-only. A player mid-combat who taps "Magic Missile" still gets the same prose description they'd read off a paper sheet, and has to mentally compute the spell save DC, attack modifier, damage dice, and (for cantrips) character-level scaling. The sheet already knows the level, ability scores, and proficiency bonus needed to derive every one of those numbers. This change closes the loop: tap a spell → see the live, character-specific values → spend a slot from the same UI.

## What Changes

- Extend `SpellDef` with optional `effect` and `scaling` fields capturing the spell's mechanical shape (attack roll vs. save vs. heal vs. utility, dice, damage type, half-on-save, cantrip-level scaling, upcast scaling). Spells without `effect` keep working as descriptive entries — no breaking schema change.
- Encode `effect` data for the **highest-impact subset** of the catalog: every cantrip, every 1st-level spell, and the most-cast Symbaroum-flavored spells. The other ~200 spells stay description-only and the popover gracefully degrades to "no auto-computed effect — see description". A follow-up change can fill in the rest.
- Add compute helpers in a new `lib/character/spells.ts`:
  - `computeSpellcastingAbility(c)` — resolves the active spellcasting ability for the character's approach (the existing `ApproachSpellcasting.abilityHint`, plus the special-case Sorcerer "any of INT/WIS/CHA" rule already noted in the data).
  - `computeSpellAttackMod(c)` — `profBonus + spellAbilityMod`.
  - `computeSpellSaveDc(c)` — `8 + profBonus + spellAbilityMod`.
  - `computeSpellEffect(spell, c, castAtLevel)` — returns a normalized effect description with dice rolled out per cantrip-scaling table or upcast amount, plus the relevant attack/DC numbers for display.
- New `<SpellCastPopover>` component (Base UI Popover) that opens when the player taps a spell card on the sheet. The popover shows:
  - **Computed numbers band** — Spell Mod, Spell Attack, Save DC (always shown, even for utility spells).
  - **Effect band** (only when `spell.effect` is structured) — damage / heal dice with type, "save: WIS, half on save" line, scaling note ("at L5: 2d10").
  - **Cast-at-slot buttons** — one per available slot tier ≥ `spell.level` (cantrips skip this band entirely). Clicking spends `currentSpellSlots[tier]` and updates the popover's effect band to reflect the upcast amount.
  - **Description** — the prose `description` always renders at the bottom.
- Wire the popover trigger into `SpellCard` via a new optional `onCast(spell, slotLevel)` hook. The companion-mode wrapper (`SheetSpellbook` inside `character-sheet.tsx`) provides the hook; the wizard's existing picker mode does not.
- The popover's "Cast at L<n>" button uses the existing `spendSlot(c, n)` from `lib/character/live-state.ts` — no new state-mutation primitive.
- A small visual affordance on the spell card itself when a `SpellCastPopover` is available (e.g. a tappable area or button) so the player knows the card is interactive in companion mode.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `spell-catalog`: extend the `SpellDef` shape with optional structured-effect fields and encode them for the highest-impact subset of spells. Existing description-only entries continue to validate and render.
- `companion-mode`: add the cast popover, the per-spell tap target on the sheet, and slot-spend integration through the popover's "Cast at L<n>" action.

## Impact

- **Schema**: `SpellDef` gains optional `effect: SpellEffect` (discriminated union: `"attack" | "save" | "heal" | "utility"`) and optional `scaling: SpellScaling` (cantrip dice progression and/or upcast clauses). Both are optional — no migration on `Character` needed.
- **Data**: `data/spells.ts` — encode effects for cantrips + 1st-level spells + key Symbaroum spells (concrete count: ~50 spells in the first pass; the remaining ~250 stay as today). The spec asserts the structural rule, not a per-spell count.
- **Compute**: new `lib/character/spells.ts` with the four helpers above. `computeSpellcasting` already handles the slot table; the new helpers cover attack/DC/effect math.
- **UI**: new `components/spells/spell-cast-popover.tsx` using the Base UI Popover primitive (already shipped in shadcn dialog patterns; check `components/ui/` for an existing Popover or add one if missing). `SpellCard` gets an `onCast?` prop. `character-sheet.tsx`'s `SheetSpellbook` wires the cast handler in companion mode; printable mode and wizard picker do not.
- **State integration**: clicking "Cast at L<n>" calls `spendSlot(c, n)` from `lib/character/live-state.ts` and propagates via the existing `onChange` plumbing.
- **Tests**: new E2E for the popover open/close, the computed numbers (DC + attack mod for a known character), the cantrip-level scaling display, the upcast slot-spend flow, and a smoke check that a description-only spell still opens the popover and shows just the numbers + description.
- **Out of scope**: encoding effects for every leveled spell beyond the first pass (separate content change); spell-attack rolling / save rolling automation (the popover surfaces the numbers — the player rolls dice, this isn't a VTT); concentration tracking; ritual-cast flow (no slot consumed); upcast for cantrips (cantrips don't upcast — they auto-scale by character level, which the popover already handles); spells from outside `data/spells.ts` (e.g. innate origin abilities — they aren't `SpellDef` entries); Sorcerer's "choose your spellcasting ability at L1" — for v1 we use the approach's `abilityHint` and call out the Sorcerer override as an open question in design.
