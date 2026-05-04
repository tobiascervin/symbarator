// Templar's PG p. 143 corruption-threshold rule: when wisMod > chaMod, the
// threshold formula uses Wis instead of Cha. The override is approach-level
// data on Templar specifically; non-Templar Warrior approaches keep the
// standard `2 × profBonus + chaMod` formula. The mystic branch is
// untouched.
//
// Seeds typed Character fixtures so each scenario's Cha/Wis modifiers are
// deterministic — no wizard walk required.
//
// Note on ability bookkeeping: the fixture base origin is Abducted Human
// with `asi.fixed: { dex: 1, wis: 1 }` and `originAsiAllocation: { dex: 1,
// wis: 1 }` — so final Wis = base + 2. Base ability scores below are picked
// so that the *final* Cha/Wis modifiers match the scenario name.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { templarAtL1WithBless } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";
import type { Character, CharacterLevel } from "@/lib/character/types";

const NOW = "2026-05-04T08:00:00.000Z";

function makeBaseTemplar(
  id: string,
  abilities: Character["abilities"],
  level: CharacterLevel = 1 as CharacterLevel,
): Character {
  return {
    ...templarAtL1WithBless,
    id,
    level,
    abilities,
    // hitDiceRemaining must match level for fixture sanity.
    hitDiceRemaining: level,
  };
}

function makeBerserker(id: string, abilities: Character["abilities"]): Character {
  return {
    id,
    createdAt: NOW,
    updatedAt: NOW,
    level: 1 as CharacterLevel,
    houseRules: { allowL1BoonBurden: false },
    maxHp: 11,
    feats: [],
    identity: {
      name: "Berserker L1",
      pronouns: "they/them",
      personalityTrait: "",
      ideal: "",
      bond: "",
      flaw: "",
      background: "",
    },
    originId: "abducted-human",
    originAsiAllocation: { dex: 1, wis: 1 },
    backgroundId: "",
    backgroundSkillPicks: [],
    backgroundToolPicks: [],
    classId: "warrior",
    approachId: "berserker",
    classSkillPicks: ["athletics", "intimidation", "perception"],
    fightingStyle: "defense",
    abilities,
    abilityMethod: "standard-array",
    classEquipmentPicks: [0, 0, 0, 0],
    classEquipmentChoices: {},
    inventoryOverrides: { added: [], removed: [] },
    boons: [],
    burdens: [],
    boonAbilityChoices: {},
    burdenAbilityChoices: {},
    spellPicks: undefined,
    corruption: { permanent: 0, temporary: 0 },
    notes: "",
    currentHp: 11,
    tempHp: 0,
    currentSpellSlots: new Array(9).fill(0),
    hitDiceRemaining: 1,
    deathSaves: { successes: 0, failures: 0 },
    featureUses: {},
  };
}

test.describe("Templar corruption-threshold override (PG p. 143)", () => {
  test("Templar with Wis > Cha uses Wis: final cha +1, final wis +3 → 7", async ({
    page,
  }) => {
    // 2 × profBonus(2) + max(+1, +3) = 4 + 3 = 7.
    // Base wis 14 + origin +2 = final 16 (+3); base cha 12 = final 12 (+1).
    const id = await seedCharacter(
      page,
      makeBaseTemplar("test-templar-wis-higher", {
        str: 14,
        dex: 10,
        con: 14,
        int: 8,
        wis: 14,
        cha: 12,
      }),
    );
    await gotoSheet(page, id);
    await expect(page.getByTestId("corruption-threshold")).toHaveText("7");
  });

  test("Templar with Wis = Cha uses Cha (tie): final cha +2, final wis +2 → 6", async ({
    page,
  }) => {
    // 2 × profBonus(2) + max(+2, +2) = 4 + 2 = 6.
    // Base wis 12 + origin +2 = final 14 (+2); base cha 14 = final 14 (+2).
    const id = await seedCharacter(
      page,
      makeBaseTemplar("test-templar-tie", {
        str: 14,
        dex: 10,
        con: 14,
        int: 8,
        wis: 12,
        cha: 14,
      }),
    );
    await gotoSheet(page, id);
    await expect(page.getByTestId("corruption-threshold")).toHaveText("6");
  });

  test("Templar with Wis < Cha uses Cha: final cha +3, final wis -1 → 7", async ({
    page,
  }) => {
    // 2 × profBonus(2) + max(+3, -1) = 4 + 3 = 7. The negative wis must NOT
    // be picked up.
    // Base wis 6 + origin +2 = final 8 (-1); base cha 16 = final 16 (+3).
    const id = await seedCharacter(
      page,
      makeBaseTemplar("test-templar-wis-lower", {
        str: 14,
        dex: 10,
        con: 16,
        int: 8,
        wis: 6,
        cha: 16,
      }),
    );
    await gotoSheet(page, id);
    await expect(page.getByTestId("corruption-threshold")).toHaveText("7");
  });

  test("Berserker is unaffected: final cha +1, final wis +5 → 5 (cha-only)", async ({
    page,
  }) => {
    // Berserker has no `corruptionAbilityOverride`, so the high wis is
    // ignored: 2 × 2 + (+1) = 5.
    // Base wis 16 + origin +2 = final 18 (+4); base cha 12 = final 12 (+1).
    const id = await seedCharacter(
      page,
      makeBerserker("test-berserker-high-wis", {
        str: 16,
        dex: 12,
        con: 14,
        int: 10,
        wis: 16,
        cha: 12,
      }),
    );
    await gotoSheet(page, id);
    await expect(page.getByTestId("corruption-threshold")).toHaveText("5");
  });

  test("Templar at L9 with Wis > Cha: final cha +1, final wis +3, profBonus 4 → 11", async ({
    page,
  }) => {
    // Locks in level-aware proficiency-bonus behavior alongside the override:
    // 2 × profBonus(4) + max(+1, +3) = 8 + 3 = 11.
    // Base wis 14 + origin +2 = final 16 (+3); base cha 12 = final 12 (+1).
    const id = await seedCharacter(
      page,
      makeBaseTemplar(
        "test-templar-l9",
        { str: 14, dex: 10, con: 14, int: 8, wis: 14, cha: 12 },
        9 as CharacterLevel,
      ),
    );
    await gotoSheet(page, id);
    await expect(page.getByTestId("corruption-threshold")).toHaveText("11");
  });
});
