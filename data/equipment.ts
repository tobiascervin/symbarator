// Weapon and armor catalog — Ruins of Symbaroum Player's Guide v1.0.2 p. 162–171.
//
// The legacy string arrays (`COMMON_WEAPONS`, `ARMOR`, `ADVENTURING_PACKS`)
// are kept for the wizard's equipment surfaces; the structured `WEAPONS` /
// `ARMORS` arrays power the companion-mode AC readout and weapon attack
// popover. Items the structured catalog doesn't recognize fall through to
// free-text rendering on the sheet.

import type {
  ArmorDef,
  ArmorProperty,
  WeaponDef,
  WeaponProperty,
  WeaponPropertyData,
} from "@/lib/character/types";

/** @deprecated v1.15+ — use `WEAPONS` for structured weapon data. */
export const ADVENTURING_PACKS = [
  "Burglar's pack",
  "Dungeoneer's pack",
  "Explorer's pack",
  "Scholar's pack",
  "Priest's pack",
  "Entertainer's pack",
] as const;

/** @deprecated v1.15+ — use `WEAPONS` for structured weapon data. */
export const COMMON_WEAPONS = [
  "Dagger",
  "Quarterstaff",
  "Handaxe",
  "Shortsword",
  "Longsword",
  "Fencing sword (rapier)",
  "Greatsword",
  "Mace",
  "Warhammer",
  "Battleaxe",
  "Spear",
  "Light crossbow",
  "Heavy crossbow",
  "Hand crossbow",
  "Shortbow",
  "Longbow",
  "Sling",
] as const;

/** @deprecated v1.15+ — use `ARMORS` for structured armor data. */
export const ARMOR = [
  "Padded",
  "Leather",
  "Studded leather",
  "Lacquered silk cuirass",
  "Hide",
  "Chain shirt",
  "Scale mail",
  "Breastplate",
  "Half plate",
  "Ring mail",
  "Chain mail",
  "Splint",
  "Plate",
  "Shield",
] as const;

// ---------------------------------------------------------------------------
// Helpers for terse catalog literals.
// ---------------------------------------------------------------------------

const flags = (...props: WeaponProperty[]): ReadonlySet<WeaponProperty> =>
  new Set(props);
const aflags = (...props: ArmorProperty[]): ReadonlySet<ArmorProperty> =>
  new Set(props);

// ---------------------------------------------------------------------------
// Simple Melee Weapons (PG p. 162).
// ---------------------------------------------------------------------------

export const SIMPLE_MELEE: ReadonlyArray<WeaponDef> = [
  {
    id: "club",
    name: "Club",
    category: "simple-melee",
    cost: { shilling: 1 },
    weight: 2,
    damage: { count: 1, faces: 4 },
    damageType: "bludgeoning",
    flags: flags("light"),
  },
  {
    id: "dagger",
    name: "Dagger",
    category: "simple-melee",
    cost: { thaler: 2 },
    weight: 1,
    damage: { count: 1, faces: 4 },
    damageType: "piercing",
    flags: flags("finesse", "light"),
    properties: [{ kind: "thrown", range: [20, 60] }],
  },
  {
    id: "greatclub",
    name: "Greatclub",
    category: "simple-melee",
    cost: { shilling: 2 },
    weight: 10,
    damage: { count: 1, faces: 8 },
    damageType: "bludgeoning",
    flags: flags("two-handed"),
  },
  {
    id: "handaxe",
    name: "Handaxe",
    category: "simple-melee",
    cost: { thaler: 5 },
    weight: 2,
    damage: { count: 1, faces: 6 },
    damageType: "slashing",
    flags: flags("light"),
    properties: [{ kind: "thrown", range: [20, 60] }],
  },
  {
    id: "javelin",
    name: "Javelin",
    category: "simple-melee",
    cost: { shilling: 5 },
    weight: 2,
    damage: { count: 1, faces: 6 },
    damageType: "piercing",
    flags: flags(),
    properties: [{ kind: "thrown", range: [30, 120] }],
  },
  {
    id: "light-hammer",
    name: "Light hammer",
    category: "simple-melee",
    cost: { thaler: 2 },
    weight: 2,
    damage: { count: 1, faces: 4 },
    damageType: "bludgeoning",
    flags: flags("light"),
    properties: [{ kind: "thrown", range: [20, 60] }],
  },
  {
    id: "mace",
    name: "Mace",
    category: "simple-melee",
    cost: { thaler: 5 },
    weight: 4,
    damage: { count: 1, faces: 6 },
    damageType: "bludgeoning",
    flags: flags(),
  },
  {
    id: "quarterstaff",
    name: "Quarterstaff",
    category: "simple-melee",
    cost: { shilling: 2 },
    weight: 4,
    damage: { count: 1, faces: 8 },
    damageType: "bludgeoning",
    flags: flags("two-handed"),
  },
  {
    id: "sickle",
    name: "Sickle",
    category: "simple-melee",
    cost: { thaler: 1 },
    weight: 2,
    damage: { count: 1, faces: 4 },
    damageType: "slashing",
    flags: flags("light"),
  },
  {
    id: "spear",
    name: "Spear",
    category: "simple-melee",
    cost: { thaler: 1 },
    weight: 3,
    damage: { count: 1, faces: 6 },
    damageType: "piercing",
    flags: flags(),
    properties: [
      { kind: "thrown", range: [20, 60] },
      { kind: "versatile", twoHandedDamage: { count: 1, faces: 8 } },
    ],
  },
];

