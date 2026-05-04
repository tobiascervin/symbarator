// Origin ASI propagation — exercises the wizard's origin → abilities flow
// for representative origins so a regression in `origin.asi.fixed`/floating
// plumbing or in `originAsiAllocation` propagation can't slip past CI.
//
// Drives the live builder (no LocalStorage seed) so a real player's path
// stays covered.

import { test, expect, type Locator, type Page } from "@playwright/test";

// Floating "+" buttons are rendered in DOM order following ABILITY_ORDER
// (str, dex, con, int, wis, cha). Index by ability so the test reads.
const ABILITY_INDEX: Record<"str" | "dex" | "con" | "int" | "wis" | "cha", number> = {
  str: 0,
  dex: 1,
  con: 2,
  int: 3,
  wis: 4,
  cha: 5,
};

/** Returns the cell inside the abilities step's "Final Ability Scores" card for one ability. */
function finalCell(page: Page, label: string): Locator {
  const card = page.locator('[data-slot="card"]').filter({ hasText: "Final Ability Scores" });
  return card.locator("div.rounded-md.border").filter({
    has: page.locator("div", { hasText: new RegExp(`^${label}$`) }),
  });
}

/**
 * Locates an origin card by its CardTitle text. The card is `role="button"`
 * but its accessible name includes flavor + ASI summary, so a CardTitle-scoped
 * locator is the only way to disambiguate (e.g. "Human" vs "Abducted Human").
 */
function originCard(page: Page, name: string): Locator {
  return page.locator('[data-slot="card"][role="button"]').filter({
    has: page.locator('[data-slot="card-title"]', {
      hasText: new RegExp(`^${name}$`),
    }),
  });
}

/**
 * Loads Standard Array values into draft.abilities. Default `abilityMethod`
 * is "standard-array" but `setMethod`'s side-effect (assigning the array
 * permutation) only fires on tab change. Manual → Standard Array round-trip
 * triggers it.
 */
async function applyStandardArray(page: Page): Promise<void> {
  await page.getByRole("tab", { name: /Manual/i }).click();
  await page.getByRole("tab", { name: /Standard Array/i }).click();
}

