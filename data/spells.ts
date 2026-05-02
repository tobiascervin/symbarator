// Spell catalog (Ruins of Symbaroum 5E PG sect. 5, pp. 187–223).
//
// Conventions:
//   - Tradition tags reflect the PG's per-tradition lists at pp. 187–190.
//     Asterisks in those lists indicate "cannot be favored" — a flag we don't
//     model yet — so they are intentionally NOT encoded as data here.
//   - Semibold-italic names in those lists indicate ritual castability;
//     they map to `ritual: true`.
//   - Symbaroum-specific spells (Black Bolt, Spirit Walk, Holy Smoke, Tale of
//     Ashes, etc.) are paraphrased terselely from the PG mechanics. Core 5E
//     spells use SRD-standard mechanical summaries.
//   - Staff Mage and Symbolist do not have dedicated tradition lists in the
//     PG; they are not tagged on individual spells in this catalog. The
//     leveling change can resolve their tradition picks separately.
//
// Levels covered: 0 (cantrips) through 9.

import type { SpellDef } from "@/lib/character/types";

// ---------------------------------------------------------------------------
// Cantrips (PG p. 192)
// ---------------------------------------------------------------------------

const CANTRIPS: SpellDef[] = [
  {
    id: "accurate-strike",
    name: "Accurate Strike",
    level: 0,
    school: "Divination",
    traditions: ["theurg", "troll-singer", "witch", "wizard"],
    description:
      "Point at a target within 30 ft. While concentrating up to 1 minute, you have advantage on your first attack roll against that target on each of your turns.",
  },
  {
    id: "acid-splash",
    name: "Acid Splash",
    level: 0,
    school: "Conjuration",
    traditions: ["sorcerer", "theurg", "wizard"],
    description:
      "Hurl a bubble of acid at one or two creatures within 60 ft. (must be within 5 ft. of each other). Dex save or 1d6 acid damage. Scales at higher character levels.",
  },
  {
    id: "chill-touch",
    name: "Chill Touch",
    level: 0,
    school: "Necromancy",
    traditions: ["sorcerer", "witch", "wizard"],
    description:
      "Ranged spell attack at 120 ft. 1d8 necrotic and target can't regain HP until your next turn. Undead also have disadvantage on attack rolls against you.",
  },
  {
    id: "dancing-lights",
    name: "Dancing Lights",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "Up to 4 torch-sized lights within 120 ft. Bonus action to move them up to 60 ft each. Concentration up to 1 minute.",
  },
  {
    id: "eldritch-blast",
    name: "Eldritch Blast",
    level: 0,
    school: "Evocation",
    traditions: ["witch"],
    description:
      "Ranged spell attack at 120 ft; 1d10 force on hit. Beam count scales with character level (2 at L5, 3 at L11, 4 at L17).",
  },
  {
    id: "fire-bolt",
    name: "Fire Bolt",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "theurg", "wizard"],
    description:
      "Ranged spell attack at 120 ft; 1d10 fire on hit. Ignites flammable objects not worn or carried. Scales at higher character levels.",
  },
  {
    id: "guidance",
    name: "Guidance",
    level: 0,
    school: "Divination",
    traditions: ["theurg"],
    description:
      "Touch a willing creature. Once before the spell ends, target adds 1d4 to one ability check. Concentration up to 1 minute.",
  },
  {
    id: "light",
    name: "Light",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "theurg", "troll-singer", "wizard"],
    description:
      "Touch an object up to 10 lbs.; it sheds bright light in a 20-ft radius and dim light 20 ft beyond for 1 hour. Dex save to avoid if held by a hostile creature.",
  },
  {
    id: "mage-hand",
    name: "Mage Hand",
    level: 0,
    school: "Conjuration",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    description:
      "Spectral hand within 30 ft. Manipulate objects, open unlocked doors/containers, carry up to 10 lbs. Lasts 1 minute.",
  },
  {
    id: "mending",
    name: "Mending",
    level: 0,
    school: "Transmutation",
    traditions: ["sorcerer", "theurg", "troll-singer", "wizard"],
    description: "Repair a single break or tear in an object you touch. Cast time 1 minute.",
  },
  {
    id: "message",
    name: "Message",
    level: 0,
    school: "Transmutation",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "Whisper a message to a creature within 120 ft you can see. Target can whisper a reply only you hear.",
  },
  {
    id: "minor-illusion",
    name: "Minor Illusion",
    level: 0,
    school: "Illusion",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    description:
      "Within 30 ft, create either a sound or a 5-ft cube image. Investigation check vs. spell save DC reveals the illusion. Lasts 1 minute.",
  },
  {
    id: "poison-spray",
    name: "Poison Spray",
    level: 0,
    school: "Conjuration",
    traditions: ["sorcerer", "witch", "wizard"],
    description:
      "Within 10 ft of one creature; Con save or 1d12 poison damage. Scales at higher character levels.",
  },
  {
    id: "prestidigitation",
    name: "Prestidigitation",
    level: 0,
    school: "Transmutation",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    description:
      "Minor magical trick within 10 ft (clean/soil object, light/snuff a flame, sensory effect, mark). Up to 3 effects active at once. Lasts up to 1 hour.",
  },
  {
    id: "ray-of-frost",
    name: "Ray of Frost",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "theurg", "wizard"],
    description:
      "Ranged spell attack at 60 ft; 1d8 cold damage and target's speed is reduced by 10 ft until your next turn. Scales at higher character levels.",
  },
  {
    id: "resistance",
    name: "Resistance",
    level: 0,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Touch a willing creature. Once before the spell ends, target adds 1d4 to one saving throw. Concentration up to 1 minute.",
  },
  {
    id: "sacred-flame",
    name: "Sacred Flame",
    level: 0,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "Flame-like radiance within 60 ft. Dex save (no benefit from cover) or 1d8 radiant damage. Scales at higher character levels.",
  },
  {
    id: "shocking-grasp",
    name: "Shocking Grasp",
    level: 0,
    school: "Evocation",
    traditions: ["sorcerer", "theurg", "wizard"],
    description:
      "Melee spell attack with advantage if target wears metal. 1d8 lightning damage; target can't take reactions until its next turn.",
  },
  {
    id: "spare-the-dying",
    name: "Spare the Dying",
    level: 0,
    school: "Necromancy",
    traditions: ["theurg"],
    description: "Touch a living creature with 0 HP; it becomes stable.",
  },
  {
    id: "thaumaturgy",
    name: "Thaumaturgy",
    level: 0,
    school: "Transmutation",
    traditions: ["theurg"],
    description:
      "Minor wonder within 30 ft (booming voice, flickering flames, tremor, door bang, alter eyes). Up to 3 effects active at once. Lasts up to 1 minute.",
  },
  {
    id: "vicious-mockery",
    name: "Vicious Mockery",
    level: 0,
    school: "Enchantment",
    traditions: ["troll-singer"],
    description:
      "Insult a creature within 60 ft. Wis save or 1d4 psychic damage and disadvantage on its next attack roll before its next turn ends.",
  },
];

// ---------------------------------------------------------------------------
// 1st-level spells (PG p. 192–195)
// ---------------------------------------------------------------------------

