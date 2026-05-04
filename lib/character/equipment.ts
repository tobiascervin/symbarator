// Per-character equipment math — resolves the inventory from existing
// `classEquipmentPicks` strings against the structured catalog, computes
// AC, and resolves a per-weapon attack/damage breakdown for the popover.
//
// Mirrors the shape of `lib/character/spells.ts`: pure functions reading
// the character + reference data, returning structured numbers ready for
// render. No `Character` schema dependency beyond the existing fields.

import type {
  Ability,
  ArmorDef,
  Character,
  DamageType,
  DiceExpression,
  WeaponDef,
  WeaponPropertyData,
} from "./types";
import { computeFinalAbilities, computeProficiencyBonus } from "./compute";
import { CLASS_BY_ID } from "@/data/classes";
import { ARMOR_BY_NAME, WEAPON_BY_NAME } from "@/data/equipment";

export interface ResolvedInventory {
  weapons: ReadonlyArray<WeaponDef>;
  /** Worn armors. Multiple are allowed; `computeAC` picks the highest base. */
  armor: ReadonlyArray<ArmorDef>;
  shield: ArmorDef | null;
  /** Tokens the catalog didn't recognize — render as text. */
  other: ReadonlyArray<string>;
}

/**
 * Tokenize the character's class-equipment picks against the structured
 * catalog. Each `classEquipmentPicks[i]` indexes into `cls.startingEquipment[i]`'s
 * "(a) … OR (b) …" line; the resolved option string can contain multiple
 * items glued by `,` and ` and `. Unknown tokens fall through to `other`.
 *
 * Background equipment (`bg.equipment`) is unstructured prose and is NOT
 * parsed in v1 — Tier 2 will add structured-inventory support.
 */
export function resolveCharacterInventory(c: Character): ResolvedInventory {
  const cls = CLASS_BY_ID[c.classId];

  // Build the raw token list: class-pick derivation, minus removed
  // overrides (one occurrence per entry, case-insensitive), plus added
  // overrides concatenated at the end.
  const classTokens: string[] = [];
  if (cls) {
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
      classTokens.push(...tokens);
    }
  }

  const removed = [...(c.inventoryOverrides?.removed ?? [])].map((r) => r.toLowerCase());
  const survived: string[] = [];
  for (const t of classTokens) {
    const idx = removed.indexOf(t.toLowerCase());
    if (idx >= 0) {
      removed.splice(idx, 1); // consume one occurrence
    } else {
      survived.push(t);
    }
  }
  const allTokens = [...survived, ...(c.inventoryOverrides?.added ?? [])];

  const weapons: WeaponDef[] = [];
  const armor: ArmorDef[] = [];
  let shield: ArmorDef | null = null;
  const other: string[] = [];

  for (const tokenRaw of allTokens) {
    // Strip numeric ammo qualifiers ("20 arrows", "10 bolts", "30 sling bullets").
    const ammoMatch = tokenRaw.match(/^\d+\s+(arrows|bolts|bullets|darts|stones|javelins)$/i);
    if (ammoMatch) {
      other.push(tokenRaw);
      continue;
    }

    // Normalize: lowercase + strip leading "a "/"an "/"the "/"two "/"three ".
    // Try the catalog with this form first — catalog items whose name
    // contains " armor" (e.g. "Leather armor", "Crow Armor", "Laminated
    // Armor", "Field Armor") would mismatch if we stripped the suffix
    // unconditionally. Fall back to the strip-" armor" form only on miss
    // so class-pick lines like "studded leather armor" still resolve to
    // the unsuffixed catalog name "Studded Leather".
    const baseNormalized = tokenRaw.toLowerCase().trim()
      .replace(/^(a |an |the |two |three |four )/i, "");
    const strippedNormalized = baseNormalized.replace(/ armor$/i, "");

    // Try a sequence of candidate keys: aliased → as-is → stripped.
    const candidates: string[] = [];
    const baseAlias = CATALOG_ALIASES[baseNormalized];
    if (baseAlias) candidates.push(baseAlias);
    candidates.push(baseNormalized);
    if (strippedNormalized !== baseNormalized) {
      const stripAlias = CATALOG_ALIASES[strippedNormalized];
      if (stripAlias) candidates.push(stripAlias);
      candidates.push(strippedNormalized);
    }

    let matchedWeapon: WeaponDef | undefined;
    let matchedArmor: ArmorDef | undefined;
    for (const key of candidates) {
      matchedWeapon = WEAPON_BY_NAME[key] ?? WEAPON_BY_NAME[depluralize(key)];
      if (matchedWeapon) break;
      matchedArmor = ARMOR_BY_NAME[key] ?? ARMOR_BY_NAME[depluralize(key)];
      if (matchedArmor) break;
    }

    if (matchedWeapon) {
      weapons.push(matchedWeapon);
      continue;
    }
    if (matchedArmor) {
      if (matchedArmor.category === "shield") {
        if (!shield) shield = matchedArmor;
      } else {
        armor.push(matchedArmor);
      }
      continue;
    }
    other.push(tokenRaw);
  }

  return { weapons, armor, shield, other };
}

/**
 * Armor Class per PG p. 168–171. Unarmored = 10 + Dex; light = base + Dex
 * (uncapped); medium = base + min(Dex, 2); heavy = base (no Dex). Shield
 * adds its `ac.base` regardless of armor category. When multiple worn
 * armors are present, the highest base AC wins.
 */
