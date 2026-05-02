"use client";

import type { Ability } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER } from "@/lib/character/types";
import { BOONS, BURDENS } from "@/data/feats";
import { BOON_FORBIDDEN_ORIGINS } from "@/lib/character/validation";
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
      d.burdens = d.burdens[0] === id ? [] : [id];
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
            const forbidden =
              BOON_FORBIDDEN_ORIGINS[b.id]?.includes(draft.originId) ?? false;
            return (
              <Card
                key={b.id}
                role="button"
                tabIndex={0}
                onClick={() => !forbidden && selectBoon(b.id)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !forbidden) {
                    e.preventDefault();
                    selectBoon(b.id);
                  }
                }}
                className={cn(
                  "transition-colors",
                  forbidden
                    ? "opacity-50 cursor-not-allowed border-dashed"
                    : "cursor-pointer hover:border-ring/60",
                  isSelected && "border-primary ring-2 ring-primary/40",
                )}
                aria-disabled={forbidden}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <CardTitle className="font-display text-lg">{b.name}</CardTitle>
                    {b.abilityBonus && (
                      <Badge variant="outline" className="font-display text-[10px] tracking-widest uppercase">
                        {b.abilityBonus.ability === "choice"
                          ? "+1 choice"
                          : `+1 ${b.abilityBonus.ability.toUpperCase()}`}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs leading-snug">
                    {b.description}
                  </CardDescription>
                </CardHeader>
                {b.restriction && (
                  <CardContent className="pt-0">
                    <p className="text-[11px] italic text-muted-foreground">
                      Restriction: {b.restriction}
                    </p>
                  </CardContent>
                )}
                {isSelected && b.abilityBonus?.ability === "choice" && (
                  <CardContent className="pt-0">
                    <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
                      Pick the ability
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(b.abilityBonusChoices ?? ABILITY_ORDER).map((ab) => {
                        const active = draft.boonAbilityChoices[b.id] === ab;
                        return (
                          <Button
                            key={ab}
                            type="button"
                            size="sm"
                            variant={active ? "default" : "outline"}
                            onClick={(e) => {
                              e.stopPropagation();
                              pickBoonAbility(b.id, ab);
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
                  <CardTitle className="font-display text-lg">{b.name}</CardTitle>
                  <CardDescription className="text-xs leading-snug">
                    {b.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
