## ADDED Requirements

### Requirement: SpellDef MAY carry structured `effect` and `scaling` data

`SpellDef` MUST gain two optional fields: `effect?: SpellEffect` and `scaling?: SpellScaling`. `SpellEffect` MUST be a discriminated union with four `kind`s — `"attack"` (spell-attack roll → damage), `"save"` (target rolls a save → damage and/or rider effect), `"heal"` (heals the target), `"utility"` (explicitly no roll, no damage). `SpellScaling` MUST be a discriminated union with two `kind`s — `"cantrip"` (a `bands` array of `{ atLevel, dice }` entries marking the character-level thresholds at which damage scales) and `"upcast"` (a single `perLevel: DiceExpression` describing the dice added per slot above the spell's base level). Both fields MUST be optional — spells without them continue to validate and render as today.

#### Scenario: Spell with no effect data still validates
- **WHEN** a `SpellDef` has neither `effect` nor `scaling`
- **THEN** the entry is valid and the catalog continues to render it as a description-only spell

#### Scenario: Attack-effect spell encodes its damage
- **WHEN** Fire Bolt is encoded with `effect: { kind: "attack", damage: { dice: { count: 1, faces: 10 }, type: "fire" } }`
- **AND** `scaling: { kind: "cantrip", bands: [{ atLevel: 5, dice: { count: 2, faces: 10 } }, { atLevel: 11, dice: { count: 3, faces: 10 } }, { atLevel: 17, dice: { count: 4, faces: 10 } }] }`
- **THEN** the entry validates and `resolveSpellEffect` returns `1d10` damage at character L1, `2d10` at L5, etc.

#### Scenario: Save-effect spell encodes its DC ability and damage
- **WHEN** Burning Hands is encoded with `effect: { kind: "save", ability: "dex", damage: { dice: { count: 3, faces: 6 }, type: "fire" }, halfOnSave: true }`
- **AND** `scaling: { kind: "upcast", perLevel: { count: 1, faces: 6 } }`
- **THEN** at base cast (L1) the popover shows `3d6 fire, DEX save, half on save`
- **AND** at upcast L3 the popover shows `5d6 fire, DEX save, half on save` (3d6 base + 2d6 from two slot levels above)

#### Scenario: Utility spell explicitly declares no roll
- **WHEN** Mage Hand is encoded with `effect: { kind: "utility" }`
- **THEN** the popover shows "no save, no attack" rather than "no auto-computed effect"

### Requirement: At least every cantrip and every 1st-level spell SHALL be encoded with effect data in the first pass

The first content pass for this change MUST encode `effect` (and `scaling` where applicable) for every cantrip in the catalog AND every 1st-level spell in the catalog. Higher-level spells MAY remain description-only and the popover MUST gracefully degrade for them. This requirement establishes the lower bound; additional content passes in follow-up changes can extend coverage.

#### Scenario: Every cantrip has effect data
- **WHEN** the spell catalog is built
- **THEN** every entry with `level: 0` has a defined `effect` field
- **AND** every cantrip whose damage scales by character level has a `scaling: { kind: "cantrip", bands: ... }` field

#### Scenario: Every 1st-level spell has effect data
- **WHEN** the spell catalog is built
- **THEN** every entry with `level: 1` has a defined `effect` field
- **AND** any 1st-level spell whose damage upcasts has a `scaling: { kind: "upcast", perLevel: ... }` field
