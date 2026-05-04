// Warrior — PG p. 136–145.
//
// Class table source: PG p. 137. Warrior gets a bonus Ability Score
// Improvement at L14 in addition to the canonical Symbaroum ASI levels
// (4/8/10/12/16/19). That extra slot is encoded explicitly via
// `choicesByLevel` so the level-up flow surfaces it.
//
// Approach pages: Berserker p. 138, Duelist p. 139, Knight p. 140,
// Rune Smith p. 141, Tattooed Fighter p. 142, Templar p. 142–143,
// Weapon Master p. 144, Wrathguard p. 145.

import type {
  ApproachLevelEntry,
  ApproachSpellcasting,
  CharacterLevel,
  FeatureDef,
  ClassLevelEntry,
  LevelChoice,
} from "@/lib/character/types";
import {
  buildApproachLevelTable,
  buildClassLevelTable,
  halfCasterProgression,
} from "./shared";

// ---------------------------------------------------------------------------
// Warrior — class
// ---------------------------------------------------------------------------

const WARRIOR_CLASS_FEATURES: Partial<
  Record<CharacterLevel, ReadonlyArray<FeatureDef>>
> = {
  2: [
    {
      id: "warrior:action-surge",
      name: "Action Surge",
      description:
        "Once per short or long rest, on your turn take one additional action. From L15 you may use it twice per rest, but only once per turn.",
      usage: { count: 1, per: "short-rest" },
    },
  ],
  5: [
    {
      name: "Extra Attack (2)",
      description:
        "When you take the Attack action you may attack twice instead of once.",
    },
  ],
  7: [
    {
      id: "warrior:indomitable",
      name: "Indomitable",
      description:
        "Once per long or extended rest, reroll a failed saving throw and use the new result.",
      usage: { count: 1, per: "long-rest" },
    },
  ],
  11: [
    {
      name: "Extra Attack (3)",
      description: "Your Attack action grants three attacks.",
    },
  ],
  15: [
    {
      // Same id as the L2 entry — `findTrackedFeatures` walks L1 → c.level
      // and last-write-wins, so at character L15+ this entry's max (2)
      // overrides the L2 entry's max (1).
      id: "warrior:action-surge",
      name: "Action Surge (2 uses)",
      description: "You may use Action Surge twice per rest, but only once on the same turn.",
      usage: { count: 2, per: "short-rest" },
    },
  ],
  18: [
    {
      name: "Extra Attack (4)",
      description: "Your Attack action grants four attacks.",
    },
  ],
  20: [
    {
      name: "Undying Courage",
      description:
        "Once per any rest, when forced to make a saving throw you may choose to pass it instead.",
    },
  ],
};

// L14 bonus ASI — PG p. 137.
const WARRIOR_CHOICES: Partial<Record<CharacterLevel, ReadonlyArray<LevelChoice>>> = {
  14: [{ kind: "asi-or-feat" }],
};

export const WARRIOR_LEVEL_TABLE: ReadonlyArray<ClassLevelEntry> =
  buildClassLevelTable(WARRIOR_CLASS_FEATURES, WARRIOR_CHOICES);

// ---------------------------------------------------------------------------
// Berserker — PG p. 138
// ---------------------------------------------------------------------------

