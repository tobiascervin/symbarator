"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type Ability,
  type Character,
} from "@/lib/character/types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { FEAT_BY_ID, BURDEN_BY_ID } from "@/data/feats";
import { abilityMod, computeFinalAbilities, formatMod } from "@/lib/character/compute";
import { validateAbilityEdit } from "@/lib/character/validation";
import { StandardArrayPicker } from "@/components/builder/pickers/standard-array-picker";
import { PointBuyPicker } from "@/components/builder/pickers/point-buy-picker";
import { ManualPicker } from "@/components/builder/pickers/manual-picker";
import { FloatingAsiPicker } from "@/components/builder/pickers/floating-asi-picker";
import { BoonAbilityChoicePicker } from "@/components/builder/pickers/boon-ability-choice-picker";
import { BurdenAbilityChoicePicker } from "@/components/builder/pickers/burden-ability-choice-picker";

export interface AbilityScoreEditorDialogProps {
  character: Character;
  open: boolean;
  onOpenChange(open: boolean): void;
  /** Called with a merged Character when the player saves a valid edit. */
  onSave(updated: Character): void;
}

/**
 * Local-draft mirror of the four mutable fields the dialog edits. The
 * Character spread doesn't include level / origin / boons / etc — the
 * dialog only edits these.
 */
type Draft = {
  abilities: Record<Ability, number>;
  abilityMethod: Character["abilityMethod"];
  originAsiAllocation: Partial<Record<Ability, number>>;
  boonAbilityChoices: Record<string, Ability>;
  burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>;
};

function snapshot(c: Character): Draft {
  return {
    abilities: { ...c.abilities },
    abilityMethod: c.abilityMethod,
    originAsiAllocation: { ...c.originAsiAllocation },
    boonAbilityChoices: { ...c.boonAbilityChoices },
    burdenAbilityChoices: Object.fromEntries(
      Object.entries(c.burdenAbilityChoices).map(([k, v]) => [k, [...v]]),
    ),
  };
}

