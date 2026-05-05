"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { BlackletterTitle } from "@/components/theme/blackletter-title";
import { useDraft } from "@/components/builder/use-draft";
import {
  STEP_LABELS,
  nextStep,
  prevStep,
  stepsFor,
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
    const nxt = nextStep(step, draft);
    if (nxt) router.push(`/builder/${nxt}?id=${id}`);
    else router.push(`/characters/${id}`);
  }

  async function handleBack() {
    await save();
    const prv = draft ? prevStep(step, draft) : prevStep(step);
    if (prv) router.push(`/builder/${prv}?id=${id}`);
    else router.push("/");
  }

  // Active step list depends on the character's house-rules flags. While
  // loading, fall back to a static list so the indicator doesn't flicker.
  const activeSteps = draft ? stepsFor(draft) : null;

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
          {activeSteps && (
            <span className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
              New Hero · Step {activeSteps.indexOf(step) + 1} of{" "}
              {activeSteps.length}
            </span>
          )}
        </header>

        {/* Step indicator */}
        {activeSteps && (
          <nav
            aria-label="Wizard progress"
            className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
          >
            {activeSteps.map((s, i) => {
              const isActive = s === step;
              const isPast = activeSteps.indexOf(step) > i;
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
                  {i < activeSteps.length - 1 && (
                    <span aria-hidden className="text-muted-foreground/40">·</span>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <OrnateDivider className="mb-8" />

        <BlackletterTitle level={2} className="mb-6">
          {STEP_LABELS[step]}
        </BlackletterTitle>

        {loading && <p className="text-muted-foreground italic">Loading draft…</p>}

        {!loading && draft && <div key={draftKey}>{children(draftHook)}</div>}

        {!loading && draft && (
          // On phones (<sm) the nav stacks via flex-col-reverse so Continue
          // sits visually on top — primary action under the thumb — and
          // both buttons go full-width. At sm+ we get the prior horizontal
          // row with Back left, Continue right at natural widths.
          <div className="mt-10 flex flex-col-reverse gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              ← Back
            </Button>
            <Button
              onClick={handleAdvance}
              className="font-display tracking-wider w-full sm:w-auto whitespace-normal h-auto py-2"
            >
              {nextStep(step, draft)
                ? `Continue → ${STEP_LABELS[nextStep(step, draft) as Step]}`
                : "Finish"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
