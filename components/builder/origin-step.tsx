"use client";

import { ORIGINS, ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import type { Ability } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER } from "@/lib/character/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DraftState } from "./use-draft";

export function OriginStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;

  const selectedOrigin = ORIGIN_BY_ID[draft.originId];
  const allocated = Object.values(draft.originAsiAllocation).reduce(
    (a, b) => a + (b ?? 0),
    0,
  );
  const target =
    (selectedOrigin?.asi.floating?.count ?? 0) *
    (selectedOrigin?.asi.floating?.size ?? 0);
  const remaining = target - allocated;

  function selectOrigin(id: string) {
    update((d) => {
      d.originId = id;
      d.originAsiAllocation = {};
      d.originSubchoiceId = undefined;
      // reset background since it depends on origin
      if (d.backgroundId) {
        const bg = BACKGROUND_BY_ID[d.backgroundId];
        if (!bg || bg.originId !== id) {
          d.backgroundId = "";
          d.backgroundSkillPicks = [];
          d.backgroundToolPicks = [];
        }
      }
    });
  }

  function selectSubchoice(subId: string) {
    update((d) => {
      d.originSubchoiceId = subId;
    });
  }

  function bumpAlloc(ability: Ability, delta: number) {
    update((d) => {
      const cur = d.originAsiAllocation[ability] ?? 0;
      const next = cur + delta;
      if (next < 0) return;
      d.originAsiAllocation[ability] = next;
    });
  }

  // Which abilities are eligible for the floating ASI bonuses?
  const fixed = selectedOrigin?.asi.fixed ?? {};
  const eligibleForFloating = (ab: Ability): boolean => {
    if (!selectedOrigin) return false;
    const f = selectedOrigin.asi.floating;
    if (!f) return false;
    if (f.rule === "any-other" && ab in fixed) return false;
    if (f.from && !f.from.includes(ab)) return false;
    return true;
  };

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground italic">
        Each origin shapes who you were before adventure called. In Symbaroum,
        your hit points and Hit Dice come from your origin, not your class.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {ORIGINS.map((o) => {
          const isSelected = draft.originId === o.id;
          return (
            <Card
              key={o.id}
              className={cn(
                "cursor-pointer transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/50"
                  : "hover:border-ring/60",
              )}
              onClick={() => selectOrigin(o.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectOrigin(o.id);
                }
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-baseline justify-between">
                  <CardTitle className="font-display text-2xl">
                    {o.name}
                  </CardTitle>
                  <Badge variant="outline" className="font-display tracking-widest">
                    d{o.hitDie}
                  </Badge>
                </div>
                <CardDescription className="italic">{o.flavor}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="text-foreground/80">Speed</span> {o.speed} ft. ·{" "}
                  <span className="text-foreground/80">Size</span>{" "}
                  {o.size === "small" ? "Small" : o.size === "medium" ? "Medium" : "Large"}
                </p>
                <p>
                  <span className="text-foreground/80">ASI:</span>{" "}
                  {Object.entries(o.asi.fixed ?? {})
                    .map(([k, v]) => `${ABILITY_LABELS[k as Ability]} +${v}`)
                    .join(", ") || "—"}
                  {o.asi.floating
                    ? ` · +${o.asi.floating.size} to ${o.asi.floating.count} other${o.asi.floating.count === 1 ? "" : "s"}`
                    : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedOrigin && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="font-display tracking-wider">
              {selectedOrigin.name} — Traits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            {selectedOrigin.features.length > 0 && (
              <ul className="space-y-3">
                {selectedOrigin.features.map((f) => (
                  <li key={f.name}>
                    <p className="font-display tracking-wide text-base text-foreground">
                      {f.name}
                    </p>
                    <p className="text-muted-foreground">{f.description}</p>
                  </li>
                ))}
              </ul>
            )}

            {selectedOrigin.subchoices && (
              <div>
                <p className="font-display tracking-wide text-base mb-2 text-foreground">
                  {selectedOrigin.subchoices.prompt}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedOrigin.subchoices.options.map((opt) => {
                    const isSelected = draft.originSubchoiceId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => selectSubchoice(opt.id)}
                        className={cn(
                          "text-left rounded-md border p-3 transition-colors",
                          isSelected
                            ? "border-primary ring-2 ring-primary/40 bg-primary/5"
                            : "border-border hover:border-ring/60",
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className="font-display text-base text-foreground">
                            {opt.name}
                          </span>
                          {opt.asi && Object.keys(opt.asi).length > 0 && (
                            <span className="text-xs font-display tracking-widest text-primary">
                              {Object.entries(opt.asi)
                                .map(
                                  ([k, v]) =>
                                    `${ABILITY_LABELS[k as Ability]} +${v}`,
                                )
                                .join(", ")}
                            </span>
                          )}
                        </div>
                        {opt.flavor && (
                          <p className="italic text-muted-foreground text-xs mb-2">
                            {opt.flavor}
                          </p>
                        )}
                        {opt.features?.map((f) => (
                          <div key={f.name} className="mt-1">
                            <span className="font-display text-xs tracking-wide text-foreground">
                              {f.name}.
                            </span>{" "}
                            <span className="text-muted-foreground text-xs">
                              {f.description}
                            </span>
                          </div>
                        ))}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedOrigin.asi.floating && target > 0 && (
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
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ABILITY_ORDER.map((ab) => {
                    const eligible = eligibleForFloating(ab);
                    const value = draft.originAsiAllocation[ab] ?? 0;
                    const fixedAt = fixed[ab] ?? 0;
                    // Cell value = origin's fixed contribution + player's
                    // floating allocation. Buttons control only the
                    // floating portion. For non-eligible cells with no
                    // fixed bonus (e.g. Human INT/WIS), the cell stays at
                    // +0 and is dimmed.
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