// ---------------------------------------------------------------------------
// Simple Ranged Weapons (PG p. 162).
// ---------------------------------------------------------------------------

export const SIMPLE_RANGED: ReadonlyArray<WeaponDef> = [
  {
    id: "crossbow-light",
    name: "Crossbow, light",
    category: "simple-ranged",
    cost: { thaler: 15 },
    weight: 5,
    damage: { count: 1, faces: 8 },
    damageType: "piercing",
    flags: flags("loading", "two-handed"),
    properties: [{ kind: "ammunition", range: [80, 320] }],
  },
  {
    id: "dart",
    name: "Dart",
    category: "simple-ranged",
    cost: { orteg: 5 },
    weight: 0.25,
    damage: { count: 1, faces: 4 },
    damageType: "piercing",
    flags: flags("finesse"),
    properties: [{ kind: "thrown", range: [20, 60] }],
  },
  {
    id: "horsemans-bow",
    name: "Horseman's Bow",
    category: "simple-ranged",
    cost: { thaler: 10 },
    weight: 2,
    damage: { count: 1, faces: 6 },
    damageType: "piercing",
    flags: flags("two-handed"),
    properties: [{ kind: "ammunition", range: [80, 320] }],
  },
  {
    id: "sling",
    name: "Sling",
    category: "simple-ranged",
    cost: { shilling: 1 },
    weight: 0,
    damage: { count: 1, faces: 4 },
    damageType: "bludgeoning",
    flags: flags(),
    properties: [{ kind: "ammunition", range: [30, 120] }],
  },
  {
    id: "spear-sling",
    name: "Spear Sling",
    category: "simple-ranged",
    cost: { thaler: 5 },
    weight: 2,
    damage: { count: 1, faces: 6 },
    damageType: "piercing",
    flags: flags("deep-impact"),
    properties: [{ kind: "ammunition", range: [40, 160] }],
  },
];

// ---------------------------------------------------------------------------
// Martial Melee Weapons (PG p. 163).
// ---------------------------------------------------------------------------

