// The five classes of Ruins of Symbaroum (PG sect. 4, p. 96–145).
//
// L1 features and class-shape metadata are encoded inline. Per-level
// progression (L1–20) lives in `data/level-tables/<class>.ts`; this file
// only wires the tables onto the class and approach definitions.

import type { ApproachDef, ClassDef } from "@/lib/character/types";
import {
  CAPTAIN_APPROACH_LEVEL_TABLES,
  CAPTAIN_LEVEL_TABLE,
} from "./level-tables/captain";
import {
  HUNTER_APPROACH_LEVEL_TABLES,
  HUNTER_LEVEL_TABLE,
  WITCH_HUNTER_SPELLCASTING,
} from "./level-tables/hunter";
import {
  MYSTIC_APPROACH_LEVEL_TABLES,
  MYSTIC_APPROACH_SPELLCASTING,
  MYSTIC_LEVEL_TABLE,
} from "./level-tables/mystic";
import {
  FORMER_CULTIST_SPELLCASTING,
  SCOUNDREL_APPROACH_LEVEL_TABLES,
  SCOUNDREL_LEVEL_TABLE,
} from "./level-tables/scoundrel";
import {
  TEMPLAR_SPELLCASTING,
  WARRIOR_APPROACH_LEVEL_TABLES,
  WARRIOR_LEVEL_TABLE,
} from "./level-tables/warrior";
import type {
  ApproachLevelEntry,
  ApproachSpellcasting,
} from "@/lib/character/types";

/**
 * Decorates a list of L1-shaped approach definitions with their per-approach
 * level tables and (optionally) spellcasting metadata. This keeps the inline
 * ApproachDef literals readable; per-level data lives in `data/level-tables/`.
 */
function withLevelTables(
  bases: ReadonlyArray<Omit<ApproachDef, "levelTable" | "spellcasting">>,
  tables: Record<string, ReadonlyArray<ApproachLevelEntry>>,
  spellcasting: Record<string, ApproachSpellcasting> = {},
): ApproachDef[] {
  return bases.map((b) => ({
    ...b,
    levelTable: tables[b.id] ?? [],
    ...(spellcasting[b.id] ? { spellcasting: spellcasting[b.id] } : {}),
  }));
}

// ---------------------------------------------------------------------------
// Captain — PG p. 96
// ---------------------------------------------------------------------------

const CAPTAIN_APPROACHES: ApproachDef[] = withLevelTables(
  [
  {
    id: "merchant-master",
    classId: "captain",
    name: "Merchant Master",
    description:
      "A captain who applies military discipline to ordinary affairs — especially mercantile concerns. Their merchant caravan is in nearly as much danger in the wild as a scouting party along the front lines.",
    level1Features: [
      {
        name: "Consummate Haggler (level 3)",
        description:
          "Begins at level 3 — at level 1 you simply pick this approach to set your trajectory. (See PG p. 98.)",
      },
    ],
  },
  {
    id: "officer",
    classId: "captain",
    name: "Officer",
    description:
      "A child of the army's baggage train, raised in or near the military. Now drilling a misfit group of adventurers into something resembling a squad.",
    level1Features: [
      {
        name: "Army Brat",
        description:
          "Gain proficiency in Medicine, Nature, or Survival. You also gain proficiency with siege weapons. Finally, you gain proficiency with a gaming set of your choice.",
      },
    ],
  },
  {
    id: "outlaw",
    classId: "captain",
    name: "Outlaw",
    description:
      "Broken free from your old society and disobeying its laws. Outlaws focus on stealth and ranged weaponry to remain free.",
    level1Features: [
      {
        name: "Hard to Find",
        description:
          "Gain proficiency in your choice of Deception, Stealth, or Survival.",
      },
      {
        name: "Secret Signs",
        description:
          "You have taught some of your companions (number equal to your proficiency bonus) how to communicate in subtle gestures. Use a bonus action on your turn to discreetly signal one of them.",
      },
    ],
  },
  {
    id: "poet-warrior",
    classId: "captain",
    name: "Poet-warrior",
    description:
      "A philosopher of war who acts with efficiency for its own sake. Your weapon is your pen.",
    level1Features: [
      {
        name: "Reflection",
        description:
          "When you take a short rest you can meditate on an enemy you have fought before. You gain advantage on attack rolls against that enemy until you miss, after which the effect ends.",
      },
    ],
  },
  ],
  CAPTAIN_APPROACH_LEVEL_TABLES,
);

