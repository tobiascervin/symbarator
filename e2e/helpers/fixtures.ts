// Typed character fixtures for E2E tests.
//
// Every fixture is a fully-shaped `Character`, so a schema change that adds
// a required field breaks every fixture at compile time — that's the whole
// point of inlining them in TypeScript instead of JSON.
//
// Helper `makeBase()` returns an empty character with all required fields
// set; specific fixtures override only what's interesting for their test.

import type { Character, CharacterLevel } from "@/lib/character/types";

const NOW = "2026-05-02T08:00:00.000Z";

function makeBase(overrides: Partial<Character> & { id: string }): Character {
  const defaults: Character = {
    id: overrides.id,
    createdAt: NOW,
    updatedAt: NOW,
    level: 1 as CharacterLevel,
    houseRules: { allowL1BoonBurden: false },
    maxHp: 0,
    feats: [],
    identity: {
      name: "Test Hero",
      pronouns: "they/them",
      personalityTrait: "",
      ideal: "",
      bond: "",
      flaw: "",
      background: "",
    },
    originId: "abducted-human",
    originAsiAllocation: { dex: 1, wis: 1 },
    backgroundId: "",
    backgroundSkillPicks: [],
    backgroundToolPicks: [],
    classId: "warrior",
    approachId: "berserker",
    classSkillPicks: [],
    fightingStyle: undefined,
    abilities: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    abilityMethod: "standard-array",
    classEquipmentPicks: [0, 0, 0, 0],
    boons: [],
    burdens: [],
    boonAbilityChoices: {},
    burdenAbilityChoices: {},
    spellPicks: undefined,
    corruption: { permanent: 0, temporary: 0 },
    notes: "",
    currentHp: 0,
    tempHp: 0,
    currentSpellSlots: new Array(9).fill(0),
    hitDiceRemaining: 1,
    deathSaves: { successes: 0, failures: 0 },
    featureUses: {},
  };
  const merged: Character = { ...defaults, ...overrides };
  // Default companion-mode state so fixtures don't load downed.
  if (overrides.currentHp === undefined) merged.currentHp = merged.maxHp;
  if (overrides.hitDiceRemaining === undefined) merged.hitDiceRemaining = merged.level;
  return merged;
}

/** A finished L1 Warrior/Berserker — enough to render the sheet. */
export const freshL1Hero: Character = makeBase({
  id: "test-fresh-l1",
  identity: {
    ...makeBase({ id: "x" }).identity,
    name: "Fresh L1 Hero",
  },
  maxHp: 11, // d8 origin hit die + 1 Con mod (placeholder; runtime computeHp will fill if 0)
  fightingStyle: "defense",
  classSkillPicks: ["athletics", "intimidation", "perception"],
});

/**
 * Returns a copy of a character with the L1 Boons & Burdens house rule
 * enabled. Use for any test that needs to visit the gated wizard step
 * (which is otherwise skipped under the RAW default).
 */
export function withL1BoonsAllowed(c: Character): Character {
  return { ...c, houseRules: { ...c.houseRules, allowL1BoonBurden: true } };
}

/** A Mystic/Wizard at L1, the spellcaster baseline. */
export const mysticAtL1: Character = makeBase({
  id: "test-mystic-l1",
  identity: { ...makeBase({ id: "x" }).identity, name: "Mystic L1" },
  classId: "mystic",
  approachId: "wizard",
  abilities: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
  classSkillPicks: ["arcana", "history", "investigation"],
  classEquipmentPicks: [0, 1, 0, 0],
  spellPicks: {
    cantrips: ["fire-bolt", "mage-hand", "light", "prestidigitation", "minor-illusion", "ray-of-frost"],
    spellsKnown: ["magic-missile", "shield"],
  },
  maxHp: 7, // d6 origin + 1 Con
});

/** A Warrior/Templar at L1 with Bless already in spellPicks (regression fixture). */
export const templarAtL1WithBless: Character = makeBase({
  id: "test-templar-l1",
  identity: { ...makeBase({ id: "x" }).identity, name: "Templar L1" },
  classId: "warrior",
  approachId: "templar",
  fightingStyle: "defense",
  abilities: { str: 14, dex: 10, con: 14, int: 8, wis: 15, cha: 12 },
  classSkillPicks: ["athletics", "insight", "perception"],
  classEquipmentPicks: [0, 0, 0, 0],
  spellPicks: {
    cantrips: ["sacred-flame", "guidance"],
    spellsKnown: ["bless"], // already known via L1 grant
  },
  maxHp: 12, // d10 + 2 Con
});

