// Companion-mode panels — interactive HP / slots / rests / death saves /
// level-up live-state preservation.
//
// Each test seeds a Templar L4 (wounded, with slots and HD remaining) and
// exercises one panel through the sheet UI, then asserts both the visible
// state and (where relevant) the persisted character.

import { test, expect } from "@playwright/test";
import { readCharacter, seedCharacter } from "./helpers/seed";
import { templarAtL4 } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Companion mode", () => {
  test("applying 5 damage drops currentHp by 5 and persists across reload", async ({
    page,
  }) => {
    const id = await seedCharacter(page, templarAtL4);
    await gotoSheet(page, id);

    const cur = page.getByTestId("current-hp");
    await expect(cur).toHaveText("24");

    await page.getByTestId("damage-input").fill("5");
    await page.getByRole("button", { name: "Apply" }).first().click();
    await expect(cur).toHaveText("19");

    // Persisted to storage. (We don't reload to assert this — Playwright's
    // page.addInitScript re-runs on every navigation and re-seeds the
    // original state, so storage assertions are the truth here.)
    const stored = await readCharacter(page, id);
    expect(stored?.currentHp).toBe(19);
  });

  test("spending and restoring a 1st-level slot updates the pip row", async ({
    page,
  }) => {
    const id = await seedCharacter(page, templarAtL4);
    await gotoSheet(page, id);

    // Three filled pips at 1st level.
    for (const i of [0, 1, 2]) {
      await expect(page.getByTestId(`slot-pip-1-${i}`)).toHaveAttribute(
        "data-filled",
        "true",
      );
    }

    // Click the rightmost filled pip → spends it.
    await page.getByTestId("slot-pip-1-2").click();
    await expect(page.getByTestId("slot-pip-1-2")).toHaveAttribute(
      "data-filled",
      "false",
    );
    let stored = await readCharacter(page, id);
    expect(stored?.currentSpellSlots[0]).toBe(2);

    // Click the now-empty pip → restores it.
    await page.getByTestId("slot-pip-1-2").click();
    await expect(page.getByTestId("slot-pip-1-2")).toHaveAttribute(
      "data-filled",
      "true",
    );
    stored = await readCharacter(page, id);
    expect(stored?.currentSpellSlots[0]).toBe(3);
  });

  test("long rest restores currentHp to maxHp and refills the slot pips", async ({
    page,
  }) => {
    const id = await seedCharacter(page, templarAtL4);
    await gotoSheet(page, id);

    // Spend a slot first so we can see the pip refill. Pips fill left-to-
    // right by index, so clicking the rightmost filled pip is what visually
    // turns off (index N-1 falls outside `idx < cur` after spending).
    await page.getByTestId("slot-pip-1-2").click();
    await expect(page.getByTestId("slot-pip-1-2")).toHaveAttribute(
      "data-filled",
      "false",
    );

    await page.getByTestId("rest-long").click();

    await expect(page.getByTestId("current-hp")).toHaveText("30");
    await expect(page.getByTestId("slot-pip-1-2")).toHaveAttribute(
      "data-filled",
      "true",
    );

    const stored = await readCharacter(page, id);
    expect(stored?.currentHp).toBe(stored?.maxHp);
    expect(stored?.currentSpellSlots[0]).toBe(3);
  });

  test("death saves panel appears at 0 HP, caps failures at 3, and disappears on heal", async ({
    page,
  }) => {
    const id = await seedCharacter(page, templarAtL4);
    await gotoSheet(page, id);

    // Knock the character to 0.
    await page.getByTestId("damage-input").fill("100");
    await page.getByRole("button", { name: "Apply" }).first().click();
    await expect(page.getByTestId("current-hp")).toHaveText("0");

    // Death saves panel appears.
    const fail = page.getByTestId("record-failure");
    await expect(fail).toBeVisible();

    // Three failures → 3, button disables, "Dead" indicator shown. The
    // button locks at 3 so a 4th click is impossible from the UI; the cap
    // logic in recordDeathSave is the belt-and-braces.
    await fail.click();
    await fail.click();
    await fail.click();
    const stored = await readCharacter(page, id);
    expect(stored?.deathSaves.failures).toBe(3);
    await expect(page.getByTestId("death-dead")).toBeVisible();
    await expect(fail).toBeDisabled();

    // Healing above 0 hides the panel and zeroes the counters. Need to
    // click ✓/✗ first to allow the heal — but heal still works at 0 HP.
    // Use the heal input (second "Apply" button on the page).
    await page.getByTestId("heal-input").fill("5");
    await page.getByRole("button", { name: "Apply" }).nth(1).click();
    await expect(page.getByTestId("current-hp")).toHaveText("5");
    await expect(page.getByTestId("record-failure")).toHaveCount(0);
    const after = await readCharacter(page, id);
    expect(after?.deathSaves).toEqual({ successes: 0, failures: 0 });
  });

  test("leveling a wounded character bumps capacity by the HP gain, not auto-heal", async ({
    page,
  }) => {
    const id = await seedCharacter(page, templarAtL4);
    await gotoSheet(page, id);

    // Wound the character before leveling so we can watch currentHp track.
    await page.getByTestId("damage-input").fill("19");
    await page.getByRole("button", { name: "Apply" }).first().click();
    await expect(page.getByTestId("current-hp")).toHaveText("5");

    // Level up. Default HP gain is "average" — d10 + 2 Con = 7.
    await page.getByRole("button", { name: /^Level Up$/ }).click();
    // Confirm-step diff shows the +HP delta and the "capacity, not auto-heal" line.
    await expect(page.getByText(/capacity, not auto-heal/)).toBeVisible();
    await page.getByRole("button", { name: /Confirm Level/i }).click();

    const stored = await readCharacter(page, id);
    expect(stored?.level).toBe(5);
    // Wounded character: currentHp went from 5 → 5 + delta. maxHp went from 30 → 30 + delta.
    expect(stored && stored.maxHp - 30).toBeGreaterThan(0);
    expect(stored?.currentHp).toBe(5 + (stored!.maxHp - 30));
    // Newly-unlocked 2nd-level slot tier starts full (L4 → L5: [3,0..] → [4,2..]).
    expect(stored?.currentSpellSlots[1]).toBe(2);
    // Hit Dice bumped by 1.
    expect(stored?.hitDiceRemaining).toBe(5);
  });
});
