"use client";

import { useEffect, useState } from "react";
import type {
  Character,
  SpellDef,
  SpellLevel,
} from "@/lib/character/types";
import { ABILITY_SHORT } from "@/lib/character/types";
import type { ResolvedSpellEffect } from "@/lib/character/spells";
import {
  formatDiceWithMod,
  resolveSpellEffect,
  spellAbilityModValue,
  spellAttackMod,
  spellSaveDc,
  spellcastingAbility,
} from "@/lib/character/spells";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ORDINAL: Record<number, string> = {
  0: "Cantrip",
  1: "1st-level",
  2: "2nd-level",
  3: "3rd-level",
  4: "4th-level",
  5: "5th-level",
  6: "6th-level",
  7: "7th-level",
  8: "8th-level",
  9: "9th-level",
};

export interface SpellCastPopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  spell: SpellDef | null;
  character: Character;
  /** Called when the player commits to casting at a slot tier. */
  onCast(slotLevel: SpellLevel): void;
}

/**
 * Cast view for a spell in companion mode. Built on the existing Dialog
 * primitive — see `design.md` for why we didn't add a separate Popover. The
 * popover exposes the live computed numbers for the character (Spell Mod /
 * Attack / Save DC) plus, when the spell has structured `effect` data, the
 * scaled damage / heal dice and a per-tier "Cast at L<n>" button.
 *
 * Cantrips render no Cast buttons (they don't consume slots; they auto-scale
 * by character level which is already reflected in the resolved effect).
 */
