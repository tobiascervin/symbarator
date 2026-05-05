"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ABILITY_LABELS, ABILITY_ORDER } from "@/lib/character/types";
import type { Character } from "@/lib/character/types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { abilityMod, formatMod } from "@/lib/character/compute";
import { StandardArrayPicker } from "./pickers/standard-array-picker";
import { PointBuyPicker } from "./pickers/point-buy-picker";
import { ManualPicker } from "./pickers/manual-picker";
import type { DraftState } from "./use-draft";

export function AbilitiesStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;

  const origin = ORIGIN_BY_ID[draft.originId];
  const fixed = origin?.asi.fixed ?? {};
  const floating = draft.originAsiAllocation;
  // Keep the origin portion of this bonus aligned with `computeFinalAbilities`
  // in lib/character/compute.ts — fixed + floating + sub-choice. Boons and
  // burdens are picked on a later step, so they're not folded in here.
  const subAsi =
    origin?.subchoices?.options.find((o) => o.id === draft.originSubchoiceId)
      ?.asi ?? {};

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
          <StandardArrayPicker
            abilities={draft.abilities}
            onChange={(next) => update((d) => { d.abilities = { ...next }; })}
          />
        </TabsContent>
        <TabsContent value="point-buy">
          <PointBuyPicker
            abilities={draft.abilities}
            onChange={(next) => update((d) => { d.abilities = { ...next }; })}
          />
        </TabsContent>
        <TabsContent value="manual">
          <ManualPicker
            abilities={draft.abilities}
            onChange={(next) => update((d) => { d.abilities = { ...next }; })}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Final Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {ABILITY_ORDER.map((ab) => {
              const bonus =
                (fixed[ab] ?? 0) + (floating[ab] ?? 0) + (subAsi[ab] ?? 0);
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

      <HouseRulesToggle draft={draft} update={update} />
    </div>
  );
}

function HouseRulesToggle({
  draft,
  update,
}: {
  draft: Character;
  update: DraftState["update"];
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const enabled = draft.houseRules.allowL1BoonBurden;
  const hasPicks = draft.boons.length > 0 || draft.burdens.length > 0;

  function setEnabled(next: boolean) {
    update((d) => {
      d.houseRules.allowL1BoonBurden = next;
    });
  }

  function clearPicksAndDisable() {
    update((d) => {
      d.houseRules.allowL1BoonBurden = false;
      d.boons = [];
      d.burdens = [];
      d.boonAbilityChoices = {};
    });
  }

  function handleToggle(next: boolean | "indeterminate") {
    const wantOn = next === true;
    if (wantOn === enabled) return;
    if (!wantOn && hasPicks) {
      setConfirmOpen(true);
      return;
    }
    setEnabled(wantOn);
  }

  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-6">
        <Checkbox
          id="house-rule-l1-boons"
          checked={enabled}
          onCheckedChange={handleToggle}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label
            htmlFor="house-rule-l1-boons"
            className="font-display tracking-wide text-sm cursor-pointer"
          >
            GM allows L1 Boons & Burdens — house rule
          </Label>
          <p className="text-xs text-muted-foreground leading-snug">
            Off by default. RAW Symbaroum 5E grants Boons via the L4+ Boon
            feat; some tables let you take one (and a Burden) at character
            creation. Toggle on to add the Boons & Burdens step to the wizard.
          </p>
        </div>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Discard your Boons & Burdens?
            </DialogTitle>
            <DialogDescription>
              Turning off the house rule will clear your current selections
              ({draft.boons.length} boon
              {draft.boons.length === 1 ? "" : "s"}, {draft.burdens.length}{" "}
              burden{draft.burdens.length === 1 ? "" : "s"}). This cannot be
              undone within this session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep them
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearPicksAndDisable();
                setConfirmOpen(false);
              }}
            >
              Discard and turn off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