export const MARTIAL_MELEE: ReadonlyArray<WeaponDef> = [
  {
    id: "assassins-blade",
    name: "Assassin's Blade",
    category: "martial-melee",
    cost: { thaler: 20 },
    weight: 1,
    damage: { count: 1, faces: 6 },
    damageType: "piercing",
    flags: flags("concealed", "finesse"),
  },
  {
    id: "axe",
    name: "Axe",
    category: "martial-melee",
    cost: { thaler: 20 },
    weight: 3,
    damage: { count: 1, faces: 8 },
    damageType: "slashing",
    flags: flags(),
  },
  {
    id: "chain-staff",
    name: "Chain Staff",
    category: "martial-melee",
    cost: { thaler: 20 },
    weight: 3,
    damage: { count: 1, faces: 8 },
    damageType: "bludgeoning",
    flags: flags("ensnaring", "reach"),
  },
  {
    id: "crows-beak",
    name: "Crow's Beak",
    category: "martial-melee",
    cost: { thaler: 5 },
    weight: 3,
    damage: { count: 1, faces: 8 },
    damageType: "piercing",
    flags: flags("deep-impact"),
  },
  {
    id: "double-axe",
    name: "Double-axe",
    category: "martial-melee",
    cost: { thaler: 30 },
    weight: 7,
    damage: { count: 1, faces: 12 },
    damageType: "slashing",
    flags: flags("massive", "two-handed"),
  },
  {
    id: "estoc",
    name: "Estoc",
    category: "martial-melee",
    cost: { thaler: 30 },
    weight: 3,
    damage: { count: 1, faces: 8 },
    damageType: "piercing",
    flags: flags("deep-impact", "finesse"),
  },
  {
    id: "executioners-sword",
    name: "Executioner's Sword",
    category: "martial-melee",
    cost: { thaler: 60 },
    weight: 4,
    damage: { count: 1, faces: 12 },
    damageType: "slashing",
    flags: flags("massive", "two-handed"),
  },
  {
    id: "fencing-sword",
    name: "Fencing Sword",
    category: "martial-melee",
    cost: { thaler: 25 },
    weight: 2,
    damage: { count: 1, faces: 8 },
    damageType: "piercing",
    flags: flags("finesse"),
  },
  {
    id: "flail",
    name: "Flail",
    category: "martial-melee",
    cost: { thaler: 10 },
    weight: 2,
    damage: { count: 1, faces: 8 },
    damageType: "bludgeoning",
    flags: flags("ensnaring"),
  },
  {
    id: "grappling-axe",
    name: "Grappling Axe",
    category: "martial-melee",
    cost: { thaler: 30 },
    weight: 4,
    damage: { count: 1, faces: 8 },
    damageType: "slashing",
    flags: flags(),
    properties: [{ kind: "versatile", twoHandedDamage: { count: 1, faces: 10 } }],
  },
  {
    id: "great-flail",
    name: "Great Flail",
    category: "martial-melee",
    cost: { thaler: 20 },
    weight: 8,
    damage: { count: 1, faces: 12 },
    damageType: "bludgeoning",
    flags: flags("ensnaring", "heavy", "two-handed"),
  },
  {
    id: "greatsword",
    name: "Greatsword",
    category: "martial-melee",
    cost: { thaler: 50 },
    weight: 6,
    damage: { count: 2, faces: 6 },
    damageType: "slashing",
    flags: flags("heavy", "two-handed"),
  },
  {
    id: "halberd",
    name: "Halberd",
    category: "martial-melee",
    cost: { thaler: 20 },
    weight: 6,
    damage: { count: 1, faces: 10 },
    damageType: "slashing",
    flags: flags("heavy", "reach", "two-handed"),
  },
  {
    id: "lance",
    name: "Lance",
    category: "martial-melee",
    cost: { thaler: 10 },
    weight: 6,
    damage: { count: 1, faces: 12 },
    damageType: "piercing",
    flags: flags("heavy", "reach", "special"),
  },
  {
    id: "long-hammer",
    name: "Long Hammer",
    category: "martial-melee",
    cost: { thaler: 25 },
    weight: 2,
    damage: { count: 1, faces: 8 },
    damageType: "bludgeoning",
    flags: flags(),
    properties: [{ kind: "versatile", twoHandedDamage: { count: 1, faces: 10 } }],
  },
  {
    id: "longsword",
    name: "Longsword",
    category: "martial-melee",
    cost: { thaler: 15 },
    weight: 3,
    damage: { count: 1, faces: 8 },
    damageType: "slashing",
    flags: flags(),
    properties: [{ kind: "versatile", twoHandedDamage: { count: 1, faces: 10 } }],
  },
  {
    id: "maul",
    name: "Maul",
    category: "martial-melee",
    cost: { thaler: 10 },
    weight: 10,
    damage: { count: 2, faces: 6 },
    damageType: "bludgeoning",
    flags: flags("heavy", "two-handed"),
  },
  {
    id: "parrying-dagger",
    name: "Parrying Dagger",
    category: "martial-melee",
    cost: { thaler: 5 },
    weight: 1,
    damage: { count: 1, faces: 4 },
    damageType: "piercing",
    flags: flags("balanced", "light"),
  },
  {
    id: "pike",
    name: "Pike",
    category: "martial-melee",
    cost: { thaler: 15 },
    weight: 18,
    damage: { count: 1, faces: 10 },
    damageType: "piercing",
    flags: flags("heavy", "reach", "two-handed"),
  },
  {
    id: "shortsword",
    name: "Shortsword",
    category: "martial-melee",
    cost: { thaler: 10 },
    weight: 2,
    damage: { count: 1, faces: 6 },
    damageType: "piercing",
    flags: flags("finesse", "light"),
  },
  {
    id: "stiletto",
    name: "Stiletto",
    category: "martial-melee",
    cost: { thaler: 5 },
    weight: 1,
    damage: { count: 1, faces: 4 },
    damageType: "piercing",
    flags: flags("deep-impact", "finesse"),
  },
  {
    id: "whip",
    name: "Whip",
    category: "martial-melee",
    cost: { thaler: 2 },
    weight: 3,
    damage: { count: 1, faces: 4 },
    damageType: "slashing",
    flags: flags("ensnaring", "finesse", "reach"),
  },
];

