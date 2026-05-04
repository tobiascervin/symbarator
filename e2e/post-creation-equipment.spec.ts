// Post-creation equipment categorization — after the L1 wizard finishes,
// the armor and weapons the player picked must surface as actual weapons /
// armor on the sheet (under Combat → Weapons / Armor), not as free-text
// "gear" in the Equipment parchment.
//
// Tests use fixture seeding to set `classEquipmentPicks` directly and then
// assert on the rendered sheet. Wizard-walk tests (driving every wizard
// step end-to-end) are exercised separately in `e2e/builder.spec.ts`; here
// we focus on the resolver + sheet contract that turns persisted picks
// into the correct on-sheet categories.

import { test, expect } from "@playwright/test";
import { seedCharacter } from "./helpers/seed";
import { freshL1Hero, mysticAtL1 } from "./helpers/fixtures";
import { gotoSheet } from "./helpers/visit";

test.describe("Post-creation equipment categorization", () => {
  test("Warrior with default picks: chain shirt and shield surface under Combat → Armor (not Gear)", async ({
    page,
  }) => {
    // freshL1Hero is a Warrior/Berserker with classEquipmentPicks
    // [0,0,0,0]. Resolves to:
    //   line 0 (a) → "chain shirt"             → Chain Shirt (medium armor)
    //   line 1 (a) → "a martial weapon and a shield" → "a martial weapon"
    //                                                  (placeholder → gear)
    //                                                  + Shield
    //   line 2 (a) → "a light crossbow and 20 bolts" → Crossbow, light + ammo
    //   line 3 (a) → "a dungeoneer's pack"      → gear
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    // Combat → Armor lists Chain Shirt with its AC formula and the
    // Shield with its bonus.
    await expect(page.getByText(/AC 13 \+ Dex/)).toBeVisible();
    await expect(page.getByText(/\+2 AC/)).toBeVisible();

    // Combat → Weapons has the light crossbow as a tap target.
    await expect(
      page.getByRole("button", { name: /Attack with Crossbow, light/i }),
    ).toBeVisible();

    // Each catalog-recognized item appears EXACTLY once on the page —
    // duplication would mean the resolver categorized it as both armor
    // (Combat) and gear (Equipment), which is the bug shape we're guarding
    // against. Chain Shirt should only appear in the Armor subsection.
    await expect(page.getByText(/^Chain Shirt$/)).toHaveCount(1);
    await expect(page.getByText(/^Shield$/)).toHaveCount(1);
  });

  test("Mystic with default pick: quarterstaff surfaces under Combat → Weapons (not Gear)", async ({
    page,
  }) => {
    // mysticAtL1.classEquipmentPicks[0] === 0 → "a quarterstaff" from line 0.
    const id = await seedCharacter(page, mysticAtL1);
    await gotoSheet(page, id);

    await expect(
      page.getByRole("button", { name: /Attack with Quarterstaff/i }),
    ).toBeVisible();
    // The quarterstaff appears only in the Weapons section — exactly once
    // as the tap-target card. It MUST NOT also appear as a gear bullet.
    await expect(page.getByText(/^Quarterstaff$/)).toHaveCount(1);
  });

  // The Warrior / Captain class equipment lines include a placeholder —
  // "a martial weapon" — which today's resolver doesn't expand to a real
  // catalog entry. The string falls through to the Equipment Gear list.
  // The wizard SHOULD surface a follow-up dropdown letting the player
  // pick the specific martial weapon, and the resolver SHOULD substitute
  // it at render time. Until that lands, this test acts as a tripwire —
  // wrapped in `test.fail()` so CI stays green; it'll start passing the
  // moment the dropdown ships, which forces the maintainer to flip back
  // to a regular `test()`.
  // TODO: open `/opsx:propose class-equipment-placeholder-dropdown` to fix.
  test("Warrior 'a martial weapon' placeholder resolves to a real weapon (not gear)", async ({
    page,
  }) => {
    // The wizard's placeholder dropdown persists the player's choice on
    // `Character.classEquipmentChoices[1]`. The resolver substitutes the
    // catalog name for the placeholder token before tokenization, so the
    // literal "a martial weapon" phrase no longer appears on the sheet —
    // a real catalog weapon does.
    const draft = {
      ...freshL1Hero,
      id: "test-fresh-l1-with-martial-choice",
      classEquipmentChoices: { 1: ["Longsword"] },
    };
    const id = await seedCharacter(page, draft);
    await gotoSheet(page, id);

    await expect(page.getByText("a martial weapon", { exact: true })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Attack with Longsword/i }),
    ).toBeVisible();
  });

  test("'two martial weapons' expands to two real weapons under Combat → Weapons", async ({
    page,
  }) => {
    // Picking option (b) for Warrior line 1 ("two martial weapons") plus
    // filling both slots produces two distinct weapons.
    const draft = {
      ...freshL1Hero,
      id: "test-fresh-l1-two-martial",
      classEquipmentPicks: [0, 1, 0, 0],
      classEquipmentChoices: { 1: ["Longsword", "Axe"] },
    };
    const id = await seedCharacter(page, draft);
    await gotoSheet(page, id);

    await expect(
      page.getByRole("button", { name: /Attack with Longsword/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Attack with Axe$/i }),
    ).toBeVisible();
    await expect(page.getByText("two martial weapons", { exact: true })).toHaveCount(0);
  });

  test("Unfilled placeholder still falls through to gear (back-compat)", async ({
    page,
  }) => {
    // Pre-1.15 character: classEquipmentChoices is empty, so the resolver
    // leaves the placeholder unsubstituted — exactly today's behavior.
    // No phantom weapon under Combat → Weapons; the literal phrase
    // appears in the gear list as a free-text bullet.
    const id = await seedCharacter(page, freshL1Hero);
    await gotoSheet(page, id);

    await expect(page.getByText("a martial weapon", { exact: true })).toHaveCount(1);
    await expect(
      page.getByRole("button", { name: /Attack with Longsword/i }),
    ).toHaveCount(0);
  });
});
