// Feature-resolution helpers: usage caps that depend on the character (prof
// bonus, level), structured-effect formulas (e.g. Battle Wind's 2d4 + CON
// mod), and source labels for the FeatTapPopover header. Companion-mode
// rest primitives use `findTrackedFeatures` to know which counters to
// restore on long/short rest.

import type {
  Ability,
  Character,
  CharacterLevel,
  FeatureDef,
  FeatureEffect,
  FeatureUsage,
} from "./types";
import { computeFinalAbilities, computeProficiencyBonus } from "./compute";
import { ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { CLASS_BY_ID, approachById } from "@/data/classes";

/**
 * Resolves a feature's max usage count. `"profBonus"` reads
 * `computeProficiencyBonus(c)`; `"level"` reads `c.level`. Numeric counts
 * are returned unchanged. Defensive `Math.max(0, ...)` prevents bizarre
 * negative-cap renderings if the data ever encodes a literal -1.
 */
export function resolveFeatureUsageMax(
  c: Character,
  usage: FeatureUsage,
): number {
  if (typeof usage.count === "number") return Math.max(0, usage.count);
  if (usage.count === "profBonus") return computeProficiencyBonus(c);
  if (usage.count === "level") return c.level;
  // Exhaustiveness guard — adding a new sentinel without updating this
  // helper compiles but renders 0, which is visibly broken.
  return 0;
}

export interface ResolvedFeatureEffect {
  kind: FeatureEffect["kind"];
  /** Pretty-printed dice formula (e.g. "2d4+3" with CON mod folded in). */
  diceFormula?: string;
  /** Resolved ability mod value, surfaced for the UI to label. */
  abilityModValue?: number;
  /** Free-text note for `kind: "passive"` entries that want to say something. */
  note?: string;
}

export function resolveFeatureEffect(
  c: Character,
  feature: FeatureDef,
): ResolvedFeatureEffect | null {
  const eff = feature.effect;
  if (!eff) return null;
  if (eff.kind === "passive") {
    return { kind: "passive", note: eff.note };
  }
  // tempHp
  const mod = eff.addAbilityMod
    ? computeFinalAbilities(c).modifiers[eff.addAbilityMod]
    : 0;
  const dice = `${eff.dice.count}d${eff.dice.faces}`;
  const formula = mod === 0 ? dice : mod > 0 ? `${dice}+${mod}` : `${dice}${mod}`;
  return {
    kind: "tempHp",
    diceFormula: formula,
    abilityModValue: mod,
  };
}

// ---------------------------------------------------------------------------
// Source labels — where did this feature come from?
// ---------------------------------------------------------------------------

export type FeatureSource =
  | { kind: "origin" }
  | { kind: "subchoice" }
  | { kind: "background" }
  | { kind: "class-l1" }
  | { kind: "class"; level: number }
  | { kind: "approach-l1" }
  | { kind: "approach"; level: number }
  | { kind: "boon" }
  | { kind: "burden" }
  | { kind: "feat" };

/**
 * Pretty source label for a feature. Used by the popover header to tell the
 * player where each entry came from ("Warrior L4", "Boon", "Origin: Abducted
 * Human", etc.) — useful when several features share similar names
 * (e.g. Extra Attack at L5, L11, L20).
 */
export function featureSourceLabel(c: Character, source: FeatureSource): string {
  switch (source.kind) {
    case "origin": {
      const o = ORIGIN_BY_ID[c.originId];
      return `Origin: ${o?.name ?? c.originId}`;
    }
    case "subchoice": {
      const o = ORIGIN_BY_ID[c.originId];
      const sub = o?.subchoices?.options.find((s) => s.id === c.originSubchoiceId);
      return sub ? `Origin: ${sub.name}` : "Origin (subchoice)";
    }
    case "background": {
      const bg = BACKGROUND_BY_ID[c.backgroundId];
      return `Background: ${bg?.name ?? c.backgroundId}`;
    }
    case "class-l1": {
      const cls = CLASS_BY_ID[c.classId];
      return `${cls?.name ?? c.classId} L1`;
    }
    case "class": {
      const cls = CLASS_BY_ID[c.classId];
      return `${cls?.name ?? c.classId} L${source.level}`;
    }
    case "approach-l1": {
      const a = approachById(c.approachId);
      return `${a?.name ?? c.approachId} L1`;
    }
    case "approach": {
      const a = approachById(c.approachId);
      return `${a?.name ?? c.approachId} L${source.level}`;
    }
    case "boon":
      return "Boon";
    case "burden":
      return "Burden";
    case "feat":
      return "Feat";
  }
}

// ---------------------------------------------------------------------------
// Tracked features — used by the rest primitives
// ---------------------------------------------------------------------------

export interface TrackedFeature {
  id: string;
  feature: FeatureDef;
  usage: FeatureUsage;
  source: FeatureSource;
}

/**
 * Walks the character's class L1 + per-level class features, plus approach
 * L1 + per-level approach features, and returns every entry that has BOTH
 * a stable `id` AND a `usage` declaration. This is the set the rest
 * primitives operate on, and the set the popover supports the Use button
 * for.
 *
 * When the same `id` appears at multiple class levels (e.g. Action Surge
 * at L2 with 1 use and L17 with 2 uses), only the highest-level entry
 * whose `level <= c.level` is kept — the higher-level entry overrides the
 * earlier one.
 */
export function findTrackedFeatures(c: Character): TrackedFeature[] {
  const cls = CLASS_BY_ID[c.classId];
  const approach = approachById(c.approachId);
  // First collect every id-bearing feature with usage, paired with the
  // character level it was granted at. Last-write-wins per id, walking
  // from L1 → c.level so the latest entry beats earlier ones.
  const map = new Map<string, TrackedFeature>();

  if (cls) {
    for (const f of cls.level1Features) {
      collect(map, f, { kind: "class-l1" });
    }
    for (let i = 0; i < c.level && i < cls.levelTable.length; i++) {
      for (const f of cls.levelTable[i].features) {
        collect(map, f, { kind: "class", level: i + 1 });
      }
    }
  }
  if (approach) {
    for (const f of approach.level1Features) {
      collect(map, f, { kind: "approach-l1" });
    }
    for (let i = 0; i < c.level && i < approach.levelTable.length; i++) {
      for (const f of approach.levelTable[i].features) {
        collect(map, f, { kind: "approach", level: i + 1 });
      }
    }
  }
  return Array.from(map.values());
}

function collect(
  out: Map<string, TrackedFeature>,
  feature: FeatureDef,
  source: FeatureSource,
): void {
  if (!feature.id || !feature.usage) return;
  // Last write wins — by walking L1 → c.level the higher-level entry
  // overrides the earlier one for the same id.
  out.set(feature.id, { id: feature.id, feature, usage: feature.usage, source });
}

/**
 * Convenience: remaining uses for a tracked feature. Lazy: when the
 * character has no entry yet, returns the resolved max.
 */
export function remainingUses(c: Character, t: TrackedFeature): number {
  const stored = c.featureUses[t.id];
  if (typeof stored === "number") return stored;
  return resolveFeatureUsageMax(c, t.usage);
}

// Re-export for parity with how `compute.ts` exposes `proficiencyBonusFor`.
export { computeProficiencyBonus } from "./compute";
export type { CharacterLevel };
