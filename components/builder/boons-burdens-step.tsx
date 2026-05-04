"use client";

import type { Ability } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER, ABILITY_SHORT } from "@/lib/character/types";
import { BOONS, BURDENS } from "@/data/feats";
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
import { FeatPickCard } from "@/components/feats/feat-pick-card";
import type { DraftState } from "./use-draft";

export function BoonsBurdensStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;

  const selectedBoonId = draft.boons[0];
  const selectedBoon = selectedBoonId
    ? BOONS.find((b) => b.id === selectedBoonId)
    : undefined;
  const selectedBurdenId = draft.burdens[0];

  function selectBoon(id: string) {
    update((d) => {
      // Toggle: clicking the active boon clears it.
      if (d.boons[0] === id) {
        d.boons = [];
        const { [id]: _drop, ...rest } = d.boonAbilityChoices;
        void _drop;
        d.boonAbilityChoices = rest;
        return;
      }
      d.boons = [id];
      // Clear ability choices for any previously-selected boon, then leave
      // the new boon's slot empty for choice-boons (player picks below).
      d.boonAbilityChoices = {};
    });
  }

  function pickBoonAbility(boonId: string, ability: Ability) {
    update((d) => {
      d.boonAbilityChoices = { ...d.boonAbilityChoices, [boonId]: ability };
    });
  }

  function selectBurden(id: string) {
    update((d) => {
      // Toggle: clicking the active burden clears it (and its choice picks).
      if (d.burdens[0] === id) {
        d.burdens = [];
        const { [id]: _drop, ...rest } = d.burdenAbilityChoices;
        void _drop;
        d.burdenAbilityChoices = rest;
        return;
      }
      d.burdens = [id];
      // Selecting a different burden clears any prior choice picks.
      d.burdenAbilityChoices = {};
    });
  }

  function setBurdenChoiceOne(burdenId: string, ability: Ability) {
    update((d) => {
      d.burdenAbilityChoices = {
        ...d.burdenAbilityChoices,
        [burdenId]: [ability],
      };
    });
  }

  function toggleBurdenChoiceTwo(burdenId: string, ability: Ability) {
    update((d) => {
      const current = d.burdenAbilityChoices[burdenId] ?? [];
      let next: ReadonlyArray<Ability>;
      if (current.includes(ability)) {
        next = current.filter((a) => a !== ability);
      } else if (current.length < 2) {
        next = [...current, ability];
      } else {
        // At max — replace the oldest pick with the new one.
        next = [current[1], ability];
      }
      d.burdenAbilityChoices = {
        ...d.burdenAbilityChoices,
        [burdenId]: next,
      };
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground italic">
        Optional: take a Boon to define a small advantage your character begins with — and, if your table runs them, a Burden you carry too. Both default to none.
      </p>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl tracking-wider">Boons</h3>
          <span className="text-xs text-muted-foreground">
            {selectedBoon ? "1 chosen" : "none"}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {BOONS.map((b) => {
            const isSelected = draft.boons.includes(b.id);
            const forbidden = b.forbiddenOriginIds?.includes(draft.originId) ?? false;
            return (
              <FeatPickCard
                key={b.id}
                feat={b}
                selected={isSelected}
                disabled={forbidden}
                disabledReason={forbidden ? "Already part of your origin." : undefined}
                onSelect={() => selectBoon(b.id)}
                pickedAbility={draft.boonAbilityChoices[b.id]}
                onPickAbility={(ab) => pickBoonAbility(b.id, ab)}
              />
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-xl tracking-wider">Burdens</h3>
          <span className="text-xs text-muted-foreground">
            {selectedBurdenId ? "1 chosen" : "none"}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {BURDENS.map((b) => {
            const isSelected = draft.burdens.includes(b.id);
            const picks = draft.burdenAbilityChoices[b.id] ?? [];
            return (
              <Card
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => selectBurden(b.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectBurden(b.id);
                  }
                }}
                className={cn(
                  "cursor-pointer transition-colors hover:border-ring/60",
                  isSelected && "border-destructive ring-2 ring-destructive/40",
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <CardTitle className="font-display text-lg">{b.name}</CardTitle>
                    {b.abilityBonus && (
                      <Badge
                        variant="outline"
                        className="font-display text-[10px] tracking-widest uppercase"
                      >
                        {burdenBonusLabel(b.abilityBonus, picks)}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs leading-snug">
                    {b.description}
                  </CardDescription>
                </CardHeader>
                {isSelected && b.startingCorruption && (
                  <CardContent className="pt-0">
                    <p className="text-[11px] italic text-destructive/90">
                      Warning: +{b.startingCorruption} permanent Corruption — track manually on the sheet's Corruption panel.
                    </p>
                  </CardContent>
                )}
                {isSelected && b.abilityBonus?.kind === "choose-one" && (
                  <CardContent className="pt-0">
                    <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
                      Pick the ability
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(b.abilityBonus.from ?? ABILITY_ORDER).map((ab) => {
                        const active = picks[0] === ab;
                        return (
                          <Button
                            key={ab}
                            type="button"
                            size="sm"
                            variant={active ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setBurdenChoiceOne(b.id, ab);
                            }}
                          >
                            {ABILITY_LABELS[ab]}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
                {isSelected && b.abilityBonus?.kind === "choose-two" && (
                  <CardContent className="pt-0">
                    <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
                      Pick 2 abilities ({picks.length} of 2)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(b.abilityBonus.from ?? ABILITY_ORDER).map((ab) => {
                        const active = picks.includes(ab);
                        return (
                          <Button
                            key={ab}
                            type="button"
                            size="sm"
                            variant={active ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBurdenChoiceTwo(b.id, ab);
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
          })}
        </div>
      </section>
    </div>
  );
}

function burdenBonusLabel(
  bonus: NonNullable<(typeof BURDENS)[number]["abilityBonus"]>,
  picks: ReadonlyArray<Ability>,
): string {
  if (bonus.kind === "fixed") {
    return `+${bonus.amount} ${ABILITY_SHORT[bonus.ability]}`;
  }
  if (bonus.kind === "choose-one") {
    return picks[0]
      ? `+${bonus.amount} ${ABILITY_SHORT[picks[0]]}`
      : `+${bonus.amount} (choose 1)`;
  }
  // choose-two
  if (picks.length === 2) {
    return `+${bonus.amount} ${ABILITY_SHORT[picks[0]]} · +${bonus.amount} ${ABILITY_SHORT[picks[1]]}`;
  }
  return `+${bonus.amount}/+${bonus.amount} (choose 2)`;
}
