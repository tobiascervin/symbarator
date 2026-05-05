"use client";

import { Button } from "@/components/ui/button";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type Ability,
  type FeatDef,
} from "@/lib/character/types";

export interface BoonAbilityChoicePickerProps {
  boon: FeatDef;
  value: Ability | undefined;
  onChange(ability: Ability): void;
}

/**
 * Inline ability picker for a choice-boon (`abilityBonus.ability === "choice"`).
 * Renders a row of buttons across the boon's `abilityBonusChoices` (or all six
 * abilities when unset). Click selects; clicking the active selection re-fires
 * onChange so callers may treat that as a no-op.
 */
export function BoonAbilityChoicePicker({
  boon,
  value,
  onChange,
}: BoonAbilityChoicePickerProps) {
  const choices = boon.abilityBonusChoices ?? ABILITY_ORDER;
  return (
    <div>
      <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
        Pick the ability
      </p>
      <div className="flex flex-wrap gap-1.5">
        {choices.map((ab) => {
          const active = value === ab;
          return (
            <Button
              key={ab}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onChange(ab);
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
