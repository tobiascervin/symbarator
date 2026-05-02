"use client";

import { CLASSES, CLASS_BY_ID } from "@/data/classes";
import { SKILL_BY_ID } from "@/data/skills";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ABILITY_LABELS } from "@/lib/character/types";
import type { FightingStyleId } from "@/lib/character/types";
import { cn } from "@/lib/utils";
import type { DraftState } from "./use-draft";

const FIGHTING_STYLE_LABELS: Record<FightingStyleId, string> = {
  archery: "Archery",
  defense: "Defense",
  dueling: "Dueling",
  "great-weapon": "Great Weapon Fighting",
  polearm: "Polearm Fighting",
  shield: "Shield Fighting",
  snare: "Snare Fighting",
  "two-weapon": "Two-Weapon Fighting",
};

const FIGHTING_STYLE_DESCRIPTIONS: Record<FightingStyleId, string> = {
  archery: "+2 to attack rolls with ranged weapons.",
  defense: "+1 AC while wearing armor.",
  dueling:
    "+2 damage with a one-handed melee weapon when no other weapon is held.",
  "great-weapon":
    "Reroll 1s and 2s on damage dice with two-handed melee weapons.",
  polearm:
    "Reach weapons: use your reaction to impose disadvantage on a melee attack within reach.",
  shield:
    "On a successful melee hit, bonus action shield-slam — Str save (10 + Athletics) or 10 ft. push or knock prone.",
  snare:
    "Ensnaring weapons: bonus action to forgo damage; trip a target with two or fewer legs.",
  "two-weapon":
    "Add ability mod to off-hand attack damage in two-weapon fighting.",
};

export function ClassStep({ draftHook }: { draftHook: DraftState }) {
  const { draft, update } = draftHook;
  if (!draft) return null;
  const cls = CLASS_BY_ID[draft.classId];

  function selectClass(id: string) {
    update((d) => {
      d.classId = id;
      d.approachId = "";
      d.classSkillPicks = [];
      d.classEquipmentPicks = [];
      d.fightingStyle = undefined;
      d.spellPicks = undefined;
    });
  }

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground italic">
        Class is your trained craft — what you do in the dark places of the world.
        Symbaroum offers five.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {CLASSES.map((c) => {
          const isSelected = draft.classId === c.id;
          return (
            <Card
              key={c.id}
              role="button"
              tabIndex={0}
              onClick={() => selectClass(c.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectClass(c.id);
                }
              }}
              className={cn(
                "cursor-pointer transition-all",
                isSelected ? "border-primary ring-2 ring-primary/50" : "hover:border-ring/60",
              )}
            >
              <CardHeader>
                <div className="flex items-baseline justify-between">
                  <CardTitle className="font-display text-2xl">{c.name}</CardTitle>
                  <Badge variant="outline" className="font-display tracking-widest">
                    Saves: {c.proficiencies.savingThrows.map((s) => ABILITY_LABELS[s].slice(0, 3)).join("·")}
                  </Badge>
                </div>
                <CardDescription className="italic">{c.flavor}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="text-foreground/80">Armor:</span>{" "}
                  {c.proficiencies.armor.length > 0 ? c.proficiencies.armor.join(", ") : "none"}
                </p>
                <p>
                  <span className="text-foreground/80">Skills:</span> Choose{" "}
                  {c.proficiencies.skillChoices.count} from{" "}
                  {c.proficiencies.skillChoices.from.map((id) => SKILL_BY_ID[id].name).join(", ")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cls && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="font-display text-xl">{cls.name} — Class Features at Level 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-sm">
              {cls.level1Features.map((f) => (
                <li key={f.name}>
                  <p className="font-display tracking-wide text-base text-foreground">{f.name}</p>
                  <p className="text-muted-foreground">{f.description}</p>
                </li>
              ))}
            </ul>

            {cls.fightingStyleAt1 && (
              <div>
                <p className="font-display tracking-wide text-base mb-2">Fighting Style</p>
                <RadioGroup
                  value={draft.fightingStyle ?? ""}
                  onValueChange={(v) =>
                    update((d) => {
                      d.fightingStyle = v as FightingStyleId;
                    })
                  }
                  className="grid sm:grid-cols-2 gap-2"
                >
                  {cls.fightingStyleAt1.map((s) => (
                    <Label
                      key={s}
                      className={cn(
                        "flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:border-ring/60",
                        draft.fightingStyle === s && "border-primary",
                      )}
                    >
                      <RadioGroupItem value={s} id={`fs-${s}`} className="mt-0.5" />
                      <div>
                        <div className="font-display">{FIGHTING_STYLE_LABELS[s]}</div>
                        <div className="text-xs text-muted-foreground">
                          {FIGHTING_STYLE_DESCRIPTIONS[s]}
                        </div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
