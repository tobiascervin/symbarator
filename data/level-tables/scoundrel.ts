// Scoundrel — PG p. 126–135.
//
// Class table source: PG p. 127. ASIs at the canonical Symbaroum levels
// (4/8/10/12/16/19) with no extras. The Backstab damage column on the PG
// table progresses 1d6 → 10d6 across odd character levels; this is reflected
// in the L1 Backstab feature description rather than re-stated each level.
//
// Approach pages: Explorer p. 128, Former Cultist p. 129–130, Guild Thief
// p. 130–131, Sapper p. 131–132, Spy p. 132–133, Thug p. 133–134,
// Treasure-hunter p. 134.
//
// IMPORTANT: Former Cultist (p. 129) is a slot-based half-caster on the
// Sorcerer list. Its progression chart is identical to the Templar chart
// (p. 143), so we reuse the same cantrips-known and spells-known curves.

import type {
  ApproachLevelEntry,
  ApproachSpellcasting,
  CharacterLevel,
  FeatureDef,
  ClassLevelEntry,
} from "@/lib/character/types";
import {
  buildApproachLevelTable,
  buildClassLevelTable,
  halfCasterProgression,
} from "./shared";

// ---------------------------------------------------------------------------
// Scoundrel — class
// ---------------------------------------------------------------------------

const SCOUNDREL_CLASS_FEATURES: Partial<
  Record<CharacterLevel, ReadonlyArray<FeatureDef>>
> = {
  2: [
    {
      name: "Cunning Action",
      description:
        "Bonus action on each of your turns to take Dash, Disengage, or Hide.",
    },
  ],
  5: [
    {
      name: "Uncanny Dodge",
      description:
        "When an attacker you can see hits you, reaction to halve the attack's damage against you.",
    },
  ],
  6: [
    {
      name: "Expertise (improved)",
      description: "Choose two more of your skill or thieves'-tools proficiencies for Expertise.",
    },
  ],
  7: [
    {
      name: "Evasion",
      description:
        "When subjected to an effect allowing a Dex save for half damage, you take none on success and half on failure.",
    },
  ],
  11: [
    {
      name: "Reliable Talent",
      description:
        "When making an ability check that adds your proficiency bonus, treat any d20 roll of 9 or lower as a 10.",
    },
  ],
  14: [
    {
      name: "Blindsense",
      description:
        "If you can hear, you are aware of any hidden or invisible creature within 10 ft.",
    },
  ],
  15: [
    {
      name: "Slippery Mind",
      description: "Gain proficiency in Wisdom saving throws.",
    },
  ],
  18: [
    {
      name: "Elusive",
      description:
        "No attack roll has advantage against you while you aren't incapacitated.",
    },
  ],
  20: [
    {
      name: "Stroke of Luck",
      description:
        "Once per short or long rest: turn a missed in-range attack into a hit, OR treat a failed ability-check d20 as a 20.",
    },
  ],
};

export const SCOUNDREL_LEVEL_TABLE: ReadonlyArray<ClassLevelEntry> =
  buildClassLevelTable(SCOUNDREL_CLASS_FEATURES);

// ---------------------------------------------------------------------------
// Explorer — PG p. 128
// ---------------------------------------------------------------------------

