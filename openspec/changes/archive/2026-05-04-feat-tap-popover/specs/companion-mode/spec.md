## ADDED Requirements

### Requirement: The schema SHALL gain `featureUses` and the migrator SHALL backfill it

`Character.featureUses: Record<string, number>` MUST be a required field on the `Character` interface, defaulting to `{}` for new characters. Each entry holds the *remaining* uses for a tracked feature, keyed by the feature's `id`. Absence of an entry MUST be treated as "full uses" by the popover and the rest primitives — features lazy-initialize on first decrement, so the field stays empty until the player actually spends a use. `migrateCharacter` MUST backfill `{}` when the field is missing.

#### Scenario: New character has empty featureUses
- **WHEN** `emptyCharacter(id)` is called
- **THEN** the returned character's `featureUses` is `{}`

#### Scenario: Pre-1.10 saves get backfilled
- **WHEN** a character JSON without `featureUses` is loaded
- **THEN** `migrateCharacter` returns a character whose `featureUses` is `{}`
- **AND** the character renders on the sheet without errors

#### Scenario: Absent entry is treated as full uses
- **WHEN** a character has `featureUses: {}` and a feature with `id: "warrior:battle-wind"` and `usage: { count: "profBonus", per: "long-rest" }`
- **THEN** the popover for Battle Wind displays the full `profBonus` value as the remaining count

### Requirement: A features module SHALL resolve usage counts and effect formulas

A new module `lib/character/features.ts` MUST export at least:

- `resolveFeatureUsageMax(c: Character, usage: FeatureUsage): number` — returns the max usage count, resolving `"profBonus"` to `computeProficiencyBonus(c)` and `"level"` to `c.level`. Numeric counts are returned unchanged.
- `resolveFeatureEffect(c: Character, feature)` — returns a popover-ready resolved effect (e.g., for `kind: "tempHp"` with `dice: 2d4` and `addAbilityMod: "con"`, returns the dice expression and the resolved CON mod string `"2d4+3"`).
- `featureSourceLabel(c, feature): string` — returns the source label for the popover header, e.g., `"Warrior L1"`, `"Berserker L1"`, `"Boon"`, `"Burden"`, `"Origin: Abducted Human"`, `"Background: Runaway"`.

#### Scenario: profBonus usage resolves to character's prof bonus
- **WHEN** a level-5 character (profBonus 3) has a feature with `usage: { count: "profBonus", per: "long-rest" }`
- **THEN** `resolveFeatureUsageMax(c, usage)` returns 3

#### Scenario: tempHp effect resolves with character's ability mod
- **WHEN** a character with CON 16 (mod +3) has a feature with `effect: { kind: "tempHp", dice: { count: 2, faces: 4 }, addAbilityMod: "con" }`
- **THEN** `resolveFeatureEffect(c, feature)` returns a value whose dice formula reads `"2d4+3"`

#### Scenario: Feature source label classifies origin / background / boon / burden / class / approach
- **WHEN** a feature comes from the Warrior class's L4 entry
- **THEN** `featureSourceLabel(c, feature)` returns `"Warrior L4"` (or equivalent — the level number MUST be present)

### Requirement: live-state SHALL expose `useFeature` and `restoreFeature` and rests SHALL restore feature usage

`lib/character/live-state.ts` MUST gain:

- `useFeature(c: Character, featureId: string): Character` — decrements `featureUses[featureId]` by 1 (lazy-initialized to max if absent, then decremented). Floors at 0.
- `restoreFeature(c: Character, featureId: string): Character` — sets `featureUses[featureId]` to the resolved max for that feature.

`shortRest(c)` MUST restore every feature with `usage.per === "short-rest"` to its max. `longRest(c)` MUST restore both short-rest AND long-rest features. `extendedRest(c)` already calls `longRest` and inherits.

#### Scenario: useFeature decrements remaining uses
- **WHEN** a character with `featureUses: { "warrior:action-surge": 1 }` calls `useFeature(c, "warrior:action-surge")`
- **THEN** the returned character has `featureUses["warrior:action-surge"]` equal to 0
- **AND** calling `useFeature` again leaves the value at 0 (does NOT go negative)

