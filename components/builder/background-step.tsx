"use client";

import { backgroundsForOrigin, BACKGROUND_BY_ID } from "@/data/backgrounds";
import { ORIGIN_BY_ID } from "@/data/origins";
import { SKILL_BY_ID } from "@/data/skills";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DraftState } from "./use-draft";

export function BackgroundStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;

  if (!draft.originId) {
    return <p className="italic text-muted-foreground">Choose an origin first.</p>;
  }

  const origin = ORIGIN_BY_ID[draft.originId];
  const options = backgroundsForOrigin(draft.originId);
  const selected = BACKGROUND_BY_ID[draft.backgroundId];

  function selectBg(id: string) {
    update((d) => {
      d.backgroundId = id;
      d.backgroundSkillPicks = [];
      d.backgroundToolPicks = [];
    });
  }

  function toggleSkill(skillId: string) {
    if (!selected?.skillChoices) return;
    update((d) => {
      const set = new Set(d.backgroundSkillPicks);
      if (set.has(skillId as never)) {
        set.delete(skillId as never);
      } else if (set.size < (selected.skillChoices?.count ?? 0)) {
        set.add(skillId as never);
      }
      d.backgroundSkillPicks = Array.from(set) as never[];
    });
  }

  function toggleTool(toolId: string) {
    if (!selected?.toolChoices) return;
    update((d) => {
      const set = new Set(d.backgroundToolPicks);
      if (set.has(toolId)) set.delete(toolId);
      else if (set.size < (selected.toolChoices?.count ?? 0)) set.add(toolId);
      d.backgroundToolPicks = Array.from(set);
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground italic">
        Of all the {origin?.name.toLowerCase()}s out there, what kind are you?
        Your background is your sub-origin — the specific story behind why you walked away.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {options.map((bg) => {
          const isSelected = draft.backgroundId === bg.id;
          return (
            <Card
              key={bg.id}
              role="button"
              tabIndex={0}
              onClick={() => selectBg(bg.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectBg(bg.id);
                }
              }}
              className={cn(
                "cursor-pointer transition-all",
                isSelected ? "border-primary ring-2 ring-primary/50" : "hover:border-ring/60",
              )}
            >
              <CardHeader>
                <CardTitle className="font-display text-xl">{bg.name}</CardTitle>
                <CardDescription className="italic line-clamp-3">
                  {bg.description}
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
              {selected.name} — Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-display tracking-wide text-base mb-1">Feature: {selected.feature.name}</p>
              <p className="text-muted-foreground text-sm">{selected.feature.description}</p>
            </div>

            {selected.skillProficiencies.length > 0 && (
              <div className="text-sm">
                <span className="font-display tracking-wide">Granted Skills:</span>{" "}
                {selected.skillProficiencies.map((s) => SKILL_BY_ID[s].name).join(", ")}
              </div>
            )}

            {selected.skillChoices && (
              <div>
                <p className="font-display tracking-wide mb-2">
                  Choose {selected.skillChoices.count} skill
                  {selected.skillChoices.count === 1 ? "" : "s"}
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selected.skillChoices.from.map((sId) => {
                    const skill = SKILL_BY_ID[sId];
                    const checked = (draft.backgroundSkillPicks as string[]).includes(sId);
                    return (
                      <Label
                        key={sId}
                        className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:border-ring/60"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSkill(sId)}
                        />
                        <span>{skill.name}</span>
                      </Label>
                    );
                  })}
                </div>
              </div>
            )}

            {selected.toolChoices && (
              <div>
                <p className="font-display tracking-wide mb-2">
                  Choose {selected.toolChoices.count} tool
                  {selected.toolChoices.count === 1 ? "" : "s"}
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selected.toolChoices.from.map((t) => {
                    const checked = draft.backgroundToolPicks.includes(t.id);
                    return (
                      <Label
                        key={t.id}
                        className="flex items-center gap-2 rounded-md border border-border p-2 cursor-pointer hover:border-ring/60"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleTool(t.id)}
                        />
                        <span>{t.label}</span>
                      </Label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground italic">
              Equipment: {selected.equipment}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
