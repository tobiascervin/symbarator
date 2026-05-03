// Boons & Burdens (PG p. 147–155). Full canonical set: 36 boons (PG p. 147)
// and 16 burdens (PG p. 151). Boons may grant +1 to an ability via
// `abilityBonus`; burden +2/+1+1 ability bonuses are noted in the description
// only and are NOT yet wired through `computeFinalAbilities` — pick this up
// in a follow-up if/when the L1 burden mechanic should bump stats.

import type { BoonDef, BurdenDef } from "@/lib/character/types";

export const BOONS: ReadonlyArray<BoonDef> = [
  {
    id: "absolute-memory",
    name: "Absolute Memory",
    description:
      "You remember everything seen or heard. The GM must answer questions about details perceived during past adventures.",
    abilityBonus: { ability: "int", amount: 1 },
    restriction: "Dwarves cannot take this boon (already part of their origin).",
  },
  {
    id: "archivist",
    name: "Archivist",
    description:
      "Trained to organize and search information. Advantage on Intelligence (Investigation) checks when researching in archives and libraries.",
    abilityBonus: { ability: "int", amount: 1 },
  },
  {
    id: "augur",
    name: "Augur",
    description:
      "You see signs others miss. When you learn a divination spell as a ritual you gain one less permanent Corruption (min 1) than normal.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "beast-tongue",
    name: "Beast Tongue",
    description:
      "You can speak to creatures of the Beasts category. They answer questions but do not perform services.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "bloodhound",
    name: "Bloodhound",
    description:
      "Advantage on Wisdom (Perception or Survival) checks when pursuing a specific individual.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "blood-ties",
    name: "Blood Ties",
    description:
      "A mystical blood tie to a creature of a different origin. You can later choose a feat belonging to that origin.",
    abilityBonus: { ability: "choice", amount: 1 },
    abilityBonusChoices: ["str", "dex", "con", "int", "wis", "cha"],
  },
  {
    id: "cat-burglar",
    name: "Cat Burglar",
    description:
      "Trained to open locks, latches, and bolts; disarm traps. Proficient with thieves' tools.",
    abilityBonus: { ability: "dex", amount: 1 },
  },
  {
    id: "commanding-voice",
    name: "Commanding Voice",
    description:
      "A loud, clear voice that rises above battle noise. As a bonus action, allies within 60 ft. who can hear you gain advantage on Charisma saves until your next turn.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "con-artist",
    name: "Con Artist",
    description:
      "Trained to twist the truth. Advantage on Deception and Insight checks regarding lies — but the lies hold up only briefly.",
    abilityBonus: { ability: "choice", amount: 1 },
    abilityBonusChoices: ["wis", "cha"],
  },
  {
    id: "contacts",
    name: "Contacts",
    description:
      "A web of contacts across an organization or region. DC 10 Cha check to call in a favor — small, never directly endangering.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "double-tongue",
    name: "Double-tongue",
    description:
      "Speak the secret cant of the Yndaros Thieves' Guild. With other speakers, hold sensitive conversations in front of outsiders.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "enduring-march",
    name: "Enduring March",
    description:
      "Advantage on Constitution saves during forced marches.",
    abilityBonus: { ability: "con", amount: 1 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "You own a small business — a tavern, store, or theater. During an extended rest you can roll a profit check (DC 15 Int or Cha).",
    abilityBonus: { ability: "choice", amount: 1 },
    abilityBonusChoices: ["int", "cha"],
  },
  {
    id: "escape-artist",
    name: "Escape Artist",
    description:
      "Loose joints, trained in slipping. Advantage on attempts to escape bonds, traps, snares, or grapples.",
    abilityBonus: { ability: "dex", amount: 1 },
  },
  {
    id: "false-identity",
    name: "False Identity",
    description:
      "A complete cover identity, papers, and back-story. Cannot be exposed except by its creator.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "fire-forged",
    name: "Fire Forged",
    description:
      "Born under a celestial sign or sole survivor of a fire. You are resistant to fire damage.",
    abilityBonus: { ability: "con", amount: 1 },
  },
  {
    id: "fleet-footed",
    name: "Fleet-footed",
    description:
      "You move at unusually high speed and can use a bonus action to Dash.",
    abilityBonus: { ability: "str", amount: 1 },
  },
  {
    id: "forbidden-knowledge",
    name: "Forbidden Knowledge",
    description:
      "Secrets of artifact-crafting. During extended rest, you can create a lesser artifact.",
    abilityBonus: { ability: "int", amount: 1 },
    prerequisite: "12th level or higher",
  },
  {
    id: "forceful-personality",
    name: "Forceful Personality",
    description:
      "Effective at threats and intimidation. Advantage on Cha (Intimidation/Persuasion) for threats and coercion. Victim may retaliate later.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "green-thumb",
    name: "Green Thumb",
    description:
      "Mystical connection to growing things. Advantage on Wis (Survival) checks for orienting and finding food/shelter.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "heirloom",
    name: "Heirloom",
    description:
      "A family heirloom — a weapon or armor from the lists costing 50 thaler or less, acquired without paying.",
    abilityBonus: { ability: "str", amount: 1 },
  },
  {
    id: "hideouts",
    name: "Hideouts",
    description:
      "You know of and have access to a series of safe houses. DC 15 Int check to recall the nearest.",
    abilityBonus: { ability: "int", amount: 1 },
  },
  {
    id: "impressionist",
    name: "Impressionist",
    description:
      "A skilled impersonator. Advantage on Int/Cha checks impersonating types of people.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "manipulator",
    name: "Manipulator",
    description:
      "Skilled at flattery and threat. Advantage on Charisma checks for manipulation if you have time.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "medium",
    name: "Medium",
    description:
      "Grew up in the presence of ghosts. Advantage on saving throws and ability checks regarding spirits or the spirit world.",
  },
  {
    id: "mirage",
    name: "Mirage",
    description:
      "A mystical gift for weaving momentary illusions from thin air — including casting prestidigitation without gaining Corruption. Can dupe people into accepting illusory goods (opposed Cha (Deception) vs Wis (Insight), max 'value' 100 thaler) and grants advantage on a Cha check when threatening with 'powerful magic'.",
  },
  {
    id: "pack-mule",
    name: "Pack-mule",
    description:
      "Carry equipment weighing up to 20× your Strength score in pounds.",
    abilityBonus: { ability: "str", amount: 1 },
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    description:
      "Well-tuned senses for spotting and following tracks. Advantage on Wisdom (Survival) checks when trying to follow a trail or find the way to or back from a place.",
    abilityBonus: { ability: "wis", amount: 1 },
  },
  {
    id: "pet",
    name: "Pet",
    description:
      "A trusty animal friend (any beast of CR 1/4 or less). Played as a second character; uses your bonus action to act on its turn (immediately after yours). Doesn't gain XP or develop stats; if it dies, replaced at the start of the next adventure.",
  },
  {
    id: "poison-resilient",
    name: "Poison Resilient",
    description:
      "Resistance to poison damage; advantage on saves against the poisoned condition.",
    abilityBonus: { ability: "con", amount: 1 },
  },
  {
    id: "servant",
    name: "Servant",
    description:
      "A loyal personal servant (an attendant, serf, etc.). Performs simple chores, stands guard, conveys messages — but won't help in dangerous situations. Played by the GM with a suitable personality.",
  },
  {
    id: "shadow-spawn",
    name: "Shadow Spawn",
    description:
      "Born during a solar eclipse, shadows favor you. Advantage on Dex checks when sneaking or hiding.",
    abilityBonus: { ability: "dex", amount: 1 },
  },
  {
    id: "soulmate",
    name: "Soulmate",
    description:
      "Telepathically share simple messages and feelings with a soulmate (NPC or another player's character). Always know roughly where they are and if they are in trouble. If the soulmate dies, after a period of grieving you gain +2 to an ability score of your choice as you redirect your energies.",
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description:
      "A gifted storyteller. Advantage on Cha (Deception/Performance) checks when weaving credible stories.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "telltale",
    name: "Telltale",
    description:
      "Ear and tongue for gossip. Advantage on all Cha or Wis checks regarding rumors.",
    abilityBonus: { ability: "cha", amount: 1 },
  },
  {
    id: "tough",
    name: "Tough",
    description: "A tough body and a strong soul. Advantage on death saving throws.",
    abilityBonus: { ability: "con", amount: 1 },
  },
];

export const BURDENS: ReadonlyArray<BurdenDef> = [
  {
    id: "addiction",
    name: "Addiction",
    description:
      "Bonus: +2 to an ability score (drug determines which: wine → Con, dream snuff → Wis, daft root or similar → Str). Each day without the drug requires a DC 10 Wis save or a level of exhaustion (no non-magical recovery). After five days you can begin to recover normally and become free once exhaustion is gone; thereafter only one save per month, or on a triggering event (GM's call).",
  },
  {
    id: "arch-enemy",
    name: "Arch Enemy",
    description:
      "Bonus: +2 Charisma. Your actions or name have made you a personal enemy of someone whose existence has come to revolve around destroying — and ultimately taking — your life. At least once each adventure, the arch enemy's influence shows: thugs, lies, schemes. Avoidable, but never fully gone.",
  },
  {
    id: "bestial",
    name: "Bestial",
    description:
      "Bonus: +2 Constitution. You have a bestial appearance (jakaar eyes, amber tusks, lindworm scales — pick a few) that arouses fear and disgust. Concealing it requires a DC 10 Cha save; failure imposes disadvantage on Charisma (Deception, Performance, Persuasion). The bestial exterior grants advantage on Charisma (Intimidation). If your intimidation succeeds, those targeted will report you to the Town Watch (or similar) as a suspected abomination.",
  },
  {
    id: "bloodthirst",
    name: "Bloodthirst",
    description:
      "Bonus: +2 Strength. A thirst for blood, easily awoken and hard to quench. When you take damage, the thirst arises and you will not spare any enemy — not even if they surrender. Sparing one requires a DC 20 Wisdom saving throw.",
  },
  {
    id: "code-of-honor",
    name: "Code of Honor",
    description:
      "Bonus: +2 Wisdom. A strict code of honor that is especially burdensome in combat. The code might require defeating all opponents, never standing down from a fight, or that every battle be honorable and one-on-one. Work with your GM to define the specifics.",
  },
  {
    id: "dark-blood",
    name: "Dark Blood",
    description:
      "Bonus: +1 to two different ability scores of your choice, +2 to permanent Corruption. Dark blood from an ancestor or a curse runs through your veins. You always carry one of the Marks of Corruption (PG p. 38); the listed mark is permanent. You may take feats granting monstrous traits (Natural Weapon, Armored, Robust, Regeneration, Wings — see Ruins of Symbaroum Bestiary) and gain 2 additional permanent Corruption each time you do.",
  },
  {
    id: "dark-secret",
    name: "Dark Secret",
    description:
      "Bonus: +2 Charisma. A secret that would destroy your reputation and life if revealed (cult member, killer, undiscovered murderer…). If known and cared about, suffer disadvantage on Cha checks against those who know. Once per adventure, a DC 10 ability check (ability and circumstance set by the GM) is made to see if a clue surfaces; failure means the secret is in danger of being exposed.",
  },
  {
    id: "elderly",
    name: "Elderly",
    description:
      "Bonus: +2 Wisdom. Past your prime, with good and bad days. The first ability check of the day determines: success = good day; failure = bad day, and you have disadvantage on ability checks until the next successful check ends the effect.",
  },
  {
    id: "impulsive",
    name: "Impulsive",
    description:
      "Bonus: +2 Strength or Charisma (player's choice). You act before thinking — once your character declares an action, you cannot have second thoughts. The only way to restrain yourself is to take a point of temporary Corruption as your inner conflict allows darkness to seep in.",
  },
  {
    id: "nightmares",
    name: "Nightmares",
    description:
      "Bonus: +2 Constitution. Haunted by nightmares each night — perhaps from past experience, more abstract reasons, or a family curse. Each night, pass a DC 10 Constitution save or gain a level of exhaustion.",
  },
  {
    id: "mystical-mark",
    name: "Mystical Mark",
    description:
      "Bonus: +2 Charisma. A mystical mark on your body — a birthmark or scar — that requires effort to conceal. Whatever its origin, you risk being mistaken for having a blight-mark. When relevant, pass an opposed Cha (Deception) vs Wis (Perception) check or attract unwanted attention (which can take many forms).",
  },
  {
    id: "seizures",
    name: "Seizures",
    description:
      "Bonus: +2 Intelligence or Wisdom (player's choice). A sensitive mind: when excited or stressed, violent cramps overtake you and you become stunned for 1d4 rounds. Afterwards you gain 1 level of exhaustion.",
  },
  {
    id: "sickly",
    name: "Sickly",
    description:
      "Bonus: +2 Wisdom. A chronic disease that weakens you but also gives insight into healing and the body's structure. Normally your weakness doesn't show, but death saving throws are at disadvantage.",
  },
  {
    id: "slow",
    name: "Slow",
    description:
      "Bonus: +2 Wisdom. You move at an unusually slow pace. Reduce your base speed by 10 feet, to a minimum of 10 feet.",
  },
  {
    id: "wanted",
    name: "Wanted",
    description:
      "Bonus: +2 Charisma. Wanted for some kind of serious crime, justly or falsely accused. You risk being recognized and hunted — once per adventure, pass a DC 10 Cha (Deception) check to avoid being identified by authorities.",
  },
  {
    id: "ward",
    name: "Ward",
    description:
      "Bonus: +2 Intelligence or Charisma (player's choice). You are responsible for another person — a beloved child, an elderly but respected mentor, a soulmate, or just an annoying relative tied to a future inheritance. You pay their lifestyle expenses and must sometimes attend to them directly. If the ward dies or goes missing, sorrow and remorse mirror this burden into a related one (Addiction or Nightmares for protective wards; Wanted or Arch Enemy for personal-gain wards).",
  },
];

export const BOON_BY_ID: Record<string, BoonDef> = Object.fromEntries(
  BOONS.map((b) => [b.id, b]),
);

export const BURDEN_BY_ID: Record<string, BurdenDef> = Object.fromEntries(
  BURDENS.map((b) => [b.id, b]),
);
