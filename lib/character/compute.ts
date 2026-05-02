// Derived statistics from a Character draft + reference data.

import type { Ability, Character, SkillId } from "./types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { CLASS_BY_ID, approachById } from "@/data/classes";
import { SKILL_BY_ID } from "@/data/skills";

export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function proficiencyBonusFor(level: number): number {
  if (level < 5) return 2;
  if (level < 9) return 3;
  if (level < 13) return 4;
  if (level < 17) return 5;
  return 6;
}

export interface FinalAbilities {
  base: Record<Ability, number>;
  bonuses: Record<Ability, number>;
  total: Record<Ability, number>;
  modifiers: Record<Ability, number>;
}

export function computeFinalAbilities(c: Character): FinalAbilities {
  const origin = ORIGIN_BY_ID[c.originId];
  const fixed = origin?.asi.fixed ?? {};
  const floating = c.originAsiAllocation;
  const subchoice = origin?.subchoices?.options.find(
    (o) => o.id === c.originSubchoiceId,
  );
  const subchoiceAsi = subchoice?.asi ?? {};

  const bonuses: Record<Ability, number> = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  };

  for (const k of Object.keys(bonuses) as Ability[]) {
    bonuses[k] =
      (fixed[k] ?? 0) + (floating[k] ?? 0) + (subchoiceAsi[k] ?? 0);
  }

  // Apply boon ability bonuses (the boon list provides +1).
  // (Boon resolution happens in step 7 / sheet view.)

  const total = {
    str: c.abilities.str + bonuses.str,
    dex: c.abilities.dex + bonuses.dex,
    con: c.abilities.con + bonuses.con,
    int: c.abilities.int + bonuses.int,
    wis: c.abilities.wis + bonuses.wis,
    cha: c.abilities.cha + bonuses.cha,
  };

  const modifiers: Record<Ability, number> = {
    str: abilityMod(total.str),
    dex: abilityMod(total.dex),
    con: abilityMod(total.con),
    int: abilityMod(total.int),
    wis: abilityMod(total.wis),
    cha: abilityMod(total.cha),
  };

  return { base: c.abilities, bonuses, total, modifiers };
}

export function computeHp(c: Character): number {
  const origin = ORIGIN_BY_ID[c.originId];
  const cls = CLASS_BY_ID[c.classId];
  const subchoice = origin?.subchoices?.options.find(
    (o) => o.id === c.originSubchoiceId,
  );
  const conMod = abilityMod(
    c.abilities.con +
      (origin?.asi.fixed?.con ?? 0) +
      (c.originAsiAllocation.con ?? 0) +
      (subchoice?.asi?.con ?? 0),
  );
  const hitDie = origin?.providesHp ? origin.hitDie : (cls?.fallbackHitDie ?? 8);
  return hitDie + conMod;
}

export function computeProficiencyBonus(c: Character): number {
  return proficiencyBonusFor(c.level);
}

export function computeCorruptionThreshold(c: Character): number {
  const cls = CLASS_BY_ID[c.classId];
  const finals = computeFinalAbilities(c);
  const profBonus = computeProficiencyBonus(c);

  if (cls?.shadowFormula === "mystic") {
    // Mystic: spellcasting ability mod (default Cha here) + prof bonus, min 2.
    // Approaches override the ability — we approximate using Cha unless mods say otherwise.
    return Math.max(2, finals.modifiers.cha + profBonus);
  }
  // Standard: 2× prof bonus + Cha modifier, min 2.
  return Math.max(2, profBonus * 2 + finals.modifiers.cha);
}

/** All skill proficiencies the character has, merging origin features (e.g. Goblin),
 *  background, and class picks — without duplicates. */
export function computeSkillProficiencies(c: Character): Set<SkillId> {
  const set = new Set<SkillId>();

  // Origin-granted skills (Goblin: Stealth & Survival via Survival Instinct).
  if (c.originId === "goblin") {
    set.add("stealth");
    set.add("survival");
  }

  const bg = BACKGROUND_BY_ID[c.backgroundId];
  if (bg) {
    bg.skillProficiencies.forEach((s) => set.add(s));
    c.backgroundSkillPicks.forEach((s) => set.add(s));
  }

  c.classSkillPicks.forEach((s) => set.add(s));

  return set;
}

export interface SkillScore {
  skill: SkillId;
  modifier: number;
  proficient: boolean;
}

export function computeSkillScores(c: Character): SkillScore[] {
  const finals = computeFinalAbilities(c);
  const proficiencies = computeSkillProficiencies(c);
  const profBonus = computeProficiencyBonus(c);

  return (Object.keys(SKILL_BY_ID) as SkillId[]).map((skillId) => {
    const skill = SKILL_BY_ID[skillId];
    const proficient = proficiencies.has(skillId);
    const mod = finals.modifiers[skill.ability] + (proficient ? profBonus : 0);
    return { skill: skillId, modifier: mod, proficient };
  });
}

export interface SaveScore {
  ability: Ability;
  modifier: number;
  proficient: boolean;
}

export function computeSavingThrows(c: Character): SaveScore[] {
  const finals = computeFinalAbilities(c);
  const cls = CLASS_BY_ID[c.classId];
  const profBonus = computeProficiencyBonus(c);
  const proficient = new Set(cls?.proficiencies.savingThrows ?? []);
  return (["str", "dex", "con", "int", "wis", "cha"] as Ability[]).map((ab) => {
    const isProf = proficient.has(ab);
    return {
      ability: ab,
      modifier: finals.modifiers[ab] + (isProf ? profBonus : 0),
      proficient: isProf,
    };
  });
}

/** Spell slots and known counts at level 1 (Mystic only). */
export function computeSpellcasting(c: Character) {
  const cls = CLASS_BY_ID[c.classId];
  if (!cls?.spellcasting) return null;
  return {
    cantripsKnown: cls.spellcasting.cantripsKnownAt1,
    spellsKnown: cls.spellcasting.spellsKnownAt1,
    slotsLevel1: cls.spellcasting.spellSlotsAt1,
    tradition: approachById(c.approachId)?.tradition ?? null,
  };
}

export function computeInitiative(c: Character): number {
  return computeFinalAbilities(c).modifiers.dex;
}
