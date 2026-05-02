// Captain — PG p. 96–101.
//
// Class table source: PG p. 97. Captain gets a bonus Ability Score
// Improvement at L14 in addition to the canonical Symbaroum levels
// (4/8/10/12/16/19), encoded explicitly via `choicesByLevel`.
//
// Approach pages: Merchant Master p. 98, Officer p. 99–100, Outlaw p. 100,
// Poet-warrior p. 101.

import type {
  ApproachLevelEntry,
  CharacterLevel,
  ClassLevelEntry,
  LevelChoice,
} from "@/lib/character/types";
import {
  buildApproachLevelTable,
  buildClassLevelTable,
} from "./shared";

// ---------------------------------------------------------------------------
// Captain — class
// ---------------------------------------------------------------------------

const CAPTAIN_CLASS_FEATURES: Partial<
  Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>
> = {
  2: [
    {
      name: "Field Dressings (d6)",
      description:
        "On a short or long rest you can help wounded allies. If you or a friendly creature spends one or more Hit Dice during the rest, each of those creatures regains an extra 1d6 HP. Die size grows with level: d8 at L9, d10 at L11, d12 at L17.",
    },
  ],
  3: [
    {
      name: "Bid to Action",
      description:
        "When a creature's turn ends, reaction to nominate a friendly creature to act on its normal initiative count next round. Target must not have already taken its turn this round; future rounds keep its original count.",
    },
  ],
  5: [
    {
      name: "Extra Attack (2)",
      description: "When you take the Attack action you may attack twice instead of once.",
    },
  ],
  7: [
    {
      name: "War Stories",
      description:
        "On a short or long rest you may restore Hit Dice to friendly creatures equal to your proficiency bonus. Once per extended rest. At L15 you may use this twice per extended rest.",
    },
  ],
  9: [
    {
      name: "Field Dressings (d8)",
      description: "Field Dressings die size increases to d8.",
    },
  ],
  11: [
    {
      name: "Field Dressings (d10)",
      description: "Field Dressings die size increases to d10.",
    },
  ],
  15: [
    {
      name: "War Stories (×2)",
      description: "You may use War Stories twice per extended rest.",
    },
  ],
  17: [
    {
      name: "Field Dressings (d12)",
      description: "Field Dressings die size increases to d12.",
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
      name: "Unending Conflict",
      description: "When you roll initiative, gain 1d10 + 10 temporary HP.",
    },
  ],
};

// L14 bonus ASI — PG p. 97.
const CAPTAIN_CHOICES: Partial<Record<CharacterLevel, ReadonlyArray<LevelChoice>>> = {
  14: [{ kind: "asi-or-feat" }],
};

export const CAPTAIN_LEVEL_TABLE: ReadonlyArray<ClassLevelEntry> =
  buildClassLevelTable(CAPTAIN_CLASS_FEATURES, CAPTAIN_CHOICES);

// ---------------------------------------------------------------------------
// Merchant Master — PG p. 98
// ---------------------------------------------------------------------------

