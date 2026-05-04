// Per-character inventory mutators — pure functions that return a new
// `Character` with `inventoryOverrides` updated. Mirror the shape of
// `lib/character/live-state.ts`.
//
// The data model is deliberately a delta on top of `classEquipmentPicks`:
// `added` items get appended at render time (via `resolveCharacterInventory`),
// `removed` items get filtered out one-occurrence-per-entry. Both are stored
// as free-text strings; the resolver tokenizes them through the same
// catalog-matching logic that handles class picks.

import type { Character } from "./types";
import { resolveCharacterInventory } from "./equipment";
import { CLASS_BY_ID } from "@/data/classes";

/**
 * Append `item` to `inventoryOverrides.added`. The string can be a catalog
 * name (matched case-insensitively at render time), a free-text gear entry,
 * or anything in between — it's stored verbatim and parsed by the resolver.
 */
export function addInventoryItem(c: Character, item: string): Character {
  const trimmed = item.trim();
  if (!trimmed) return c;
  const next = clone(c);
  next.inventoryOverrides.added.push(trimmed);
  return next;
}

/**
 * Remove the first occurrence of `item` (case-insensitive) from the resolved
 * inventory.
 *
 * - If the item came from `inventoryOverrides.added`, pop it from `added`.
 * - Otherwise it came from class picks: push a token to
 *   `inventoryOverrides.removed` so the resolver filters it next time.
 *
 * The matching uses the resolver's own logic to decide which path applies —
 * a player who added a longsword and removes it should see the addition pop
 * rather than a stale "Longsword" landing in `removed`.
 */
export function removeInventoryItem(c: Character, item: string): Character {
  const target = item.trim().toLowerCase();
  if (!target) return c;
  const next = clone(c);

  // Prefer popping from `added` first (case-insensitive match on the
  // stored string).
  const addedIdx = next.inventoryOverrides.added.findIndex(
    (a) => a.trim().toLowerCase() === target,
  );
  if (addedIdx >= 0) {
    next.inventoryOverrides.added.splice(addedIdx, 1);
    return next;
  }

  // Otherwise, the item must have come from class picks. Verify by checking
  // whether the class-pick derivation would surface it — if it would, push
  // to `removed` so the resolver filters it next time.
  if (classPickContains(c, target)) {
    next.inventoryOverrides.removed.push(item.trim());
    return next;
  }

  // The item is neither in `added` nor in the class picks. This can happen
  // if the inventory was already filtered (the user is re-removing
  // something) or if the catalog name doesn't match a token. No-op.
  return next;
}

/**
 * Walk the class-pick derivation (without overrides) and return true when
 * any token matches `target` (case-insensitive). Used by removeInventoryItem
 * to decide whether a removal should land in the `removed` array.
 */
function classPickContains(c: Character, target: string): boolean {
  const cls = CLASS_BY_ID[c.classId];
  if (!cls) return false;
  for (let i = 0; i < cls.startingEquipment.length; i++) {
    const line = cls.startingEquipment[i];
    const pickIdx = c.classEquipmentPicks[i] ?? 0;
    const opts = line.split(/\bOR\b/i).map((s) =>
      s.replace(/^\s*\([a-z]\)\s*/i, "").trim(),
    );
    const chosen = opts[pickIdx] ?? line;
    const tokens = chosen
      .split(/,| and /i)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (tokens.some((t) => t.toLowerCase() === target)) return true;
  }
  return false;
}

/**
 * `resolveCharacterInventory` returns recognized weapons / armor as
 * `WeaponDef` / `ArmorDef` references; the modal calls these mutators with
 * either a catalog name (e.g. "Longsword") or a free-text string. This
 * helper exists so callers can hand in the raw resolved entry and let the
 * mutator figure out what string to store.
 */
export function removeResolvedItem(c: Character, label: string): Character {
  return removeInventoryItem(c, label);
}

// JSON deep-clone matches the project's existing `useDraft` pattern.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Re-export resolver for callers that want to render after mutating without
// importing two modules.
export { resolveCharacterInventory };