export function AbilityScoreEditorDialog({
  character,
  open,
  onOpenChange,
  onSave,
}: AbilityScoreEditorDialogProps) {
  // The parent passes `key={openState}` so this component remounts every
  // time the dialog opens — the lazy initializer below reseeds the draft
  // from the persisted character without an effect-driven setState.
  const [draft, setDraft] = useState<Draft>(() => snapshot(character));

  const origin = ORIGIN_BY_ID[character.originId];
  const fixed = origin?.asi.fixed ?? {};
  const subchoice = origin?.subchoices?.options.find(
    (o) => o.id === character.originSubchoiceId,
  );
  const subAsi = subchoice?.asi ?? {};

  // Synthetic character for compute helpers. We only override the four
  // mutable fields; everything else (origin, boons, burdens) is borrowed
  // from the persisted character.
  const synthetic: Character = {
    ...character,
    abilities: draft.abilities,
    abilityMethod: draft.abilityMethod,
    originAsiAllocation: draft.originAsiAllocation,
    boonAbilityChoices: draft.boonAbilityChoices,
    burdenAbilityChoices: draft.burdenAbilityChoices,
  };
  const finals = computeFinalAbilities(synthetic);
  const validation = validateAbilityEdit(synthetic);

  // Defensive guard — the trigger isn't rendered above L1, but a future
  // programmatic opener shouldn't be able to mutate L≥2 abilities.
  const lockedByLevel = character.level !== 1;

  function setMethod(m: Character["abilityMethod"]) {
    setDraft((d) => {
      // Seed the draft per the wizard's `setMethod` defaults so switching
      // tabs shows reasonable starting values rather than carrying over
      // out-of-range scores from another method.
      let abilities = d.abilities;
      if (m === "standard-array") {
        abilities = { str: 8, dex: 10, con: 12, int: 13, wis: 14, cha: 15 };
      } else if (m === "point-buy") {
        abilities = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
      }
      return { ...d, abilityMethod: m, abilities };
    });
  }

  function handleSave() {
    if (!validation.ok || lockedByLevel) return;
    onSave({
      ...character,
      abilities: { ...draft.abilities },
      abilityMethod: draft.abilityMethod,
      originAsiAllocation: { ...draft.originAsiAllocation },
      boonAbilityChoices: { ...draft.boonAbilityChoices },
      burdenAbilityChoices: Object.fromEntries(
        Object.entries(draft.burdenAbilityChoices).map(([k, v]) => [k, [...v]]),
      ),
    });
    onOpenChange(false);
  }

  // Choice-boons currently held by the character.
  const choiceBoons = character.boons
    .map((id) => FEAT_BY_ID[id])
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .filter((b) => b.abilityBonus?.ability === "choice");

  // Choose-one / choose-two burdens currently held by the character.
  const choiceBurdens = character.burdens
    .map((id) => BURDEN_BY_ID[id])
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .filter(
      (b) =>
        b.abilityBonus?.kind === "choose-one" ||
        b.abilityBonus?.kind === "choose-two",
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Edit Ability Scores
          </DialogTitle>
          <DialogDescription>
            Set base scores and any modifier picks. Origin fixed bonuses are
            shown read-only.
          </DialogDescription>
        </DialogHeader>

        {lockedByLevel ? (
          <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">
            Editor available at level 1 only. Use the level-up dialog or JSON
            import/export to change abilities at higher levels.
          </p>
        ) : (
          <div className="space-y-5">
            {/* Method tabset + base picker */}
            <Tabs
              value={draft.abilityMethod}
              onValueChange={(v) => setMethod(v as Character["abilityMethod"])}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="standard-array">Standard Array</TabsTrigger>
                <TabsTrigger value="point-buy">Point Buy</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>
              <TabsContent value="standard-array">
                <StandardArrayPicker
                  abilities={draft.abilities}
                  onChange={(next) =>
                    setDraft((d) => ({ ...d, abilities: { ...next } }))
                  }
                />
              </TabsContent>
              <TabsContent value="point-buy">
                <PointBuyPicker
                  abilities={draft.abilities}
                  onChange={(next) =>
                    setDraft((d) => ({ ...d, abilities: { ...next } }))
                  }
                />
              </TabsContent>
              <TabsContent value="manual">
                <ManualPicker
                  abilities={draft.abilities}
                  onChange={(next) =>
                    setDraft((d) => ({ ...d, abilities: { ...next } }))
                  }
                />
              </TabsContent>
            </Tabs>

            {/* Floating ASI — `compact` so the 6 ability cells lay out as
                two rows of 3 inside the dialog's narrower container. */}
            {origin?.asi.floating && (
              <FloatingAsiPicker
                origin={origin}
                allocation={draft.originAsiAllocation}
                onChange={(next) =>
                  setDraft((d) => ({
                    ...d,
                    originAsiAllocation: { ...next },
                  }))
                }
                compact
              />
            )}

            {/* Choice-boon ability pickers */}
            {choiceBoons.map((boon) => (
              <div
                key={boon.id}
                className="rounded-md border border-border p-3"
                data-testid={`boon-choice-${boon.id}`}
              >
                <p className="font-display tracking-wide text-sm mb-2 text-foreground">
                  {boon.name}
                </p>
                <BoonAbilityChoicePicker
                  boon={boon}
                  value={draft.boonAbilityChoices[boon.id]}
                  onChange={(ab) =>
                    setDraft((d) => ({
                      ...d,
                      boonAbilityChoices: {
                        ...d.boonAbilityChoices,
                        [boon.id]: ab,
                      },
                    }))
                  }
                />
              </div>
            ))}

            {/* Choose-one / choose-two burden pickers */}
            {choiceBurdens.map((burden) => (
              <div
                key={burden.id}
                className="rounded-md border border-border p-3"
                data-testid={`burden-choice-${burden.id}`}
              >
                <p className="font-display tracking-wide text-sm mb-2 text-foreground">
                  {burden.name}
                </p>
                <BurdenAbilityChoicePicker
                  burden={burden}
                  picks={draft.burdenAbilityChoices[burden.id] ?? []}
                  onChange={(picks) =>
                    setDraft((d) => ({
                      ...d,
                      burdenAbilityChoices: {
                        ...d.burdenAbilityChoices,
                        [burden.id]: [...picks],
                      },
                    }))
                  }
                />
              </div>
            ))}

            {/* Read-only summary of fixed + sub-choice ASI */}
            {(Object.keys(fixed).length > 0 ||
              Object.keys(subAsi).length > 0) && (
              <div className="rounded-md border border-border p-3">
                <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
                  Origin contributions (read-only)
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {Object.entries(fixed).map(([ab, amt]) => (
                    <li key={`fixed-${ab}`}>
                      Fixed:{" "}
                      <span className="text-foreground">
                        {ABILITY_LABELS[ab as Ability]} +{amt}
                      </span>
                    </li>
                  ))}
                  {Object.entries(subAsi).map(([ab, amt]) => (
                    <li key={`sub-${ab}`}>
                      {subchoice?.name ?? "Sub-choice"}:{" "}
                      <span className="text-foreground">
                        {ABILITY_LABELS[ab as Ability]} +{amt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Final Ability Scores card — same visual as wizard */}
            <div
              className="rounded-md border border-border p-3"
              data-testid="dialog-final-abilities"
            >
              <p className="font-display tracking-widest text-xs uppercase text-muted-foreground mb-3">
                Final Ability Scores
              </p>
              <div className="grid grid-cols-3 gap-3">
                {ABILITY_ORDER.map((ab) => {
                  const total = finals.total[ab];
                  const bonus = finals.bonuses[ab];
                  const mod = abilityMod(total);
                  return (
                    <div
                      key={ab}
                      className="rounded-md border border-border p-2 text-center"
                      data-testid={`dialog-final-${ab}`}
                    >
                      <div className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
                        {ABILITY_LABELS[ab]}
                      </div>
                      <div className="font-display text-2xl py-1">{total}</div>
                      <div className="text-[11px] text-muted-foreground">
                        base {draft.abilities[ab]}
                        {bonus !== 0 && (
                          <>
                            {" "}+{bonus}
                          </>
                        )}
                      </div>
                      <div className="font-display text-sm mt-1">
                        {formatMod(mod)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {!validation.ok && !lockedByLevel && (
            <p
              className="text-xs italic text-destructive sm:mr-auto"
              data-testid="dialog-save-reason"
            >
              {validation.reason}
            </p>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!validation.ok || lockedByLevel}
            data-testid="dialog-save"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
