// Level-up flow — seeded characters skip the wizard so each test exercises
// only the dialog. Covers HP modes, ASI/feat/Change Self variants, the
// spell-pick dedupe regression, and the L20 disable.

import { test, expect } from "@playwright/test";
import { seedCharacter, readCharacter, reseedCurrent } from "./helpers/seed";
import {
  changelingAtL3,
  freshL1Hero,
  humanWarriorAtL3,
  mysticAtL1,
  templarAtL1WithBless,
  warriorAtL19,
  warriorAtL20,
} from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Level-up dialog", () => {
  test("level up with average HP", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    const before = await readCharacter(page, id);
    expect(before?.level).toBe(1);
    const startingHp = before?.maxHp ?? 0;

    await page.getByRole("button", { name: /Level Up/i }).click();
    // Default HP mode is "average" — confirm immediately.
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    await expect(page.getByText(/Level 2/)).toBeVisible();
    const after = await readCharacter(page, id);
    expect(after?.level).toBe(2);
    expect((after?.maxHp ?? 0)).toBeGreaterThan(startingHp);
  });

  test("level up with manual HP roll", async ({ page }) => {
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);
    const before = await readCharacter(page, id);
    const startingHp = before?.maxHp ?? 0;

    await page.getByRole("button", { name: /Level Up/i }).click();
    // Switch HP mode to manual and enter a value.
    await page.getByRole("radio", { name: /Roll/i }).check();
    await page.getByRole("spinbutton").fill("7");
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    const after = await readCharacter(page, id);
    expect(after?.maxHp).toBe(startingHp + 7);
  });

  test("ASI pick at L4 mutates abilities, not feats", async ({ page }) => {
    const id = await seedCharacter(page, { ...humanWarriorAtL3, level: 3 });
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    // ASI is the default mode; the allocator's "+" buttons follow ABILITY_ORDER,
    // so the first one is for STR. Scope to the dialog content.
    const dialog = page.locator('[data-slot="dialog-content"]');
    const plusButtons = dialog.getByRole("button", { name: "+" });
    await plusButtons.first().click();
    await plusButtons.first().click();
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    const after = await readCharacter(page, id);
    expect(after?.abilities.str).toBe(humanWarriorAtL3.abilities.str + 2);
    expect(after?.feats).toEqual([]);
  });

  test("feat pick at L4 appends to feats", async ({ page }) => {
    const id = await seedCharacter(page, { ...humanWarriorAtL3, level: 3 });
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();
    // Pick the first boon by name from the Boons card grid.
    await page
      .locator('[data-feat-section="boons"] [role="button"]')
      .first()
      .click();
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    const after = await readCharacter(page, id);
    expect(after?.feats?.length).toBe(1);
  });

  test("Changeling sees Change Self in the Origin Feats section", async ({ page }) => {
    const id = await seedCharacter(page, changelingAtL3);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();
    // Change Self is now an Origin Feats card, not a third radio.
    await expect(page.getByRole("radio", { name: /Change Self/i })).toHaveCount(0);
    const card = page.locator(
      '[data-feat-section="origin-feats"] [data-feat-id="change-self"]',
    );
    await expect(card).toBeVisible();
  });

  test("non-Changeling has no Change Self option in any section", async ({ page }) => {
    const id = await seedCharacter(page, humanWarriorAtL3);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();
    await expect(page.locator('[data-feat-id="change-self"]')).toHaveCount(0);
  });

  test("Change Self consumes the slot — no ASI, feat = ['change-self']", async ({ page }) => {
    const id = await seedCharacter(page, changelingAtL3);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();
    await page
      .locator('[data-feat-section="origin-feats"] [data-feat-id="change-self"]')
      .click();
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    const after = await readCharacter(page, id);
    expect(after?.abilities).toEqual(changelingAtL3.abilities);
    expect(after?.feats).toContain("change-self");
  });

  test("spells-learned filters already-known spells (Bless dedupe)", async ({ page }) => {
    // Templar gains 2 new 1st-level spells at L2→L3 per PG p. 143 chart
    // (spells-known goes 1 → 3). Seed at L2 with Bless already known.
    const id = await seedCharacter(page, {
      ...templarAtL1WithBless,
      id: "test-templar-l2",
      level: 2,
      maxHp: 18,
    });
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await expect(page.getByText(/New spells/i)).toBeVisible();
    // Bless is already known and must not appear in the new-spell pool.
    await expect(page.getByLabel(/^Bless\b/)).toHaveCount(0);
  });

  test("spells-learned shows higher-level spells when slots unlock", async ({ page }) => {
    // Seed Templar at L5 — leveling to L6 gains 3 new spells (1→6 per chart)
    // and the player has 2nd-level slots, so the pool spans both levels.
    const id = await seedCharacter(page, {
      ...templarAtL1WithBless,
      id: "test-templar-l5",
      level: 5,
      maxHp: 40,
      spellPicks: {
        cantrips: ["sacred-flame", "guidance", "light"],
        spellsKnown: ["bless", "command", "shield-of-faith"],
      },
    });
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    // The collapsible picker shows separate sections for 1st and 2nd level.
    await expect(page.getByRole("button", { name: /^1st/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^2nd/ })).toBeVisible();
  });

  test("spell-picker shows all accessible levels expanded by default", async ({ page }) => {
    // Same seed as above — Templar at L5 levelling to L6.
    const id = await seedCharacter(page, {
      ...templarAtL1WithBless,
      id: "test-templar-l5-tabs",
      level: 5,
      maxHp: 40,
      spellPicks: {
        cantrips: ["sacred-flame", "guidance", "light"],
        spellsKnown: ["bless", "command", "shield-of-faith"],
      },
    });
    await gotoSheet(page, id);
    await page.getByRole("button", { name: /Level Up/i }).click();

    // Both 1st and 2nd level headers are visible.
    await expect(page.getByRole("button", { name: /^1st/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^2nd/ })).toBeVisible();
    // Aid is a 2nd-level Theurg spell — visible without any tab click since
    // every section is expanded by default.
    await expect(page.getByText("Aid", { exact: true }).first()).toBeVisible();
  });

  test("Level Up button disabled at L20", async ({ page }) => {
    const id = await seedCharacter(page, warriorAtL20);
    await gotoSheet(page, id);

    const button = page.getByRole("button", { name: /Level Up/i });
    await expect(button).toBeDisabled();
  });

  test("dialog state resets between consecutive level-ups", async ({ page }) => {
    // Regression: opening the dialog a second time after a level-up used to
    // reuse stale state and crash with `answer.pick` undefined. Verifies the
    // remount-on-level-change fix.
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    // First level-up — L1 → L2.
    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("button", { name: /Confirm Level/i }).click();
    await expect(page.getByText(/Level 2/)).toBeVisible();

    // Second level-up — L2 → L3. No JS errors, dialog renders clean.
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("button", { name: /Confirm Level/i }).click();
    await expect(page.getByText(/Level 3/)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Mystic spells known progression at L1", async ({ page }) => {
    // Sanity: a fresh Mystic should expose 6 cantrips and 2 spells in the
    // spell picker if they level. (Spec scenario for L9+ progression.)
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);
    await page.getByRole("button", { name: /Level Up/i }).click();
    // Mystic at L1→L2 gains +1 spell known per progression.
    await expect(page.getByText(/New spells.*pick 1/i)).toBeVisible();
  });

  test("swap picker exposes a 'Clear swap' control that resets both fields", async ({ page }) => {
    // Mystic at L1→L2 gains +1 spell known and `canSwap: true`, so the
    // swap picker renders alongside the new-spell picker.
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    const dialog = page.locator('[data-slot="dialog-content"]');

    // Initially the Clear swap button is not in the DOM (no swap fields set).
    await expect(dialog.getByRole("button", { name: /Clear swap/i })).toHaveCount(0);

    // Pick a swap-out value — the Mystic knows Magic Missile and Shield.
    // The swap-out dropdown labels options by raw id (existing behavior:
    // the catalog name lookup uses the new-spell pool, which excludes the
    // already-known spell), so the option text is "magic-missile".
    const swapOut = dialog.getByRole("combobox").first();
    await swapOut.click();
    await page.getByRole("option", { name: /magic-missile/ }).click();

    // Clear swap appears now that one side is set.
    const clearBtn = dialog.getByRole("button", { name: /Clear swap/i });
    await expect(clearBtn).toBeVisible();

    // Activate Clear — both selects return to their placeholders ("Swap out",
    // "Swap in") and the Clear button disappears again.
    await clearBtn.click();
    await expect(dialog.getByRole("combobox").first()).toContainText(/Swap out/);
    await expect(dialog.getByRole("combobox").nth(1)).toContainText(/Swap in/);
    await expect(dialog.getByRole("button", { name: /Clear swap/i })).toHaveCount(0);

    // Pick the required new spell (Mystic L1→L2 needs 1) and confirm —
    // level-up succeeds without applying any swap.
    await page.getByRole("checkbox").first().check();
    await reseedCurrent(page, id);
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    await expect(page.getByText(/Level 2/)).toBeVisible();
    const after = await readCharacter(page, id);
    // Original spells (magic-missile, shield) survive; only the new pick is added.
    expect(after?.spellPicks?.spellsKnown).toEqual(
      expect.arrayContaining(["magic-missile", "shield"]),
    );
    expect(after?.spellPicks?.spellsKnown.length).toBe(3);
  });

  test("warriorAtL19 → L20 disables the button after confirm", async ({ page }) => {
    const id = await seedCharacter(page, warriorAtL19);
    await gotoSheet(page, id);
    await page.getByRole("button", { name: /Level Up/i }).click();
    // L20 is not an ASI/feat level (Symbaroum slots: 4/8/10/12/14/16/19) and
    // Berserker Warrior at L20 has no required choices beyond HP, so the
    // default "average" HP confirms cleanly.
    await page.getByRole("button", { name: /Confirm Level/i }).click();
    await expect(page.getByRole("button", { name: /Level Up/i })).toBeDisabled();
  });
});
