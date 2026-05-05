// Mobile-viewport regression tests. We don't spin up a parallel Playwright
// project; instead each test in this file overrides the viewport in
// `beforeEach` so headless Chromium renders at 360×800 — the lowest
// reasonable Android phone width.
//
// The bar is "every existing flow works correctly on a phone": no
// horizontal scroll on any primary surface, sheet panels reorder with
// live combat first, and modals open as bottom-anchored sheets that
// don't push the page horizontally.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { freshL1Hero } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

const PHONE = { width: 360, height: 800 };
const DESKTOP = { width: 1280, height: 800 };

test.describe("mobile viewport", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(PHONE);
  });

  test("home page loads with no horizontal scroll", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const noOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(noOverflow).toBe(true);
  });

  test("wizard step 1 (Origin) renders one column at phone width", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();
    await expect(page).toHaveURL(/\/builder\/origin/);

    // The wizard's bottom Continue button stretches full width on phone
    // (w-full sm:w-auto). Locate it by accessible name and assert width.
    const continueBtn = page.getByRole("button", { name: /^Continue/ });
    const box = await continueBtn.boundingBox();
    expect(box, "continue button rendered").not.toBeNull();
    // Full width minus the wizard padding — at 360px the button should be
    // at least ~280px wide. (px-4 + a bit of inner padding shaves the rest.)
    expect(box!.width).toBeGreaterThan(260);

    // No horizontal scroll either.
    const noOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(noOverflow).toBe(true);
  });

  test("character sheet shows live HP panel above static Abilities at phone width", async ({
    page,
  }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    const hpTop = await page
      .getByTestId("hp-readout")
      .boundingBox()
      .then((b) => b?.y ?? 0);
    const abilitiesHeader = page
      .getByRole("heading", { name: /Abilities/i, level: 2 })
      .first();
    const abilitiesTop = await abilitiesHeader.boundingBox().then((b) => b?.y ?? 0);

    expect(hpTop).toBeLessThan(abilitiesTop);

    // No horizontal scroll on the sheet either.
    const noOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(noOverflow).toBe(true);
  });

  test("character sheet activates the two-column grid on desktop", async ({
    page,
  }) => {
    // Override viewport for this single test — desktop check.
    await page.setViewportSize(DESKTOP);
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    // At desktop, the layout is a two-column grid: static reference
    // content (HP, DeathSaves, Abilities, Skills, Features) in the LEFT
    // col (md:col-span-2), live combat panels (Combat, Corruption, Rest,
    // Saves) in the RIGHT col. Both columns start at the same Y, so HP
    // (top of left col) and Combat (top of right col) align horizontally.
    const hpTop = await page
      .getByTestId("hp-readout")
      .boundingBox()
      .then((b) => b?.y ?? 0);
    const combatTop = await page
      .getByRole("heading", { name: /^Combat$/i, level: 2 })
      .boundingBox()
      .then((b) => b?.y ?? 0);
    // Within a SectionHeader's-worth of vertical offset (the heading
    // sits a few px below the panel's outer top edge).
    expect(Math.abs(hpTop - combatTop)).toBeLessThan(80);

    // Combat sits to the right of HP in the grid (RIGHT column).
    const hpX = await page
      .getByTestId("hp-readout")
      .boundingBox()
      .then((b) => b?.x ?? 0);
    const combatX = await page
      .getByRole("heading", { name: /^Combat$/i, level: 2 })
      .boundingBox()
      .then((b) => b?.x ?? 0);
    expect(combatX).toBeGreaterThan(hpX + 200);
  });

  test("level-up dialog opens as a bottom-anchored sheet on phone", async ({
    page,
  }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Wait for the slide-in-from-bottom animation to settle. The dialog
    // primitive uses `data-open:slide-in-from-bottom` (tw-animate-css) and
    // `boundingBox` reads its mid-animation position otherwise.
    await page.waitForTimeout(400);

    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    // Bottom anchored: dialog's bottom edge equals the viewport bottom
    // within a few pixels (rounding + safe-area).
    expect(Math.abs(PHONE.height - (box!.y + box!.height))).toBeLessThan(8);
    // Full width: dialog's left starts at 0 and width covers the viewport.
    expect(box!.x).toBeLessThan(2);
    expect(box!.width).toBeGreaterThan(PHONE.width - 4);

    // No horizontal page scroll.
    const noOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= window.innerWidth,
    );
    expect(noOverflow).toBe(true);
  });
});
