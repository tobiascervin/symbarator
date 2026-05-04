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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parseOptionPlaceholders,
  weaponsForPlaceholder,
  type Placeholder,
} from "@/lib/character/equipment-placeholder";
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
      // Reset placeholder choices when the radio changes — the new option
      // may have a different placeholder shape (or none at all).
      const choices = { ...d.classEquipmentChoices };
      delete choices[lineIndex];
      d.classEquipmentChoices = choices;
    });
  }

  function setPlaceholderChoice(lineIndex: number, slot: number, name: string) {
    update((d) => {
      const choices = { ...d.classEquipmentChoices };
      const slots = [...(choices[lineIndex] ?? [])];
      slots[slot] = name;
      choices[lineIndex] = slots;
      d.classEquipmentChoices = choices;
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
            const pickedIdx = draft.classEquipmentPicks[i];
            const chosenOption =
              pickedIdx !== undefined ? options[pickedIdx] : undefined;
            const placeholders = chosenOption
              ? parseOptionPlaceholders(chosenOption)
              : [];
            const choices = draft.classEquipmentChoices[i] ?? [];
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
                {placeholders.length > 0 && (
                  <div className="mt-2 space-y-2 pl-6">
                    {placeholders.map((p, slot) => (
                      <PlaceholderSelect
                        key={slot}
                        placeholder={p}
                        slotIndex={slot}
                        totalSlots={placeholders.length}
                        value={choices[slot] ?? ""}
                        onChange={(name) => setPlaceholderChoice(i, slot, name)}
                      />
                    ))}
                  </div>
                )}
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

function PlaceholderSelect({
  placeholder,
  slotIndex,
  totalSlots,
  value,
  onChange,
}: {
  placeholder: Placeholder;
  slotIndex: number;
  totalSlots: number;
  value: string;
  onChange(name: string): void;
}) {
  const weapons = weaponsForPlaceholder(placeholder);
  const subcategoryLabel = placeholder.subcategory
    ? ` ${placeholder.subcategory}`
    : "";
  const slotLabel =
    totalSlots > 1 ? ` ${slotIndex + 1} of ${totalSlots}` : "";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground min-w-44">
        Choose your {placeholder.kind}
        {subcategoryLabel} weapon{slotLabel}:
      </span>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={`Pick a ${placeholder.kind} weapon`} />
        </SelectTrigger>
        <SelectContent>
          {weapons.map((w) => (
            <SelectItem key={w.id} value={w.name}>
              {w.name}{" "}
              <span className="text-[10px] text-muted-foreground">
                ({w.damage.count}d{w.damage.faces} {w.damageType})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
