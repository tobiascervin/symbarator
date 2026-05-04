// Sheet spellbook — collapsible sections surface known spells per level on
// the character sheet, one section per level, all expanded by default.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { mysticAtL1 } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Character sheet spellbook", () => {
  test("renders collapsible sections grouping known spells by level", async ({ page }) => {
    // Seed a Mystic with cantrips and 1st-level spells so the sheet
    // produces both a "Cantrips" section and a "1st" section.
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await expect(page.getByRole("button", { name: /^Cantrips/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^1st/ })).toBeVisible();
    // No 3rd section — the seeded character has no 3rd-level spells.
    await expect(page.getByRole("button", { name: /^3rd/ })).toHaveCount(0);
  });

  test("known spells in every level are visible without a tab click", async ({ page }) => {
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    // All sections start expanded, so Magic Missile (1st level) is visible
    // immediately — no need to click a tab to switch panels.
    await expect(page.getByText(/^Magic Missile$/).first()).toBeVisible();
  });
});
