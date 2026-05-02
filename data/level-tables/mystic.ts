// Mystic — PG p. 108–125.
//
// Class table source: PG p. 109. ASIs at the canonical Symbaroum levels
// (4/8/10/12/16/19) with no extras. The "Favored Spells X/Y" column on the
// PG table is informational (it gates which spells cost no Corruption);
// the level-up flow doesn't enforce favored vs. unfavored picks. We track
// only cantrips known and spells known per level here.
//
// Mystic spellcasting (PG p. 108):
//   - Every approach starts with 6 cantrips known at L1 (Self-taught is the
//     exception at 3) — Mystics don't grow cantrips with level otherwise.
//   - Spells known: 2 at L1, +1 each level → [2, 3, 4, …, 21] (Self-taught
//     starts at 1, otherwise the same +1 cadence).
//   - Standard 5E full-caster slot table.
//   - Maximum spell level: 1st at L1, +1 per odd level up to 9th at L17.

import type {
  ApproachLevelEntry,
  ApproachSpellcasting,
  CharacterLevel,
  ClassLevelEntry,
} from "@/lib/character/types";
import {
  buildApproachLevelTable,
  buildClassLevelTable,
  fullCasterProgression,
} from "./shared";

// ---------------------------------------------------------------------------
// Mystic — class
// ---------------------------------------------------------------------------

const MYSTIC_CLASS_FEATURES: Partial<
  Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>
> = {
  2: [
    {
      name: "Ritual Casting",
      description:
        "Choose a ritual-tagged spell from your approach list, level ≤ your maximum spell level. You gain permanent Corruption equal to half the spell's level (cantrips: none). Castable only as a ritual; the ritual takes 10 minutes longer than normal and is at base level. No Corruption from casting it. Repeats at L5, L7, L11, L14.",
    },
  ],
  5: [
    {
      name: "Ritual Casting (+1)",
      description: "Add another ritual spell from your approach list under the Ritual Casting rules.",
    },
  ],
  7: [
    {
      name: "Ritual Casting (+1)",
      description: "Add another ritual spell from your approach list.",
    },
  ],
  11: [
    {
      name: "Ritual Casting (+1)",
      description: "Add another ritual spell from your approach list.",
    },
  ],
  14: [
    {
      name: "Ritual Casting (+1)",
      description: "Add another ritual spell from your approach list.",
    },
  ],
  18: [
    {
      name: "Spell Mastery",
      description:
        "Choose two 1st- or 2nd-level spells you know. You can cast them at base level without gaining Corruption. Higher-level upcasts cost Corruption normally.",
    },
  ],
  20: [
    {
      name: "Signature Spells",
      description:
        "Choose two 3rd-level or lower spells you know. Cast them at base level without Corruption. Higher-level upcasts cost Corruption normally.",
    },
  ],
};

export const MYSTIC_LEVEL_TABLE: ReadonlyArray<ClassLevelEntry> =
  buildClassLevelTable(MYSTIC_CLASS_FEATURES);

// ---------------------------------------------------------------------------
// Approach features per level (L3, L6, L9, L13, L17 entries)
// ---------------------------------------------------------------------------

// Artifact Crafter — PG p. 110–111.
const ARTIFACT_CRAFTER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Artifact Expert",
      description:
        "Int (Investigation) check (DC 10 + spell level, or 12 for cantrips) to determine the spell associated with a talisman. You can prepare and use lesser artifacts.",
    },
  ],
  6: [
    {
      name: "Artifact Expert (Corruption Reduction)",
      description:
        "Reduce the cost of a single artifact's permanent Corruption by 1 (minimum 1).",
    },
  ],
  9: [
    {
      name: "Lesser Artifact Crafter",
      description:
        "On extended rest (including the one before an adventure begins) you can complete construction of a lesser artifact.",
    },
  ],
  13: [
    {
      name: "Talisman Master",
      description:
        "Use up to twice your proficiency bonus in talismans simultaneously (each still requires a long rest to prepare).",
    },
  ],
  17: [
    {
      name: "Artifact Master",
      description:
        "Once in your career, create one artifact of greater power (rules in the GM's Guide).",
    },
  ],
};

