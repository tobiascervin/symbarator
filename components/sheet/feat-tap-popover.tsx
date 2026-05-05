"use client";

// Companion-mode popover for any tappable feat / boon / burden / class
// feature on the sheet. The popover ALWAYS shows the entry's name + source
// label + description; for tracked features with `usage`, it also shows a
// usage counter and a "Use" button that decrements via the sheet's onUse
// callback (which routes to `useFeature` from live-state).

import type { Character, FeatureDef } from "@/lib/character/types";
import {
  type FeatureSource,
  featureSourceLabel,
  remainingUses,
  resolveFeatureEffect,
  resolveFeatureUsageMax,
} from "@/lib/character/features";
import type { FeatCardBadge } from "@/components/sheet/feat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Normalized payload the sheet hands to the popover. The sheet's openEntry
 * state stores this shape; mapping from FeatCard / Feature paragraph happens
 * once on click.
 */
export interface TappedEntry {
  feature: FeatureDef;
  source: FeatureSource;
  /** Optional badges (e.g. `+1 INT` for a boon, `+2 CON` for a burden). */
  badges?: ReadonlyArray<FeatCardBadge>;
}

export interface FeatTapPopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  entry: TappedEntry | null;
  character: Character;
  /**
   * Called when the player clicks "Use" on a tracked feature. The sheet's
   * handler routes through `useFeature(c, featureId)` and persists the
   * mutation so the popover re-renders with the decremented count.
   */
  onUse(featureId: string): void;
}

export function FeatTapPopover({
  open,
  onOpenChange,
  entry,
  character: c,
  onUse,
}: FeatTapPopoverProps) {
  if (!entry) return null;
  const { feature, source, badges } = entry;
  const sourceLabel = featureSourceLabel(c, source);
  const tracked = feature.id && feature.usage ? feature : null;
  const usageMax = tracked?.usage
    ? resolveFeatureUsageMax(c, tracked.usage)
    : 0;
  const remaining = tracked
    ? remainingUses(c, {
        id: tracked.id!,
        feature: tracked,
        usage: tracked.usage!,
        source,
      })
    : 0;
  const resolvedEffect = resolveFeatureEffect(c, feature);
  const canUse = tracked !== null && remaining > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" mobileVariant="bottom-sheet">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{feature.name}</DialogTitle>
          <DialogDescription>{sourceLabel}</DialogDescription>
        </DialogHeader>

        {badges && badges.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {badges.map((b) => (
              <Badge
                key={b.label}
                variant={b.variant ?? "outline"}
                className="font-display text-[10px] tracking-widest uppercase"
              >
                {b.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Effect band — only when the feature has structured effect data. */}
        {resolvedEffect?.kind === "tempHp" && resolvedEffect.diceFormula && (
          <div className="rounded-md border border-border p-3 text-sm">
            <div className="font-display tracking-wide text-xs uppercase text-muted-foreground mb-1">
              Effect
            </div>
            <div className="font-display text-base">
              {resolvedEffect.diceFormula} temp HP
            </div>
          </div>
        )}
        {resolvedEffect?.kind === "passive" && resolvedEffect.note && (
          <p className="text-xs italic text-muted-foreground">{resolvedEffect.note}</p>
        )}

        {/* Usage band — only when the feature is tracked. */}
        {tracked && (
          <div className="rounded-md border border-border p-3 flex items-center justify-between gap-3">
            <div>
              <div className="font-display tracking-wide text-xs uppercase text-muted-foreground">
                Uses
              </div>
              <div className="font-display text-base">
                {remaining} of {usageMax} left
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!canUse}
              title={canUse ? "Spend one use" : "No uses remaining"}
              onClick={() => onUse(tracked.id!)}
            >
              Use
            </Button>
          </div>
        )}

        {/* Description always renders. */}
        <p className="text-sm leading-snug text-foreground/90">
          {feature.description}
        </p>
      </DialogContent>
    </Dialog>
  );
}
