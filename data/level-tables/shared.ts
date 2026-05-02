// Helpers shared by every class's level table.
//
// This module also runs structural assertions at import time so a malformed
// table fails fast (in dev/test) rather than silently corrupting the
// level-up flow.
//
// Symbaroum (PG sect. 4) places ASI/feat slots at L4, L8, L10, L12, L16, L19
// — uniform across all classes. The proficiency bonus curve matches base 5E.
// Per-class and per-approach feature text is encoded inside each class's
// `data/level-tables/<class>.ts` file; this module only provides the
// structural scaffolding so every class table is guaranteed to be 20 rows
// long and to surface the ASI choice on the right levels.

import type {
  ApproachLevelEntry,
  CharacterLevel,
  ClassLevelEntry,
  LevelChoice,
} from "@/lib/character/types";
import { ASI_FEAT_LEVELS } from "@/lib/character/types";

const ASI_LEVEL_SET = new Set<number>(ASI_FEAT_LEVELS as readonly number[]);

export function profBonusFor(level: CharacterLevel): 2 | 3 | 4 | 5 | 6 {
  if (level < 5) return 2;
  if (level < 9) return 3;
  if (level < 13) return 4;
  if (level < 17) return 5;
  return 6;
}

export const LEVELS: ReadonlyArray<CharacterLevel> = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

/**
 * Per-level rows for a class table. `featuresByLevel` maps level→features
 * granted that level (omit any level with no class-wide feature). `choicesByLevel`
 * adds extra prompts beyond the automatic ASI/feat slot. The helper appends
 * the ASI/feat choice on every Symbaroum ASI level automatically.
 */
export function buildClassLevelTable(
  featuresByLevel: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>>,
  choicesByLevel: Partial<Record<CharacterLevel, ReadonlyArray<LevelChoice>>> = {},
): ReadonlyArray<ClassLevelEntry> {
  return LEVELS.map((level): ClassLevelEntry => {
    const explicitChoices = choicesByLevel[level] ?? [];
    const choices: LevelChoice[] = [...explicitChoices];
    if (ASI_LEVEL_SET.has(level)) {
      choices.push({ kind: "asi-or-feat" });
    }
    return {
      level,
      profBonus: profBonusFor(level),
      features: featuresByLevel[level] ?? [],
      choices: choices.length > 0 ? choices : undefined,
    };
  });
}

/** Same shape as `buildClassLevelTable` but without the automatic ASI slot. */
export function buildApproachLevelTable(
  featuresByLevel: Partial<Record<CharacterLevel, ReadonlyArray<{ name: string; description: string }>>>,
  choicesByLevel: Partial<Record<CharacterLevel, ReadonlyArray<LevelChoice>>> = {},
): ReadonlyArray<ApproachLevelEntry> {
  return LEVELS.map((level): ApproachLevelEntry => {
    const choices = choicesByLevel[level];
    return {
      level,
      features: featuresByLevel[level] ?? [],
      choices: choices && choices.length > 0 ? [...choices] : undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Standard 5E full-caster spell progression (for Mystic approaches).
// PG p. 110 confirms Mystic uses the standard full-caster table (cantrips
// known, spells known, spell slots per spell level 1..9). Per-approach
// variations for cantrips known are applied at the approach level.
// ---------------------------------------------------------------------------

import type { SpellSlotRow } from "@/lib/character/types";

/**
 * Standard 5E full-caster slot table — one row per character level 1..20.
 * Indices into `spellSlots` are spell levels 1..9 (length 9).
 *
 * | Char L | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
 * |     1  |  2  |     |     |     |     |     |     |     |     |
 * |     2  |  3  |     |     |     |     |     |     |     |     |
 * |     3  |  4  |  2  |     |     |     |     |     |     |     |
 * | …                                                              |
 * |    20  |  4  |  3  |  3  |  3  |  3  |  2  |  2  |  1  |  1  |
 */
const FULL_CASTER_SLOTS: ReadonlyArray<ReadonlyArray<number>> = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // L1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // L2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // L3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // L4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // L5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // L6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // L7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // L8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // L9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // L10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // L11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // L12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // L13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // L14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // L15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // L16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // L17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // L18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // L19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // L20
];

// Standard 5E full-caster cantrips/spells known progression (Sorcerer-style).
// Approaches that deviate (e.g. Wizard learns more spells) override the
// spellsKnown column in their own files.
//
// L:      1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20
const FC_CANTRIPS_KNOWN = [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6];
const FC_SPELLS_KNOWN  = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];

export function fullCasterProgression(opts?: {
  cantripsKnown?: ReadonlyArray<number>;
  spellsKnown?: ReadonlyArray<number>;
}): ReadonlyArray<SpellSlotRow> {
  const cantrips = opts?.cantripsKnown ?? FC_CANTRIPS_KNOWN;
  const spells = opts?.spellsKnown ?? FC_SPELLS_KNOWN;
  return LEVELS.map((_, i) => ({
    cantripsKnown: cantrips[i],
    spellsKnown: spells[i],
    spellSlots: FULL_CASTER_SLOTS[i],
  }));
}

/**
 * Half-caster (Templar / Witch Hunter style) slot table. PG approach pages
 * confirm these classes use the standard 5E half-caster progression, with
 * spellcasting starting at character level 2 (no slots at L1; the L1 spell
 * pick is granted by the approach feature).
 *
 * | Char L | 1st | 2nd | 3rd | 4th | 5th |
 * |     1  |  -  |     |     |     |     |
 * |     2  |  2  |     |     |     |     |
 * |     3  |  3  |     |     |     |     |
 * | …                                       |
 * |    20  |  4  |  3  |  3  |  3  |  2  |
 */
const HALF_CASTER_SLOTS: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0], // L1 (no slots; approach grants 2 via feature)
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // L2
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // L3
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // L4
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // L5
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // L6
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // L7
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // L8
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // L9
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // L10
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // L11
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // L12
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // L13
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // L14
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // L15
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // L16
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // L17
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // L18
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // L19
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // L20
];

// Half-caster cantrips known and spells known (Paladin-style).
const HC_CANTRIPS_KNOWN = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];
const HC_SPELLS_KNOWN  = [1, 3, 4, 5, 6, 6, 7, 7, 9, 10, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];

export function halfCasterProgression(opts?: {
  cantripsKnown?: ReadonlyArray<number>;
  spellsKnown?: ReadonlyArray<number>;
}): ReadonlyArray<SpellSlotRow> {
  const cantrips = opts?.cantripsKnown ?? HC_CANTRIPS_KNOWN;
  const spells = opts?.spellsKnown ?? HC_SPELLS_KNOWN;
  return LEVELS.map((_, i) => ({
    cantripsKnown: cantrips[i],
    spellsKnown: spells[i],
    spellSlots: HALF_CASTER_SLOTS[i],
  }));
}