const MERCHANT_MASTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Constant Training",
      description:
        "Choose a number of pupils up to your proficiency bonus. After sharing an extended rest with them, bonus action to remind a pupil of their training: that pupil has advantage on their next attack roll before their next turn. Once per short or long rest.",
    },
    {
      name: "Consummate Haggler",
      description:
        "Advantage on Cha (Persuasion) checks to negotiate prices for equipment or services. If an ally can see and hear you in a social situation, they have advantage on Wis (Insight) checks.",
    },
  ],
  6: [
    {
      name: "Exceptional War Gear",
      description:
        "Each current pupil gains a non-magical +1 to a weapon's attack roll OR to their AC total. Cannot stack with an existing bonus, and cannot apply to shields.",
    },
  ],
  9: [
    {
      name: "Treasure Surveyor",
      description:
        "When you find a curiosity or Mystical treasure in a ruin, you can double its value at market.",
    },
  ],
  13: [
    {
      name: "Superior War Gear (+1)",
      description:
        "Each pupil's bonus may instead be a magical +1 to weapon attack/damage or AC. The bonus carries no permanent Corruption. Cannot apply to a weapon or armor that already has a bonus.",
    },
  ],
  17: [
    {
      name: "Superior War Gear (+2)",
      description: "The Superior War Gear magical bonus increases to +2.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Officer — PG p. 99–100
// ---------------------------------------------------------------------------

const OFFICER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Squad Orders",
      description:
        "After training together, choose 1 + your Charisma modifier characters as your squad. When you roll initiative, give one order that lasts 1 minute: 'Be alert!' (advantage on Wis (Perception) in combat), 'Brace yourselves!' (no movement; melee attacks against squad have disadvantage until next turn), or 'Stand fast!' (advantage on saves/checks vs. forced movement).",
    },
  ],
  6: [
    {
      name: "Aura of Aggression",
      description:
        "Bonus action to motivate one ally that can hear and see you. They may use a bonus action on their next turn to make a single melee attack against a target within 5 ft. Uses per short or long rest = your proficiency bonus.",
    },
  ],
  9: [
    {
      name: "Additional Orders",
      description:
        "Squad Orders gains three more options: 'Braced fire!' (squad member uses bonus action at start of its turn to reduce speed to 0 for advantage on first ranged attack), 'Form ranks!' (member within 5 ft of another taking an Attack action gets advantage on first attack), 'Stay focused!' (advantage on saves vs. charm).",
    },
  ],
  13: [
    {
      name: "Aura of Confidence",
      description: "You and any creature within 30 ft of you are immune to the frightened condition.",
    },
  ],
  17: [
    {
      name: "Unwavering",
      description:
        "If reduced to 0 HP, Con save (DC 10 or half the damage dealt, whichever is higher) to drop to 1 HP instead. Once per long or extended rest.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Outlaw — PG p. 100
// ---------------------------------------------------------------------------

const OUTLAW_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Fleet-footed",
      description: "Your base walking speed increases by 10 feet.",
    },
  ],
  6: [
    {
      name: "Eagle's Eye",
      description:
        "Reaction to give yourself or a friendly creature within 30 ft (that can see and hear you) advantage on a ranged weapon attack roll.",
    },
    {
      name: "Natural Leader of the Common Folk",
      description:
        "Advantage on Cha checks when half or more of those listening are non-noble members of your origin.",
    },
  ],
  9: [
    {
      name: "Archery Expert",
      description: "Bonus action to make an additional ranged weapon attack.",
    },
  ],
  13: [
    {
      name: "Secret Folk",
      description:
        "While within 30 ft of an ally, each ally gains a bonus to Dex (Stealth) checks equal to twice your proficiency bonus.",
    },
  ],
  17: [
    {
      name: "Superior Marksman",
      description:
        "When targeted by a ranged weapon attack, reaction to make a ranged attack roll. If your roll meets or exceeds the attacker's roll, the incoming attack fails.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Poet-warrior — PG p. 101
// ---------------------------------------------------------------------------

const POET_WARRIOR_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Withering Words",
      description:
        "When a creature that can hear and understand you takes damage, bonus action or reaction: it takes an additional 1d6 psychic damage and has disadvantage on its next attack roll. Once per turn.",
    },
  ],
  6: [
    {
      name: "Quiet Fortitude",
      description:
        "When you roll initiative, choose a number of allies up to your proficiency bonus who can hear and understand you. They are proficient with all saving throws for 1 minute. Once per long or extended rest.",
    },
  ],
  9: [
    {
      name: "Song of the Blade",
      description:
        "Choose a melee weapon you are proficient with. When wielding it, bonus action to make an additional single attack with that weapon.",
    },
  ],
  13: [
    {
      name: "Subtle Words",
      description:
        "When you use Bid to Action on an ally, that ally has advantage on their first ability check or attack roll on their turn.",
    },
  ],
  17: [
    {
      name: "Dancing Blade",
      description:
        "On your first turn of combat, choose a creature. On a successful Cha (Intimidation) check (DC 10 or its CR, whichever is higher) it is frightened of you until combat ends.",
    },
  ],
};

export const CAPTAIN_APPROACH_LEVEL_TABLES: Record<string, ReadonlyArray<ApproachLevelEntry>> = {
  "merchant-master": buildApproachLevelTable(MERCHANT_MASTER_FEATURES),
  officer: buildApproachLevelTable(OFFICER_FEATURES),
  outlaw: buildApproachLevelTable(OUTLAW_FEATURES),
  "poet-warrior": buildApproachLevelTable(POET_WARRIOR_FEATURES),
};
