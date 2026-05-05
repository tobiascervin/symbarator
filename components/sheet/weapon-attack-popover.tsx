"use client";

import type { Character, WeaponDef, WeaponPropertyData } from "@/lib/character/types";
import { ABILITY_SHORT } from "@/lib/character/types";
import { resolveWeaponAttack } from "@/lib/character/equipment";
import { ExplainableBadge } from "@/components/sheet/explainable-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  WEAPON_DATA_EXPLANATIONS,
  WEAPON_FLAG_EXPLANATIONS,
  type PropertyExplanation,
} from "@/data/property-explanations";

const CATEGORY_LABEL: Record<WeaponDef["category"], string> = {
  "simple-melee": "Simple Melee",
  "simple-ranged": "Simple Ranged",
  "martial-melee": "Martial Melee",
  "martial-ranged": "Martial Ranged",
  alchemical: "Alchemical",
  siege: "Siege",
};

export interface WeaponAttackPopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  weapon: WeaponDef | null;
  character: Character;
}

/**
 * Read-only attack view for a weapon in companion mode. Mirrors the shape
 * of `<SpellCastPopover>` minus the slot-spend affordance — weapons don't
 * consume a per-attack resource in v1 (ammunition, action economy, and
 * multi-attack are Tier 2). The popover surfaces the live attack mod and
 * damage roll with the character's ability mod folded in. Versatile
 * weapons render both 1H and 2H damage rows.
 */
export function WeaponAttackPopover({
  open,
  onOpenChange,
  weapon,
  character: c,
}: WeaponAttackPopoverProps) {
  if (!weapon) return null;

  const oneHand = resolveWeaponAttack(c, weapon, "1h");
  const versatile = weapon.properties?.find(
    (p): p is Extract<WeaponPropertyData, { kind: "versatile" }> => p.kind === "versatile",
  );
  const twoHand = versatile ? resolveWeaponAttack(c, weapon, "2h") : null;
  const isRanged =
    weapon.category === "simple-ranged" ||
    weapon.category === "martial-ranged" ||
    weapon.category === "alchemical" ||
    weapon.category === "siege";
  const thrown = weapon.properties?.find(
    (p): p is Extract<WeaponPropertyData, { kind: "thrown" }> => p.kind === "thrown",
  );

  // Property display — turn the boolean flag set + parameterized props
  // into a list of badge entries, each carrying the visible label and the
  // catalog explanation surfaced via ExplainableBadge tooltips.
  const propertyEntries: Array<{ label: string; explanation: PropertyExplanation }> = [];
  for (const f of weapon.flags) {
    propertyEntries.push({ label: f, explanation: WEAPON_FLAG_EXPLANATIONS[f] });
  }
  for (const p of weapon.properties ?? []) {
    if (p.kind === "thrown") {
      propertyEntries.push({
        label: `thrown (${p.range[0]}/${p.range[1]} ft)`,
        explanation: WEAPON_DATA_EXPLANATIONS.thrown,
      });
    } else if (p.kind === "ammunition") {
      propertyEntries.push({
        label: `ammunition (${p.range[0]}/${p.range[1]} ft)`,
        explanation: WEAPON_DATA_EXPLANATIONS.ammunition,
      });
    } else if (p.kind === "range") {
      propertyEntries.push({
        label: `range (${p.range[0]}/${p.range[1]} ft)`,
        explanation: WEAPON_DATA_EXPLANATIONS.range,
      });
    } else if (p.kind === "versatile") {
      propertyEntries.push({
        label: `versatile (${p.twoHandedDamage.count}d${p.twoHandedDamage.faces})`,
        explanation: WEAPON_DATA_EXPLANATIONS.versatile,
      });
    } else if (p.kind === "area") {
      propertyEntries.push({
        label: `area (${p.size}-ft ${p.shape})`,
        explanation: WEAPON_DATA_EXPLANATIONS.area,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" mobileVariant="bottom-sheet">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{weapon.name}</DialogTitle>
          <DialogDescription>
            {CATEGORY_LABEL[weapon.category]} · {weapon.damageType}
          </DialogDescription>
        </DialogHeader>

        {/* Attack + damage band. */}
        <div className="rounded-md border border-border p-3 text-sm space-y-1.5">
          <Row label="Attack" value={`${signed(oneHand.attackMod)} to hit (${ABILITY_SHORT[oneHand.abilityUsed]})`} />
          {twoHand ? (
            <>
              <Row
                label="Damage (1H)"
                value={`${formatDamage(oneHand)} ${weapon.damageType}`}
              />
              <Row
                label="Damage (2H)"
                value={`${formatDamage(twoHand)} ${weapon.damageType}`}
              />
            </>
          ) : (
            <Row
              label="Damage"
              value={`${formatDamage(oneHand)} ${weapon.damageType}`}
            />
          )}
          {oneHand.range && (
            <Row
              label={isRanged ? "Range" : "Throw range"}
              value={`${oneHand.range[0]} / ${oneHand.range[1]} ft`}
            />
          )}
          {!isRanged && thrown && !oneHand.range && (
            <Row label="Throw range" value={`${thrown.range[0]} / ${thrown.range[1]} ft`} />
          )}
        </div>

        {propertyEntries.length > 0 && (
          <div className="text-xs text-muted-foreground leading-snug flex flex-wrap items-center gap-1">
            <span className="font-display tracking-widest text-[10px] uppercase">
              Properties
            </span>
            {propertyEntries.map((p, i) => (
              <ExplainableBadge
                key={`${p.label}-${i}`}
                label={p.label}
                explanation={p.explanation}
              />
            ))}
          </div>
        )}

        {weapon.description && (
          <p className="text-sm leading-snug text-foreground/90">{weapon.description}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-display tracking-widest text-[10px] uppercase text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-base">{value}</span>
    </div>
  );
}

function formatDamage(r: ReturnType<typeof resolveWeaponAttack>): string {
  const { damageDice, damageMod } = r;
  if (damageDice.count === 0) return signed(damageMod);
  const dice = damageDice.faces === 1
    ? `${damageDice.count}`
    : `${damageDice.count}d${damageDice.faces}`;
  if (damageMod === 0) return dice;
  return `${dice} ${signed(damageMod)}`;
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