const CAPTAIN: ClassDef = {
  id: "captain",
  name: "Captain",
  flavor:
    "War is not just won with soldiers — war is won in the planning tent and with leaders on the field.",
  fallbackHitDie: 8,
  proficiencies: {
    armor: ["All armor", "Shields"],
    weapons: ["Simple weapons", "Martial weapons"],
    tools: [],
    savingThrows: ["cha", "con"],
    skillChoices: {
      count: 4,
      from: [
        "animal-handling",
        "athletics",
        "deception",
        "history",
        "insight",
        "intimidation",
        "perception",
        "persuasion",
        "survival",
      ],
    },
  },
  startingEquipment: [
    "(a) chain shirt OR (b) studded leather armor, longbow, and 20 arrows",
    "(a) a martial weapon and a shield OR (b) two martial weapons",
    "(a) a light crossbow and 20 bolts OR (b) two handaxes",
    "(a) a dungeoneer's pack OR (b) an explorer's pack",
  ],
  shadowFormula: "standard",
  level1Features: [
    {
      name: "Tactical Acumen",
      description:
        "When combat begins and you are not surprised, you can take disadvantage on your initiative roll to give advantage on initiative rolls to a number of creatures equal to your proficiency bonus.",
    },
  ],
  fightingStyleAt1: [
    "archery",
    "defense",
    "dueling",
    "great-weapon",
    "polearm",
    "shield",
    "snare",
    "two-weapon",
  ],
  approaches: CAPTAIN_APPROACHES,
  levelTable: CAPTAIN_LEVEL_TABLE,
};

// ---------------------------------------------------------------------------
// Hunter — PG p. 102
// ---------------------------------------------------------------------------

const HUNTER_APPROACHES: ApproachDef[] = withLevelTables(
  [
  {
    id: "bounty-hunter",
    classId: "hunter",
    name: "Bounty Hunter",
    description:
      "An heir of the guild King Ynedar founded during the Great War. You hunt deserters, fugitives, and the desperate who flee into Davokar.",
    level1Features: [
      {
        name: "Sturdy Holds",
        description:
          "If you have a creature your size or smaller grappled, that creature has disadvantage on their attempts to escape the grapple.",
      },
      {
        name: "Delicate Conversations",
        description: "You gain proficiency with the Deception skill.",
      },
    ],
  },
  {
    id: "ironsworn",
    classId: "hunter",
    name: "Ironsworn",
    description:
      "Agent of the Iron Pact, sworn at an elven ceremony. You are tested in body and mind, devoted to the fight against Corruption.",
    level1Features: [
      {
        name: "Agile Combat",
        description:
          "Your armor class when you wear no armor is equal to 10 plus twice your Dexterity modifier.",
      },
      {
        name: "Lore of the Wild",
        description:
          "You gain proficiency with the Animal Handling and Nature skills.",
      },
    ],
  },
  {
    id: "monster-hunter",
    classId: "hunter",
    name: "Monster Hunter",
    description:
      "A member of one of the monster-hunting societies of Thistle Hold or Kastor. The price of monster trophies pays well.",
    level1Features: [
      {
        name: "The Bigger They are…",
        description:
          "You have advantage on all attacks against targets that are Large size or bigger.",
      },
      {
        name: "Clever Fingers",
        description: "You gain proficiency with the Sleight of Hand skill.",
      },
    ],
  },
  {
    id: "witch-hunter",
    classId: "hunter",
    name: "Witch Hunter",
    description:
      "You have dedicated your life to fighting blight beasts and corrupted sorcerers, often after personal tragedy.",
    tradition: "theurg",
    level1Features: [
      {
        name: "Deep Knowledge",
        description:
          "You gain proficiency with both Arcana and Religion, representing your knowledge of transgressive magic and the proper teachings of the Church of Prios.",
      },
      {
        name: "Ritualist",
        description:
          "Choose one ritual spell from the Theurg tradition list. You can only cast the chosen spell as a ritual; the ritual version takes 10 minutes longer than normal. You gain no Corruption from casting it.",
      },
    ],
  },
  ],
  HUNTER_APPROACH_LEVEL_TABLES,
  { "witch-hunter": WITCH_HUNTER_SPELLCASTING },
);

