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
// Levels covered in this commit: 0 (cantrips), 1, 2.
// Levels 3–9 are tracked under the same OpenSpec change (`add-spell-catalog`).

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
// Aggregate
// ---------------------------------------------------------------------------

export const SPELLS: ReadonlyArray<SpellDef> = [
  ...CANTRIPS,
  ...LEVEL_1,
  ...LEVEL_2,
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
