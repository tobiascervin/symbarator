// Cast spell popover — companion-mode integration. Verifies that tapping a
// spell on the sheet opens a popover with the correct computed numbers,
// scales cantrip damage by character level, scales upcast damage by slot
// level, and spends slots through the existing spendSlot primitive.

import { test, expect } from "@playwright/test";
import {
  seedCharacter,
  readCharacter,
  reseedCurrent,
} from "./helpers/seed";
import { mysticAtL1 } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";
import {
  spellAttackMod,
  spellSaveDc,
  spellAbilityModValue,
  resolveSpellEffect,
} from "@/lib/character/spells";
import { SPELL_BY_ID } from "@/data/spells";
import type { Character, CharacterLevel, SpellLevel } from "@/lib/character/types";

// Mystic L1 with INT 15 and 2 L1 slots — mirrors the PG Wizard progression.
const mysticWithSlots: Character = {
  ...mysticAtL1,
  currentSpellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0],
};

test.describe("Spell cast popover (companion mode)", () => {
  test("computed numbers reflect Mystic INT 15 at L1", () => {
    // Pure compute check — no Playwright needed for this one but keeping
    // it in the cast suite groups the assertions thematically.
    expect(spellAbilityModValue(mysticWithSlots)).toBe(2);
    expect(spellAttackMod(mysticWithSlots)).toBe(4); // prof 2 + INT 2
    expect(spellSaveDc(mysticWithSlots)).toBe(12); // 8 + prof 2 + INT 2
  });

  test("Fire Bolt cantrip popover scales dice with character level", () => {
    const fireBolt = SPELL_BY_ID["fire-bolt"];
    expect(fireBolt).toBeDefined();
    // L1 character: 1d10
    const atL1 = resolveSpellEffect(fireBolt!, mysticWithSlots, 0 as SpellLevel);
    expect(atL1.kind).toBe("attack");
    expect(atL1.damage?.dice).toEqual({ count: 1, faces: 10 });
    // L5 character: 2d10
    const fireBoltAtL5 = resolveSpellEffect(
      fireBolt!,
      { ...mysticWithSlots, level: 5 as CharacterLevel },
      0 as SpellLevel,
    );
    expect(fireBoltAtL5.damage?.dice).toEqual({ count: 2, faces: 10 });
  });

  test("Burning Hands upcast doubles dice when cast at L3", () => {
    const burningHands = SPELL_BY_ID["burning-hands"];
    expect(burningHands).toBeDefined();
    const atBase = resolveSpellEffect(burningHands!, mysticWithSlots, 1 as SpellLevel);
    expect(atBase.damage?.dice).toEqual({ count: 3, faces: 6 });
    const atL3 = resolveSpellEffect(burningHands!, mysticWithSlots, 3 as SpellLevel);
    expect(atL3.damage?.dice).toEqual({ count: 5, faces: 6 });
  });

  test("tapping a spell opens the popover with computed numbers", async ({ page }) => {
    const id = await seedCharacter(page, mysticWithSlots);
    await gotoSheet(page, id);

    // Spellcraft tab defaults to cantrips. Click Fire Bolt's card (rendered
    // as a button when companion-mode wires onCast).
    await page.getByRole("button", { name: /Cast Fire Bolt/i }).click();

    // Popover (Dialog) opens with the spell name.
    await expect(page.getByRole("dialog")).toBeVisible();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Fire Bolt")).toBeVisible();
    // Computed numbers band — Spell Mod +2 (INT), Attack +4, Save DC 12 (INT).
    await expect(dialog.getByText(/\+2 \(INT\)/)).toBeVisible();
    // Attack mod appears twice (once in the Stat cell, once in the band footer).
    await expect(dialog.getByText(/\+4/).first()).toBeVisible();
    await expect(dialog.getByText(/12 \(INT\)/)).toBeVisible();
    // Effect band — 1d10 fire at L1. Use `hasText` against the band's div
    // since the dice and type are separate text children.
    await expect(dialog.locator("div").filter({ hasText: /^1d10 fire$/ })).toBeVisible();
  });

  test("leveled spell shows Cast at L1 button and spends a slot when clicked", async ({ page }) => {
    const id = await seedCharacter(page, mysticWithSlots);
    await gotoSheet(page, id);

    // Switch to the 1st-level tab and tap Magic Missile.
    await page.getByRole("tab", { name: /1st/i }).click();
    await page.getByRole("button", { name: /Cast Magic Missile/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // L1 button should be enabled (2 slots remaining).
    const castL1 = dialog.getByRole("button", { name: /^L1\s/ });
    await expect(castL1).toBeEnabled();

    // Re-seed with the current state so the post-cast navigation read isn't
    // overwritten by the original seed payload (addInitScript fires on full nav).
    await reseedCurrent(page, id);
    await castL1.click();

    // Popover closes and the slot is spent.
    await expect(dialog).not.toBeVisible();
    const after = await readCharacter(page, id);
    expect(after?.currentSpellSlots[0]).toBe(1);
  });

  test("description-only spell still opens the popover with numbers + description fallback", async ({ page }) => {
    // mage-hand is a cantrip with `kind: "utility"` — no auto-computed effect.
    const id = await seedCharacter(page, mysticWithSlots);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Cast Mage Hand/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Mage Hand")).toBeVisible();
    // Effect band reads "no save, no attack" for utility spells.
    await expect(dialog.getByText(/no save, no attack/i)).toBeVisible();
    // Description still renders.
    await expect(dialog.getByText(/Spectral hand within 30 ft/i)).toBeVisible();
  });

  test("printable sheet does NOT make spell cards interactive", async ({ page }) => {
    const id = await seedCharacter(page, mysticWithSlots);
    await page.goto(`/characters/${id}/print`);
    // Even if the printable sheet renders spell names, no card has a Cast button.
    await expect(page.getByRole("button", { name: /Cast Fire Bolt/i })).toHaveCount(0);
  });
});
