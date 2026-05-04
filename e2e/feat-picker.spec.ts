// Level-up feat picker — sectioned card grid (Boons / Origin Feats /
// Class Feats), gating logic via featAvailability, mutual exclusion, and
// the Changeling Change Self path through the unified picker.
//
// Companion to e2e/level-up.spec.ts; these tests focus on the new picker UI
// surface and prerequisite enforcement rather than the level-up apply path.

import { test, expect } from "@playwright/test";
import { seedCharacter, readCharacter } from "./helpers/seed";
import { gotoSheet } from "./helpers/visit";
import type { Character, CharacterLevel } from "@/lib/character/types";
import { FEAT_BY_ID, FEATS } from "@/data/feats";
import { CLASS_BY_ID } from "@/data/classes";
import { ORIGIN_BY_ID } from "@/data/origins";

const NOW = "2026-05-04T08:00:00.000Z";

function makeWarrior(
  id: string,
  overrides: Partial<Character> = {},
): Character {
  return {
    id,
    createdAt: NOW,
    updatedAt: NOW,
    level: 3 as CharacterLevel,
    houseRules: { allowL1BoonBurden: false },
    maxHp: 30,
    feats: [],
    identity: {
      name: "Warrior L3",
      pronouns: "they/them",
      personalityTrait: "",
      ideal: "",
      bond: "",
      flaw: "",
      background: "",
    },
    originId: "goblin",
    originAsiAllocation: { dex: 1, wis: 1 },
    backgroundId: "",
    backgroundSkillPicks: [],
    backgroundToolPicks: [],
    classId: "warrior",
    approachId: "berserker",
    classSkillPicks: [],
    fightingStyle: "defense",
    abilities: { str: 14, dex: 12, con: 14, int: 10, wis: 12, cha: 10 },
    abilityMethod: "standard-array",
    classEquipmentPicks: [0, 0, 0, 0],
    classEquipmentChoices: {},
    inventoryOverrides: { added: [], removed: [] },
    boons: [],
    burdens: [],
    boonAbilityChoices: {},
    burdenAbilityChoices: {},
    spellPicks: undefined,
    corruption: { permanent: 0, temporary: 0 },
    notes: "",
    currentHp: 30,
    tempHp: 0,
    currentSpellSlots: new Array(9).fill(0),
    hitDiceRemaining: 3,
    deathSaves: { successes: 0, failures: 0 },
    featureUses: {},
    ...overrides,
  };
}

function makeMystic(
  id: string,
  overrides: Partial<Character> = {},
): Character {
  return makeWarrior(id, {
    classId: "mystic",
    approachId: "wizard",
    fightingStyle: undefined,
    abilities: { str: 8, dex: 12, con: 12, int: 16, wis: 10, cha: 10 },
    spellPicks: {
      cantrips: ["fire-bolt", "mage-hand", "light", "prestidigitation", "minor-illusion", "ray-of-frost"],
      spellsKnown: ["magic-missile", "shield"],
    },
    classSkillPicks: ["arcana", "history", "investigation"],
    ...overrides,
  });
}