export function computeAC(c: Character): { ac: number; breakdown: ReadonlyArray<string> } {
  const inv = resolveCharacterInventory(c);
  const finals = computeFinalAbilities(c);
  const dexMod = finals.modifiers.dex;

  // Pick the worn armor with the highest base AC.
  const worn = inv.armor.length > 0
    ? [...inv.armor].sort((a, b) => b.ac.base - a.ac.base)[0]
    : null;

  let ac: number;
  const breakdown: string[] = [];

  if (worn) {
    let dexContribution = 0;
    if (worn.ac.addDex) {
      dexContribution = worn.ac.dexMax !== undefined
        ? Math.min(dexMod, worn.ac.dexMax)
        : dexMod;
    }
    ac = worn.ac.base + dexContribution;
    breakdown.push(`${worn.ac.base} ${worn.name}`);
    if (worn.ac.addDex) {
      const cap = worn.ac.dexMax !== undefined ? ` (max +${worn.ac.dexMax})` : "";
      breakdown.push(`${signed(dexContribution)} Dex${cap}`);
    }
  } else {
    ac = 10 + dexMod;
    breakdown.push("10 base", `${signed(dexMod)} Dex`);
  }

  if (inv.shield) {
    ac += inv.shield.ac.base;
    breakdown.push(`+${inv.shield.ac.base} ${inv.shield.name}`);
  }

  return { ac, breakdown };
}

export type AttackMode = "1h" | "2h" | "thrown";

export interface ResolvedWeaponAttack {
  abilityUsed: Ability;
  attackMod: number;
  damageDice: DiceExpression;
  damageMod: number;
  damageType: DamageType;
  range: [number, number] | null;
}

/**
 * Resolve a per-weapon attack for the cast popover. Ability selection
 * follows PG p. 168 — default-melee = STR, default-ranged = DEX, finesse =
 * higher of STR/DEX (v1 picks higher; the rule lets the player choose).
 * Versatile two-handed dice are pulled from the weapon's `properties`
 * array. v1 always assumes the character is proficient with anything in
 * their starting equipment; an explicit proficiency lookup is deferred.
 */
export function resolveWeaponAttack(
  c: Character,
  weapon: WeaponDef,
  mode: AttackMode = "1h",
): ResolvedWeaponAttack {
  const finals = computeFinalAbilities(c);
  const profBonus = computeProficiencyBonus(c);

  const isRanged =
    weapon.category === "simple-ranged" ||
    weapon.category === "martial-ranged" ||
    weapon.category === "alchemical" ||
    weapon.category === "siege";
  const hasFinesse = weapon.flags.has("finesse");

  // Ability selection. Thrown on a melee weapon falls back to the melee
  // rule (STR unless finesse). Thrown on a ranged-finesse weapon (Dart)
  // uses the higher.
  let abilityUsed: Ability;
  if (hasFinesse) {
    abilityUsed = finals.modifiers.str >= finals.modifiers.dex ? "str" : "dex";
  } else if (isRanged && mode !== "thrown") {
    abilityUsed = "dex";
  } else {
    abilityUsed = "str";
  }

  const abilityModValue = finals.modifiers[abilityUsed];

  // Damage dice. `mode: "2h"` on a versatile weapon pulls the alternative
  // dice out of the properties array.
  let damageDice = weapon.damage;
  if (mode === "2h") {
    const versatile = weapon.properties?.find(
      (p): p is Extract<WeaponPropertyData, { kind: "versatile" }> =>
        p.kind === "versatile",
    );
    if (versatile) damageDice = versatile.twoHandedDamage;
  }

  // Range — first thrown (when mode is thrown) then ammunition / range.
  let range: [number, number] | null = null;
  const props = weapon.properties ?? [];
  if (mode === "thrown") {
    const thrown = props.find((p) => p.kind === "thrown");
    range = thrown ? thrown.range : null;
  } else {
    const r = props.find(
      (p): p is Extract<WeaponPropertyData, { kind: "ammunition" | "range" | "thrown" }> =>
        p.kind === "ammunition" || p.kind === "range",
    );
    range = r ? r.range : null;
  }

  return {
    abilityUsed,
    attackMod: profBonus + abilityModValue,
    damageDice,
    damageMod: abilityModValue,
    damageType: weapon.damageType,
    range,
  };
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

/**
 * Class equipment lines say "a light crossbow", "a heavy crossbow", etc.
 * The PG catalog names these "Crossbow, light" / "Crossbow, heavy" / etc.
 * (comma form is alphabetical-friendly). Map prose → catalog.
 */
const CATALOG_ALIASES: Record<string, string> = {
  "light crossbow": "crossbow, light",
  "heavy crossbow": "crossbow, heavy",
  "hand crossbow": "crossbow, hand",
  "repeating crossbow": "crossbow, repeating",
};

/**
 * Strip a trailing 's' if the singular form exists in either catalog. Used
 * to resolve "handaxes" / "daggers" tokens left over after the count prefix
 * is stripped.
 */
function depluralize(s: string): string {
  if (s.endsWith("s") && (WEAPON_BY_NAME[s.slice(0, -1)] || ARMOR_BY_NAME[s.slice(0, -1)])) {
    return s.slice(0, -1);
  }
  return s;
}