const HUNTER: ClassDef = {
  id: "hunter",
  name: "Hunter",
  flavor:
    "Covered in the dirt of the wilds, eyes shining with the light of the future — the hunters are vital in the project of cultivating the great forest.",
  fallbackHitDie: 8,
  proficiencies: {
    armor: ["Light armor", "Medium armor", "Shields"],
    weapons: ["Simple weapons", "Martial weapons"],
    tools: [],
    savingThrows: ["str", "dex"],
    skillChoices: {
      count: 4,
      from: [
        "acrobatics",
        "athletics",
        "insight",
        "investigation",
        "nature",
        "perception",
        "stealth",
        "survival",
      ],
    },
  },
  startingEquipment: [
    "(a) a fencing sword OR (b) a shortsword",
    "(a) a longbow and 20 arrows OR (b) a light crossbow and 20 bolts",
    "(a) a dungeoneer's pack OR (b) an explorer's pack",
    "(a) Studded leather armor and two daggers OR (b) a lacquered silk cuirass",
  ],
  shadowFormula: "standard",
  level1Features: [
    {
      name: "Wilderness Explorer",
      description:
        "You are adept at preparing campsites in the wilderness so that some of your party can gain additional benefits during a long rest. Choose a number of creatures up to your proficiency bonus to each regain an additional Hit Die. If you spend an hour in the wild and succeed at a DC 10 Wisdom (Survival) check, you can supply enough food and drink for your party for one day. Recharges on a long rest.",
    },
  ],
  approaches: HUNTER_APPROACHES,
  levelTable: HUNTER_LEVEL_TABLE,
};

// ---------------------------------------------------------------------------
// Mystic — PG p. 108
// Mystic data inferred from approaches (Sorcerer/Wizard/Theurg/Witch/etc.).
// All Mystic approaches are spell-using; the Approach sets the tradition
// and spellcasting ability. Hit die is d6, no armor proficiency.
// ---------------------------------------------------------------------------

