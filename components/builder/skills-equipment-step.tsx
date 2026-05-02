"use client";

import { CLASS_BY_ID } from "@/data/classes";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { SKILL_BY_ID } from "@/data/skills";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { DraftState } from "./use-draft";

export function SkillsEquipmentStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;
  const cls = CLASS_BY_ID[draft.classId];
  if (!cls) {
    return <p className="italic text-muted-foreground">Choose a class first.</p>;
  }
  const bg = BACKGROUND_BY_ID[draft.backgroundId];

  // Skills already granted from origin (Goblin) and background.
  const grantedSkills = new Set<string>();
  if (draft.originId === "goblin") {
    grantedSkills.add("stealth");
    grantedSkills.add("survival");
  }
  bg?.skillProficiencies.forEach((s) => grantedSkills.add(s));
  draft.backgroundSkillPicks.forEach((s) => grantedSkills.add(s as string));

  function toggleClassSkill(skillId: string) {
    update((d) => {
      const set = new Set(d.classSkillPicks as string[]);
      if (set.has(skillId)) set.delete(skillId);
      else if (set.size < cls.proficiencies.skillChoices.count) set.add(skillId);
      d.classSkillPicks = Array.from(set) as never[];
    });
  }

  function setEquipPick(lineIndex: number, optionIndex: number) {
    update((d) => {
      const arr = [...d.classEquipmentPicks];
      arr[lineIndex] = optionIndex;
      d.classEquipmentPicks = arr;
    });
  }

  // Parse "(a) Foo OR (b) Bar OR (c) Baz" into option strings
  function parseOptions(line: string): string[] {
    return line
      .split(/\bOR\b/i)
      .map((s) => s.replace(/^\s*\([a-z]\)\s*/i, "").trim())
      .filter(Boolean);
  }

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground italic">
        Select your class skills and finalize your starting gear.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">
            Class Skills — pick {cls.proficiencies.skillChoices.count} (
            {draft.classSkillPicks.length} chosen)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {cls.proficiencies.skillChoices.from.map((sId) => {
              const skill = SKILL_BY_ID[sId];
              const alreadyGranted = grantedSkills.has(sId);
              const checked = (draft.classSkillPicks as string[]).includes(sId);
              return (
                <Label
                  key={sId}
                  className={cn(
                    "flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:border-ring/60",
                    alreadyGranted && "opacity-50",
                  )}
                  title={alreadyGranted ? "Already granted by origin or background" : undefined}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleClassSkill(sId)}
                    disabled={alreadyGranted}
                  />
                  <span>{skill.name}</span>
                </Label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Starting Equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {cls.startingEquipment.map((line, i) => {
            const options = parseOptions(line);
            return (
              <div key={i}>
                <p className="font-display tracking-wide text-base mb-2">
                  Choice {i + 1}
                </p>
                <RadioGroup
                  value={String(draft.classEquipmentPicks[i] ?? "")}
                  onValueChange={(v) => setEquipPick(i, Number(v))}
                  className="grid sm:grid-cols-2 gap-2"
                >
                  {options.map((opt, optIdx) => (
                    <Label
                      key={optIdx}
                      className={cn(
                        "flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:border-ring/60",
                        draft.classEquipmentPicks[i] === optIdx && "border-primary",
                      )}
                    >
                      <RadioGroupItem value={String(optIdx)} className="mt-1" />
                      <span>{opt}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {bg && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Background Equipment</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground italic">
            {bg.equipment}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
