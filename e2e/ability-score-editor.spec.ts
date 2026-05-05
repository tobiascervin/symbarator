// L1-only ability-score editor on the character sheet — the in-place
// replacement for the global Edit link that used to send the user back to
// the wizard. The dialog reuses the wizard's pickers (factored into shared
// components) and gates Save with `validateAbilityEdit`, which composes the
// per-step validators plus point-buy / standard-array defensive checks.

import { test, expect } from "@playwright/test";
import { seedCharacter, readCharacter } from "./helpers/seed";
import { gotoSheet } from "./helpers/visit";
import { freshL1Hero } from "./helpers/fixtures";
import type { Character, CharacterLevel } from "@/lib/character/types";

const NOW = "2026-05-05T08:00:00.000Z";

function makeHumanWarrior(
  id: string,
  overrides: Partial<Character> = {},
): Character {
  return {
    id,
    createdAt: NOW,
    updatedAt: NOW,
    level: 1 as CharacterLevel,
    houseRules: { allowL1BoonBurden: false },
    maxHp: 12,
    feats: [],
    identity: {
      name: "Human Warrior",
      pronouns: "they/them",
      personalityTrait: "",
      ideal: "",
      bond: "",
      flaw: "",
      background: "",
    },
    originId: "human",
    originSubchoiceId: "ambrian",
    originAsiAllocation: { dex: 1 },
    backgroundId: "",
    backgroundSkillPicks: [],
    backgroundToolPicks: [],
    classId: "warrior",
    approachId: "berserker",
    classSkillPicks: ["athletics", "intimidation", "perception"],
    fightingStyle: "defense",
    abilities: { str: 14, dex: 12, con: 14, int: 8, wis: 10, cha: 12 },
    abilityMethod: "manual",
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
    currentHp: 12,
    tempHp: 0,
    currentSpellSlots: new Array(9).fill(0),
    hitDiceRemaining: 1,
    deathSaves: { successes: 0, failures: 0 },
    featureUses: {},
    ...overrides,
  };
}

test.describe("Sheet — global Edit link removal", () => {
  test("character-sheet header has no global Edit link", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    // Header surface: Share / Export JSON / Print / Level Up remain.
    await expect(page.getByRole("button", { name: /Share/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Export JSON/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Print/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Level Up/ })).toBeVisible();
    // Global Edit link is gone.
    await expect(page.getByRole("link", { name: /^Edit$/ })).toHaveCount(0);
  });
});

