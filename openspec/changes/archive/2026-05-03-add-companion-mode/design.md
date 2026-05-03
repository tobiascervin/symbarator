## Context

Today the sheet is read-only. `Character` carries the post-creation totals (`maxHp`, `feats`, `spellPicks`, `boons`, …) but nothing ephemeral. The leveling change introduced `maxHp` as a persisted field exactly because rolled HP is non-deterministic; everything else on the sheet is computed from origin/class/approach data.

To make the sheet usable at the table, we need a mutable layer that lives alongside the existing static fields and changes during play. The existing `Character.corruption: { permanent, temporary }` field already reflects this pattern — it's a mutable counter, just not surfaced in the UI yet.

Constraints:
- Single-player, single-browser. No multi-device sync, no server.
- Persistence is `localStorage`, write-on-change. Every state mutation re-saves the character.
- No undo. The inverse operation is the undo (apply 5 heal cancels apply 5 damage; restore-slot cancels accidental spend).
- The leveling flow already runs `applyLevelUp` to mutate `level`, `maxHp`, `abilities`, `feats`, `spellPicks`. The companion-mode layer must coexist without conflicting on those.

## Goals / Non-Goals

**Goals:**
- One coherent place on the sheet to apply damage / heals / temp HP, spend slots, track Corruption, run a rest.
- Pure functions for every state transition so they're testable and predictable.
- `localStorage` saves on every mutation. Reload returns to the same state.
- Migration backfills sane defaults for pre-1.4 saves so the v1.3.x player isn't suddenly playing with 0 spell slots.

**Non-Goals:**
- Status conditions (frightened, charmed, prone, restrained, …) — separate change.
- Per-feature uses-per-rest tracking (Action Surge, Indomitable, Wildshape uses, etc.).
- Multi-character party view. Each character lives in its own URL/sheet.
- Initiative tracker / encounter ledger.
- A dice integration. Hit Dice spending uses the average value with an option for manual override.
- Sync across devices.

## Decisions

### Decision 1: All live state lives on `Character`, not in a sibling

```ts
interface Character {
  ...existing static fields...
  // Live state added by this change.
  currentHp: number;
  tempHp: number;
  currentSpellSlots: number[];   // length 9; index i = (i+1)th-level slots
  hitDiceRemaining: number;
  deathSaves: { successes: number; failures: number };
}
```

**Alternative considered:** A separate `CharacterState` record with the same id, persisted under a different storage key. Rejected because every sheet render and every level-up already reads/writes the `Character`. Splitting the storage just doubles the I/O for no benefit. The downside — `Character` carries both static and mutable concerns — is small in practice; the field names make the distinction obvious.

### Decision 2: Pure functions in `lib/character/live-state.ts`, no React state inside

The sheet calls `applyDamage(character, n)` and gets back a new `Character`. The component then `setCharacter(updated)` and `LocalCharacterStore.save(updated)` (the existing pattern from the level-up flow). This keeps state transitions deterministic and testable in isolation.

```ts
export function applyDamage(c: Character, amount: number): Character;
export function applyHeal(c: Character, amount: number): Character;
export function addTempHp(c: Character, amount: number): Character; // overwrites if higher
export function spendSlot(c: Character, spellLevel: number): Character;
export function restoreSlot(c: Character, spellLevel: number): Character;
export function spendHitDie(c: Character): { character: Character; hpGained: number };
export function recordDeathSave(c: Character, kind: "success" | "failure"): Character;
export function shortRest(c: Character): Character;
export function longRest(c: Character): Character;
export function extendedRest(c: Character): Character;
export function bumpCorruption(c: Character, kind: "permanent" | "temporary", delta: number): Character;
```

Damage rules:
- Temp HP absorbs first; remainder hits `currentHp`.
- `currentHp` floors at 0 (no negative HP). When it crosses to 0, death saves are reset to `{ 0, 0 }`.
- Massive damage rule (PG: damage that exceeds remaining HP by max HP) is **out of scope** — at most we'd add a flag later; the player can manually mark instant death.

Heal rules:
- Heal moves `currentHp` up to `maxHp`. Excess is wasted.
- Healing while at 0 HP also resets death saves.

Rest rules:
- **Short rest**: no automatic effects on slots/HP. Just exposes the Hit Dice spend UI in a more prominent panel for the duration of the rest. Implementation-wise this is mostly UI; the only schema change a short rest forces is a no-op (we may surface a "uses-per-short-rest" recharge in a future change).
- **Long rest**: `currentHp = maxHp`; restore Hit Dice up to `Math.max(1, Math.floor(level / 2))` (capped at `level`); reset all `currentSpellSlots` to the approach's progression row at the current level; reset `deathSaves` to `{ 0, 0 }`; clear `tempHp`.
- **Extended rest**: long rest, plus restore Hit Dice fully to `level`. (Per Symbaroum p. 34 — extended rest is the only way to recover full HD.)

### Decision 3: `currentHp` and `tempHp` floor at 0; `currentHp` caps at `maxHp`

Bound checks are inside each pure function so the UI can't put the character in an invalid state. Negative `currentHp` is permanently disallowed; the death-save panel handles "downed" semantics.

When `currentHp` is already at 0 and damage is applied, the player records death-save failures via the panel rather than damage continuing past 0. (Massive-damage instant death is the future feature.)

### Decision 4: Spell-slot recovery uses the **approach's** progression row at the **character's current level**

```ts
function maxSlotsAt(c: Character): number[] {
  const sc = approachById(c.approachId)?.spellcasting;
  const row = sc?.progression[c.level - 1];
  return row?.spellSlots ?? new Array(9).fill(0);
}
```

