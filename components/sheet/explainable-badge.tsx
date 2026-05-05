"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PropertyExplanation } from "@/data/property-explanations";
import { cn } from "@/lib/utils";

export interface ExplainableBadgeProps {
  label: string;
  explanation: PropertyExplanation;
}

/**
 * Property tag badge that surfaces the PG-sourced explanation on hover (desktop)
 * or on tap (touch). Visually identical to a `<Badge variant="secondary">`; the
 * controlled `open` state layers click-to-toggle on top of Base UI's default
 * hover/focus trigger so phone users get the same content. Stops click
 * propagation so taps inside a Dialog don't bubble to overlay-dismiss.
 */
export function ExplainableBadge({ label, explanation }: ExplainableBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        closeOnClick={false}
        render={
          <Badge
            variant="secondary"
            role="button"
            tabIndex={0}
            aria-label={`${explanation.name} — explanation`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen((v) => !v);
              }
            }}
            className={cn(
              "cursor-help tap-target text-[10px] tracking-wider uppercase",
            )}
          />
        }
      >
        {label}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs flex-col items-start gap-0 px-3 py-2 text-left">
        <div className="font-display tracking-wider text-xs uppercase">
          {explanation.name}
        </div>
        <p className="mt-1 text-xs leading-snug">{explanation.description}</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          PG p. {explanation.pgPage}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
