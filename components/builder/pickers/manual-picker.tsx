"use client";

import {
  ABILITY_LABELS,
  ABILITY_ORDER,
  type Ability,
} from "@/lib/character/types";

export interface ManualPickerProps {
  abilities: Record<Ability, number>;
  onChange(next: Record<Ability, number>): void;
}

export function ManualPicker({ abilities, onChange }: ManualPickerProps) {
  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Type any value 3–20. Useful for table house rules or rolled stats.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ABILITY_ORDER.map((ab) => (
          <div key={ab} className="rounded-md border border-border p-3">
            <label className="block">
              <span className="font-display tracking-widest text-xs uppercase text-muted-foreground">
                {ABILITY_LABELS[ab]}
              </span>
              <input
                type="number"
                min={3}
                max={20}
                value={abilities[ab]}
                onChange={(e) => {
                  const n = Number.parseInt(e.target.value, 10);
                  if (!Number.isFinite(n)) return;
                  onChange({
                    ...abilities,
                    [ab]: Math.max(3, Math.min(20, n)),
                  });
                }}
                className="w-full mt-1 px-2 py-1 rounded bg-input/40 border border-border font-display text-2xl text-center"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
