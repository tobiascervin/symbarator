"use client";

import { Button } from "@/components/ui/button";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type Ability,
} from "@/lib/character/types";
import type { OriginDef } from "@/lib/character/types";
import { cn } from "@/lib/utils";

export interface FloatingAsiPickerProps {
  origin: OriginDef;
  allocation: Partial<Record<Ability, number>>;
  onChange(next: Partial<Record<Ability, number>>): void;
  /** When true, render the ability cells as 3 columns (always) rather than
   *  responsive `grid-cols-3 sm:grid-cols-6`. Set by callers in narrow
   *  containers like the sheet's L1 ability-editor dialog where 6 columns
   *  would crush the long ability labels (Constitution / Intelligence). */
  compact?: boolean;
}

/**
 * +/- allocator for an origin's floating ASI. The cell value combines the
 * origin's fixed bonus for the ability with the player's floating
 * allocation; buttons mutate only the floating portion. Honors
 * `asi.floating.from` (whitelist) and `asi.floating.rule === "any-other"`
 * (any ability not already on the fixed list). The total floating points
 * the player MUST allocate is `count × size`.
 */
export function FloatingAsiPicker({
  origin,
  allocation,
  onChange,
  compact = false,
}: FloatingAsiPickerProps) {
  const floating = origin.asi.floating;
  const fixed = origin.asi.fixed ?? {};
  const target = (floating?.count ?? 0) * (floating?.size ?? 0);
  const allocated = Object.values(allocation).reduce(
    (a, b) => a + (b ?? 0),
    0,
  );
  const remaining = target - allocated;

  function eligibleForFloating(ab: Ability): boolean {
    if (!floating) return false;
    if (floating.rule === "any-other" && ab in fixed) return false;
    if (floating.from && !floating.from.includes(ab)) return false;
    return true;
  }

  function bumpAlloc(ability: Ability, delta: number) {
    const cur = allocation[ability] ?? 0;
    const next = cur + delta;
    if (next < 0) return;
    onChange({ ...allocation, [ability]: next });
  }

  if (!floating || target === 0) return null;

  return (
    <div>
      <p className="font-display tracking-wide text-base mb-2 text-foreground">
        Allocate floating ability bonuses
      </p>
      <p className="text-muted-foreground mb-3">
        Distribute{" "}
        <span className="text-primary font-semibold">{target}</span>{" "}
        point{target === 1 ? "" : "s"} across abilities.{" "}
        <span
          className={cn(
            "font-semibold",
            remaining === 0
              ? "text-emerald-400"
              : remaining > 0
                ? "text-yellow-400"
                : "text-destructive",
          )}
        >
          Remaining: {remaining}
        </span>
      </p>
      <div
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-6",
        )}
      >
        {ABILITY_ORDER.map((ab) => {
          const eligible = eligibleForFloating(ab);
          const value = allocation[ab] ?? 0;
          const fixedAt = fixed[ab] ?? 0;
          const total = fixedAt + value;
          const dim = !eligible && fixedAt === 0;
          return (
            <div
              key={ab}
              className={cn(
                "rounded-md border p-2 text-center",
                dim && "opacity-40",
              )}
            >
              <div className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                {ABILITY_LABELS[ab]}
              </div>
              <div className="text-2xl font-display py-1">+{total}</div>
              <div className="flex justify-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={!eligible || value === 0}
                  onClick={() => bumpAlloc(ab, -1)}
                >
                  −
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={!eligible || remaining === 0}
                  onClick={() => bumpAlloc(ab, 1)}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
