// Companion-mode state transitions — pure functions.
//
// Every export takes a `Character` and returns a new `Character` (or, for
// `spendHitDie`, a tuple). Inputs are never mutated. Sheet components call
// these and persist the result via `LocalCharacterStore.save(updated)`.
//
// All bound checks live here so the UI cannot put the character in an
// invalid state (e.g. negative HP, spell slots above the approach max).

import type { Character } from "./types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { CLASS_BY_ID, approachById } from "@/data/classes";
import { computeFinalAbilities } from "./compute";
import {
  findTrackedFeatures,
  remainingUses,
  resolveFeatureUsageMax,
} from "./features";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function clone(c: Character): Character {
  return JSON.parse(JSON.stringify(c)) as Character;
}

/** Approach's max spell slots at the character's current level (length 9). */
function maxSlotsAt(c: Character): number[] {
  const sc = approachById(c.approachId)?.spellcasting;
  const row = sc?.progression[c.level - 1];
  return row ? [...row.spellSlots] : new Array(9).fill(0);
}

function hitDieFor(c: Character): number {
  const origin = ORIGIN_BY_ID[c.originId];
  const cls = CLASS_BY_ID[c.classId];
  return origin?.providesHp ? origin.hitDie : (cls?.fallbackHitDie ?? 8);
}

function conMod(c: Character): number {
  return computeFinalAbilities(c).modifiers.con;
}

// ---------------------------------------------------------------------------
// HP transitions
// ---------------------------------------------------------------------------

export function applyDamage(c: Character, amount: number): Character {
  if (amount <= 0) return c;
  const next = clone(c);
  let remaining = amount;
  // Temp HP soaks first; whatever's left hits currentHp.
  if (next.tempHp > 0) {
    const absorbed = Math.min(next.tempHp, remaining);
    next.tempHp -= absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) {
    const wasUp = next.currentHp > 0;
    next.currentHp = Math.max(0, next.currentHp - remaining);
    if (wasUp && next.currentHp === 0) {
      // Crossed positive → 0: reset death saves.
      next.deathSaves = { successes: 0, failures: 0 };
    }
  }
  return next;
}

export function applyHeal(c: Character, amount: number): Character {
  if (amount <= 0) return c;
  const next = clone(c);
  const wasDown = next.currentHp === 0;
  next.currentHp = Math.min(next.maxHp, next.currentHp + amount);
  if (wasDown && next.currentHp > 0) {
    next.deathSaves = { successes: 0, failures: 0 };
  }
  return next;
}

export function addTempHp(c: Character, amount: number): Character {
  if (amount <= 0) return c;
  // 5E rule: temp HP doesn't stack — keep the higher value.
  if (amount <= c.tempHp) return c;
  const next = clone(c);
  next.tempHp = amount;
  return next;
}

// ---------------------------------------------------------------------------
// Spell slots
// ---------------------------------------------------------------------------

export function spendSlot(c: Character, spellLevel: number): Character {
  if (spellLevel < 1 || spellLevel > 9) return c;
  const i = spellLevel - 1;
  if ((c.currentSpellSlots[i] ?? 0) <= 0) return c;
  const max = maxSlotsAt(c);
  if (max[i] <= 0) return c; // non-spellcaster
  const next = clone(c);
  next.currentSpellSlots[i] = next.currentSpellSlots[i] - 1;
  return next;
}

export function restoreSlot(c: Character, spellLevel: number): Character {
  if (spellLevel < 1 || spellLevel > 9) return c;
  const i = spellLevel - 1;
  const max = maxSlotsAt(c);
  if (max[i] <= 0) return c;
  if ((c.currentSpellSlots[i] ?? 0) >= max[i]) return c;
  const next = clone(c);
  next.currentSpellSlots[i] = (next.currentSpellSlots[i] ?? 0) + 1;
  return next;
}

// ---------------------------------------------------------------------------
// Hit Dice
// ---------------------------------------------------------------------------