const LEVEL_1: SpellDef[] = [
  {
    id: "alarm",
    name: "Alarm",
    level: 1,
    school: "Abjuration",
    traditions: ["wizard"],
    ritual: true,
    description:
      "Set an audible or mental alarm in a 20-ft cube within 30 ft. Triggered when a Tiny or larger creature enters. Lasts 8 hours.",
  },
  {
    id: "animal-friendship",
    name: "Animal Friendship",
    level: 1,
    school: "Enchantment",
    traditions: ["troll-singer"],
    description:
      "Convince a beast within 30 ft you mean no harm. Wis save (auto-fail if Int <4); on fail, charmed for 24 hours.",
  },
  {
    id: "bane",
    name: "Bane",
    level: 1,
    school: "Enchantment",
    traditions: ["theurg", "troll-singer"],
    description:
      "Up to 3 creatures within 30 ft. Cha save or subtract 1d4 from attack rolls and saves for 1 minute. Concentration.",
  },
  {
    id: "black-bolt",
    name: "Black Bolt",
    level: 1,
    school: "Evocation",
    traditions: ["sorcerer"],
    description:
      "Hurl a shadowy bolt at one creature within 120 ft. Dex save or restrained by shadowy tentacles. Each end of its turn it may try a Str save to break free; advantage if larger than the caster. Concentration up to 1 minute.",
  },
  {
    id: "bless",
    name: "Bless",
    level: 1,
    school: "Enchantment",
    traditions: ["theurg"],
    description:
      "Bless up to 3 creatures within 30 ft. Each adds 1d4 to attack rolls and saves for 1 minute. Concentration.",
  },
  {
    id: "burning-hands",
    name: "Burning Hands",
    level: 1,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "15-ft cone from your hands. Each creature in it Dex saves; 3d6 fire damage on a fail, half on success. Ignites flammable objects.",
  },
  {
    id: "charm-person",
    name: "Charm Person",
    level: 1,
    school: "Enchantment",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    description:
      "Target a humanoid within 30 ft. Wis save (advantage if you/allies are fighting it) or charmed for 1 hour, regards you as a friendly acquaintance. Knows it was charmed when the spell ends.",
  },
  {
    id: "command",
    name: "Command",
    level: 1,
    school: "Enchantment",
    traditions: ["theurg"],
    description:
      "Speak a one-word command to a creature within 60 ft that understands you. Wis save or obey on its next turn (approach, drop, flee, grovel, halt). No effect on undead.",
  },
  {
    id: "comprehend-languages",
    name: "Comprehend Languages",
    level: 1,
    school: "Divination",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    ritual: true,
    description:
      "For 1 hour you understand the literal meaning of any spoken language you hear and any written language you touch (1 minute per page).",
  },
  {
    id: "create-or-destroy-water",
    name: "Create or Destroy Water",
    level: 1,
    school: "Transmutation",
    traditions: ["theurg"],
    description:
      "Create up to 10 gallons of clean water in an open container within 30 ft, OR destroy up to 10 gallons. Alternatively conjure a 30-ft cube of rain or destroy fog.",
  },
  {
    id: "cure-wounds",
    name: "Cure Wounds",
    level: 1,
    school: "Evocation",
    traditions: ["theurg", "troll-singer"],
    description:
      "Touch a creature; restore HP equal to 1d8 + spellcasting modifier. No effect on constructs or undead.",
  },
  {
    id: "detect-evil-and-good",
    name: "Detect Evil and Good",
    level: 1,
    school: "Divination",
    traditions: ["theurg"],
    description:
      "For 10 min, sense within 30 ft the presence of aberrations, blight-born, celestials, elementals, fey, fiends, undead, and consecrated/desecrated objects. Concentration. Walls block.",
  },
  {
    id: "detect-magic",
    name: "Detect Magic",
    level: 1,
    school: "Divination",
    traditions: ["sorcerer", "theurg", "troll-singer", "wizard"],
    ritual: true,
    description:
      "For 10 min, sense magic within 30 ft. Action to learn each magical aura's school. Concentration. Most barriers block.",
  },
  {
    id: "detect-poison-and-disease",
    name: "Detect Poison and Disease",
    level: 1,
    school: "Divination",
    traditions: ["theurg"],
    ritual: true,
    description:
      "For 10 min, sense kind and location of poisons, poisonous creatures, and diseases within 30 ft. Concentration.",
  },
  {
    id: "disguise-self",
    name: "Disguise Self",
    level: 1,
    school: "Illusion",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "Make yourself appear different (size shift up to ±1 ft) for 1 hour. Investigation check vs. spell save DC reveals.",
  },
  {
    id: "entangle",
    name: "Entangle",
    level: 1,
    school: "Conjuration",
    traditions: ["troll-singer", "witch"],
    description:
      "20-ft square of grasping plants within 90 ft. Each creature there Str saves or restrained for 1 minute. Concentration.",
  },
  {
    id: "expeditious-retreat",
    name: "Expeditious Retreat",
    level: 1,
    school: "Transmutation",
    traditions: ["sorcerer", "witch", "wizard"],
    description:
      "Bonus action: dash. For 10 min, you can take the Dash action as a bonus action each turn. Concentration.",
  },
  {
    id: "faerie-fire",
    name: "Faerie Fire",
    level: 1,
    school: "Evocation",
    traditions: ["troll-singer"],
    description:
      "20-ft cube within 60 ft. Each object/creature outlined in colored light. Dex save or attacks against them have advantage; can't benefit from invisibility. Concentration up to 1 minute.",
  },
  {
    id: "false-life",
    name: "False Life",
    level: 1,
    school: "Necromancy",
    traditions: ["sorcerer", "wizard"],
    description: "Gain 1d4 + 4 temporary HP for 1 hour.",
  },
  {
    id: "feather-fall",
    name: "Feather Fall",
    level: 1,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Reaction (when you or a creature within 60 ft falls). Up to 5 falling creatures' descent slows to 60 ft/round; no fall damage. Lasts 1 minute.",
  },
  {
    id: "find-familiar",
    name: "Find Familiar",
    level: 1,
    school: "Conjuration",
    traditions: ["witch", "wizard"],
    ritual: true,
    description:
      "1-hour ritual. Summon a Tiny spirit familiar. It obeys, can deliver touch spells, and acts on your initiative. Telepathic link within 100 ft.",
  },
  {
    id: "floating-disk",
    name: "Floating Disk",
    level: 1,
    school: "Conjuration",
    traditions: ["wizard"],
    ritual: true,
    description:
      "Conjure a 3-ft, slightly concave disk within 30 ft. Holds up to 500 lbs. Follows you within 20 ft. Lasts 1 hour.",
  },
  {
    id: "fog-cloud",
    name: "Fog Cloud",
    level: 1,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "20-ft radius sphere of fog within 120 ft. Heavy obscurement; lasts up to 1 hour. Concentration.",
  },
  {
    id: "grease",
    name: "Grease",
    level: 1,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "10-ft square within 60 ft becomes greasy. Creatures there or entering Dex save or fall prone. Lasts 1 minute.",
  },
  {
    id: "guiding-bolt",
    name: "Guiding Bolt",
    level: 1,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "Ranged spell attack at 120 ft; 4d6 radiant on hit. Next attack against the target before end of your next turn has advantage.",
  },
  {
    id: "healing-word",
    name: "Healing Word",
    level: 1,
    school: "Evocation",
    traditions: ["theurg", "troll-singer"],
    description:
      "Bonus action. A creature within 60 ft regains 1d4 + spellcasting modifier HP. No effect on constructs or undead.",
  },
  {
    id: "hellish-rebuke",
    name: "Hellish Rebuke",
    level: 1,
    school: "Evocation",
    traditions: ["witch"],
    description:
      "Reaction (when a creature within 60 ft damages you). Dex save or 2d10 fire damage, half on success.",
  },
  {
    id: "heroism",
    name: "Heroism",
    level: 1,
    school: "Enchantment",
    traditions: ["troll-singer"],
    description:
      "Touch a willing creature. Immune to fear; gains spellcasting modifier in temp HP at the start of each of its turns. Concentration up to 1 minute.",
  },
  {
    id: "hideous-laughter",
    name: "Hideous Laughter",
    level: 1,
    school: "Enchantment",
    traditions: ["troll-singer", "wizard"],
    description:
      "Target a creature within 30 ft (Int >4). Wis save or fall prone laughing, incapacitated, for the duration. Saves at end of each turn (advantage if it took damage). Concentration up to 1 minute.",
  },
  {
    id: "holy-smoke",
    name: "Holy Smoke",
    level: 1,
    school: "Divination",
    traditions: ["theurg"],
    ritual: true,
    description:
      "Light incense in a 10-ft cube within 10 ft. The smoke gathers around corrupted creatures and objects; the GM clearly states each creature's Corruption category. Concentration up to 1 minute. Countered by exchange shadow.",
  },
  {
    id: "identify",
    name: "Identify",
    level: 1,
    school: "Divination",
    traditions: ["troll-singer", "wizard"],
    ritual: true,
    description:
      "1-minute ritual. Touch one item; learn its magical properties, who attuned, and any spells affecting a creature.",
  },
  {
    id: "illusory-script",
    name: "Illusory Script",
    level: 1,
    school: "Illusion",
    traditions: ["troll-singer", "witch", "wizard"],
    ritual: true,
    description:
      "Inscribe text on parchment that appears as something else to all but creatures you designate. Lasts 10 days.",
  },
  {
    id: "inflict-wounds",
    name: "Inflict Wounds",
    level: 1,
    school: "Necromancy",
    traditions: ["theurg"],
    description: "Melee spell attack. 3d10 necrotic damage on hit.",
  },
  {
    id: "jump",
    name: "Jump",
    level: 1,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description: "Touch a creature; its jump distance is tripled for 1 minute.",
  },
  {
    id: "longstrider",
    name: "Longstrider",
    level: 1,
    school: "Transmutation",
    traditions: ["troll-singer", "wizard"],
    description: "Touch a creature; its speed increases by 10 ft for 1 hour.",
  },
  {
    id: "mage-armor",
    name: "Mage Armor",
    level: 1,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "Touch a willing unarmored creature; AC becomes 13 + Dex modifier. Lasts 8 hours; ends if target dons armor.",
  },
  {
    id: "magic-missile",
    name: "Magic Missile",
    level: 1,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Three darts of force, each 1d4 + 1, divided among any visible creatures within 120 ft. Auto-hit.",
  },
  {
    id: "protection-from-evil-and-good",
    name: "Protection from Evil and Good",
    level: 1,
    school: "Abjuration",
    traditions: ["theurg", "witch", "wizard"],
    description:
      "Touch a willing creature. Disadvantage on attack rolls against it from aberrations, blight-born, celestials, elementals, fey, fiends, undead. Can't be charmed/frightened/possessed by them. Concentration up to 10 minutes.",
  },
  {
    id: "purify-food-and-drink",
    name: "Purify Food and Drink",
    level: 1,
    school: "Transmutation",
    traditions: ["theurg"],
    ritual: true,
    description: "Purify food and drink in a 5-ft radius sphere within 10 ft.",
  },
  {
    id: "sanctuary",
    name: "Sanctuary",
    level: 1,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Bonus action. Ward a creature within 30 ft. Attackers Wis save or must choose a different target. Ends if warded creature attacks or casts a harmful spell. 1 minute.",
  },
  {
    id: "shield",
    name: "Shield",
    level: 1,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "Reaction (when hit by an attack or targeted by magic missile). +5 AC and immunity to magic missile until your next turn.",
  },
  {
    id: "shield-of-faith",
    name: "Shield of Faith",
    level: 1,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "A shimmering field grants a creature within 60 ft +2 AC for 10 minutes. Concentration.",
  },
  {
    id: "silent-image",
    name: "Silent Image",
    level: 1,
    school: "Illusion",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "15-ft cube illusion within 60 ft. Move it 30 ft as an action. No sound, smell, or temperature. Investigation reveals it. Concentration up to 10 minutes.",
  },
  {
    id: "sleep",
    name: "Sleep",
    level: 1,
    school: "Enchantment",
    traditions: ["troll-singer", "wizard"],
    description:
      "Roll 5d8; sum is HP affected. Within a 20-ft radius point in 90 ft, creatures fall unconscious in ascending HP order until total is exhausted. 1 minute. Undead and charm-immune unaffected.",
  },
  {
    id: "speak-with-animals",
    name: "Speak with Animals",
    level: 1,
    school: "Divination",
    traditions: ["troll-singer"],
    ritual: true,
    description:
      "Communicate with beasts for 10 minutes. Limited intellect — yes/no and simple impressions.",
  },
  {
    id: "spirit-walk",
    name: "Spirit Walk",
    level: 1,
    school: "Transmutation",
    traditions: ["sorcerer", "witch"],
    ritual: true,
    description:
      "1-minute cast. You enter the spirit world for up to 10 minutes — invisible to material creatures but visible to spirits. Hostile spirits may attack. Reaction to end early.",
  },
  {
    id: "tale-of-ashes",
    name: "Tale of Ashes",
    level: 1,
    school: "Divination",
    traditions: ["wizard"],
    ritual: true,
    description:
      "A 10-minute ritual on a destroyed object's ashes reveals fragmented images of how it was destroyed. The longer ago, the murkier the vision.",
  },
  {
    id: "thunderwave",
    name: "Thunderwave",
    level: 1,
    school: "Evocation",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "15-ft cube from you. Each creature in it Con saves; 2d8 thunder and pushed 10 ft on fail (half/no push on success). Loose objects pushed 10 ft. Audible to 300 ft.",
  },
  {
    id: "unseen-servant",
    name: "Unseen Servant",
    level: 1,
    school: "Conjuration",
    traditions: ["troll-singer", "witch", "wizard"],
    ritual: true,
    description:
      "Invisible mindless force in 60 ft. AC 10, 1 HP, Str 2. Bonus action to direct it within 60 ft. Lasts 1 hour.",
  },
];

// ---------------------------------------------------------------------------
// 2nd-level spells (PG p. 196–199)
// ---------------------------------------------------------------------------

