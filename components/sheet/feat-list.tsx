"use client";

import { FEAT_BY_ID } from "@/data/feats";
import { FeatCard, FeatCardGroup, type FeatCardBadge } from "./feat-card";

export interface ResolvedEntry {
  id: string;
  name: string;
  description: string;
  badges?: ReadonlyArray<FeatCardBadge>;
}

interface FeatListProps {
  feats: ReadonlyArray<string>;
  /** Tap handler routed by the sheet's companion-mode wrapper. Receives the
   *  resolved entry so the popover can open with name + description + badges. */
  onTap?(entry: ResolvedEntry): void;
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
export function FeatList({ feats, onTap }: FeatListProps) {
  if (feats.length === 0) return null;

  const fromBoons: ResolvedEntry[] = [];
  const fromOrigin: ResolvedEntry[] = [];
  const fromClass: ResolvedEntry[] = [];
  const special: ResolvedEntry[] = [];

  for (const id of feats) {
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
    const feat = FEAT_BY_ID[id];
    if (!feat) {
      special.push({
        id,
        name: id,
        description: "No description available — unknown feat id.",
      });
      continue;
    }
    const entry: ResolvedEntry = {
      id,
      name: feat.name,
      description: feat.description,
    };
    if (feat.category === "boon") fromBoons.push(entry);
    else if (feat.category === "origin") fromOrigin.push(entry);
    else fromClass.push(entry);
  }

  return (
    <div className="space-y-4 text-[#1d1814]">
      {fromBoons.length > 0 && (
        <FeatGroup title="From the Boon list" entries={fromBoons} onTap={onTap} />
      )}
      {fromOrigin.length > 0 && (
        <FeatGroup title="Origin Feats" entries={fromOrigin} onTap={onTap} />
      )}
      {fromClass.length > 0 && (
        <FeatGroup title="Class Feats" entries={fromClass} onTap={onTap} />
      )}
      {special.length > 0 && (
        <FeatGroup title="Special" entries={special} muted onTap={onTap} />
      )}
    </div>
  );
}

/**
 * Reusable group used by the Feats section, the Boons section, and the
 * Burdens section on the sheet. Entries render as `FeatCard`s — same visual
 * structure as `SpellCard` so adjacent sheet sections read coherently.
 */
export function FeatGroup({
  title,
  entries,
  muted,
  onTap,
}: {
  title: string;
  entries: ReadonlyArray<ResolvedEntry>;
  muted?: boolean;
  onTap?(entry: ResolvedEntry): void;
}) {
  if (entries.length === 0) return null;
  return (
    <FeatCardGroup title={title}>
      {entries.map((e) => (
        <li key={e.id}>
          <FeatCard
            name={e.name}
            description={e.description}
            badges={e.badges}
            muted={muted}
            onTap={onTap ? () => onTap(e) : undefined}
          />
        </li>
      ))}
    </FeatCardGroup>
  );
}
