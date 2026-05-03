// JSON import/export round-trip — ensures a character exported from the
// sheet can be re-imported on the home page and produce an equivalent
// saved entry.

import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { readCharacter, seedCharacter } from "./helpers/seed";
import { freshL1Hero } from "./helpers/fixtures";
import { gotoHome, gotoSheet } from "./helpers/visit";

test.describe("Import / export", () => {
  test("export → re-import round-trip", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /Export JSON/i }).click();
    const download = await downloadPromise;
    const path = await download.path();
    expect(path).toBeTruthy();
    const json = await fs.readFile(path!, "utf8");
    const parsed = JSON.parse(json);
    expect(parsed.id).toBe(id);
    expect(parsed.identity.name).toBe(freshL1Hero.identity.name);
    // House-rules namespace must round-trip through JSON so a character built
    // under one table's rules reads correctly when imported at another.
    expect(parsed.houseRules).toEqual({ allowL1BoonBurden: false });

    // Now go home and re-import. The hidden file input takes the file
    // directly so we don't need to interact with the OS picker.
    await gotoHome(page);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "exported.json",
      mimeType: "application/json",
      buffer: Buffer.from(json, "utf8"),
    });

    await expect(page.getByText(/Imported/i)).toBeVisible();

    // The re-imported character keeps the same id (importJson preserves
    // existing ids) and has equivalent persisted fields.
    const after = await readCharacter(page, id);
    expect(after?.identity.name).toBe(freshL1Hero.identity.name);
    expect(after?.classId).toBe(freshL1Hero.classId);
    expect(after?.level).toBe(freshL1Hero.level);
    expect(after?.houseRules).toEqual({ allowL1BoonBurden: false });
  });
});
