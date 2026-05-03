// Level-up engine — pure functions consumed by the level-up dialog.
//
// Convention: a "level-up answers" object is the player's response to every
// LevelChoice surfaced for the new level. The HP gain is special-cased
// because every level past 1 grants HP and there's no LevelChoice for it.

import type {
  Ability,
  ApproachDef,
  ApproachLevelEntry,
  Character,
  CharacterLevel,
  ClassDef,
  ClassLevelEntry,
  FightingStyleId,
  LevelChoice,
} from "./types";
import { ABILITY_ORDER, MAX_CHARACTER_LEVEL } from "./types";
import { CLASS_BY_ID, approachById } from "@/data/classes";
import { averageHpGain, computeHp } from "./compute";

// ---------------------------------------------------------------------------
// Answer shape
// ---------------------------------------------------------------------------

export type LevelUpAnswers = {
  /** HP gained at the new level. Defaults to averageHpGain when "average". */
  hp: { mode: "average" | "manual"; value: number };
  /** One answer per LevelChoice in `requiredChoices`, same order. */
  choices: LevelChoiceAnswer[];
};

export type LevelChoiceAnswer =
  | {
      kind: "asi-or-feat";
      pick:
        | { type: "asi"; allocation: Partial<Record<Ability, number>> } // sums to 2
        | { type: "feat"; featId: string }
        | { type: "change-self" }; // Changeling-only
    }
  | { kind: "fighting-style"; styleId: FightingStyleId }
  | {
      kind: "spells-learned";
      newCantrips: string[];
      newSpells: string[];
      swappedSpellOut?: string;
      swappedSpellIn?: string;
    };

// ---------------------------------------------------------------------------
// Required-choice resolution
// ---------------------------------------------------------------------------

interface NextLevelContext {
  cls: ClassDef;
  approach: ApproachDef;
  classRow: ClassLevelEntry;
  approachRow: ApproachLevelEntry;
  /** Spellcasting deltas vs. the previous level, if the approach casts spells. */
  spellsDelta?: {
    extraCantrips: number;
    extraSpells: number;
    /** Always allow one swap when leveling up a caster, per standard 5E. */
    canSwap: true;
  };
}

function nextLevelContext(c: Character, target: CharacterLevel): NextLevelContext | null {
  const cls = CLASS_BY_ID[c.classId];
  const approach = approachById(c.approachId);
  if (!cls || !approach) return null;
  const classRow = cls.levelTable[target - 1];
  const approachRow = approach.levelTable[target - 1];
  if (!classRow || !approachRow) return null;

  let spellsDelta: NextLevelContext["spellsDelta"];
  const sc = approach.spellcasting;
  if (sc) {
    const cur = sc.progression[c.level - 1];
    const next = sc.progression[target - 1];
    const extraCantrips = Math.max(0, (next?.cantripsKnown ?? 0) - (cur?.cantripsKnown ?? 0));
    const extraSpells = Math.max(0, (next?.spellsKnown ?? 0) - (cur?.spellsKnown ?? 0));
    if (extraCantrips > 0 || extraSpells > 0 || hasNewSlotLevel(cur?.spellSlots, next?.spellSlots)) {
      spellsDelta = { extraCantrips, extraSpells, canSwap: true };
    }
  }

  return { cls, approach, classRow, approachRow, spellsDelta };
}

function hasNewSlotLevel(
  cur: ReadonlyArray<number> | undefined,
  next: ReadonlyArray<number> | undefined,
): boolean {
  if (!next) return false;
  for (let i = 0; i < next.length; i++) {
    if ((cur?.[i] ?? 0) === 0 && next[i] > 0) return true;
  }
  return false;
}

/**
 * Returns every LevelChoice the player must answer when leveling up to `target`.
 * Class choices come first, then approach choices, then a synthetic
 * `spells-learned` choice if the approach casts spells and the new level
 * grants more cantrips/spells (or unlocks a new spell-slot tier).
 */
