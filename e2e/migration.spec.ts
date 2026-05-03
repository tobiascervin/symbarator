// Schema migration — pre-leveling-shape saves must keep loading and be
// level-up-able after the migrator runs.

import { test, expect } from "@playwright/test";
import { readCharacter, readMigratedCharacter, seedRaw } from "./helpers/seed";
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

  test("pre-houseRules save with no boons backfills to RAW (false)", async ({ page }) => {
    const id = await seedRaw(page, preLevelingSave.id, preLevelingSave);
    await gotoSheet(page, id);
    // The runtime migrator runs in-memory at load time and isn't written
    // back unless the character is explicitly saved. Read via the same
    // migrator path so the assertion describes load-time behavior.
    const after = await readMigratedCharacter(page, id);
    expect(after?.houseRules).toEqual({ allowL1BoonBurden: false });
  });

  test("pre-houseRules save with a boon backfills to house-rules ON", async ({ page }) => {
    const seeded = {
      ...preLevelingSave,
      id: "test-pre-houserules-with-boon",
      boons: ["archivist"],
      boonAbilityChoices: {},
    };
    const id = await seedRaw(page, seeded.id, seeded);
    await gotoSheet(page, id);
    const after = await readMigratedCharacter(page, id);
    expect(after?.houseRules).toEqual({ allowL1BoonBurden: true });
    expect(after?.boons).toEqual(["archivist"]);
  });
});
