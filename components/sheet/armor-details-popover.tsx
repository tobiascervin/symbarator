"use client";

import type { ArmorDef } from "@/lib/character/types";
import { ExplainableBadge } from "@/components/sheet/explainable-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ARMOR_FLAG_EXPLANATIONS,
  WEIGHTY_EXPLANATION,
} from "@/data/property-explanations";

const CATEGORY_LABEL: Record<ArmorDef["category"], string> = {
  light: "Light Armor",
  medium: "Medium Armor",
  heavy: "Heavy Armor",
  shield: "Shield",
};

export interface ArmorDetailsPopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  armor: ArmorDef | null;
}

/**
 * Read-only armor card mirroring the weapon-attack popover's shape: title,
 * category, AC formula readout, and a property row of `<ExplainableBadge>`s
 * (flags + optional `weighty (N)`) with PG-sourced tooltips. Shields skip the
 * property row since the PG reserves armor-property tags for body armor.
 */
export function ArmorDetailsPopover({
  open,
  onOpenChange,
  armor: a,
}: ArmorDetailsPopoverProps) {
  if (!a) return null;

  const flagList = Array.from(a.flags);
  const isShield = a.category === "shield";
  const showProperties =
    !isShield && (flagList.length > 0 || a.weightyStrMin !== undefined);

  const acFormula = isShield
    ? `+${a.ac.base} AC`
    : `AC ${a.ac.base}${
        a.ac.addDex
          ? ` + Dex${a.ac.dexMax !== undefined ? ` (max +${a.ac.dexMax})` : ""}`
          : ""
      }`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" mobileVariant="bottom-sheet">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{a.name}</DialogTitle>
          <DialogDescription>{CATEGORY_LABEL[a.category]}</DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-border p-3 text-sm space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display tracking-widest text-[10px] uppercase text-muted-foreground">
              Armor Class
            </span>
            <span className="font-display text-base">{acFormula}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display tracking-widest text-[10px] uppercase text-muted-foreground">
              Weight
            </span>
            <span className="font-display text-base">{a.weight} lb.</span>
          </div>
        </div>

        {showProperties && (
          <div className="text-xs text-muted-foreground leading-snug flex flex-wrap items-center gap-1">
            <span className="font-display tracking-widest text-[10px] uppercase">
              Properties
            </span>
            {flagList.map((flag) => (
              <ExplainableBadge
                key={flag}
                label={flag}
                explanation={ARMOR_FLAG_EXPLANATIONS[flag]}
              />
            ))}
            {a.weightyStrMin !== undefined && (
              <ExplainableBadge
                label={`weighty (${a.weightyStrMin})`}
                explanation={WEIGHTY_EXPLANATION}
              />
            )}
          </div>
        )}

        {a.description && (
          <p className="text-sm leading-snug text-foreground/90">{a.description}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
