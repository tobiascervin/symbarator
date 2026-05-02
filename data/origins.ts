// Origins from Ruins of Symbaroum Player's Guide (sect. 3, p. 44–93).
// HP and Hit Dice come from the origin in this setting.

import type { OriginDef } from "@/lib/character/types";

export const ORIGINS: ReadonlyArray<OriginDef> = [
  {
    id: "abducted-human",
    name: "Abducted Human",
    flavor:
      "Stolen as a child, raised by the elves of the Iron Pact. Loyal pupil, never an equal.",
    asi: {
      fixed: { dex: 1, wis: 1 },
      floating: { count: 1, size: 2, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 30,
    languages: { fixed: ["elvish"] },
    providesHp: true,
    features: [
      {
        name: "Cannot Read Elvish",
        description:
          "Abductees speak fluent Elvish but cannot read elven writing without the Loremaster feat.",
      },
    ],
    sampleNames: {
      male: ["Awan", "Beo", "Eral", "Gaer", "Kael", "Lo", "Mael", "Orel", "Tham", "Tir"],
      female: ["Anga", "Beha", "Erli", "Fera", "Inda", "Lonam", "Una", "Undi", "Vird"],
    },
  },
  {
    id: "changeling",
    name: "Changeling",
    flavor:
      "Elf-spawn left in a cradle in place of a stolen human child. Never quite human, never quite elven.",
    asi: {
      fixed: { wis: 2 },
      floating: { count: 1, size: 1, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 30,
    languages: { fixed: [], chooseFromHuman: true },
    providesHp: true,
    features: [
      {
        name: "Darkvision",
        description:
          "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light. Only shades of gray.",
      },
      {
        name: "Shapeshifting",
        description:
          "You may take the Change Self feat in place of an ability score improvement.",
      },
    ],
    sampleNames: {
      male: ["Aka", "Ardri", "Eneáno", "Feon", "Ganderald", "Goriol", "Ibliglin", "Kalfu", "Radomaramei", "Sinue"],
      female: ["Bekora", "Danive", "Yeloéna", "Elorinda", "Hinéua", "Kinlegelana", "Riamata", "Roha", "Seanua", "Varaneia"],
    },
  },
  {
    id: "dwarf",
    name: "Dwarf",
    flavor:
      "A people on the move, fleeing a dark past. Family is shield, language is weapon, the world is their battlefield.",
    asi: {
      fixed: { int: 2 },
      floating: { count: 2, size: 1, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 25,
    languages: { fixed: ["dwarven"], chooseFromHuman: true },
    providesHp: true,
    subchoices: {
      prompt: "Choose your family line",
      options: [
        {
          id: "valotzar",
          name: "Valotzar",
          flavor:
            "Of the three most prominent families in Yndaros, the Valotzar seem to have adapted best to the new conditions of life. Pragmatic, watchful.",
        },
        {
          id: "alzerek",
          name: "Alzerek",
          flavor:
            "One of the great families of Yndaros — proud, traditional, slow to forgive a slight.",
        },
        {
          id: "baldysik",
          name: "Baldysik",
          flavor:
            "The third of Yndaros' great houses. Insular even by dwarven standards; long memory, longer grudges.",
        },
        {
          id: "merotzak",
          name: "Merotzak",
          flavor:
            "Settled in Thistle Hold. It is unclear whether they hail from the royal blood-line or not — they themselves do not say.",
        },
        {
          id: "independent",
          name: "Independent / Allied House",
          flavor:
            "Kalatra, Maretko, Obrutz, Skruztsa, Statzak, Vanoviz, Urbanik — one of the lesser families, drifting between the great houses.",
        },
      ],
    },
    features: [
      {
        name: "Absolute Memory",
        description:
          "You can commit anything to memory at will and recall incidental events down to the minute.",
      },
      {
        name: "Earth Bound",
        description:
          "Dwarves have no soul. Permanent Corruption reduces current and maximum HP 1:1. You do not roll for marks of Corruption; if Corruption equals or exceeds your HP you fall unconscious. If slain, you cannot be raised — even speak with dead fails.",
      },
      {
        name: "Pariahs",
        description:
          "You have disadvantage on social checks with anyone other than dwarves, elves, and trolls.",
      },
    ],
    sampleNames: {
      neutral: [
        "Artek", "Bolkor", "Brana", "Dobril", "Dranek", "Dusa", "Jarok", "Lazek",
        "Margor", "Mirek", "Radmil", "Stana", "Vesnek", "Vlador", "Yaruk",
      ],
    },
  },
  {
    id: "elf",
    name: "Elf",
    flavor:
      "An elf of Davokar's Iron Pact. Vigilant, melancholic, sworn to keep the slumbering darkness asleep.",
    asi: {
      fixed: { wis: 2 },
      floating: { count: 1, size: 1, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 30,
    languages: { fixed: ["elvish", "trollish"], chooseFromHuman: true },
    providesHp: true,
    subchoices: {
      prompt: "Choose your life phase",
      options: [
        {
          id: "spring",
          name: "Spring Elf",
          flavor:
            "Newly woken from your first dormancy — youngest of the awakened, eager and unweighed by sleep. The forest is still strange to you, and you are strange to it.",
          features: [
            {
              name: "Newly Woken",
              description:
                "You carry your double-name from the first dormancy and have not yet renounced any part of it. Among elves, you are treated as a youth.",
            },
          ],
        },
        {
          id: "summer",
          name: "Summer Elf (Recommended)",
          flavor:
            "The vigilant hunter of the Iron Pact, in the prime phase of elven life. The default for player characters: armed with spear and bow, sworn to guard against the slumbering darkness.",
          features: [
            {
              name: "Iron Pact Veteran",
              description:
                "You are reckoned an active member of the Iron Pact's defensive force. Other elves recognize you on sight.",
            },
          ],
        },
        {
          id: "autumn",
          name: "Autumn Elf",
          flavor:
            "Older than most who walk among humans. The call of the deep sleep grows louder — you have stayed awake on purpose, and that purpose drives you.",
          features: [
            {
              name: "Hearing the Call",
              description:
                "You feel the pull of the second dormancy. At the GM's discretion, the call may grow strong in places of deep Corruption — adding flavor to scenes near the heart of Davokar.",
            },
          ],
        },
      ],
    },
    features: [
      {
        name: "Darkvision",
        description:
          "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.",
      },
      {
        name: "Pariahs",
        description:
          "You have disadvantage on Charisma checks with all humans. You can try to pass as a changeling by hiding your nature; on a Deception vs passive Insight, on a failure they recognize you as an elf.",
      },
      {
        name: "Wisdom of the Ages",
        description:
          "When you take an extended rest, you select a skill; you are proficient with that skill until your next extended rest.",
      },
    ],
    sampleNames: {
      male: ["Alal-Roak", "Doraei-Ri", "Eloan-Eo", "Elori", "Godrai", "Mearoel", "Saran-Ri", "Tel-Keriel", "Kil-Ano"],
      female: ["Ahara-Vei", "Eleanea", "Leiána", "Gaina-Anali", "Keri-Las", "Mael-Melian", "Naelial", "Tara-Kel", "Teara-Téana"],
    },
  },
  {
    id: "goblin",
    name: "Goblin",
    flavor:
      "Loud, scrappy, short-lived. Tolerated for the dirty work nobody else will do, and nimble in ways the bigger folk can never match.",
    asi: {
      fixed: { dex: 2 },
      floating: { count: 1, size: 1, rule: "any-other" },
    },
    hitDie: 6,
    size: "small",
    speed: 20,
    languages: { fixed: [], chooseFromHuman: true },
    providesHp: true,
    features: [
      {
        name: "Darkvision",
        description:
          "You can see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.",
      },
      {
        name: "Pariahs (Conditional)",
        description:
          "Disadvantage on Charisma checks with non-goblins; advantage when interacting with another goblin.",
      },
      {
        name: "Survival Instinct",
        description:
          "You can take Dash, Disengage, or Dodge as a bonus action. You also gain proficiency with Stealth and Survival.",
      },
    ],
    sampleNames: {
      male: ["Alfbolg", "Barra", "Goltas", "Illefons", "Ler", "Rosti", "Shigg", "Tengel", "Ul"],
      female: ["Aa", "Fosa", "Guhula", "Hugalea", "Tulga", "Udelia", "Ufa", "Wamba", "Yla", "Yppa"],
    },
  },
  {
    id: "human",
    name: "Human",
    flavor:
      "The folk of Ambria and the barbarian clans of Davokar — same stem, two cultures sundered by centuries.",
    asi: {
      fixed: { str: 2 },
      floating: { count: 1, size: 1, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 30,
    languages: { fixed: [], chooseFromHuman: true },
    providesHp: true,
    features: [],
    subchoices: {
      prompt: "Choose your culture",
      options: [
        {
          id: "ambrian",
          name: "Ambrian",
          flavor:
            "Citizen of Queen Korinthia's kingdom — disciplined, schooled, sociable.",
          asi: { int: 1 },
          features: [
            {
              name: "Educated",
              description: "Your Intelligence score increases by 1.",
            },
            {
              name: "Contacts",
              description:
                "Ambrians end up knowing many folk. With a successful DC 10 Charisma (Persuasion) check you can find a contact who can help with a specific question or precarious situation. Suitable factions: a barbarian clan, the Queen's Army, the Queen's Rangers, witches, Ordo Magica, the Church of Prios, a noble house, or treasure hunters.",
            },
          ],
        },
        {
          id: "barbarian",
          name: "Barbarian",
          flavor:
            "Of the clans of Davokar — close to the wild, taught to read the woods.",
          asi: { wis: 1 },
          features: [
            {
              name: "Bushcraft",
              description:
                "DC 10 Wis (Survival) finds food and water for you (and up to five others, +1 DC each) in the wilds — provided the group is not on the move.",
            },
            {
              name: "World-canny",
              description: "Your Wisdom score increases by 1.",
            },
          ],
        },
      ],
    },
    sampleNames: {
      male: ["Aro", "Beremo", "Demeon", "Edogai", "Gadramei", "Iasogoi", "Jomilo", "Karlio", "Malliano", "Peonio"],
      female: ["Abesina", "Elindra", "Elionara", "Levia", "Mehira", "Ordelia", "Revina", "Suria", "Variol", "Vidina"],
    },
  },
  {
    id: "ogre",
    name: "Ogre",
    flavor:
      "Misshapen kin to the trolls. Slow to anger, hard to break, raised in human or witch hands and rarely sure why.",
    asi: {
      fixed: { con: 2 },
      floating: { count: 1, size: 1, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 40,
    languages: { fixed: [], chooseFromHuman: true },
    providesHp: true,
    features: [
      {
        name: "Darkvision",
        description: "60 ft. of darkvision.",
      },
      {
        name: "Pariahs (Partial)",
        description:
          "Disadvantage on Charisma checks except with goblins and trolls (normal).",
      },
      {
        name: "Calmness",
        description:
          "Advantage on Wisdom saves against enchantments and other mind-altering magic.",
      },
      {
        name: "Tough Skin",
        description:
          "When rolling Hit Dice for HP, roll twice and use the higher result. If using the average value, use 6 instead.",
      },
    ],
    sampleNames: {
      neutral: ["Bauta", "Ugly", "Angry", "Odd", "Gawky", "Heavy", "Big Brute", "Roughneck", "Freak", "Oaf", "Ox", "Rageor"],
    },
  },
  {
    id: "troll",
    name: "Troll",
    flavor:
      "Born of the Underworld, raised in halls of song and slaughter. The strong are honored; the weak are taught what they are.",
    asi: {
      fixed: { str: 2 },
      floating: { count: 1, size: 1, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 40,
    languages: { fixed: ["trollish", "elvish"], chooseFromHuman: true },
    providesHp: true,
    features: [
      {
        name: "Darkvision",
        description: "60 ft. of darkvision.",
      },
      {
        name: "Pariah",
        description:
          "Humans fear you: any check involving a human has disadvantage. A successful Cha (Intimidation) check leaves humans frightened of you for one minute or until you leave their line of sight.",
      },
      {
        name: "Tough Skin",
        description:
          "Roll Hit Dice for HP twice and use the higher result. If using the average value, use 6.",
      },
    ],
    sampleNames: {
      neutral: [
        "Aka", "Aroha", "Erula", "Hibne", "Ogmaka", "Raham", "Riomata", "Skadal", "Verhar",
        "Aravarx", "Etaxa", "Noxar", "Ognyx", "Rirbax", "Vouax", "Uhux",
      ],
    },
  },
  {
    id: "undead",
    name: "Undead",
    flavor:
      "Dead — and yet not. A revenant, mind intact, body slowly decaying toward the final death. Hunted by Templars and Black Cloaks alike.",
    asi: {
      fixed: { con: 2 },
      floating: { count: 1, size: 1, rule: "any-other" },
    },
    hitDie: 8,
    size: "medium",
    speed: 30,
    languages: { fixed: [], chooseFromHuman: true },
    providesHp: true,
    features: [
      {
        name: "Darkvision",
        description: "60 ft. of darkvision.",
      },
      {
        name: "Undead",
        description:
          "You do not sleep, cannot eat normal food (only liquid), do not naturally heal on rests — instead you must drink blood or consume raw flesh during a long rest to spend a Hit Die. You can benefit from healing magic. Cha (Deception) vs passive Insight to fool living folk; Shadow-sight or detection magic still recognizes you.",
      },
      {
        name: "Physical Degeneration",
        description:
          "Permanent Corruption reduces current and maximum HP 1:1. You roll for marks of Corruption as normal.",
      },
      {
        name: "Disease & Poison Immunity",
        description: "You are immune to poison damage, the poisoned condition, and diseases.",
      },
    ],
    sampleNames: {
      neutral: ["(uses human names — see Human origin)"],
    },
  },
];

export const ORIGIN_BY_ID: Record<string, OriginDef> = Object.fromEntries(
  ORIGINS.map((o) => [o.id, o]),
);
