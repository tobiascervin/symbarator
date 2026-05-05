"use client";

import { Button } from "@/components/ui/button";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type Ability,
} from "@/lib/character/types";
import { STANDARD_ARRAY } from "@/lib/character/defaults";

export interface StandardArrayPickerProps {
  abilities: Record<Ability, number>;
  onChange(next: Record<Ability, number>): void;
}

export function StandardArrayPicker({
  abilities,
  onChange,
}: StandardArrayPickerProps) {
  const isPermutation =
    [...STANDARD_ARRAY].sort().join(",") ===
    ABILITY_ORDER.map((a) => abilities[a]).sort().join(",");

  function setAbility(ability: Ability, newScore: number) {
    const prevScore = abilities[ability];
    const swapAb = (Object.keys(abilities) as Ability[]).find(
      (a) => abilities[a] === newScore && a !== ability,
    );
    const next = { ...abilities, [ability]: newScore };
    if (swapAb) next[swapAb] = prevScore;
    onChange(next);
  }

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Assign the array{" "}
        <span className="font-display tracking-widest text-foreground">
          {STANDARD_ARRAY.join(" · ")}
        </span>{" "}
        to your six abilities. Values swap when you choose.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITY_ORDER.map((ab) => (
          <div key={ab} className="rounded-md border border-border p-3">
            <div className="font-display tracking-widest text-xs uppercase text-muted-foreground mb-2">
              {ABILITY_LABELS[ab]}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {STANDARD_ARRAY.map((v) => (
                <Button
                  key={v}
                  variant={abilities[ab] === v ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAbility(ab, v)}
                  className="font-display"
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!isPermutation && (
        <p className="text-sm text-yellow-400">
          Not yet a complete assignment of the array.
        </p>
      )}
    </div>
  );
}
