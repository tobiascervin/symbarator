"use client";

import { useMemo, useState } from "react";
import type {
  Ability,
  Character,
  CharacterLevel,
  LevelChoice,
  SpellLevel,
} from "@/lib/character/types";
import { ABILITY_ORDER, ABILITY_SHORT, MAX_CHARACTER_LEVEL } from "@/lib/character/types";
import {
  applyLevelUp,
  averageHpGain,
  requiredChoices,
  validateLevelUp,
  type LevelChoiceAnswer,
  type LevelUpAnswers,
} from "@/lib/character/level-up";
import { computeFinalAbilities, computeProficiencyBonus, formatMod } from "@/lib/character/compute";
import { approachById, CLASS_BY_ID } from "@/data/classes";
import { BOONS } from "@/data/feats";
import { spellsForTradition } from "@/data/spells";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SpellTabs } from "@/components/spells/spell-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { toast } from "sonner";

export interface LevelUpDialogProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  character: Character;
  onApplied(updated: Character): void;
}

export function LevelUpDialog({ open, onOpenChange, character, onApplied }: LevelUpDialogProps) {
  const target = (character.level + 1) as CharacterLevel;
  const choices = useMemo(() => requiredChoices(character, target), [character, target]);

  const [hp, setHp] = useState<LevelUpAnswers["hp"]>(() => ({
    mode: "average",
    value: averageHpGain(character),
  }));
  const [answers, setAnswers] = useState<LevelChoiceAnswer[]>(() =>
    choices.map(initialAnswerFor),
  );

  // Per-render fallback in `built.choices` keeps render robust if `answers`
  // drifts; the parent's `key={id-level}` remount keeps the dialog instance
  // fresh per level so this should never actually fire in practice.
  const built: LevelUpAnswers = {
    hp,
    choices: answers.length === choices.length ? answers : choices.map(initialAnswerFor),
  };
  const error = target > MAX_CHARACTER_LEVEL ? "Already at max level." : validateLevelUp(character, target, built);

  function handleConfirm() {
    if (error) {
      toast.error(error);
      return;
    }
    const updated = applyLevelUp(character, target, built);
    onApplied(updated);
    onOpenChange(false);
    toast.success(`Advanced to level ${target}.`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Level Up — L{character.level} → L{target}
          </DialogTitle>
          <DialogDescription>
            Each prompt below is required by the rules at this level. Answer them in order, then confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
          <HpStep character={character} hp={hp} onChange={setHp} />
          <OrnateDivider />
          {choices.map((choice, i) => {
            const answer = answers[i] ?? initialAnswerFor(choice);
            return (
              <div key={`${choice.kind}-${i}`} className="space-y-2">
                <ChoiceStep
                  character={character}
                  choice={choice}
                  answer={answer}
                  onChange={(a) =>
                    setAnswers((prev) => {
                      // prev may be empty/short on first render; pad with defaults.
                      const padded =
                        prev.length === choices.length ? prev : choices.map(initialAnswerFor);
                      return padded.map((existing, j) => (j === i ? a : existing));
                    })
                  }
                />
                {i < choices.length - 1 && <OrnateDivider className="opacity-50" />}
              </div>
            );
          })}
          <OrnateDivider />
          <ConfirmDiff character={character} target={target} hpGain={hp.value} answers={answers} />
        </div>

        {error && (
          <p className="text-sm text-destructive font-display">{error}</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!!error}>
            Confirm Level {target}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Initial-answer factory for each choice kind.
// ---------------------------------------------------------------------------

function initialAnswerFor(choice: LevelChoice): LevelChoiceAnswer {
  switch (choice.kind) {
    case "asi-or-feat":
      return { kind: "asi-or-feat", pick: { type: "asi", allocation: {} } };
    case "fighting-style":
      return { kind: "fighting-style", styleId: choice.from[0] };
    case "spells-learned":
      return {
        kind: "spells-learned",
        newCantrips: [],
        newSpells: [],
      };
    default: {
      const _exhaustive: never = choice;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

function HpStep({
  character,
  hp,
  onChange,
}: {
  character: Character;
  hp: LevelUpAnswers["hp"];
  onChange(hp: LevelUpAnswers["hp"]): void;
}) {
  const avg = averageHpGain(character);
  return (
    <section className="space-y-2">
      <h3 className="font-display text-base">HP gain</h3>
      <RadioGroup
        value={hp.mode}
        onValueChange={(v) =>
          onChange(v === "average" ? { mode: "average", value: avg } : { mode: "manual", value: hp.value })
        }
        className="space-y-2"
      >
        <Label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:border-ring/60">
          <RadioGroupItem value="average" />
          <span>
            <span className="font-display block">Take average ({avg})</span>
            <span className="text-xs text-muted-foreground">
              Deterministic: floor(hit die / 2) + 1 + Con modifier.
            </span>
          </span>
        </Label>
        <Label className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:border-ring/60">
          <RadioGroupItem value="manual" />
          <span className="w-full">
            <span className="font-display block">Roll (enter manually)</span>
            <Input
              type="number"
              min={1}
              value={hp.mode === "manual" ? hp.value : ""}
              onChange={(e) => onChange({ mode: "manual", value: Number(e.target.value) || 0 })}
              className="mt-1 max-w-[8rem]"
              disabled={hp.mode !== "manual"}
            />
          </span>
        </Label>
      </RadioGroup>
    </section>
  );
}

function ChoiceStep({
  character,
  choice,
  answer,
  onChange,
}: {
  character: Character;
  choice: LevelChoice;
  answer: LevelChoiceAnswer;
  onChange(a: LevelChoiceAnswer): void;
}) {
  switch (choice.kind) {
    case "asi-or-feat":
      return <AsiOrFeatStep character={character} answer={answer as Extract<LevelChoiceAnswer, { kind: "asi-or-feat" }>} onChange={onChange} />;
    case "fighting-style":
      return <FightingStyleStep choice={choice} answer={answer as Extract<LevelChoiceAnswer, { kind: "fighting-style" }>} onChange={onChange} />;
    case "spells-learned":
      return <SpellsLearnedStep character={character} choice={choice} answer={answer as Extract<LevelChoiceAnswer, { kind: "spells-learned" }>} onChange={onChange} />;
    default: {
      const _exhaustive: never = choice;
      return _exhaustive;
    }
  }
}

function AsiOrFeatStep({
  character,
  answer,
  onChange,
}: {
  character: Character;
  answer: Extract<LevelChoiceAnswer, { kind: "asi-or-feat" }>;
  onChange(a: LevelChoiceAnswer): void;
}) {
  const isChangeling = character.originId === "changeling";
  const pick = answer.pick;

  function setMode(mode: "asi" | "feat" | "change-self") {
    if (mode === "asi") {
      onChange({ kind: "asi-or-feat", pick: { type: "asi", allocation: {} } });
    } else if (mode === "feat") {
      onChange({ kind: "asi-or-feat", pick: { type: "feat", featId: BOONS[0]?.id ?? "" } });
    } else {
      onChange({ kind: "asi-or-feat", pick: { type: "change-self" } });
    }
  }

  return (
    <section className="space-y-3">
      <h3 className="font-display text-base">Ability Score Improvement or Feat</h3>
      <RadioGroup value={pick.type} onValueChange={(v) => setMode(v as "asi" | "feat" | "change-self")}>
        <Label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:border-ring/60">
          <RadioGroupItem value="asi" />
          <span className="font-display">Ability Score Improvement (+2 to one or +1/+1 to two)</span>
        </Label>
        <Label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:border-ring/60">
          <RadioGroupItem value="feat" />
          <span className="font-display">Feat (Boon) from the catalog</span>
        </Label>
        {isChangeling && (
          <Label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:border-ring/60">
            <RadioGroupItem value="change-self" />
            <span>
              <span className="font-display block">Change Self</span>
              <span className="text-xs text-muted-foreground">Changeling-only. Consumes this slot.</span>
            </span>
          </Label>
        )}
      </RadioGroup>

      {pick.type === "asi" && (
        <AsiAllocator
          allocation={pick.allocation}
          onChange={(allocation) => onChange({ kind: "asi-or-feat", pick: { type: "asi", allocation } })}
        />
      )}

      {pick.type === "feat" && (
        <Select
          value={pick.featId}
          onValueChange={(featId) =>
            onChange({ kind: "asi-or-feat", pick: { type: "feat", featId: featId ?? "" } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Pick a feat" />
          </SelectTrigger>
          <SelectContent>
            {BOONS.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </section>
  );
}

function AsiAllocator({
  allocation,
  onChange,
}: {
  allocation: Partial<Record<Ability, number>>;
  onChange(next: Partial<Record<Ability, number>>): void;
}) {
  const total = ABILITY_ORDER.reduce((s, a) => s + (allocation[a] ?? 0), 0);

  function bump(ability: Ability, delta: number) {
    const cur = allocation[ability] ?? 0;
    const next = Math.max(0, Math.min(2, cur + delta));
    if (next === cur) return;
    const candidate: Partial<Record<Ability, number>> = { ...allocation, [ability]: next };
    const candidateTotal = ABILITY_ORDER.reduce((s, a) => s + (candidate[a] ?? 0), 0);
    if (candidateTotal > 2) return;
    onChange(candidate);
  }

  return (
    <div className="rounded-md border p-3 space-y-2">
      <p className="text-xs text-muted-foreground">Allocate exactly 2 points (used: {total}).</p>
      <div className="grid grid-cols-3 gap-2">
        {ABILITY_ORDER.map((a) => (
          <div key={a} className="flex items-center justify-between rounded border p-2">
            <span className="font-display text-sm">{ABILITY_SHORT[a]}</span>
            <div className="flex items-center gap-1">
              <Button size="icon-sm" variant="ghost" onClick={() => bump(a, -1)}>
                −
              </Button>
              <span className="w-4 text-center text-sm">{allocation[a] ?? 0}</span>
              <Button size="icon-sm" variant="ghost" onClick={() => bump(a, +1)}>
                +
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FightingStyleStep({
  choice,
  answer,
  onChange,
}: {
  choice: Extract<LevelChoice, { kind: "fighting-style" }>;
  answer: Extract<LevelChoiceAnswer, { kind: "fighting-style" }>;
  onChange(a: LevelChoiceAnswer): void;
}) {
  return (
    <section className="space-y-2">
      <h3 className="font-display text-base">Fighting Style</h3>
      <Select
        value={answer.styleId}
        onValueChange={(styleId) =>
          onChange({ kind: "fighting-style", styleId: styleId as typeof answer.styleId })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Pick a style" />
        </SelectTrigger>
        <SelectContent>
          {choice.from.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </section>
  );
}

function SpellsLearnedStep({
  character,
  choice,
  answer,
  onChange,
}: {
  character: Character;
  choice: Extract<LevelChoice, { kind: "spells-learned" }>;
  answer: Extract<LevelChoiceAnswer, { kind: "spells-learned" }>;
  onChange(a: LevelChoiceAnswer): void;
}) {
  const approach = approachById(character.approachId);
  const tradition = approach?.tradition;
  const knownCantrips = new Set(character.spellPicks?.cantrips ?? []);
  const knownSpells = new Set(character.spellPicks?.spellsKnown ?? []);

  // After leveling up, the character has slots for every spell level where
  // `progression[targetLevel - 1].spellSlots[i] > 0`. Surface spells of any
  // such level so the picker isn't artificially capped at 1st-level.
  const sc = approach?.spellcasting;
  const targetLevel = character.level + 1;
  const accessibleLevels: number[] = (() => {
    const row = sc?.progression[targetLevel - 1];
    if (!row) return [1];
    const out: number[] = [];
    for (let i = 0; i < row.spellSlots.length; i++) {
      if (row.spellSlots[i] > 0) out.push(i + 1);
    }
    return out.length > 0 ? out : [1];
  })();

  const cantripPool = (tradition ? spellsForTradition(tradition, 0) : []).filter(
    (s) => !knownCantrips.has(s.id),
  );
  const spellPool = (tradition ? spellsForTradition(tradition, accessibleLevels) : []).filter(
    (s) => !knownSpells.has(s.id),
  );
  const known = character.spellPicks?.spellsKnown ?? [];

  function toggle(list: "newCantrips" | "newSpells", id: string) {
    const limit = list === "newCantrips" ? choice.cantrips ?? 0 : choice.spells ?? 0;
    const current = answer[list];
    const set = new Set(current);
    if (set.has(id)) set.delete(id);
    else if (set.size < limit) set.add(id);
    onChange({ ...answer, [list]: Array.from(set) });
  }

  const newSpellsSet = useMemo(() => new Set(answer.newSpells), [answer.newSpells]);
  const spellsRemaining = (choice.spells ?? 0) - answer.newSpells.length;

  return (
    <section className="space-y-3">
      <h3 className="font-display text-base">Spells Learned</h3>
      {(choice.cantrips ?? 0) > 0 && (
        <div>
          <p className="text-sm mb-1">
            New cantrips — pick {choice.cantrips} ({answer.newCantrips.length} chosen)
          </p>
          <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {cantripPool.map((s) => (
              <Label key={s.id} className="flex items-start gap-2 rounded border p-2 cursor-pointer">
                <Checkbox
                  checked={answer.newCantrips.includes(s.id)}
                  onCheckedChange={() => toggle("newCantrips", s.id)}
                />
                <span className="text-xs">
                  <span className="font-display block">{s.name}</span>
                  <span className="text-muted-foreground">{s.description}</span>
                </span>
              </Label>
            ))}
          </div>
        </div>
      )}
      {(choice.spells ?? 0) > 0 && (
        <div>
          <p className="text-sm mb-2">
            New spells — pick {choice.spells} ({answer.newSpells.length} chosen)
          </p>
          {spellPool.length === 0 ? (
            <p className="text-xs text-destructive">
              No spells available in this tradition for the levels you can cast. Add more spells to{" "}
              <code>data/spells.ts</code> tagged for {tradition} at levels{" "}
              {accessibleLevels.join(", ")} to unblock this pick.
            </p>
          ) : (
            <SpellTabs
              spells={spellPool}
              levels={accessibleLevels as SpellLevel[]}
              mode={{
                kind: "picker",
                selected: newSpellsSet,
                onToggle: (id) => toggle("newSpells", id),
                remaining: spellsRemaining,
              }}
            />
          )}
        </div>
      )}
      {choice.canSwap && known.length > 0 && (
        <SwapPicker
          known={known}
          pool={spellPool.map((s) => ({ id: s.id, name: s.name }))}
          out={answer.swappedSpellOut}
          inn={answer.swappedSpellIn}
          onChange={(out, inn) =>
            onChange({ ...answer, swappedSpellOut: out, swappedSpellIn: inn })
          }
        />
      )}
    </section>
  );
}

function SwapPicker({
  known,
  pool,
  out,
  inn,
  onChange,
}: {
  known: string[];
  pool: Array<{ id: string; name: string }>;
  out: string | undefined;
  inn: string | undefined;
  onChange(out: string | undefined, inn: string | undefined): void;
}) {
  return (
    <div className="rounded border p-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        Optionally swap one known spell for a different one of the same level.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Select value={out ?? ""} onValueChange={(v) => onChange(v || undefined, inn)}>
          <SelectTrigger>
            <SelectValue placeholder="Swap out" />
          </SelectTrigger>
          <SelectContent>
            {known.map((id) => (
              <SelectItem key={id} value={id}>
                {pool.find((p) => p.id === id)?.name ?? id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={inn ?? ""} onValueChange={(v) => onChange(out, v || undefined)}>
          <SelectTrigger>
            <SelectValue placeholder="Swap in" />
          </SelectTrigger>
          <SelectContent>
            {pool
              .filter((p) => !known.includes(p.id))
              .map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ConfirmDiff({
  character,
  target,
  hpGain,
  answers,
}: {
  character: Character;
  target: CharacterLevel;
  hpGain: number;
  answers: LevelChoiceAnswer[];
}) {
  const cls = CLASS_BY_ID[character.classId];
  const oldPb = computeProficiencyBonus(character);
  const projected: Character = { ...character, level: target };
  const newPb = computeProficiencyBonus(projected);
  const newAbilities = computeFinalAbilities(character);

  const asiAnswer = answers.find((a) => a.kind === "asi-or-feat");
  const asiPick = asiAnswer?.kind === "asi-or-feat" ? asiAnswer.pick : null;
  const featPick =
    asiPick?.type === "feat" ? BOONS.find((b) => b.id === asiPick.featId) : null;
  const asiAllocation = asiPick?.type === "asi" ? asiPick.allocation : null;
  const changeSelf = asiPick?.type === "change-self";

  return (
    <section className="space-y-2">
      <h3 className="font-display text-base">Confirm</h3>
      <ul className="text-sm space-y-1">
        <li>Level: {character.level} → <strong>{target}</strong></li>
        <li>Max HP: {character.maxHp || "—"} → <strong>{(character.maxHp || 0) + hpGain}</strong> (+{hpGain})</li>
        {newPb !== oldPb && <li>Proficiency bonus: +{oldPb} → <strong>+{newPb}</strong></li>}
        {asiAllocation && Object.values(asiAllocation).some((v) => (v ?? 0) > 0) && (
          <li>
            Ability scores:{" "}
            {ABILITY_ORDER.filter((a) => (asiAllocation[a] ?? 0) > 0)
              .map((a) => `${ABILITY_SHORT[a]} ${formatMod(asiAllocation[a] ?? 0)}`)
              .join(", ")}
          </li>
        )}
        {featPick && <li>Feat: <strong>{featPick.name}</strong></li>}
        {changeSelf && <li>Feat: <strong>Change Self</strong> (consumes ASI slot)</li>}
      </ul>
      {cls && (
        <p className="text-xs text-muted-foreground">
          New {cls.name} L{target} features will be visible on the sheet after confirmation.
        </p>
      )}
      {/* Surface unused variable to keep linter happy */}
      <span className="hidden">{newAbilities.total.str}</span>
    </section>
  );
}
