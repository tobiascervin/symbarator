// Templar bonus bless — the Templar approach grants `bless` automatically
// in addition to the player's spell picks (PG p. 143). The granted spell
// surfaces on the sheet's spellbook with a "Granted" badge and is castable
// through the standard cast popover.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { freshL1Hero, templarAtL1WithBless } from "./helpers/fixtures";
import { gotoBuilder, gotoSheet } from "./helpers/visit";
import type { Character, CharacterLevel } from "@/lib/character/types";
import { computeSpellcasting } from "@/lib/character/compute";
import { validateStep } from "@/lib/character/validation";
import { TEMPLAR_SPELLCASTING } from "@/data/level-tables/warrior";
import { SPELL_BY_ID } from "@/data/spells";

// A Templar whose 1st-level pick is NOT bless — so any bless visible on the
// sheet must come from the approach grant, not from spellPicks. Currentslots
// are seeded full at the L1 progression row so the cast-popover test can hit
// an enabled "Cast at L1" button.
const templarPickedCureWounds: Character = {
  ...templarAtL1WithBless,
  id: "test-templar-cure-wounds",
  spellPicks: {
    cantrips: ["sacred-flame", "guidance"],
    spellsKnown: ["cure-wounds"],
  },
  currentSpellSlots: [2, 0, 0, 0, 0, 0, 0, 0, 0],
};

test.describe("Templar bonus bless (granted)", () => {
  test("sheet spellbook shows Bless with a Granted badge", async ({ page }) => {
    const id = await seedCharacter(page, templarPickedCureWounds);
    await gotoSheet(page, id);

    // The 1st-level section is expanded by default in the collapsible
    // spellbook. The bless card is a tap target (button with aria-label
    // `Cast Bless`) — present even though the player picked Cure Wounds,
    // because the approach grants it.
    const blessCard = page.getByRole("button", { name: /Cast Bless/i });
    await expect(blessCard).toBeVisible();

    // The Granted badge sits inside the bless card alongside the school /
    // ritual badges.
    await expect(blessCard.getByText(/^Granted$/i)).toBeVisible();
  });

  test("granted Bless can be cast through the standard cast popover", async ({ page }) => {
    // Use a Templar with starting 1st-level slots so the cast button is
    // enabled. The migrator backfills currentSpellSlots from the approach
    // progression at L1 (Templar gets 2 1st-level slots).
    const id = await seedCharacter(page, templarPickedCureWounds);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Cast Bless/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Cast at L1 button is enabled — Templar starts with 2 1st-level slots.
    const castL1 = dialog.getByRole("button", { name: /^L1\s/ });
    await expect(castL1).toBeEnabled();
  });

  test("computeSpellcasting exposes grantedSpells for Templar at every level", async () => {
    // Unit-style check that runs in Playwright's Node runner. Sweeps L1..L20
    // so a future progression edit can't accidentally drop the granted list.
    for (let lvl = 1 as number; lvl <= 20; lvl++) {
      const c: Character = { ...templarPickedCureWounds, level: lvl as CharacterLevel };
      const sc = computeSpellcasting(c);
      expect(sc).not.toBeNull();
      expect(sc!.grantedSpells).toContain("bless");
    }
  });

  test("TEMPLAR_SPELLCASTING.alwaysKnownSpells declares bless and resolves to a catalog entry", async () => {
    expect(TEMPLAR_SPELLCASTING.alwaysKnownSpells).toEqual(["bless"]);
    for (const id of TEMPLAR_SPELLCASTING.alwaysKnownSpells ?? []) {
      expect(SPELL_BY_ID[id]).toBeDefined();
    }
  });

  test("validateStep('approach') accepts a Templar with 2 cantrips + 1 non-bless spell", async () => {
    const result = validateStep("approach", templarPickedCureWounds);
    expect(result).toBeNull();
  });

  test("approach step: bless is hidden from the picker pool and surfaces in the Always-known section", async ({
    page,
  }) => {
    // Seed a Warrior draft with no approach picked yet so the wizard renders
    // the approach selection grid. Click Templar to surface the spell picker.
    const draft: Character = {
      ...freshL1Hero,
      id: "test-templar-approach-step",
      classId: "warrior",
      approachId: "",
      spellPicks: undefined,
    };
    const id = await seedCharacter(page, draft);
    await gotoBuilder(page, id, "approach");

    await page.getByRole("button", { name: /^Templar/ }).first().click();

    // Always-known section lists Bless.
    await expect(page.getByText(/^Always known/)).toBeVisible();

    // Bless does NOT appear as a pickable checkbox in the 1st-level pool —
    // granted spells are filtered out so the player can't double-pick.
    await expect(page.getByRole("checkbox", { name: /^Bless\b/ })).toHaveCount(0);

    // Sanity: a different 1st-level Theurg spell (Cure Wounds) IS pickable.
    await expect(page.getByRole("checkbox", { name: /Cure Wounds/ })).toBeVisible();
  });

  test("approach step: cantrip picker renders as a collapsible section", async ({ page }) => {
    const draft: Character = {
      ...freshL1Hero,
      id: "test-templar-approach-cantrips-collapse",
      classId: "warrior",
      approachId: "",
      spellPicks: undefined,
    };
    const id = await seedCharacter(page, draft);
    await gotoBuilder(page, id, "approach");

    await page.getByRole("button", { name: /^Templar/ }).first().click();

    // The cantrip picker now goes through SpellTabs with levels=[0], so it
    // renders a Cantrips section trigger with `aria-expanded` (button role).
    const cantripsHeader = page.getByRole("button", { name: /^Cantrips/ });
    await expect(cantripsHeader).toBeVisible();
    await expect(cantripsHeader).toHaveAttribute("aria-expanded", "true");
  });
});