const LEVEL_2: SpellDef[] = [
  {
    id: "acid-arrow",
    name: "Acid Arrow",
    level: 2,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "Ranged spell attack at 90 ft. On hit: 4d4 acid + 2d4 acid at end of its next turn. On miss: half initial, no follow-up.",
  },
  {
    id: "aid",
    name: "Aid",
    level: 2,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Up to 3 creatures within 30 ft. Each gains +5 max HP and current HP for 8 hours.",
  },
  {
    id: "alter-self",
    name: "Alter Self",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Self. One of: Aquatic Adaptation (gills, swim 30), Change Appearance (cosmetic), or Natural Weapons (1d6, +1 mag, finesse). Switch as an action. Concentration up to 1 hour.",
  },
  {
    id: "animal-messenger",
    name: "Animal Messenger",
    level: 2,
    school: "Enchantment",
    traditions: ["troll-singer"],
    ritual: true,
    description:
      "Send a Tiny beast within 30 ft to deliver a 25-word message to a recipient you describe within travel range. Lasts 24 hours.",
  },
  {
    id: "arcane-lock",
    name: "Arcane Lock",
    level: 2,
    school: "Abjuration",
    traditions: ["wizard"],
    description:
      "Touch a closed door, window, or container; magically lock it. DC raised by 10 against forced entry. Permanent until dispelled. 25 gp material.",
  },
  {
    id: "arcanists-magic-aura",
    name: "Arcanist's Magic Aura",
    level: 2,
    school: "Illusion",
    traditions: ["wizard"],
    description:
      "Mask the magic aura of a creature or object you touch for 24 hours. Make detection-magic readings show whatever you choose.",
  },
  {
    id: "augury",
    name: "Augury",
    level: 2,
    school: "Divination",
    traditions: ["theurg"],
    ritual: true,
    description:
      "1-min ritual. Receive a one-word omen (weal, woe, weal and woe, or nothing) about a course of action you plan within 30 minutes.",
  },
  {
    id: "black-breath",
    name: "Black Breath",
    level: 2,
    school: "Evocation",
    traditions: ["sorcerer"],
    description:
      "Heal corrupted allies within 10 ft, but at risk to yourself. For each willing target, roll 1d4 + spellcasting modifier vs their permanent Corruption: equal/lower restores HP equal to that result; higher inflicts the difference as temporary Corruption.",
  },
  {
    id: "blindness-deafness",
    name: "Blindness/Deafness",
    level: 2,
    school: "Necromancy",
    traditions: ["sorcerer", "witch", "wizard"],
    description:
      "One creature within 30 ft. Con save or blinded or deafened (your choice) for 1 minute. Saves at end of each turn.",
  },
  {
    id: "blood-bond",
    name: "Blood Bond",
    level: 2,
    school: "Transmutation",
    traditions: ["witch"],
    ritual: true,
    description:
      "10-min ritual on you and your familiar (50 thaler material). Familiar's Corruption Threshold becomes 2 + your positive Cha modifier. You may shunt any Corruption you gain to it. If its Corruption exceeds its Threshold it becomes a blight-born spirit and abandons you.",
  },
  {
    id: "blur",
    name: "Blur",
    level: 2,
    school: "Illusion",
    traditions: ["sorcerer", "wizard"],
    description:
      "Self. Attackers have disadvantage on attack rolls against you. Concentration up to 1 minute. Beings with blindsight/truesight unaffected.",
  },
  {
    id: "calm-emotions",
    name: "Calm Emotions",
    level: 2,
    school: "Enchantment",
    traditions: ["theurg", "troll-singer"],
    description:
      "20-ft radius point within 60 ft. Each humanoid Cha saves; on fail you choose: suppress charmed/frightened, OR make the target indifferent toward chosen targets. Concentration up to 1 minute.",
  },
  {
    id: "continual-flame",
    name: "Continual Flame",
    level: 2,
    school: "Evocation",
    traditions: ["theurg", "wizard"],
    description:
      "Touch an object; create a permanent flame as bright as a torch (no heat, no fuel). 50 gp ruby dust consumed.",
  },
  {
    id: "darkness",
    name: "Darkness",
    level: 2,
    school: "Evocation",
    traditions: ["sorcerer", "witch", "wizard"],
    description:
      "15-ft radius sphere of magical darkness within 60 ft. Even darkvision can't see through it. Lasts 10 minutes. Concentration.",
  },
  {
    id: "darkvision",
    name: "Darkvision",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Touch a willing creature; it gains darkvision 60 ft for 8 hours.",
  },
  {
    id: "detect-thoughts",
    name: "Detect Thoughts",
    level: 2,
    school: "Divination",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "Read surface thoughts of a creature within 30 ft (Int 4+ and a known language). Probe deeper with a Wis save contest. Concentration up to 1 minute.",
  },
  {
    id: "enhance-ability",
    name: "Enhance Ability",
    level: 2,
    school: "Transmutation",
    traditions: ["theurg", "troll-singer"],
    description:
      "Touch a creature; choose Bear's Endurance, Bull's Strength, Cat's Grace, Eagle's Splendor, Fox's Cunning, or Owl's Wisdom. Advantage on that ability's checks for 1 hour. Concentration.",
  },
  {
    id: "enlarge-reduce",
    name: "Enlarge/Reduce",
    level: 2,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "Target a creature or object within 30 ft. Con save or doubled/halved size: ±1d4 weapon damage, advantage/disadvantage on Str checks/saves. Concentration up to 1 minute.",
  },
  {
    id: "enthrall",
    name: "Enthrall",
    level: 2,
    school: "Enchantment",
    traditions: ["troll-singer", "witch"],
    description:
      "Hostile creatures within 60 ft. Wis save (auto-pass if not hostile to you or it can't hear you) or disadvantage on Wis (Perception) checks against any other creature for 1 minute. Concentration.",
  },
  {
    id: "exchange-shadow",
    name: "Exchange Shadow",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer"],
    description:
      "10-min ritual. Touch a willing creature. You and target swap one point of permanent Corruption each. Counters holy smoke if cast on a willing target.",
  },
  {
    id: "faraway-writing",
    name: "Faraway Writing",
    level: 2,
    school: "Transmutation",
    traditions: ["wizard"],
    ritual: true,
    description:
      "Inscribe a message on a sympathetic surface (e.g. a paired diary). Recipient's matching surface reproduces the writing within 1 hour, regardless of distance.",
  },
  {
    id: "find-traps",
    name: "Find Traps",
    level: 2,
    school: "Divination",
    traditions: ["theurg"],
    description:
      "Sense the presence of any trap within line of sight 120 ft. Knows a trap is present, not its nature.",
  },
  {
    id: "flaming-sphere",
    name: "Flaming Sphere",
    level: 2,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "Create a 5-ft fiery sphere within 60 ft. Bonus action to move it 30 ft. Creatures within 5 ft Dex save or 2d6 fire (half on save). Concentration up to 1 minute.",
  },
  {
    id: "gentle-repose",
    name: "Gentle Repose",
    level: 2,
    school: "Necromancy",
    traditions: ["theurg"],
    ritual: true,
    description:
      "Touch a corpse; it doesn't decay and can't become undead for 10 days. The duration the corpse can be revived also extends.",
  },
  {
    id: "gust-of-wind",
    name: "Gust of Wind",
    level: 2,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "60-ft line, 10 ft wide. Str save or pushed 15 ft from you. Disperses gas/vapor. Concentration up to 1 minute.",
  },
  {
    id: "heat-metal",
    name: "Heat Metal",
    level: 2,
    school: "Transmutation",
    traditions: ["troll-singer"],
    description:
      "Heat a metal object within 60 ft. Creatures touching/holding it Con save or take 2d8 fire and disadvantage on attack rolls/checks until your next turn (drop save). Concentration up to 1 minute.",
  },
  {
    id: "hold-person",
    name: "Hold Person",
    level: 2,
    school: "Enchantment",
    traditions: ["sorcerer", "theurg", "troll-singer", "witch", "wizard"],
    description:
      "Target a humanoid within 60 ft. Wis save or paralyzed for 1 minute. Saves at end of each turn. Concentration.",
  },
  {
    id: "inherit-wound",
    name: "Inherit Wound",
    level: 2,
    school: "Transmutation",
    traditions: ["theurg", "witch"],
    description:
      "Touch a willing creature. Heal it by 2d8 + spellcasting modifier; you take that damage and any one disease, condition, or poison the target suffered. The transferred ill cannot be transferred again.",
  },
  {
    id: "invisibility",
    name: "Invisibility",
    level: 2,
    school: "Illusion",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    description:
      "Touch a creature; invisible (and anything carried) for 1 hour. Ends if target attacks or casts a spell. Concentration.",
  },
  {
    id: "knock",
    name: "Knock",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "Target an object within 60 ft. Unlocks one mundane lock, suppresses arcane lock for 10 min, or opens a stuck/barred door. Loud knock audible 300 ft.",
  },
  {
    id: "lesser-restoration",
    name: "Lesser Restoration",
    level: 2,
    school: "Abjuration",
    traditions: ["theurg", "troll-singer"],
    description:
      "Touch a creature; end one disease or one condition (blinded, deafened, paralyzed, poisoned).",
  },
  {
    id: "levitate",
    name: "Levitate",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "One creature/object within 60 ft (≤500 lbs). Con save (creatures only) or rises up to 20 ft and stays for 10 minutes. Move 20 ft as a move action while concentrating.",
  },
  {
    id: "locate-animals-or-plants",
    name: "Locate Animals or Plants",
    level: 2,
    school: "Divination",
    traditions: ["troll-singer"],
    ritual: true,
    description:
      "Name one species; learn the direction and distance to the closest specimen within 5 miles (if any).",
  },
  {
    id: "locate-object",
    name: "Locate Object",
    level: 2,
    school: "Divination",
    traditions: ["theurg", "troll-singer", "wizard"],
    description:
      "Sense direction to a familiar object or one of a kind you describe within 1000 ft. Lead/running water blocks. Concentration up to 10 minutes.",
  },
  {
    id: "magic-mouth",
    name: "Magic Mouth",
    level: 2,
    school: "Illusion",
    traditions: ["troll-singer", "wizard"],
    ritual: true,
    description:
      "Implant a 25-word message in an object, triggered by a condition you set. Permanent until triggered.",
  },
  {
    id: "magic-weapon",
    name: "Magic Weapon",
    level: 2,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "Touch a non-magical weapon; +1 to attack and damage rolls. Concentration up to 1 hour.",
  },
  {
    id: "mirror-image",
    name: "Mirror Image",
    level: 2,
    school: "Illusion",
    traditions: ["sorcerer", "witch", "wizard"],
    description:
      "Self. Three duplicates pop into existence. Attacks may target a duplicate (rolled randomly). 1 minute.",
  },
  {
    id: "misty-step",
    name: "Misty Step",
    level: 2,
    school: "Conjuration",
    traditions: ["sorcerer", "witch", "wizard"],
    description: "Bonus action. Teleport up to 30 ft to an unoccupied space you can see.",
  },
  {
    id: "prayer-of-healing",
    name: "Prayer of Healing",
    level: 2,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "10-min cast. Up to 6 creatures within 30 ft each regain 2d8 + spellcasting modifier HP.",
  },
  {
    id: "protection-from-poison",
    name: "Protection from Poison",
    level: 2,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Touch a creature; neutralize one current poison (your choice if multiple), grant resistance to poison damage, and advantage on saves vs. poisoned, for 1 hour.",
  },
  {
    id: "ray-of-enfeeblement",
    name: "Ray of Enfeeblement",
    level: 2,
    school: "Necromancy",
    traditions: ["witch", "wizard"],
    description:
      "Ranged spell attack at 60 ft. On hit: target deals only half damage with weapon attacks using Strength. Con save at end of each turn. Concentration up to 1 minute.",
  },
  {
    id: "rope-trick",
    name: "Rope Trick",
    level: 2,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "A length of rope rises into an extradimensional space. Up to 8 medium creatures fit. Lasts 1 hour. Rope-end visible only by the spell's caster from outside.",
  },
  {
    id: "scorching-ray",
    name: "Scorching Ray",
    level: 2,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Three rays at targets you can see within 120 ft. Ranged spell attack each; 2d6 fire on hit.",
  },
  {
    id: "see-invisibility",
    name: "See Invisibility",
    level: 2,
    school: "Divination",
    traditions: ["sorcerer", "troll-singer", "wizard"],
    description:
      "For 1 hour you see invisible creatures and objects, and into the Ethereal Plane (translucent).",
  },
  {
    id: "shatter",
    name: "Shatter",
    level: 2,
    school: "Evocation",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    description:
      "10-ft radius sphere within 60 ft. Each creature Con saves; 3d8 thunder on fail (half on success). Constructs/objects of crystal/glass/metal have disadvantage.",
  },
  {
    id: "silence",
    name: "Silence",
    level: 2,
    school: "Illusion",
    traditions: ["theurg", "troll-singer"],
    ritual: true,
    description:
      "20-ft radius sphere within 120 ft. No sound passes; creatures inside deafened, can't cast spells with V components. Concentration up to 10 minutes.",
  },
  {
    id: "spider-climb",
    name: "Spider Climb",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer", "witch", "wizard"],
    description:
      "Touch a willing creature; climb speed = walking speed, climb difficult surfaces (incl. ceilings) hands-free. Concentration up to 1 hour.",
  },
  {
    id: "spiritual-weapon",
    name: "Spiritual Weapon",
    level: 2,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "Bonus action: conjure a spectral weapon within 60 ft. Melee spell attack dealing 1d8 + spellcasting modifier force. Bonus action to move it 20 ft and attack again. 1 minute.",
  },
  {
    id: "suggestion",
    name: "Suggestion",
    level: 2,
    school: "Enchantment",
    traditions: ["sorcerer", "troll-singer", "witch", "wizard"],
    description:
      "Suggest a reasonable course of action (1–2 sentences) to a creature within 30 ft. Wis save or pursue it for up to 8 hours. Obvious self-harm ends the spell. Concentration.",
  },
  {
    id: "warding-bond",
    name: "Warding Bond",
    level: 2,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Touch a willing creature within 60 ft. While linked: target gains +1 AC and saves, resistance to all damage. You take the same damage they take. Ends if you separate by >60 ft.",
  },
  {
    id: "water-breathing",
    name: "Water Breathing",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    ritual: true,
    description: "Up to 10 willing creatures within 30 ft can breathe water for 24 hours.",
  },
  {
    id: "water-walk",
    name: "Water Walk",
    level: 2,
    school: "Transmutation",
    traditions: ["sorcerer", "theurg"],
    ritual: true,
    description:
      "Up to 10 willing creatures within 30 ft can move on liquid as if solid ground for 1 hour.",
  },
  {
    id: "web",
    name: "Web",
    level: 2,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "20-ft cube of webs within 60 ft. Difficult terrain; lightly obscured. Creatures starting in or entering Dex save or restrained. Flammable. Concentration up to 1 hour.",
  },
  {
    id: "zone-of-truth",
    name: "Zone of Truth",
    level: 2,
    school: "Enchantment",
    traditions: ["theurg", "troll-singer"],
    description:
      "15-ft radius sphere within 60 ft. Cha save (each creature when it enters or starts its turn there) or can't speak deliberate lies for 10 minutes.",
  },
];

