## ADDED Requirements

### Requirement: The spell cast popover SHALL only show stats relevant to the spell's effect mode

`<SpellCastPopover>` (`components/spells/spell-cast-popover.tsx`) MUST render its computed-numbers band based on the spell's `effect.kind` rather than unconditionally showing Spell Mod, Attack, and Save DC. The visible-stat table is:

- `kind: "attack"` → Spell Mod and Attack mod (no Save DC).
- `kind: "save"` → Spell Mod and Save DC, where the DC's ability label MUST come from the spell's `saveAbility` (not the caster's spellcasting ability).
- `kind: "heal"` → Spell Mod only.
- `kind: "utility"` → Spell Mod only.
- `effect` undefined → Spell Mod only.

The band's grid layout MUST adapt to the visible-stat count (single-cell for 1 stat, two-column for 2 stats) so cells stay readable.

Spell Mod MUST always be shown when the band renders for a character with a spellcasting ability.

#### Scenario: Attack-spell popover hides Save DC

- **WHEN** the player taps a spell with `effect.kind === "attack"` (e.g. Fire Bolt) on a Mystic's sheet
- **THEN** the popover's computed-numbers band shows the Spell Mod cell and the Attack cell
- **AND** the band does NOT show a Save DC cell

#### Scenario: Save-spell popover hides Attack

- **WHEN** the player taps a spell with `effect.kind === "save"` (e.g. Sacred Flame) on a Mystic's sheet
- **THEN** the popover's computed-numbers band shows the Spell Mod cell and the Save DC cell
- **AND** the Save DC's ability label uses the spell's save ability (e.g. `DC 12 (DEX)` for Sacred Flame), not the caster's spellcasting ability
- **AND** the band does NOT show an Attack cell

#### Scenario: Utility-spell popover shows only Spell Mod

- **WHEN** the player taps a spell with `effect.kind === "utility"` (e.g. Bless, Mage Hand, Magic Missile) on a Mystic's sheet
- **THEN** the popover's computed-numbers band shows the Spell Mod cell only
- **AND** the band does NOT show Attack or Save DC cells

#### Scenario: Heal-spell popover shows only Spell Mod

- **WHEN** the player taps a spell with `effect.kind === "heal"` (e.g. Cure Wounds) on a Templar's sheet
- **THEN** the popover's computed-numbers band shows the Spell Mod cell only
- **AND** the band does NOT show Attack or Save DC cells

#### Scenario: Spell without structured effect data shows only Spell Mod

- **WHEN** the player taps a spell whose `effect` is undefined (e.g. an unencoded higher-level spell)
- **THEN** the popover's computed-numbers band shows the Spell Mod cell only
- **AND** the description below the band still renders the prose mechanics
