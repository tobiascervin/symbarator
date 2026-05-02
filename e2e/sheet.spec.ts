// Sheet spellbook — tabs surface known spells per level on the character sheet.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { mysticAtL1 } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Character sheet spellbook", () => {
  test("renders tabs grouping known spells by level", async ({ page }) => {
    // Seed a Mystic with cantrips and 1st-level spells so the sheet
    // produces both a "Cantrips" tab and a "1st" tab.
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await expect(page.getByRole("tab", { name: /^Cantrips\s/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /^1st\s/ })).toBeVisible();
    // No 3rd tab — the seeded character has no 3rd-level spells.
    await expect(page.getByRole("tab", { name: /^3rd\s/ })).toHaveCount(0);
  });

  test("clicking a tab swaps the visible spell list", async ({ page }) => {
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    // Cantrips tab is the default; switch to "1st".
    await page.getByRole("tab", { name: /^1st\s/ }).click();
    // Magic Missile is in the seeded mystic's spellsKnown.
    await expect(page.getByText(/^Magic Missile$/).first()).toBeVisible();
  });
});
