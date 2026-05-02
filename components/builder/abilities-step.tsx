"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ABILITY_LABELS, ABILITY_ORDER } from "@/lib/character/types";
import type { Ability, Character } from "@/lib/character/types";
import { ORIGIN_BY_ID } from "@/data/origins";
import {
  STANDARD_ARRAY,
  POINT_BUY_BUDGET,
  POINT_BUY_COSTS,
} from "@/lib/character/defaults";
import { abilityMod, formatMod } from "@/lib/character/compute";
import { cn } from "@/lib/utils";
import type { DraftState } from "./use-draft";

export function AbilitiesStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;

  const origin = ORIGIN_BY_ID[draft.originId];
  const fixed = origin?.asi.fixed ?? {};
  const floating = draft.originAsiAllocation;

  function setMethod(m: "standard-array" | "point-buy" | "manual") {
    update((d) => {
      d.abilityMethod = m;
      if (m === "standard-array") {
        d.abilities = { str: 8, dex: 10, con: 12, int: 13, wis: 14, cha: 15 };
      } else if (m === "point-buy") {
        d.abilities = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
      }
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground italic">
        Set your base ability scores. Origin bonuses are added automatically — what you set here is the raw base.
      </p>

      <Tabs
        value={draft.abilityMethod}
        onValueChange={(v) => setMethod(v as never)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="standard-array">Standard Array</TabsTrigger>
          <TabsTrigger value="point-buy">Point Buy</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="standard-array">
          <StandardArrayPicker draft={draft} update={update} />
        </TabsContent>
        <TabsContent value="point-buy">
          <PointBuyPicker draft={draft} update={update} />
        </TabsContent>
        <TabsContent value="manual">
          <ManualPicker draft={draft} update={update} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Final Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ABILITY_ORDER.map((ab) => {
              const bonus = (fixed[ab] ?? 0) + (floating[ab] ?? 0);
              const total = draft.abilities[ab] + bonus;
              const mod = abilityMod(total);
              return (
                <div key={ab} className="rounded-md border border-border p-3 text-center">
                  <div className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                    {ABILITY_LABELS[ab]}
                  </div>
                  <div className="font-display text-3xl py-1">{total}</div>
                  <div className="text-sm text-muted-foreground">
                    base {draft.abilities[ab]}
                    {bonus !== 0 && (
                      <>
                        {" "}+{bonus}
                      </>
                    )}
                  </div>
                  <div className="font-display text-base mt-1">{formatMod(mod)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StandardArrayPicker({
  draft,
  update,
}: {
  draft: Character;
  update: DraftState["update"];
}) {
  // We treat draft.abilities as a permutation of STANDARD_ARRAY.
  // UI: each ability has a select with the 6 array values, with no duplicates.
  const used = new Map<number, Ability>();
  ABILITY_ORDER.forEach((ab) => {
    used.set(draft.abilities[ab], ab);
  });

  const isPermutation =
    [...STANDARD_ARRAY].sort().join(",") ===
    ABILITY_ORDER.map((a) => draft.abilities[a]).sort().join(",");

  function setAbility(ability: Ability, newScore: number) {
    update((d) => {
      const prevScore = d.abilities[ability];
      const swapAb = (Object.keys(d.abilities) as Ability[]).find(
        (a) => d.abilities[a] === newScore && a !== ability,
      );
      d.abilities[ability] = newScore;
      if (swapAb) d.abilities[swapAb] = prevScore;
    });
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
                  variant={draft.abilities[ab] === v ? "default" : "outline"}
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

function PointBuyPicker({
  draft,
  update,
}: {
  draft: Character;
  update: DraftState["update"];
}) {
  const cost = ABILITY_ORDER.reduce(
    (acc, ab) => acc + (POINT_BUY_COSTS[draft.abilities[ab]] ?? 0),
    0,
  );
  const remaining = POINT_BUY_BUDGET - cost;

  function bump(ab: Ability, delta: number) {
    update((d) => {
      const cur = d.abilities[ab];
      const next = cur + delta;
      if (next < 8 || next > 15) return;
      const newCost =
        cost - (POINT_BUY_COSTS[cur] ?? 0) + (POINT_BUY_COSTS[next] ?? 0);
      if (newCost > POINT_BUY_BUDGET) return;
      d.abilities[ab] = next;
    });
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
            <div className="font-display text-3xl py-1">{draft.abilities[ab]}</div>
            <div className="text-xs text-muted-foreground mb-2">
              cost {POINT_BUY_COSTS[draft.abilities[ab]] ?? 0}
            </div>
            <div className="flex justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={draft.abilities[ab] <= 8}
                onClick={() => bump(ab, -1)}
              >
                −
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                disabled={draft.abilities[ab] >= 15}
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

function ManualPicker({
  draft,
  update,
}: {
  draft: Character;
  update: DraftState["update"];
}) {
  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Type any value 3–20. Useful for table house rules or rolled stats.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITY_ORDER.map((ab) => (
          <div key={ab} className="rounded-md border border-border p-3">
            <label className="block">
              <span className="font-display tracking-widest text-xs uppercase text-muted-foreground">
                {ABILITY_LABELS[ab]}
              </span>
              <input
                type="number"
                min={3}
                max={20}
                value={draft.abilities[ab]}
                onChange={(e) =>
                  update((d) => {
                    const n = Number.parseInt(e.target.value, 10);
                    if (Number.isFinite(n)) d.abilities[ab] = Math.max(3, Math.min(20, n));
                  })
                }
                className="w-full mt-1 px-2 py-1 rounded bg-input/40 border border-border font-display text-2xl text-center"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

