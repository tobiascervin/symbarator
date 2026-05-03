## ADDED Requirements

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
