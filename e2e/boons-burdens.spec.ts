// Boons & Burdens wizard step + sheet integration.

import { test, expect } from "@playwright/test";
import { seedCharacter, seedRaw, readCharacter, readMigratedCharacter, reseedCurrent } from "./helpers/seed";
import { freshL1Hero, withL1BoonsAllowed } from "./helpers/fixtures";
import { gotoBuilder, gotoSheet } from "./helpers/visit";
import { computeFinalAbilities } from "@/lib/character/compute";

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

  test("burden seeded directly is shown on the sheet with its bonus badge", async ({ page }) => {
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-nightmares-hero",
      burdens: ["nightmares"],
    });
    await gotoSheet(page, id);

    await expect(page.getByRole("heading", { name: /^Burdens$/ })).toBeVisible();
    await expect(page.getByText(/^Nightmares$/)).toBeVisible();
    // Nightmares is a +2 CON burden — the FeatCard badge renders alongside the name.
    await expect(page.getByText(/^\+2 CON$/)).toBeVisible();
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

test.describe("Burden ability bonuses (compute integration)", () => {
  test("fixed-bonus burden raises the named ability via computeFinalAbilities", async ({ page }) => {
    const seeded = {
      ...freshL1Hero,
      id: "test-bestial-bonus",
      burdens: ["bestial"], // +2 CON
    };
    const id = await seedCharacter(page, seeded);
    await gotoSheet(page, id);

    const after = await readMigratedCharacter(page, id);
    expect(after).not.toBeNull();
    const baseline = computeFinalAbilities({ ...after!, burdens: [], burdenAbilityChoices: {} });
    const withBurden = computeFinalAbilities(after!);
    // Burden adds exactly +2 CON; everything else is unchanged.
    expect(withBurden.total.con).toBe(baseline.total.con + 2);
    expect(withBurden.total.str).toBe(baseline.total.str);
    expect(withBurden.total.dex).toBe(baseline.total.dex);
    expect(withBurden.total.int).toBe(baseline.total.int);
    expect(withBurden.total.wis).toBe(baseline.total.wis);
    expect(withBurden.total.cha).toBe(baseline.total.cha);

    // Sheet renders the bonus badge for the burden card.
    await expect(page.getByText(/^\+2 CON$/)).toBeVisible();
  });

  test("choose-one burden — picker rejects advance until ability picked, then persists", async ({ page }) => {
    const id = await seedCharacter(page, withL1BoonsAllowed(freshL1Hero));
    await gotoBuilder(page, id, "boons-burdens");

    // Pick Impulsive (choose-one between STR and CHA) but don't pick the ability.
    await page.getByRole("button", { name: /^Impulsive/ }).click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // Validation toast; URL doesn't advance.
    await expect(page.getByText(/Impulsive: pick the ability that gets \+2/i)).toBeVisible();
    await expect(page).toHaveURL(/\/builder\/boons-burdens/);

    // Pick Strength via the inline picker, then advance succeeds.
    // The Impulsive card's picker only offers STR and CHA.
    const impulsiveCard = page.locator("div").filter({ hasText: /^Impulsive/ }).first();
    await impulsiveCard.getByRole("button", { name: /^Strength$/ }).click();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await expect(page).toHaveURL(/\/builder\/skills-equipment/);

    const after = await readCharacter(page, id);
    expect(after?.burdens).toEqual(["impulsive"]);
    expect(after?.burdenAbilityChoices?.["impulsive"]).toEqual(["str"]);
  });

  test("Dark Blood (choose-two) — surfaces corruption warning, requires 2 distinct picks, raises both abilities", async ({ page }) => {
    const id = await seedCharacter(page, withL1BoonsAllowed(freshL1Hero));
    await gotoBuilder(page, id, "boons-burdens");

    await page.getByRole("button", { name: /^Dark Blood/ }).click();

    // Warning chip is visible when Dark Blood is selected.
    await expect(page.getByText(/\+2 permanent Corruption — track manually/i)).toBeVisible();

    // Try to advance with no picks — validation rejects.
    await page.getByRole("button", { name: /^Continue/ }).click();
    await expect(
      page.getByText(/Dark Blood: pick exactly 2 abilities/i),
    ).toBeVisible();

    // Pick STR + WIS via the inline picker (any-of-six for choose-two).
    const darkBloodCard = page.locator("div").filter({ hasText: /^Dark Blood/ }).first();
    await darkBloodCard.getByRole("button", { name: /^Strength$/ }).click();
    await darkBloodCard.getByRole("button", { name: /^Wisdom$/ }).click();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await expect(page).toHaveURL(/\/builder\/skills-equipment/);

    // Persisted picks and the compute result.
    const after = await readMigratedCharacter(page, id);
    expect(after?.burdens).toEqual(["dark-blood"]);
    expect(after?.burdenAbilityChoices?.["dark-blood"]).toEqual(["str", "wis"]);
    expect(after?.houseRules?.allowL1BoonBurden).toBe(true);
    const baseline = computeFinalAbilities({ ...after!, burdens: [], burdenAbilityChoices: {} });
    const withBurden = computeFinalAbilities(after!);
    expect(withBurden.total.str).toBe(baseline.total.str + 1);
    expect(withBurden.total.wis).toBe(baseline.total.wis + 1);

    // Sheet renders two badges for Dark Blood's +1/+1. Re-seed the init
    // script with the post-wizard localStorage state so `gotoSheet`'s full
    // page navigation doesn't revert localStorage to the original seed.
    await reseedCurrent(page, id);
    await gotoSheet(page, id);
    await expect(page.getByText(/^Dark Blood$/)).toBeVisible();
    await expect(page.getByText(/\+1 STR/).first()).toBeVisible();
    await expect(page.getByText(/\+1 WIS/).first()).toBeVisible();
  });

  test("migration backfills burdenAbilityChoices and existing fixed burden contributes its bonus immediately", async ({ page }) => {
    // Seed a pre-1.7-shape raw save that lacks `burdenAbilityChoices` entirely
    // but already has a fixed burden picked. `seedRaw` writes via init script,
    // so it works before any page navigation.
    const { burdenAbilityChoices: _drop, ...seedShape } = {
      ...freshL1Hero,
      id: "test-pre-1.7-with-burden",
      burdens: ["bloodthirst"], // +2 STR
    };
    void _drop;
    const id = await seedRaw(page, seedShape.id, seedShape);

    await gotoSheet(page, id);
    const after = await readMigratedCharacter(page, id);
    expect(after?.burdenAbilityChoices).toEqual({});
    const baseline = computeFinalAbilities({ ...after!, burdens: [], burdenAbilityChoices: {} });
    const withBurden = computeFinalAbilities(after!);
    expect(withBurden.total.str).toBe(baseline.total.str + 2);
  });
});
