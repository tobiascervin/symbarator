## ADDED Requirements

### Requirement: Class and approach features MAY carry structured `id`, `usage`, and `effect` data

Each entry in `ClassLevelEntry.features` and `ApproachLevelEntry.features` MUST gain three optional fields: `id?: string` (a stable identifier for usage tracking; class-prefixed by convention, e.g., `"warrior:battle-wind"`), `usage?: FeatureUsage`, and `effect?: FeatureEffect`. Existing `{ name, description }` entries MUST continue to validate — all three new fields are optional.

`FeatureUsage` MUST be `{ count: FeatureUsageMax; per: "short-rest" | "long-rest" }` where `FeatureUsageMax` is the union `number | "profBonus" | "level"`. The string sentinels resolve at display time via `lib/character/features.ts`.

`FeatureEffect` MUST be a discriminated union over `kind` with at least the variants `"tempHp"` (carries `dice: DiceExpression` and optional `addAbilityMod: Ability`) and `"passive"` (optional `note: string`). The union is extensible — additional `kind`s can be added by future content changes without breaking existing entries.

#### Scenario: Feature without id/usage/effect still validates
- **WHEN** a class level entry has `features: [{ name: "Mindless Rage", description: "..." }]`
- **THEN** the entry validates and the popover renders the description with no usage counter

#### Scenario: Feature with usage and effect resolves at display time
- **WHEN** Battle Wind is encoded with `id: "warrior:battle-wind"`, `usage: { count: "profBonus", per: "long-rest" }`, and `effect: { kind: "tempHp", dice: { count: 2, faces: 4 }, addAbilityMod: "con" }`
- **THEN** the popover for a level-5 character (profBonus 3, CON +3) shows max uses 3 and effect formula "2d4+3 temp HP"

#### Scenario: Same id across two level entries treats the higher level as the live definition
- **WHEN** Action Surge is encoded at L2 with `usage: { count: 1, per: "short-rest" }` and at L17 with `usage: { count: 2, per: "short-rest" }` — both with `id: "warrior:action-surge"`
- **THEN** at character L17, the popover and the rest restore both honor the L17 usage (max 2)
- **AND** at character L9, the L2 usage (max 1) is honored

### Requirement: Warrior class and Berserker approach SHALL be the first content fill for tracked features

The first-pass content fill for tracked features MUST encode `id` and `usage` (and `effect` where applicable) for at least: Warrior — Battle Wind (L1), Action Surge (L2 and L17), Indomitable (L7); Berserker — Rage (L1). Other classes and approaches MAY remain description-only and fall back to the popover's narrative display. Subsequent content changes can extend coverage.

#### Scenario: Warrior at L1 has Battle Wind tracked
- **WHEN** a level-1 Warrior character is loaded
- **THEN** `computeFeatures(c)` includes Battle Wind with `id: "warrior:battle-wind"` and `usage: { count: "profBonus", per: "long-rest" }`

#### Scenario: Berserker at L1 has Rage tracked
- **WHEN** a level-1 Warrior/Berserker character is loaded
- **THEN** `computeFeatures(c)` includes Rage with `id: "berserker:rage"` and `usage: { count: "profBonus", per: "long-rest" }`
