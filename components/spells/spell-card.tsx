"use client";

import type { SpellDef } from "@/lib/character/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SpellCardDisplayProps {
  spell: SpellDef;
  mode: "display";
  /**
   * When defined, the card becomes a tap target that calls `onCast` on
   * click. Used by the sheet's companion-mode wrapper to open the cast
   * popover. Leave undefined for non-interactive surfaces (printable
   * sheet, level-up review).
   */
  onCast?(): void;
  /**
   * When true, render a "Granted" badge alongside the school/ritual badges
   * to mark the spell as approach-granted (e.g. Templar's bless) rather
   * than player-chosen. Sheet-only signal.
   */
  granted?: boolean;
}

export interface SpellCardPickerProps {
  spell: SpellDef;
  mode: "picker";
  selected: boolean;
  disabled?: boolean;
  onToggle(): void;
}

export type SpellCardProps = SpellCardDisplayProps | SpellCardPickerProps;

/**
 * One spell entry. In display mode it's a static info card. In picker mode
 * it wraps a checkbox so clicking the card toggles selection.
 */
export function SpellCard(props: SpellCardProps) {
  const { spell } = props;
  const granted = props.mode === "display" && props.granted === true;
  const inner = (
    <span className="flex-1 min-w-0">
      <span className="font-display text-base text-foreground block">{spell.name}</span>
      <span className="flex items-center gap-1 mt-0.5">
        <Badge variant="outline" className="font-display text-[10px] tracking-wider uppercase">
          {spell.school}
        </Badge>
        {spell.ritual && (
          <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
            Ritual
          </Badge>
        )}
        {granted && (
          <Badge variant="default" className="text-[10px] tracking-wider uppercase">
            Granted
          </Badge>
        )}
      </span>
      <span className="block text-xs text-muted-foreground mt-1.5 leading-snug">
        {spell.description}
      </span>
    </span>
  );

  if (props.mode === "display") {
    if (props.onCast) {
      const onCast = props.onCast;
      return (
        <button
          type="button"
          onClick={onCast}
          className={cn(
            "rounded-md border border-border p-3 flex gap-2 text-left w-full",
            "transition-colors cursor-pointer hover:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          )}
          aria-label={`Cast ${spell.name}`}
        >
          {inner}
        </button>
      );
    }
    return (
      <div className="rounded-md border border-border p-3 flex gap-2">
        {inner}
      </div>
    );
  }

  const { selected, disabled, onToggle } = props;
  return (
    <Label
      className={cn(
        "rounded-md border p-3 flex items-start gap-3 cursor-pointer transition-colors",
        selected
          ? "border-primary ring-1 ring-primary/40"
          : "border-border hover:border-ring/60",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      <Checkbox
        checked={selected}
        disabled={disabled}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      {inner}
    </Label>
  );
}