// ---------------------------------------------------------------------------
// 3rd-level spells (PG p. 200–207)
// ---------------------------------------------------------------------------

const LEVEL_3: SpellDef[] = [
  {
    id: "anathema",
    name: "Anathema",
    level: 3,
    school: "Abjuration",
    traditions: ["theurg"],
    ritual: true,
    description:
      "Self, concentration up to 1 hour. While in effect, you have advantage on saves vs. magical effects and resistance to damage from spells.",
  },
  {
    id: "animate-dead",
    name: "Animate Dead",
    level: 3,
    school: "Necromancy",
    traditions: ["sorcerer"],
    ritual: true,
    description:
      "1-hour ritual. Animate a Medium/Small corpse or pile of bones as a zombie/skeleton servant. Bonus action to mentally command (within 60 ft). 24-hour control; recast to extend or reassert over up to four creatures.",
  },
  {
    id: "beacon-of-hope",
    name: "Beacon of Hope",
    level: 3,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "30-ft radius. Allies of your choice gain advantage on Wis saves and death saves, plus max healing from any HP-restoring spell or feature. Concentration up to 1 minute.",
  },
  {
    id: "bestow-curse",
    name: "Bestow Curse",
    level: 3,
    school: "Necromancy",
    traditions: ["witch"],
    description:
      "Touch. Wis save or curse target with one of: disadvantage on a chosen ability; disadvantage on attacks against you; on each turn must Wis save or waste action; your attacks/spells deal +1d8 necrotic. Concentration up to 1 minute.",
  },
  {
    id: "blink",
    name: "Blink",
    level: 3,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "End of each of your turns, roll d20: on 11+ you vanish to the Yonderworld until start of your next turn, then return. 1 minute. Action to dismiss.",
  },
  {
    id: "clairvoyance",
    name: "Clairvoyance",
    level: 3,
    school: "Divination",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "Choose a familiar or visible-described location within 1 mile. Create an invisible sensor there to either see or hear from. 10 minutes, concentration.",
  },
  {
    id: "counterspell",
    name: "Counterspell",
    level: 3,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "Reaction (when a creature within 60 ft casts a spell). Spell of 3rd level or lower auto-fails. For higher levels, ability check vs. DC 10 + spell level.",
  },
  {
    id: "create-food-and-water",
    name: "Create Food and Water",
    level: 3,
    school: "Conjuration",
    traditions: ["theurg"],
    description:
      "Create 45 lb of food and 30 gallons of water within 30 ft. Lasts 24 hours.",
  },
  {
    id: "daylight",
    name: "Daylight",
    level: 3,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "60-ft radius of bright light + 60 ft of dim light around a point or held object. 1 hour. Suppresses magical darkness of 3rd level or lower.",
  },
  {
    id: "fear",
    name: "Fear",
    level: 3,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "30-ft cone. Each creature Wis save or drops what's holding and is frightened, must Dash away each turn. New save at end of each turn if it can't see you. Concentration up to 1 minute.",
  },
  {
    id: "fireball",
    name: "Fireball",
    level: 3,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "20-ft radius sphere within 150 ft. Each creature Dex save or 8d6 fire (half on success). Ignites flammable objects.",
  },
  {
    id: "flaming-servant",
    name: "Flaming Servant",
    level: 3,
    school: "Conjuration",
    traditions: ["wizard"],
    ritual: true,
    description:
      "10-min ritual; provide a suit of heavy armor as material. Summon a fire-elemental servant that occupies the armor for 8 hours. Stays within 30 ft, follows commands, can be ordered to attack via bonus action. Sets unattended flammables alight on touch.",
  },
  {
    id: "fly",
    name: "Fly",
    level: 3,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "Touch. Target gains 60-ft fly speed for 10 minutes (concentration). Falls if the spell ends while aloft.",
  },
  {
    id: "gaseous-form",
    name: "Gaseous Form",
    level: 3,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "Touch a willing creature; it becomes a misty cloud for up to 1 hour. Resistance to nonmagical damage, advantage on Str/Dex/Con saves, can pass through small openings. Concentration.",
  },
  {
    id: "glyph-of-warding",
    name: "Glyph of Warding",
    level: 3,
    school: "Abjuration",
    traditions: ["wizard", "theurg"],
    description:
      "1-hour cast (200 thaler diamond consumed). Inscribe a glyph that triggers on a defined condition. Either explosive runes (5d8 damage of chosen type, Dex save half) or a stored prepared spell up to the glyph's level.",
  },
  {
    id: "haste",
    name: "Haste",
    level: 3,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Touch. +2 AC, advantage on Dex saves, double speed, one extra action (Attack/Dash/Disengage/Hide/Use Object). Concentration up to 1 minute. Lethargy on end: can't act on next turn.",
  },
  {
    id: "hypnotic-pattern",
    name: "Hypnotic Pattern",
    level: 3,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "30-ft cube within 120 ft. Each creature in area Wis save or charmed, incapacitated, speed 0. Effect ends if damaged or shaken awake. Concentration up to 1 minute.",
  },
  {
    id: "judging-bonds",
    name: "Judging Bonds",
    level: 3,
    school: "Enchantment",
    traditions: ["theurg"],
    ritual: true,
    description:
      "Touch a bound creature. Pacifying light flows through chains/shackles; bound target has disadvantage on Strength and Dexterity checks/saves while bound. 1 month.",
  },
  {
    id: "larvae-boil",
    name: "Larvae Boil",
    level: 3,
    school: "Conjuration",
    traditions: ["sorcerer", "witch"],
    description:
      "Melee spell attack. On hit, infect target with larvae: 1d4 piercing this turn, escalating each round (1d6 → 1d8 → 1d10 → 1d12) until concentration ends. Concentration up to 1 minute.",
  },
  {
    id: "lightning-bolt",
    name: "Lightning Bolt",
    level: 3,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "100-ft line, 5 ft wide. Each creature Dex save or 8d6 lightning (half on success). Ignites flammables.",
  },
  {
    id: "magic-circle",
    name: "Magic Circle",
    level: 3,
    school: "Abjuration",
    traditions: ["sorcerer", "theurg", "wizard", "witch"],
    description:
      "10-ft radius, 20-ft tall cylinder within 10 ft. Choose creature type (celestials, fiends, fey, undead, etc.); they can't enter or affect creatures inside, have disadvantage on attacks, can't charm/frighten. 1 hour; can invert to trap inside. 50 thaler material consumed.",
  },
  {
    id: "major-image",
    name: "Major Image",
    level: 3,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "20-ft cube illusion within 120 ft. Includes sound, smell, temperature. Concentration up to 10 minutes; physical interaction reveals it. Cast at 6th level: lasts until dispelled, no concentration.",
  },
  {
    id: "meld-into-stone",
    name: "Meld into Stone",
    level: 3,
    school: "Transmutation",
    traditions: ["theurg"],
    ritual: true,
    description:
      "Touch a stone object/surface large enough to fit you. Step into it for 8 hours. Limited senses while inside; vulnerable to damage that breaks the stone.",
  },
  {
    id: "nondetection",
    name: "Nondetection",
    level: 3,
    school: "Abjuration",
    traditions: ["wizard", "troll-singer"],
    description:
      "Touch a creature, place, or object up to 10 ft cube. Hidden from divination magic for 8 hours.",
  },
  {
    id: "phantom-steed",
    name: "Phantom Steed",
    level: 3,
    school: "Illusion",
    traditions: ["wizard"],
    ritual: true,
    description:
      "Conjure a quasi-real horselike creature within 30 ft. AC 11, 1 HP, can be ridden; speed 100 ft, ignores difficult terrain; vanishes on damage. 1 hour.",
  },
  {
    id: "plant-growth",
    name: "Plant Growth",
    level: 3,
    school: "Transmutation",
    traditions: ["troll-singer"],
    description:
      "100-ft radius: one casting either causes a year's growth in plants OR makes the area difficult terrain (escape DC 8 + prof + spellcasting mod). Latter takes 1 action; former takes 8 hours.",
  },
  {
    id: "protection-from-energy",
    name: "Protection from Energy",
    level: 3,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard", "theurg"],
    description:
      "Touch. Target gains resistance to one chosen damage type (acid, cold, fire, lightning, or thunder) for 1 hour, concentration.",
  },
  {
    id: "purging-fire",
    name: "Purging Fire",
    level: 3,
    school: "Evocation",
    traditions: ["theurg"],
    ritual: true,
    description:
      "8-hour ritual cast on yourself only. Climb into a burning pyre; each round take 1d12 fire damage to remove 1 permanent Corruption (max 10). 50-thaler holy incense.",
  },
  {
    id: "remove-curse",
    name: "Remove Curse",
    level: 3,
    school: "Abjuration",
    traditions: ["theurg", "witch"],
    description:
      "Touch. End all curses affecting one creature or object (or break attunement to a cursed item).",
  },
  {
    id: "sending",
    name: "Sending",
    level: 3,
    school: "Evocation",
    traditions: ["sorcerer", "wizard", "theurg"],
    description:
      "Send a 25-word message to a known creature anywhere on the same plane. Target hears it and can reply briefly. No save.",
  },
  {
    id: "sleet-storm",
    name: "Sleet Storm",
    level: 3,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "40-ft radius, 20-ft tall cylinder within 150 ft. Heavily obscured; difficult terrain; creatures Dex save or fall prone; spellcasters Con save vs. concentration. 1 minute.",
  },
  {
    id: "slow",
    name: "Slow",
    level: 3,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "40-ft cube within 120 ft. Up to 6 creatures Wis save or speed halved, AC and Dex saves -2, only one action OR bonus action per turn, spells with action cast take 50% chance of failing. Concentration up to 1 minute.",
  },
  {
    id: "speak-with-dead",
    name: "Speak with Dead",
    level: 3,
    school: "Necromancy",
    traditions: ["theurg", "witch", "troll-singer"],
    description:
      "Touch a corpse with a still-recognizable mouth (dead < 10 days). Ask up to 5 questions. The corpse answers as it knew in life, briefly and cryptically. 10 minutes.",
  },
  {
    id: "speak-with-plants",
    name: "Speak with Plants",
    level: 3,
    school: "Transmutation",
    traditions: ["troll-singer"],
    description:
      "30-ft radius. Plants gain limited sentience for 10 minutes; can answer questions about events, terrain, creatures who passed through. Difficult terrain becomes ordinary terrain.",
  },
  {
    id: "stinking-cloud",
    name: "Stinking Cloud",
    level: 3,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "20-ft radius sphere of yellow gas within 90 ft. Heavily obscured. Each creature inside Con save or no action this turn (except retching). Concentration up to 1 minute.",
  },
  {
    id: "tiny-hut",
    name: "Tiny Hut",
    level: 3,
    school: "Evocation",
    traditions: ["wizard"],
    ritual: true,
    description:
      "1-min ritual. 10-ft radius dome appears around you and up to 9 willing companions. Repels weather and spells; from inside translucent, from outside opaque. 8 hours.",
  },
  {
    id: "tongues",
    name: "Tongues",
    level: 3,
    school: "Divination",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer", "theurg"],
    description:
      "Touch a creature. They can speak and understand any language for 1 hour.",
  },
  {
    id: "vampiric-touch",
    name: "Vampiric Touch",
    level: 3,
    school: "Necromancy",
    traditions: ["wizard", "witch"],
    description:
      "Melee spell attack. 3d6 necrotic damage; you regain HP equal to half the damage dealt. Action each turn during concentration to attack again. Concentration up to 1 minute.",
  },
];