// Self-taught — PG p. 112.
const SELF_TAUGHT_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Personal Investment",
      description:
        "Cast a known spell as if at your highest spell level, but Con save vs. your own spell save DC; on fail you gain a level of exhaustion. Gain Corruption as if cast at the upcast level.",
    },
  ],
  6: [
    {
      name: "Natural Alchemy",
      description:
        "On a long rest in the wilderness, prepare tonics equal to your proficiency bonus. Each tonic restores one Hit Die when consumed; loses effectiveness within 24 hours.",
    },
  ],
  9: [
    {
      name: "Steadfast",
      description:
        "Reaction: gain advantage on a Con or Wis saving throw. Once per short or longer rest.",
    },
  ],
  13: [
    {
      name: "Steadfast (improved)",
      description:
        "When you succeed on a Steadfast save you take no damage from the effect; on a fail you take half.",
    },
  ],
  17: [
    {
      name: "Steadfast (retributive)",
      description:
        "When you succeed on a Steadfast save and the source was a spellcaster, that creature takes 1d6 psychic damage.",
    },
  ],
};

// Sorcerer — PG p. 113–114.
const SORCERER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "The Shadowed Slope",
      description:
        "When you cast an unfavored spell of 4th level or lower while at permanent Corruption ≥ the spell's level, the temporary Corruption cost is reduced by 1 (minimum 1).",
    },
  ],
  6: [
    {
      name: "The Power of Corruption",
      description:
        "Draw on permanent Corruption to power spells: cast spells totaling levels ≤ permanent Corruption without gaining Corruption. Spell levels must be ≤ your max spell level. Resets on extended rest.",
    },
  ],
  9: [
    {
      name: "The Call of Darkness",
      description:
        "When a creature must make a Wisdom save against your spell, add its permanent Corruption to your spell save DC. Creatures that are thoroughly corrupt are unaffected.",
    },
  ],
  13: [
    {
      name: "Revenant Strike",
      description:
        "When you kill a living creature on your turn, gain 1 temporary Corruption to bonus action raise it as an undead minion using Dragoul stats. It acts on its initiative this round under your control. Doesn't work on abominations. Collapses after combat.",
    },
  ],
  17: [
    {
      name: "Unholy Aura",
      description:
        "Bonus action: each creature of your choice within 30 ft Con saves or 1d6 necrotic per point of your permanent Corruption (half on success). Once per short or longer rest.",
    },
  ],
};

// Staff Mage — PG p. 114–115.
const STAFF_MAGE_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Staff Magic",
      description:
        "Touch via your staff counts as touching a creature for spell range. When you would gain permanent Corruption, you may direct it to the staff instead (d20 vs. staff total once it has 3+; if the roll ≤ staff total, the staff splits and you gain its corruption). Bonus action to add 1d4 elemental damage (acid, cold, fire, or lightning) to a single damage roll using the staff.",
    },
  ],
  6: [
    {
      name: "Staff Fighting (improved)",
      description:
        "Rune staff is magical and grants +1 to attack and damage rolls. Bonus action to make an attack with your rune staff.",
    },
  ],
  9: [
    {
      name: "Staff Magic (1d8)",
      description:
        "Staff elemental damage rises to 1d8. Once per long or extended rest, cast an additional spell of level ≤ half your staff's permanent Corruption (rounded down) without gaining Corruption.",
    },
  ],
  13: [
    {
      name: "Staff Fighting (+2)",
      description:
        "Rune staff bonus increases to +2 to AC and to attack and damage rolls. Reaction to attack a creature in your reach that ends its turn there.",
    },
  ],
  17: [
    {
      name: "Staff Magic (1d12)",
      description:
        "Staff elemental damage rises to 1d12. The rune staff grants advantage on all Corruption checks.",
    },
  ],
};

// Symbolist — PG p. 116–117.
const SYMBOLIST_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Rune Tattoos",
      description:
        "Tattoos protect from weather and wind like full clothing. Reaction when attacked: gain +4 AC until your next turn for 1 temporary Corruption. Continues each round so long as you keep gaining Corruption.",
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
      name: "Rune Tattoos — Empower",
      description:
        "Bonus action: gain 1 or more temporary Corruption to add 1d8 radiant damage to that many attacks.",
    },
  ],
  13: [
    {
      name: "Protective Runes",
      description:
        "Prepare a special rune you can use as a reaction. Attune for 1 permanent Corruption; choose counterspell or dispel magic. Activate as a reaction (treats spell as cast at 3rd level). Once per long or extended rest.",
    },
  ],
  17: [
    {
      name: "Protective Runes (improved)",
      description:
        "The special rune now provides counterspell or dispel magic at 6th level for an additional point of permanent Corruption. Once per long or extended rest.",
    },
  ],
};

