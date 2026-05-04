# companion-mode Specification

## Purpose
TBD - created by archiving change add-companion-mode. Update Purpose after archive.
## Requirements
### Requirement: `Character` SHALL carry mutable in-play state alongside its static fields

The `Character` interface MUST include `currentHp: number`, `tempHp: number`, `currentSpellSlots: number[]` (length 9), `hitDiceRemaining: number`, and `deathSaves: { successes: number; failures: number }`. These fields are required (not optional) so the type system catches missing initializations.

#### Scenario: Empty character has zero live state
- **WHEN** `emptyCharacter(id)` is called
- **THEN** the returned character has `currentHp: 0`, `tempHp: 0`, `currentSpellSlots` of length 9 (all zeros), `hitDiceRemaining: 0`, `deathSaves: { successes: 0, failures: 0 }`

#### Scenario: Pre-1.4 saves are migrated with sane defaults
- **WHEN** a character JSON without companion-mode fields is loaded
- **THEN** the migrator backfills `currentHp = maxHp` (full health), `tempHp = 0`, `currentSpellSlots` set to the approach's `progression[level - 1].spellSlots` (or nine zeros for non-spellcasters), `hitDiceRemaining = level`, `deathSaves = { 0, 0 }`

### Requirement: A pure-function module SHALL expose every state transition

`lib/character/live-state.ts` MUST export pure functions that take a `Character` and return an updated `Character` (or, for `spendHitDie`, a tuple). These functions MUST NOT mutate their input or perform I/O. The module MUST cover at minimum: `applyDamage`, `applyHeal`, `addTempHp`, `spendSlot`, `restoreSlot`, `bumpCorruption`, `spendHitDie`, `recordDeathSave`, `shortRest`, `longRest`, `extendedRest`.

#### Scenario: applyDamage decrements currentHp via tempHp first
- **WHEN** `applyDamage(c, 5)` is called on a character with `tempHp: 3, currentHp: 10`
- **THEN** the returned character has `tempHp: 0` and `currentHp: 8`

#### Scenario: applyDamage floors currentHp at 0 and does not go negative
- **WHEN** `applyDamage(c, 100)` is called on a character with `currentHp: 10`
- **THEN** the returned character has `currentHp: 0`

#### Scenario: Crossing to 0 resets death saves
- **WHEN** any operation reduces `currentHp` from positive to 0
- **THEN** `deathSaves` resets to `{ successes: 0, failures: 0 }`

#### Scenario: Healing while at 0 also resets death saves
- **WHEN** `applyHeal(c, 5)` is called on a character with `currentHp: 0`
- **THEN** the returned character has `currentHp: 5` and `deathSaves: { 0, 0 }`

#### Scenario: applyHeal caps at maxHp
- **WHEN** `applyHeal(c, 100)` is called on a character with `currentHp: 10, maxHp: 12`
- **THEN** the returned character has `currentHp: 12` (excess wasted)

#### Scenario: addTempHp overwrites if higher
- **WHEN** `addTempHp(c, 8)` is called on a character with `tempHp: 5`
- **THEN** the returned character has `tempHp: 8` (does NOT stack)

#### Scenario: addTempHp keeps existing if higher
- **WHEN** `addTempHp(c, 3)` is called on a character with `tempHp: 5`
- **THEN** the returned character has `tempHp: 5` (incoming lower value ignored)

### Requirement: Spell slot operations SHALL match the approach's max slots at the current level

`spendSlot(c, spellLevel)` MUST decrement `currentSpellSlots[spellLevel - 1]`, never below 0. `restoreSlot(c, spellLevel)` MUST increment the same index, never above the approach's `progression[level - 1].spellSlots[spellLevel - 1]`. For non-spellcasting approaches, both operations MUST no-op.

#### Scenario: Spend a 1st-level slot
- **WHEN** `spendSlot(c, 1)` is called on a Templar at L3 with `currentSpellSlots: [3, 0, 0, 0, 0, 0, 0, 0, 0]`
- **THEN** `currentSpellSlots` becomes `[2, 0, 0, 0, 0, 0, 0, 0, 0]`

#### Scenario: Cannot spend below zero
- **WHEN** `spendSlot(c, 1)` is called on a character with `currentSpellSlots[0] === 0`
- **THEN** the returned character is unchanged

#### Scenario: Cannot restore above the cap
- **WHEN** `restoreSlot(c, 1)` is called on a character whose 1st-level slots are already at the approach's max for this level
- **THEN** the returned character is unchanged

### Requirement: Hit Dice spending SHALL heal by `floor(hitDie/2) + 1 + Con mod`

`spendHitDie(c)` MUST decrement `hitDiceRemaining` by 1 (never below 0), apply a heal equal to `Math.max(1, Math.floor(hitDie/2) + 1 + conMod)`, and return both the updated character and the HP gained. If `hitDiceRemaining === 0`, the function MUST return the character unchanged with `hpGained: 0`.

#### Scenario: Hit Die spend heals and decrements
- **WHEN** `spendHitDie(c)` is called on a character with `hitDiceRemaining: 3`, hit die `d8`, Con mod +2, `currentHp: 10, maxHp: 18`
- **THEN** the returned `hpGained` is 7 (4 + 1 + 2)
- **AND** the returned character has `hitDiceRemaining: 2` and `currentHp: 17`

#### Scenario: Cannot spend with no HD remaining
- **WHEN** `spendHitDie(c)` is called on a character with `hitDiceRemaining: 0`
- **THEN** the returned character is unchanged and `hpGained: 0`

### Requirement: Rests SHALL recharge the right tracks

