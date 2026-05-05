"use client";

import { Button } from "@/components/ui/button";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type Ability,
  type BurdenDef,
} from "@/lib/character/types";

export interface BurdenAbilityChoicePickerProps {
  burden: BurdenDef;
  picks: ReadonlyArray<Ability>;
  onChange(picks: ReadonlyArray<Ability>): void;
}

/**
 * Inline ability picker for a choose-one or choose-two burden. Reads the
 * burden's `abilityBonus.from` whitelist (defaults to all six abilities)
 * and the `kind` to enforce single-pick vs two-pick semantics.
 *
 * For choose-two, repeated clicks add up to two distinct picks; clicking
 * a selected pick removes it; clicking a third distinct ability rotates
 * out the oldest pick (matches the wizard's existing behavior).
 */
export function BurdenAbilityChoicePicker({
  burden,
  picks,
  onChange,
}: BurdenAbilityChoicePickerProps) {
  const bonus = burden.abilityBonus;
  if (!bonus || bonus.kind === "fixed") return null;

  const choices = bonus.from ?? ABILITY_ORDER;
  const kind = bonus.kind;

  function pickOne(ab: Ability) {
    onChange([ab]);
  }

  function toggleTwo(ab: Ability) {
    let next: ReadonlyArray<Ability>;
    if (picks.includes(ab)) {
      next = picks.filter((a) => a !== ab);
    } else if (picks.length < 2) {
      next = [...picks, ab];
    } else {
      // Replace oldest pick with the new ability.
      next = [picks[1], ab];
    }
    onChange(next);
  }

  if (kind === "choose-one") {
    return (
      <div>
        <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
          Pick the ability
        </p>
        <div className="flex flex-wrap gap-1.5">
          {choices.map((ab) => {
            const active = picks[0] === ab;
            return (
              <Button
                key={ab}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  pickOne(ab);
                }}
              >
                {ABILITY_LABELS[ab]}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // choose-two
  return (
    <div>
      <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
        Pick 2 abilities ({picks.length} of 2)
      </p>
      <div className="flex flex-wrap gap-1.5">
        {choices.map((ab) => {
          const active = picks.includes(ab);
          return (
            <Button
              key={ab}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                toggleTwo(ab);
              }}
            >
              {ABILITY_LABELS[ab]}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
