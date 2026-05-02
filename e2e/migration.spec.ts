// Schema migration — pre-leveling-shape saves must keep loading and be
// level-up-able after the migrator runs.

import { test, expect } from "@playwright/test";
import { readCharacter, seedRaw } from "./helpers/seed";
// `readCharacter` used by the second test below.
import { preLevelingSave } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Storage migration", () => {
  test("pre-leveling save loads and renders", async ({ page }) => {
    const id = await seedRaw(page, preLevelingSave.id, preLevelingSave);

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await gotoSheet(page, id);
    // Sheet renders without console errors. The migrator runs in-memory at
    // load time; we assert it didn't throw and the name rendered.
    await expect(page.getByText(/Pre-leveling Hero/i)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("pre-leveling save can level up", async ({ page }) => {
    const id = await seedRaw(page, preLevelingSave.id, preLevelingSave);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    const after = await readCharacter(page, id);
    expect(after?.level).toBe(2);
    expect(after?.feats).toEqual([]);
    expect((after?.maxHp ?? 0)).toBeGreaterThan(0);
  });
});