export function SpellCastPopover({
  open,
  onOpenChange,
  spell,
  character: c,
  onCast,
}: SpellCastPopoverProps) {
  // Local cast level — defaults to the spell's base level. Lets the player
  // preview the upcast amount before clicking Cast. Re-syncs whenever the
  // popover opens for a new spell.
  const [castAt, setCastAt] = useState<SpellLevel>(spell?.level ?? 0);
  useEffect(() => {
    if (spell) setCastAt(spell.level);
  }, [spell]);

  if (!spell) return null;

  const ability = spellcastingAbility(c);
  const spellMod = spellAbilityModValue(c);
  const atkMod = spellAttackMod(c);
  const dc = spellSaveDc(c);
  const resolved = resolveSpellEffect(spell, c, castAt);
  const isCantrip = spell.level === 0;
  const ritual = !!spell.ritual;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" mobileVariant="bottom-sheet">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{spell.name}</DialogTitle>
          <DialogDescription>
            {ORDINAL[spell.level] ?? `${spell.level}th-level`} · {spell.school}
            {ritual && (
              <Badge variant="secondary" className="ml-2 text-[10px] uppercase tracking-widest">
                Ritual
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Computed-numbers band — only shows mods relevant to the spell's
            effect kind. Spell Mod is always visible (it's the parameter
            behind every other stat). Attack appears only for attack spells;
            Save DC only for save spells, with the spell's saveAbility. */}
        {ability && (
          <div
            className={cn(
              "grid gap-2 rounded-md border border-border p-3 text-center",
              gridColsClass(visibleStatCount(resolved.kind)),
            )}
          >
            <Stat label="Spell Mod" value={`${signed(spellMod)} (${ABILITY_SHORT[ability]})`} />
            {resolved.kind === "attack" && (
              <Stat label="Attack" value={signed(atkMod)} />
            )}
            {resolved.kind === "save" && (
              <Stat
                label="Save DC"
                value={`${dc}${resolved.saveAbility ? ` (${ABILITY_SHORT[resolved.saveAbility]})` : ""}`}
              />
            )}
          </div>
        )}

        {/* Effect band — only when the spell has structured effect data. */}
        {spell.effect ? (
          <EffectBand resolved={resolved} spellMod={spellMod} />
        ) : (
          <p className="rounded-md border border-dashed border-border p-3 text-xs italic text-muted-foreground">
            No auto-computed effect — see description below.
          </p>
        )}

        {/* Cast-at-slot buttons — leveled spells only. */}
        {!isCantrip && (
          <CastButtons
            character={c}
            spellLevel={spell.level}
            castAt={castAt}
            onPreview={setCastAt}
            onCast={onCast}
          />
        )}

        {/* Description always renders. */}
        <p className="text-sm leading-snug text-foreground/90">{spell.description}</p>
      </DialogContent>
    </Dialog>
  );
}

function EffectBand({
  resolved,
  spellMod,
}: {
  resolved: ResolvedSpellEffect;
  spellMod: number;
}) {
  if (resolved.kind === "utility") {
    return (
      <p className="rounded-md border border-border p-3 text-xs italic text-muted-foreground">
        No save, no attack — utility effect (see description).
      </p>
    );
  }
  if (resolved.kind === "heal") {
    const healing = resolved.healing!;
    return (
      <div className="rounded-md border border-border p-3 text-sm">
        <div className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-1">
          Healing
        </div>
        <div className="font-display text-base">
          {formatDiceWithMod(healing.dice, resolved.addSpellMod, spellMod)} HP
        </div>
        {resolved.scalingNote && (
          <p className="text-xs text-muted-foreground mt-1">{resolved.scalingNote}</p>
        )}
      </div>
    );
  }
  if (resolved.kind === "attack") {
    const damage = resolved.damage!;
    return (
      <div className="rounded-md border border-border p-3 text-sm">
        <div className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-1">
          Attack
        </div>
        <div className="font-display text-base">
          {formatDiceWithMod(damage.dice, resolved.addSpellMod, spellMod)} {damage.type}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Spell attack {signed(resolved.attackMod ?? 0)} vs AC
          {resolved.onMiss === "half" && " · half on miss"}
        </p>
        {resolved.scalingNote && (
          <p className="text-xs text-muted-foreground mt-1">{resolved.scalingNote}</p>
        )}
      </div>
    );
  }
  // save
  return (
    <div className="rounded-md border border-border p-3 text-sm space-y-1">
      <div className="font-display tracking-wide text-xs uppercase text-muted-foreground">
        Save
      </div>
      <div className="font-display text-base">
        DC {resolved.saveDc} {resolved.saveAbility ? ABILITY_SHORT[resolved.saveAbility] : ""}
      </div>
      {resolved.damage && (
        <div className="font-display text-base">
          {formatDiceWithMod(resolved.damage.dice, resolved.addSpellMod, spellMod)} {resolved.damage.type}
          {resolved.halfOnSave && (
            <span className="ml-2 text-xs italic text-muted-foreground">half on save</span>
          )}
        </div>
      )}
      {resolved.riderEffect && (
        <p className="text-xs text-muted-foreground">{resolved.riderEffect}</p>
      )}
      {resolved.scalingNote && (
        <p className="text-xs text-muted-foreground">{resolved.scalingNote}</p>
      )}
    </div>
  );
}

function CastButtons({
  character: c,
  spellLevel,
  castAt,
  onPreview,
  onCast,
}: {
  character: Character;
  spellLevel: SpellLevel;
  castAt: SpellLevel;
  onPreview(level: SpellLevel): void;
  onCast(level: SpellLevel): void;
}) {
  // Render a button per tier from spellLevel..9.
  const tiers: SpellLevel[] = [];
  for (let n = spellLevel; n <= 9; n++) tiers.push(n as SpellLevel);
  return (
    <div>
      <p className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-2">
        Cast at slot
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tiers.map((n) => {
          const remaining = c.currentSpellSlots[n - 1] ?? 0;
          const disabled = remaining <= 0;
          const isPreviewActive = n === castAt;
          return (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={isPreviewActive ? "default" : "outline"}
              disabled={disabled}
              title={
                disabled
                  ? `No slots remaining at L${n}`
                  : `Cast at L${n} (${remaining} slot${remaining === 1 ? "" : "s"})`
              }
              onClick={() => {
                onPreview(n);
                onCast(n);
              }}
              onMouseEnter={() => onPreview(n)}
              onFocus={() => onPreview(n)}
            >
              L{n} <span className={cn("ml-1 text-[10px]", disabled && "opacity-50")}>{remaining}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display tracking-widest text-[10px] uppercase text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-base">{value}</div>
    </div>
  );
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

function visibleStatCount(kind: ResolvedSpellEffect["kind"]): 1 | 2 {
  // Spell Mod is always shown; Attack and Save DC are mode-gated. No mode
  // shows both, so the band never has 3 cells.
  return kind === "attack" || kind === "save" ? 2 : 1;
}

function gridColsClass(count: 1 | 2): string {
  return count === 2 ? "grid-cols-2" : "grid-cols-1";
}
