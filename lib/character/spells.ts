// Spell-cast math: per-character spell mod / attack / save DC derived from
// the active spellcasting ability, plus per-spell effect resolution that
// applies cantrip-by-level scaling or per-slot upcast scaling. The cast
// popover reads from these helpers; the rest of the sheet does not.

import type {
  Ability,
  Character,
  DamageRoll,
  DamageType,
  DiceExpression,
  SpellDef,
  SpellEffect,
  SpellLevel,
} from "./types";
import { computeFinalAbilities, computeProficiencyBonus } from "./compute";
import { approachById } from "@/data/classes";

/**
 * The active spellcasting ability for the character's approach. Returns the
 * approach's `spellcasting.abilityHint` for spellcasting approaches; `null`
 * for non-spellcasters.
 *
 * NOTE: Sorcerer's "choose any of INT/WIS/CHA at L1" rule (PG p. 117) is not
 * yet honored — the helper returns the approach's hint regardless. Sorcerer
 * players who chose a non-default ability will see the wrong DC. Tracked as
 * an open question in the proposal's design.md; a follow-up adds an override.
 */
export function spellcastingAbility(c: Character): Ability | null {
  const sc = approachById(c.approachId)?.spellcasting;
  return sc?.abilityHint ?? null;
}

/** `proficiencyBonus + spellAbilityMod`, or 0 for non-spellcasters. */
export function spellAttackMod(c: Character): number {
  const ability = spellcastingAbility(c);
  if (!ability) return 0;
  const finals = computeFinalAbilities(c);
  return computeProficiencyBonus(c) + finals.modifiers[ability];
}

/** `8 + proficiencyBonus + spellAbilityMod`, or 8 for non-spellcasters. */
export function spellSaveDc(c: Character): number {
  const ability = spellcastingAbility(c);
  if (!ability) return 8;
  const finals = computeFinalAbilities(c);
  return 8 + computeProficiencyBonus(c) + finals.modifiers[ability];
}

/**
 * The spellcasting ability modifier itself (e.g. `+3` for INT 16). Returns 0
 * for non-spellcasters. Surfaced separately because the popover wants to
 * label "Spell Mod +3 (INT)" alongside the derived attack/DC numbers.
 */
export function spellAbilityModValue(c: Character): number {
  const ability = spellcastingAbility(c);
  if (!ability) return 0;
  return computeFinalAbilities(c).modifiers[ability];
}

// ---------------------------------------------------------------------------
// Resolved spell effect — the popover-ready view
// ---------------------------------------------------------------------------

/**
 * Display-ready effect for a spell at a specific cast level, with scaling
 * (cantrip-by-character-level or upcast-by-slot) already applied. The popover
 * renders directly from this shape.
 */
export interface ResolvedSpellEffect {
  kind: SpellEffect["kind"];
  /** Damage dice + type (attack / save spells; sometimes heal). */
  damage?: { dice: DiceExpression; type: DamageType };
  /** Healing dice (heal-effect spells). */
  healing?: { dice: DiceExpression };
  /** True when the damage roll adds the spellcasting mod. */
  addSpellMod?: boolean;
  /** Save ability + DC for save-effect spells. */
  saveAbility?: Ability;
  saveDc?: number;
  /** Attack mod for attack-effect spells. */
  attackMod?: number;
  /** "half on save" flag — relevant only for save-effect spells. */
  halfOnSave?: boolean;
  /** Free-text rider effect for save spells (e.g. "stunned for 1 minute"). */
  riderEffect?: string;
  /** "What happens on miss" for attack spells. */
  onMiss?: "half" | "none";
  /**
   * Human-readable scaling note ("Scales at L5: 2d10", "Upcast: +1d6 per
   * slot above L1"). The popover surfaces this so the player can see why the
   * dice are what they are.
   */
  scalingNote?: string;
}

/**
 * Resolves a spell's effect for display in the cast popover.
 * - Cantrips (`spell.level === 0`): picks the dice band whose `atLevel` is
 *   the highest threshold ≤ `c.level`. Falls back to the spell's base dice
 *   if no band applies. `castAtLevel` is ignored for cantrips.
 * - Leveled spells with `scaling: "upcast"`: expands the dice by
 *   `(castAtLevel - spell.level)` increments of `perLevel`. Floors at the
 *   base level (a slot below `spell.level` would be invalid; treat as base).
 * - Spells with no `effect`: returns a `kind: "utility"` shape with no dice
 *   or numbers, signaling "no auto-computed effect" to the popover.
 */
