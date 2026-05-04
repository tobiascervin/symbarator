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
  // `from`, when present, restricts the allocation to the listed abilities,
  // intersected with whatever `rule` already excludes (e.g. Human's
  // floating +1 must go to DEX, CON, or CHA per PG p. 71).
  floating?: {
    count: number;
    size: 1 | 2;
    rule: "any-one" | "any-other";
    from?: ReadonlyArray<Ability>;
  };
}

export interface OriginSubchoice {
  id: string;
  name: string;
  flavor?: string;
  /** Additional fixed ability bonuses granted by this culture/branch. */
  asi?: Partial<Record<Ability, number>>;
  /** Extra features granted on top of the origin's base features. */
  features?: ReadonlyArray<FeatureDef>;
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
  features: ReadonlyArray<FeatureDef>;
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
 * Optional structured-resource shape for a class/approach feature.
 *
 * `count: "profBonus"` resolves to `computeProficiencyBonus(c)` at display
 * time; `count: "level"` resolves to `c.level`. Numeric counts are taken
 * as-is. Extensible — other derivations (`"halfLevel"`, `"conMod"`, …) can
 * join the union without breaking existing entries.
 */
export type FeatureUsageMax = number | "profBonus" | "level";

export interface FeatureUsage {
  count: FeatureUsageMax;
  per: "short-rest" | "long-rest";
}

/**
 * Optional structured-effect shape for a class/approach feature. Narrow for
 * v1 — only the shapes the first-pass content actually needs. `passive` is
 * the explicit "we know there's no roll" marker (distinct from a missing
 * `effect`, which means "we haven't encoded one"). Extensible.
 */
export type FeatureEffect =
  | { kind: "tempHp"; dice: DiceExpression; addAbilityMod?: Ability }
  | { kind: "passive"; note?: string };

/**
 * Inline feature shape used by class/approach level entries. `id` /
 * `usage` / `effect` are optional — most narrative features carry only
 * `name` + `description`. Adding `id` is the trigger for usage tracking
 * (the popover and rest primitives both key off it).
 */
export interface FeatureDef {
  /** Stable id for usage tracking. Class-prefixed by convention (e.g. `"warrior:battle-wind"`). */
  id?: string;
  name: string;
  description: string;
  usage?: FeatureUsage;
  effect?: FeatureEffect;
}

/**
 * A single per-level entry on a class's level table. Index 0 corresponds to
 * level 1; tables MUST be exactly 20 rows long.
 */
export interface ClassLevelEntry {
  level: CharacterLevel;
  profBonus: 2 | 3 | 4 | 5 | 6;
  /** Generic feature grants — surfaced on the sheet, no choices required. */
  features: ReadonlyArray<FeatureDef>;
  /** Choice prompts the level-up flow surfaces this level. */
  choices?: ReadonlyArray<LevelChoice>;
}

/** Approach-specific row, parallel to ClassLevelEntry. */
export interface ApproachLevelEntry {
  level: CharacterLevel;
  features: ReadonlyArray<FeatureDef>;
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
  /**
   * Spells the approach grants automatically, in addition to the player's
   * `cantripsKnownAt1` / `spellsKnownAt1` picks. They MUST exist in
   * `SPELL_BY_ID` and are not persisted on the character — the sheet derives
   * them from the approach. Templar gets `["bless"]` per PG p. 143.
   */
  alwaysKnownSpells?: ReadonlyArray<string>;
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
  level1Features: ReadonlyArray<FeatureDef>;
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
  level1Features: ReadonlyArray<FeatureDef>;
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
  /**
   * For approaches whose corruption threshold uses an ability OTHER than the
   * class's default. Currently used only by Warrior/Templar (PG p. 143): when
   * set, and when the class's `shadowFormula` is `"standard"`, the
   * corruption-threshold formula uses `max(chaMod, overrideMod)` in place of
   * `chaMod` alone. Mystic-formula classes ignore this field — their ability
   * is read from `spellcasting.abilityHint`. MUST NOT be set to `"cha"` (the
   * default for the standard formula); leave undefined to mean "no override".
   */
  corruptionAbilityOverride?: Ability;
}

export type SpellTradition =
  | "sorcerer"
  | "theurg"
  | "troll-singer"
  | "witch"
  | "wizard"
  | "staff-mage"
  | "symbolist";

/**
 * Three kinds of feat per PG p. 146:
 * - `"boon"` — generic, origin/class-agnostic. Anyone can take.
 * - `"origin"` — tied to one or more origins (PG p. 153).
 * - `"class"` — tied to a class (and sometimes an approach + class-level
 *   floor + ability prerequisites) per PG p. 155–157.
 */
export type FeatCategory = "boon" | "origin" | "class";

/**
 * Unified shape for boons, origin feats, and class feats. Discriminated by
 * `category`. Boon entries leave the gating fields (`origins`, `classId`,
 * `approachId`, …) undefined; origin entries set `origins`; class entries
 * set `classId` and optionally any of the prerequisite fields.
 */
export interface FeatDef {
  id: string;
  category: FeatCategory;
  name: string;
  description: string;
  /** +1 ability for boons; +1 STR for Big-boned (Ogre origin feat); etc. */
  abilityBonus?: { ability: Ability | "choice"; amount: 1 };
  /** When `abilityBonus.ability === "choice"`, the player picks from this list. */
  abilityBonusChoices?: ReadonlyArray<Ability>;
  /** Free-form prerequisite text (PG wording, e.g. "Strength 13 or higher"). */
  prerequisiteText?: string;
  /** Origin feats: which origins MAY take this feat (PG p. 153). */
  origins?: ReadonlyArray<string>;
  /** Class feats: the parent class (PG p. 155–157). */
  classId?: string;
  /** Class feats with an approach-tied prerequisite (e.g. Confessor → Theurg). */
  approachId?: string;
  /** Class feats with a minimum class-level requirement (e.g. Confessor → 11+). */
  minClassLevel?: number;
  /** Ability-score floors enforced at level-up time (e.g. {str: 13} for Grappler). */
  minAbilityScores?: Partial<Record<Ability, number>>;
  /** "Spellcasting ability score 13+" — resolved against `spellcasting.abilityHint`. */
  minSpellcastingAbility?: number;
  /** Mutually-exclusive feats (PG p. 156: Confessor ↔ Inquisitor). */
  excludesFeatIds?: ReadonlyArray<string>;
  /** Hard restriction independent of prerequisites (Dwarves cannot take Absolute Memory). */
  forbiddenOriginIds?: ReadonlyArray<string>;
  /** Legacy alias kept on the type for backwards-source-compat in the L1 step's
   *  card label. The `restriction` text is now equivalent to `prerequisiteText`
   *  for boons; both fields render in the same slot. New entries SHOULD use
   *  `prerequisiteText`. */
  restriction?: string;
  /** @deprecated Legacy field — use `prerequisiteText`. Kept for back-compat. */
  prerequisite?: string;
}

/** @deprecated Use `FeatDef`. Retained as an alias for source compatibility. */
export type BoonDef = FeatDef & { category: "boon" };

/**
 * Ability bonus shape for a Burden. Three kinds:
 * - `fixed`: a single named ability gets `+amount` (canonical: `+2`).
 * - `choose-one`: player picks one ability — optionally restricted by `from`,
 *   defaults to any of the six — that gets `+amount` (canonical: `+2`).
 * - `choose-two`: player picks two distinct abilities, each gets `+amount`
 *   (canonical: Dark Blood, `+1` each).
 *
 * The wizard surfaces an inline picker for the `choose-*` variants and the
 * validator rejects advance until the cardinality and `from`-membership
 * are satisfied.
 */
export type BurdenBonus =
  | { kind: "fixed"; ability: Ability; amount: 2 }
  | { kind: "choose-one"; from?: ReadonlyArray<Ability>; amount: 2 }
  | { kind: "choose-two"; from?: ReadonlyArray<Ability>; amount: 1 };

export interface BurdenDef {
  id: string;
  name: string;
  description: string;
  /** Ability bonus this burden grants (PG: most are `+2`; Dark Blood is `+1/+1`). */
  abilityBonus?: BurdenBonus;
  /**
   * Permanent Corruption gained at character creation (PG: Dark Blood adds `+2`).
   * Informational only — the wizard surfaces a warning chip and the player
   * adjusts `Character.corruption.permanent` manually via the sheet's
   * Corruption panel. NOT auto-applied to avoid coupling with the
   * player-mutable in-play corruption value.
   */
  startingCorruption?: number;
}

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Damage / healing dice expression. `flat` is an optional flat add (e.g. +5).
 *  `faces: 1` represents flat damage (e.g. PG's Blowpipe deals "1 piercing"). */
export interface DiceExpression {
  count: number;
  faces: 1 | 4 | 6 | 8 | 10 | 12;
  flat?: number;
}

export type DamageType =
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder";

export interface DamageRoll {
  dice: DiceExpression;
  type: DamageType;
  /** Adds the spellcasting ability mod to the damage (rare for damage; common for healing). */
  addSpellMod?: boolean;
}

/**
 * Mechanical shape of a spell's effect. The cast popover branches on `kind`
 * to decide which numbers (attack mod, save DC, healing) to surface.
 *
 * `utility` is explicit ("we know this spell has no roll") so the popover can
 * confidently say "no save, no attack" rather than "we haven't encoded it."
 * Spells without an `effect` field (the absent case) fall back to a generic
 * "see description" message.
 */
export type SpellEffect =
  | { kind: "attack"; damage: DamageRoll; onMiss?: "half" | "none" }
  | {
      kind: "save";
      ability: Ability;
      damage?: DamageRoll;
      halfOnSave?: boolean;
      effect?: string;
    }
  | { kind: "heal"; dice: DiceExpression; addSpellMod?: boolean }
  | { kind: "utility" };

/**
 * How the spell's dice scale.
 * - `cantrip`: bands array marks the character-level thresholds at which the
 *   damage upgrades. Compute picks the highest band whose `atLevel <= c.level`.
 * - `upcast`: adds `perLevel` dice for each slot level above the spell's base.
 */
export type SpellScaling =
  | {
      kind: "cantrip";
      bands: ReadonlyArray<{ atLevel: 5 | 11 | 17; dice: DiceExpression }>;
    }
  | { kind: "upcast"; perLevel: DiceExpression };

export interface SpellDef {
  id: string;
  name: string;
  level: SpellLevel;
  school: string;
  traditions: SpellTradition[];
  ritual?: boolean;
  description: string;
  /**
   * Mechanical effect for the cast popover. Optional — spells without it
   * render description-only and the popover degrades to "see description".
   */
  effect?: SpellEffect;
  /**
   * Scaling rules for the spell's dice. Optional — flat-damage spells (rare)
   * and explicit utility spells have no scaling.
   */
  scaling?: SpellScaling;
}

// ---------------------------------------------------------------------------
// Equipment — weapons and armor (PG p. 162–171).
// ---------------------------------------------------------------------------

/** Coin payment in any of the three Ambrian denominations (PG p. 160). */
export interface Coin {
  thaler?: number;
  shilling?: number;
  orteg?: number;
}

export type WeaponCategory =
  | "simple-melee"
  | "simple-ranged"
  | "martial-melee"
  | "martial-ranged"
  | "alchemical"
  | "siege";

/**
 * Boolean weapon properties (no parameters). The cast popover and attack
 * resolver inspect these via `flags.has("finesse")`. Symbaroum-specific
 * properties (`balanced`, `deep-impact`, `ensnaring`, `massive`,
 * `restraining`, `returning`, `concealed`) are catalog-only in v1 — the
 * popover lists them as text without modeling their crit / restraint rules.
 */
export type WeaponProperty =
  | "finesse"
  | "light"
  | "heavy"
  | "two-handed"
  | "loading"
  | "reach"
  | "deep-impact"
  | "ensnaring"
  | "massive"
  | "restraining"
  | "returning"
  | "siege"
  | "special"
  | "balanced"
  | "concealed"
  | "immobile";

/** Parameterized weapon properties — versatile dice, ranges, area effects. */
export type WeaponPropertyData =
  | { kind: "thrown"; range: [number, number] }
  | { kind: "ammunition"; range: [number, number] }
  | { kind: "range"; range: [number, number] }
  | { kind: "versatile"; twoHandedDamage: DiceExpression }
  | { kind: "area"; shape: "radius" | "cone" | "line"; size: number };

export interface WeaponDef {
  id: string;
  name: string;
  category: WeaponCategory;
  cost: Coin;
  /** Weight in pounds. 0 for weightless (sling). */
  weight: number;
  /** Primary one-handed damage. Versatile two-handed dice live in `properties`. */
  damage: DiceExpression;
  damageType: DamageType;
  flags: ReadonlySet<WeaponProperty>;
  /** Properties carrying parameters (range, versatile, area). */
  properties?: ReadonlyArray<WeaponPropertyData>;
  description?: string;
}

export type ArmorCategory = "light" | "medium" | "heavy" | "shield";

export type ArmorProperty = "concealable" | "cumbersome" | "noisy";

export interface ArmorDef {
  id: string;
  name: string;
  category: ArmorCategory;
  cost: Coin;
  weight: number;
  /** AC formula. For shields, `base` is the additive bonus and `addDex` is false. */
  ac: { base: number; addDex: boolean; dexMax?: number };
  flags: ReadonlySet<ArmorProperty>;
  /** Weighty (N) — minimum STR required, or speed reduces by 10 ft. */
  weightyStrMin?: number;
  description?: string;
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

/**
 * Per-character house-rule opt-ins. Lives on the character (not in app
 * settings) so the JSON export carries the player's table conventions to
 * other browsers / GMs. New rules are added as siblings; absence on a
 * loaded save is treated as RAW unless the migrator infers otherwise.
 */
export interface HouseRules {
  /**
   * Allow picking a Boon and/or Burden at character creation. RAW Symbaroum
   * 5E only grants Boons via the L4+ Boon feat; some GMs allow one at L1.
   * When `false`, the wizard's Boons & Burdens step is skipped entirely.
   */
  allowL1BoonBurden: boolean;
}

export interface Character {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  level: CharacterLevel;
  /** Per-character house-rule flags. See `HouseRules`. */
  houseRules: HouseRules;
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
  /**
   * Per-line follow-up choices for class equipment options that contain
   * generic weapon placeholders ("a martial weapon", "two martial weapons",
   * etc.). Keyed by line index (matching `classEquipmentPicks`). The value
   * is an ordered array of catalog weapon names (e.g. `["Longsword"]` or
   * `["Longsword", "Battleaxe"]` for "two martial weapons") — one entry
   * per placeholder slot in left-to-right order.
   */
  classEquipmentChoices: Record<number, string[]>;
  /**
   * Post-creation inventory deltas. `added` items are appended to the
   * resolved inventory (catalog match → weapons/armor/shield, otherwise
   * free-text gear). `removed` items are filtered out of the class-pick
   * derivation, one occurrence per entry, case-insensitive. Both arrays
   * round-trip through JSON unchanged.
   */
  inventoryOverrides: { added: string[]; removed: string[] };
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
  /**
   * For burdens whose `abilityBonus.kind` is `"choose-one"` or `"choose-two"`,
   * the player's chosen ability/abilities. Length 1 for `choose-one`, length 2
   * for `choose-two`. Fixed-bonus burdens have no entry. `{}` for characters
   * with no choice-burdens. Backfilled by `migrateCharacter` for pre-1.7 saves.
   */
  burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>;
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
  /**
   * Remaining uses for tracked class/approach features, keyed by the
   * feature's `id`. Absence of an entry is treated as "full uses" — the
   * popover lazy-initializes the counter on first decrement, so this map
   * stays empty until the player actually spends a use. Backfilled by
   * `migrateCharacter` for pre-1.10 saves.
   */
  featureUses: Record<string, number>;
}

export interface CharacterSummary {
  id: string;
  name: string;
  originId: string;
  classId: string;
  level: CharacterLevel;
  updatedAt: string;
}
