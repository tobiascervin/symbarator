// Hunter — PG p. 102–107.
//
// Class table source: PG p. 103. ASIs at the canonical Symbaroum levels
// (4/8/10/12/16/19); no bonus ASI levels.
//
// Approach pages: Bounty Hunter p. 104, Ironsworn p. 105, Monster Hunter
// p. 106, Witch Hunter p. 107.
//
// IMPORTANT: Witch Hunter is NOT a slot-based half-caster (despite earlier
// scaffolding). They learn ritual-only spells from the Theurg list at L1, 3,
// 6, 9, 13, 17 — no slots, no cantrips, no concurrent leveled spell. The
// spellcasting shape encodes this as `spellsKnown` progression with all
// slot counts at 0.

import type {
  ApproachLevelEntry,
  ApproachSpellcasting,
  CharacterLevel,
  ClassLevelEntry,
} from "@/lib/character/types";
import {
  buildApproachLevelTable,
  buildClassLevelTable,
  LEVELS,
} from "./shared";

// ---------------------------------------------------------------------------
// Hunter — class
// ---------------------------------------------------------------------------

const HUNTER_CLASS_FEATURES: Partial<
  Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>
> = {
  2: [
    {
      name: "Hunter's Instinct",
      description:
        "Bonus action to mark one creature as your chosen target. The first time you damage it on your turn, add your proficiency bonus as damage of the same type. With a ranged weapon, reaction to attack when the target uses its own movement (range from its starting position).",
    },
  ],
  5: [
    {
      name: "Extra Attack (2)",
      description: "When you take the Attack action you may attack twice instead of once.",
    },
  ],
  6: [
    {
      name: "Expertise",
      description:
        "Choose either Nature or Survival, plus one other skill proficiency you have. Your proficiency bonus is doubled for any check using either of those proficiencies.",
    },
  ],
  7: [
    {
      name: "Land's Stride",
      description:
        "Nonmagical difficult terrain costs no extra movement. You may pass through nonmagical thorny plants without being slowed or taking damage. Advantage on saves vs. magically created/manipulated plants (e.g. entangle).",
    },
  ],
  11: [
    {
      name: "Hide in Plain Sight",
      description:
        "Spend 1 minute (with fresh mud or natural materials) to camouflage yourself. While camouflaged, +10 to Dex (Stealth) checks while pressed against a solid surface (≥ your size). Half-speed movement preserves it; faster movement, an action, or reaction breaks it.",
    },
  ],
  14: [
    {
      name: "Vanish",
      description:
        "You can Hide as a bonus action. You can't be tracked by nonmagical means unless you choose to leave a trail.",
    },
    {
      name: "Expertise (extended)",
      description:
        "Choose two more skills for Expertise. Your proficiency bonus is doubled for checks with these proficiencies.",
    },
  ],
  15: [
    {
      name: "Feral Senses",
      description:
        "When you attack a creature you can't see, your inability to see doesn't impose disadvantage. You sense any invisible creature within 30 ft (unless it's hidden from you and you aren't blinded/deafened).",
    },
  ],
  18: [
    {
      name: "Extra Attack (3)",
      description: "Your Attack action grants three attacks.",
    },
  ],
  20: [
    {
      name: "Expert Hunter",
      description:
        "Once per short or long rest, you may turn a missed attack against a target within range into a hit, OR treat a failed ability check d20 roll as a 20.",
    },
  ],
};

export const HUNTER_LEVEL_TABLE: ReadonlyArray<ClassLevelEntry> =
  buildClassLevelTable(HUNTER_CLASS_FEATURES);

// ---------------------------------------------------------------------------
// Bounty Hunter — PG p. 104
// ---------------------------------------------------------------------------

