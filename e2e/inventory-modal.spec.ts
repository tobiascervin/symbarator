// Inventory management modal — Tier 2 of the equipment work.
//
// Adds, removes, and round-trips inventory overrides through the rucksack
// modal in companion mode.

import { test, expect } from "@playwright/test";
import { seedCharacter, readCharacter, reseedCurrent } from "./helpers/seed";
import { humanWarriorAtL3, mysticAtL1 } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Inventory management modal", () => {
  test("rucksack icon opens the inventory modal", async ({ page }) => {
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    // The Equipment parchment's heading has a rucksack icon.
    await page.getByRole("button", { name: /Manage inventory/i }).first().click();

    // Modal opens (Dialog).
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/Manage Inventory/)).toBeVisible();
  });

  test("adding a longsword from the catalog surfaces it under Combat → Weapons", async ({
    page,
  }) => {
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Manage inventory/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Search for "long" and add the Longsword catalog entry.
    await dialog.getByPlaceholder(/Search weapons/).fill("long");
    await reseedCurrent(page, id);
    await dialog.getByRole("button", { name: /Add Longsword/i }).click();

    // Close the modal.
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // The Combat → Weapons subsection now contains a Longsword tap target.
    await expect(page.getByRole("button", { name: /Attack with Longsword/i })).toBeVisible();

    // The override is persisted.
    const after = await readCharacter(page, id);
    expect(after?.inventoryOverrides.added).toContain("Longsword");
  });

  test("removing the chain shirt from a Warrior drops AC", async ({ page }) => {
    const id = await seedCharacter(page, humanWarriorAtL3);
    await gotoSheet(page, id);

    // Baseline AC: chain shirt 13 + Dex (capped 1) + shield 2 = 16.
    const acRow = page.locator("dt", { hasText: /^Armor Class$/ }).locator("..");
    await expect(acRow).toContainText("16");

    await page.getByRole("button", { name: /Manage inventory/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Remove the chain shirt from the Current Inventory list.
    await reseedCurrent(page, id);
    await dialog.getByRole("button", { name: /Remove Chain Shirt/i }).click();

    // Close the modal.
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // Without the chain shirt: AC = 10 + Dex (1) + shield (2) = 13.
    await expect(acRow).toContainText("13");

    const after = await readCharacter(page, id);
    // The catalog name "Chain Shirt" is what the modal stores when removing.
    // Resolver matches it case-insensitively against the lowercase token.
    expect(after?.inventoryOverrides.removed).toContain("Chain Shirt");
  });

  test("adding free-text gear surfaces it in the Equipment section", async ({ page }) => {
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Manage inventory/i }).first().click();
    const dialog = page.getByRole("dialog");

    // Switch to the Gear tab and add a custom item.
    await dialog.getByRole("tab", { name: /Gear/i }).click();
    await dialog.getByPlaceholder(/Add custom item/).fill("Bag of Holding");
    await reseedCurrent(page, id);
    await dialog.getByRole("button", { name: /^Add$/ }).click();

    // Close the modal.
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // Equipment parchment's Gear list contains the new entry.
    await expect(page.getByText(/Bag of Holding/)).toBeVisible();

    const after = await readCharacter(page, id);
    expect(after?.inventoryOverrides.added).toContain("Bag of Holding");
  });

  test("adding 'Concealed Armor' surfaces it under Combat → Armor (catalog names ending in 'Armor' regression)", async ({
    page,
  }) => {
    // Regression: catalog entries whose name ends with " Armor" (Concealed
    // Armor, Crow Armor, Laminated Armor, Field Armor, Leather armor)
    // previously fell through to the Gear list because the resolver
    // unconditionally stripped trailing " armor". The fix tries the
    // un-stripped form first.
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Manage inventory/i }).first().click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("tab", { name: /^Armor$/i }).click();
    await dialog.getByPlaceholder(/Search armor/).fill("concealed");
    await reseedCurrent(page, id);
    await dialog.getByRole("button", { name: /Add Concealed Armor/i }).click();

    // Modal's Current Inventory list shows it tagged "Armor", not "Gear".
    const inventoryRow = dialog
      .locator("div")
      .filter({ hasText: /^Concealed Armor/ })
      .filter({ hasText: /Armor/i })
      .first();
    await expect(inventoryRow).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // Concealed Armor is light AC 11 + Dex. The Combat parchment's Armor
    // subsection shows the formula text; the Equipment Gear list does not.
    await expect(page.getByText(/AC 11 \+ Dex/)).toBeVisible();
    const gearListItems = page.locator("ul.list-disc li", { hasText: /Concealed Armor/i });
    await expect(gearListItems).toHaveCount(0);
  });

  test("adding armor surfaces it under Combat → Armor (not Gear)", async ({ page }) => {
    // Mystic starts unarmored. Adding "Studded Leather" via the Armor tab
    // should land in the Combat parchment's Armor subsection — not in the
    // Equipment parchment's Gear list.
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Manage inventory/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Switch to the Armor tab and add Studded Leather.
    await dialog.getByRole("tab", { name: /^Armor$/i }).click();
    await dialog.getByPlaceholder(/Search armor/).fill("studded");
    await reseedCurrent(page, id);
    await dialog.getByRole("button", { name: /Add Studded Leather/i }).click();

    // The modal's Current Inventory list shows it tagged "Armor", not "Gear".
    // (The list is filtered by the resolver's `armor` vs `other` arrays.)
    const inventoryRow = dialog
      .locator("div")
      .filter({ hasText: /^Studded Leather/ })
      .filter({ hasText: /Armor/i })
      .first();
    await expect(inventoryRow).toBeVisible();

    // Close the modal.
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();

    // The Combat parchment's Armor subsection lists Studded Leather with
    // its AC formula. The Equipment parchment's Gear list does NOT.
    await expect(page.getByText(/Studded Leather/).first()).toBeVisible();
    // Specifically, the Studded Leather entry should appear adjacent to its
    // AC formula text.
    await expect(page.getByText(/AC 12 \+ Dex/)).toBeVisible();

    // Sanity: Equipment's Gear ul does NOT list Studded Leather. The
    // Equipment section's gear list is a `<ul>` — assert the armor name
    // doesn't appear inside any `<li>` directly under it.
    const gearListItems = page.locator("ul.list-disc li", { hasText: /Studded Leather/i });
    await expect(gearListItems).toHaveCount(0);
  });

  test("migrator backfills inventoryOverrides on pre-1.15 saves", async ({ page }) => {
    // Hand-build a save without the new field; the migrator runs on load
    // and backfills empty deltas.
    const id = "test-pre-1.15-character";
    type RawSave = Omit<typeof mysticAtL1, "inventoryOverrides">;
    const raw: RawSave = { ...mysticAtL1, id };
    // Strip the field via JSON round-trip without the key.
    const saved = JSON.parse(
      JSON.stringify(raw, (key, value) =>
        key === "inventoryOverrides" ? undefined : value,
      ),
    );

    await page.addInitScript(
      ({ id, key, indexKey, payload }) => {
        window.localStorage.setItem(key, payload);
        const rawIndex = window.localStorage.getItem(indexKey);
        const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
        if (!index.includes(id)) {
          index.push(id);
          window.localStorage.setItem(indexKey, JSON.stringify(index));
        }
      },
      {
        id,
        key: `symbaroum:character:${id}`,
        indexKey: "symbaroum:characters:index",
        payload: JSON.stringify(saved),
      },
    );

    await gotoSheet(page, id);
    // Sheet renders without errors — the migrator backfilled the field.
    await expect(page.locator("dt", { hasText: /^Armor Class$/ })).toBeVisible();
  });
});
