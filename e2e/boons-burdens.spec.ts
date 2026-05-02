// Boons & Burdens wizard step + sheet integration.

import { test, expect } from "@playwright/test";
import { seedCharacter, readCharacter } from "./helpers/seed";
import { freshL1Hero } from "./helpers/fixtures";
import { gotoBuilder, gotoSheet } from "./helpers/visit";

test.describe("Boons & Burdens", () => {
  test("seeded character without boons hides Boons section on sheet", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);
    // Sheet renders without a Boons heading (the section is hidden when empty).
    await expect(page.getByRole("heading", { name: /^Boons$/ })).toHaveCount(0);
  });

  test("seeded character with a fixed-ability boon shows it on the sheet", async ({ page }) => {
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-archivist-hero",
      boons: ["archivist"],
      boonAbilityChoices: {},
    });
    await gotoSheet(page, id);

    // Boons section visible with the boon's resolved name and "+1 INT" suffix.
    await expect(page.getByRole("heading", { name: /^Boons$/ })).toBeVisible();
    await expect(page.getByText(/Archivist \(\+1 INT\)/)).toBeVisible();
  });

  test("seeded character with a choice-boon shows the chosen ability label", async ({ page }) => {
    // Blood Ties is a choice-boon (any of the 6 abilities). Pick CHA.
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-blood-ties-hero",
      boons: ["blood-ties"],
      boonAbilityChoices: { "blood-ties": "cha" },
    });
    await gotoSheet(page, id);

    await expect(page.getByText(/Blood Ties \(\+1 CHA\)/)).toBeVisible();
  });

  test("burden seeded directly is shown on the sheet", async ({ page }) => {
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-haunted-hero",
      burdens: ["haunted"],
    });
    await gotoSheet(page, id);

    await expect(page.getByRole("heading", { name: /^Burdens$/ })).toBeVisible();
    await expect(page.getByText(/^Haunted$/)).toBeVisible();
  });

  test("wizard step lets the player pick a boon and persists it", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoBuilder(page, id, "boons-burdens");

    // Pick Archivist (a fixed-ability boon — int +1).
    await page.getByRole("button", { name: /^Archivist/ }).click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // After advancing, the persisted state has the boon.
    await expect(page).toHaveURL(/\/builder\/skills-equipment/);
    const after = await readCharacter(page, id);
    expect(after?.boons).toEqual(["archivist"]);
    expect(after?.boonAbilityChoices).toEqual({});
  });

  test("choice-boon requires picking an ability before advancing", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoBuilder(page, id, "boons-burdens");

    // Pick Blood Ties (a choice-boon) but don't pick the ability.
    await page.getByRole("button", { name: /^Blood Ties/ }).click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // Validation error toast appears, URL doesn't advance.
    await expect(page.getByText(/pick the ability that gets \+1/i)).toBeVisible();
    await expect(page).toHaveURL(/\/builder\/boons-burdens/);

    // Pick CHA via the inline ability picker, then advance succeeds.
    await page.getByRole("button", { name: /^Charisma$/ }).click();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await expect(page).toHaveURL(/\/builder\/skills-equipment/);

    const after = await readCharacter(page, id);
    expect(after?.boonAbilityChoices?.["blood-ties"]).toBe("cha");
  });
});