const BERSERKER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Reckless Attack",
      description:
        "On your first attack of a turn while raging, you may attack recklessly: melee Strength attacks gain advantage but attacks against you have advantage until your next turn.",
    },
  ],
  6: [
    {
      name: "Mindless Rage",
      description:
        "While raging you can't be charmed or frightened; existing charm/fear effects are suspended for the duration.",
    },
  ],
  9: [
    {
      name: "Brutal Critical (1d)",
      description:
        "While raging, melee crits roll one extra weapon damage die. Increases at L13 (2d) and L17 (3d).",
    },
  ],
  13: [
    {
      name: "Brutal Critical (2d)",
      description: "Melee crits while raging now roll two extra weapon damage dice.",
    },
  ],
  17: [
    {
      name: "Brutal Critical (3d)",
      description: "Melee crits while raging now roll three extra weapon damage dice.",
    },
    {
      name: "Incredible Might",
      description:
        "If your Strength check total is below your Strength score, you may use the score in place of the total.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Duelist — PG p. 139
// ---------------------------------------------------------------------------

const DUELIST_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Twin Attack",
      description:
        "Wielding a finesse melee weapon in your primary hand and a light weapon in the other, you add your ability modifier to off-hand damage rolls.",
    },
  ],
  6: [
    {
      name: "Feint (improved)",
      description:
        "Bonus action: feint with a Dex (Sleight of Hand) check vs. opponent's AC. On success, you have advantage on attacks against them until end of your turn.",
    },
  ],
  9: [
    {
      name: "Twin Attack (improved)",
      description:
        "You can wield a finesse melee weapon in each hand and add your ability modifier to damage rolls with both.",
    },
  ],
  13: [
    {
      name: "Bladed Defense",
      description: "While wielding two melee weapons your AC increases by 2.",
    },
    {
      name: "Lightning-Quick Blades",
      description:
        "When you miss with an opportunity attack while wielding two melee weapons, use your reaction to attack again with the other.",
    },
  ],
  17: [
    {
      name: "Acrobatic Footing",
      description: "You are immune to the prone condition.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Knight — PG p. 140
// ---------------------------------------------------------------------------

const KNIGHT_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Two-handed Force",
      description:
        "Wielding a heavy or massive melee weapon, on a missed attack you may use your reaction to reroll. At L9 you crit on a 19 or 20 with such a weapon.",
    },
  ],
  6: [
    {
      name: "Bodyguard (improved)",
      description:
        "When you intercept an attack with Bodyguard, you may also make a single attack roll against the attacker if you wield a suitable weapon.",
    },
  ],
  9: [
    {
      name: "Two-handed Force (crit on 19–20)",
      description: "With heavy or massive melee weapons you crit on a 19 or 20.",
    },
    {
      name: "Equestrian",
      description:
        "You handle mounts in combat as an expert. Opponents must always attack you and ignore your mount. You gain proficiency in Animal Handling.",
    },
  ],
  13: [
    {
      name: "Man-at-Arms",
      description:
        "Wearing armor: AC +1 and don/doff times halved.",
    },
  ],
  17: [
    {
      name: "Peerless Effort",
      description: "You have advantage on all melee weapon attack rolls.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Rune Smith — PG p. 141
// ---------------------------------------------------------------------------

const RUNE_SMITH_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Two-handed Force",
      description:
        "Wielding a heavy or massive melee weapon, on a missed attack you may use your reaction to reroll. At L9 you crit on a 19 or 20 with such a weapon.",
    },
  ],
  6: [
    {
      name: "Hammer Rhythm — Shield Crush",
      description:
        "After a missed attack against a shield-bearer, bonus action Strength check vs. AC. On success, a wooden shield shatters or a metal one is torn off; the carrier also takes 1d6 bludgeoning.",
    },
  ],
  9: [
    {
      name: "Two-handed Force (crit on 19–20)",
      description: "With heavy or massive melee weapons you crit on a 19 or 20.",
    },
  ],
  13: [
    {
      name: "Hammer Rhythm — Shove",
      description:
        "After a missed attack, reaction: opposed Strength check. On success, push the target 5 ft or knock them prone.",
    },
  ],
  17: [
    {
      name: "Iron Fist",
      description:
        "Advantage on Strength-based attack rolls. Reaction to add proficiency bonus to a melee damage roll.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Tattooed Fighter — PG p. 142
// (All approach features are improvements to the L1 Rune Tattoos.)
// ---------------------------------------------------------------------------

const TATTOOED_FIGHTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Rune Tattoos — Empower",
      description:
        "Bonus action: gain 1 temporary Corruption to add 1d6 radiant damage to each attack until your next turn (1d8 at L9, 1d10 at L13, 1d12 at L17).",
    },
  ],
  6: [
    {
      name: "Rune Tattoos — Regenerate",
      description:
        "Start of your turn, gain 1 temporary Corruption to regenerate hit points equal to your proficiency bonus.",
    },
  ],
  9: [
    {
      name: "Rune Tattoos — 1d8 Empower",
      description: "The Empower bonus increases to 1d8 radiant.",
    },
  ],
  13: [
    {
      name: "Rune Tattoos — 1d10 Empower",
      description: "The Empower bonus increases to 1d10 radiant.",
    },
  ],
  17: [
    {
      name: "Rune Tattoos — 1d12 Empower",
      description: "The Empower bonus increases to 1d12 radiant.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Templar — PG p. 142–143
// ---------------------------------------------------------------------------

const TEMPLAR_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Holy Aura",
      description:
        "On a successful melee attack you may gain Corruption as if casting a spell you know. Roll temporary Corruption normally; add three times that amount as radiant damage to the attack.",
    },
  ],
  6: [
    {
      name: "Theurgy",
      description:
        "Choose Turn Undead OR Medicus. Turn Undead: action, present holy symbol; undead within 30 ft Wis save vs. spell DC or turned for 1 minute. Medicus: action restores one Hit Die to a treated creature; uses per extended rest = 2× proficiency bonus.",
    },
  ],
  9: [
    {
      name: "Witchhammer (1d8)",
      description:
        "Your weapons add 1d8 radiant damage to all melee attacks. Increases at L13 (1d10) and L17 (1d12).",
    },
  ],
  13: [
    {
      name: "Witchhammer (1d10)",
      description: "Witchhammer's bonus radiant damage becomes 1d10.",
    },
  ],
  17: [
    {
      name: "Witchhammer (1d12)",
      description: "Witchhammer's bonus radiant damage becomes 1d12.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Weapon Master — PG p. 144
// ---------------------------------------------------------------------------

const WEAPON_MASTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Acrobatic Fighter",
      description:
        "Gain Acrobatics proficiency if you don't have it. When attacked, reaction: Dex (Acrobatics) check; if the result equals or exceeds the attack roll you take no damage.",
    },
  ],
  6: [
    {
      name: "Combat Speciality",
      description:
        "Per chosen weapon mastery: Sword Saint — reaction to riposte after a melee hit on you. Axe Artist — reaction for advantage on a follow-up attack. Spear Dancer — +1 AC while wielding only your spear. Flailer — reaction to attempt a disarm after an attacker misses.",
    },
  ],
  9: [
    {
      name: "Combat Mastery",
      description:
        "Per chosen weapon: Sword Saint — reaction to attack a missed melee attacker if in reach. Axe Artist — crit on 19–20 with axes. Spear Dancer — bonus action after a hit to force a Dex save vs prone. Flailer — reaction on a miss to attack again with the other end.",
    },
  ],
  13: [
    {
      name: "Man-at-Arms",
      description:
        "Wearing armor: AC +1 and don/doff times halved.",
    },
  ],
  17: [
    {
      name: "Man-at-Arms (improved)",
      description:
        "Wearing armor: AC +2 and don/doff in one-quarter the normal time.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Wrathguard — PG p. 145
// ---------------------------------------------------------------------------

const WRATHGUARD_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<FeatureDef>>> = {
  3: [
    {
      name: "Blood Combat — Advantage",
      description:
        "While in a wrathful fury and at half HP or less, you have advantage on all attack rolls.",
    },
  ],
  6: [
    {
      name: "Blood Combat — Damage",
      description:
        "While in a wrath and at half HP or less, add your proficiency bonus to damage rolls.",
    },
  ],
  9: [
    {
      name: "Blood Combat — Recovery",
      description:
        "While in a wrath, when you damage an enemy, regain half that damage as HP (rounded down). Cannot exceed your maximum.",
    },
  ],
  13: [
    {
      name: "Relentless",
      description:
        "If reduced to 0 HP while in a wrath (and not killed outright), DC 5 Con save to drop to 1 HP instead. The DC increases by 5 each subsequent use; resets to 5 on a short or longer rest.",
    },
  ],
  17: [
    {
      name: "Champion of the Wild",
      description:
        "Choose Strength or Constitution. The chosen score increases by 4 (max 24).",
    },
  ],
};

export const WARRIOR_APPROACH_LEVEL_TABLES: Record<string, ReadonlyArray<ApproachLevelEntry>> = {
  berserker: buildApproachLevelTable(BERSERKER_FEATURES),
  duelist: buildApproachLevelTable(DUELIST_FEATURES),
  knight: buildApproachLevelTable(KNIGHT_FEATURES),
  "rune-smith": buildApproachLevelTable(RUNE_SMITH_FEATURES),
  "tattooed-fighter": buildApproachLevelTable(TATTOOED_FIGHTER_FEATURES),
  templar: buildApproachLevelTable(TEMPLAR_FEATURES),
  "weapon-master": buildApproachLevelTable(WEAPON_MASTER_FEATURES),
  wrathguard: buildApproachLevelTable(WRATHGUARD_FEATURES),
};

// ---------------------------------------------------------------------------
// Templar spellcasting (PG p. 143)
// Cantrips known and per-level spells-known come from the PG chart.
// Spell slot table follows the standard 5E half-caster (Paladin) progression.
// ---------------------------------------------------------------------------

export const TEMPLAR_SPELLCASTING: ApproachSpellcasting = {
  abilityHint: "wis",
  cantripsKnownAt1: 2,
  spellsKnownAt1: 1,
  spellSlotsAt1: 2,
  progression: halfCasterProgression({
    // PG p. 143 chart: 2 cantrips at L1, 3 at L3, 4 at L6, 5 at L9+ (capped).
    cantripsKnown: [2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
    // PG p. 143 chart: spells known totals = 1, 3, 6, 10, 13, 15 at the
    // breakpoints L1/3/6/9/13/17. Carry forward at unchanged levels.
    spellsKnown: [1, 1, 3, 3, 3, 6, 6, 6, 10, 10, 10, 10, 13, 13, 13, 13, 15, 15, 15, 15],
  }),
};
