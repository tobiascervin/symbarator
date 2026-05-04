// Feats (boons & burdens, origin feats, class feats — PG p. 146–157).
//
// Three categories of feat live in one unified `FEATS` array, discriminated by
// `category`:
// - "boon"   — generic, anyone can take (PG p. 147). +1 to an ability via
//              `abilityBonus`.
// - "origin" — tied to specific origin(s) per PG p. 153 (Shadow-sight,
//              Change Self, Retribution, Ancient Magic, Tough and Stringy,
//              Big-boned, Robust, Ravenous Hunger).
// - "class"  — tied to a class (and sometimes an approach + class-level
//              floor + ability prerequisites) per PG p. 155–157.
//
// Burdens stay in their own catalog (BURDENS) — they have a different bonus
// shape (`+2` or `+1/+1` choose-two) and are taken at character creation
// only, never at level-up.
//
// `BOONS` and `BOON_BY_ID` remain as filtered views over `FEATS` so the L1
// boons step (`boons-burdens-step.tsx`) and pre-existing sheet/printable
// callsites continue to work unchanged. `FEAT_BY_ID` is the new unified
// lookup used by the level-up picker and the sheet's Feats list.

import type { BurdenDef, FeatDef } from "@/lib/character/types";

// ---------------------------------------------------------------------------
// Boons — PG p. 147 (36 entries)
// ---------------------------------------------------------------------------