// ---------------------------------------------------------------------------
// 4th-level spells (PG p. 208–210)
// ---------------------------------------------------------------------------

const LEVEL_4: SpellDef[] = [
  {
    id: "arcane-eye",
    name: "Arcane Eye",
    level: 4,
    school: "Divination",
    traditions: ["wizard"],
    description:
      "Create an invisible sensor within 30 ft. Move it 30 ft per turn; you see what it sees with darkvision 30 ft. Passes through small openings. Concentration up to 1 hour.",
  },
  {
    id: "banishment",
    name: "Banishment",
    level: 4,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard", "witch", "theurg"],
    description:
      "Cha save or send target to a harmless demiplane (native creature) or back to home plane (extraplanar). 1-minute concentration; if it lasts the full duration, native creatures return, extraplanar ones don't.",
  },
  {
    id: "black-tentacles",
    name: "Black Tentacles",
    level: 4,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "20-ft square within 90 ft. Difficult terrain. Each creature in area Dex save: 3d6 bludgeoning and restrained on fail. Restrained creature uses action to retry; concentration up to 1 minute.",
  },
  {
    id: "blight",
    name: "Blight",
    level: 4,
    school: "Necromancy",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "Con save or 8d8 necrotic (half on success). No effect on undead/constructs. Plant creatures take max damage with disadvantage on save.",
  },
  {
    id: "compulsion",
    name: "Compulsion",
    level: 4,
    school: "Enchantment",
    traditions: ["troll-singer"],
    description:
      "Audible visible creatures within 30 ft Wis save or you direct movement on each turn (move at least half their speed in chosen direction). Concentration up to 1 minute.",
  },
  {
    id: "confusion",
    name: "Confusion",
    level: 4,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "10-ft radius point within 90 ft. Each creature Wis save or roll d10 each turn for random behavior (random move, no action, melee random nearby, normal). Concentration up to 1 minute.",
  },
  {
    id: "control-water",
    name: "Control Water",
    level: 4,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard", "theurg"],
    description:
      "100-ft cube within 300 ft. Action to choose: flood (ocean wave), part the waters, redirect flow, or whirlpool. Concentration up to 10 minutes.",
  },
  {
    id: "death-ward",
    name: "Death Ward",
    level: 4,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Touch. The first time the target would drop to 0 HP or be reduced to 0 by an instantaneous death effect, it instead drops to 1 HP or ignores the effect. 8 hours.",
  },
  {
    id: "dimension-door",
    name: "Dimension Door",
    level: 4,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "Teleport up to 500 ft to a location you can describe or visualize. May bring one willing Medium creature you touch.",
  },
  {
    id: "divination",
    name: "Divination",
    level: 4,
    school: "Divination",
    traditions: ["theurg"],
    ritual: true,
    description:
      "1-min ritual (50-thaler incense). Ask one yes/no/short-answer question about an event happening within 7 days. Repeated use within 7 days raises chance of random/wrong answer (5%/casting cumulative).",
  },
  {
    id: "dominate-beast",
    name: "Dominate Beast",
    level: 4,
    school: "Enchantment",
    traditions: ["sorcerer", "witch"],
    description:
      "Wis save or charmed by you for 1 minute, telepathic command link. Target retries save when it takes damage. Concentration.",
  },
  {
    id: "fabricate",
    name: "Fabricate",
    level: 4,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "10-min cast. Convert raw materials into finished items (e.g. cloth → clothes, ore → weapons). Quality limited by your craft proficiencies. Up to 10-ft cube of mineral or 5-ft cube of metal.",
  },
  {
    id: "faithful-hound",
    name: "Faithful Hound",
    level: 4,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "Conjure a phantom watchdog within 30 ft for 8 hours. Invisible, immobile; barks at hostile creatures within 30 ft and can attack (4d8 piercing) anyone you specify within 5 ft. Vanishes if you move >100 ft away.",
  },
  {
    id: "fire-shield",
    name: "Fire Shield",
    level: 4,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "Self. Choose chill (cold resistance) or warm (fire resistance) shield. Attackers within 5 ft of you who hit take 2d8 of opposite damage type. 10 minutes.",
  },
  {
    id: "freedom-of-movement",
    name: "Freedom of Movement",
    level: 4,
    school: "Abjuration",
    traditions: ["theurg", "troll-singer"],
    description:
      "Touch. Target ignores difficult terrain, can't be paralyzed/restrained by magic, water doesn't impede speed, escape grapple/restraint with 5 ft of movement. 1 hour.",
  },
  {
    id: "greater-invisibility",
    name: "Greater Invisibility",
    level: 4,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "troll-singer"],
    description:
      "Touch. Target is invisible for 1 minute (concentration). Doesn't end on attacking or casting.",
  },
  {
    id: "guardian-of-faith",
    name: "Guardian of Faith",
    level: 4,
    school: "Conjuration",
    traditions: ["theurg"],
    description:
      "Conjure a Large spectral guardian within 30 ft. Hostile creatures entering within 10 ft take 20 radiant (half on Dex save). Vanishes after 60 total damage dealt or 8 hours.",
  },
  {
    id: "hallucinatory-terrain",
    name: "Hallucinatory Terrain",
    level: 4,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "10-min cast. 150-ft cube of natural terrain appears as a different natural type (forest, swamp, etc.). Doesn't disguise structures. Reveal with Investigation. 24 hours.",
  },
  {
    id: "ice-storm",
    name: "Ice Storm",
    level: 4,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "20-ft radius, 40-ft tall cylinder within 300 ft. Each creature Dex save: 2d8 bludgeoning + 4d6 cold (half on success). Area becomes difficult terrain until end of next turn.",
  },
  {
    id: "illusory-correction",
    name: "Illusory Correction",
    level: 4,
    school: "Illusion",
    traditions: ["wizard"],
    description:
      "60-ft range, V-only. Reaction when a creature in range makes an attack roll, ability check, or save: force a reroll of the d20 or allow a reroll. End of turn after using, ability check (DC starts at 5, +5 per use) or the spell ends.",
  },
  {
    id: "lifegiver",
    name: "Lifegiver",
    level: 4,
    school: "Evocation",
    traditions: ["theurg"],
    ritual: true,
    description:
      "1-hour ritual. Touch up to your proficiency bonus in creatures (you may include yourself). Each loses 1d4 temporary Corruption to restore HP equal to that result. Excess points heal.",
  },
  {
    id: "locate-creature",
    name: "Locate Creature",
    level: 4,
    school: "Divination",
    traditions: ["sorcerer", "wizard", "theurg", "troll-singer"],
    description:
      "Sense the direction to a creature you've seen within the last 30 days, within 1000 ft. Running water of 10+ ft wide blocks. Concentration up to 1 hour.",
  },
  {
    id: "phantasmal-killer",
    name: "Phantasmal Killer",
    level: 4,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "Wis save or frightened. While frightened, must save again at end of each turn or take 4d10 psychic; success ends spell. Concentration up to 1 minute.",
  },
  {
    id: "polymorph",
    name: "Polymorph",
    level: 4,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard", "troll-singer"],
    description:
      "Wis save (not vs willing target) or transform into a beast with CR ≤ target's level. New form's HP/stats; reverts at 0 HP or end of duration. Concentration up to 1 hour.",
  },
  {
    id: "private-sanctum",
    name: "Private Sanctum",
    level: 4,
    school: "Abjuration",
    traditions: ["wizard"],
    description:
      "10-min cast. 100-ft cube within 120 ft. Choose properties: block sound, vision (incl. darkvision), divination scrying, teleportation, planar travel. 24 hours; cast daily for 1 year to make permanent.",
  },
  {
    id: "resilient-sphere",
    name: "Resilient Sphere",
    level: 4,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "Dex save. Encase target in a 1-inch-thick force sphere. Inside is unaffected by outside attacks; sphere can be pushed; concentration up to 1 minute.",
  },
  {
    id: "secret-chest",
    name: "Secret Chest",
    level: 4,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "1-action. Hide an exquisitely-crafted chest (5,000 thaler) on the Ethereal Plane. Action to recall it or send back. Lasts up to 60 days; needs replica chest as focus.",
  },
  {
    id: "stone-shape",
    name: "Stone Shape",
    level: 4,
    school: "Transmutation",
    traditions: ["wizard", "theurg"],
    description:
      "Touch a 5-ft cube of stone or smaller. Reshape into any form (door, weapon, opening). Cannot create complex mechanisms.",
  },
  {
    id: "stoneskin",
    name: "Stoneskin",
    level: 4,
    school: "Abjuration",
    traditions: ["wizard", "sorcerer"],
    description:
      "Touch. Target gains resistance to nonmagical bludgeoning, piercing, and slashing damage. Concentration up to 1 hour. 100-thaler diamond consumed.",
  },
  {
    id: "wall-of-fire",
    name: "Wall of Fire",
    level: 4,
    school: "Evocation",
    traditions: ["sorcerer", "wizard", "theurg"],
    description:
      "60-ft long × 20-ft tall × 1-ft thick wall of fire within 120 ft. Choose hot side: passing/starting turn there triggers Dex save or 5d8 fire (half on success). Concentration up to 1 minute.",
  },
];

// ---------------------------------------------------------------------------
// 5th-level spells (PG p. 211–216)
// ---------------------------------------------------------------------------