export function spendHitDie(c: Character): { character: Character; hpGained: number } {
  if (c.hitDiceRemaining <= 0) return { character: c, hpGained: 0 };
  const die = hitDieFor(c);
  const hpGained = Math.max(1, Math.floor(die / 2) + 1 + conMod(c));
  const healed = applyHeal(c, hpGained);
  const next = clone(healed);
  next.hitDiceRemaining = next.hitDiceRemaining - 1;
  return { character: next, hpGained };
}

// ---------------------------------------------------------------------------
// Death saves
// ---------------------------------------------------------------------------

export function recordDeathSave(
  c: Character,
  kind: "success" | "failure",
): Character {
  const next = clone(c);
  if (kind === "success") {
    next.deathSaves.successes = Math.min(3, next.deathSaves.successes + 1);
  } else {
    next.deathSaves.failures = Math.min(3, next.deathSaves.failures + 1);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Rests
// ---------------------------------------------------------------------------

/** Restores all `usage.per === "short-rest"` tracked features to max. */
export function shortRest(c: Character): Character {
  return restoreFeaturesByPer(c, "short-rest");
}

export function longRest(c: Character): Character {
  let next = clone(c);
  next.currentHp = next.maxHp;
  next.tempHp = 0;
  // Half HD restored, rounded up; capped at level; minimum 1.
  const restoredHd = Math.max(1, Math.floor(next.level / 2));
  next.hitDiceRemaining = Math.min(next.level, next.hitDiceRemaining + restoredHd);
  next.currentSpellSlots = maxSlotsAt(next);
  next.deathSaves = { successes: 0, failures: 0 };
  // Long rest = short rest + more. Restore both per-types.
  next = restoreFeaturesByPer(next, "short-rest");
  next = restoreFeaturesByPer(next, "long-rest");
  return next;
}

export function extendedRest(c: Character): Character {
  const next = longRest(c);
  next.hitDiceRemaining = next.level;
  return next;
}

// ---------------------------------------------------------------------------
// Feature usage
// ---------------------------------------------------------------------------

/**
 * Decrements the remaining uses for a tracked feature. Lazy-init: if the
 * character has no entry yet, treats the current value as the resolved max,
 * then decrements. Floors at 0. No-op when the feature isn't tracked
 * (no `id` or no `usage` in the catalog).
 */
export function useFeature(c: Character, featureId: string): Character {
  const tracked = findTrackedFeatures(c).find((t) => t.id === featureId);
  if (!tracked) return c;
  const cur = remainingUses(c, tracked);
  const nextRemaining = Math.max(0, cur - 1);
  if (nextRemaining === cur) return c;
  const next = clone(c);
  next.featureUses[featureId] = nextRemaining;
  return next;
}

/** Sets the remaining uses for a tracked feature back to its resolved max. */
export function restoreFeature(c: Character, featureId: string): Character {
  const tracked = findTrackedFeatures(c).find((t) => t.id === featureId);
  if (!tracked) return c;
  const next = clone(c);
  next.featureUses[featureId] = resolveFeatureUsageMax(c, tracked.usage);
  return next;
}

function restoreFeaturesByPer(
  c: Character,
  per: "short-rest" | "long-rest",
): Character {
  const tracked = findTrackedFeatures(c).filter((t) => t.usage.per === per);
  if (tracked.length === 0) return c;
  const next = clone(c);
  for (const t of tracked) {
    next.featureUses[t.id] = resolveFeatureUsageMax(next, t.usage);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Corruption
// ---------------------------------------------------------------------------

export function bumpCorruption(
  c: Character,
  kind: "permanent" | "temporary",
  delta: number,
): Character {
  const next = clone(c);
  const cur = next.corruption[kind];
  next.corruption[kind] = Math.max(0, cur + delta);
  return next;
}

// Re-export the slot helper so the sheet UI can compute pip rows without
// duplicating the lookup.
export { maxSlotsAt };