// Theurg — PG p. 118–119.
const THEURG_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Turn Undead",
      description:
        "Action: undead within 30 ft that can see/hear you Wis save vs. spell DC or turned for 1 minute (or until they take damage). Turned creatures must Dash away or take Dodge actions and can't enter your aura. Uses per long or extended rest = your proficiency bonus.",
    },
  ],
  6: [
    {
      name: "Medicus",
      description:
        "Action: bind a creature's wound to restore one Hit Die. Uses per extended rest = 2× proficiency bonus.",
    },
  ],
  9: [
    {
      name: "Turn Undead (Destroy)",
      description:
        "Affected undead with CR ≤ ½ your proficiency bonus (rounded down) are destroyed instead of turned. Player-character undead are not destroyed.",
    },
  ],
  13: [
    {
      name: "Medicus (improved)",
      description:
        "Medicus restores 1d8 + Wisdom modifier HP immediately and the creature also regains the spent Hit Die.",
    },
  ],
  17: [
    {
      name: "Matter of Faith",
      description:
        "Choose one of your ritual spells. Remove permanent Corruption equal to half its spell level (rounded up). That spell no longer weighs on your soul.",
    },
  ],
};

// Troll Singer — PG p. 119–121.
const TROLL_SINGER_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Songs of the Dusk",
      description:
        "Cast spells totaling levels ≤ 2× proficiency bonus, max level ≤ proficiency bonus, without gaining Corruption. Recovers on long rest.",
    },
  ],
  6: [
    {
      name: "Songs of the Masters (1st)",
      description:
        "Learn one of: Combat Hymn, Dancing Weapon, Heroic Hymn, Retribution Hymn, Sustaining Hymn, Weakening Hymn. Sing as an action; concentrate up to 1 minute via bonus action; affects up to 6 allies/enemies within 60 ft. Casting another spell or song ends it. Recharges on short or longer rest.",
    },
  ],
  9: [
    {
      name: "Songs of the Masters (2nd)",
      description: "Learn another song from the Songs of the Masters list.",
    },
  ],
  13: [
    {
      name: "Songs of the Masters (3rd)",
      description: "Learn another song.",
    },
  ],
  17: [
    {
      name: "Songs of the Masters (4th)",
      description: "Learn another song.",
    },
  ],
};

// Witch — PG p. 121–123.
const WITCH_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "A Chosen Path (next benefit)",
      description:
        "Gain the next benefit of your chosen path. Red: Nature's Embrace (long rest in wild restores Hit Dice to allies). White: Call Spirits (10-min ritual to ask local spirits for info or a spell-equivalent effect). Green: Shapeshifter (action to assume a beast form; max CR scales with level).",
    },
  ],
  6: [
    {
      name: "A Chosen Path (final benefit)",
      description:
        "Gain the final benefit of your chosen path. Red: Song of Spring (action to restore 10× prof bonus HP across allies). White: Purification (touch a weapon: +1d4+prof radiant for 1 minute, gain 1 temp Corruption). Green: Nature's Lullaby (sing softly: invisible to a chosen abomination; recharge on long rest).",
    },
  ],
  9: [
    {
      name: "A Chosen Path (new path)",
      description:
        "Choose another path entirely (Red, White, or Green). Gain its first benefit at 9th, second at 13th, final at 17th.",
    },
  ],
  13: [
    {
      name: "A Chosen Path (second benefit)",
      description: "Gain the second benefit of your second-chosen path.",
    },
  ],
  17: [
    {
      name: "A Chosen Path (final benefit)",
      description: "Gain the final benefit of your second-chosen path.",
    },
  ],
};