#### Scenario: useFeature lazy-initializes from max on first call
- **WHEN** a character with `featureUses: {}` and an Action Surge feature (max 1) calls `useFeature(c, "warrior:action-surge")`
- **THEN** the returned character has `featureUses["warrior:action-surge"]` equal to 0 (initialized to 1, then decremented)

#### Scenario: Long rest restores all tracked feature uses
- **WHEN** a level-9 character with profBonus 4 and `featureUses: { "warrior:action-surge": 0, "warrior:indomitable": 0, "berserker:rage": 0 }` takes a long rest
- **THEN** `featureUses["warrior:action-surge"]` returns to its max (1 at L9)
- **AND** `featureUses["warrior:indomitable"]` returns to 1
- **AND** `featureUses["berserker:rage"]` returns to 4 (profBonus)

#### Scenario: Short rest restores short-rest features only
- **WHEN** a character with `featureUses: { "warrior:action-surge": 0, "warrior:indomitable": 0 }` takes a short rest, where Action Surge is `per: "short-rest"` and Indomitable is `per: "long-rest"`
- **THEN** `featureUses["warrior:action-surge"]` returns to its max
- **AND** `featureUses["warrior:indomitable"]` remains at 0

### Requirement: The character sheet SHALL render a tap popover for feats and class features

The sheet's Boons / Burdens / Feats sections MUST wire an `onTap` handler into each rendered `<FeatCard>` that opens a `<FeatTapPopover>` (built on the existing `<Dialog>` primitive). The Features section's per-entry paragraphs MUST also become tappable in companion mode and open the same popover.

The popover MUST always show: the entry's name, a source label (e.g., "Warrior L1", "Berserker L1", "Boon", "Burden", "Origin: Abducted Human"), and the entry's full description. For boons/burdens with structured `abilityBonus`, the popover MUST display the `+X ABL` badges (consistent with the existing card display). For class/approach features with structured `effect` data, the popover MUST display the resolved effect (e.g., "2d4+3 temp HP" with the character's CON mod folded in). For features with structured `usage` data, the popover MUST display a usage counter ("`<remaining>` of `<max>` left") and a "Use" button that calls `useFeature(c, featureId)` via the sheet's `onChange` plumbing. Disabled when `remaining === 0`.

The popover MUST NOT render in printable mode or in the wizard's preview surfaces.

#### Scenario: Tapping a boon opens the popover with badge + description
- **WHEN** the player taps an Archivist boon card on the sheet in companion mode
- **THEN** the popover opens
- **AND** the header shows "Archivist · Boon"
- **AND** the badge row contains "+1 INT"
- **AND** the description renders below

#### Scenario: Tapping Battle Wind shows usage counter and Use button
- **WHEN** a Warrior at L5 (profBonus 3) with full uses taps Battle Wind on the sheet
- **THEN** the popover shows "3 of 3 left" and an enabled "Use" button
- **AND** the resolved effect reads "2d4+<conMod> temp HP"
- **WHEN** the player clicks Use
- **THEN** `featureUses["warrior:battle-wind"]` decrements to 2
- **AND** the popover updates to show "2 of 3 left"

#### Scenario: Use button is disabled when no uses remain
- **WHEN** a character has 0 remaining uses for a tracked feature
- **THEN** the Use button is disabled with a hover/title text indicating "no uses remaining"

#### Scenario: Long rest restores feature uses surfaced in the popover
- **WHEN** a character has 0 remaining Battle Wind uses, takes a long rest from the Rest panel, and re-opens the Battle Wind popover
- **THEN** the popover shows the max uses again

#### Scenario: Description-only feature opens the popover with just the description
- **WHEN** the player taps a feature with no `usage` and no `effect` (e.g., "Mindless Rage", an origin's narrative feature)
- **THEN** the popover opens with the source label and the description
- **AND** no usage counter or Use button is rendered

#### Scenario: Printable mode and wizard preview SHALL NOT trigger the popover
- **WHEN** a feat / boon / feature card is rendered in the wizard's preview surfaces or in the printable sheet
- **THEN** clicking the card does NOT open a popover