/** A Templar at L4 — companion-mode baseline (wounded, slots to spend, HD to spend). */
export const templarAtL4: Character = makeBase({
  id: "test-templar-l4",
  identity: { ...makeBase({ id: "x" }).identity, name: "Templar L4" },
  classId: "warrior",
  approachId: "templar",
  level: 4 as CharacterLevel,
  fightingStyle: "defense",
  abilities: { str: 14, dex: 10, con: 14, int: 8, wis: 15, cha: 12 },
  classSkillPicks: ["athletics", "insight", "perception"],
  classEquipmentPicks: [0, 0, 0, 0],
  spellPicks: {
    cantrips: ["sacred-flame", "guidance"],
    spellsKnown: ["bless", "cure-wounds", "shield-of-faith"],
  },
  maxHp: 30,
  currentHp: 24, // wounded, used by damage/heal tests
  hitDiceRemaining: 4,
  currentSpellSlots: [3, 0, 0, 0, 0, 0, 0, 0, 0], // L4 half-caster row
});

/** A Warrior at L19 — used to test the L20 disable scenario after one level-up. */
export const warriorAtL19: Character = makeBase({
  id: "test-warrior-l19",
  identity: { ...makeBase({ id: "x" }).identity, name: "Warrior L19" },
  classId: "warrior",
  approachId: "berserker",
  level: 19 as CharacterLevel,
  fightingStyle: "great-weapon",
  abilities: { str: 20, dex: 14, con: 18, int: 10, wis: 12, cha: 10 },
  classSkillPicks: ["athletics", "intimidation", "perception"],
  classEquipmentPicks: [0, 0, 0, 0],
  // Approximate persisted maxHp at L19 (any positive number works for tests):
  maxHp: 150,
  feats: [],
});

/** A Warrior at L20 — Level Up button must be disabled. */
export const warriorAtL20: Character = makeBase({
  id: "test-warrior-l20",
  identity: { ...makeBase({ id: "x" }).identity, name: "Warrior L20" },
  classId: "warrior",
  approachId: "berserker",
  level: 20 as CharacterLevel,
  fightingStyle: "great-weapon",
  abilities: { str: 20, dex: 14, con: 18, int: 10, wis: 12, cha: 10 },
  classSkillPicks: ["athletics", "intimidation", "perception"],
  classEquipmentPicks: [0, 0, 0, 0],
  maxHp: 165,
});

/** A Changeling Warrior at L3 — test the Change Self ASI/feat third option at L4. */
export const changelingAtL3: Character = makeBase({
  id: "test-changeling-l3",
  identity: { ...makeBase({ id: "x" }).identity, name: "Changeling L3" },
  originId: "changeling",
  originAsiAllocation: { dex: 1 },
  classId: "warrior",
  approachId: "berserker",
  level: 3 as CharacterLevel,
  fightingStyle: "two-weapon",
  abilities: { str: 14, dex: 14, con: 14, int: 10, wis: 14, cha: 10 },
  classSkillPicks: ["athletics", "perception", "survival"],
  classEquipmentPicks: [0, 0, 0, 0],
  maxHp: 30,
});

/** A non-Changeling Warrior at L3 — sibling fixture for Change Self gating tests. */
export const humanWarriorAtL3: Character = makeBase({
  id: "test-human-warrior-l3",
  identity: { ...makeBase({ id: "x" }).identity, name: "Human Warrior L3" },
  originId: "human",
  originSubchoiceId: "ambrian",
  originAsiAllocation: { str: 1, con: 1 },
  classId: "warrior",
  approachId: "berserker",
  level: 3 as CharacterLevel,
  fightingStyle: "two-weapon",
  abilities: { str: 14, dex: 12, con: 14, int: 10, wis: 12, cha: 10 },
  classSkillPicks: ["athletics", "perception", "survival"],
  classEquipmentPicks: [0, 0, 0, 0],
  maxHp: 30,
});

/**
 * Pre-leveling-change save shape: missing `feats`, `maxHp`, and `level` is
 * the literal `1` (rather than `CharacterLevel`). Only used by migration
 * tests via `seedRaw`.
 */
export const preLevelingSave = {
  id: "test-pre-leveling",
  createdAt: NOW,
  updatedAt: NOW,
  level: 1,
  identity: {
    name: "Pre-leveling Hero",
    pronouns: "she/her",
    personalityTrait: "",
    ideal: "",
    bond: "",
    flaw: "",
    background: "",
  },
  originId: "abducted-human",
  originAsiAllocation: { dex: 1, wis: 1 },
  backgroundId: "",
  backgroundSkillPicks: [],
  backgroundToolPicks: [],
  classId: "warrior",
  approachId: "berserker",
  classSkillPicks: ["athletics", "intimidation", "perception"],
  fightingStyle: "defense",
  abilities: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
  abilityMethod: "standard-array",
  classEquipmentPicks: [0, 0, 0, 0],
  boons: [],
  burdens: [],
  corruption: { permanent: 0, temporary: 0 },
  notes: "",
  // No `feats`, no `maxHp` — that's the point of this fixture.
};