const BOON_FEATS: ReadonlyArray<FeatDef> = [
  {
    id: "absolute-memory",
    category: "boon",
    name: "Absolute Memory",
    description:
      "You remember everything seen or heard. The GM must answer questions about details perceived during past adventures.",
    abilityBonus: { ability: "int", amount: 1 },
    prerequisiteText: "Dwarves cannot take this boon (already part of their origin).",
    restriction: "Dwarves cannot take this boon (already part of their origin).",
    forbiddenOriginIds: ["dwarf"],
  },
  {
    id: "archivist",
    category: "boon",
    name: "Archivist",
    description:
      "Trained to organize and search information. Advantage on Intelligence (Investigation) checks when researching in archives and libraries.",
    abilityBonus: { ability: "int", amount: 1 },
  },
  {
    id: "augur",
    category: "boon",
    name: "Augur",
    description:
      "You see signs others miss. When you learn a divination spell as a ritual you gain one less permanent Corruption (min 1) than normal.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "beast-tongue",
    category: "boon",
    name: "Beast Tongue",
    description:
      "You can speak to creatures of the Beasts category. They answer questions but do not perform services.",
    abilityBonus: { ability: "wis", amount: 1 },
    prerequisiteText: "Goblins cannot take this boon (already part of their origin).",
    restriction: "Goblins cannot take this boon (already part of their origin).",
    forbiddenOriginIds: ["goblin"],
  },
  {
    id: "bloodhound",
    category: "boon",
    name: "Bloodhound",
    description:
      "Advantage on Wisdom (Perception or Survival) checks when pursuing a specific individual.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "blood-ties",
    category: "boon",
    name: "Blood Ties",
    description:
      "A mystical blood tie to a creature of a different origin. You can later choose a feat belonging to that origin.",
    abilityBonus: { ability: "choice", amount: 1 },
    abilityBonusChoices: ["str", "dex", "con", "int", "wis", "cha"],
  },
  {
    id: "cat-burglar",
    category: "boon",
    name: "Cat Burglar",
    description:
      "Trained to open locks, latches, and bolts; disarm traps. Proficient with thieves' tools.",
    abilityBonus: { ability: "dex", amount: 1 },
  },
  {
    id: "commanding-voice",
    category: "boon",
    name: "Commanding Voice",
    description:
      "A loud, clear voice that rises above battle noise. As a bonus action, allies within 60 ft. who can hear you gain advantage on Charisma saves until your next turn.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "con-artist",
    category: "boon",
    name: "Con Artist",
    description:
      "Trained to twist the truth. Advantage on Deception and Insight checks regarding lies — but the lies hold up only briefly.",
    abilityBonus: { ability: "choice", amount: 1 },
    abilityBonusChoices: ["wis", "cha"],
  },
  {
    id: "contacts",
    category: "boon",
    name: "Contacts",
    description:
      "A web of contacts across an organization or region. DC 10 Cha check to call in a favor — small, never directly endangering.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "double-tongue",
    category: "boon",
    name: "Double-tongue",
    description:
      "Speak the secret cant of the Yndaros Thieves' Guild. With other speakers, hold sensitive conversations in front of outsiders.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "enduring-march",
    category: "boon",
    name: "Enduring March",
    description: "Advantage on Constitution saves during forced marches.",
    abilityBonus: { ability: "con", amount: 1 },
  },
  {
    id: "enterprise",
    category: "boon",
    name: "Enterprise",
    description:
      "You own a small business — a tavern, store, or theater. During an extended rest you can roll a profit check (DC 15 Int or Cha).",
    abilityBonus: { ability: "choice", amount: 1 },
    abilityBonusChoices: ["int", "cha"],
  },
  {
    id: "escape-artist",
    category: "boon",
    name: "Escape Artist",
    description:
      "Loose joints, trained in slipping. Advantage on attempts to escape bonds, traps, snares, or grapples.",
    abilityBonus: { ability: "dex", amount: 1 },
  },
  {
    id: "false-identity",
    category: "boon",
    name: "False Identity",
    description:
      "A complete cover identity, papers, and back-story. Cannot be exposed except by its creator.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "fire-forged",
    category: "boon",
    name: "Fire Forged",
    description:
      "Born under a celestial sign or sole survivor of a fire. You are resistant to fire damage.",
    abilityBonus: { ability: "con", amount: 1 },
  },
  {
    id: "fleet-footed",
    category: "boon",
    name: "Fleet-footed",
    description:
      "You move at unusually high speed and can use a bonus action to Dash.",
    abilityBonus: { ability: "str", amount: 1 },
  },
  {
    id: "forbidden-knowledge",
    category: "boon",
    name: "Forbidden Knowledge",
    description:
      "Secrets of artifact-crafting. During extended rest, you can create a lesser artifact.",
    abilityBonus: { ability: "int", amount: 1 },
    prerequisiteText: "12th level or higher",
    prerequisite: "12th level or higher",
  },
  {
    id: "forceful-personality",
    category: "boon",
    name: "Forceful Personality",
    description:
      "Effective at threats and intimidation. Advantage on Cha (Intimidation/Persuasion) for threats and coercion. Victim may retaliate later.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "green-thumb",
    category: "boon",
    name: "Green Thumb",
    description:
      "Mystical connection to growing things. Advantage on Wis (Survival) checks for orienting and finding food/shelter.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "heirloom",
    category: "boon",
    name: "Heirloom",
    description:
      "A family heirloom — a weapon or armor from the lists costing 50 thaler or less, acquired without paying.",
    abilityBonus: { ability: "str", amount: 1 },
  },
  {
    id: "hideouts",
    category: "boon",
    name: "Hideouts",
    description:
      "You know of and have access to a series of safe houses. DC 15 Int check to recall the nearest.",
    abilityBonus: { ability: "int", amount: 1 },
  },
  {
    id: "impressionist",
    category: "boon",
    name: "Impressionist",
    description:
      "A skilled impersonator. Advantage on Int/Cha checks impersonating types of people.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "manipulator",
    category: "boon",
    name: "Manipulator",
    description:
      "Skilled at flattery and threat. Advantage on Charisma checks for manipulation if you have time.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "medium",
    category: "boon",
    name: "Medium",
    description:
      "Grew up in the presence of ghosts. Advantage on saving throws and ability checks regarding spirits or the spirit world.",
  },
  {
    id: "mirage",
    category: "boon",
    name: "Mirage",
    description:
      "A mystical gift for weaving momentary illusions from thin air — including casting prestidigitation without gaining Corruption. Can dupe people into accepting illusory goods (opposed Cha (Deception) vs Wis (Insight), max 'value' 100 thaler) and grants advantage on a Cha check when threatening with 'powerful magic'.",
  },
  {
    id: "pack-mule",
    category: "boon",
    name: "Pack-mule",
    description: "Carry equipment weighing up to 20× your Strength score in pounds.",
    abilityBonus: { ability: "str", amount: 1 },
  },
  {
    id: "pathfinder",
    category: "boon",
    name: "Pathfinder",
    description:
      "Well-tuned senses for spotting and following tracks. Advantage on Wisdom (Survival) checks when trying to follow a trail or find the way to or back from a place.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "pet",
    category: "boon",
    name: "Pet",
    description:
      "A trusty animal friend (any beast of CR 1/4 or less). Played as a second character; uses your bonus action to act on its turn (immediately after yours). Doesn't gain XP or develop stats; if it dies, replaced at the start of the next adventure.",
  },
  {
    id: "poison-resilient",
    category: "boon",
    name: "Poison Resilient",
    description:
      "Resistance to poison damage; advantage on saves against the poisoned condition.",
    abilityBonus: { ability: "con", amount: 1 },
  },
  {
    id: "servant",
    category: "boon",
    name: "Servant",
    description:
      "A loyal personal servant (an attendant, serf, etc.). Performs simple chores, stands guard, conveys messages — but won't help in dangerous situations. Played by the GM with a suitable personality.",
  },
  {
    id: "shadow-spawn",
    category: "boon",
    name: "Shadow Spawn",
    description:
      "Born during a solar eclipse, shadows favor you. Advantage on Dex checks when sneaking or hiding.",
    abilityBonus: { ability: "dex", amount: 1 },
  },
  {
    id: "soulmate",
    category: "boon",
    name: "Soulmate",
    description:
      "Telepathically share simple messages and feelings with a soulmate (NPC or another player's character). Always know roughly where they are and if they are in trouble. If the soulmate dies, after a period of grieving you gain +2 to an ability score of your choice as you redirect your energies.",
  },
  {
    id: "storyteller",
    category: "boon",
    name: "Storyteller",
    description:
      "A gifted storyteller. Advantage on Cha (Deception/Performance) checks when weaving credible stories.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "telltale",
    category: "boon",
    name: "Telltale",
    description:
      "Ear and tongue for gossip. Advantage on all Cha or Wis checks regarding rumors.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "tough",
    category: "boon",
    name: "Tough",
    description: "A tough body and a strong soul. Advantage on death saving throws.",
    abilityBonus: { ability: "con", amount: 1 },
  },
];

