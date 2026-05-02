import { cn } from "@/lib/utils";

export function OrnateDivider({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  if (label) {
    return (
      <div className={cn("ornate-divider", className)} role="separator">
        <span className="diamond" aria-hidden />
        <span className="font-display tracking-[0.3em] text-xs uppercase">
          {label}
        </span>
        <span className="diamond" aria-hidden />
      </div>
    );
  }
  return (
    <div className={cn("ornate-divider", className)} role="separator">
      <span className="diamond" aria-hidden />
    </div>
  );
}
