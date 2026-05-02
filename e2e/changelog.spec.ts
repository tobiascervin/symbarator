// Versioning surface — the home footer shows a `vX.Y.Z` link to /changelog,
// and the changelog page renders the Keep-a-Changelog content.

import { test, expect } from "@playwright/test";
import pkg from "../package.json";

test.describe("Versioning + changelog", () => {
  test("home footer shows version badge linking to /changelog", async ({ page }) => {
    await page.goto("/");
    const badge = page.getByRole("link", { name: new RegExp(`^v${pkg.version}$`) });
    await expect(badge).toBeVisible();
    await badge.click();
    await expect(page).toHaveURL(/\/changelog/);
  });

  test("/changelog renders the changelog content", async ({ page }) => {
    await page.goto("/changelog");
    await expect(page.getByRole("heading", { name: /Changelog/i })).toBeVisible();
    // Keep a Changelog entry — the v1.0.0 release link is rendered as part of the dated h2.
    await expect(page.getByRole("link", { name: "1.0.0", exact: true })).toBeVisible();
    await expect(page.locator("h2").filter({ hasText: "2026-05-02" })).toBeVisible();
    // No 404.
    expect(await page.title()).toMatch(/Changelog/i);
  });
});
