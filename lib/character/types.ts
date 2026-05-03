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

// Character level. Symbaroum 5E caps progression at 20.
export type CharacterLevel =
  | 1 | 2 | 3 | 4 | 5
  | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15
  | 16 | 17 | 18 | 19 | 20;

export const MAX_CHARACTER_LEVEL = 20 as const;

// Symbaroum places ASI/feat slots at these character levels (extra L10 vs base 5E).
export const ASI_FEAT_LEVELS: ReadonlyArray<CharacterLevel> = [4, 8, 10, 12, 16, 19] as const;

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

/**
 * A single per-level entry on a class's level table. Index 0 corresponds to
 * level 1; tables MUST be exactly 20 rows long.
 */
export interface ClassLevelEntry {
  level: CharacterLevel;
  profBonus: 2 | 3 | 4 | 5 | 6;
  /** Generic feature grants — surfaced on the sheet, no choices required. */
  features: ReadonlyArray<{ name: string; description: string }>;
  /** Choice prompts the level-up flow surfaces this level. */
  choices?: ReadonlyArray<LevelChoice>;
}

/** Approach-specific row, parallel to ClassLevelEntry. */
export interface ApproachLevelEntry {
  level: CharacterLevel;
  features: ReadonlyArray<{ name: string; description: string }>;
  choices?: ReadonlyArray<LevelChoice>;
}

/**
 * One level-up question. Each kind has a dedicated UI step and a validator
 * arm; adding a new variant without updating both sites MUST fail to compile.
 */
export type LevelChoice =
  // For Changeling characters the ASI/feat step also offers Change Self in this same slot.
  | { kind: "asi-or-feat" }
  | { kind: "fighting-style"; from: FightingStyleId[] }
  | { kind: "spells-learned"; cantrips?: number; spells?: number; canSwap?: boolean };

/**
 * One row of a spellcasting progression table. Index 0 is level 1.
 * `spellSlots[i]` is the count of (i+1)th-level slots, indices 0..8 (1st..9th).
 */
export interface SpellSlotRow {
  cantripsKnown: number;
  spellsKnown: number;
  /** Slots per spell level, 1st through 9th. Length 9. */
  spellSlots: ReadonlyArray<number>;
}

export interface ApproachSpellcasting {
  abilityHint: Ability;
  cantripsKnownAt1: number;
  spellsKnownAt1: number;
  spellSlotsAt1: number;
  /** Length 20; row 0 corresponds to character level 1. */
  progression: ReadonlyArray<SpellSlotRow>;
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
  // Level-1 features common to the class (Approach features added on top).
  level1Features: ReadonlyArray<{ name: string; description: string }>;
  // Whether class offers a Fighting Style at L1.
  fightingStyleAt1?: FightingStyleId[];
  approaches: ApproachDef[];
  /**
   * Full L1–20 progression. Length 20. Index 0 corresponds to level 1.
   * The L1 row's `features` MAY be empty; class-level L1 features still live
   * on `level1Features` for the wizard. Sheet-side feature aggregation reads
   * BOTH `level1Features` and `levelTable[0..level-1].features`.
   */
  levelTable: ReadonlyArray<ClassLevelEntry>;
}

export interface ApproachDef {
  id: string;
  classId: string;
  name: string;
  description: string;
  level1Features: ReadonlyArray<{ name: string; description: string }>;
  // For Mystic approaches (and any other tradition-bound caster): which spell tradition.
  tradition?: SpellTradition;
  /**
   * Full L1–20 progression. Length 20. Index 0 corresponds to level 1.
   * Same conventions as `ClassDef.levelTable`.
   */
  levelTable: ReadonlyArray<ApproachLevelEntry>;
  /**
   * Spellcasting metadata, including the L1–20 progression. Defined only for
   * spellcasting approaches (every Mystic approach, plus Warrior/Templar and
   * Hunter/Witch Hunter). Other approaches MUST leave this undefined.
   */
  spellcasting?: ApproachSpellcasting;
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

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface SpellDef {
  id: string;
  name: string;
  level: SpellLevel;
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
  level: CharacterLevel;
  /**
   * Persisted maximum HP. Set at character creation (origin hit die + Con mod)
   * and incremented per level-up. Persisted because rolled HP gains are
   * non-deterministic — we don't recompute from level alone.
   */
  maxHp: number;
  /** Feat ids from `data/feats.ts`, accumulated via level-up ASI-or-feat picks. */
  feats: string[];
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
  /**
   * For boons whose `abilityBonus.ability === "choice"`, the player picks
   * which ability gets the +1 at L1. Keyed by boon id. `{}` for characters
   * with no boons or no choice-boons. Backfilled by `migrateCharacter` for
   * pre-1.3 saves.
   */
  boonAbilityChoices: Record<string, Ability>;
  /** For Mystic only. */
  spellPicks?: { cantrips: string[]; spellsKnown: string[] };
  corruption: { permanent: number; temporary: number };
  notes: string;

  // Companion-mode live state — mutates during play (damage, slots spent,
  // rests). Static fields above are set at creation/level-up; everything
  // below is what the player ticks during a session. Migrator backfills
  // sane defaults for pre-1.4 saves.
  /** Current HP. 0 = downed; floors at 0; never negative. */
  currentHp: number;
  /** Temporary HP. Absorbs damage before currentHp; overwrites if higher (does not stack). */
  tempHp: number;
  /** Per-spell-level remaining slots, length 9. Index i = (i+1)th-level slots. */
  currentSpellSlots: number[];
  /** Hit Dice still available to spend. Restored half on long rest, fully on extended rest. */
  hitDiceRemaining: number;
  /** Death save tally; surfaced on the sheet only when currentHp === 0. */
  deathSaves: { successes: number; failures: number };
}

export interface CharacterSummary {
  id: string;
  name: string;
  originId: string;
  classId: string;
  level: CharacterLevel;
  updatedAt: string;
}
