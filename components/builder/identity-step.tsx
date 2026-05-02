"use client";

import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { ORIGIN_BY_ID } from "@/data/origins";
import type { Character } from "@/lib/character/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { DraftState } from "./use-draft";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function IdentityStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;
  const bg = BACKGROUND_BY_ID[draft.backgroundId];
  const origin = ORIGIN_BY_ID[draft.originId];

  function setIdentity<K extends keyof Character["identity"]>(
    key: K,
    value: Character["identity"][K],
  ) {
    update((d) => {
      d.identity[key] = value;
    });
  }

  function rollAll() {
    if (!bg) return;
    update((d) => {
      d.identity.personalityTrait = pick(bg.tables.personalityTraits);
      d.identity.ideal = pick(bg.tables.ideals);
      d.identity.bond = pick(bg.tables.bonds);
      d.identity.flaw = pick(bg.tables.flaws);
    });
  }

  function rollName() {
    if (!origin) return;
    const candidates =
      origin.sampleNames?.neutral?.length
        ? origin.sampleNames.neutral
        : [
            ...(origin.sampleNames?.male ?? []),
            ...(origin.sampleNames?.female ?? []),
          ];
    if (candidates.length === 0) return;
    update((d) => {
      d.identity.name = pick(candidates);
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground italic">
        Name your hero. Give them a face. The wilderness rewards those with conviction —
        and devours those who don't know what they want.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Name & Pronouns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <Label className="block sm:col-span-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Character name
              </span>
              <Input
                value={draft.identity.name}
                onChange={(e) => setIdentity("name", e.target.value)}
                placeholder="What does Davokar call you?"
                className="mt-1"
              />
            </Label>
            <Label className="block">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Pronouns
              </span>
              <Input
                value={draft.identity.pronouns ?? ""}
                onChange={(e) => setIdentity("pronouns", e.target.value)}
                placeholder="they/them"
                className="mt-1"
              />
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={rollName}>
            Roll a name
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-baseline justify-between gap-3">
            <CardTitle className="font-display text-xl">Personality, Ideal, Bond, Flaw</CardTitle>
            {bg && (
              <Button variant="outline" size="sm" onClick={rollAll}>
                Roll all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!bg && (
            <p className="text-sm text-muted-foreground italic">
              Pick a background first to enable rolled suggestions.
            </p>
          )}

          <Label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Personality Trait
            </span>
            <Input
              value={draft.identity.personalityTrait}
              onChange={(e) => setIdentity("personalityTrait", e.target.value)}
              className="mt-1"
            />
          </Label>
          <Label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Ideal</span>
            <Input
              value={draft.identity.ideal}
              onChange={(e) => setIdentity("ideal", e.target.value)}
              className="mt-1"
            />
          </Label>
          <Label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Bond</span>
            <Input
              value={draft.identity.bond}
              onChange={(e) => setIdentity("bond", e.target.value)}
              className="mt-1"
            />
          </Label>
          <Label className="block">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Flaw</span>
            <Input
              value={draft.identity.flaw}
              onChange={(e) => setIdentity("flaw", e.target.value)}
              className="mt-1"
            />
          </Label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={draft.notes}
            onChange={(e) =>
              update((d) => {
                d.notes = e.target.value;
              })
            }
            placeholder="Free-form notes — appearance, history, secret hopes."
            rows={4}
            className="w-full rounded-md border border-border bg-input/40 p-2"
          />
        </CardContent>
      </Card>
    </div>
  );
}
