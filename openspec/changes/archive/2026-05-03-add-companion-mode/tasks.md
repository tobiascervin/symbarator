## 1. Schema + storage migration

- [x] 1.1 Add `currentHp`, `tempHp`, `currentSpellSlots`, `hitDiceRemaining`, `deathSaves` to `Character` in `lib/character/types.ts` (all required, not optional)
- [x] 1.2 Update `emptyCharacter(id)` in `lib/character/defaults.ts` to seed the new fields with the empty defaults from the spec (`currentHp: 0`, `tempHp: 0`, `currentSpellSlots: new Array(9).fill(0)`, `hitDiceRemaining: 0`, `deathSaves: { successes: 0, failures: 0 }`)
- [x] 1.3 Extend `migrateCharacter` in `lib/storage/local.ts` to backfill the five new fields per Decision 7: `currentHp = maxHp`, `tempHp = 0`, `currentSpellSlots = approach.spellcasting.progression[level - 1].spellSlots ?? new Array(9).fill(0)`, `hitDiceRemaining = level`, `deathSaves = { 0, 0 }`
- [x] 1.4 Run the existing migration E2E (`e2e/migration.spec.ts`) and confirm pre-1.4 fixtures still load cleanly

## 2. Pure-function module

- [x] 2.1 Create `lib/character/live-state.ts` and export the public surface from Decision 2 (`applyDamage`, `applyHeal`, `addTempHp`, `spendSlot`, `restoreSlot`, `spendHitDie`, `recordDeathSave`, `shortRest`, `longRest`, `extendedRest`, `bumpCorruption`)
- [x] 2.2 Add an internal `maxSlotsAt(c)` helper that resolves `approachById(c.approachId)?.spellcasting?.progression[c.level - 1]?.spellSlots` and falls back to nine zeros
- [x] 2.3 Implement `applyDamage`: temp HP absorbs first, currentHp floors at 0, crossing positive→0 resets `deathSaves`
- [x] 2.4 Implement `applyHeal`: caps at `maxHp`, resets `deathSaves` if currentHp was 0 before the heal
- [x] 2.5 Implement `addTempHp` with overwrite-if-higher semantics
- [x] 2.6 Implement `spendSlot` / `restoreSlot` bounded by `[0, maxSlotsAt(c)[spellLevel - 1]]`; both no-op for non-spellcasting approaches
- [x] 2.7 Implement `spendHitDie` returning `{ character, hpGained }` with `hpGained = max(1, floor(hitDie/2) + 1 + conMod)` and decrementing `hitDiceRemaining` (no-op when already 0)
- [x] 2.8 Implement `recordDeathSave` capping each counter at 3
- [x] 2.9 Implement `shortRest` (schema no-op), `longRest` (currentHp→max, HD restored by `Math.max(1, Math.floor(level/2))` capped at level, slots reset, deathSaves reset, tempHp cleared), `extendedRest` (long rest plus `hitDiceRemaining = level`)
- [x] 2.10 Implement `bumpCorruption(kind, delta)` that clamps `permanent`/`temporary` at 0 (no upper cap — the threshold alert is UI-side)

## 3. Level-up integration

- [x] 3.1 In `lib/character/level-up.ts`, bump `currentHp` by the same delta `maxHp` increases (preserves wounded state, adds capacity)
- [x] 3.2 Increment `hitDiceRemaining` by 1 on every level-up
- [x] 3.3 For each spell-slot tier where the previous level's row had 0 and the new row is positive, set `currentSpellSlots[i]` to the new max (already-existing tiers keep their current count)

## 4. Sheet UI surfaces

- [x] 4.1 Build an HP & Vitals parchment near the top of `components/sheet/character-sheet.tsx`: `currentHp / maxHp` readout, damage / heal / temp-HP numeric inputs with apply buttons, red pill when downed
- [x] 4.2 Add a Hit Dice mini-tracker (`X / Y` plus a "Spend HD" button) inside the HP & Vitals parchment; spending applies the heal and decrements `hitDiceRemaining`
- [x] 4.3 Add a conditional Death Saves panel that only renders when `currentHp === 0`: three success slots, three failure slots, explicit ✓ / ✗ buttons, "Stable" badge at 3 successes, "Dead" indicator at 3 failures
- [x] 4.4 Add clickable spell-slot pip rows above the spellbook tabs in the Spellcraft parchment; only render rows for spell levels where the approach has non-zero max slots; clicking a filled pip spends, clicking an empty pip restores
- [x] 4.5 Add a Corruption parchment surfacing `corruption.permanent` / `corruption.temporary` with `+`/`−` adjusters next to the existing computed Threshold; show a red `over threshold` badge when `temporary > threshold`
- [x] 4.6 Add a Rest parchment with three buttons (Short / Long / Extended), each with a one-line summary of what it restores
- [x] 4.7 Wire each panel to `LocalCharacterStore.save(updated)` after every state mutation (matches the existing level-up flow)
- [x] 4.8 Surface the `currentHp` delta in the level-up Confirm step diff so a wounded player sees that level-up adds capacity, not health

## 5. E2E coverage

- [x] 5.1 Create `e2e/companion.spec.ts` and seed a leveled fixture (e.g. Templar at L4) via `page.addInitScript`
- [x] 5.2 Test: applying 5 damage drops `currentHp` by 5 and persists across reload
- [x] 5.3 Test: spending a 1st-level slot decrements the pip row; restoring increments it; bounded at the approach max
- [x] 5.4 Test: long rest restores `currentHp = maxHp` and refills the slot pips
- [x] 5.5 Test: damage bringing `currentHp` to 0 surfaces the death-saves panel; recording three failures keeps it at 3 (no overflow); healing above 0 hides the panel and zeroes the counters
- [x] 5.6 Test: leveling a wounded character (e.g. 5/12 → +9 HP) ends at 14/21 — capacity grew, current bumped by the delta, didn't auto-heal to full
- [x] 5.7 Confirm the existing 30-test suite still passes

## 6. Release

- [x] 6.1 Run `openspec validate add-companion-mode --strict` and confirm clean
- [x] 6.2 Run `npm run build` and `npm run test:e2e` to confirm the green baseline
- [ ] 6.3 Run `/minor` to ship as `v1.4.0`
- [ ] 6.4 Run `/opsx:archive add-companion-mode` to fold the delta spec into `openspec/specs/companion-mode/spec.md`
