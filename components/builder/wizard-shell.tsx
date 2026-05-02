"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { BlackletterTitle } from "@/components/theme/blackletter-title";
import { useDraft } from "@/components/builder/use-draft";
import {
  STEPS,
  STEP_LABELS,
  nextStep,
  prevStep,
  validateStep,
  type Step,
} from "@/lib/character/validation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function WizardShell({
  step,
  children,
  draftKey,
}: {
  step: Step;
  draftKey: string;
  children: (args: ReturnType<typeof useDraft>) => React.ReactNode;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const draftHook = useDraft(id);
  const { draft, loading, save } = draftHook;

  // Redirect home if no id provided
  useEffect(() => {
    if (!id) router.replace("/");
  }, [id, router]);

  async function handleAdvance() {
    if (!draft) return;
    const err = validateStep(step, draft);
    if (err) {
      toast.error(err);
      return;
    }
    await save();
    const nxt = nextStep(step);
    if (nxt) router.push(`/builder/${nxt}?id=${id}`);
    else router.push(`/characters/${id}`);
  }

  async function handleBack() {
    await save();
    const prv = prevStep(step);
    if (prv) router.push(`/builder/${prv}?id=${id}`);
    else router.push("/");
  }

  return (
    <main className="min-h-full w-full px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground"
          >
            ← Symbaroum
          </Link>
          <span className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
            New Hero · Step {STEPS.indexOf(step) + 1} of {STEPS.length}
          </span>
        </header>

        {/* Step indicator */}
        <nav
          aria-label="Wizard progress"
          className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
        >
          {STEPS.map((s, i) => {
            const isActive = s === step;
            const isPast = STEPS.indexOf(step) > i;
            const stepHref = `/builder/${s}?id=${id}`;
            return (
              <div key={s} className="flex items-center gap-2">
                <Link
                  href={isPast ? stepHref : "#"}
                  className={cn(
                    "font-display tracking-wider px-2 py-1 rounded-sm transition-colors",
                    isActive && "bg-primary/20 text-primary-foreground border border-primary/40",
                    !isActive && isPast && "text-muted-foreground hover:text-foreground",
                    !isActive && !isPast && "text-muted-foreground/50 pointer-events-none",
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {STEP_LABELS[s]}
                </Link>
                {i < STEPS.length - 1 && (
                  <span aria-hidden className="text-muted-foreground/40">·</span>
                )}
              </div>
            );
          })}
        </nav>

        <OrnateDivider className="mb-8" />

        <BlackletterTitle level={2} className="mb-6">
          {STEP_LABELS[step]}
        </BlackletterTitle>

        {loading && <p className="text-muted-foreground italic">Loading draft…</p>}

        {!loading && draft && <div key={draftKey}>{children(draftHook)}</div>}

        {!loading && draft && (
          <div className="mt-10 flex items-center justify-between gap-2 border-t border-border pt-6">
            <Button variant="ghost" onClick={handleBack}>
              ← Back
            </Button>
            <Button onClick={handleAdvance} className="font-display tracking-wider">
              {nextStep(step) ? `Continue → ${STEP_LABELS[nextStep(step) as Step]}` : "Finish"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
