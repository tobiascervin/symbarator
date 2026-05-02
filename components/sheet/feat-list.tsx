"use client";

import { BOON_BY_ID } from "@/data/feats";

interface ResolvedEntry {
  id: string;
  name: string;
  description: string;
}

interface FeatListProps {
  feats: ReadonlyArray<string>;
}

const FIGHTING_STYLE_LABELS: Record<string, string> = {
  archery: "Archery",
  defense: "Defense",
  dueling: "Dueling",
  "great-weapon": "Great Weapon Fighting",
  polearm: "Polearm Fighting",
  shield: "Shield Fighting",
  snare: "Snare Fighting",
  "two-weapon": "Two-Weapon Fighting",
};

/**
 * Resolves accumulated level-up feat ids into grouped, human-readable cards.
 * "Feats" here means the level-up `Character.feats` array — not L1 boons,
 * which are rendered separately by the sheet via `<FeatGroup>` directly.
 *
 * Returns null when feats is empty so the caller can omit the section.
 */
export function FeatList({ feats }: FeatListProps) {
  if (feats.length === 0) return null;

  const fromBoons: ResolvedEntry[] = [];
  const special: ResolvedEntry[] = [];

  for (const id of feats) {
    if (id === "change-self") {
      special.push({
        id,
        name: "Change Self",
        description: "Changeling shapeshifting feat (PG p. 51). Consumes the ASI/feat slot it was taken in place of.",
      });
      continue;
    }
    if (id.startsWith("fighting-style:")) {
      const styleId = id.slice("fighting-style:".length);
      const label = FIGHTING_STYLE_LABELS[styleId] ?? styleId;
      special.push({
        id,
        name: `Fighting Style — ${label}`,
        description: "See class entry for the style's mechanical effect.",
      });
      continue;
    }
    const boon = BOON_BY_ID[id];
    if (boon) {
      fromBoons.push({ id, name: boon.name, description: boon.description });
    } else {
      special.push({
        id,
        name: id,
        description: "No description available — unknown feat id.",
      });
    }
  }

  return (
    <div className="space-y-4 text-[#1d1814]">
      {fromBoons.length > 0 && (
        <FeatGroup title="From the Boon list" entries={fromBoons} />
      )}
      {special.length > 0 && (
        <FeatGroup title="Special" entries={special} muted />
      )}
    </div>
  );
}

/**
 * Reusable card-list group used by the Feats section, the Boons section, and
 * the Burdens section on the sheet. Entries are rendered as small bordered
 * cards with a name and description.
 */
export function FeatGroup({
  title,
  entries,
  muted,
}: {
  title: string;
  entries: ReadonlyArray<ResolvedEntry>;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="font-display text-xs uppercase tracking-[0.3em] text-[#5a4d2f] mb-2">
        {title}
      </p>
      <ul className="space-y-2">
        {entries.map((e) => (
          <li
            key={e.id}
            className={
              muted
                ? "rounded-md border border-dashed border-[#3a322a]/30 bg-[#f7f1e3]/40 p-2"
                : "rounded-md border border-[#3a322a]/20 p-2"
            }
          >
            <p className="font-display tracking-wide text-base">{e.name}</p>
            <p className="text-xs leading-snug text-[#3a322a]">{e.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