const EXPLORER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Steadfast Watch",
      description:
        "On a long rest in the wilderness, allies up to your proficiency bonus each regain a Hit Die. You may include yourself.",
    },
  ],
  6: [
    {
      name: "Specialties",
      description:
        "Choose Marksman (bonus action to aim — speed 0 and advantage on ranged attacks; later: crit on 19+, no long-range disadvantage), Monster Lore (Int (Nature) check vs. DC 10+CR for vulnerabilities/threat assessment of beasts/giants/humanoids/plants — extends to other creature types at higher levels), or Sixth Sense (darkvision in dim light, blindsight 30 ft in total darkness; later: never surprised, blindsight 90 ft).",
    },
  ],
  9: [
    {
      name: "Specialty (improved)",
      description: "Your chosen Specialty improves per its level-9 entry.",
    },
  ],
  13: [
    {
      name: "Specialty (improved)",
      description: "Your chosen Specialty improves per its level-13 entry.",
    },
  ],
  17: [
    {
      name: "Wilderness Home",
      description:
        "You and a number of creatures up to your proficiency bonus can take long or extended rests almost anywhere in the wilderness; your camp counts as safe.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Former Cultist — PG p. 129–130
// ---------------------------------------------------------------------------

const FORMER_CULTIST_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Alchemy",
      description:
        "Proficiency with Alchemist's supplies. Identify drugs and poisons. DC 10 Int (Alchemist's supplies) check on extended rest to produce one dose of a weak or basic elixir.",
    },
  ],
  6: [
    {
      name: "Poisoner",
      description:
        "On a short or long rest, prepare a weapon or 20 pieces of ammunition with a poisonous coating: DC 15 Int (Poisoner's kit) check. Success by 5+ adds 1d6 poison damage and 1-minute poisoned condition (Con save vs 8 + Int + prof). Effect lasts until your next rest.",
    },
  ],
  9: [
    {
      name: "Alchemy (moderate)",
      description:
        "DC 15 Int check on extended rest to produce one moderate elixir, or 1d3+1 weak/basic elixirs.",
    },
  ],
  13: [
    {
      name: "Poisoner (3d6)",
      description: "Poisoner damage increases to 3d6.",
    },
  ],
  17: [
    {
      name: "Alchemy (strong)",
      description:
        "DC 20 Int check on extended rest to produce one strong elixir, 1d3+1 moderate, or 1d6+2 weak/basic.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Guild Thief — PG p. 130–131
// ---------------------------------------------------------------------------

const GUILD_THIEF_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Cheap Shot",
      description:
        "Mastered alleyway techniques like 'gutter-kiss' (head-butt) and 'goblin-squeeze' (groin kick). Your unarmed strikes deal 1d6 bludgeoning.",
    },
  ],
  6: [
    {
      name: "Close-Combat Expert",
      description:
        "Wielding only knives or daggers in both hands, opponents with longer weapons have disadvantage on attack rolls against you. Natural weapons don't trigger this.",
    },
  ],
  9: [
    {
      name: "Cheap Shot (Stunning)",
      description:
        "Bonus action: make two extra unarmed attacks, OR a single strike that (instead of damage) forces a Con save (DC 8 + Dex + prof) — on fail, target stunned until end of its next turn.",
    },
  ],
  13: [
    {
      name: "Opportunist",
      description:
        "Advantage on opportunity attacks. If you damage a creature with an opportunity attack, its movement becomes 0.",
    },
  ],
  17: [
    {
      name: "Trapper",
      description:
        "Action in combat: deploy a mechanical or alchemical trap within 5 ft. You're never threatened by your own trap; movement within 5 ft of it is difficult terrain.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Sapper — PG p. 131–132
// ---------------------------------------------------------------------------

const SAPPER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Siege Expert",
      description:
        "Identify weaknesses in inanimate objects/structures: deal double damage to objects. Proficiency with siege weapons.",
    },
  ],
  6: [
    {
      name: "Weapons Specialist",
      description:
        "Use an alchemical firetube to deliver Backstab damage (when other Backstab conditions are met).",
    },
  ],
  9: [
    {
      name: "Siege Expert (Backstab Objects)",
      description:
        "Add your Backstab damage to an attack on an object, then double the total damage as per Siege Expert.",
    },
  ],
  13: [
    {
      name: "Fast Work",
      description: "Use Cunning Action to throw a grenade or set a breaching pot.",
    },
  ],
  17: [
    {
      name: "Alchemical Expert",
      description: "Advantage on any alchemist's-supplies check.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Spy — PG p. 132–133
// PG describes Feint as a L1 ability; it's surfaced here at L1 in the level
// table since the existing classes.ts level1Features omits it.
// ---------------------------------------------------------------------------

const SPY_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  1: [
    {
      name: "Feint",
      description:
        "Wielding a finesse weapon, bonus action: leave an opening. Until your next turn, the next attacker against you has advantage but you may use your reaction to attack them immediately after their attack. Attackers lose advantage once you use your reaction.",
    },
  ],
  3: [
    {
      name: "Twin Attack",
      description:
        "Wielding a finesse melee weapon in your primary hand and a light weapon in the other, add your ability modifier to off-hand damage rolls.",
    },
  ],
  6: [
    {
      name: "Feint (improved)",
      description:
        "Bonus action: feint with a Dex (Sleight of Hand) check vs. opponent's AC. On success, advantage on attacks against them until end of your turn.",
    },
    {
      name: "Poisoner",
      description:
        "On a short or long rest, prepare a weapon or 20 pieces of ammunition with a poisonous coating (DC 15 Int (Poisoner's kit)). Success by 5+: 1d6 poison and 1-minute poisoned (Con save vs 8 + Int + prof). Effect lasts until your next rest.",
    },
  ],
  9: [
    {
      name: "Twin Attack (improved)",
      description:
        "Wield a finesse weapon in each hand and add your ability modifier to damage rolls with each.",
    },
  ],
  13: [
    {
      name: "Poisoner (3d6)",
      description: "Poison damage increases to 3d6.",
    },
  ],
  17: [
    {
      name: "Poisoner (5d6)",
      description: "Poison damage increases to 5d6.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Thug — PG p. 133–134
// ---------------------------------------------------------------------------

const THUG_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Acrobatic Fighter",
      description:
        "Gain Acrobatics proficiency if you don't have it. When attacked, reaction: Dex (Acrobatics) check; if the result equals or exceeds the attack roll you take no damage.",
    },
  ],
  9: [
    {
      name: "Strangler",
      description:
        "While grappling a living creature your size or smaller and not carrying anything else, action: strangle the creature. After rounds equal to its Constitution modifier, it falls unconscious. Garroted creatures can't call out for help.",
    },
  ],
  13: [
    {
      name: "Strangler (Tight Hold)",
      description: "Garroted creatures have disadvantage on Escape attempts.",
    },
  ],
  17: [
    {
      name: "Strangler (Acrobatic Grapple)",
      description:
        "When you grapple a creature you may use Dex (Acrobatics) to initiate the grapple.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Treasure-hunter — PG p. 134
// ---------------------------------------------------------------------------

const TREASURE_HUNTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Alchemy",
      description:
        "Proficiency with Alchemist's supplies. DC 10 check on extended rest produces one weak/basic elixir.",
    },
    {
      name: "Fast Hands",
      description:
        "Use the bonus action from Cunning Action to make a Dex (Sleight of Hand) check, use thieves' tools to disarm a trap or open a lock, or take the Use an Object action.",
    },
  ],
  6: [
    {
      name: "Nimbleness",
      description:
        "Climb without extra movement cost. Running jumps cover an extra distance equal to your Dex modifier (in feet). Advantage on Dex (Stealth) if you move ≤ half speed that turn.",
    },
  ],
  9: [
    {
      name: "Treasure Surveyor",
      description:
        "When you find a curiosity or Mystical treasure in a ruin, you can double its value at market.",
    },
    {
      name: "Alchemy (moderate)",
      description:
        "DC 15 Int (Alchemist's supplies) check on extended rest produces one moderate elixir or 1d3+1 weak/basic.",
    },
  ],
  13: [
    {
      name: "Steel Throw (improved)",
      description:
        "No long-range disadvantage with throwing weapons; crit on a natural 19 or 20.",
    },
  ],
  17: [
    {
      name: "Alchemy (strong)",
      description:
        "DC 20 check on extended rest: one strong elixir, 1d3+1 moderate, or 1d6+2 weak/basic.",
    },
  ],
};

export const SCOUNDREL_APPROACH_LEVEL_TABLES: Record<string, ReadonlyArray<ApproachLevelEntry>> = {
  explorer: buildApproachLevelTable(EXPLORER_FEATURES),
  "former-cultist": buildApproachLevelTable(FORMER_CULTIST_FEATURES),
  "guild-thief": buildApproachLevelTable(GUILD_THIEF_FEATURES),
  sapper: buildApproachLevelTable(SAPPER_FEATURES),
  spy: buildApproachLevelTable(SPY_FEATURES),
  thug: buildApproachLevelTable(THUG_FEATURES),
  "treasure-hunter": buildApproachLevelTable(TREASURE_HUNTER_FEATURES),
};

// ---------------------------------------------------------------------------
// Former Cultist spellcasting (PG p. 129)
// Same chart shape as Templar (p. 143) — same numbers; tradition: Sorcerer.
// ---------------------------------------------------------------------------

export const FORMER_CULTIST_SPELLCASTING: ApproachSpellcasting = {
  abilityHint: "cha",
  cantripsKnownAt1: 2,
  spellsKnownAt1: 1, // detect magic granted automatically; +1 chosen 1st-level
  spellSlotsAt1: 2,
  progression: halfCasterProgression({
    cantripsKnown: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    spellsKnown: [1, 1, 3, 3, 3, 6, 6, 6, 10, 10, 10, 10, 13, 13, 13, 13, 15, 15, 15, 15],
  }),
};