This honors the existing decision that spellcasting lives on `ApproachDef` (not `ClassDef`). For non-spellcasting approaches, `maxSlotsAt` returns nine zeros and the sheet never renders the slot panel.

### Decision 5: HP delta on level-up

When `applyLevelUp` runs, `maxHp` increases by the chosen HP gain. The level-up flow MUST also bump `currentHp` by the same amount so a wounded character doesn't get auto-healed by leveling. Fix in the existing `applyLevelUp` in `lib/character/level-up.ts` — one line.

Also: on level-up, the spell slot pool widens (more or higher-level slots may appear). The level-up applier should refresh `currentSpellSlots` to the new max for any slot tier that previously didn't exist (so a Templar gaining 2nd-level slots at L5 starts with the full new tier filled). This is the right "you've leveled, you're refreshed at the new ceiling" behavior — it implicitly grants a long-rest's worth of recovery, which matches how players treat a level-up at the table.

`hitDiceRemaining` should bump by 1 on each level-up (player gets a new HD, full).

### Decision 6: UI placement on the sheet

Replace the current static "HP" line with a richer **HP & Vitals** parchment near the top, containing:

- HP readout: `current / max` (current in big font; pill turns red when current=0)
- Damage / Heal / Temp HP inputs + buttons in one row
- Hit Dice mini-tracker: `X / Y` and a "Spend HD" button (writes to currentHp, decrements HD)
- Death Saves panel (rendered conditionally when current=0): three ✓ slots, three ✗ slots, two buttons

The existing **Spellcraft** parchment gains a slot pip-row above the spellbook tabs:
```
1st: ●●●○  (4 max, 1 spent)
2nd: ●●○   (3 max, 1 spent)
```

A new **Rest** parchment with three buttons (Short / Long / Extended) and a one-line summary of what each restores.

A new **Corruption** parchment surfaces the existing `corruption.permanent` and `corruption.temporary` fields with `+`/`−` adjusters and the computed Threshold from `computeCorruptionThreshold`. A small alert appears when `temporary > threshold` (foreshadowing — actual rule consequences are GM-side).

### Decision 7: Migration is best-effort, not lossless

For pre-1.4 saves with no `currentHp`:
- `currentHp = maxHp` (full health is the safest default — the alternative would be 0, which would auto-trigger death saves on first load)
- `tempHp = 0`
- `currentSpellSlots = maxSlotsAt(c)` for spellcasting approaches; nine zeros otherwise
- `hitDiceRemaining = level`
- `deathSaves = { 0, 0 }`

This means a player who closes the app at 4/12 HP and opens v1.4 will be back at 12/12. Acceptable for a one-time migration; there's no audit log of pre-companion HP we could honor.

## Risks / Trade-offs

- **Schema bloat** — `Character` now carries both static and mutable concerns. Mitigated by clear field naming (`current*`, `*Remaining`, `deathSaves`) and a comment block. Future refactor to split could be a major if it ever becomes painful.
- **`localStorage` write frequency** — every damage click writes the full character JSON. With 297-spell catalogs the JSON is fine (kilobytes). No performance concern at this size.
- **Long-rest restoring spell slots in full** — this is correct per the rules, but could feel surprising if a player level-ups mid-day. Mitigated by Decision 5 (level-up tops up newly-unlocked tiers but doesn't restore previously-spent slots).
- **No conflict resolution between tabs** — opening the same character in two browser tabs and clicking damage in both produces last-write-wins. Mitigation: documented in CLAUDE.md, not solved by code.
- **HP delta on level-up could surprise** — a player at 3/12 HP who levels up and gains +9 max HP ends at 12/21 (current bumped by 9). They didn't get healed; they just have more room. This is the correct rule but worth surfacing in the Confirm step diff.

## Migration Plan

1. Land schema + storage migration (additive, backwards-compatible).
2. Land `lib/character/live-state.ts` — pure functions only, no UI.
3. Wire `applyLevelUp` to bump `currentHp`, `hitDiceRemaining`, and refresh `currentSpellSlots` per Decision 5.
4. Land HP & Vitals parchment + Spell slot pips + Corruption + Hit Dice + Rest parchment on the sheet.
5. Land death saves panel.
6. Add E2E coverage (`e2e/companion.spec.ts`).
7. `/minor` release as `v1.4.0`.

Rollback: revert. Persisted characters keep their new fields (string-array clean) but the older build ignores them. No data loss.

## Open Questions

- **Q1**: Should the HP card show recent-damage flash (e.g. red number animation)?
  *Default: no — keep the v1 surface minimal; revisit if the static numeric feels lifeless in play.*
- **Q2**: Should "Spend HD" prompt for Average vs Roll like the level-up dialog does?
  *Default: yes — consistency with the level-up flow. Average is the default; the player can override.*
- **Q3**: When death-save successes hit 3, what does the UI do?
  *Default: collapse the death saves panel and bump `currentHp` to 1 (PG rule: stable, regain consciousness after 1d4 hours; v1 simplifies to "heal yourself or wait — game says 1 HP at GM call"). Actually that's not the rule. PG p. 33: 3 successes = stable at 0 HP, regain 1 HP after 1d4 hours. Default: leave at 0 HP, hide the panel, surface a "Stable" badge. Player heals manually or waits for the GM.*
- **Q4**: Should we render the temporary Corruption alert as an actual blocking modal when `temporary > threshold`?
  *Default: no — surface as a red badge next to the Threshold display. The actual rule consequences (gain permanent Corruption, possibly become abomination) are GM-side; the app shouldn't auto-apply them.*