const LEVEL_5: SpellDef[] = [
  {
    id: "animate-objects",
    name: "Animate Objects",
    level: 5,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Animate up to 10 nonmagical objects (Tiny–Huge) within 120 ft. Bonus action to command them. Stats vary by size. Concentration up to 1 minute.",
  },
  {
    id: "arcane-hand",
    name: "Arcane Hand",
    level: 5,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "Conjure a Large floating force hand within 120 ft. AC 20, HP = your max. Bonus action: clenched fist (4d8 force), forceful push, grappling, interposing. Concentration up to 1 minute.",
  },
  {
    id: "awaken",
    name: "Awaken",
    level: 5,
    school: "Transmutation",
    traditions: ["witch"],
    description:
      "8-hour cast. Touch a beast/plant to give it sentience and a language. The creature is charmed for 30 days, then becomes free-willed. 1,000 thaler diamond consumed.",
  },
  {
    id: "cloudkill",
    name: "Cloudkill",
    level: 5,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "20-ft radius poison fog within 120 ft. Heavily obscured. Each creature inside Con save: 5d8 poison (half on success). Moves 10 ft per turn. Concentration up to 10 minutes.",
  },
  {
    id: "commune",
    name: "Commune",
    level: 5,
    school: "Divination",
    traditions: ["theurg"],
    ritual: true,
    description:
      "1-min ritual. Ask up to 3 yes/no questions to your god. Repeated use within 7 days raises chance of no answer.",
  },
  {
    id: "commune-with-spirits",
    name: "Commune with Spirits",
    level: 5,
    school: "Divination",
    traditions: ["witch"],
    ritual: true,
    description:
      "10-min ritual. Contact local nature spirits to: ask about events at this location, ask 3 yes/no questions, OR name an enemy (24 hr): if it comes within 30 ft, spirits attack — 1d6 psychic damage on hit (half if Wis save), and target frightened of the area on fail.",
  },
  {
    id: "cone-of-cold",
    name: "Cone of Cold",
    level: 5,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "60-ft cone. Each creature Con save: 8d8 cold (half on success). Killed creatures become frozen statues until thawed.",
  },
  {
    id: "contact-other-plane",
    name: "Contact Other Plane",
    level: 5,
    school: "Divination",
    traditions: ["witch"],
    ritual: true,
    description:
      "1-min ritual. Int save (DC 15) — fail = take 6d6 psychic and become insane until next long rest. Success: ask 5 short questions of an extraplanar entity that answers truthfully if it knows.",
  },
  {
    id: "creation",
    name: "Creation",
    level: 5,
    school: "Illusion",
    traditions: ["sorcerer", "wizard"],
    description:
      "1-min cast. Conjure a nonliving object up to 5-ft cube. Duration depends on material (mithril 1 minute, stone 12 hours, vegetable 1 day, etc.).",
  },
  {
    id: "dispel-evil-and-good",
    name: "Dispel Evil and Good",
    level: 5,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Self. Aberrations, celestials, elementals, fey, fiends, and undead have disadvantage on attacks against you. Action to break enchantment on a charmed/frightened/possessed creature. Concentration up to 1 minute.",
  },
  {
    id: "dominate-person",
    name: "Dominate Person",
    level: 5,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "Humanoid Wis save or charmed/telepathic command. Action to take total control. Each time target takes damage, new save. Concentration up to 1 minute (10 min at L6+, 1 hr at L7+, 8 hr at L8+).",
  },
  {
    id: "dream",
    name: "Dream",
    level: 5,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "1-hour cast. Send a message into a sleeping target's dream anywhere on the same plane. May choose to make the dream a nightmare: target gets no rest benefit and takes 3d6 psychic on waking.",
  },
  {
    id: "exorcism",
    name: "Exorcism",
    level: 5,
    school: "Transmutation",
    traditions: ["theurg"],
    ritual: true,
    description:
      "1-hour ritual. 30-ft area. Extraplanar creatures Wis save (disadvantage if confined to magic circle); on fail, can't return to material plane for 24 hours.",
  },
  {
    id: "fire-soul",
    name: "Fire Soul",
    level: 5,
    school: "Transmutation",
    traditions: ["wizard"],
    ritual: true,
    description:
      "10-min ritual. For 1 hour: enemies attacking or touching you within 5 ft take 1d12 fire. You're immune to fire damage; first time you'd take fire, you instead heal half that amount.",
  },
  {
    id: "flame-strike",
    name: "Flame Strike",
    level: 5,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "10-ft radius, 40-ft tall cylinder within 60 ft. Each creature Dex save: 4d6 fire + 4d6 radiant (half on success).",
  },
  {
    id: "geas",
    name: "Geas",
    level: 5,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "theurg", "troll-singer"],
    description:
      "1-min cast. Wis save or charmed for 30 days; if target acts against your command, take 5d10 psychic each round (max once/day). Removed by remove-curse, greater-restoration, or wish.",
  },
  {
    id: "greater-restoration",
    name: "Greater Restoration",
    level: 5,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Touch. End one of: charm, curse, exhaustion (one level), petrification, or HP-max reduction.",
  },
  {
    id: "hold-monster",
    name: "Hold Monster",
    level: 5,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "Wis save or paralyzed for 1 minute (saves at end of each turn). No effect on undead. Concentration.",
  },
  {
    id: "insect-plague",
    name: "Insect Plague",
    level: 5,
    school: "Conjuration",
    traditions: ["sorcerer", "theurg"],
    description:
      "20-ft radius sphere within 300 ft. Lightly obscured, difficult terrain. Each creature in area Con save: 4d10 piercing (half on success). Concentration up to 10 minutes.",
  },
  {
    id: "legend-lore",
    name: "Legend Lore",
    level: 5,
    school: "Divination",
    traditions: ["theurg", "troll-singer", "wizard"],
    description:
      "10-min cast. Name a person, place, or object. Receive cryptic lore — depth scales with how famous it is. 250-thaler incense.",
  },
  {
    id: "mass-cure-wounds",
    name: "Mass Cure Wounds",
    level: 5,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "30-ft radius point within 60 ft. Up to 6 creatures regain 3d8 + spellcasting modifier HP. No effect on constructs.",
  },
  {
    id: "mislead",
    name: "Mislead",
    level: 5,
    school: "Illusion",
    traditions: ["wizard", "troll-singer"],
    description:
      "Self. You become invisible and create an illusory duplicate within 30 ft. Switch sensory perception between you and double as a free action. Concentration up to 1 hour.",
  },
  {
    id: "modify-memory",
    name: "Modify Memory",
    level: 5,
    school: "Enchantment",
    traditions: ["wizard", "troll-singer"],
    description:
      "Wis save or charmed. While charmed (concentration up to 1 minute) you can erase, edit, or implant a 24-hour memory. Effect persists until remove-curse or greater-restoration.",
  },
  {
    id: "passwall",
    name: "Passwall",
    level: 5,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "Create a 5-ft wide × 8-ft tall × 20-ft deep passage through wood, plaster, or stone. 1 hour.",
  },
  {
    id: "planar-binding",
    name: "Planar Binding",
    level: 5,
    school: "Abjuration",
    traditions: ["sorcerer", "wizard", "theurg"],
    description:
      "1-hour cast. Cha save or extraplanar creature is bound to your service for 24 hours. 1,000-thaler jewel consumed. Higher level extends duration.",
  },
  {
    id: "purgatory",
    name: "Purgatory",
    level: 5,
    school: "Evocation",
    traditions: ["theurg"],
    ritual: true,
    description:
      "Wis save (DC = target's permanent Corruption; fully-corrupt creatures use DC 30). On fail: 8d6 radiant; half on success.",
  },
  {
    id: "scrying",
    name: "Scrying",
    level: 5,
    school: "Divination",
    traditions: ["wizard", "witch", "theurg", "troll-singer"],
    description:
      "10-min cast. Wis save (target gains bonus by familiarity). On fail, you see and hear them anywhere on the same plane via an invisible sensor. Concentration up to 10 minutes.",
  },
  {
    id: "seeming",
    name: "Seeming",
    level: 5,
    school: "Illusion",
    traditions: ["sorcerer", "wizard", "troll-singer"],
    description:
      "Reshape the appearance of any number of creatures within 30 ft (Cha save for unwilling). Illusion fails on physical inspection. 8 hours.",
  },
  {
    id: "telekinesis",
    name: "Telekinesis",
    level: 5,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Each turn (action) move/manipulate an object up to 1,000 lb or attempt to move a creature (Str check vs your spellcasting check). Concentration up to 10 minutes.",
  },
  {
    id: "telepathic-bond",
    name: "Telepathic Bond",
    level: 5,
    school: "Divination",
    traditions: ["wizard", "witch", "troll-singer"],
    ritual: true,
    description:
      "Up to 8 willing creatures within 30 ft are mentally linked for 1 hour. Communicate telepathically across any distance on the same plane.",
  },
  {
    id: "teleportation-circle",
    name: "Teleportation Circle",
    level: 5,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "1-min cast (50-thaler chalk consumed). Conjure a portal to a permanent teleportation circle whose sigil sequence you know. Lasts 1 round. Daily casts in same place for 1 year make a permanent circle.",
  },
  {
    id: "turn-weather",
    name: "Turn Weather",
    level: 5,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "10-min cast. Influence weather within 5 miles. Choose precipitation, temperature, or wind, and shift one stage. After 1d4 × 10 minutes the change takes effect. Concentration up to 8 hours.",
  },
  {
    id: "wall-of-force",
    name: "Wall of Force",
    level: 5,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "Create an invisible 10-ft tall × 10-ft thick force barrier within 120 ft. Sphere or up to 10 panels of 10-ft squares. Impassable; concentration up to 10 minutes; disintegrate destroys.",
  },
  {
    id: "wall-of-stone",
    name: "Wall of Stone",
    level: 5,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "10 6-ft × 10-ft panels of stone within 120 ft. Each panel 6-inch thick. Concentration up to 10 minutes; cast for 10 min daily over a year to make permanent.",
  },
];

// ---------------------------------------------------------------------------
// 6th-level spells (PG p. 217–220)
// ---------------------------------------------------------------------------