const MYSTIC_APPROACHES: ApproachDef[] = withLevelTables(
  [
  {
    id: "artifact-crafter",
    classId: "mystic",
    name: "Artifact Crafter",
    description:
      "A mystic who studies the secrets of artifact creation. You craft lesser artifacts where others can only carry them.",
    // PG p. 111 — Artifact Crafters learn spells from the Troll Singer list.
    tradition: "troll-singer",
    level1Features: [
      {
        name: "Artifact Lore",
        description:
          "You gain proficiency with Arcana (if not already) and have advantage on Intelligence checks regarding magical artifacts.",
      },
    ],
  },
  {
    id: "self-taught",
    classId: "mystic",
    name: "Self-taught",
    description:
      "You discovered your gift on your own and refined it through dangerous trial and error. No tradition claims you.",
    tradition: "sorcerer",
    level1Features: [
      {
        name: "Wild Talent",
        description:
          "You learn one extra cantrip from the Sorcerer list. You may use any spellcasting ability score (Int, Wis, or Cha) — chosen once at level 1.",
      },
    ],
  },
  {
    id: "sorcerer",
    classId: "mystic",
    name: "Sorcerer",
    description:
      "A wielder of the most direct and dangerous magic. The cult masters of Davokar — and most witches who go astray — walk this dark road.",
    tradition: "sorcerer",
    level1Features: [
      {
        name: "Channeling (Sorcerer)",
        description:
          "You learn spells from the Sorcerer tradition list. Your spellcasting ability is Charisma. You may also gain Corruption when casting non-ritual spells.",
      },
    ],
  },
  {
    id: "staff-mage",
    classId: "mystic",
    name: "Staff Mage",
    description:
      "A practitioner who channels her magic through a runed staff — the trademark of clan-trained barbarian mystics.",
    // PG p. 115 — Staff Mages learn spells from the Wizard tradition list.
    tradition: "wizard",
    level1Features: [
      {
        name: "Bonded Staff",
        description:
          "You begin play with a runed quarterstaff. While holding it, you can use it as a focus and add your spellcasting modifier (Wisdom) to its damage.",
      },
    ],
  },
  {
    id: "symbolist",
    classId: "mystic",
    name: "Symbolist",
    description:
      "You command power through painted, etched, and tattooed symbols of binding. Most are found among Clan Vajvod and the trolls.",
    // PG p. 117 — Symbolists learn spells from the Wizard tradition list.
    tradition: "wizard",
    level1Features: [
      {
        name: "Binding Sigil",
        description:
          "You can inscribe a binding symbol as a 1-minute ritual. Activated as a reaction, it grants 1d6+CHA temporary HP to a willing target it has been placed upon.",
      },
    ],
  },
  {
    id: "theurg",
    classId: "mystic",
    name: "Theurg",
    description:
      "A worker of miracles in the name of Prios. Among the Sun Church, theurgs heal the sick and burn the corrupt.",
    tradition: "theurg",
    level1Features: [
      {
        name: "Holy Smoke",
        description:
          "As a 1-minute ritual you can perceive the shadows of those around you, judging their Corruption category. Spellcasting ability: Wisdom.",
      },
    ],
  },
  {
    id: "troll-singer",
    classId: "mystic",
    name: "Troll Singer",
    description:
      "A keeper of trollish songcraft — magic woven into voice and rune-hammers. Few non-trolls understand it.",
    tradition: "troll-singer",
    level1Features: [
      {
        name: "Songcraft",
        description:
          "You learn cantrips and spells from the Troll Singer list. Spellcasting ability: Charisma.",
      },
    ],
  },
  {
    id: "witch",
    classId: "mystic",
    name: "Witch",
    description:
      "A spiritual leader of the barbarian clans, ranger-priestess of Davokar's living forest.",
    tradition: "witch",
    level1Features: [
      {
        name: "Witchcraft",
        description:
          "You learn cantrips and spells from the Witch tradition list. Spellcasting ability: Wisdom. You gain proficiency with Nature.",
      },
    ],
  },
  {
    id: "wizard",
    classId: "mystic",
    name: "Wizard",
    description:
      "An adept of Ordo Magica — disciplined, scholarly, vigilant of Corruption.",
    tradition: "wizard",
    level1Features: [
      {
        name: "Bonus Spell — Detect Magic",
        description:
          "You learn the detect magic spell in addition to your chosen spells. It does not count against your spells known.",
      },
      {
        name: "Spellcasting Ability — Intelligence",
        description:
          "Wizards rely on the philosophy and knowledge taught by Ordo Magica. You learn spells from the Wizard tradition list.",
      },
    ],
  },
  ],
  MYSTIC_APPROACH_LEVEL_TABLES,
  MYSTIC_APPROACH_SPELLCASTING,
);

const MYSTIC: ClassDef = {
  id: "mystic",
  name: "Mystic",
  flavor:
    "Magic has a real and immediate price in Symbaroum. Every spell warps the world a little — and stains the caster's shadow.",
  fallbackHitDie: 6,
  proficiencies: {
    armor: [],
    weapons: ["Daggers", "Quarterstaffs", "Light crossbows", "Slings"],
    tools: [],
    savingThrows: ["int", "wis"],
    skillChoices: {
      count: 3,
      from: [
        "arcana",
        "history",
        "insight",
        "investigation",
        "medicine",
        "nature",
        "religion",
      ],
    },
  },
  startingEquipment: [
    "(a) a quarterstaff OR (b) a dagger",
    "(a) a component pouch OR (b) an arcane focus",
    "(a) a scholar's pack OR (b) an explorer's pack",
    "Robes appropriate to your tradition",
  ],
  shadowFormula: "mystic",
  level1Features: [
    {
      name: "Spellcasting",
      description:
        "Your tradition and spellcasting ability are determined by your Approach. At level 1 you know 2 cantrips and 1 first-level spell from your tradition's list, and you have 2 first-level spell slots.",
    },
    {
      name: "Corruption Threshold (Mystic)",
      description:
        "Mystics use a special Corruption Threshold formula tied to their tradition. Most mystics use proficiency bonus + Charisma modifier (or Wisdom/Intelligence depending on tradition), minimum 2.",
    },
  ],
  approaches: MYSTIC_APPROACHES,
  levelTable: MYSTIC_LEVEL_TABLE,
};