// ---------------------------------------------------------------------------
// Origin feats — PG p. 153 (8 entries)
// ---------------------------------------------------------------------------

const ORIGIN_FEATS: ReadonlyArray<FeatDef> = [
  {
    id: "shadow-sight",
    category: "origin",
    name: "Shadow-sight",
    description:
      "Your eyes pierce magical darkness. You can see normally through magical and non-magical darkness up to 60 feet, and discern creatures in dim light without disadvantage on Perception checks that rely on sight.",
    origins: ["abducted-human", "human"],
  },
  {
    id: "change-self",
    category: "origin",
    name: "Change Self",
    description:
      "Changeling shapeshifting (PG p. 153). Once per long rest, spend 1 minute reshaping your physical features to mimic a humanoid of similar size, gaining advantage on Charisma (Deception) checks made to pass as that person until you next finish a long rest.",
    origins: ["changeling"],
  },
  {
    id: "retribution",
    category: "origin",
    name: "Retribution",
    description:
      "When a creature within 5 feet of you reduces an ally to 0 hit points, you may use your reaction to make one melee weapon attack against that creature with advantage.",
    origins: ["dwarf"],
  },
  {
    id: "ancient-magic",
    category: "origin",
    name: "Ancient Magic",
    description:
      "Elven roots run deep with old magic. You learn one wizard cantrip of your choice. Intelligence is your spellcasting ability for it.",
    origins: ["elf"],
  },
  {
    id: "tough-and-stringy",
    category: "origin",
    name: "Tough and Stringy",
    description:
      "Resistant to deprivation. You can go three times as long as normal without food or water before suffering exhaustion, and you have advantage on Constitution saves to resist disease.",
    origins: ["goblin"],
  },
  {
    id: "big-boned",
    category: "origin",
    name: "Big-boned",
    description:
      "Your massive frame counts as one size larger when determining your carrying capacity and the weight you can push, drag, or lift. Increase your Strength by 1 (max 20).",
    abilityBonus: { ability: "str", amount: 1 },
    origins: ["ogre"],
  },
  {
    id: "robust",
    category: "origin",
    name: "Robust",
    description:
      "Hardy by nature. Your maximum hit points increase by an amount equal to twice your level when you take this feat, and you gain +1 hit point each time you level up thereafter.",
    origins: ["troll"],
  },
  {
    id: "ravenous-hunger",
    category: "origin",
    name: "Ravenous Hunger",
    description:
      "Once per long rest, after you reduce a creature to 0 hit points with a melee attack, you may use a bonus action to feed and regain hit points equal to your character level.",
    origins: ["undead"],
  },
];