test.describe("Level-up feat picker (sectioned card grid)", () => {
  test("Warrior/Berserker Goblin sees Boons/Origin/Class sections with expected counts", async ({
    page,
  }) => {
    const id = await seedCharacter(page, makeWarrior("test-warrior-goblin-l3"));
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();

    // Picker exists; no combobox.
    await expect(page.getByTestId("feat-picker")).toBeVisible();
    await expect(page.getByRole("combobox")).toHaveCount(0);

    // Boons: ≥ 35 cards (36 catalog entries; Goblin's "beast-tongue" filtered out).
    const boons = page.locator(
      '[data-feat-section="boons"] [role="button"][data-feat-id]',
    );
    expect(await boons.count()).toBeGreaterThanOrEqual(35);

    // Origin Feats: exactly 1 card (Tough and Stringy for Goblin).
    const origins = page.locator(
      '[data-feat-section="origin-feats"] [role="button"][data-feat-id]',
    );
    await expect(origins).toHaveCount(1);
    await expect(origins.first()).toHaveAttribute("data-feat-id", "tough-and-stringy");

    // Class Feats: 3 Warrior cards (Bull Rush, Grappler, Melee Expert).
    // Skirmish Expert is a Scoundrel feat per PG — must NOT appear here.
    const cls = page.locator(
      '[data-feat-section="class-feats"] [role="button"][data-feat-id]',
    );
    await expect(cls).toHaveCount(3);
    await expect(
      page.locator('[data-feat-section="class-feats"] [data-feat-id="skirmish-expert"]'),
    ).toHaveCount(0);
  });

  test("Warrior with Str 12 sees Grappler disabled with reason; clicking is a no-op", async ({
    page,
  }) => {
    const c = makeWarrior("test-warrior-str-12", {
      abilities: { str: 12, dex: 12, con: 14, int: 10, wis: 12, cha: 10 },
    });
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();

    const grappler = page.locator('[data-feat-id="grappler"]');
    await expect(grappler).toHaveAttribute("aria-disabled", "true");
    await expect(grappler.getByTestId("feat-disabled-reason")).toContainText(
      /Requires Strength 13/i,
    );

    // Clicking the disabled card is a no-op; the picker stays unselected.
    await grappler.click({ force: true });
    await expect(grappler).not.toHaveClass(/border-primary/);
  });

  test("Changeling Scoundrel/Nimble levels and picks Change Self via the unified picker", async ({
    page,
  }) => {
    const c = makeWarrior("test-changeling-nimble-l3", {
      originId: "changeling",
      originAsiAllocation: { dex: 1 },
      classId: "scoundrel",
      approachId: "thug",
      fightingStyle: undefined,
      classSkillPicks: ["acrobatics", "deception", "stealth", "sleight-of-hand"],
      abilities: { str: 12, dex: 16, con: 12, int: 10, wis: 10, cha: 12 },
    });
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();

    const changeSelf = page.locator(
      '[data-feat-section="origin-feats"] [data-feat-id="change-self"]',
    );
    await expect(changeSelf).toBeVisible();
    await changeSelf.click();

    // Summary should say "Feat: Change Self"
    await expect(page.getByText(/Feat:\s*Change Self/i)).toBeVisible();

    await page.getByRole("button", { name: /Confirm Level/i }).click();
    const after = await readCharacter(page, id);
    expect(after?.feats).toContain("change-self");
  });

  test("Mystic/Theurg at L11 picks Confessor; at L12 the Inquisitor card is disabled with mutual-exclusion reason", async ({
    page,
  }) => {
    const c = makeMystic("test-mystic-theurg-l12", {
      level: 12 as CharacterLevel,
      hitDiceRemaining: 12,
      approachId: "theurg",
      abilities: { str: 8, dex: 12, con: 14, int: 14, wis: 16, cha: 12 },
      feats: ["confessor"],
      classSkillPicks: ["arcana", "history", "religion"],
      maxHp: 80,
      currentHp: 80,
      // L12 spell slots — keep generous; level-up only needs choices to render.
      currentSpellSlots: [4, 3, 3, 3, 2, 0, 0, 0, 0],
    });
    const id = await seedCharacter(page, c);
    await gotoSheet(page, id);

    // At L12 (target 13) we may have spell choices unrelated to the picker;
    // we only need to open the dialog and assert the Inquisitor card state
    // in the feat-picker. Switch to feat mode if a level-up dialog renders.
    // The Mystic levels grant ASI/feat at 4/8/10/12/16/19 — at L12 → L13
    // there's no asi-or-feat slot, so we instead check the picker by
    // re-opening at L11 → L12 (still has slot? No — L11 → L12 IS an ASI/feat
    // level for Mystic at L12). The seed sits at level 12, leveling to 13.
    // Symbaroum's Mystic ASI/feat slot is at L12, so the seed should be at
    // L11 to surface the picker at L12. Re-seed at L11 with the Confessor
    // already taken (legal: gained at L11 in lore).
    const id2 = await seedCharacter(
      page,
      makeMystic("test-mystic-theurg-l11", {
        level: 11 as CharacterLevel,
        hitDiceRemaining: 11,
        approachId: "theurg",
        abilities: { str: 8, dex: 12, con: 14, int: 14, wis: 16, cha: 12 },
        feats: ["confessor"],
        classSkillPicks: ["arcana", "history", "religion"],
        maxHp: 75,
        currentHp: 75,
        currentSpellSlots: [4, 3, 3, 2, 1, 0, 0, 0, 0],
      }),
    );
    await gotoSheet(page, id2);

    await page.getByRole("button", { name: /Level Up/i }).click();
    await page.getByRole("radio", { name: /^Feat/ }).check();

    const inquisitor = page.locator('[data-feat-id="inquisitor"]');
    await expect(inquisitor).toHaveAttribute("aria-disabled", "true");
    await expect(inquisitor.getByTestId("feat-disabled-reason")).toContainText(
      /Cannot be combined with Confessor/i,
    );
  });

  test("data integrity: every catalog reference resolves", async () => {
    // FEAT_BY_ID round-trip
    expect(FEAT_BY_ID["change-self"]).toBeDefined();
    expect(FEAT_BY_ID["change-self"]!.category).toBe("origin");
    expect(FEAT_BY_ID["change-self"]!.origins).toEqual(["changeling"]);

    // Every origins entry exists in ORIGIN_BY_ID.
    for (const f of FEATS) {
      if (!f.origins) continue;
      for (const oid of f.origins) {
        expect(ORIGIN_BY_ID[oid], `feat ${f.id} -> origin ${oid}`).toBeDefined();
      }
    }

    // Every classId resolves; every approachId belongs to that class; every
    // excludesFeatIds entry is a real feat id.
    for (const f of FEATS) {
      if (f.classId) {
        const cls = CLASS_BY_ID[f.classId];
        expect(cls, `feat ${f.id} -> class ${f.classId}`).toBeDefined();
        if (f.approachId) {
          const ap = cls!.approaches.find((a) => a.id === f.approachId);
          expect(ap, `feat ${f.id} -> approach ${f.approachId}`).toBeDefined();
        }
      }
      if (f.excludesFeatIds) {
        for (const xid of f.excludesFeatIds) {
          expect(FEAT_BY_ID[xid], `feat ${f.id} -> excludes ${xid}`).toBeDefined();
        }
      }
    }

    // Confessor ↔ Inquisitor mutual exclusion is symmetric.
    expect(FEAT_BY_ID["confessor"]!.excludesFeatIds).toContain("inquisitor");
    expect(FEAT_BY_ID["inquisitor"]!.excludesFeatIds).toContain("confessor");
  });

  test("class feat isolation: every class feat declares the right classId", async () => {
    // Hard-coded PG p. 155–157 expected mapping. If this drifts, the picker
    // will leak a class feat into the wrong class — exactly the bug that
    // surfaced when Skirmish Expert was misfiled under Warrior. Update this
    // map only when the PG actually says so, never to match misfiled data.
    const EXPECTED: Record<string, string> = {
      // Captain (PG p. 155)
      "battle-speech": "captain",
      "command-expert": "captain",
      parry: "captain",
      // Hunter (PG p. 155)
      overwatch: "hunter",
      "ranged-expert": "hunter",
      "trick-shot": "hunter",
      // Mystic (PG p. 156)
      "combat-magic-expert": "mystic",
      confessor: "mystic",
      "dedicated-focus": "mystic",
      demonologist: "mystic",
      "extensive-learning": "mystic",
      inquisitor: "mystic",
      necromancer: "mystic",
      pyromancer: "mystic",
      "secrets-of-the-order": "mystic",
      // Scoundrel (PG p. 156)
      nimble: "scoundrel",
      "shadow-walker": "scoundrel",
      "skirmish-expert": "scoundrel",
      // Warrior (PG p. 157)
      "bull-rush": "warrior",
      grappler: "warrior",
      "melee-expert": "warrior",
    };

    for (const [featId, expectedClass] of Object.entries(EXPECTED)) {
      const feat = FEAT_BY_ID[featId];
      expect(feat, `feat ${featId} missing from catalog`).toBeDefined();
      expect(feat!.category, `feat ${featId} should be a class feat`).toBe("class");
      expect(
        feat!.classId,
        `feat ${featId} should belong to ${expectedClass}, not ${feat!.classId}`,
      ).toBe(expectedClass);
    }

    // No catalog class feat is missing from EXPECTED — catches any new feat
    // added without an entry here.
    for (const f of FEATS) {
      if (f.category !== "class") continue;
      expect(
        EXPECTED[f.id],
        `class feat ${f.id} (classId=${f.classId}) is not listed in EXPECTED — add a PG-citation entry`,
      ).toBeDefined();
    }
  });
});
