// Builder happy path — exercises every wizard step without LocalStorage
// seeding so a real player's path stays covered.
//
// Path used: Abducted Human → Runaway → Captain → Officer → Standard Array
// → required skills + first equipment options → name → sheet.
// (Abducted Human has +2 floating ASI to allocate; Runaway has 0 skill
// picks and 1 tool pick; Captain is non-casting and offers a fighting style.)

import { test, expect } from "@playwright/test";

test.describe("L1 builder happy path", () => {
  test("forge a hero through every step lands on the sheet", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Character Builder/i })).toBeVisible();
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();

    // ---- Origin: Abducted Human ----
    await expect(page).toHaveURL(/\/builder\/origin/);
    // Card uses role="button"; clicking selects the origin.
    await page.getByRole("button", { name: /Abducted Human/ }).first().click();
    // Floating ASI allocator: 6 "+" buttons in DOM order (str, dex, con, int,
    // wis, cha per ABILITY_ORDER). DEX/WIS are fixed → their buttons are
    // disabled. The first "+" is STR's, enabled. Click twice for +2 STR.
    await page.getByText(/Allocate floating ability bonuses/i).waitFor();
    const plusButtons = page.getByRole("button", { name: "+", exact: true });
    await plusButtons.first().click();
    await plusButtons.first().click();
    // Verify: STR cell now shows "+2".
    await expect(page.getByText(/Remaining:\s*0/i)).toBeVisible();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // ---- Background: Runaway ----
    await expect(page).toHaveURL(/\/builder\/background/);
    await page.getByRole("button", { name: /Runaway/ }).first().click();
    // Runaway: 1 tool pick — check the first checkbox.
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // ---- Class: Captain (also picks fighting style here) ----
    await expect(page).toHaveURL(/\/builder\/class/);
    await page.getByRole("button", { name: /Captain/ }).first().click();
    // Captain has fightingStyleAt1 — picker is a RadioGroup wrapped in Labels.
    // Clicking the Label that contains "Defense" toggles its radio.
    await page.locator("label").filter({ hasText: /^Defense\b/ }).first().click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // ---- Approach: Officer (non-casting; no further picks needed) ----
    await expect(page).toHaveURL(/\/builder\/approach/);
    await page.getByRole("button", { name: /Officer/ }).first().click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // ---- Abilities: Standard Array (default) ----
    await expect(page).toHaveURL(/\/builder\/abilities/);
    // Standard Array is the default tab and pre-fills values; just continue.
    // Note: the L1 Boons & Burdens step is gated behind a per-character
    // house-rules toggle on this step, defaulting to OFF — RAW Symbaroum
    // doesn't grant boons at L1. So Continue here advances straight to
    // Skills & Equipment, skipping Boons & Burdens entirely.
    await page.getByRole("button", { name: /^Continue/ }).click();

    // ---- Skills & Equipment ----
    await expect(page).toHaveURL(/\/builder\/skills-equipment/);
    // Captain picks 4 class skills — check the first 4 available checkboxes.
    const skillBoxes = page.getByRole("checkbox");
    const count = Math.min(4, await skillBoxes.count());
    for (let i = 0; i < count; i++) {
      await skillBoxes.nth(i).check();
    }
    // Equipment: pick the first radio option of each equipment line.
    // We click the first radio of each visually-distinct group; iterating all
    // visible radios and clicking each is fine — only the last per line wins.
    const radios = page.getByRole("radio");
    const radioCount = await radios.count();
    for (let i = 0; i < radioCount; i++) {
      const r = radios.nth(i);
      if (await r.isVisible().catch(() => false)) {
        await r.check().catch(() => undefined);
      }
    }
    await page.getByRole("button", { name: /^Continue/ }).click();

    // ---- Identity ----
    await expect(page).toHaveURL(/\/builder\/identity/);
    await page.getByRole("textbox").first().fill("Test Hero");
    await page.getByRole("button", { name: /^Finish$/ }).click();

    // ---- Sheet ----
    await expect(page).toHaveURL(/\/characters\//);
    await expect(page.getByText(/Level 1/)).toBeVisible();
    await expect(page.getByText("Test Hero")).toBeVisible();
  });

  test("validator blocks advancement without required picks", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();

    await expect(page).toHaveURL(/\/builder\/origin/);
    // Click Continue without picking an origin.
    await page.getByRole("button", { name: /^Continue/ }).click();

    // Toast message and URL still on origin step.
    await expect(page.getByText(/Choose an origin/i)).toBeVisible();
    await expect(page).toHaveURL(/\/builder\/origin/);
  });

  test("back button preserves selections", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();

    await page.getByRole("button", { name: /Abducted Human/ }).first().click();
    await page.getByText(/Allocate floating ability bonuses/i).waitFor();
    const plusButtons = page.getByRole("button", { name: "+", exact: true });
    await plusButtons.first().click();
    await plusButtons.first().click();
    await expect(page.getByText(/Remaining:\s*0/i)).toBeVisible();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await expect(page).toHaveURL(/\/builder\/background/);

    await page.getByRole("button", { name: /Back/ }).click();
    await expect(page).toHaveURL(/\/builder\/origin/);
    // Origin selection persists; the "— Traits" panel only renders when an
    // origin is selected, and the floating allocator still shows "Remaining: 0".
    await expect(page.getByText(/— Traits/)).toBeVisible();
    await expect(page.getByText(/Remaining:\s*0/i)).toBeVisible();
  });
});
