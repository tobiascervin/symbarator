// Boons & Burdens (PG p. 147–155). Minimal MVP set focused on Boons, since
// Boons grant +1 to an ability and are the most likely L1 feat use.

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
    id: "pack-mule",
    name: "Pack-mule",
    description:
      "Carry equipment weighing up to 20× your Strength score in pounds.",
    abilityBonus: { ability: "str", amount: 1 },
  },
  {
    id: "poison-resilient",
    name: "Poison Resilient",
    description:
      "Resistance to poison damage; advantage on saves against the poisoned condition.",
    abilityBonus: { ability: "con", amount: 1 },
  },
  {
    id: "shadow-spawn",
    name: "Shadow Spawn",
    description:
      "Born during a solar eclipse, shadows favor you. Advantage on Dex checks when sneaking or hiding.",
    abilityBonus: { ability: "dex", amount: 1 },
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
    id: "haunted",
    name: "Haunted",
    description:
      "A spirit follows you. At irregular intervals (GM's call) you suffer disadvantage on a single check as the spirit interferes.",
  },
  {
    id: "bad-reputation",
    name: "Bad Reputation",
    description:
      "Word has spread. You have disadvantage on Charisma checks in any settlement where your name is known.",
  },
  {
    id: "indebted",
    name: "Indebted",
    description:
      "You owe a major debt to a powerful person or group. Failure to make payments has consequences.",
  },
  {
    id: "marked-by-corruption",
    name: "Marked by Corruption",
    description:
      "You begin play with 1 point of permanent Corruption.",
  },
];

export const BOON_BY_ID: Record<string, BoonDef> = Object.fromEntries(
  BOONS.map((b) => [b.id, b]),
);

export const BURDEN_BY_ID: Record<string, BurdenDef> = Object.fromEntries(
  BURDENS.map((b) => [b.id, b]),
);
