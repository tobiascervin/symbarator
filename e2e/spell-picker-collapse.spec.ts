// Spell-picker collapse interaction — every level renders as its own
// collapsible section, expanded by default. Click the header to toggle just
// that section, and a "selected" badge tracks per-level picks in picker mode.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { templarAtL1WithBless } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Spell picker collapsible sections", () => {
  // Seed a Templar at L5 (matches the "shows higher-level spells when slots
  // unlock" fixture in level-up.spec.ts) so the L5→L6 dialog opens with
  // both 1st- and 2nd-level spells in the new-spells pool.
  const seedTemplarL5 = (id: string) => ({
    ...templarAtL1WithBless,
    id,
    level: 5 as const,
    maxHp: 40,
    spellPicks: {
      cantrips: ["sacred-flame", "guidance", "light"],
      spellsKnown: ["bless", "command", "shield-of-faith"],
    },
  });

  test("sections start expanded; clicking a header toggles only that section", async ({ page }) => {
    const id = await seedCharacter(page, seedTemplarL5("test-templar-l5-collapse-1"));
    await gotoSheet(page, id);
    await page.getByRole("button", { name: /Level Up/i }).click();

    const firstHeader = page.getByRole("button", { name: /^1st/ });
    const secondHeader = page.getByRole("button", { name: /^2nd/ });

    await expect(firstHeader).toBeVisible();
    await expect(secondHeader).toBeVisible();
    await expect(firstHeader).toHaveAttribute("aria-expanded", "true");
    await expect(secondHeader).toHaveAttribute("aria-expanded", "true");

    // Collapse "1st" — sibling stays open and a 2nd-level spell card stays visible.
    await firstHeader.click();
    await expect(firstHeader).toHaveAttribute("aria-expanded", "false");
    await expect(secondHeader).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Aid", { exact: true }).first()).toBeVisible();

    // Re-expand "1st" — Cure Wounds (a 1st-level Theurg spell not yet known) is back.
    await firstHeader.click();
    await expect(firstHeader).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/^Cure Wounds$/).first()).toBeVisible();
  });

  test("selected-count badge appears on header in picker mode and survives collapsing", async ({ page }) => {
    const id = await seedCharacter(page, seedTemplarL5("test-templar-l5-collapse-2"));
    await gotoSheet(page, id);
    await page.getByRole("button", { name: /Level Up/i }).click();

    const firstHeader = page.getByRole("button", { name: /^1st/ });
    // Before any pick the trigger has only the total-count badge.
    await expect(firstHeader.locator('[data-slot="badge"]')).toHaveCount(1);

    // Pick a 1st-level spell.
    await page.getByRole("checkbox", { name: /Cure Wounds/ }).click();

    // Selected-count badge "1" now appears alongside the total-count badge.
    const badges = firstHeader.locator('[data-slot="badge"]');
    await expect(badges).toHaveCount(2);
    await expect(badges.last()).toHaveText("1");

    // Collapse the section — the selected badge stays rendered on the header.
    await firstHeader.click();
    await expect(firstHeader).toHaveAttribute("aria-expanded", "false");
    await expect(firstHeader.locator('[data-slot="badge"]')).toHaveCount(2);
    await expect(firstHeader.locator('[data-slot="badge"]').last()).toHaveText("1");
  });
});
