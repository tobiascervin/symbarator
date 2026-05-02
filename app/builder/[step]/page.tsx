"use client";

import { use } from "react";
import { redirect } from "next/navigation";
import { WizardShell } from "@/components/builder/wizard-shell";
import { OriginStep } from "@/components/builder/origin-step";
import { BackgroundStep } from "@/components/builder/background-step";
import { ClassStep } from "@/components/builder/class-step";
import { ApproachStep } from "@/components/builder/approach-step";
import { AbilitiesStep } from "@/components/builder/abilities-step";
import { BoonsBurdensStep } from "@/components/builder/boons-burdens-step";
import { SkillsEquipmentStep } from "@/components/builder/skills-equipment-step";
import { IdentityStep } from "@/components/builder/identity-step";
import { STEPS, type Step } from "@/lib/character/validation";

export default function BuilderStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  if (!STEPS.includes(step as Step)) {
    redirect("/");
  }
  const s = step as Step;

  return (
    <WizardShell step={s} draftKey={s}>
      {(hook) => {
        switch (s) {
          case "origin":
            return <OriginStep draftHook={hook} />;
          case "background":
            return <BackgroundStep draftHook={hook} />;
          case "class":
            return <ClassStep draftHook={hook} />;
          case "approach":
            return <ApproachStep draftHook={hook} />;
          case "abilities":
            return <AbilitiesStep draftHook={hook} />;
          case "boons-burdens":
            return <BoonsBurdensStep draftHook={hook} />;
          case "skills-equipment":
            return <SkillsEquipmentStep draftHook={hook} />;
          case "identity":
            return <IdentityStep draftHook={hook} />;
        }
      }}
    </WizardShell>
  );
}