- **Long rest** MUST set `currentHp = maxHp`, restore Hit Dice up to `Math.max(1, Math.floor(level / 2))` (capped at `level`), reset every entry of `currentSpellSlots` to its corresponding approach-progression value at the current level, reset `deathSaves` to `{ 0, 0 }`, and clear `tempHp` to 0.
- **Extended rest** MUST do everything a long rest does AND restore `hitDiceRemaining` to `level`.
- **Short rest** is currently a no-op on the schema (UI affordance only).

#### Scenario: Long rest restores everything except all HD
- **WHEN** a Templar at L4 with `currentHp: 8/30, hitDiceRemaining: 1, currentSpellSlots: [1, 0, 0, …]` takes a long rest
- **THEN** the returned character has `currentHp: 30, hitDiceRemaining: max(1, floor(4/2)) = 2`, `currentSpellSlots` reset to the approach's L4 progression row (e.g. `[3, 0, …]`), `deathSaves: { 0, 0 }`, `tempHp: 0`

#### Scenario: Extended rest also restores all Hit Dice
- **WHEN** a character at L8 with `hitDiceRemaining: 0` takes an extended rest
- **THEN** `hitDiceRemaining` becomes 8

### Requirement: Death saves SHALL be tracked when downed

While `currentHp === 0`, the sheet MUST surface a death-saves panel with three success and three failure slots and explicit ✓ / ✗ buttons. `recordDeathSave(c, "success")` and `recordDeathSave(c, "failure")` MUST increment the corresponding counter without exceeding 3. Reaching 3 successes MUST mark the character "Stable" (a derived UI label, no schema change beyond the existing `deathSaves` count). Reaching 3 failures MUST display a "dead" indicator without modifying the underlying character data (the GM has the final word).

#### Scenario: Failures increment up to 3
- **WHEN** `recordDeathSave(c, "failure")` is called three times in a row on a character starting from `{ 0, 0 }`
- **THEN** `deathSaves.failures` is 3 after the third call

#### Scenario: Healing above 0 hides the panel and resets the counters
- **WHEN** `applyHeal(c, n)` brings `currentHp` from 0 to a positive value
- **THEN** `deathSaves` becomes `{ 0, 0 }` and the death-saves panel disappears from the sheet

#### Scenario: Three successes mark "Stable"
- **WHEN** `recordDeathSave(c, "success")` is called three times in a row on a character starting from `{ 0, 0 }`
- **THEN** `deathSaves.successes` is 3
- **AND** the sheet shows a "Stable" indicator until the character is healed above 0

### Requirement: The level-up flow SHALL bump live state, not auto-heal

When `applyLevelUp` runs, it MUST:
- Increase `currentHp` by the same delta `maxHp` increases by (so a wounded character gains room without auto-healing).
- Increment `hitDiceRemaining` by 1.
- For each spell-slot tier that was previously zero and is now positive on the new level's progression row, set `currentSpellSlots[i]` to the new tier's max (so a Templar gaining 2nd-level slots at L5 starts with the full new tier).

#### Scenario: Wounded character gains HP capacity, not health
- **WHEN** a character with `currentHp: 5, maxHp: 12` levels up and the chosen HP gain is +9
- **THEN** the returned character has `maxHp: 21` and `currentHp: 14` (5 + 9)

#### Scenario: Hit Dice bump on level-up
- **WHEN** any character levels up
- **THEN** `hitDiceRemaining` increases by 1

#### Scenario: Newly-unlocked slot tier starts full
- **WHEN** a Templar at L4 (`currentSpellSlots: [3, 0, …]`) levels to L5 (progression row `[4, 2, 0, …]`)
- **THEN** the returned character has `currentSpellSlots[1] === 2` (newly-unlocked 2nd-level tier filled)
- **AND** `currentSpellSlots[0]` is unchanged (already-existing tier doesn't refresh)

### Requirement: The character sheet SHALL surface every live-state track

The sheet MUST render an interactive HP & Vitals panel (current/max, damage/heal/temp HP inputs, hit dice tracker), a Spell Slots panel as clickable pips per spell level (only for spellcasting approaches), a Corruption panel with `+`/`−` adjusters next to the existing Threshold display, a Rest panel with three buttons (Short / Long / Extended), and a death-saves panel that appears only when `currentHp === 0`.

#### Scenario: HP panel renders current and max
- **WHEN** any character is viewed on the sheet
- **THEN** the HP panel shows `<currentHp> / <maxHp>` with a damage input, a heal input, and a temp-HP add input

#### Scenario: Spell slots show clickable pips
- **WHEN** a spellcasting character is viewed on the sheet
- **THEN** for each spell level with non-zero max slots, a row appears with one pip per slot, filled or empty based on `currentSpellSlots`
- **AND** clicking a filled pip spends that slot
- **AND** clicking an empty pip restores it

#### Scenario: Corruption panel shows permanent and temporary
- **WHEN** the sheet is rendered
- **THEN** the Corruption panel displays `permanent` and `temporary` totals next to the computed Threshold
- **AND** `+`/`−` adjusters write to `Character.corruption.permanent` and `Character.corruption.temporary`

#### Scenario: Rest panel offers three buttons
- **WHEN** the sheet is rendered
- **THEN** the Rest panel exposes Short Rest, Long Rest, and Extended Rest buttons, each with a one-line summary of what it restores

#### Scenario: Death-saves panel hides when above 0 HP
- **WHEN** `currentHp > 0`
- **THEN** the death-saves panel is not rendered

#### Scenario: Death-saves panel appears at 0 HP
- **WHEN** `currentHp === 0`
- **THEN** the death-saves panel is rendered with three ✓ slots, three ✗ slots, and explicit success/failure buttons

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