// ---------------------------------------------------------------------------
// Scoundrel — PG p. 126
// ---------------------------------------------------------------------------

const SCOUNDREL_APPROACHES: ApproachDef[] = withLevelTables(
  [
  {
    id: "explorer",
    classId: "scoundrel",
    name: "Explorer",
    description:
      "You hunt beasts for food and protect inhabitants and travelers from harm — staying clear of your enemies' reach while your arrows still find their mark.",
    level1Features: [
      {
        name: "Precise Shot",
        description:
          "You can add your Backstab damage to a ranged weapon attack. You must either have advantage on the attack or have an ally within 5 feet of the target.",
      },
      {
        name: "Wilderness-master",
        description:
          "You gain proficiency with the Nature and Survival skills along with the Light Crossbow and Longbow.",
      },
    ],
  },
  {
    id: "former-cultist",
    classId: "scoundrel",
    name: "Former Cultist",
    description:
      "You once followed a sorcerer who promised drug-induced insights and black salvation. You defected, hunted now by both your old cult and witch hunters.",
    // PG p. 129 — Former Cultists learn spells from the Sorcerer tradition list.
    tradition: "sorcerer",
    level1Features: [
      {
        name: "Channeling (Sorcerer)",
        description:
          "You were taught some lesser sorcerous arts. You learn 2 cantrips and 1 first-level spell from the Sorcerer tradition list, plus the detect magic spell. Spellcasting ability is Charisma. You gain Corruption when casting non-ritual spells.",
      },
      {
        name: "The Darkened Path",
        description:
          "You have advantage on Corruption check rolls (when a new gain might exceed your Threshold).",
      },
    ],
  },
  {
    id: "guild-thief",
    classId: "scoundrel",
    name: "Guild Thief",
    description:
      "A made member of one of the Thieves' Guilds rooted in Alberetor and reborn in the north.",
    level1Features: [
      {
        name: "Speciality",
        description:
          "Choose: Fence Work (proficiency in Deception, Market contact), Overhead Work (proficiency in Acrobatics, climb speed = walk speed), Special Work (Noble contact), or Streetwise Work (proficiency in Sleight of Hand, Alleyway contact).",
      },
      {
        name: "Blade Work",
        description:
          "If wielding only knives or daggers, add your ability modifier to damage with your off-hand weapon.",
      },
    ],
  },
  {
    id: "sapper",
    classId: "scoundrel",
    name: "Sapper",
    description:
      "Trained in siege works, alchemical fire, and battlefield engineering. The Queen's Sapper Corps' newest recruit.",
    level1Features: [
      {
        name: "Tactician",
        description: "You have advantage on initiative rolls.",
      },
      {
        name: "Steel Throw",
        description:
          "You can use your Backstab feature on a ranged weapon attack with a throwing weapon.",
      },
    ],
  },
  {
    id: "spy",
    classId: "scoundrel",
    name: "Spy",
    description:
      "Veteran of the Royal Sekretorium — informant, infiltrator, manipulator of factions.",
    level1Features: [
      {
        name: "Dissembling Words",
        description: "You gain proficiency with the Deception skill.",
      },
      {
        name: "Network of Contacts",
        description:
          "You build a group of contacts. Number of contacts equals twice your proficiency bonus, drawn from Alleyway, Market, and Noble types.",
      },
    ],
  },
  {
    id: "thug",
    classId: "scoundrel",
    name: "Thug",
    description:
      "Raised in the rough alleys of Yndaros, you preferred the direct approach to subtlety.",
    level1Features: [
      {
        name: "Twin Attack",
        description:
          "If you wield a finesse melee weapon in your primary hand and a light weapon in the other, you add your ability modifier to damage rolls with your off-hand.",
      },
    ],
  },
  {
    id: "treasure-hunter",
    classId: "scoundrel",
    name: "Treasure-hunter",
    description:
      "You dream of overgrown ruins and sunken temples. To locate, salvage, and return treasures to civilization is your bread and butter.",
    level1Features: [
      {
        name: "Steel Throw",
        description:
          "You can use your Backstab feature on a ranged weapon attack with a throwing weapon.",
      },
      {
        name: "Tactician",
        description: "You have advantage on initiative rolls.",
      },
    ],
  },
  ],
  SCOUNDREL_APPROACH_LEVEL_TABLES,
  { "former-cultist": FORMER_CULTIST_SPELLCASTING },
);

