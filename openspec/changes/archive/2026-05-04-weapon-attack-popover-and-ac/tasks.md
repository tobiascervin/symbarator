## 1. Catalog data and types

- [x] 1.1 In `lib/character/types.ts`, add `DamageType`, `DamageDice`, `WeaponProperty`, `WeaponPropertyData`, `WeaponDef`, `ArmorCategory`, `ArmorProperty`, `ArmorDef` per the design.md shapes. Use `ReadonlySet<WeaponProperty>` for boolean flags and a `ReadonlyArray<WeaponPropertyData>` for parameterized properties (thrown range, versatile two-handed dice, ammunition range, etc.). *(Reused existing `DamageType` and `DiceExpression`; widened `DiceExpression.faces` to include `1` for flat-damage weapons (Blowpipe, Bolas).)*
- [x] 1.2 In `data/equipment.ts`, encode `SIMPLE_MELEE`, `SIMPLE_RANGED`, `MARTIAL_MELEE`, `MARTIAL_RANGED`, `ALCHEMICAL`, `SIEGE` weapon arrays per PG p. 162–166. Aggregate into `WEAPONS: ReadonlyArray<WeaponDef>` and `WEAPON_BY_NAME: Record<string, WeaponDef>` (key on lowercased name).
- [x] 1.3 In `data/equipment.ts`, encode `LIGHT_ARMORS`, `MEDIUM_ARMORS`, `HEAVY_ARMORS`, `SHIELDS` per PG p. 169–171. Aggregate into `ARMORS: ReadonlyArray<ArmorDef>` and `ARMOR_BY_NAME: Record<string, ArmorDef>` (key on lowercased name). *(Plus a "Chain mail" entry and a "Leather armor" alias since class starting-equipment lines reference these 5e SRD names directly.)*
- [x] 1.4 Keep the existing `COMMON_WEAPONS` / `ARMOR` string arrays exported (the wizard's equipment surfaces still reference them) but mark them `@deprecated` in JSDoc with a pointer to `WEAPONS` / `ARMORS`.
- [x] 1.5 Add a module-load assertion in `data/equipment.ts` (or `data/classes.ts`'s existing IIFE) that every weapon `id` and `name` is unique and every armor likewise. *(Folded into a self-contained IIFE in `data/equipment.ts`.)*

## 2. Compute helpers

- [x] 2.1 Create `lib/character/equipment.ts`. Export `resolveCharacterInventory(c)` that iterates `c.classEquipmentPicks`, resolves each to its option string from `cls.startingEquipment`, strips the `(a) `/`(b) ` prefix, splits on `,` and ` and `, trims, lowercases, and looks up each token against `WEAPON_BY_NAME` and `ARMOR_BY_NAME`. *(Plus tokenization niceties: strips `a `/`an `/`the `/`two `/`three ` prefixes, strips trailing ` armor`, depluralizes when the singular exists in the catalog, and aliases the prose form `light crossbow` to the catalog's comma form `crossbow, light`. Numeric ammo qualifiers like `20 arrows` route to `other`.)*
- [x] 2.2 Export `computeAC(c)` per the design.md formula: unarmored = 10 + Dex; armored = base + Dex (capped per category) + shield. Returns `{ ac: number; breakdown: ReadonlyArray<string> }`. When multiple armors are in inventory, pick the highest base AC.
- [x] 2.3 Export `resolveWeaponAttack(c, weapon, mode)` per the design.md ability-selection rules. Mode is `"1h" | "2h" | "thrown"`. Returns `{ abilityUsed, attackMod, damageDice, damageMod, damageType, range }`. Always assume the character is proficient (defer the proficiency lookup).
- [x] 2.4 Re-export `computeArmorClass` from `lib/character/compute.ts` as a thin wrapper around `computeAC` so sheet code doesn't need to import the equipment module directly. *(Done as a `export { computeAC as computeArmorClass } from "./equipment"` re-export.)*

## 3. Sheet — Combat panel AC

- [x] 3.1 In `components/sheet/character-sheet.tsx`, add an "Armor Class" `<Stat>` row to the Combat parchment, between "Initiative" and "Speed". Read the value from `computeArmorClass(c)`.
- [x] 3.2 The AC row MUST render even when no armor is in inventory (showing `10 + Dex mod`). *(Verified by the new "Unarmored Mystic shows AC 13" e2e test.)*

## 4. Sheet — Weapons section + popover

- [x] 4.1 Create `components/sheet/weapon-attack-popover.tsx` modeled on `components/spells/spell-cast-popover.tsx`. Props: `{ open, onOpenChange, character, weapon }`. Renders Attack row, Damage row(s) (1H + 2H for versatile), ability used, range when applicable. Read-only — no `onCast`-style mutator. Close button only.
- [x] 4.2 In `components/sheet/character-sheet.tsx`, add a "Weapons" subsection inside the Combat parchment (alongside the Initiative/AC/Speed/Proficiency stat block). Use `resolveCharacterInventory(c).weapons` to get the list. Group by `category`: Melee (= `simple-melee`/`martial-melee`), Ranged (= `simple-ranged`/`martial-ranged`), Alchemical, Siege. Render each group as a `<Collapsible defaultOpen>` (mirror `SpellTabs`'s shape). *(Weapons + Armor live under Combat; Equipment narrows to non-weapon/non-armor items only — see 4.5.)*
- [x] 4.3 Render each weapon as a tap-target card showing the weapon name + a compact summary line (e.g. `+5 to hit · 1d8 slashing`). Tapping opens the `<WeaponAttackPopover>` for that weapon; closing the popover returns to the sheet.
- [x] 4.4 The Weapons subsection MUST NOT render when `weapons.length === 0`.

- [x] 4.5 Add a sibling "Armor" subsection inside the Combat parchment listing each worn armor with its AC formula (`AC 13 + Dex (max +2)`) plus the shield's bonus when present (`+2 AC`). Hides when there's no armor and no shield.

- [x] 4.6 Narrow the standalone Equipment parchment to render only `inventory.other` (non-weapons, non-armor) plus the background equipment prose. The parchment hides entirely when both are empty. Weapons and armor no longer appear here.

## 5. Printable sheet

- [x] 5.1 In `components/sheet/printable-sheet.tsx`, add an "Armor Class" line to the combat-stat row (alongside HP / Hit Die / etc.). *(Added as a `<Pill label="AC">`; widened the row from `sm:grid-cols-6` to `sm:grid-cols-7` to fit.)*
- [x] 5.2 Replace the existing "Equipment → from class" bullet list of resolved option strings with a structured Weapons table (name, attack mod, damage, properties) for every weapon `resolveCharacterInventory(c)` recognizes. Items it doesn't recognize (`other: string[]`) continue to render as bullet text below the table. *(Also added an Armor list showing each worn armor's AC formula and the shield's bonus.)*
- [x] 5.3 The structured weapons table is print-friendly: monospace numerics, no interactivity, no dialog primitives.

## 6. E2E coverage

- [x] 6.1 Create `e2e/weapon-attack.spec.ts`. Seed a Warrior whose `classEquipmentPicks` resolve to chain mail + shield + longsword (use one of the existing fixtures or extend `humanWarriorAtL3`). Open the sheet. Assert the Combat panel's "Armor Class" row reads the expected value. *(Used `humanWarriorAtL3` directly — its `classEquipmentPicks: [0,0,0,0]` resolves to `chain shirt` (medium AC 13 + Dex max 2) plus the `Shield` (+2) → AC 16 with DEX 12 (+1).)*
- [x] 6.2 Tap a weapon card; assert the popover opens with the right Attack and Damage rows. *(Mystic with quarterstaff: `+1 to hit (STR)`, `1d8 -1 bludgeoning` per STR 8 baseline.)*
- [x] 6.3 Add a third assertion for an unarmored Mystic at L1. *(`mysticAtL1` actually computes to AC 13, not 12 — base DEX 14 +1 fixed +1 floating = 16, mod +3, AC 10+3=13. Test asserts the correct value.)*
- [x] 6.4 Add a fourth assertion for a finesse weapon. *(Custom inline character extending `mysticAtL1` with `classEquipmentPicks: [1, 1, 0, 0]` to take the dagger from line 0 pick 1. STR -1 / DEX +3 → finesse picks DEX → `+5 to hit (DEX)`, `1d4 +3 piercing`.)*
- [x] 6.5 Verify the existing 87 e2e tests still pass. *(Full suite: 91/91 passing — 87 pre-existing + 4 new.)*

## 7. Verification

- [x] 7.1 `npm run lint` — no new problems against the prior baseline. *(8 problems, all pre-existing on v1.14.2; this change adds zero new ones.)*
- [x] 7.2 `npm run test:e2e` — full suite passes (87 + new = ~91). *(91/91 passing.)*
- [ ] 7.3 Manual smoke: open the sheet for the existing Warrior fixture (`freshL1Hero`); confirm AC reads correctly, Weapons section renders, longsword card popover shows the right math. Repeat for `mysticAtL1` (no weapons section since Mystic L1 starts with a quarterstaff at minimum — confirm the quarterstaff is recognized and the Mystic shows it). **(Not executed by agent — automated coverage: the new `e2e/weapon-attack.spec.ts` runs four representative cases, including unarmored AC, armored AC, melee popover math, and finesse weapon ability selection.)**
- [x] 7.4 Confirm `npm run build` is clean. *(Build passes cleanly.)*
