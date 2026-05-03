## ADDED Requirements

### Requirement: A spells module SHALL expose attack mod, save DC, and resolved-effect helpers

A new module `lib/character/spells.ts` MUST export at least:

- `spellcastingAbility(c: Character): Ability | null` — returns the active spellcasting ability for the character's approach (using the approach's `spellcasting.abilityHint`), or `null` for a non-spellcasting approach.
- `spellAttackMod(c: Character): number` — returns `proficiencyBonus + spellAbilityMod`. Returns 0 for non-spellcasters.
- `spellSaveDc(c: Character): number` — returns `8 + proficiencyBonus + spellAbilityMod`. Returns 8 (the floor with no proficiency or ability) for non-spellcasters.
- `resolveSpellEffect(spell: SpellDef, c: Character, castAtLevel: SpellLevel): ResolvedSpellEffect` — given a spell, the character, and the slot level the spell is being cast at, returns a normalized view used by the cast popover. For cantrips, the appropriate `scaling.bands` entry is selected by the character's level. For leveled spells with `scaling: "upcast"`, the dice are expanded by the upcast amount.

#### Scenario: Spell save DC for a Mystic/Wizard at L1 with INT +3
- **WHEN** a level-1 character has the Wizard approach (`abilityHint: "int"`) and `finals.modifiers.int === 3`
- **THEN** `spellSaveDc(c) === 13` (8 + 2 prof + 3 INT)
- **AND** `spellAttackMod(c) === 5` (2 prof + 3 INT)

#### Scenario: Non-spellcaster returns sensible defaults
- **WHEN** a level-1 Warrior/Berserker character is passed to the helpers
- **THEN** `spellcastingAbility(c)` returns `null`
- **AND** `spellAttackMod(c)` returns `0`
- **AND** `spellSaveDc(c)` returns `8`

#### Scenario: Cantrip damage scales with character level
- **WHEN** Fire Bolt is resolved for a character at level 5
- **THEN** `resolveSpellEffect(fireBolt, c, 0).damage.dice` reflects the L5 band (`{ count: 2, faces: 10 }`)

#### Scenario: Upcast damage scales with the cast slot level
- **WHEN** Burning Hands (base L1, `+1d6 per level above`) is resolved with `castAtLevel: 3`
- **THEN** `resolveSpellEffect(burningHands, c, 3).damage.dice` reflects 5d6 (3d6 base + 2d6 for two slot levels above L1)

### Requirement: The character sheet SHALL render a Cast popover for spells in companion mode

The sheet's `<SheetSpellbook>` MUST wire an `onCast` handler into each rendered `<SpellCard>` (display mode) so tapping a spell opens a `<SpellCastPopover>` (built on the existing `<Dialog>` primitive). The popover MUST always show: the spell's name and level, the character's spell mod / spell attack / save DC, and the spell's full description. The popover MUST surface the spellcasting ability used (e.g. "DC 13 (CHA)") so the player can spot mismatches with their table's house rules.

For spells with `effect` data, the popover MUST also render an "Effect" band: damage / heal dice with type, save ability + DC + half-on-save indicator (for save-effect spells), or attack mod (for attack-effect spells). For spells with `scaling`, the popover MUST reflect the appropriate scaling band (cantrip-by-level) or upcast amount (leveled-spell-by-slot).

For leveled spells (`level >= 1`), the popover MUST render one "Cast at L<n>" button per spell tier ≥ the spell's base level. Tiers with zero remaining slots MUST be disabled (with hover/title text indicating why). Clicking an enabled tier MUST call the existing `spendSlot(c, n)` from `lib/character/live-state.ts` and update the popover's effect band to reflect the upcast amount.

For cantrips (`level === 0`), no "Cast at L<n>" buttons are rendered (cantrips don't consume slots), and the effect band reflects the character's level scaling.

The popover MUST NOT render in printable mode or in the wizard's spell picker.

#### Scenario: Tapping a spell opens the popover with computed numbers
- **WHEN** a Mystic/Wizard at L1 with INT 16 (mod +3) taps Fire Bolt on the sheet in companion mode
- **THEN** the popover opens
- **AND** the popover header shows "Fire Bolt" and the level/school
- **AND** the computed-numbers band shows "Spell Mod +3 (INT)", "Spell Attack +5", "Save DC 13"

#### Scenario: Cantrip popover shows level-scaled damage and no Cast buttons
- **WHEN** the same Mystic/Wizard at L5 taps Fire Bolt
- **THEN** the popover's effect band shows "2d10 fire" (not 1d10)
- **AND** the popover shows no "Cast at L<n>" buttons

#### Scenario: Leveled spell popover shows upcast options that spend slots
- **WHEN** a Mystic/Wizard at L3 with two L1 slots and one L2 slot remaining taps Magic Missile (base L1)
- **THEN** the popover renders "Cast at L1" (enabled), "Cast at L2" (enabled), and disabled buttons for L3+ slots they don't have
- **WHEN** the player clicks "Cast at L2"
- **THEN** `currentSpellSlots[1]` decrements by 1
- **AND** the popover's effect band reflects the upcast amount (3 missiles + 1 = 4 missiles for Magic Missile at L2)

#### Scenario: Spell with no effect data still opens the popover
- **WHEN** a player taps a spell that has no `effect` (description-only)
- **THEN** the popover opens with the computed-numbers band, "Cast at L<n>" buttons (for leveled spells), and the description
- **AND** in place of an Effect band, the popover shows a one-line note like "No auto-computed effect — see description below"

#### Scenario: Picker mode and printable mode SHALL NOT trigger the popover
- **WHEN** a spell card is rendered in the wizard's L1 spell picker
- **THEN** clicking the card toggles selection (existing behavior) — no popover opens
- **WHEN** a spell card is rendered in the printable sheet
- **THEN** the card is not interactive and no popover opens
