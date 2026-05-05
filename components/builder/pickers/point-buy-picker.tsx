"use client";

import { Button } from "@/components/ui/button";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type Ability,
} from "@/lib/character/types";
import { POINT_BUY_BUDGET, POINT_BUY_COSTS } from "@/lib/character/defaults";
import { cn } from "@/lib/utils";

export interface PointBuyPickerProps {
  abilities: Record<Ability, number>;
  onChange(next: Record<Ability, number>): void;
}

export function PointBuyPicker({ abilities, onChange }: PointBuyPickerProps) {
  const cost = ABILITY_ORDER.reduce(
    (acc, ab) => acc + (POINT_BUY_COSTS[abilities[ab]] ?? 0),
    0,
  );
  const remaining = POINT_BUY_BUDGET - cost;

  function bump(ab: Ability, delta: number) {
    const cur = abilities[ab];
    const next = cur + delta;
    if (next < 8 || next > 15) return;
    const newCost =
      cost - (POINT_BUY_COSTS[cur] ?? 0) + (POINT_BUY_COSTS[next] ?? 0);
    if (newCost > POINT_BUY_BUDGET) return;
    onChange({ ...abilities, [ab]: next });
  }

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Spend exactly {POINT_BUY_BUDGET} points among your abilities (range 8–15).{" "}
        <span
          className={cn(
            "font-semibold",
            remaining === 0 ? "text-emerald-400" : "text-yellow-400",
          )}
        >
          Points remaining: {remaining}
        </span>
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITY_ORDER.map((ab) => (
          <div key={ab} className="rounded-md border border-border p-3 text-center">
            <div className="font-display tracking-widest text-xs uppercase text-muted-foreground mb-1">
              {ABILITY_LABELS[ab]}
            </div>
            <div className="font-display text-3xl py-1">{abilities[ab]}</div>
            <div className="text-xs text-muted-foreground mb-2">
              cost {POINT_BUY_COSTS[abilities[ab]] ?? 0}
            </div>
            <div className="flex justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={abilities[ab] <= 8}
                onClick={() => bump(ab, -1)}
              >
                −
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={abilities[ab] >= 15}
                onClick={() => bump(ab, 1)}
              >
                +
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
