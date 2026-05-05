import { cn } from "@/lib/utils";

export function BlackletterTitle({
  children,
  level = 1,
  className,
}: {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}) {
  const Tag = (`h${level}` as unknown) as "h1" | "h2" | "h3";
  // Level-1 title uses CSS clamp() so it shrinks fluidly between phone and
  // desktop without a JS resize listener: ~2rem at 360px → ~3.5em at the
  // ~1024px design width. The clamp upper bound matches the prior `text-6xl`
  // (≈3.75rem) so desktop visuals are unchanged. Levels 2/3 keep their
  // existing static sizes — they're shorter strings and don't overflow.
  const sizes = {
    1: "[font-size:clamp(2rem,6vw+0.5rem,3.5rem)]",
    2: "text-3xl md:text-4xl",
    3: "text-xl md:text-2xl",
  } as const;
  return (
    <Tag
      className={cn(
        "font-display font-semibold tracking-wide text-foreground",
        sizes[level],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