export function requiredChoices(c: Character, target: CharacterLevel): LevelChoice[] {
  const ctx = nextLevelContext(c, target);
  if (!ctx) return [];
  const all: LevelChoice[] = [
    ...(ctx.classRow.choices ?? []),
    ...(ctx.approachRow.choices ?? []),
  ];
  if (ctx.spellsDelta) {
    all.push({
      kind: "spells-learned",
      cantrips: ctx.spellsDelta.extraCantrips,
      spells: ctx.spellsDelta.extraSpells,
      canSwap: ctx.spellsDelta.canSwap,
    });
  }
  return all;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateLevelUp(
  c: Character,
  target: CharacterLevel,
  answers: LevelUpAnswers,
): string | null {
  if (target <= c.level) return "Target level must be higher than current level.";
  if (target > MAX_CHARACTER_LEVEL) return `Maximum character level is ${MAX_CHARACTER_LEVEL}.`;
  if (target !== c.level + 1) return "Level up one level at a time.";

  const ctx = nextLevelContext(c, target);
  if (!ctx) return "Could not resolve class or approach for the next level.";

  // HP bounds
  const minHp = 1;
  const maxHp = hitDieFor(c) + abilityMod(c.abilities.con + 0); // bound generously; actual con mod is fine
  const hpValue = answers.hp.value;
  if (!Number.isInteger(hpValue) || hpValue < minHp || hpValue > maxHp + 100) {
    return "HP gained must be a positive integer.";
  }

  const choices = requiredChoices(c, target);
  if (answers.choices.length !== choices.length) {
    return `Answer all ${choices.length} required choice${choices.length === 1 ? "" : "s"} for this level.`;
  }

  for (let i = 0; i < choices.length; i++) {
    const err = validateChoiceAnswer(c, choices[i], answers.choices[i]);
    if (err) return err;
  }

  return null;
}

function validateChoiceAnswer(
  c: Character,
  choice: LevelChoice,
  answer: LevelChoiceAnswer,
): string | null {
  if (choice.kind !== answer.kind) {
    return `Internal error: choice/answer kind mismatch (${choice.kind} vs ${answer.kind}).`;
  }
  switch (choice.kind) {
    case "asi-or-feat": {
      if (answer.kind !== "asi-or-feat") return "Bad answer kind.";
      const pick = answer.pick;
      if (pick.type === "asi") {
        const total = ABILITY_ORDER.reduce((sum, a) => sum + (pick.allocation[a] ?? 0), 0);
        if (total !== 2) return "ASI must allocate exactly 2 points (+2 to one ability or +1 to two).";
        for (const a of ABILITY_ORDER) {
          const v = pick.allocation[a] ?? 0;
          if (v < 0 || v > 2) return `Bad ASI allocation for ${a}.`;
          const newScore = c.abilities[a] + v;
          if (newScore > 20) return `${a.toUpperCase()} cannot exceed 20 (would be ${newScore}).`;
        }
        return null;
      }
      if (pick.type === "feat") {
        if (!pick.featId) return "Pick a feat.";
        return null;
      }
      // change-self
      if (c.originId !== "changeling") {
        return "Only Changeling characters may take Change Self.";
      }
      return null;
    }
    case "fighting-style": {
      if (answer.kind !== "fighting-style") return "Bad answer kind.";
      if (!choice.from.includes(answer.styleId)) {
        return "Pick a fighting style from the offered list.";
      }
      return null;
    }
    case "spells-learned": {
      if (answer.kind !== "spells-learned") return "Bad answer kind.";
      const expectedC = choice.cantrips ?? 0;
      const expectedS = choice.spells ?? 0;
      if (answer.newCantrips.length !== expectedC) {
        return `Pick exactly ${expectedC} new cantrip${expectedC === 1 ? "" : "s"}.`;
      }
      if (answer.newSpells.length !== expectedS) {
        return `Pick exactly ${expectedS} new spell${expectedS === 1 ? "" : "s"}.`;
      }
      // Reject duplicates against currently-known and within the pick itself.
      const knownCantrips = new Set(c.spellPicks?.cantrips ?? []);
      const knownSpells = new Set(c.spellPicks?.spellsKnown ?? []);
      for (const id of answer.newCantrips) {
        if (knownCantrips.has(id)) return `You already know the cantrip "${id}".`;
      }
      if (new Set(answer.newCantrips).size !== answer.newCantrips.length) {
        return "Cannot pick the same cantrip twice.";
      }
      for (const id of answer.newSpells) {
        if (knownSpells.has(id)) return `You already know the spell "${id}".`;
      }
      if (new Set(answer.newSpells).size !== answer.newSpells.length) {
        return "Cannot pick the same spell twice.";
      }
      if (choice.canSwap) {
        const out = answer.swappedSpellOut;
        const swapIn = answer.swappedSpellIn;
        if ((out && !swapIn) || (!out && swapIn)) {
          return "Swap requires both an outgoing and incoming spell.";
        }
        if (out && !c.spellPicks?.spellsKnown.includes(out)) {
          return "You can only swap out a spell you currently know.";
        }
        if (swapIn && (knownSpells.has(swapIn) || answer.newSpells.includes(swapIn))) {
          return "Swap-in spell must be one you don't already know.";
        }
      }
      return null;
    }
    default: {
      // Exhaustiveness check.
      const _exhaustive: never = choice;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

export function applyLevelUp(
  c: Character,
  target: CharacterLevel,
  answers: LevelUpAnswers,
): Character {
  const next: Character = JSON.parse(JSON.stringify(c));
  next.level = target;
  const oldMax = next.maxHp || computeHp(next);
  next.maxHp = oldMax + answers.hp.value;
  // Companion-mode: bump live HP by the same delta so a wounded character
  // gains room without auto-healing. New HD slot at every level. Newly-
  // unlocked spell-slot tiers start full (already-existing tiers keep their
  // current spent count — only a long rest restores those).
  next.currentHp = (next.currentHp ?? oldMax) + answers.hp.value;
  next.hitDiceRemaining = (next.hitDiceRemaining ?? 0) + 1;

  const sc = approachById(next.approachId)?.spellcasting;
  if (sc) {
    const prev = sc.progression[c.level - 1];
    const now = sc.progression[target - 1];
    if (prev && now) {
      const slots = [...(next.currentSpellSlots ?? new Array(9).fill(0))];
      while (slots.length < 9) slots.push(0);
      for (let i = 0; i < 9; i++) {
        if ((prev.spellSlots[i] ?? 0) === 0 && (now.spellSlots[i] ?? 0) > 0) {
          slots[i] = now.spellSlots[i];
        }
      }
      next.currentSpellSlots = slots;
    }
  }

  const choices = requiredChoices(c, target);
  for (let i = 0; i < choices.length; i++) {
    applyChoiceAnswer(next, choices[i], answers.choices[i]);
  }

  next.updatedAt = new Date().toISOString();
  return next;
}

function applyChoiceAnswer(
  c: Character,
  choice: LevelChoice,
  answer: LevelChoiceAnswer,
): void {
  switch (choice.kind) {
    case "asi-or-feat": {
      if (answer.kind !== "asi-or-feat") return;
      const pick = answer.pick;
      if (pick.type === "asi") {
        for (const a of ABILITY_ORDER) {
          c.abilities[a] += pick.allocation[a] ?? 0;
        }
      } else if (pick.type === "feat") {
        c.feats.push(pick.featId);
      } else {
        // change-self consumes the slot but registers a sentinel feat id.
        c.feats.push("change-self");
      }
      return;
    }
    case "fighting-style": {
      if (answer.kind !== "fighting-style") return;
      // Capture as a feat-style identifier; the sheet aggregates from feats.
      c.feats.push(`fighting-style:${answer.styleId}`);
      return;
    }
    case "spells-learned": {
      if (answer.kind !== "spells-learned") return;
      const picks = c.spellPicks ?? { cantrips: [], spellsKnown: [] };
      const cantrips = [...picks.cantrips, ...answer.newCantrips];
      let spellsKnown = [...picks.spellsKnown, ...answer.newSpells];
      if (answer.swappedSpellOut && answer.swappedSpellIn) {
        spellsKnown = spellsKnown.filter((s) => s !== answer.swappedSpellOut);
        spellsKnown.push(answer.swappedSpellIn);
      }
      c.spellPicks = { cantrips, spellsKnown };
      return;
    }
    default: {
      const _exhaustive: never = choice;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function hitDieFor(c: Character): number {
  // Origin-determined; fallback to class fallbackHitDie.
  // Avoids importing origin lookup twice; we re-use averageHpGain logic
  // implicitly via the bound. This is an upper bound for HP validation only.
  const cls = CLASS_BY_ID[c.classId];
  return cls?.fallbackHitDie ?? 12;
}

export { averageHpGain };
