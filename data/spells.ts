// Cantrips and 1st-level spells, indexed by Mystic tradition (PG p. 187+).
// Subset for MVP — enough for a Mystic to pick at level 1.

import type { SpellDef } from "@/lib/character/types";

export const SPELLS: ReadonlyArray<SpellDef> = [
  // ----- Cantrips -----
  {
    id: "acid-splash",
    name: "Acid Splash",
    level: 0,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "Hurl a bubble of acid. One or two creatures within 5 ft. of each other; Dex save or 1d6 acid. Scales at higher levels.",
  },
  {
    id: "chill-touch",
    name: "Chill Touch",
    level: 0,
    school: "Necromancy",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "Spectral, skeletal hand. Ranged spell attack; 1d8 necrotic on hit; target can't regain HP until your next turn. Undead are also at disadvantage on attack rolls against you.",
  },
  {
    id: "fire-bolt",
    name: "Fire Bolt",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description: "Ranged spell attack; 1d10 fire damage. Ignites flammable objects.",
  },
  {
    id: "guidance",
    name: "Guidance",
    level: 0,
    school: "Divination",
    traditions: ["theurg", "witch"],
    description:
      "Touch a willing creature; once before the spell ends, they roll a d4 and add it to one ability check.",
  },
  {
    id: "light",
    name: "Light",
    level: 0,
    school: "Evocation",
    traditions: ["theurg", "wizard", "witch"],
    description:
      "Touched object sheds bright light in a 20 ft. radius and dim light another 20 ft. for 1 hour.",
  },
  {
    id: "mage-hand",
    name: "Mage Hand",
    level: 0,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard", "staff-mage"],
    description:
      "Spectral, floating hand at a point you choose within 30 ft. Manipulate objects up to 10 lb.",
  },
  {
    id: "minor-illusion",
    name: "Minor Illusion",
    level: 0,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch"],
    description: "Sound or image (no larger than 5 ft. cube) within 30 ft.",
  },
  {
    id: "prestidigitation",
    name: "Prestidigitation",
    level: 0,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard", "staff-mage", "witch"],
    description:
      "Minor magical trick — light a candle, clean an object, chill or warm food, etc.",
  },
  {
    id: "ray-of-frost",
    name: "Ray of Frost",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Ranged spell attack; 1d8 cold damage and target's speed reduced by 10 ft. until your next turn.",
  },
  {
    id: "sacred-flame",
    name: "Sacred Flame",
    level: 0,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "Flame-like radiance descends. Dex save or 1d8 radiant damage. No cover bonus.",
  },
  {
    id: "shocking-grasp",
    name: "Shocking Grasp",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Melee spell attack; 1d8 lightning damage; target can't take reactions until its next turn.",
  },
  {
    id: "spare-the-dying",
    name: "Spare the Dying",
    level: 0,
    school: "Necromancy",
    traditions: ["theurg", "witch"],
    description: "Touch a living creature with 0 HP; it becomes stable.",
  },
  {
    id: "thaumaturgy",
    name: "Thaumaturgy",
    level: 0,
    school: "Transmutation",
    traditions: ["theurg", "troll-singer"],
    description: "Minor wonder — voice booms, candles flicker, a tremor, etc.",
  },

  // ----- 1st-level -----
  {
    id: "burning-hands",
    name: "Burning Hands",
    level: 1,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description: "15-ft. cone of fire. Dex save; 3d6 fire damage on fail, half on success.",
  },
  {
    id: "charm-person",
    name: "Charm Person",
    level: 1,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch", "staff-mage"],
    description:
      "Wis save. On fail, target is charmed by you for 1 hour or until you or an ally harms it.",
  },
  {
    id: "cure-wounds",
    name: "Cure Wounds",
    level: 1,
    school: "Evocation",
    traditions: ["theurg", "witch"],
    description: "Touch a creature; restore HP equal to 1d8 + spellcasting ability modifier.",
  },
  {
    id: "detect-magic",
    name: "Detect Magic",
    level: 1,
    school: "Divination",
    traditions: ["sorcerer", "wizard", "theurg", "witch", "staff-mage", "symbolist", "troll-singer"],
    ritual: true,
    description:
      "Sense the presence of magic within 30 ft. for up to 10 minutes (concentration).",
  },
  {
    id: "disguise-self",
    name: "Disguise Self",
    level: 1,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch"],
    description: "Make yourself look different (clothes/armor/weapons/voice unchanged) for 1 hour.",
  },
  {
    id: "feather-fall",
    name: "Feather Fall",
    level: 1,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description: "Reaction. Up to 5 falling creatures; their fall slows to 60 ft. per round, no fall damage.",
  },
  {
    id: "healing-word",
    name: "Healing Word",
    level: 1,
    school: "Evocation",
    traditions: ["theurg", "witch"],
    description: "Bonus action. Restore 1d4 + ability mod HP to a creature within 60 ft.",
  },
  {
    id: "mage-armor",
    name: "Mage Armor",
    level: 1,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard"],
    description: "Touch a willing unarmored creature; their AC becomes 13 + Dex mod for 8 hours.",
  },
  {
    id: "magic-missile",
    name: "Magic Missile",
    level: 1,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description: "Three glowing darts of force; 1d4+1 force damage each.",
  },
  {
    id: "shield",
    name: "Shield",
    level: 1,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "Reaction when hit. Until your next turn, +5 AC, no damage from magic missile.",
  },
  {
    id: "sleep",
    name: "Sleep",
    level: 1,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch"],
    description: "Roll 5d8; total HP of creatures the spell affects (lowest first), within a 20-ft. radius.",
  },
  {
    id: "thunderwave",
    name: "Thunderwave",
    level: 1,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description: "15-ft. cube. Con save; 2d8 thunder damage, push 10 ft.; half damage on save.",
  },
  {
    id: "bless",
    name: "Bless",
    level: 1,
    school: "Enchantment",
    traditions: ["theurg"],
    description:
      "Up to 3 creatures of your choice add 1d4 to attack rolls and saving throws for 1 minute (concentration).",
  },
  {
    id: "entangle",
    name: "Entangle",
    level: 1,
    school: "Conjuration",
    traditions: ["witch", "staff-mage"],
    description:
      "20-ft. square sprouts grasping weeds; Str save or restrained for the duration (1 minute).",
  },
  {
    id: "speak-with-animals",
    name: "Speak with Animals",
    level: 1,
    school: "Divination",
    traditions: ["witch", "theurg"],
    ritual: true,
    description:
      "Communicate with beasts for 10 minutes. Limited intellect — yes/no, simple impressions.",
  },
];

export function spellsForTradition(tradition: string, level: 0 | 1) {
  return SPELLS.filter(
    (s) => s.level === level && s.traditions.includes(tradition as never),
  );
}

export const SPELL_BY_ID: Record<string, SpellDef> = Object.fromEntries(
  SPELLS.map((s) => [s.id, s]),
);