// ---------------------------------------------------------------------------
// Martial Ranged Weapons (PG p. 165).
// ---------------------------------------------------------------------------

export const MARTIAL_RANGED: ReadonlyArray<WeaponDef> = [
  {
    id: "arbalest",
    name: "Arbalest",
    category: "martial-ranged",
    cost: { thaler: 50 },
    weight: 18,
    damage: { count: 1, faces: 10 },
    damageType: "piercing",
    flags: flags("deep-impact", "heavy", "loading", "two-handed"),
    properties: [{ kind: "ammunition", range: [100, 400] }],
  },
  {
    id: "blowpipe",
    name: "Blowpipe",
    category: "martial-ranged",
    cost: { thaler: 10 },
    weight: 1,
    damage: { count: 1, faces: 1 },
    damageType: "piercing",
    flags: flags("loading"),
    properties: [{ kind: "ammunition", range: [25, 100] }],
    description: "1 piercing damage; penetrates protection on hit (PG p. 165).",
  },
  {
    id: "bolas",
    name: "Bolas",
    category: "martial-ranged",
    cost: { thaler: 5 },
    weight: 2,
    damage: { count: 1, faces: 1 },
    damageType: "bludgeoning",
    flags: flags("finesse", "restraining"),
    properties: [{ kind: "thrown", range: [30, 90] }],
  },
  {
    id: "composite-bow",
    name: "Composite Bow",
    category: "martial-ranged",
    cost: { thaler: 30 },
    weight: 3,
    damage: { count: 1, faces: 8 },
    damageType: "piercing",
    flags: flags("deep-impact", "two-handed"),
    properties: [{ kind: "ammunition", range: [80, 320] }],
  },
  {
    id: "crossbow-hand",
    name: "Crossbow, hand",
    category: "martial-ranged",
    cost: { thaler: 75 },
    weight: 3,
    damage: { count: 1, faces: 6 },
    damageType: "piercing",
    flags: flags("light", "loading"),
    properties: [{ kind: "ammunition", range: [30, 120] }],
  },
  {
    id: "crossbow-heavy",
    name: "Crossbow, heavy",
    category: "martial-ranged",
    cost: { thaler: 25 },
    weight: 18,
    damage: { count: 1, faces: 10 },
    damageType: "piercing",
    flags: flags("heavy", "loading", "two-handed"),
    properties: [{ kind: "ammunition", range: [100, 400] }],
  },
  {
    id: "crossbow-repeating",
    name: "Crossbow, repeating",
    category: "martial-ranged",
    cost: { thaler: 100 },
    weight: 20,
    damage: { count: 1, faces: 8 },
    damageType: "piercing",
    flags: flags("two-handed"),
    properties: [{ kind: "ammunition", range: [80, 320] }],
  },
  {
    id: "longbow",
    name: "Longbow",
    category: "martial-ranged",
    cost: { thaler: 20 },
    weight: 2,
    damage: { count: 1, faces: 8 },
    damageType: "piercing",
    flags: flags("heavy", "two-handed"),
    properties: [{ kind: "ammunition", range: [150, 600] }],
  },
  {
    id: "net",
    name: "Net",
    category: "martial-ranged",
    cost: { thaler: 1 },
    weight: 3,
    // Net deals no damage — encoded as 0d4 to keep the shape consistent.
    damage: { count: 0, faces: 4 },
    damageType: "bludgeoning",
    flags: flags("ensnaring", "special"),
    properties: [{ kind: "thrown", range: [5, 15] }],
    description: "No damage; restrains a Large or smaller creature (PG p. 168).",
  },
  {
    id: "throwing-wing",
    name: "Throwing Wing",
    category: "martial-ranged",
    cost: { thaler: 10 },
    weight: 1,
    damage: { count: 1, faces: 6 },
    damageType: "bludgeoning",
    flags: flags("returning"),
    properties: [{ kind: "thrown", range: [30, 90] }],
  },
];