// ---------------------------------------------------------------------------
// Class feats — PG p. 155–157
// ---------------------------------------------------------------------------

const CLASS_FEATS: ReadonlyArray<FeatDef> = [
  // Captain (PG p. 155)
  {
    id: "battle-speech",
    category: "class",
    classId: "captain",
    name: "Battle Speech",
    description:
      "When you take the Help action to grant an ally advantage on an attack roll or ability check, you may also grant them temporary hit points equal to your Charisma modifier (min 1).",
    prerequisiteText: "Charisma 13 or higher",
    minAbilityScores: { cha: 13 },
  },
  {
    id: "command-expert",
    category: "class",
    classId: "captain",
    name: "Command Expert",
    description:
      "Your tactical orders ring out clearly. Once per short rest, as a bonus action you may direct an ally within 60 ft. who can hear you to immediately use their reaction to make a single weapon attack with advantage.",
  },
  {
    id: "parry",
    category: "class",
    classId: "captain",
    name: "Parry",
    description:
      "When a creature you can see hits you with a melee attack, you may use your reaction and spend 1 superiority die (or — if you have no such pool — your proficiency bonus) to reduce the damage by that amount.",
    prerequisiteText: "Strength or Dexterity 13 or higher",
    minAbilityScores: { str: 13 },
  },

  // Hunter (PG p. 155)
  {
    id: "overwatch",
    category: "class",
    classId: "hunter",
    name: "Overwatch",
    description:
      "You can ready a ranged weapon attack with finer triggers than the standard rule allows: as a bonus action, designate up to three triggers (e.g., 'enemy crosses the doorway,' 'enemy casts a spell'). The first trigger to fire spends your reaction and the readied attack.",
  },
  {
    id: "ranged-expert",
    category: "class",
    classId: "hunter",
    name: "Ranged Expert",
    description:
      "Being within 5 feet of a hostile creature doesn't impose disadvantage on your ranged weapon attack rolls, and you ignore half cover when making ranged weapon attacks.",
  },
  {
    id: "trick-shot",
    category: "class",
    classId: "hunter",
    name: "Trick Shot",
    description:
      "Once per short rest, you may attempt a called shot with a ranged weapon: declare a body part or object before the attack roll. On a hit, the attack imposes a relevant condition (disarm, knock prone, blind for a round) chosen with the GM in addition to its damage.",
    prerequisiteText: "Dexterity 13 or higher",
    minAbilityScores: { dex: 13 },
  },

  // Mystic (PG p. 156)
  {
    id: "combat-magic-expert",
    category: "class",
    classId: "mystic",
    name: "Combat Magic Expert",
    description:
      "You become more resilient when channeling magic in melee. You gain a pool of d6 equal to your spellcasting ability modifier (min 1) that resets on a long rest; spend a die to add it to a Concentration save or to a damage roll for a spell attack.",
  },
  {
    id: "confessor",
    category: "class",
    classId: "mystic",
    approachId: "theurg",
    name: "Confessor",
    description:
      "You may use your action to absolve an ally of one point of permanent Corruption per long rest, transferring it to yourself instead. The transferred Corruption is permanent for you.",
    prerequisiteText: "Theurg approach, class level 11+",
    minClassLevel: 11,
    excludesFeatIds: ["inquisitor"],
  },
  {
    id: "dedicated-focus",
    category: "class",
    classId: "mystic",
    name: "Dedicated Focus",
    description:
      "You have advantage on Concentration saving throws to maintain a spell.",
    prerequisiteText: "Spellcasting ability 13 or higher",
    minSpellcastingAbility: 13,
  },
  {
    id: "demonologist",
    category: "class",
    classId: "mystic",
    approachId: "sorcerer",
    name: "Demonologist",
    description:
      "Your dealings with the planar beyond grant you binding magic. You may cast `summon-fiend` (or an equivalent demonic-binding spell on your tradition list) once per long rest without expending a spell slot.",
    prerequisiteText: "Sorcerer approach, class level 7+",
    minClassLevel: 7,
  },
  {
    id: "extensive-learning",
    category: "class",
    classId: "mystic",
    name: "Extensive Learning",
    description:
      "Your studies have grown deeper. You learn one additional spell of any level you have spell slots for from your tradition list.",
    prerequisiteText: "Spellcasting ability 13 or higher (may be taken more than once)",
    minSpellcastingAbility: 13,
  },
  {
    id: "inquisitor",
    category: "class",
    classId: "mystic",
    approachId: "theurg",
    name: "Inquisitor",
    description:
      "Your zeal hardens against the unfaithful. You have advantage on attack rolls against creatures of the Unliving or Demon types, and once per short rest you can deal an extra die of damage on a successful spell attack.",
    prerequisiteText: "Theurg approach, class level 11+ — cannot be combined with Confessor",
    minClassLevel: 11,
    excludesFeatIds: ["confessor"],
  },
  {
    id: "necromancer",
    category: "class",
    classId: "mystic",
    approachId: "sorcerer",
    name: "Necromancer",
    description:
      "You have learned to call upon the dead. You may cast `animate-dead` once per long rest without expending a spell slot, and undead you raise have advantage on saves against being turned.",
    prerequisiteText: "Sorcerer approach, class level 9+",
    minClassLevel: 9,
  },
  {
    id: "pyromancer",
    category: "class",
    classId: "mystic",
    approachId: "wizard",
    name: "Pyromancer",
    description:
      "You add fire damage to your spells: when you cast a spell that deals damage, you may convert its damage type to fire. When you do, the spell deals an additional 1d6 fire damage on a hit.",
    prerequisiteText: "Wizard approach, class level 9+",
    minClassLevel: 9,
  },
  {
    id: "secrets-of-the-order",
    category: "class",
    classId: "mystic",
    approachId: "staff-mage",
    name: "Secrets of the Order",
    description:
      "You learn one secret rite of the Staff Mage Order — choose one: ward, far-sight, or invocation — granting a once-per-long-rest casting of the chosen rite without expending a spell slot.",
    prerequisiteText: "Staff Mage approach, class level 11+",
    minClassLevel: 11,
  },

  // Scoundrel (PG p. 156)
  {
    id: "nimble",
    category: "class",
    classId: "scoundrel",
    name: "Nimble",
    description:
      "You ignore difficult terrain caused by undergrowth, debris, and water no deeper than your knees. You also gain a +5 ft. bonus to your walking speed.",
    prerequisiteText: "Dexterity 13 or higher",
    minAbilityScores: { dex: 13 },
  },
  {
    id: "shadow-walker",
    category: "class",
    classId: "scoundrel",
    name: "Shadow Walker",
    description:
      "When you are in dim light or darkness, you can use a bonus action to teleport up to 30 feet to another spot in dim light or darkness you can see.",
    prerequisiteText: "Dexterity 13 or higher",
    minAbilityScores: { dex: 13 },
  },
  {
    id: "skirmish-expert",
    category: "class",
    classId: "scoundrel",
    name: "Skirmish Expert",
    description:
      "When you Disengage as a bonus action and move at least 10 feet away from a hostile creature, you gain temporary hit points equal to your level.",
  },

  // Warrior (PG p. 157)
  {
    id: "bull-rush",
    category: "class",
    classId: "warrior",
    name: "Bull Rush",
    description:
      "When you take the Dash action, you may make one shove (push or knock prone) attempt as a bonus action against a creature within 5 feet at the end of the move.",
    prerequisiteText: "Strength 13 or higher",
    minAbilityScores: { str: 13 },
  },
  {
    id: "grappler",
    category: "class",
    classId: "warrior",
    name: "Grappler",
    description:
      "You have advantage on attack rolls against a creature you are grappling, and you can use your action to pin a creature you've grappled — the target is restrained as long as the grapple holds.",
    prerequisiteText: "Strength 13 or higher",
    minAbilityScores: { str: 13 },
  },
  {
    id: "melee-expert",
    category: "class",
    classId: "warrior",
    name: "Melee Expert",
    description:
      "When you score a critical hit with a melee weapon attack, you may make one additional weapon attack against the same target as part of the same action.",
  },
];