const SCOUNDREL: ClassDef = {
  id: "scoundrel",
  name: "Scoundrel",
  flavor:
    "In Ambria the word 'scoundrel' is used broadly — for all who 'steal' something from others, be it their trust, secrets, money or life.",
  fallbackHitDie: 8,
  proficiencies: {
    armor: ["Light armor"],
    weapons: ["Simple weapons", "Hand crossbows", "Longswords", "Rapiers", "Shortswords"],
    tools: ["Thieves' tools"],
    savingThrows: ["dex", "cha"],
    skillChoices: {
      count: 3,
      from: [
        "acrobatics",
        "athletics",
        "deception",
        "insight",
        "intimidation",
        "investigation",
        "perception",
        "performance",
        "persuasion",
        "sleight-of-hand",
        "stealth",
      ],
    },
  },
  startingEquipment: [
    "(a) a fencing sword OR (b) a shortsword",
    "(a) a horseman's bow and 20 arrows OR (b) a shortsword",
    "(a) a burglar's pack OR (b) a dungeoneer's pack OR (c) an explorer's pack",
    "(a) studded leather, two daggers, and thieves' tools OR (b) a woven silk armor",
  ],
  shadowFormula: "standard",
  level1Features: [
    {
      name: "Expertise",
      description:
        "Choose two of your skill proficiencies (or one skill proficiency and your proficiency with thieves' tools). Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.",
    },
    {
      name: "Backstab",
      description:
        "Once per turn, deal an extra 1d6 damage to one creature you hit with an attack if you have advantage on the attack roll. The attack must use a finesse or ranged weapon. You don't need advantage if another enemy of the target is within 5 feet of it (and not incapacitated) and you don't have disadvantage on the attack roll.",
    },
  ],
  approaches: SCOUNDREL_APPROACHES,
  levelTable: SCOUNDREL_LEVEL_TABLE,
};

// ---------------------------------------------------------------------------
// Warrior — PG p. 136
// ---------------------------------------------------------------------------

