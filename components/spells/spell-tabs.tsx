"use client";

import { useMemo, useState } from "react";
import type { SpellDef, SpellLevel } from "@/lib/character/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  | { kind: "display" }
  | {
      kind: "picker";
      selected: ReadonlySet<string>;
      onToggle(spellId: string): void;
      remaining: number;
    };

export interface SpellTabsProps {
  /** All spells to consider; will be filtered/grouped by level. */
  spells: ReadonlyArray<SpellDef>;
  /** Which levels to render as tabs (typically the levels available to the consumer). */
  levels: ReadonlyArray<SpellLevel>;
  /** Tab to start on. Defaults to the lowest in `levels`. */
  defaultLevel?: SpellLevel;
  mode: SpellTabsMode;
}

/**
 * Tabbed spell list. One tab per spell level the consumer hands in (cantrips
 * use the label "Cantrips"). Each tab label includes a count badge of how
 * many spells live in that tab. In picker mode each spell card is a
 * checkbox; in display mode each is a static info card.
 *
 * The picker's `remaining` lets us disable unselected cards once the player
 * has hit the required pick count, while still letting them deselect.
 */
export function SpellTabs({ spells, levels, defaultLevel, mode }: SpellTabsProps) {
  const sortedLevels = useMemo(
    () => [...levels].sort((a, b) => a - b),
    [levels],
  );
  const startLevel = defaultLevel ?? sortedLevels[0];
  const [active, setActive] = useState<string>(String(startLevel ?? 1));

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
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList variant="line" className="flex-wrap">
        {visibleLevels.map((lvl) => {
          const count = grouped.get(lvl)?.length ?? 0;
          return (
            <TabsTrigger key={lvl} value={String(lvl)}>
              {ORDINAL[lvl] ?? `${lvl}th`}
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {visibleLevels.map((lvl) => (
        <TabsContent key={lvl} value={String(lvl)} className="mt-3">
          <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {grouped.get(lvl)!.map((spell) => {
              if (mode.kind === "display") {
                return <SpellCard key={spell.id} mode="display" spell={spell} />;
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
        </TabsContent>
      ))}
    </Tabs>
  );
}
