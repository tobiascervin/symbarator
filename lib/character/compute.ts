// Derived statistics from a Character draft + reference data.

import type { Ability, Character, SkillId } from "./types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { CLASS_BY_ID, approachById } from "@/data/classes";
import { SKILL_BY_ID } from "@/data/skills";
import { BOON_BY_ID, BURDEN_BY_ID } from "@/data/feats";

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

/**
 * Sums the +1 ability bonuses contributed by each boon in `c.boons`. For
 * fixed-ability boons (e.g. Archivist → INT), the bonus goes to that
 * ability. For choice-boons (`abilityBonus.ability === "choice"`), the
 * bonus goes to `c.boonAbilityChoices[boonId]` if a choice has been made;
 * otherwise the boon contributes nothing.
 */
function boonBonusesFor(c: Character): Record<Ability, number> {
  const acc: Record<Ability, number> = {
    str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0,
  };
  for (const id of c.boons) {
    const boon = BOON_BY_ID[id];
    const bump = boon?.abilityBonus;
    if (!bump) continue;
    const ability =
      bump.ability === "choice" ? c.boonAbilityChoices[id] : bump.ability;
    if (!ability) continue; // choice not yet made
    acc[ability] += bump.amount;
  }
  return acc;
}

/**
 * Sums the +2 (or +1/+1 for Dark Blood) ability bonuses contributed by each
 * burden in `c.burdens`. Three shapes:
 * - `fixed`: bonus goes to the named ability.
 * - `choose-one`: bonus goes to the single ability in `burdenAbilityChoices[id]`,
 *   when present (otherwise the burden contributes nothing — the wizard
 *   validator catches this case at advance time).
 * - `choose-two`: bonus is added to each ability in `burdenAbilityChoices[id]`,
 *   for every entry present (typically two; tolerates 0–2 for hand-edited JSON).
 */
function burdenBonusesFor(c: Character): Record<Ability, number> {
  const acc: Record<Ability, number> = {
    str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0,
  };
  for (const id of c.burdens) {
    const burden = BURDEN_BY_ID[id];
    const bonus = burden?.abilityBonus;
    if (!bonus) continue;
    if (bonus.kind === "fixed") {
      acc[bonus.ability] += bonus.amount;
      continue;
    }
    const choices = c.burdenAbilityChoices[id];
    if (!choices) continue; // choice not yet made
    for (const ab of choices) acc[ab] += bonus.amount;
  }
  return acc;
}

export function computeFinalAbilities(c: Character): FinalAbilities {
  const origin = ORIGIN_BY_ID[c.originId];
  const fixed = origin?.asi.fixed ?? {};
  const floating = c.originAsiAllocation;
  const subchoice = origin?.subchoices?.options.find(
    (o) => o.id === c.originSubchoiceId,
  );
  const subchoiceAsi = subchoice?.asi ?? {};
  const boon = boonBonusesFor(c);
  const burden = burdenBonusesFor(c);

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
      (fixed[k] ?? 0)
      + (floating[k] ?? 0)
      + (subchoiceAsi[k] ?? 0)
      + boon[k]
      + burden[k];
  }

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

/**
 * Returns the character's max HP. Prefers the persisted `maxHp` (set at
 * creation and incremented per level-up), falling back to the L1 derivation
 * (origin hit die + Con mod) for legacy saves and pre-creation drafts where
 * `maxHp` is still 0.
 */
