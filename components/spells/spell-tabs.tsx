"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import type { SpellDef, SpellLevel } from "@/lib/character/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { SpellCard } from "./spell-card";

const ORDINAL: Record<number, string> = {
  0: "Cantrips",
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  5: "5th",
  6: "6th",
  7: "7th",
  8: "8th",
  9: "9th",
};

export type SpellTabsMode =
  | {
      kind: "display";
      /**
       * When defined, each rendered spell card becomes a tap target that
       * opens a cast popover for the spell. Used by the sheet's companion
       * mode; printable mode and the level-up review leave it undefined.
       */
      onCast?(spell: SpellDef): void;
      /**
       * Spell ids that are granted by the approach (e.g. Templar's bless)
       * rather than chosen by the player. Cards for these ids render a
       * "Granted" badge.
       */
      grantedSpellIds?: ReadonlySet<string>;
    }
  | {
      kind: "picker";
      selected: ReadonlySet<string>;
      onToggle(spellId: string): void;
      remaining: number;
    };

export interface SpellTabsProps {
  /** All spells to consider; will be filtered/grouped by level. */
  spells: ReadonlyArray<SpellDef>;
  /** Which levels to render as collapsible sections (typically the levels available to the consumer). */
  levels: ReadonlyArray<SpellLevel>;
  /**
   * @deprecated since this change — the collapsible layout shows all levels;
   * this prop is ignored.
   */
  defaultLevel?: SpellLevel;
  mode: SpellTabsMode;
}

/**
 * Collapsible spell list, one section per level, all expanded by default.
 * Each section header shows the level label (`"Cantrips"`, `"1st"`, …), a
 * total-count badge, and — in picker mode — a "selected" badge counting how
 * many of the player's current picks live in that level. Clicking the header
 * toggles just that section. In picker mode each spell card is a checkbox;
 * in display mode each is a static info card.
 *
 * The picker's `remaining` lets us disable unselected cards once the player
 * has hit the required pick count, while still letting them deselect.
 */
export function SpellTabs({ spells, levels, mode }: SpellTabsProps) {
  const sortedLevels = useMemo(
    () => [...levels].sort((a, b) => a - b),
    [levels],
  );

  const grouped = useMemo(() => {
    const map = new Map<number, SpellDef[]>();
    for (const lvl of sortedLevels) map.set(lvl, []);
    for (const s of spells) {
      const bucket = map.get(s.level);
      if (bucket) bucket.push(s);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [spells, sortedLevels]);

  // Hide empty levels.
  const visibleLevels = sortedLevels.filter((lvl) => (grouped.get(lvl)?.length ?? 0) > 0);

  if (visibleLevels.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No spells available for the levels you can cast.
      </p>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {visibleLevels.map((lvl) => {
        const list = grouped.get(lvl)!;
        const count = list.length;
        const selectedInLevel =
          mode.kind === "picker"
            ? list.filter((s) => mode.selected.has(s.id)).length
            : 0;
        return (
          <Collapsible key={lvl}>
            <CollapsibleTrigger>
              <span className="flex items-center gap-2 min-w-0">
                <ChevronRight className="size-4 shrink-0 transition-transform group-data-[panel-open]/collapsible-trigger:rotate-90" />
                <span className="font-heading text-sm">
                  {ORDINAL[lvl] ?? `${lvl}th`}
                </span>
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <Badge variant="secondary" className="text-[10px]">
                  {count}
                </Badge>
                {mode.kind === "picker" && selectedInLevel > 0 && (
                  <Badge variant="default" className="text-[10px]">
                    {selectedInLevel}
                  </Badge>
                )}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 pt-2">
                {list.map((spell) => {
                  if (mode.kind === "display") {
                    return (
                      <SpellCard
                        key={spell.id}
                        mode="display"
                        spell={spell}
                        onCast={mode.onCast ? () => mode.onCast!(spell) : undefined}
                        granted={mode.grantedSpellIds?.has(spell.id) ?? false}
                      />
                    );
                  }
                  const selected = mode.selected.has(spell.id);
                  const disabled = !selected && mode.remaining <= 0;
                  return (
                    <SpellCard
                      key={spell.id}
                      mode="picker"
                      spell={spell}
                      selected={selected}
                      disabled={disabled}
                      onToggle={() => mode.onToggle(spell.id)}
                    />
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
