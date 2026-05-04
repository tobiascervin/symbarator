"use client";

// Shared interactive feat card. Used by:
// - L1 wizard's boons step (selection on click, choice-bonus inline picker)
// - level-up dialog's ASI/Feat picker (selection on click, with disabled +
//   reason for unmet prerequisites)
//
// Read-only sheet rendering of feats lives in `components/sheet/feat-card.tsx`
// — that's a separate component because the sheet card has different concerns
// (popover trigger, no selection state).

import type { Ability, FeatDef } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER } from "@/lib/character/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeatPickCardProps {
  feat: FeatDef;
  selected: boolean;
  /** When true the card renders disabled (dashed border + opacity-50) and
   *  click/keypress is a no-op. */
  disabled: boolean;
  /** One-line reason explaining the disabled state. Only shown when `disabled`. */
  disabledReason?: string;
  onSelect(): void;
  /** Optional inline ability picker for `abilityBonus.ability === "choice"`.
   *  Provided by the L1 boons step; level-up picker passes `undefined`. */
  pickedAbility?: Ability;
  onPickAbility?(ability: Ability): void;
}

export function FeatPickCard({
  feat,
  selected,
  disabled,
  disabledReason,
  onSelect,
  pickedAbility,
  onPickAbility,
}: FeatPickCardProps) {
  const restriction = feat.restriction ?? feat.prerequisiteText;
  const showAbilityPicker =
    selected &&
    feat.abilityBonus?.ability === "choice" &&
    typeof onPickAbility === "function";

  return (
    <Card
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "transition-colors",
        disabled
          ? "opacity-50 cursor-not-allowed border-dashed"
          : "cursor-pointer hover:border-ring/60",
        selected && !disabled && "border-primary ring-2 ring-primary/40",
      )}
      aria-disabled={disabled}
      data-feat-id={feat.id}
    >
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between gap-2">
          <CardTitle className="font-display text-lg">{feat.name}</CardTitle>
          {feat.abilityBonus && (
            <Badge
              variant="outline"
              className="font-display text-[10px] tracking-widest uppercase"
            >
              {feat.abilityBonus.ability === "choice"
                ? "+1 choice"
                : `+1 ${feat.abilityBonus.ability.toUpperCase()}`}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs leading-snug">
          {feat.description}
        </CardDescription>
      </CardHeader>
      {restriction && (
        <CardContent className="pt-0">
          <p className="text-[11px] italic text-muted-foreground">
            {feat.category === "boon" ? "Restriction" : "Prerequisite"}: {restriction}
          </p>
        </CardContent>
      )}
      {disabled && disabledReason && (
        <CardContent className="pt-0">
          <p className="text-[11px] italic text-destructive/90" data-testid="feat-disabled-reason">
            {disabledReason}
          </p>
        </CardContent>
      )}
      {showAbilityPicker && (
        <CardContent className="pt-0">
          <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
            Pick the ability
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(feat.abilityBonusChoices ?? ABILITY_ORDER).map((ab) => {
              const active = pickedAbility === ab;
              return (
                <Button
                  key={ab}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPickAbility!(ab);
                  }}
                >
                  {ABILITY_LABELS[ab]}
                </Button>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
