import { cn } from "@/lib/utils";

export function Parchment({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("parchment-card rounded-md p-6", className)}>
      {children}
    </div>
  );
}