// ---------------------------------------------------------------------------
// Alchemical Weapons (PG p. 166). Not all have attack rolls — area-effect
// entries use Dex saves resolved separately. v1's popover surfaces them as
// catalog text without modeling the save UI; that's a Tier 2 follow-up.
// ---------------------------------------------------------------------------

export const ALCHEMICAL: ReadonlyArray<WeaponDef> = [
  {
    id: "breaching-pot-buried",
    name: "Breaching Pot (buried)",
    category: "alchemical",
    cost: { thaler: 100 },
    weight: 20,
    damage: { count: 3, faces: 10 },
    damageType: "bludgeoning",
    flags: flags("siege"),
  },
  {
    id: "breaching-pot-ground",
    name: "Breaching Pot (ground)",
    category: "alchemical",
    cost: { thaler: 100 },
    weight: 20,
    damage: { count: 3, faces: 8 },
    damageType: "fire",
    flags: flags(),
    properties: [{ kind: "area", shape: "radius", size: 20 }],
  },
  {
    id: "grenade",
    name: "Grenade",
    category: "alchemical",
    cost: { thaler: 25 },
    weight: 1,
    damage: { count: 1, faces: 10 },
    damageType: "fire",
    flags: flags(),
    properties: [
      { kind: "thrown", range: [30, 90] },
      { kind: "area", shape: "radius", size: 5 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Siege Weapons (PG p. 166). Catalog-only in v1.
// ---------------------------------------------------------------------------

export const SIEGE: ReadonlyArray<WeaponDef> = [
  {
    id: "ballista",
    name: "Ballista",
    category: "siege",
    cost: { thaler: 200 },
    weight: 450,
    damage: { count: 2, faces: 12 },
    damageType: "piercing",
    flags: flags("immobile", "siege", "loading"),
    properties: [{ kind: "ammunition", range: [200, 800] }],
  },
  {
    id: "catapult",
    name: "Catapult",
    category: "siege",
    cost: { thaler: 400 },
    weight: 2000,
    damage: { count: 3, faces: 8 },
    damageType: "bludgeoning",
    flags: flags("immobile", "siege", "loading"),
    properties: [
      { kind: "ammunition", range: [300, 1200] },
      { kind: "area", shape: "radius", size: 5 },
    ],
  },
  {
    id: "missile-battery",
    name: "Missile Battery",
    category: "siege",
    cost: { thaler: 150 },
    weight: 300,
    damage: { count: 3, faces: 8 },
    damageType: "fire",
    flags: flags("immobile", "loading"),
    properties: [
      { kind: "ammunition", range: [150, 600] },
      { kind: "area", shape: "radius", size: 10 },
    ],
  },
  {
    id: "trebuchet",
    name: "Trebuchet",
    category: "siege",
    cost: { thaler: 350 },
    weight: 2500,
    damage: { count: 3, faces: 12 },
    damageType: "bludgeoning",
    flags: flags("immobile", "siege", "loading"),
    properties: [
      { kind: "ammunition", range: [300, 1200] },
      { kind: "area", shape: "radius", size: 5 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Aggregated weapon catalog + name lookup.
// ---------------------------------------------------------------------------

export const WEAPONS: ReadonlyArray<WeaponDef> = [
  ...SIMPLE_MELEE,
  ...SIMPLE_RANGED,
  ...MARTIAL_MELEE,
  ...MARTIAL_RANGED,
  ...ALCHEMICAL,
  ...SIEGE,
];

export const WEAPON_BY_NAME: Record<string, WeaponDef> = Object.fromEntries(
  WEAPONS.map((w) => [w.name.toLowerCase(), w]),
);

// ---------------------------------------------------------------------------
// Light Armor (PG p. 169).
// ---------------------------------------------------------------------------

export const LIGHT_ARMORS: ReadonlyArray<ArmorDef> = [
  {
    id: "blessed-robe",
    name: "Blessed Robe",
    category: "light",
    cost: { thaler: 10 },
    weight: 5,
    ac: { base: 11, addDex: true },
    flags: aflags(),
  },
  {
    id: "concealed-armor",
    name: "Concealed Armor",
    category: "light",
    cost: { thaler: 20 },
    weight: 4,
    ac: { base: 11, addDex: true },
    flags: aflags("concealable"),
  },
  {
    id: "order-cloak",
    name: "Order Cloak",
    category: "light",
    cost: { thaler: 10 },
    weight: 5,
    ac: { base: 11, addDex: true },
    flags: aflags(),
  },
  {
    id: "skalds-cuirass",
    name: "Skald's Cuirass",
    category: "light",
    cost: { thaler: 30 },
    weight: 20,
    ac: { base: 12, addDex: true },
    flags: aflags(),
  },
  {
    id: "studded-leather",
    name: "Studded Leather",
    category: "light",
    cost: { thaler: 20 },
    weight: 15,
    ac: { base: 12, addDex: true },
    flags: aflags(),
  },
  {
    id: "witch-gown",
    name: "Witch Gown",
    category: "light",
    cost: { thaler: 10 },
    weight: 5,
    ac: { base: 11, addDex: true },
    flags: aflags(),
  },
  {
    id: "wolf-skin",
    name: "Wolf Skin",
    category: "light",
    cost: { thaler: 1 },
    weight: 15,
    ac: { base: 12, addDex: true },
    flags: aflags("cumbersome"),
  },
  {
    id: "woven-silk",
    name: "Woven Silk",
    category: "light",
    cost: { thaler: 50 },
    weight: 6,
    ac: { base: 12, addDex: true },
    flags: aflags(),
  },
];

// ---------------------------------------------------------------------------
// Medium Armor (PG p. 170).
// ---------------------------------------------------------------------------

export const MEDIUM_ARMORS: ReadonlyArray<ArmorDef> = [
  {
    id: "chain-shirt",
    name: "Chain Shirt",
    category: "medium",
    cost: { thaler: 50 },
    weight: 20,
    ac: { base: 13, addDex: true, dexMax: 2 },
    flags: aflags(),
  },
  {
    id: "crow-armor",
    name: "Crow Armor",
    category: "medium",
    cost: { thaler: 5 },
    weight: 30,
    ac: { base: 14, addDex: true, dexMax: 2 },
    flags: aflags("cumbersome"),
  },
  {
    id: "double-chain-mail",
    name: "Double Chain Mail",
    category: "medium",
    cost: { thaler: 125 },
    weight: 40,
    ac: { base: 14, addDex: true, dexMax: 2 },
    flags: aflags("noisy"),
  },
  {
    id: "lacquered-silk-cuirass",
    name: "Lacquered Silk Cuirass",
    category: "medium",
    cost: { thaler: 60 },
    weight: 18,
    ac: { base: 14, addDex: true, dexMax: 2 },
    flags: aflags(),
  },
  {
    id: "laminated-armor",
    name: "Laminated Armor",
    category: "medium",
    cost: { thaler: 150 },
    weight: 40,
    ac: { base: 15, addDex: true, dexMax: 2 },
    flags: aflags(),
  },
  {
    id: "scale-mail",
    name: "Scale Mail",
    category: "medium",
    cost: { thaler: 50 },
    weight: 45,
    ac: { base: 15, addDex: true, dexMax: 2 },
    flags: aflags("noisy"),
  },
];

// ---------------------------------------------------------------------------
// Heavy Armor (PG p. 170).
// ---------------------------------------------------------------------------

export const HEAVY_ARMORS: ReadonlyArray<ArmorDef> = [
  {
    id: "chain-and-plate",
    name: "Chain and Plate",
    category: "heavy",
    cost: { thaler: 250 },
    weight: 50,
    ac: { base: 15, addDex: false },
    flags: aflags(),
  },
  {
    id: "field-armor",
    name: "Field Armor",
    category: "heavy",
    cost: { thaler: 500 },
    weight: 70,
    ac: { base: 17, addDex: false },
    flags: aflags("cumbersome"),
    weightyStrMin: 13,
  },
  {
    id: "field-armor-of-the-pansars",
    name: "Field Armor of the Pansars",
    category: "heavy",
    cost: { thaler: 750 },
    weight: 70,
    ac: { base: 18, addDex: false },
    flags: aflags("noisy"),
    weightyStrMin: 15,
  },
  {
    id: "full-plate",
    name: "Full Plate",
    category: "heavy",
    cost: { thaler: 500 },
    weight: 65,
    ac: { base: 16, addDex: false },
    flags: aflags("noisy"),
    weightyStrMin: 15,
  },
  // Chain mail (legacy 5e item used in class starting equipment "chain mail")
  // — PG doesn't list it in the heavy armor table directly, but every
  // Warrior pick line references it. Encode as the standard 5e chain mail
  // (AC 16, no Dex) so class equipment lines resolve cleanly.
  {
    id: "chain-mail",
    name: "Chain mail",
    category: "heavy",
    cost: { thaler: 75 },
    weight: 55,
    ac: { base: 16, addDex: false },
    flags: aflags("noisy"),
    weightyStrMin: 13,
    description:
      "Standard chain mail referenced by class starting equipment (PG aligned with 5e SRD).",
  },
];

// Generic 5e "Leather armor" is also referenced by class starting equipment
// even though PG calls it "Studded Leather" / "Witch Gown" / etc. Add a
// canonical alias so the lookup resolves.
const LEGACY_LIGHT_ALIAS: ArmorDef = {
  id: "leather-armor",
  name: "Leather armor",
  category: "light",
  cost: { thaler: 10 },
  weight: 10,
  ac: { base: 11, addDex: true },
  flags: aflags(),
  description: "Generic leather armor (5e SRD) referenced by class starting equipment.",
};

// ---------------------------------------------------------------------------
// Shields (PG p. 171). Encoded as ArmorDef with category "shield".
// ---------------------------------------------------------------------------

export const SHIELDS: ReadonlyArray<ArmorDef> = [
  {
    id: "buckler",
    name: "Buckler",
    category: "shield",
    cost: { thaler: 4 },
    weight: 2,
    ac: { base: 1, addDex: false },
    flags: aflags(),
  },
  {
    id: "shield",
    name: "Shield",
    category: "shield",
    cost: { thaler: 10 },
    weight: 6,
    ac: { base: 2, addDex: false },
    flags: aflags(),
  },
];

// ---------------------------------------------------------------------------
// Aggregated armor catalog + name lookup.
// ---------------------------------------------------------------------------

export const ARMORS: ReadonlyArray<ArmorDef> = [
  ...LIGHT_ARMORS,
  LEGACY_LIGHT_ALIAS,
  ...MEDIUM_ARMORS,
  ...HEAVY_ARMORS,
  ...SHIELDS,
];

export const ARMOR_BY_NAME: Record<string, ArmorDef> = Object.fromEntries(
  ARMORS.map((a) => [a.name.toLowerCase(), a]),
);

// ---------------------------------------------------------------------------
// Module-load assertions: weapon and armor ids and names are unique.
// ---------------------------------------------------------------------------

(function assertEquipmentCatalog() {
  const fail = (msg: string) => {
    if (process.env.NODE_ENV === "production") {
      console.error(`[equipment] ${msg}`);
    } else {
      throw new Error(`[equipment] ${msg}`);
    }
  };

  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  for (const w of WEAPONS) {
    if (seenIds.has(w.id)) fail(`duplicate weapon id "${w.id}"`);
    if (seenNames.has(w.name.toLowerCase()))
      fail(`duplicate weapon name "${w.name}"`);
    seenIds.add(w.id);
    seenNames.add(w.name.toLowerCase());
  }

  const seenArmorIds = new Set<string>();
  const seenArmorNames = new Set<string>();
  for (const a of ARMORS) {
    if (seenArmorIds.has(a.id)) fail(`duplicate armor id "${a.id}"`);
    if (seenArmorNames.has(a.name.toLowerCase()))
      fail(`duplicate armor name "${a.name}"`);
    seenArmorIds.add(a.id);
    seenArmorNames.add(a.name.toLowerCase());
  }
})();

// Re-export `WeaponPropertyData` so consumers can import it directly from
// the data module without round-tripping through the types module.
export type { WeaponPropertyData };