const BOUNTY_HUNTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Rough Fighting",
      description:
        "Mastered alleyway techniques like 'gutter-kiss' (head-butt) and 'goblin-squeeze' (groin kick). Your unarmed strikes deal 1d6 bludgeoning damage.",
    },
  ],
  6: [
    {
      name: "Rough Fighting (improved)",
      description:
        "Bonus action: gain advantage on a grapple attempt against a target your size or smaller.",
    },
  ],
  9: [
    {
      name: "Urban Tracker",
      description:
        "You can find or follow almost anyone in a city. Advantage on Dex (Stealth) checks to hide in urban environments and Wis (Survival) checks to track in cities.",
    },
  ],
  13: [
    {
      name: "Precise Strike",
      description:
        "Bonus action when making a ranged attack to attempt a precise strike. On hit (no damage), the target Str saves vs. your attack roll or drops what it's holding.",
    },
  ],
  17: [
    {
      name: "Stunning Blows",
      description:
        "Bonus action when making an attack: on hit, instead of damage, the target Con saves vs. your attack roll total or is stunned. Saves at end of each turn.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Ironsworn — PG p. 105
// ---------------------------------------------------------------------------

const IRONSWORN_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Loremaster",
      description:
        "Int (Investigation) check to identify a magic item's properties (DC by rarity: common 10, uncommon 13, rare 16, very rare 19, legendary 22). Also gain proficiency in both human languages (Ambrian and Barbarian).",
    },
  ],
  6: [
    {
      name: "Loremaster — Artifact Affinity",
      description:
        "Reduce the permanent Corruption cost of a single artifact by 1 (minimum 1).",
    },
  ],
  9: [
    {
      name: "Loremaster — Scroll Casting",
      description:
        "Cast spells of a level equal to or lower than your proficiency bonus directly from scrolls and similar parchments. You also gain advantage on saves against magical effects and learn the Symbaroum language.",
    },
    {
      name: "Sniper",
      description:
        "On a hit with a ranged weapon, the target Con saves; on a fail, its speed becomes 0 until the end of its next turn. Save DC = 8 + Dex mod + prof bonus, or the damage dealt — whichever is higher.",
    },
  ],
  13: [
    {
      name: "Sniper (crit on 19–20)",
      description: "Critical hits with ranged weapons score on a natural 19 or 20.",
    },
  ],
  17: [
    {
      name: "Sniper (double Dex damage)",
      description: "Add twice your Dex modifier to damage rolls with ranged weapons.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Monster Hunter — PG p. 106
// ---------------------------------------------------------------------------

const MONSTER_HUNTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Trapper",
      description:
        "Proficient with mechanical and alchemical traps. Action in combat to deploy a mechanical trap within 5 ft. You're never threatened by your own trap, but movement within 5 ft of trapped area is difficult terrain. Action: Dex (Sleight of Hand) check to disable a mechanical trap.",
    },
  ],
  6: [
    {
      name: "Trapper — Alchemical Mines",
      description:
        "Action to deploy a mechanical or alchemical trap within 5 ft.",
    },
  ],
  9: [
    {
      name: "Trapper — Improvised Area",
      description:
        "Given time before combat, prepare an area with improvised traps. Each trap takes 10 minutes to prepare and deals 1d8 damage (bludgeoning, piercing, or slashing).",
    },
  ],
  13: [
    {
      name: "Polearm Master",
      description:
        "When a creature comes within reach of your weapon, reaction to make a single attack with a reach weapon against it.",
    },
  ],
  17: [
    {
      name: "Polearm Master (improved)",
      description:
        "Melee attacks against you with weapons whose reach is shorter than yours have disadvantage.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Witch Hunter — PG p. 107
// Ritualist grants one Theurg ritual at each of L1/3/6/9/13/17. The
// approach has NO slot-based spellcasting; spellcasting metadata uses an
// all-zero slot table with progression in `spellsKnown`.
// ---------------------------------------------------------------------------

const WITCH_HUNTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Ritualist (+1 spell)",
      description:
        "Choose another ritual spell from the Theurg list (level ≤ proficiency bonus). You gain permanent Corruption equal to half the spell level (cantrips: none). Castable only as a ritual; the ritual takes 10 minutes longer than normal and is cast at base level. No Corruption from casting it.",
    },
  ],
  6: [
    {
      name: "Ritualist (+1 spell)",
      description: "Add another ritual spell from the Theurg list.",
    },
    {
      name: "Deadly Need",
      description:
        "Once cast a known spell as a non-ritual at need, but you gain twice the normal Corruption since your understanding of the magical arts is limited.",
    },
  ],
  9: [
    {
      name: "Ritualist (+1 spell)",
      description: "Add another ritual spell from the Theurg list.",
    },
    {
      name: "Steadfast",
      description:
        "Reaction: gain advantage on a Con or Wis saving throw. Uses per short or longer rest = your proficiency bonus.",
    },
  ],
  13: [
    {
      name: "Ritualist (+1 spell)",
      description: "Add another ritual spell from the Theurg list.",
    },
    {
      name: "Retributive Rage",
      description:
        "When you succeed at a save granted by Steadfast and the source was a spellcaster, that creature takes 1d6 psychic damage. Increases to 1d12 at L17.",
    },
  ],
  17: [
    {
      name: "Ritualist (+1 spell)",
      description: "Add another ritual spell from the Theurg list.",
    },
    {
      name: "Retributive Rage (1d12)",
      description: "Retributive Rage psychic damage increases to 1d12.",
    },
  ],
};

export const HUNTER_APPROACH_LEVEL_TABLES: Record<string, ReadonlyArray<ApproachLevelEntry>> = {
  "bounty-hunter": buildApproachLevelTable(BOUNTY_HUNTER_FEATURES),
  ironsworn: buildApproachLevelTable(IRONSWORN_FEATURES),
  "monster-hunter": buildApproachLevelTable(MONSTER_HUNTER_FEATURES),
  "witch-hunter": buildApproachLevelTable(WITCH_HUNTER_FEATURES),
};

// ---------------------------------------------------------------------------
// Witch Hunter spellcasting (PG p. 107)
// Ritual-only Theurg spells, one new at each of L1/3/6/9/13/17.
// ---------------------------------------------------------------------------

const ZERO_SLOTS: ReadonlyArray<number> = [0, 0, 0, 0, 0, 0, 0, 0, 0];
// Total ritual spells known at character level N (L1=1, L3=2, L6=3, L9=4, L13=5, L17=6).
const WITCH_HUNTER_SPELLS_KNOWN = [
  1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6,
];

export const WITCH_HUNTER_SPELLCASTING: ApproachSpellcasting = {
  abilityHint: "wis",
  cantripsKnownAt1: 0,
  spellsKnownAt1: 1,
  spellSlotsAt1: 0,
  progression: LEVELS.map((_, i) => ({
    cantripsKnown: 0,
    spellsKnown: WITCH_HUNTER_SPELLS_KNOWN[i],
    spellSlots: ZERO_SLOTS,
  })),
};
