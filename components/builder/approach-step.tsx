"use client";

import { useMemo } from "react";
import { CLASS_BY_ID } from "@/data/classes";
import { spellsForTradition, SPELL_BY_ID } from "@/data/spells";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpellTabs } from "@/components/spells/spell-tabs";
import { cn } from "@/lib/utils";
import type { DraftState } from "./use-draft";

export function ApproachStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  // Hooks must run on every render — keep them above any conditional return.
  const cantripsSelected = useMemo(
    () => new Set(draft?.spellPicks?.cantrips ?? []),
    [draft?.spellPicks?.cantrips],
  );
  const spellsSelected = useMemo(
    () => new Set(draft?.spellPicks?.spellsKnown ?? []),
    [draft?.spellPicks?.spellsKnown],
  );
  const cls = draft?.classId ? CLASS_BY_ID[draft.classId] : undefined;
  const selected = cls?.approaches.find((a) => a.id === draft?.approachId);
  const grantedSet = useMemo(
    () => new Set(selected?.spellcasting?.alwaysKnownSpells ?? []),
    [selected],
  );

  if (!draft) return null;
  if (!draft.classId) {
    return <p className="italic text-muted-foreground">Choose a class first.</p>;
  }
  if (!cls) return null;

  function selectApproach(id: string) {
    update((d) => {
      d.approachId = id;
      // Reset spell picks when approach changes; only spellcasting approaches need them.
      const next = cls?.approaches.find((a) => a.id === id);
      d.spellPicks = next?.spellcasting
        ? { cantrips: [], spellsKnown: [] }
        : undefined;
    });
  }

  function toggleCantrip(spellId: string) {
    if (!selected?.spellcasting) return;
    update((d) => {
      const picks = d.spellPicks ?? { cantrips: [], spellsKnown: [] };
      const set = new Set(picks.cantrips);
      if (set.has(spellId)) set.delete(spellId);
      else if (set.size < (selected.spellcasting?.cantripsKnownAt1 ?? 0)) set.add(spellId);
      d.spellPicks = { ...picks, cantrips: Array.from(set) };
    });
  }

  function toggleSpell(spellId: string) {
    if (!selected?.spellcasting) return;
    update((d) => {
      const picks = d.spellPicks ?? { cantrips: [], spellsKnown: [] };
      const set = new Set(picks.spellsKnown);
      if (set.has(spellId)) set.delete(spellId);
      else if (set.size < (selected.spellcasting?.spellsKnownAt1 ?? 0)) set.add(spellId);
      d.spellPicks = { ...picks, spellsKnown: Array.from(set) };
    });
  }

  const tradition = selected?.tradition;
  // Filter granted spells out of the picker pools — players can't pick what's
  // already known via the approach grant (e.g. Templar's bless).
  const cantripOptions = tradition
    ? spellsForTradition(tradition, 0).filter((s) => !grantedSet.has(s.id))
    : [];
  const spellOptions = tradition
    ? spellsForTradition(tradition, 1).filter((s) => !grantedSet.has(s.id))
    : [];

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground italic">
        Pick your approach — the specific shape your training takes inside the {cls.name.toLowerCase()} class.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
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

            {selected.spellcasting && tradition && (
              <>
                {selected.spellcasting.alwaysKnownSpells &&
                  selected.spellcasting.alwaysKnownSpells.length > 0 && (
                    <div>
                      <p className="font-display tracking-wide text-base mb-2">
                        Always known{" "}
                        <span className="text-xs text-muted-foreground italic font-sans">
                          (granted by your approach)
                        </span>
                      </p>
                      <ul className="space-y-1 text-sm">
                        {selected.spellcasting.alwaysKnownSpells.map((id) => {
                          const spell = SPELL_BY_ID[id];
                          if (!spell) return null;
                          return (
                            <li key={id} className="rounded-md border border-dashed p-2">
                              <span className="font-display">{spell.name}</span>
                              <span className="block text-xs text-muted-foreground">
                                {spell.school} · {spell.description}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                <div>
                  <p className="font-display tracking-wide text-base mb-2">
                    Cantrips — pick {selected.spellcasting.cantripsKnownAt1} (
                    {(draft.spellPicks?.cantrips.length ?? 0)} chosen)
                  </p>
                  <SpellTabs
                    spells={cantripOptions}
                    levels={[0]}
                    mode={{
                      kind: "picker",
                      selected: cantripsSelected,
                      onToggle: (id) => toggleCantrip(id),
                      remaining:
                        (selected.spellcasting?.cantripsKnownAt1 ?? 0) -
                        (draft.spellPicks?.cantrips.length ?? 0),
                    }}
                  />
                </div>

                <div>
                  <p className="font-display tracking-wide text-base mb-2">
                    1st-level spells — pick {selected.spellcasting.spellsKnownAt1} (
                    {(draft.spellPicks?.spellsKnown.length ?? 0)} chosen)
                  </p>
                  <SpellTabs
                    spells={spellOptions}
                    levels={[1]}
                    mode={{
                      kind: "picker",
                      selected: spellsSelected,
                      onToggle: (id) => toggleSpell(id),
                      remaining:
                        (selected.spellcasting?.spellsKnownAt1 ?? 0) -
                        (draft.spellPicks?.spellsKnown.length ?? 0),
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
