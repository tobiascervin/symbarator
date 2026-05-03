## Why

The app stops at "you have a character." Once a player walks out of the wizard with their leveled hero, the sheet is read-only — you can see your max HP and spell slot counts, but if the GM says "take 12 damage" you have nothing to click. The same is true for spending a spell slot, gaining Corruption, taking a short rest, going down at 0 HP, or burning a Hit Die. The persisted character has the right *static* shape but no *live* state, so the only way to track play is on paper next to the screen — which defeats most of the reason to have an app at all.

This change adds the minimum set of mutable state needed to actually play with the sheet: current HP, temp HP, current spell slots, hit dice remaining, Corruption (already in the schema, never surfaced), and death saves when downed. Plus the rest mechanics that recharge those tracks (short / long / extended).

## What Changes

- **Schema additions on `Character`**, all additive and backwards-compatible (migrator backfills sane defaults from the static sheet):
    - `currentHp: number` — defaults to `maxHp`. 0 means downed; surfaces death saves.
    - `tempHp: number` — defaults to 0. Stacks separately; depletes before HP.
    - `currentSpellSlots: number[]` — length 9, indexed 0..8 for spell levels 1..9. Defaults to the approach's slot row at the character's current level.
    - `hitDiceRemaining: number` — defaults to `level`. Spent during short rest.
    - `deathSaves: { successes: number; failures: number }` — defaults to `{ 0, 0 }`. Reset on heal above 0.
- **Storage migration** fills these on every load so legacy v1.3.x and earlier saves work cleanly.
- **Live-state computer** (`lib/character/live-state.ts`): pure functions for `applyDamage`, `applyHeal`, `addTempHp`, `spendSlot`, `restoreSlot`, `bumpCorruption`, `spendHitDie`, `shortRest`, `longRest`, `extendedRest`, and `recordDeathSave`. Each takes a `Character` and returns the updated `Character` — no side effects in this layer.
- **Sheet UI surfaces**:
    - **HP card** — current/max readout, damage and heal numeric inputs, "Apply" button, temp HP add input. Background turns red when downed.
    - **Death saves** — visible only when `currentHp === 0`; three success circles, three failure circles, ✓ / ✗ buttons. Hides automatically on heal above 0.
    - **Spell slots** — clickable pip per slot. Click an unspent slot to spend; click an empty pip to restore (in case of misclick). Per-level rows.
    - **Corruption** — `permanent` and `temporary` already in the schema; surface them with `+`/`−` adjusters next to the existing Corruption Threshold display.
    - **Hit dice tracker** — count remaining vs total, "Spend HD" button that rolls average (no dice integration yet) and applies the heal.
    - **Rest panel** — three buttons: Short Rest (resets uses-per-short-rest features and exposes Hit Dice spending), Long Rest (refresh full HP, half HD rounded up, all spell slots, reset death saves), Extended Rest (long rest + all HD restored, plus per-extended-rest features reset where applicable).
- **No backend, no auth, no shared state** — everything stays in `localStorage` keyed by the existing character id. Multiple browsers don't sync.

Out of scope for this change:
- Conditions / status effects (frightened, charmed, prone, …) — separate change; bigger surface, separate UI pattern.
- Per-feature use counters (Action Surge, Indomitable, Bardic Inspiration, etc.) — would need a feature-by-feature data layer; out of scope until that data is structured.
- Inspiration toggle.
- Initiative tracker / encounter view (different mental model — DM-side, not character-side).
- A dice roller. Hit Dice spending uses the average ((die/2) + 1 + Con mod) without a roll. Players who roll on the table can override the value with a manual entry the same way the level-up dialog already does.
- Undo/redo. Mistakes are corrected by the inverse action (heal cancels accidental damage, restoreSlot cancels accidental spend).

## Capabilities

### New Capabilities
- `companion-mode`: The mutable, in-play state of a character — current HP, temp HP, spell slots, hit dice, death saves, Corruption (already on the schema, now surfaced) — plus the operations that change those values (damage / heal / rests / slot spending).

### Modified Capabilities
<!-- None — this introduces a new mutable layer on top of the existing static character; the leveling, character-creation, and other capabilities don't change their requirements. -->

## Impact

- **Types** (`lib/character/types.ts`): five new required fields on `Character` (see above).
- **Defaults** (`lib/character/defaults.ts`): `emptyCharacter` initializes them. `currentHp` is 0 at empty (becomes `maxHp` once abilities are set; the migrator handles the realistic default for newly-created and legacy characters by deferring to `computeHp` and the spell progression).
- **Storage** (`lib/storage/local.ts`): `migrateCharacter` backfills all five fields. For `currentSpellSlots`, derive from the approach's `spellcasting.progression[c.level - 1]` if the approach has spellcasting; otherwise leave a length-9 array of zeros.
- **New module** (`lib/character/live-state.ts`): the pure operation set. Tested via the existing E2E flow (state changes are observable through the sheet).
- **Sheet** (`components/sheet/character-sheet.tsx`): five new interactive panels (HP, Death Saves, Spell Slots, Corruption, Hit Dice + Rest).
- **No level-up impact**: the level-up dialog still updates `maxHp` etc. — companion mode just adds a layer beneath. After a level-up, `currentHp` should bump by the same delta `maxHp` did (so a level-up doesn't accidentally restore a wounded character to full).
- **E2E**: a new `e2e/companion.spec.ts` exercising at least one round-trip per panel (apply 5 damage → currentHp drops by 5; spend a 1st-level slot → count decreases; long rest → currentHp resets to maxHp). Existing 30 tests should continue to pass.
- **Risk**: medium. The schema additions are additive, but the level-up flow needs one tweak (advance `currentHp` by the HP gain, not just `maxHp`). The Corruption pluses don't validate against the threshold — that's a future change.
- **Versioning**: minor bump per the documented release flow. Schema is additive with migrator backfill.
