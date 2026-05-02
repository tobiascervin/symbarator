// Per-step validation. Each function returns `null` if valid, or a string
// error message to display.

import type { Character } from "./types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { CLASS_BY_ID } from "@/data/classes";

export const STEPS = [
  "origin",
  "background",
  "class",
  "approach",
  "abilities",
  "skills-equipment",
  "identity",
] as const;

export type Step = (typeof STEPS)[number];

export const STEP_LABELS: Record<Step, string> = {
  origin: "Origin",
  background: "Background",
  class: "Class",
  approach: "Approach",
  abilities: "Abilities",
  "skills-equipment": "Skills & Equipment",
  identity: "Identity",
};

export function nextStep(s: Step): Step | null {
  const i = STEPS.indexOf(s);
  return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1] : null;
}

export function prevStep(s: Step): Step | null {
  const i = STEPS.indexOf(s);
  return i > 0 ? STEPS[i - 1] : null;
}

export function validateStep(step: Step, c: Character): string | null {
  switch (step) {
    case "origin": {
      if (!c.originId) return "Choose an origin to continue.";
      const origin = ORIGIN_BY_ID[c.originId];
      if (!origin) return "That origin no longer exists.";
      if (origin.subchoices) {
        const valid = origin.subchoices.options.some(
          (o) => o.id === c.originSubchoiceId,
        );
        if (!valid) return `${origin.subchoices.prompt}.`;
      }
      // Floating ASI allocation must total the right number of points.
      const target = (origin.asi.floating?.count ?? 0) * (origin.asi.floating?.size ?? 0);
      const allocated = Object.values(c.originAsiAllocation).reduce(
        (a, b) => a + (b ?? 0),
        0,
      );
      if (allocated !== target) {
        return `Allocate exactly ${target} bonus point${target === 1 ? "" : "s"} from your origin.`;
      }
      return null;
    }
    case "background": {
      if (!c.backgroundId) return "Choose a background.";
      const bg = BACKGROUND_BY_ID[c.backgroundId];
      if (!bg) return "Background not found.";
      if (bg.originId !== c.originId)
        return "Background does not belong to your chosen origin.";
      const need = bg.skillChoices?.count ?? 0;
      if (c.backgroundSkillPicks.length !== need)
        return `Pick exactly ${need} background skill${need === 1 ? "" : "s"}.`;
      const toolNeed = bg.toolChoices?.count ?? 0;
      if (c.backgroundToolPicks.length !== toolNeed)
        return `Pick exactly ${toolNeed} tool${toolNeed === 1 ? "" : "s"}.`;
      return null;
    }
    case "class": {
      if (!c.classId) return "Choose a class.";
      return null;
    }
    case "approach": {
      if (!c.approachId) return "Choose an approach.";
      const cls = CLASS_BY_ID[c.classId];
      if (!cls) return "Class not found.";
      if (!cls.approaches.find((a) => a.id === c.approachId))
        return "Approach does not match your class.";
      // Mystic-specific: spell picks
      if (cls.spellcasting) {
        const cantripCount = c.spellPicks?.cantrips.length ?? 0;
        const spellCount = c.spellPicks?.spellsKnown.length ?? 0;
        if (cantripCount !== cls.spellcasting.cantripsKnownAt1)
          return `Choose exactly ${cls.spellcasting.cantripsKnownAt1} cantrips.`;
        if (spellCount !== cls.spellcasting.spellsKnownAt1)
          return `Choose exactly ${cls.spellcasting.spellsKnownAt1} 1st-level spell.`;
      }
      // Fighting style at L1 if class offers it
      if (cls.fightingStyleAt1 && !c.fightingStyle) {
        return "Pick a fighting style.";
      }
      return null;
    }
    case "abilities": {
      const total = Object.values(c.abilities).reduce((a, b) => a + b, 0);
      if (total === 0) return "Set your ability scores.";
      // For point-buy mode we'd validate the budget — handled in the UI.
      return null;
    }
    case "skills-equipment": {
      const cls = CLASS_BY_ID[c.classId];
      if (!cls) return null;
      const need = cls.proficiencies.skillChoices.count;
      if (c.classSkillPicks.length !== need)
        return `Pick exactly ${need} class skill${need === 1 ? "" : "s"}.`;
      if (c.classEquipmentPicks.length !== cls.startingEquipment.length)
        return "Choose one option from each equipment line.";
      return null;
    }
    case "identity": {
      if (!c.identity.name.trim()) return "Give your character a name.";
      return null;
    }
  }
}

export function isStepComplete(step: Step, c: Character): boolean {
  return validateStep(step, c) === null;
}

export function highestCompletedStep(c: Character): Step {
  let last: Step = STEPS[0];
  for (const step of STEPS) {
    if (!isStepComplete(step, c)) return last;
    last = step;
  }
  return last;
}