const LEVEL_6: SpellDef[] = [
  {
    id: "atonement",
    name: "Atonement",
    level: 6,
    school: "Transmutation",
    traditions: ["theurg"],
    ritual: true,
    description:
      "1-min ritual. Touch a willing person; they accept a service for the Theurg's church. Upon completion, target loses 1d3+1 permanent Corruption. Failure to act on the task within a month ends the spell and the target gains 1 permanent Corruption.",
  },
  {
    id: "chain-lightning",
    name: "Chain Lightning",
    level: 6,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Primary target within 150 ft, then arcs to up to 3 secondary targets within 30 ft. Each Dex save: 10d8 lightning (half on success).",
  },
  {
    id: "circle-of-death",
    name: "Circle of Death",
    level: 6,
    school: "Necromancy",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "60-ft radius sphere within 150 ft. Each creature Con save: 8d6 necrotic (half on success).",
  },
  {
    id: "contingency",
    name: "Contingency",
    level: 6,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "10-min cast. Pre-cast a 5th-level-or-lower spell that triggers on a defined condition within 10 days. 1,500-thaler statuette focus.",
  },
  {
    id: "create-undead",
    name: "Create Undead",
    level: 6,
    school: "Necromancy",
    traditions: ["sorcerer", "wizard"],
    description:
      "1-min cast at night. Target up to 3 corpses; each becomes a dragoul under your control for 24 hours. 75-thaler black onyx per corpse consumed.",
  },
  {
    id: "disintegrate",
    name: "Disintegrate",
    level: 6,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Dex save: 10d6+40 force damage. Target reduced to 0 HP is reduced to dust (revivable only by wish). Auto-disintegrates Large or smaller nonmagical objects.",
  },
  {
    id: "eyebite",
    name: "Eyebite",
    level: 6,
    school: "Necromancy",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "Concentration up to 1 minute. Each turn (action) target a visible creature within 60 ft; Wis save or one of: asleep (unconscious until damaged), panicked (frightened, dashes away), sickened (disadvantage on attacks/checks).",
  },
  {
    id: "find-the-path",
    name: "Find the Path",
    level: 6,
    school: "Divination",
    traditions: ["theurg"],
    description:
      "Self. Name a known location on the same plane; for 1 day you know the most direct route to it (no path-blocking magic affects you). 100-thaler quartz consumed.",
  },
  {
    id: "flesh-to-stone",
    name: "Flesh to Stone",
    level: 6,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Con save 3 times over 3 turns: each fail accumulates restraint, then petrification on third fail. 3 successes total during effect = spell ends. Concentration up to 1 minute; permanent if you complete the duration.",
  },
  {
    id: "forbiddance",
    name: "Forbiddance",
    level: 6,
    school: "Abjuration",
    traditions: ["theurg"],
    ritual: true,
    description:
      "10-min ritual. 40,000 sq-ft area. Block teleportation/planar travel into it; chosen creature types take 5d10 radiant or necrotic on entering. 1 day; cast 30 consecutive days to make permanent.",
  },
  {
    id: "freezing-sphere",
    name: "Freezing Sphere",
    level: 6,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "60-ft radius sphere within 300 ft. Each creature Con save: 10d6 cold (half on success). May delay firing — sphere becomes a thrown grenade with same effect.",
  },
  {
    id: "globe-of-invulnerability",
    name: "Globe of Invulnerability",
    level: 6,
    school: "Abjuration",
    traditions: ["wizard"],
    description:
      "10-ft radius shimmering barrier around you. Spells of 5th level or lower from outside can't affect creatures or objects inside. Concentration up to 1 minute.",
  },
  {
    id: "guards-and-wards",
    name: "Guards and Wards",
    level: 6,
    school: "Abjuration",
    traditions: ["wizard"],
    description:
      "10-min cast. Ward up to 2,500 sq ft of contiguous floor space (plus 20-ft tall walls). Multiple effects: corridors fogged, doors locked + arcane locked, stairs trapped, magical confusion, secondary spells. 24 hours; cast daily for 6 months to permanent.",
  },
  {
    id: "harm",
    name: "Harm",
    level: 6,
    school: "Necromancy",
    traditions: ["theurg"],
    description:
      "60-ft range. Con save: 14d6 necrotic (half on success); on fail, target's max HP is reduced by amount taken until next long rest. Won't reduce HP below 1.",
  },
  {
    id: "heal",
    name: "Heal",
    level: 6,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "60-ft range. Target regains 70 HP and is cured of blindness/deafness and any disease. No effect on constructs/undead.",
  },
  {
    id: "heroes-feast",
    name: "Heroes' Feast",
    level: 6,
    school: "Conjuration",
    traditions: ["theurg"],
    description:
      "10-min cast. Conjure a feast for up to 12 creatures over 1 hour. Each who eats: cured of disease/poison, immune to poisoned/frightened, advantage on Wis saves, +2d10 max HP & current HP. 24 hours.",
  },
  {
    id: "instant-summons",
    name: "Instant Summons",
    level: 6,
    school: "Conjuration",
    traditions: ["wizard"],
    ritual: true,
    description:
      "1-min ritual. Imbue a sapphire (1,000 thaler). Later, action to summon a marked object weighing ≤10 lb to your hand from anywhere on the same plane. Permanent.",
  },
  {
    id: "irresistible-dance",
    name: "Irresistible Dance",
    level: 6,
    school: "Enchantment",
    traditions: ["wizard", "troll-singer"],
    description:
      "Bonus action. 30 ft. Target dances comically: half speed, disadvantage on Dex saves and attack rolls; attacks against it have advantage. Wis save at end of each turn to end. Concentration up to 1 minute.",
  },
  {
    id: "living-fortress",
    name: "Living Fortress",
    level: 6,
    school: "Transmutation",
    traditions: ["witch"],
    ritual: true,
    description:
      "1-hour ritual. A 20-ft sided fortress of living trees and thorns erupts within 10 ft. Walls AC 15, 50 HP, regen 5/round; resistant to nonmagical piercing; immune to poison/psychic. Hostile creatures entering Dex save: 4d12 piercing. Lasts a season (3 months).",
  },
  {
    id: "mass-suggestion",
    name: "Mass Suggestion",
    level: 6,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "troll-singer", "witch"],
    description:
      "Up to 12 creatures within 60 ft. Wis save or pursue a 1-2 sentence suggested course of action for 24 hours. Obvious self-harm ends it.",
  },
  {
    id: "move-earth",
    name: "Move Earth",
    level: 6,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "2-hour cast. Reshape dirt/sand/clay across a 40-ft area. Concentration up to 2 hours.",
  },
  {
    id: "patron-saint",
    name: "Patron Saint",
    level: 6,
    school: "Conjuration",
    traditions: ["theurg"],
    description:
      "10-min cast. Summon a CR-9 templar martyr's spirit to aid you. Outside combat: assists with simple tasks. In combat: independent melee combatant with magical flail and innate spellcasting. Stays within 120 ft, dispelled if separated.",
  },
  {
    id: "programmed-illusion",
    name: "Programmed Illusion",
    level: 6,
    school: "Illusion",
    traditions: ["wizard"],
    description:
      "Create a 30-ft cube illusion that activates on a defined trigger. Plays a scripted scene of up to 5 minutes, then resets. Permanent until dispelled.",
  },
  {
    id: "sunbeam",
    name: "Sunbeam",
    level: 6,
    school: "Evocation",
    traditions: ["sorcerer", "wizard", "witch", "theurg"],
    description:
      "60-ft line of bright sunlight. Action each turn (concentration): each creature in line Con save: 6d8 radiant + blinded until next turn (half/no blind on success).",
  },
  {
    id: "true-seeing",
    name: "True Seeing",
    level: 6,
    school: "Divination",
    traditions: ["sorcerer", "wizard", "theurg"],
    description:
      "Touch. Target sees through invisibility, secret doors, illusions, and the ethereal plane within 120 ft for 1 hour.",
  },
  {
    id: "wall-of-ice",
    name: "Wall of Ice",
    level: 6,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "10 10-ft square panels or hemisphere within 120 ft. AC 12, 30 HP/section. Creatures passing through Dex save: 5d6 cold (half on success). Concentration up to 10 minutes.",
  },
];

// ---------------------------------------------------------------------------
// 7th-level spells (PG p. 221–222)
// ---------------------------------------------------------------------------

const LEVEL_7: SpellDef[] = [
  {
    id: "arcane-sword",
    name: "Arcane Sword",
    level: 7,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "Conjure a spectral blade within 60 ft. Bonus action: melee spell attack, 3d10 force on hit. Move it 20 ft. Concentration up to 1 minute.",
  },
  {
    id: "delayed-blast-fireball",
    name: "Delayed Blast Fireball",
    level: 7,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "150 ft. Place a glowing bead; each turn its base damage of 12d6 fire grows by 1d6 (max 20d6). Bead detonates on touch or end of concentration: 20-ft radius sphere, Dex save half.",
  },
  {
    id: "divine-word",
    name: "Divine Word",
    level: 7,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "Bonus action. Up to 30 ft. Each creature Cha save: HP ≤20 killed, ≤30 blinded 1 hr, ≤40 deafened 1 min, ≤50 stunned 1 hr (cumulative thresholds). Extraplanar creatures forced back to home plane.",
  },
  {
    id: "ethereality",
    name: "Ethereality",
    level: 7,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard", "witch", "theurg"],
    description:
      "Self. Step into the ethereal realm overlapping the real world for 8 hours. You see/hear up to 60 ft into reality but can't interact (vertical movement costs 1 ft per ft). Action to dismiss.",
  },
  {
    id: "finger-of-death",
    name: "Finger of Death",
    level: 7,
    school: "Necromancy",
    traditions: ["sorcerer", "witch"],
    description:
      "60 ft. Con save: 7d8+30 necrotic (half on success). Killed humanoid rises as a permanent zombie under your control on the next turn.",
  },
  {
    id: "fire-storm",
    name: "Fire Storm",
    level: 7,
    school: "Evocation",
    traditions: ["theurg", "sorcerer"],
    description:
      "150 ft. Ten 10-ft cubes of fire (don't have to be contiguous). Each creature in any cube Dex save: 7d10 fire (half on success).",
  },
  {
    id: "forcecage",
    name: "Forcecage",
    level: 7,
    school: "Evocation",
    traditions: ["wizard", "witch"],
    description:
      "Conjure a 20-ft cube cage of force within 100 ft. Solid box (impervious) or barred cage (½-inch gaps). Held creatures Cha save (disadvantage if box) to teleport out; otherwise trapped 1 hour. 1,500-thaler ruby dust consumed.",
  },
  {
    id: "magnificent-mansion",
    name: "Magnificent Mansion",
    level: 7,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "1-min cast. Conjure an extradimensional mansion entrance within 300 ft. Up to 50 willing creatures invited may enter; mansion has spectral servants and feast. 24 hours. 5,000-thaler ivory door focus.",
  },
  {
    id: "mirage-arcane",
    name: "Mirage Arcane",
    level: 7,
    school: "Illusion",
    traditions: ["wizard"],
    description:
      "10-min cast. 1-square-mile area's terrain is reshaped into a different terrain (and structures may be added/disguised). Includes touch/sound/smell. 10 days.",
  },
  {
    id: "plane-shift",
    name: "Plane Shift",
    level: 7,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard", "witch", "theurg"],
    description:
      "Touch. Up to 8 willing creatures travel to the Yonderworld (or you alone return). Or: melee spell attack to banish an unwilling creature there (Cha save). 100-thaler tuning rod consumed.",
  },
  {
    id: "prismatic-spray",
    name: "Prismatic Spray",
    level: 7,
    school: "Evocation",
    traditions: ["sorcerer", "wizard"],
    description:
      "60-ft cone. Each creature in area: roll d8 for color (red 10d6 fire, orange 10d6 acid, yellow 10d6 lightning, green 10d6 poison, blue 10d6 cold, indigo restrained-then-petrified, violet blinded-then-banished, 8 = roll twice).",
  },
  {
    id: "project-image",
    name: "Project Image",
    level: 7,
    school: "Illusion",
    traditions: ["wizard"],
    description:
      "Create a duplicate of yourself at a known place within 500 miles. Action to switch sensory perception with double; double can speak/move within 30 ft of its arrival point. Concentration up to 1 day.",
  },
  {
    id: "regenerate",
    name: "Regenerate",
    level: 7,
    school: "Transmutation",
    traditions: ["theurg"],
    description:
      "1-min cast. Touch. Target regains 4d8+15 HP and 1 HP/minute for the next hour. Severed body parts regrow within 2 minutes.",
  },
  {
    id: "resurrection",
    name: "Resurrection",
    level: 7,
    school: "Necromancy",
    traditions: ["theurg"],
    description:
      "1-hour cast. Touch a corpse dead ≤100 years (cause not old age). Returns to full HP, cured of all conditions. Disadvantage on attacks/checks/saves for 4 long rests after. 1,000-thaler diamond consumed.",
  },
  {
    id: "reverse-gravity",
    name: "Reverse Gravity",
    level: 7,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "100 ft. 50-ft radius, 100-ft tall cylinder. Loose objects and creatures fall upward. Dex save to grab a fixed object. Concentration up to 1 minute.",
  },
  {
    id: "sequester",
    name: "Sequester",
    level: 7,
    school: "Transmutation",
    traditions: ["wizard"],
    description:
      "Touch. Hide a creature/object in a magical stasis (invisible, divination-blocked). Defined trigger condition ends the spell. 5,000-thaler emerald dust consumed.",
  },
  {
    id: "soul-stone",
    name: "Soul Stone",
    level: 7,
    school: "Necromancy",
    traditions: ["wizard"],
    ritual: true,
    description:
      "10-min ritual. Capture the soul of a dying creature (≤10 HP) into a prepared 100-thaler crystal. Subsequent castings drain 1d4+spellcasting modifier permanent Corruption from a wizard into the stone. If the stone overflows, it shatters and the collected Corruption rebounds onto the caster.",
  },
  {
    id: "symbol",
    name: "Symbol",
    level: 7,
    school: "Abjuration",
    traditions: ["wizard", "theurg"],
    description:
      "1-min cast. Inscribe a glyph on a surface that triggers on a defined condition. Choose effect: death (10d10 necrotic 60-ft radius), discord, fear, hopelessness, insanity, pain, sleep, or stunning. Permanent until triggered. 1,000-thaler diamond dust consumed.",
  },
  {
    id: "teleport",
    name: "Teleport",
    level: 7,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "Self + up to 8 willing creatures within 10 ft (or one Huge object). Travel instantly to a known location on the same plane. Familiarity affects accuracy (always exact for permanent circles).",
  },
];

