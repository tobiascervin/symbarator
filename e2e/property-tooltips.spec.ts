// Weapon and armor property tooltips — PG-sourced explanations rendered
// through the shared <ExplainableBadge> wrapper. Covers hover (desktop),
// tap (touch), keyboard, dialog-stickiness, and catalog completeness.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { mysticAtL1 } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";
import type { Character } from "@/lib/character/types";
import { WEAPONS, ARMORS } from "@/data/equipment";
import {
  ARMOR_FLAG_EXPLANATIONS,
  WEAPON_DATA_EXPLANATIONS,
  WEAPON_FLAG_EXPLANATIONS,
  WEIGHTY_EXPLANATION,
} from "@/data/property-explanations";

const PHONE = { width: 360, height: 800 };

const mysticWithDagger: Character = {
  ...mysticAtL1,
  id: "test-mystic-tooltips-dagger",
  classEquipmentPicks: [1, 1, 0, 0],
};

const fieldArmorHero: Character = {
  ...mysticAtL1,
  id: "test-field-armor",
  inventoryOverrides: { added: ["Field Armor"], removed: [] },
};

test.describe("Property tooltips (companion mode)", () => {
  test("dagger popover surfaces all property badges with PG explanations", async ({
    page,
  }) => {
    const id = await seedCharacter(page, mysticWithDagger);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Attack with Dagger/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const finesse = dialog.getByRole("button", { name: /Finesse — explanation/ });
    const light = dialog.getByRole("button", { name: /Light — explanation/ });
    const thrown = dialog.getByRole("button", { name: /Thrown — explanation/ });
    await expect(finesse).toBeVisible();
    await expect(light).toBeVisible();
    await expect(thrown).toBeVisible();
    await expect(thrown).toHaveText(/thrown \(20\/60 ft\)/);

    await finesse.hover();
    await expect(
      page.getByText(WEAPON_FLAG_EXPLANATIONS.finesse.description),
    ).toBeVisible();
    await expect(
      page.getByText(`PG p. ${WEAPON_FLAG_EXPLANATIONS.finesse.pgPage}`),
    ).toBeVisible();
  });

  test.describe("touch viewport", () => {
    test.use({ hasTouch: true });

    test("tap on phone toggles the tooltip and keeps the popover open", async ({
      page,
    }) => {
      await page.setViewportSize(PHONE);
      const id = await seedCharacter(page, mysticWithDagger);
      await gotoSheet(page, id);

      await page.getByRole("button", { name: /Attack with Dagger/i }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const finesse = dialog.getByRole("button", { name: /Finesse — explanation/ });
      await finesse.tap();
      const tooltipBody = page.getByText(WEAPON_FLAG_EXPLANATIONS.finesse.description);
      await expect(tooltipBody).toBeVisible();

      // The popover dialog itself MUST stay open.
      await expect(dialog).toBeVisible();

      // A second tap on the badge closes the tooltip.
      await finesse.tap();
      await expect(tooltipBody).toBeHidden();
      await expect(dialog).toBeVisible();
    });
  });

  test("Field Armor card opens a popover with cumbersome and weighty (13) badges and PG tooltips", async ({
    page,
  }) => {
    const id = await seedCharacter(page, fieldArmorHero);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Inspect Field Armor/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const cumbersome = dialog.getByRole("button", {
      name: /Cumbersome — explanation/,
    });
    const weighty = dialog.getByRole("button", {
      name: /Weighty — explanation/,
    });
    await expect(cumbersome).toBeVisible();
    await expect(weighty).toHaveText(/weighty \(13\)/);

    await cumbersome.hover();
    await expect(
      page.getByText(ARMOR_FLAG_EXPLANATIONS.cumbersome.description),
    ).toBeVisible();

    await weighty.hover();
    await expect(page.getByText(WEIGHTY_EXPLANATION.description)).toBeVisible();
  });

  test("Catalog completeness: every weapon/armor property has a non-empty entry", () => {
    for (const w of WEAPONS) {
      for (const flag of w.flags) {
        const e = WEAPON_FLAG_EXPLANATIONS[flag];
        expect(e, `weapon flag "${flag}" on ${w.id}`).toBeDefined();
        expect(e.description.length, `description for ${flag}`).toBeGreaterThan(0);
        expect(e.pgPage, `pgPage for ${flag}`).toBeGreaterThan(0);
      }
      for (const p of w.properties ?? []) {
        const e = WEAPON_DATA_EXPLANATIONS[p.kind];
        expect(e, `weapon property "${p.kind}" on ${w.id}`).toBeDefined();
        expect(e.description.length, `description for ${p.kind}`).toBeGreaterThan(0);
        expect(e.pgPage, `pgPage for ${p.kind}`).toBeGreaterThan(0);
      }
    }
    for (const a of ARMORS) {
      for (const flag of a.flags) {
        const e = ARMOR_FLAG_EXPLANATIONS[flag];
        expect(e, `armor flag "${flag}" on ${a.id}`).toBeDefined();
        expect(e.description.length, `description for ${flag}`).toBeGreaterThan(0);
        expect(e.pgPage, `pgPage for ${flag}`).toBeGreaterThan(0);
      }
      if (a.weightyStrMin !== undefined) {
        expect(WEIGHTY_EXPLANATION.description.length).toBeGreaterThan(0);
        expect(WEIGHTY_EXPLANATION.pgPage).toBeGreaterThan(0);
      }
    }
  });

  test("Catalog keys exactly cover the WeaponProperty / WeaponPropertyData / ArmorProperty unions", () => {
    expect(Object.keys(WEAPON_FLAG_EXPLANATIONS).sort()).toEqual(
      [
        "balanced",
        "concealed",
        "deep-impact",
        "ensnaring",
        "finesse",
        "heavy",
        "immobile",
        "light",
        "loading",
        "massive",
        "reach",
        "restraining",
        "returning",
        "siege",
        "special",
        "two-handed",
      ].sort(),
    );
    expect(Object.keys(WEAPON_DATA_EXPLANATIONS).sort()).toEqual(
      ["ammunition", "area", "range", "thrown", "versatile"].sort(),
    );
    expect(Object.keys(ARMOR_FLAG_EXPLANATIONS).sort()).toEqual(
      ["concealable", "cumbersome", "noisy"].sort(),
    );
  });
});
