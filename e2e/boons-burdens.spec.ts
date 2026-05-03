// Boons & Burdens wizard step + sheet integration.

import { test, expect } from "@playwright/test";
import { seedCharacter, readCharacter } from "./helpers/seed";
import { freshL1Hero, withL1BoonsAllowed } from "./helpers/fixtures";
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

    // Boons section visible. The boon's name and the +1 INT badge render
    // separately as part of the FeatCard layout.
    await expect(page.getByRole("heading", { name: /^Boons$/ })).toBeVisible();
    await expect(page.getByText(/^Archivist$/)).toBeVisible();
    await expect(page.getByText(/^\+1 INT$/)).toBeVisible();
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

    await expect(page.getByText(/^Blood Ties$/)).toBeVisible();
    await expect(page.getByText(/^\+1 CHA$/)).toBeVisible();
  });

  test("burden seeded directly is shown on the sheet", async ({ page }) => {
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-nightmares-hero",
      burdens: ["nightmares"],
    });
    await gotoSheet(page, id);

    await expect(page.getByRole("heading", { name: /^Burdens$/ })).toBeVisible();
    await expect(page.getByText(/^Nightmares$/)).toBeVisible();
  });

  test("wizard step lets the player pick a boon and persists it", async ({ page }) => {
    const id = await seedCharacter(page, withL1BoonsAllowed(freshL1Hero));
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
    const id = await seedCharacter(page, withL1BoonsAllowed(freshL1Hero));
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

test.describe("L1 Boons & Burdens house rule (gating)", () => {
  test("RAW (flag off): Continue from abilities skips boons-burdens", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoBuilder(page, id, "abilities");

    // The step indicator should NOT contain a Boons & Burdens entry.
    await expect(
      page.getByRole("navigation", { name: /Wizard progress/i }).getByText(/Boons & Burdens/i),
    ).toHaveCount(0);

    // Continue button label points straight at Skills & Equipment.
    const continueBtn = page.getByRole("button", { name: /^Continue/ });
    await expect(continueBtn).toContainText(/Skills & Equipment/i);
    await continueBtn.click();
    await expect(page).toHaveURL(/\/builder\/skills-equipment/);
  });

  test("RAW (flag off): direct nav to /builder/boons-burdens redirects to abilities", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoBuilder(page, id, "boons-burdens");
    await expect(page).toHaveURL(new RegExp(`/builder/abilities\\?id=${id}`));
  });

  test("Toggle on the abilities step inserts the boons-burdens step", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoBuilder(page, id, "abilities");

    // Flip the toggle on — the wizard's Continue label should now point at
    // Boons & Burdens, and the indicator should contain it.
    await page
      .getByRole("checkbox", { name: /GM allows L1 Boons & Burdens/i })
      .click();

    await expect(
      page.getByRole("navigation", { name: /Wizard progress/i }).getByText(/Boons & Burdens/i),
    ).toBeVisible();
    const continueBtn = page.getByRole("button", { name: /^Continue/ });
    await expect(continueBtn).toContainText(/Boons & Burdens/i);

    await continueBtn.click();
    await expect(page).toHaveURL(/\/builder\/boons-burdens/);
  });
});