// ---------------------------------------------------------------------------
// Unified catalog + lookups
// ---------------------------------------------------------------------------

export const FEATS: ReadonlyArray<FeatDef> = [
  ...BOON_FEATS,
  ...ORIGIN_FEATS,
  ...CLASS_FEATS,
];

export const FEAT_BY_ID: Record<string, FeatDef> = Object.fromEntries(
  FEATS.map((f) => [f.id, f]),
);

/** Boons-only filtered view — preserves existing imports in the L1 boons step
 *  and elsewhere that only ever cared about boons. */
export const BOONS: ReadonlyArray<FeatDef> = FEATS.filter(
  (f) => f.category === "boon",
);

export const BOON_BY_ID: Record<string, FeatDef> = Object.fromEntries(
  BOONS.map((b) => [b.id, b]),
);

// Module-load assertion: catalog ids are unique. Catches data drift early.
(() => {
  const seen = new Set<string>();
  for (const f of FEATS) {
    if (seen.has(f.id)) {
      throw new Error(`Duplicate feat id: ${f.id}`);
    }
    seen.add(f.id);
  }
})();

// ---------------------------------------------------------------------------
// Burdens — PG p. 151
// ---------------------------------------------------------------------------

export const BURDENS: ReadonlyArray<BurdenDef> = [
  {
    id: "addiction",
    name: "Addiction",
    description:
      "An addiction whose drug determines the bonus's flavor (wine → Con, dream snuff → Wis, daft root or similar → Str). Each day without the drug requires a DC 10 Wis save or a level of exhaustion (no non-magical recovery). After five days you can begin to recover normally and become free once exhaustion is gone; thereafter only one save per month, or on a triggering event (GM's call).",
    abilityBonus: { kind: "choose-one", amount: 2 },
  },
  {
    id: "arch-enemy",
    name: "Arch Enemy",
    description:
      "Your actions or name have made you a personal enemy of someone whose existence has come to revolve around destroying — and ultimately taking — your life. At least once each adventure, the arch enemy's influence shows: thugs, lies, schemes. Avoidable, but never fully gone.",
    abilityBonus: { kind: "fixed", ability: "cha", amount: 2 },
  },
  {
    id: "bestial",
    name: "Bestial",
    description:
      "A bestial appearance (jakaar eyes, amber tusks, lindworm scales — pick a few) that arouses fear and disgust. Concealing it requires a DC 10 Cha save; failure imposes disadvantage on Charisma (Deception, Performance, Persuasion). The bestial exterior grants advantage on Charisma (Intimidation). If your intimidation succeeds, those targeted will report you to the Town Watch (or similar) as a suspected abomination.",
    abilityBonus: { kind: "fixed", ability: "con", amount: 2 },
  },
  {
    id: "bloodthirst",
    name: "Bloodthirst",
    description:
      "A thirst for blood, easily awoken and hard to quench. When you take damage, the thirst arises and you will not spare any enemy — not even if they surrender. Sparing one requires a DC 20 Wisdom saving throw.",
    abilityBonus: { kind: "fixed", ability: "str", amount: 2 },
  },
  {
    id: "code-of-honor",
    name: "Code of Honor",
    description:
      "A strict code of honor that is especially burdensome in combat. The code might require defeating all opponents, never standing down from a fight, or that every battle be honorable and one-on-one. Work with your GM to define the specifics.",
    abilityBonus: { kind: "fixed", ability: "wis", amount: 2 },
  },
  {
    id: "dark-blood",
    name: "Dark Blood",
    description:
      "Dark blood from an ancestor or a curse runs through your veins. You always carry one of the Marks of Corruption (PG p. 38); the listed mark is permanent. You may take feats granting monstrous traits (Natural Weapon, Armored, Robust, Regeneration, Wings — see Ruins of Symbaroum Bestiary) and gain 2 additional permanent Corruption each time you do.",
    abilityBonus: { kind: "choose-two", amount: 1 },
    startingCorruption: 2,
  },
  {
    id: "dark-secret",
    name: "Dark Secret",
    description:
      "A secret that would destroy your reputation and life if revealed (cult member, killer, undiscovered murderer…). If known and cared about, suffer disadvantage on Cha checks against those who know. Once per adventure, a DC 10 ability check (ability and circumstance set by the GM) is made to see if a clue surfaces; failure means the secret is in danger of being exposed.",
    abilityBonus: { kind: "fixed", ability: "cha", amount: 2 },
  },
  {
    id: "elderly",
    name: "Elderly",
    description:
      "Past your prime, with good and bad days. The first ability check of the day determines: success = good day; failure = bad day, and you have disadvantage on ability checks until the next successful check ends the effect.",
    abilityBonus: { kind: "fixed", ability: "wis", amount: 2 },
  },
  {
    id: "impulsive",
    name: "Impulsive",
    description:
      "You act before thinking — once your character declares an action, you cannot have second thoughts. The only way to restrain yourself is to take a point of temporary Corruption as your inner conflict allows darkness to seep in.",
    abilityBonus: { kind: "choose-one", from: ["str", "cha"], amount: 2 },
  },
  {
    id: "nightmares",
    name: "Nightmares",
    description:
      "Haunted by nightmares each night — perhaps from past experience, more abstract reasons, or a family curse. Each night, pass a DC 10 Constitution save or gain a level of exhaustion.",
    abilityBonus: { kind: "fixed", ability: "con", amount: 2 },
  },
  {
    id: "mystical-mark",
    name: "Mystical Mark",
    description:
      "A mystical mark on your body — a birthmark or scar — that requires effort to conceal. Whatever its origin, you risk being mistaken for having a blight-mark. When relevant, pass an opposed Cha (Deception) vs Wis (Perception) check or attract unwanted attention (which can take many forms).",
    abilityBonus: { kind: "fixed", ability: "cha", amount: 2 },
  },
  {
    id: "seizures",
    name: "Seizures",
    description:
      "A sensitive mind: when excited or stressed, violent cramps overtake you and you become stunned for 1d4 rounds. Afterwards you gain 1 level of exhaustion.",
    abilityBonus: { kind: "choose-one", from: ["int", "wis"], amount: 2 },
  },
  {
    id: "sickly",
    name: "Sickly",
    description:
      "A chronic disease that weakens you but also gives insight into healing and the body's structure. Normally your weakness doesn't show, but death saving throws are at disadvantage.",
    abilityBonus: { kind: "fixed", ability: "wis", amount: 2 },
  },
  {
    id: "slow",
    name: "Slow",
    description:
      "You move at an unusually slow pace. Reduce your base speed by 10 feet, to a minimum of 10 feet.",
    abilityBonus: { kind: "fixed", ability: "wis", amount: 2 },
  },
  {
    id: "wanted",
    name: "Wanted",
    description:
      "Wanted for some kind of serious crime, justly or falsely accused. You risk being recognized and hunted — once per adventure, pass a DC 10 Cha (Deception) check to avoid being identified by authorities.",
    abilityBonus: { kind: "fixed", ability: "cha", amount: 2 },
  },
  {
    id: "ward",
    name: "Ward",
    description:
      "You are responsible for another person — a beloved child, an elderly but respected mentor, a soulmate, or just an annoying relative tied to a future inheritance. You pay their lifestyle expenses and must sometimes attend to them directly. If the ward dies or goes missing, sorrow and remorse mirror this burden into a related one (Addiction or Nightmares for protective wards; Wanted or Arch Enemy for personal-gain wards).",
    abilityBonus: { kind: "choose-one", from: ["int", "cha"], amount: 2 },
  },
];

export const BURDEN_BY_ID: Record<string, BurdenDef> = Object.fromEntries(
  BURDENS.map((b) => [b.id, b]),
);
