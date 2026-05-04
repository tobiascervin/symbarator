"use client";

import { cn } from "@/lib/utils";

export type FeatCardBadgeVariant =
  | "default"
  | "outline"
  | "secondary"
  | "destructive";

export interface FeatCardBadge {
  label: string;
  variant?: FeatCardBadgeVariant;
}

export interface FeatCardProps {
  name: string;
  description: string;
  badges?: ReadonlyArray<FeatCardBadge>;
  /** Mutes the card slightly — used for Burdens to read as "carried weight". */
  muted?: boolean;
  /**
   * When defined, the card becomes a tap target that opens the
   * FeatTapPopover for the entry. Wired by the sheet's companion-mode
   * wrapper; left undefined for printable mode and wizard preview surfaces.
   */
  onTap?(): void;
}

/**
 * One feat / boon / burden entry on the character sheet. Visual structure
 * mirrors `SpellCard` display mode (bordered card · display-font name ·
 * optional badge row · description), but uses the parchment palette so it
 * sits naturally inside the sheet's `Parchment` panels.
 */
export function FeatCard({
  name,
  description,
  badges,
  muted,
  onTap,
}: FeatCardProps) {
  const inner = (
    <>
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <span className="font-display text-base text-[#1d1814]">{name}</span>
        {badges && badges.length > 0 && (
          <span className="flex flex-wrap items-center gap-1">
            {badges.map((b) => (
              <FeatBadge key={b.label} {...b} />
            ))}
          </span>
        )}
      </div>
      <p className="text-xs leading-snug text-[#3a322a]">{description}</p>
    </>
  );

  const baseClass = cn(
    "rounded-md border p-3 flex flex-col gap-1.5 text-left w-full",
    muted
      ? "border-dashed border-[#3a322a]/30 bg-[#f7f1e3]/40"
      : "border-[#9a8a6b]/60 bg-[#efe5cb]/40",
  );

  if (onTap) {
    return (
      <button
        type="button"
        onClick={onTap}
        className={cn(
          baseClass,
          "cursor-pointer transition-colors hover:border-[#7a1f1f]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1f1f]/40",
        )}
        aria-label={`Open ${name}`}
      >
        {inner}
      </button>
    );
  }
  return <div className={baseClass}>{inner}</div>;
}

/**
 * Section grouping for a list of feat cards. Renders a small caps header and
 * the cards in a stacked column. Hidden entirely if there are no entries.
 */
export function FeatCardGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-display text-xs uppercase tracking-[0.3em] text-[#5a4d2f] mb-2">
        {title}
      </p>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FeatBadge({ label, variant = "outline" }: FeatCardBadge) {
  const styles: Record<FeatCardBadgeVariant, string> = {
    default: "bg-[#7a1f1f] text-[#f7f1e3] border-[#7a1f1f]",
    outline: "bg-transparent text-[#5a4d2f] border-[#9a8a6b]",
    secondary: "bg-[#9a8a6b]/30 text-[#1d1814] border-[#9a8a6b]/60",
    destructive: "bg-[#7a1f1f]/15 text-[#7a1f1f] border-[#7a1f1f]/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0 font-display text-[10px] tracking-widest uppercase leading-5",
        styles[variant],
      )}
    >
      {label}
    </span>
  );
}
