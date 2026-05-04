"use client";

import type { Character, WeaponDef, WeaponPropertyData } from "@/lib/character/types";
import { ABILITY_SHORT } from "@/lib/character/types";
import { resolveWeaponAttack } from "@/lib/character/equipment";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  // into a readable comma-separated string.
  const propertyLabels: string[] = [];
  for (const f of weapon.flags) propertyLabels.push(f);
  for (const p of weapon.properties ?? []) {
    if (p.kind === "thrown") propertyLabels.push(`thrown (${p.range[0]}/${p.range[1]} ft)`);
    else if (p.kind === "ammunition") propertyLabels.push(`ammunition (${p.range[0]}/${p.range[1]} ft)`);
    else if (p.kind === "range") propertyLabels.push(`range (${p.range[0]}/${p.range[1]} ft)`);
    else if (p.kind === "versatile")
      propertyLabels.push(`versatile (${p.twoHandedDamage.count}d${p.twoHandedDamage.faces})`);
    else if (p.kind === "area")
      propertyLabels.push(`area (${p.size}-ft ${p.shape})`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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

        {propertyLabels.length > 0 && (
          <p className="text-xs text-muted-foreground leading-snug">
            <span className="font-display tracking-widest text-[10px] uppercase mr-1">
              Properties
            </span>
            {propertyLabels.map((p, i) => (
              <Badge
                key={`${p}-${i}`}
                variant="secondary"
                className="mr-1 text-[10px] tracking-wider uppercase"
              >
                {p}
              </Badge>
            ))}
          </p>
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