const WARRIOR_APPROACHES: ApproachDef[] = withLevelTables(
  [
  {
    id: "berserker",
    classId: "warrior",
    name: "Berserker",
    description:
      "Spirits of rage follow you. In combat you fight with primal ferocity; in peace you are thoughtful and patient.",
    level1Features: [
      {
        id: "berserker:rage",
        name: "Rage",
        description:
          "On your turn you can enter a rage as a bonus action. While raging, and not wearing heavy armor: advantage on Strength checks/saves, +1 + half prof bonus to melee damage with Strength weapons, resistance to bludgeoning/piercing/slashing. You can't cast or concentrate while raging. Lasts 1 minute. Uses per long/extended rest = your proficiency bonus.",
        usage: { count: "profBonus", per: "long-rest" },
      },
    ],
  },
  {
    id: "duelist",
    classId: "warrior",
    name: "Duelist",
    description:
      "Honor and glory through finesse. You live by a code of single combat.",
    level1Features: [
      {
        name: "Feint",
        description:
          "Wielding a finesse weapon, use a bonus action to leave an opening; until your next turn, when an opponent attacks you they have advantage but you can use your reaction to attack them immediately after their attack.",
      },
    ],
  },
  {
    id: "knight",
    classId: "warrior",
    name: "Knight",
    description:
      "A noble warrior, heavily armored and dutiful — fighting for your lord, your allies, or your family's glory.",
    level1Features: [
      {
        name: "Bodyguard",
        description:
          "You can use your reaction to take a blow meant for another creature within 5 feet of you. The attack roll is compared to your AC and you take damage only if it would strike you.",
      },
    ],
  },
  {
    id: "rune-smith",
    classId: "warrior",
    name: "Rune Smith",
    description:
      "Sworn to fight only with weapons of your own making. The most skilled craftsmen of the Underworld.",
    level1Features: [
      {
        name: "Blacksmith",
        description:
          "Proficiency with Smith's Tools. During downtime, produce metal implements at half market value (1 day per 5 thaler).",
      },
    ],
  },
  {
    id: "tattooed-fighter",
    classId: "warrior",
    name: "Tattooed Fighter",
    description:
      "Warriors of Clan Vajvod, tattooed by symbolists. Their bodies are walking sigils of power.",
    level1Features: [
      {
        name: "Rune Tattoos",
        description:
          "When attacked, spend your reaction and gain +4 to your AC until the start of your next turn — you also gain 1 point of temporary Corruption. The effect can continue each round so long as you keep gaining Corruption.",
      },
    ],
  },
  {
    id: "templar",
    classId: "warrior",
    name: "Templar",
    description:
      "A Knight of the Dying Sun — heavily armed, with the fire of faith burning behind your breastplate.",
    tradition: "theurg",
    // PG p. 143: "If your Wisdom modifier is higher than your Charisma
    // modifier, you can use it instead of Charisma to calculate your
    // Corruption Threshold." This is the only PG approach with this rule.
    corruptionAbilityOverride: "wis",
    level1Features: [
      {
        name: "Spellcasting (Theurg)",
        description:
          "You learn 2 cantrips and 1 first-level spell from the Theurg tradition list, plus the bless spell. Spellcasting ability is Wisdom (or Charisma if higher). 2 first-level spell slots.",
      },
    ],
  },
  {
    id: "weapon-master",
    classId: "warrior",
    name: "Weapon Master",
    description:
      "A devotee of a single weapon — Sword Saint, Axe Artist, Spear Dancer, or Flailer.",
    level1Features: [
      {
        name: "Fighting Style Mastery",
        description:
          "Sword Saint: Dueling style adds +3 damage. Axe Artist: one of your two-weapon-fighting weapons need not be light. Spear Dancer: spears count as having reach. Flailer: when you use a bonus action to trip, the opponent also takes damage equal to your Strength modifier.",
      },
    ],
  },
  {
    id: "wrathguard",
    classId: "warrior",
    name: "Wrathguard",
    description:
      "One of the Guard of the Slumbering Wrath at Karvosti. To damage you is to wake your fury.",
    level1Features: [
      {
        name: "Wrathful Fury",
        description:
          "Bonus action to enter a wrathful fury. While in it (not heavy armor): advantage on Str checks/saves, bonus melee damage = 1 + half prof bonus, can't cast or concentrate. Lasts 1 minute, ends if you don't attack a hostile or take damage. Uses per long/extended rest = your proficiency bonus.",
      },
    ],
  },
  ],
  WARRIOR_APPROACH_LEVEL_TABLES,
  { templar: TEMPLAR_SPELLCASTING },
);

const WARRIOR: ClassDef = {
  id: "warrior",
  name: "Warrior",
  flavor:
    "Heavily armed shock trooper of clan and kingdom. The barbarian and the knight find common ground here.",
  fallbackHitDie: 8,
  proficiencies: {
    armor: ["All armor", "Shields"],
    weapons: ["Simple weapons", "Martial weapons"],
    tools: [],
    savingThrows: ["str", "con"],
    skillChoices: {
      count: 3,
      from: [
        "acrobatics",
        "animal-handling",
        "athletics",
        "history",
        "insight",
        "intimidation",
        "perception",
        "survival",
      ],
    },
  },
  startingEquipment: [
    "(a) chain shirt OR (b) studded leather armor, longbow, and 20 arrows",
    "(a) a martial weapon and a shield OR (b) two martial weapons",
    "(a) a light crossbow and 20 bolts OR (b) two handaxes",
    "(a) a dungeoneer's pack OR (b) an explorer's pack",
  ],
  shadowFormula: "standard",
  level1Features: [
    {
      id: "warrior:battle-wind",
      name: "Battle Wind",
      description:
        "When hit by an attack roll you can use your reaction to gain temporary HP equal to 2d4 + your Constitution modifier. You can use this feature a number of times equal to your proficiency bonus, then must take a long or extended rest.",
      usage: { count: "profBonus", per: "long-rest" },
      effect: { kind: "tempHp", dice: { count: 2, faces: 4 }, addAbilityMod: "con" },
    },
  ],
  fightingStyleAt1: [
    "archery",
    "defense",
    "dueling",
    "great-weapon",
    "polearm",
    "shield",
    "snare",
    "two-weapon",
  ],
  approaches: WARRIOR_APPROACHES,
  levelTable: WARRIOR_LEVEL_TABLE,
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const CLASSES: ReadonlyArray<ClassDef> = [
  CAPTAIN,
  HUNTER,
  MYSTIC,
  SCOUNDREL,
  WARRIOR,
];

export const CLASS_BY_ID: Record<string, ClassDef> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
);

