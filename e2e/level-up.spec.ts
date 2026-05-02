// Level-up flow — seeded characters skip the wizard so each test exercises
// only the dialog. Covers HP modes, ASI/feat/Change Self variants, the
// spell-pick dedupe regression, and the L20 disable.

import { test, expect } from "@playwright/test";
import { seedCharacter, readCharacter } from "./helpers/seed";
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
    // Default selection is the first boon — keep it.
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    const after = await readCharacter(page, id);
    expect(after?.feats?.length).toBe(1);
  });

  test("Changeling sees Change Self as a third option", async ({ page }) => {
    const id = await seedCharacter(page, changelingAtL3);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await expect(page.getByRole("radio", { name: /Change Self/i })).toBeVisible();
  });

  test("non-Changeling has no Change Self option", async ({ page }) => {
    const id = await seedCharacter(page, humanWarriorAtL3);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await expect(page.getByRole("radio", { name: /Change Self/i })).toHaveCount(0);
  });

  test("Change Self consumes the slot — no ASI, feat = ['change-self']", async ({ page }) => {
    const id = await seedCharacter(page, changelingAtL3);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /Change Self/i }).check();
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
    await expect(page.getByText(/Pick from any level you have slots for/i)).toBeVisible();
    await expect(page.getByText(/1, 2/)).toBeVisible();
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