// ---------------------------------------------------------------------------
// 8th-level spells (PG p. 223)
// ---------------------------------------------------------------------------

const LEVEL_8: SpellDef[] = [
  {
    id: "antimagic-field",
    name: "Antimagic Field",
    level: 8,
    school: "Abjuration",
    traditions: ["theurg", "wizard"],
    description:
      "10-ft radius sphere centered on you. Magic and magical effects suppress within. Concentration up to 1 hour.",
  },
  {
    id: "antipathy-sympathy",
    name: "Antipathy/Sympathy",
    level: 8,
    school: "Enchantment",
    traditions: ["wizard"],
    description:
      "1-hour cast. Target object/area within 60 ft. Choose creature kind that is repulsed (frightened, must flee) or attracted (compelled to approach) — Wis save resists. 10 days.",
  },
  {
    id: "blood-storm",
    name: "Blood Storm",
    level: 8,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "Self. Centered on you, 150-ft diameter storm of blood; you and chosen allies/enemies in 15-ft eye are unharmed. Heavy obscurement; in storm: Wis save or blinded. Drowning: Con save in storm or 8d6 necrotic. Concentration up to 1 minute. Bonus action moves storm 10 ft.",
  },
  {
    id: "clone",
    name: "Clone",
    level: 8,
    school: "Necromancy",
    traditions: ["wizard"],
    description:
      "1-hour cast. Grow a duplicate body in a 1,000-thaler vessel using a piece of the original creature. After 120 days the clone matures; if the original dies, soul transfers to the clone.",
  },
  {
    id: "control-weather",
    name: "Control Weather",
    level: 8,
    school: "Transmutation",
    traditions: ["wizard", "theurg"],
    description:
      "10-min cast. Affect weather within 5 miles of you. Shift conditions one stage at a time. Concentration up to 8 hours.",
  },
  {
    id: "demiplane",
    name: "Demiplane",
    level: 8,
    school: "Conjuration",
    traditions: ["witch"],
    description:
      "Create a door within 60 ft leading to a 30-ft sided demiplane chamber. Lasts 1 hour. Cast in same place to access the same demiplane.",
  },
  {
    id: "dominate-monster",
    name: "Dominate Monster",
    level: 8,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "60 ft. Wis save or charmed/telepathic command (any creature, not just humanoid). Concentration up to 1 hour.",
  },
  {
    id: "earthquake",
    name: "Earthquake",
    level: 8,
    school: "Evocation",
    traditions: ["sorcerer", "theurg"],
    description:
      "100-ft radius point within 500 ft. Creatures and structures in area Dex save or fall prone. Difficult terrain. Buildings 50 ft tall+ collapse: 5d6 bludgeoning (half on Dex save). Concentration up to 1 minute.",
  },
  {
    id: "feeblemind",
    name: "Feeblemind",
    level: 8,
    school: "Enchantment",
    traditions: ["wizard", "witch", "troll-singer"],
    description:
      "Int save: 4d6 psychic + Int and Cha drop to 1; can't cast spells, communicate, or understand language. Save with disadvantage if it failed initially; retry every 30 days. Removed by greater-restoration, heal, or wish.",
  },
  {
    id: "glibness",
    name: "Glibness",
    level: 8,
    school: "Transmutation",
    traditions: ["witch"],
    description:
      "Self. 1 hour. Replace any Cha check d20 roll with 15 (after rolling). Magic detecting lies registers your statements as truth.",
  },
  {
    id: "holy-aura",
    name: "Holy Aura",
    level: 8,
    school: "Abjuration",
    traditions: ["theurg"],
    description:
      "Self + radiant aura. Up to 30 ft. Allies in aura: advantage on saves; attackers have disadvantage. Fiends/undead striking allies must Con save or be blinded. Concentration up to 1 minute. 1,000-thaler reliquary.",
  },
  {
    id: "incendiary-cloud",
    name: "Incendiary Cloud",
    level: 8,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "20-ft radius cloud of swirling smoke and embers within 150 ft. Heavily obscured. Each turn each creature in cloud Dex save: 10d8 fire (half on success). Cloud moves 10 ft per turn. Concentration up to 1 minute.",
  },
  {
    id: "maze",
    name: "Maze",
    level: 8,
    school: "Conjuration",
    traditions: ["wizard"],
    description:
      "Banish target to a magical labyrinth in another dimension. Action each turn (Int check DC 20) to escape. Auto-returns after 10 minutes. Concentration up to 10 minutes.",
  },
  {
    id: "mind-blank",
    name: "Mind Blank",
    level: 8,
    school: "Abjuration",
    traditions: ["wizard", "witch", "troll-singer"],
    description:
      "Touch. Immune to psychic damage, charm, and divination magic. 24 hours.",
  },
  {
    id: "power-word-stun",
    name: "Power Word Stun",
    level: 8,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch", "troll-singer"],
    description:
      "60 ft. Creature with HP ≤150 is stunned (Con save at end of each turn to end). No save on initial cast.",
  },
  {
    id: "sunburst",
    name: "Sunburst",
    level: 8,
    school: "Evocation",
    traditions: ["wizard"],
    description:
      "60-ft radius sphere within 150 ft. Each creature Con save: 12d6 radiant + blinded 1 minute (half/no blind on success). Negates magical darkness in area.",
  },
];

// ---------------------------------------------------------------------------
// 9th-level spells (PG p. 223)
// ---------------------------------------------------------------------------

const LEVEL_9: SpellDef[] = [
  {
    id: "foresight",
    name: "Foresight",
    level: 9,
    school: "Divination",
    traditions: ["wizard", "witch"],
    description:
      "Touch. 8 hours. Target gains advantage on attacks/checks/saves; attackers have disadvantage. Can't be surprised.",
  },
  {
    id: "gate",
    name: "Gate",
    level: 9,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard", "theurg"],
    description:
      "10-ft diameter portal to a known location on another plane within 60 ft. May summon a specific named creature through. Concentration up to 1 minute. 5,000-thaler diamond consumed.",
  },
  {
    id: "imprisonment",
    name: "Imprisonment",
    level: 9,
    school: "Abjuration",
    traditions: ["wizard", "witch"],
    description:
      "1-min cast. Wis save or imprisoned per chosen mode: burial deep, chained, gem stasis, magical hedge maze, or contained in slumber. Until ended by wish, freedom, dispel-evil-and-good, or specific counter. 500-thaler bind material.",
  },
  {
    id: "mass-heal",
    name: "Mass Heal",
    level: 9,
    school: "Evocation",
    traditions: ["theurg"],
    description:
      "60-ft range. Distribute up to 700 HP among any number of creatures within range. Cured of all diseases, blindness, and deafness. No effect on constructs.",
  },
  {
    id: "meteor-swarm",
    name: "Meteor Swarm",
    level: 9,
    school: "Evocation",
    traditions: ["wizard", "sorcerer"],
    description:
      "1 mile range. 4 fiery balls fall in 40-ft radius spheres at chosen points. Each sphere: Dex save: 20d6 fire + 20d6 bludgeoning (half on success). Ignites flammables.",
  },
  {
    id: "power-word-kill",
    name: "Power Word Kill",
    level: 9,
    school: "Enchantment",
    traditions: ["sorcerer", "wizard", "witch"],
    description:
      "60 ft. Creature with HP ≤100 dies instantly. No save.",
  },
  {
    id: "prismatic-wall",
    name: "Prismatic Wall",
    level: 9,
    school: "Abjuration",
    traditions: ["wizard"],
    description:
      "Conjure a 60-ft long × 30-ft tall × 1-inch thick wall of seven layers of color, each with its own effects (matching prismatic-spray). 10 minutes; layers must be destroyed in sequence to pass.",
  },
  {
    id: "time-stop",
    name: "Time Stop",
    level: 9,
    school: "Transmutation",
    traditions: ["sorcerer", "wizard"],
    description:
      "Self. Take 1d4+1 turns in a row, during which other creatures are frozen. Spell ends if you affect another creature or move >1,000 ft from your starting point.",
  },
  {
    id: "weird",
    name: "Weird",
    level: 9,
    school: "Illusion",
    traditions: ["wizard"],
    description:
      "30-ft radius point within 120 ft. Each creature Wis save or frightened of an illusory worst-fear; takes 4d10 psychic each turn until it makes a save. Concentration up to 1 minute.",
  },
  {
    id: "wish",
    name: "Wish",
    level: 9,
    school: "Conjuration",
    traditions: ["sorcerer", "wizard"],
    description:
      "Self. Replicate any 8th-level-or-lower spell without components, OR alter a wish-described effect: heal up to 20 creatures fully, grant resistance, undo recent events, etc. Use beyond duplicating spells: 33% chance never to cast wish again, exhaustion, and HP reduction.",
  },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const SPELLS: ReadonlyArray<SpellDef> = [
  ...CANTRIPS,
  ...LEVEL_1,
  ...LEVEL_2,
  ...LEVEL_3,
  ...LEVEL_4,
  ...LEVEL_5,
  ...LEVEL_6,
  ...LEVEL_7,
  ...LEVEL_8,
  ...LEVEL_9,
];

export function spellsForTradition(
  tradition: string,
  level: number | ReadonlyArray<number>,
) {
  const levels = new Set<number>(Array.isArray(level) ? level : [level as number]);
  return SPELLS.filter(
    (s) => levels.has(s.level) && s.traditions.includes(tradition as never),
  );
}

export const SPELL_BY_ID: Record<string, SpellDef> = Object.fromEntries(
  SPELLS.map((s) => [s.id, s]),
);