export function resolveSpellEffect(
  spell: SpellDef,
  c: Character,
  castAtLevel: SpellLevel,
): ResolvedSpellEffect {
  const effect = spell.effect;
  if (!effect) {
    return { kind: "utility" };
  }

  if (effect.kind === "utility") {
    return { kind: "utility" };
  }

  if (effect.kind === "heal") {
    const baseHealing: DiceExpression = effect.dice;
    const healing = applyUpcast(baseHealing, spell, castAtLevel);
    return {
      kind: "heal",
      healing: { dice: healing.dice },
      addSpellMod: effect.addSpellMod,
      scalingNote: healing.note,
    };
  }

  if (effect.kind === "attack") {
    const baseDamage = effect.damage;
    const scaled =
      spell.level === 0
        ? applyCantripBands(baseDamage.dice, spell, c.level)
        : applyUpcast(baseDamage.dice, spell, castAtLevel);
    return {
      kind: "attack",
      damage: { dice: scaled.dice, type: baseDamage.type },
      addSpellMod: baseDamage.addSpellMod,
      attackMod: spellAttackMod(c),
      onMiss: effect.onMiss,
      scalingNote: scaled.note,
    };
  }

  // save
  const baseDamage: DamageRoll | undefined = effect.damage;
  let damage: { dice: DiceExpression; type: DamageType } | undefined;
  let scalingNote: string | undefined;
  if (baseDamage) {
    const scaled =
      spell.level === 0
        ? applyCantripBands(baseDamage.dice, spell, c.level)
        : applyUpcast(baseDamage.dice, spell, castAtLevel);
    damage = { dice: scaled.dice, type: baseDamage.type };
    scalingNote = scaled.note;
  }
  return {
    kind: "save",
    damage,
    addSpellMod: baseDamage?.addSpellMod,
    saveAbility: effect.ability,
    saveDc: spellSaveDc(c),
    halfOnSave: effect.halfOnSave,
    riderEffect: effect.effect,
    scalingNote,
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function applyCantripBands(
  baseDice: DiceExpression,
  spell: SpellDef,
  characterLevel: number,
): { dice: DiceExpression; note?: string } {
  const scaling = spell.scaling;
  if (scaling?.kind !== "cantrip") return { dice: baseDice };
  // Pick the highest band whose threshold is ≤ characterLevel.
  let active: DiceExpression = baseDice;
  let activeAt: 1 | 5 | 11 | 17 = 1;
  for (const band of scaling.bands) {
    if (characterLevel >= band.atLevel) {
      active = band.dice;
      activeAt = band.atLevel;
    }
  }
  // Build a note describing the next band the character will reach (if any).
  const next = scaling.bands.find((b) => b.atLevel > characterLevel);
  const note = next
    ? `Scales at L${next.atLevel}: ${formatDice(next.dice)}`
    : activeAt > 1
      ? `At L${activeAt}: ${formatDice(active)}`
      : undefined;
  return { dice: active, note };
}

function applyUpcast(
  baseDice: DiceExpression,
  spell: SpellDef,
  castAtLevel: SpellLevel,
): { dice: DiceExpression; note?: string } {
  const scaling = spell.scaling;
  if (scaling?.kind !== "upcast") return { dice: baseDice };
  const slotsAbove = Math.max(0, castAtLevel - spell.level);
  if (slotsAbove === 0) {
    return {
      dice: baseDice,
      note: `Upcast: +${formatDice(scaling.perLevel)} per slot above L${spell.level}`,
    };
  }
  // Both base and perLevel must share the same `faces` for a clean sum;
  // if not, just append the upcast term as a separate dice expression.
  // For v1, all encoded upcasts share faces — assert that and add.
  const dice: DiceExpression = {
    count: baseDice.count + scaling.perLevel.count * slotsAbove,
    faces: baseDice.faces,
    flat: baseDice.flat,
  };
  return {
    dice,
    note: `Cast at L${castAtLevel}: +${slotsAbove}× ${formatDice(scaling.perLevel)}`,
  };
}

function formatDice(d: DiceExpression): string {
  const base = `${d.count}d${d.faces}`;
  if (d.flat && d.flat !== 0) {
    return d.flat > 0 ? `${base}+${d.flat}` : `${base}${d.flat}`;
  }
  return base;
}

/** Re-export so consumers can reuse the same dice formatting as the popover. */
export { formatDice };

/**
 * Same as `formatDice`, but appends the signed spellcasting mod when
 * `addSpellMod` is true (e.g. `1d8+3` for a +3 caster casting Cure Wounds).
 * The popover passes the already-resolved mod value.
 */
export function formatDiceWithMod(
  d: DiceExpression,
  addSpellMod: boolean | undefined,
  modValue: number,
): string {
  const base = formatDice(d);
  if (!addSpellMod || modValue === 0) return base;
  return modValue > 0 ? `${base}+${modValue}` : `${base}${modValue}`;
}