// Wizard — PG p. 123–124.
const WIZARD_FEATURES: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>> = {
  3: [
    {
      name: "Bonus Spell — Arcane Lock",
      description: "Learn arcane lock as a bonus spell beyond your normal known spells.",
    },
    {
      name: "Loremaster",
      description:
        "Int (Investigation) check (DC by rarity: common 10, uncommon 13, rare 16, very rare 19, legendary 22) to identify a magic item's properties. Also gain proficiency in both human languages (Ambrian and Barbarian).",
    },
  ],
  5: [
    {
      name: "Bonus Spell — Counterspell or Dispel Magic",
      description: "Learn either counterspell or dispel magic as a bonus spell of your choice.",
    },
  ],
  6: [
    {
      name: "Loremaster — Artifact Affinity",
      description:
        "Reduce the permanent Corruption cost of a single artifact by 1 (minimum 1). Gain proficiency with troll and elf languages.",
    },
  ],
  9: [
    {
      name: "Loremaster — Scroll Casting",
      description:
        "Cast spells of a level ≤ your proficiency bonus directly from scrolls and similar parchments. Advantage on saves vs. magical effects. Learn the Symbaroum language.",
    },
  ],
  13: [
    {
      name: "Overpowering Magic",
      description:
        "When casting a 1st–5th level action-cast spell, bonus action to empower it: reroll any 1s and 2s on the damage dice (must use the new value, even if 1 or 2). Once per long or extended rest.",
    },
  ],
  17: [
    {
      name: "Ritual Mastery",
      description:
        "Reduce permanent Corruption by 1 for each ritual spell of 3rd level or higher you know.",
    },
  ],
};

export const MYSTIC_APPROACH_LEVEL_TABLES: Record<string, ReadonlyArray<ApproachLevelEntry>> = {
  "artifact-crafter": buildApproachLevelTable(ARTIFACT_CRAFTER_FEATURES),
  "self-taught": buildApproachLevelTable(SELF_TAUGHT_FEATURES),
  sorcerer: buildApproachLevelTable(SORCERER_FEATURES),
  "staff-mage": buildApproachLevelTable(STAFF_MAGE_FEATURES),
  symbolist: buildApproachLevelTable(SYMBOLIST_FEATURES),
  theurg: buildApproachLevelTable(THEURG_FEATURES),
  "troll-singer": buildApproachLevelTable(TROLL_SINGER_FEATURES),
  witch: buildApproachLevelTable(WITCH_FEATURES),
  wizard: buildApproachLevelTable(WIZARD_FEATURES),
};

// ---------------------------------------------------------------------------
// Spellcasting per approach (PG p. 109 plus per-approach pages)
//
// Default Mystic progression: 6 cantrips known from L1 (constant), spells
// known [2,3,4,…,21]. Self-taught starts at 3 cantrips and 1 spell.
// ---------------------------------------------------------------------------

const MYSTIC_CANTRIPS_KNOWN_DEFAULT = [
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
];
const MYSTIC_SPELLS_KNOWN_DEFAULT = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
];

function mysticProgression() {
  return fullCasterProgression({
    cantripsKnown: MYSTIC_CANTRIPS_KNOWN_DEFAULT,
    spellsKnown: MYSTIC_SPELLS_KNOWN_DEFAULT,
  });
}

export const MYSTIC_APPROACH_SPELLCASTING: Record<string, ApproachSpellcasting> = {
  "artifact-crafter": {
    abilityHint: "wis", // PG p. 111
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
  "self-taught": {
    abilityHint: "int", // PG p. 112
    cantripsKnownAt1: 3, // Boundless Magic limitation
    spellsKnownAt1: 1,
    spellSlotsAt1: 2,
    progression: fullCasterProgression({
      // Self-taught is permanently behind on cantrips (3 vs default 6).
      cantripsKnown: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      // Spells known: 1 at L1, +1 per level → 1..20.
      spellsKnown: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    }),
  },
  sorcerer: {
    abilityHint: "cha", // PG p. 113
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
  "staff-mage": {
    abilityHint: "int", // PG p. 115
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
  symbolist: {
    abilityHint: "int", // PG p. 117
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
  theurg: {
    abilityHint: "wis", // PG p. 118
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
  "troll-singer": {
    abilityHint: "cha", // PG p. 120
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
  witch: {
    abilityHint: "wis", // PG p. 122
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
  wizard: {
    abilityHint: "int", // PG p. 124
    cantripsKnownAt1: 6,
    spellsKnownAt1: 2,
    spellSlotsAt1: 2,
    progression: mysticProgression(),
  },
};
