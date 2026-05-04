// Placeholder parsing for class equipment options. PG-canonical class
// starting equipment lines like Captain / Warrior line 1 contain phrases
// the player has to fill in:
//
//   "a martial weapon"        → 1 slot, martial category
//   "two martial weapons"     → 2 slots, martial category
//   "a martial melee weapon"  → 1 slot, martial-melee subcategory (forward-compat)
//
// This module exports `parseOptionPlaceholders` that returns one
// `Placeholder` per slot in left-to-right order, plus a companion
// `weaponsForPlaceholder` helper returning the catalog subset the wizard
// should offer in its dropdown.

import type { WeaponCategory, WeaponDef } from "./types";
import {
  MARTIAL_MELEE,
  MARTIAL_RANGED,
  SIMPLE_MELEE,
  SIMPLE_RANGED,
} from "@/data/equipment";

export type PlaceholderKind = "martial" | "simple";
export type PlaceholderSubcategory = "melee" | "ranged";

export interface Placeholder {
  kind: PlaceholderKind;
  subcategory?: PlaceholderSubcategory;
}

const SINGLE_RE =
  /^(?:a |an )(martial|simple)(?:\s+(melee|ranged))?\s+weapon$/i;
const COUNT_RE =
  /^(two|three|four)\s+(martial|simple)(?:\s+(melee|ranged))?\s+weapons$/i;
const COUNT_WORDS: Record<string, number> = { two: 2, three: 3, four: 4 };

/**
 * Tokenize an equipment option (like "a martial weapon and a shield") and
 * return one `Placeholder` per generic-weapon slot in left-to-right order.
 * The line's `(a) `/`(b) ` prefix MUST be stripped before calling.
 *
 * Concrete tokens like "a longbow" or "chain shirt" don't match either
 * regex and contribute no placeholders.
 */
export function parseOptionPlaceholders(option: string): Placeholder[] {
  const tokens = option
    .split(/,| and /i)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const placeholders: Placeholder[] = [];
  for (const token of tokens) {
    const single = SINGLE_RE.exec(token);
    if (single) {
      placeholders.push({
        kind: single[1].toLowerCase() as PlaceholderKind,
        subcategory: single[2]
          ? (single[2].toLowerCase() as PlaceholderSubcategory)
          : undefined,
      });
      continue;
    }
    const count = COUNT_RE.exec(token);
    if (count) {
      const n = COUNT_WORDS[count[1].toLowerCase()] ?? 0;
      const kind = count[2].toLowerCase() as PlaceholderKind;
      const subcategory = count[3]
        ? (count[3].toLowerCase() as PlaceholderSubcategory)
        : undefined;
      for (let i = 0; i < n; i++) {
        placeholders.push({ kind, subcategory });
      }
    }
  }
  return placeholders;
}

/**
 * Returns true when the token is a placeholder phrase (used by the
 * resolver to decide whether to substitute it with the player's choice).
 */
export function isPlaceholderToken(token: string): boolean {
  return SINGLE_RE.test(token) || COUNT_RE.test(token);
}

/**
 * How many placeholder slots a single token consumes. Single-form tokens
 * ("a martial weapon") consume 1 slot; count-prefixed tokens ("two martial
 * weapons") consume N. Returns 0 for non-placeholder tokens.
 */
export function placeholderSlotsForToken(token: string): number {
  if (SINGLE_RE.test(token)) return 1;
  const count = COUNT_RE.exec(token);
  if (count) return COUNT_WORDS[count[1].toLowerCase()] ?? 0;
  return 0;
}

/**
 * Catalog subset matching a placeholder. Used by the wizard's Select
 * dropdown to populate its options.
 */
export function weaponsForPlaceholder(p: Placeholder): WeaponDef[] {
  const out: WeaponDef[] = [];
  const wantMelee = !p.subcategory || p.subcategory === "melee";
  const wantRanged = !p.subcategory || p.subcategory === "ranged";
  if (p.kind === "martial") {
    if (wantMelee) out.push(...MARTIAL_MELEE);
    if (wantRanged) out.push(...MARTIAL_RANGED);
  } else {
    if (wantMelee) out.push(...SIMPLE_MELEE);
    if (wantRanged) out.push(...SIMPLE_RANGED);
  }
  return out;
}

/**
 * Returns true when the catalog `WeaponDef` matches the placeholder's
 * category constraint. Used by the validator for defense-in-depth on
 * hand-edited saves.
 */
export function categoryMatchesPlaceholder(
  weapon: WeaponDef,
  p: Placeholder,
): boolean {
  const allowed: WeaponCategory[] = (() => {
    if (p.kind === "martial") {
      if (p.subcategory === "melee") return ["martial-melee"];
      if (p.subcategory === "ranged") return ["martial-ranged"];
      return ["martial-melee", "martial-ranged"];
    }
    if (p.subcategory === "melee") return ["simple-melee"];
    if (p.subcategory === "ranged") return ["simple-ranged"];
    return ["simple-melee", "simple-ranged"];
  })();
  return allowed.includes(weapon.category);
}
