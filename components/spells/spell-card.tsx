"use client";

import type { SpellDef } from "@/lib/character/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface SpellCardDisplayProps {
  spell: SpellDef;
  mode: "display";
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
      </span>
      <span className="block text-xs text-muted-foreground mt-1.5 leading-snug">
        {spell.description}
      </span>
    </span>
  );

  if (props.mode === "display") {
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
