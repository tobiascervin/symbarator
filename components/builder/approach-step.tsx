"use client";

import { CLASS_BY_ID } from "@/data/classes";
import { spellsForTradition } from "@/data/spells";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DraftState } from "./use-draft";

export function ApproachStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;
  if (!draft.classId) {
    return <p className="italic text-muted-foreground">Choose a class first.</p>;
  }

  const cls = CLASS_BY_ID[draft.classId];
  if (!cls) return null;

  const selected = cls.approaches.find((a) => a.id === draft.approachId);

  function selectApproach(id: string) {
    update((d) => {
      d.approachId = id;
      // Reset spell picks when approach changes (Mystic).
      d.spellPicks = cls?.spellcasting
        ? { cantrips: [], spellsKnown: [] }
        : undefined;
    });
  }

  function toggleCantrip(spellId: string) {
    if (!cls?.spellcasting) return;
    update((d) => {
      const picks = d.spellPicks ?? { cantrips: [], spellsKnown: [] };
      const set = new Set(picks.cantrips);
      if (set.has(spellId)) set.delete(spellId);
      else if (set.size < (cls.spellcasting?.cantripsKnownAt1 ?? 0)) set.add(spellId);
      d.spellPicks = { ...picks, cantrips: Array.from(set) };
    });
  }

  function toggleSpell(spellId: string) {
    if (!cls?.spellcasting) return;
    update((d) => {
      const picks = d.spellPicks ?? { cantrips: [], spellsKnown: [] };
      const set = new Set(picks.spellsKnown);
      if (set.has(spellId)) set.delete(spellId);
      else if (set.size < (cls.spellcasting?.spellsKnownAt1 ?? 0)) set.add(spellId);
      d.spellPicks = { ...picks, spellsKnown: Array.from(set) };
    });
  }

  const tradition = selected?.tradition;
  const cantripOptions = tradition ? spellsForTradition(tradition, 0) : [];
  const spellOptions = tradition ? spellsForTradition(tradition, 1) : [];

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground italic">
        Pick your approach — the specific shape your training takes inside the {cls.name.toLowerCase()} class.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {cls.approaches.map((a) => {
          const isSelected = draft.approachId === a.id;
          return (
            <Card
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => selectApproach(a.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectApproach(a.id);
                }
              }}
              className={cn(
                "cursor-pointer transition-all",
                isSelected ? "border-primary ring-2 ring-primary/50" : "hover:border-ring/60",
              )}
            >
              <CardHeader>
                <CardTitle className="font-display text-xl">{a.name}</CardTitle>
                <CardDescription className="italic line-clamp-3">
                  {a.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {selected && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {selected.name} — Level 1 Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-sm">
              {selected.level1Features.map((f) => (
                <li key={f.name}>
                  <p className="font-display tracking-wide text-base text-foreground">{f.name}</p>
                  <p className="text-muted-foreground">{f.description}</p>
                </li>
              ))}
            </ul>

            {cls.spellcasting && tradition && (
              <>
                <div>
                  <p className="font-display tracking-wide text-base mb-2">
                    Cantrips — pick {cls.spellcasting.cantripsKnownAt1} (
                    {(draft.spellPicks?.cantrips.length ?? 0)} chosen)
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {cantripOptions.map((s) => {
                      const checked = draft.spellPicks?.cantrips.includes(s.id) ?? false;
                      return (
                        <Label
                          key={s.id}
                          className="flex items-start gap-3 rounded-md border p-2 cursor-pointer hover:border-ring/60"
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggleCantrip(s.id)} />
                          <span>
                            <span className="font-display">{s.name}</span>
                            <span className="block text-xs text-muted-foreground">
                              {s.school} · {s.description}
                            </span>
                          </span>
                        </Label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-display tracking-wide text-base mb-2">
                    1st-level spells — pick {cls.spellcasting.spellsKnownAt1} (
                    {(draft.spellPicks?.spellsKnown.length ?? 0)} chosen)
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {spellOptions.map((s) => {
                      const checked = draft.spellPicks?.spellsKnown.includes(s.id) ?? false;
                      return (
                        <Label
                          key={s.id}
                          className="flex items-start gap-3 rounded-md border p-2 cursor-pointer hover:border-ring/60"
                        >
                          <Checkbox checked={checked} onCheckedChange={() => toggleSpell(s.id)} />
                          <span>
                            <span className="font-display">{s.name}</span>
                            {s.ritual ? <span className="text-xs text-muted-foreground"> (ritual)</span> : null}
                            <span className="block text-xs text-muted-foreground">
                              {s.school} · {s.description}
                            </span>
                          </span>
                        </Label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
