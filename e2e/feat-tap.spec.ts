// Feat tap popover — companion-mode integration. Verifies that tapping any
// feat / boon / class feature on the sheet opens a popover with the right
// content (computed badges, resolved effect, usage counter, Use button) and
// that long/short rests restore the right tracked features.

import { test, expect } from "@playwright/test";
import {
  seedCharacter,
  readCharacter,
  readMigratedCharacter,
  reseedCurrent,
  seedRaw,
} from "./helpers/seed";
import { freshL1Hero } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Feat tap popover (companion mode)", () => {
  test("tapping a boon opens the popover with badge + description", async ({ page }) => {
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-boon-tap",
      boons: ["archivist"],
      boonAbilityChoices: {},
    });
    await gotoSheet(page, id);

    // Boon card is now a button. Click it.
    await page.getByRole("button", { name: /Open Archivist/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/^Archivist$/)).toBeVisible();
    await expect(dialog.getByText(/^Boon$/)).toBeVisible();
    // The +1 INT badge appears inside the popover too (mirrored from the card).
    await expect(dialog.getByText(/^\+1 INT$/)).toBeVisible();
    // No usage counter for a boon.
    await expect(dialog.getByRole("button", { name: /^Use$/ })).toHaveCount(0);
  });

  test("tapping Battle Wind shows usage counter and Use button; clicking Use decrements", async ({ page }) => {
    // freshL1Hero is a Warrior at L1 with prof bonus 2 → Battle Wind has 2 uses.
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    // Battle Wind sits in the Features section as a tappable paragraph.
    await page.getByRole("button", { name: /Open Abducted Human: Battle Wind|Open Warrior: Battle Wind/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/^Battle Wind$/)).toBeVisible();
    // Source label: "Warrior L1" (Battle Wind is on the Warrior class L1 features).
    await expect(dialog.getByText(/Warrior L1/i)).toBeVisible();
    // Usage band: 2 of 2 left.
    await expect(dialog.getByText(/^2 of 2 left$/)).toBeVisible();
    // Effect band: 2d4+<conMod>. freshL1Hero CON = 13 → mod +1 → "2d4+1".
    await expect(dialog.getByText(/^2d4\+1 temp HP$/)).toBeVisible();

    // Click Use, expect counter drops.
    await reseedCurrent(page, id);
    await dialog.getByRole("button", { name: /^Use$/ }).click();
    await expect(dialog.getByText(/^1 of 2 left$/)).toBeVisible();

    const stored = await readCharacter(page, id);
    expect(stored?.featureUses?.["warrior:battle-wind"]).toBe(1);
  });

  test("Use button is disabled at 0 uses", async ({ page }) => {
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-bw-empty",
      featureUses: { "warrior:battle-wind": 0 },
    });
    await gotoSheet(page, id);
    await page.getByRole("button", { name: /Battle Wind/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/^0 of 2 left$/)).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^Use$/ })).toBeDisabled();
  });

  test("long rest restores tracked feature uses to max", async ({ page }) => {
    const id = await seedCharacter(page, {
      ...freshL1Hero,
      id: "test-bw-rest",
      featureUses: { "warrior:battle-wind": 0 },
    });
    await gotoSheet(page, id);

    // Click Long Rest from the Rest panel.
    await reseedCurrent(page, id);
    await page.getByTestId("rest-long").click();

    // Re-open the popover and verify Battle Wind is back to 2/2.
    await page.getByRole("button", { name: /Battle Wind/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/^2 of 2 left$/)).toBeVisible();
  });

  test("migration backfills featureUses for pre-1.10 saves", async ({ page }) => {
    // Seed a raw save without `featureUses`.
    const seed: Record<string, unknown> = { ...freshL1Hero, id: "test-pre-1.10" };
    delete seed.featureUses;
    const id = await seedRaw(page, seed.id as string, seed);
    await gotoSheet(page, id);
    const after = await readMigratedCharacter(page, id);
    expect(after?.featureUses).toEqual({});
  });

  test("printable sheet has no tappable feat buttons", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await page.goto(`/characters/${id}/print`);
    // The printable sheet doesn't render Battle Wind as a button, only as text.
    await expect(page.getByRole("button", { name: /Battle Wind/i })).toHaveCount(0);
  });
});