test.describe("Sheet — L1 ability-score editor (pencil-icon)", () => {
  test("L1 sheet exposes the pencil icon on the Abilities panel", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    const trigger = page.getByRole("button", { name: "Edit ability scores" });
    await expect(trigger).toBeVisible();
  });

  test("Manual-mode edit changes a base score and persists", async ({ page }) => {
    // freshL1Hero uses standard-array; seed a manual-mode char so we can
    // freely poke a base score.
    const c = makeHumanWarrior("test-edit-manual");
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: "Edit ability scores" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Manual tab is the seeded method. The Manual picker uses a number input;
    // bump STR to 16. Six inputs in DOM order match ABILITY_ORDER.
    const inputs = dialog.locator('input[type="number"]');
    await inputs.first().fill("16");

    // Final STR cell should now read 16 (no boon/burden/origin str bonuses).
    await expect(dialog.getByTestId("dialog-final-str")).toContainText("16");

    // Save and confirm persistence.
    await dialog.getByTestId("dialog-save").click();
    await expect(dialog).not.toBeVisible();

    const after = await readCharacter(page, id);
    expect(after?.abilities.str).toBe(16);
  });

  test("Human floating ASI is editable; Final readout updates live and persists", async ({ page }) => {
    // Human's floating: { count: 1, size: 1, from: ["dex","con","cha"] }.
    // Seed allocates +1 to DEX → final DEX 13. Re-allocate to CHA → final
    // CHA 13, final DEX back to 12.
    const c = makeHumanWarrior("test-edit-human-floating");
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: "Edit ability scores" }).click();
    const dialog = page.getByRole("dialog");

    // Initial: DEX = 12 base + 1 floating + 1 Ambrian sub-choice (dex? actually
    // Ambrian gives +1 INT; only the floating affects DEX). Final DEX = 13.
    await expect(dialog.getByTestId("dialog-final-dex")).toContainText("13");

    // Find the FloatingAsiPicker buttons — they're "−" / "+" inside cells.
    // Strategy: click "−" on DEX (which is the only one currently +1) then
    // "+" on CHA. The picker renders a fixed grid of 6 cells.
    // DEX is index 1 (after STR), CHA index 5.
    const minusButtons = dialog.getByRole("button", { name: "−" });
    const plusButtons = dialog.getByRole("button", { name: "+" });

    // Decrement DEX
    await minusButtons.nth(1).click();
    // Increment CHA
    await plusButtons.nth(5).click();

    // Final DEX now 12; Final CHA now 13.
    await expect(dialog.getByTestId("dialog-final-dex")).toContainText("12");
    await expect(dialog.getByTestId("dialog-final-cha")).toContainText("13");

    // Save and confirm persistence.
    await dialog.getByTestId("dialog-save").click();
    const after = await readCharacter(page, id);
    expect(after?.originAsiAllocation.dex ?? 0).toBe(0);
    expect(after?.originAsiAllocation.cha ?? 0).toBe(1);
  });

  test("Choice-boon (Blood Ties) ability picker updates the Final readout", async ({ page }) => {
    // House rule on so the character has a boon. Blood Ties is a +1 to a
    // chosen ability — preselected to STR.
    const c = makeHumanWarrior("test-edit-blood-ties", {
      houseRules: { allowL1BoonBurden: true },
      boons: ["blood-ties"],
      boonAbilityChoices: { "blood-ties": "str" },
    });
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: "Edit ability scores" }).click();
    const dialog = page.getByRole("dialog");

    // Initial: STR 14 base + 2 Human fixed + 1 Blood Ties = 17.
    await expect(dialog.getByTestId("dialog-final-str")).toContainText("17");

    // Inside the boon-choice card, click WIS to switch the bonus.
    const boonCard = dialog.getByTestId("boon-choice-blood-ties");
    await boonCard.getByRole("button", { name: /Wisdom/i }).click();

    // STR drops to 16 (14 base + 2 Human fixed); WIS rises to 11 (10 + Blood Ties).
    await expect(dialog.getByTestId("dialog-final-str")).toContainText("16");
    await expect(dialog.getByTestId("dialog-final-wis")).toContainText("11");
  });

  test("Point-buy over budget keeps Save disabled with a reason", async ({ page }) => {
    // Seed a hand-edited point-buy character whose budget exceeds 27.
    // Cost table: 8→0, 13→5. Six abilities at 13 = 30, over by 3.
    const c = makeHumanWarrior("test-edit-pb-over", {
      abilityMethod: "point-buy",
      abilities: { str: 13, dex: 13, con: 13, int: 13, wis: 13, cha: 13 },
    });
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: "Edit ability scores" }).click();
    const dialog = page.getByRole("dialog");

    // Save is disabled and the reason cites the budget.
    const save = dialog.getByTestId("dialog-save");
    await expect(save).toBeDisabled();
    await expect(dialog.getByTestId("dialog-save-reason")).toContainText(
      /Point-buy budget/i,
    );
  });

  test("Cancel discards the draft", async ({ page }) => {
    const c = makeHumanWarrior("test-edit-cancel");
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: "Edit ability scores" }).click();
    const dialog = page.getByRole("dialog");

    const inputs = dialog.locator('input[type="number"]');
    await inputs.first().fill("18");
    await expect(dialog.getByTestId("dialog-final-str")).toContainText("18");

    await dialog.getByRole("button", { name: /Cancel/ }).click();
    await expect(dialog).not.toBeVisible();

    // Persisted character is unchanged.
    const after = await readCharacter(page, id);
    expect(after?.abilities.str).toBe(c.abilities.str);
  });

  test("L≥2 character has no pencil icon", async ({ page }) => {
    const c = makeHumanWarrior("test-edit-l2", {
      level: 2 as CharacterLevel,
      hitDiceRemaining: 2,
      maxHp: 17,
      currentHp: 17,
    });
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await expect(
      page.getByRole("button", { name: "Edit ability scores" }),
    ).toHaveCount(0);
  });
});
