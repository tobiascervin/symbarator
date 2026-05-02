import type { Character } from "./types";

export function emptyCharacter(id: string): Character {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    level: 1,
    identity: {
      name: "",
      pronouns: "",
      personalityTrait: "",
      ideal: "",
      bond: "",
      flaw: "",
      background: "",
    },
    originId: "",
    originAsiAllocation: {},
    backgroundId: "",
    backgroundSkillPicks: [],
    backgroundToolPicks: [],
    classId: "",
    approachId: "",
    classSkillPicks: [],
    fightingStyle: undefined,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    abilityMethod: "standard-array",
    classEquipmentPicks: [],
    boons: [],
    burdens: [],
    spellPicks: undefined,
    corruption: { permanent: 0, temporary: 0 },
    notes: "",
  };
}

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const POINT_BUY_BUDGET = 27;
