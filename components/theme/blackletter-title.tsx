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
  const sizes = {
    1: "text-5xl md:text-6xl",
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
