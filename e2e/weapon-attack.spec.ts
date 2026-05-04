// Weapon attack popover + AC — Tier 1 of the equipment work.
//
// Drives the live sheet (no LocalStorage seed) for representative
// characters and asserts the Combat panel's AC reading and the
// WeaponAttackPopover's resolved math.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import {
  humanWarriorAtL3,
  mysticAtL1,
} from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";
import type { Character } from "@/lib/character/types";

test.describe("Weapons + AC (companion mode)", () => {
  test("Warrior with chain shirt + shield shows AC 16 on the Combat panel", async ({
    page,
  }) => {
    // humanWarriorAtL3: STR 14 (+2), DEX 12 (+1), classEquipmentPicks [0,0,0,0].
    // Line 0 pick 0 = "chain shirt" (medium AC 13 + Dex max 2).
    // Line 1 pick 0 = "a martial weapon and a shield" → resolves to Shield (+2).
    // Total: 13 + min(1,2) + 2 = 16.
    const id = await seedCharacter(page, humanWarriorAtL3);
    await gotoSheet(page, id);

    const acRow = page.locator("dt", { hasText: /^Armor Class$/ }).locator("..");
    await expect(acRow).toContainText("16");
  });

  test("Unarmored Mystic shows AC 13 (10 + Dex with origin bonuses)", async ({ page }) => {
    // mysticAtL1: base DEX 14, +1 fixed DEX (Abducted Human), +1 floating DEX
    // → final DEX 16, mod +3. AC = 10 + 3 = 13. No armor in inventory.
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    const acRow = page.locator("dt", { hasText: /^Armor Class$/ }).locator("..");
    await expect(acRow).toContainText("13");
  });

  test("Mystic with a quarterstaff opens the attack popover with the resolved math", async ({
    page,
  }) => {
    // mysticAtL1: STR 8 (-1), DEX 14 (+2), INT 15, prof bonus +2.
    // classEquipmentPicks [0, 1, 0, 0] resolves line 0 pick 0 = "a quarterstaff".
    // Quarterstaff is a non-finesse melee → uses STR. Attack = +2 prof + (-1) = +1.
    // Damage = 1d8 + (-1) bludgeoning. Versatile two-handed = 1d8 (same dice
    // since the catalog versatile entry isn't on Quarterstaff in the PG).
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    // The Weapons section's tap-target is a button with aria-label "Attack with <name>".
    await page.getByRole("button", { name: /Attack with Quarterstaff/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Quarterstaff")).toBeVisible();
    // Attack row: +1 to hit (STR).
    await expect(dialog.getByText(/\+1 to hit/)).toBeVisible();
    // Damage row: 1d8 -1 bludgeoning (or 1d8 with no mod if displayed bare;
    // implementation prints the signed mod when non-zero).
    await expect(dialog.getByText(/1d8\s*-1\s*bludgeoning/i)).toBeVisible();
  });

  test("Finesse weapon uses the higher of STR/DEX (Mystic with dagger picks Dex)", async ({
    page,
  }) => {
    // Override mysticAtL1 to take the dagger from line 0 (pick 1).
    // STR 8 (-1), final DEX 16 (+3, with origin bonuses). Finesse picks DEX.
    // Attack = +2 prof + 3 = +5. Damage = 1d4 + 3 piercing.
    const draft: Character = {
      ...mysticAtL1,
      id: "test-mystic-dagger",
      classEquipmentPicks: [1, 1, 0, 0],
    };
    const id = await seedCharacter(page, draft);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Attack with Dagger/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Attack uses DEX → +5 (prof 2 + DEX 3). The "(DEX)" label confirms ability.
    await expect(dialog.getByText(/\+5 to hit/)).toBeVisible();
    await expect(dialog.getByText(/\(DEX\)/)).toBeVisible();
    // Damage uses the same DEX mod.
    await expect(dialog.getByText(/1d4\s*\+3\s*piercing/i)).toBeVisible();
  });
});