export function computeHp(c: Character): number {
  if (c.maxHp && c.maxHp > 0) return c.maxHp;
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

/**
 * Average HP gained on a level-up (level ≥ 2): floor(hitDie / 2) + 1 + Con mod.
 * Standard 5E rule. Bounded so a creature with terrible Con can't go below 1.
 */
export function averageHpGain(c: Character): number {
  const origin = ORIGIN_BY_ID[c.originId];
  const cls = CLASS_BY_ID[c.classId];
  const hitDie = origin?.providesHp ? origin.hitDie : (cls?.fallbackHitDie ?? 8);
  const conMod = computeFinalAbilities(c).modifiers.con;
  return Math.max(1, Math.floor(hitDie / 2) + 1 + conMod);
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
  // Standard: 2× prof bonus + Cha modifier, min 2. Some approaches (PG p. 143
  // — Warrior/Templar is the canonical case) MAY declare a
  // `corruptionAbilityOverride`, in which case the ability mod becomes
  // `max(chaMod, overrideMod)`. The override is intentionally scoped to this
  // branch only; it MUST NOT generalize to mystic-formula classes.
  const override = approachById(c.approachId)?.corruptionAbilityOverride;
  const standardAbilityMod = override
    ? Math.max(finals.modifiers.cha, finals.modifiers[override])
    : finals.modifiers.cha;
  return Math.max(2, profBonus * 2 + standardAbilityMod);
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

/**
 * Spell slots and known counts at the character's current level. Returns null
 * for non-spellcasting approaches. Reads the approach-level progression
 * table introduced in the leveling change.
 */
export function computeSpellcasting(c: Character) {
  const approach = approachById(c.approachId);
  const sc = approach?.spellcasting;
  if (!sc) return null;
  const row = sc.progression[Math.max(0, c.level - 1)];
  return {
    cantripsKnown: row?.cantripsKnown ?? sc.cantripsKnownAt1,
    spellsKnown: row?.spellsKnown ?? sc.spellsKnownAt1,
    slotsLevel1: row?.spellSlots[0] ?? sc.spellSlotsAt1,
    /** Slots per spell level, indexes 0..8 → spell levels 1..9. */
    spellSlots: row?.spellSlots ?? [sc.spellSlotsAt1, 0, 0, 0, 0, 0, 0, 0, 0],
    tradition: approach?.tradition ?? null,
    abilityHint: sc.abilityHint,
    /** Spells the approach grants automatically, on top of player picks. */
    grantedSpells: sc.alwaysKnownSpells ?? [],
  };
}

export function computeInitiative(c: Character): number {
  return computeFinalAbilities(c).modifiers.dex;
}

/**
 * Aggregates every "feature" the character has earned through their current
 * level, in display order: origin features (and subchoice features), then
 * each class level's features from L1 up to current level, then each
 * approach level's features. Includes class L1 + approach L1 features that
 * still live on the legacy `level1Features` field.
 */
export function computeFeatures(c: Character): Array<{ source: string; name: string; description: string }> {
  const out: Array<{ source: string; name: string; description: string }> = [];
  const origin = ORIGIN_BY_ID[c.originId];
  if (origin) {
    for (const f of origin.features) out.push({ source: origin.name, ...f });
    const sub = origin.subchoices?.options.find((o) => o.id === c.originSubchoiceId);
    if (sub?.features) for (const f of sub.features) out.push({ source: sub.name, ...f });
  }
  const cls = CLASS_BY_ID[c.classId];
  if (cls) {
    for (const f of cls.level1Features) out.push({ source: cls.name, ...f });
    for (let i = 0; i < c.level && i < cls.levelTable.length; i++) {
      for (const f of cls.levelTable[i].features) {
        out.push({ source: `${cls.name} L${i + 1}`, ...f });
      }
    }
  }
  const approach = approachById(c.approachId);
  if (approach) {
    for (const f of approach.level1Features) out.push({ source: approach.name, ...f });
    for (let i = 0; i < c.level && i < approach.levelTable.length; i++) {
      for (const f of approach.levelTable[i].features) {
        out.push({ source: `${approach.name} L${i + 1}`, ...f });
      }
    }
  }
  return out;
}

/**
 * Thin re-export so the sheet doesn't need to import `lib/character/equipment.ts`
 * directly. Kept here alongside the rest of the per-character compute helpers.
 */
export { computeAC as computeArmorClass } from "./equipment";