test.describe("Origin ASI propagation", () => {
  test("Abducted Human fixed + floating bonuses surface on the abilities step", async ({
    page,
  }) => {
    // Abducted Human: fixed { dex: 1, wis: 1 } + 1×+2 floating ("any-other").
    await page.goto("/");
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();

    await expect(page).toHaveURL(/\/builder\/origin/);
    await originCard(page, "Abducted Human").click();

    // Allocate the +2 floating to STR (DEX/WIS are fixed, so STR's "+" is the
    // first enabled one in DOM order — same pattern as builder.spec.ts).
    await page.getByText(/Allocate floating ability bonuses/i).waitFor();
    const plusButtons = page.getByRole("button", { name: "+", exact: true });
    await plusButtons.nth(ABILITY_INDEX.str).click();
    await plusButtons.nth(ABILITY_INDEX.str).click();
    await expect(page.getByText(/Remaining:\s*0/i)).toBeVisible();

    await page.getByRole("button", { name: /^Continue/ }).click();
    await expect(page).toHaveURL(/\/builder\/background/);

    // ---- Skip background, class, approach to land on /builder/abilities ----
    // The shortest path: pick Runaway, accept defaults, Continue through.
    await page.getByRole("button", { name: /Runaway/ }).first().click();
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: /^Continue/ }).click();

    await expect(page).toHaveURL(/\/builder\/class/);
    await page.getByRole("button", { name: /Captain/ }).first().click();
    await page.locator("label").filter({ hasText: /^Defense\b/ }).first().click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    await expect(page).toHaveURL(/\/builder\/approach/);
    await page.getByRole("button", { name: /Officer/ }).first().click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    // ---- Abilities step (Standard Array default) ----
    await expect(page).toHaveURL(/\/builder\/abilities/);
    await applyStandardArray(page);
    // Standard Array bases: str:8, dex:10, con:12, int:13, wis:14, cha:15.

    // STR: base 8, fixed=0, floating=+2 → bonus +2, total 10.
    await expect(finalCell(page, "Strength")).toContainText("10");
    await expect(finalCell(page, "Strength")).toContainText("base 8 +2");

    // DEX: base 10, fixed=+1, floating=0 → bonus +1, total 11.
    await expect(finalCell(page, "Dexterity")).toContainText("11");
    await expect(finalCell(page, "Dexterity")).toContainText("base 10 +1");

    // WIS: base 14, fixed=+1, floating=0 → bonus +1, total 15.
    await expect(finalCell(page, "Wisdom")).toContainText("15");
    await expect(finalCell(page, "Wisdom")).toContainText("base 14 +1");

    // CON / INT / CHA: no bonus addend on the base line. Each cell still
    // renders the trailing "+N" modifier on its own line — the "base X +Y"
    // pattern is what marks a bonus, and that's what these abilities lack.
    await expect(finalCell(page, "Constitution")).not.toContainText(/base \d+ \+/);
    await expect(finalCell(page, "Intelligence")).not.toContainText(/base \d+ \+/);
    await expect(finalCell(page, "Charisma")).not.toContainText(/base \d+ \+/);
  });

  test("Human sub-choice ASI updates the abilities-step display when toggled", async ({
    page,
  }) => {
    // Human: fixed { str: 2 } + 1×+1 floating + sub-choice (Ambrian +1 INT or Barbarian +1 WIS).
    await page.goto("/");
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();

    await expect(page).toHaveURL(/\/builder\/origin/);
    await originCard(page, "Human").click();

    // Pick the Ambrian sub-choice (+1 INT).
    await page.getByRole("button", { name: /^Ambrian/ }).click();

    // Allocate the +1 floating to CHA (DEX, CON, INT, WIS, CHA eligible — STR is fixed).
    await page.getByText(/Allocate floating ability bonuses/i).waitFor();
    const plusButtons = page.getByRole("button", { name: "+", exact: true });
    await plusButtons.nth(ABILITY_INDEX.cha).click();
    await expect(page.getByText(/Remaining:\s*0/i)).toBeVisible();

    // Walk through Background → Class → Approach to reach abilities. Human
    // doesn't get Runaway as a background (that's Abducted Human only) — use
    // Common Folk, the first Human background, with one tool pick.
    await page.getByRole("button", { name: /^Continue/ }).click();
    await page.getByRole("button", { name: /Common Folk/ }).first().click();
    await page.getByRole("checkbox").first().check();
    await page.getByRole("checkbox").last().check();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await page.getByRole("button", { name: /Captain/ }).first().click();
    await page.locator("label").filter({ hasText: /^Defense\b/ }).first().click();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await page.getByRole("button", { name: /Officer/ }).first().click();
    await page.getByRole("button", { name: /^Continue/ }).click();

    await expect(page).toHaveURL(/\/builder\/abilities/);
    await applyStandardArray(page);

    // STR: base 8, fixed=+2 → bonus +2, total 10.
    await expect(finalCell(page, "Strength")).toContainText("base 8 +2");

    // INT: base 13, sub-choice +1 → bonus +1, total 14.
    await expect(finalCell(page, "Intelligence")).toContainText("base 13 +1");

    // CHA: base 15, floating +1 → bonus +1, total 16.
    await expect(finalCell(page, "Charisma")).toContainText("base 15 +1");

    // ---- Switch sub-choice: navigate back to /builder/origin and pick Barbarian. ----
    // Use a direct goto rather than the wizard's Back button so the test
    // doesn't race client-side routing through four steps.
    const id = new URL(page.url()).searchParams.get("id");
    await page.goto(`/builder/origin?id=${id}`);
    await expect(page).toHaveURL(/\/builder\/origin/);

    // Pick Barbarian sub-choice.
    await page.getByRole("button", { name: /^Barbarian/ }).click();
    // Click Continue so the wizard's WizardShell persists the new sub-choice
    // to localStorage; the in-memory `update` doesn't write through until
    // Continue lands.
    await page.getByRole("button", { name: /^Continue/ }).click();
    await page.goto(`/builder/abilities?id=${id}`);
    await expect(page).toHaveURL(/\/builder\/abilities/);
    await applyStandardArray(page);

    // INT: bonus is gone (sub-choice no longer adds +1 INT).
    await expect(finalCell(page, "Intelligence")).not.toContainText("base 13 +");

    // WIS: base 14, sub-choice +1 → bonus +1, total 15.
    await expect(finalCell(page, "Wisdom")).toContainText("base 14 +1");
  });

  test("Human floating allocator restricts to DEX/CON/CHA and folds the +2 STR fixed bonus into the cell value", async ({
    page,
  }) => {
    // PG p. 71: "Your Strength score increases by 2. Increase Dexterity,
    // Constitution or Charisma by 1." — INT and WIS are NOT eligible for
    // the floating allocation. The allocator's STR cell value reflects the
    // origin's fixed +2 directly (no separate badge — the +2 IS the value).
    await page.goto("/");
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();

    await expect(page).toHaveURL(/\/builder\/origin/);
    await originCard(page, "Human").click();
    await page.getByText(/Allocate floating ability bonuses/i).waitFor();

    // The allocator's "+" buttons (six total, ABILITY_ORDER) are
    // enabled only on DEX, CON, and CHA. STR is fixed; INT and WIS are
    // outside Human's `from` list.
    const plus = page.getByRole("button", { name: "+", exact: true });
    await expect(plus.nth(ABILITY_INDEX.str)).toBeDisabled();
    await expect(plus.nth(ABILITY_INDEX.dex)).toBeEnabled();
    await expect(plus.nth(ABILITY_INDEX.con)).toBeEnabled();
    await expect(plus.nth(ABILITY_INDEX.int)).toBeDisabled();
    await expect(plus.nth(ABILITY_INDEX.wis)).toBeDisabled();
    await expect(plus.nth(ABILITY_INDEX.cha)).toBeEnabled();

    // The STR allocator cell shows `+2` directly (origin's fixed bonus,
    // folded into the cell value).
    const strCell = page
      .locator("div.rounded-md.border")
      .filter({ has: page.locator("div", { hasText: /^Strength$/ }) })
      .first();
    await expect(strCell).toContainText("+2");
  });

  test("Floating-allocation gate blocks advance until fully allocated", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Forge a New Hero/i }).click();

    await expect(page).toHaveURL(/\/builder\/origin/);
    await originCard(page, "Abducted Human").click();

    // Don't allocate. Click Continue.
    await page.getByRole("button", { name: /^Continue/ }).click();

    // The validator's origin error reads "Allocate exactly 2 bonus points
    // from your origin." (target = count × size = 1 × 2 = 2). The wizard
    // shell toasts this — and crucially the URL must NOT advance.
    await expect(page).toHaveURL(/\/builder\/origin/);
    await expect(page.getByText(/Allocate exactly 2 bonus points/i)).toBeVisible();

    // Allocate the +2 to STR. Continue advances to /builder/background.
    await page.getByText(/Allocate floating ability bonuses/i).waitFor();
    const plusButtons = page.getByRole("button", { name: "+", exact: true });
    await plusButtons.nth(ABILITY_INDEX.str).click();
    await plusButtons.nth(ABILITY_INDEX.str).click();
    await page.getByRole("button", { name: /^Continue/ }).click();
    await expect(page).toHaveURL(/\/builder\/background/);
  });
});