// ---------------------------------------------------------------------------
// Structural assertions — run at module load.
// Guarantees the spec's structural requirements (levelTable lengths, prof
// bonus curve, ASI slot levels, monotonic spell progression). In production
// failures log via console.error rather than throwing so a single bad table
// can't break the app.
// ---------------------------------------------------------------------------

import { ASI_FEAT_LEVELS } from "@/lib/character/types";
import { SPELL_BY_ID } from "./spells";

(function assertLevelTables() {
  const ASI_LEVELS = new Set<number>(ASI_FEAT_LEVELS as readonly number[]);
  const expectedPb = (lvl: number) =>
    lvl < 5 ? 2 : lvl < 9 ? 3 : lvl < 13 ? 4 : lvl < 17 ? 5 : 6;
  const fail = (msg: string) => {
    if (process.env.NODE_ENV === "production") {
      console.error(`[level-tables] ${msg}`);
    } else {
      throw new Error(`[level-tables] ${msg}`);
    }
  };

  for (const cls of CLASSES) {
    if (cls.levelTable.length !== 20) {
      fail(`${cls.id}: levelTable.length is ${cls.levelTable.length}, expected 20`);
      continue;
    }
    for (let i = 0; i < 20; i++) {
      const row = cls.levelTable[i];
      const lvl = i + 1;
      if (row.level !== lvl) fail(`${cls.id} row ${i}: level ${row.level}, expected ${lvl}`);
      if (row.profBonus !== expectedPb(lvl))
        fail(`${cls.id} L${lvl}: profBonus ${row.profBonus}, expected ${expectedPb(lvl)}`);
      const hasAsi = (row.choices ?? []).some((c) => c.kind === "asi-or-feat");
      const shouldHaveAsi = ASI_LEVELS.has(lvl);
      // One-directional: required Symbaroum ASI levels MUST be present.
      // Extras at non-canonical levels are allowed (some classes — Warrior at
      // L14 — get bonus ASIs per the PG; those rows must cite the page).
      if (shouldHaveAsi && !hasAsi)
        fail(`${cls.id} L${lvl}: asi-or-feat missing; required by Symbaroum standard`);
    }
    for (const approach of cls.approaches) {
      if (approach.levelTable.length !== 20)
        fail(`${cls.id}/${approach.id}: levelTable.length ${approach.levelTable.length}, expected 20`);
      const sc = approach.spellcasting;
      if (sc) {
        if (sc.progression.length !== 20) {
          fail(`${cls.id}/${approach.id}: progression.length ${sc.progression.length}, expected 20`);
          continue;
        }
        for (const spellId of sc.alwaysKnownSpells ?? []) {
          if (!SPELL_BY_ID[spellId])
            fail(`${cls.id}/${approach.id}: alwaysKnownSpells contains unknown spell id "${spellId}"`);
        }
        for (let i = 1; i < 20; i++) {
          const prev = sc.progression[i - 1];
          const cur = sc.progression[i];
          if (cur.cantripsKnown < prev.cantripsKnown)
            fail(`${cls.id}/${approach.id} L${i + 1}: cantripsKnown decreased`);
          if (cur.spellsKnown < prev.spellsKnown)
            fail(`${cls.id}/${approach.id} L${i + 1}: spellsKnown decreased`);
        }
      }
    }
  }
})();

export function approachesForClass(classId: string): ApproachDef[] {
  return CLASS_BY_ID[classId]?.approaches ?? [];
}

export function approachById(id: string): ApproachDef | undefined {
  for (const c of CLASSES) {
    const a = c.approaches.find((x) => x.id === id);
    if (a) return a;
  }
  return undefined;
}
