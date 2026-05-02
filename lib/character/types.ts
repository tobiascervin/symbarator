// Core domain types for the Ruins of Symbaroum 5E character builder.
//
// Notes about the rules:
// - HP and Hit Dice come from the character's Origin, NOT the Class (PG p. 44, 96).
//   Each Class still defines a fallback hit die for use in non-Symbaroum settings.
// - Corruption Threshold is computed; its formula varies by class (most: standard,
//   Mystic: special). PG p. 37.

export type Ability =
  | "str"
  | "dex"
  | "con"
  | "int"
  | "wis"
  | "cha";

export const ABILITY_ORDER: readonly Ability[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
] as const;

export const ABILITY_LABELS: Record<Ability, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export const ABILITY_SHORT: Record<Ability, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

export type Size = "small" | "medium" | "large";

export type SkillId =
  | "acrobatics"
  | "animal-handling"
  | "arcana"
  | "athletics"
  | "deception"
  | "history"
  | "insight"
  | "intimidation"
  | "investigation"
  | "medicine"
  | "nature"
  | "perception"
  | "performance"
  | "persuasion"
  | "religion"
  | "sleight-of-hand"
  | "stealth"
  | "survival";

// Languages (Symbaroum-flavored).
export type LanguageId =
  | "ambrian"
  | "barbarian"
  | "elvish"
  | "trollish"
  | "dwarven"
  | "goblin"
  | "symbaroum";

// Tool proficiency identifiers — kept loose; UI shows the human label.
export type ToolId = string;

export type FightingStyleId =
  | "archery"
  | "defense"
  | "dueling"
  | "great-weapon"
  | "polearm"
  | "shield"
  | "snare"
  | "two-weapon";

export interface AbilityScoreBoost {
  // Direct bonuses applied automatically by the origin (e.g. Goblin: dex+2).
  fixed?: Partial<Record<Ability, number>>;
  // Free-floating points the player must allocate (e.g. "+1 to any one").
  // The `pick` rule is one of: "any-one", "any-two", "any-other".
  // "any-other" means a different ability than the fixed ones above.
  floating?: { count: number; size: 1 | 2; rule: "any-one" | "any-other" };
}

export interface OriginSubchoice {
  id: string;
  name: string;
  flavor?: string;
  /** Additional fixed ability bonuses granted by this culture/branch. */
  asi?: Partial<Record<Ability, number>>;
  /** Extra features granted on top of the origin's base features. */
  features?: ReadonlyArray<{ name: string; description: string }>;
}

export interface OriginDef {
  id: string;
  name: string;
  flavor: string;
  asi: AbilityScoreBoost;
  hitDie: 6 | 8 | 10 | 12;
  size: Size;
  speed: number;
  languages: { fixed: LanguageId[]; chooseFromHuman?: boolean };
  features: ReadonlyArray<{ name: string; description: string }>;
  /** Optional sub-pick under the origin (e.g. Human: Ambrian vs Barbarian). */
  subchoices?: { prompt: string; options: OriginSubchoice[] };
  // Cosmetic name suggestions for the chooser.
  sampleNames?: { male?: string[]; female?: string[]; neutral?: string[] };
  // Whether HP/HD are treated as origin-determined (true) or class-determined.
  providesHp: boolean;
}

export interface BackgroundDef {
  id: string;
  originId: string;
  name: string;
  description: string;
  skillProficiencies: SkillId[]; // automatic
  skillChoices?: { count: number; from: SkillId[] };
  toolChoices?: { count: number; from: { id: ToolId; label: string }[] };
  // Plain-language equipment grant (e.g. "A kit to match your tool, leather clothes, 1d6 ortegs").
  equipment: string;
  feature: { name: string; description: string };
  tables: {
    personalityTraits: string[]; // 1d8
    ideals: string[]; // 1d6
    bonds: string[]; // 1d6
    flaws: string[]; // 1d6
  };
}

export interface ClassDef {
  id: string;
  name: string;
  flavor: string;
  fallbackHitDie: 6 | 8 | 10 | 12;
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    savingThrows: Ability[];
    skillChoices: { count: number; from: SkillId[] };
  };
  startingEquipment: string[]; // each entry is one "(a) X or (b) Y" choice line
  shadowFormula: "standard" | "mystic";
  // Spellcasting metadata for Mystic.
  spellcasting?: {
    abilityHint: Ability; // changes per Approach; default shown
    cantripsKnownAt1: number;
    spellsKnownAt1: number;
    spellSlotsAt1: number;
  };
  // Level-1 features common to the class (Approach features added on top).
  level1Features: ReadonlyArray<{ name: string; description: string }>;
  // Whether class offers a Fighting Style at L1.
  fightingStyleAt1?: FightingStyleId[];
  approaches: ApproachDef[];
}

export interface ApproachDef {
  id: string;
  classId: string;
  name: string;
  description: string;
  level1Features: ReadonlyArray<{ name: string; description: string }>;
  // For Mystic approaches: which spell tradition.
  tradition?: SpellTradition;
}

export type SpellTradition =
  | "sorcerer"
  | "theurg"
  | "troll-singer"
  | "witch"
  | "wizard"
  | "staff-mage"
  | "symbolist";

export interface BoonDef {
  id: string;
  name: string;
  description: string;
  abilityBonus?: { ability: Ability | "choice"; amount: 1 };
  abilityBonusChoices?: Ability[]; // when ability is "choice"
  prerequisite?: string;
  restriction?: string;
}

export interface BurdenDef {
  id: string;
  name: string;
  description: string;
}

export interface SpellDef {
  id: string;
  name: string;
  level: 0 | 1; // MVP only encodes cantrips and 1st-level
  school: string;
  traditions: SpellTradition[];
  ritual?: boolean;
  description: string;
}

// ---------------------------------------------------------------------------
// The character draft — what we save to storage.
// ---------------------------------------------------------------------------

export interface CharacterIdentity {
  name: string;
  pronouns?: string;
  personalityTrait: string;
  ideal: string;
  bond: string;
  flaw: string;
  background?: string; // free-form notes
}

export interface Character {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  level: 1; // expand later
  identity: CharacterIdentity;
  originId: string;
  /** Free-floating ability boosts the player allocated from origin's ASI. */
  originAsiAllocation: Partial<Record<Ability, number>>;
  /** When the origin has a sub-pick (e.g. Human → Ambrian/Barbarian). */
  originSubchoiceId?: string;
  backgroundId: string;
  /** Player's choice when background offers skillChoices. */
  backgroundSkillPicks: SkillId[];
  /** Player's choice when background offers toolChoices. */
  backgroundToolPicks: ToolId[];
  classId: string;
  approachId: string;
  /** Skills picked from the class's offered list. */
  classSkillPicks: SkillId[];
  /** Fighting style chosen, if applicable. */
  fightingStyle?: FightingStyleId;
  /** Base ability scores from point-buy / standard-array / manual; no origin bonuses applied. */
  abilities: Record<Ability, number>;
  /** How the player generated abilities (for display only). */
  abilityMethod: "standard-array" | "point-buy" | "manual";
  /** Equipment options the player picked from the class table; one index per (a)/(b)/(c) line. */
  classEquipmentPicks: number[];
  /** Boons (typically 0 at L1; some campaigns let players take one for free). */
  boons: string[];
  burdens: string[];
  /** For Mystic only. */
  spellPicks?: { cantrips: string[]; spellsKnown: string[] };
  corruption: { permanent: number; temporary: number };
  notes: string;
}

export interface CharacterSummary {
  id: string;
  name: string;
  originId: string;
  classId: string;
  level: 1;
  updatedAt: string;
}
