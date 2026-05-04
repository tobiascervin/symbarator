## Why

Companion mode covers HP, spell slots, hit dice, rests, death saves, corruption, and a tap-to-cast popover for spells. Weapons and armor — the other half of combat — are still **vocabulary-only**: the equipment section on the sheet renders the resolved option strings (`"Chain mail"`, `"Longbow"`, `"and 20 arrows"`) but has no idea what those mean. There's no AC anywhere. No attack roll. No damage roll. A player using the sheet at the table has to pull up the PG to look up `1d8 piercing` for a longbow and compute `+atk = prof + dex` themselves.

Bringing weapons into companion mode the same way spells were brought in (tap a card → popover with the live numbers) gives the player the same affordance for the most common combat action. AC on the Combat panel completes the loop on the receiving end.

This is **Tier 1** of a multi-step plan (see `/opsx:explore` discussion): structured weapon and armor data + AC readout + tap-to-attack popover, with **no `Character` schema change** — inventory is derived from existing `classEquipmentPicks` strings via a name → catalog lookup. Tier 2 (structured `inventory: InventoryItem[]`, equipped slots, magic items, encumbrance) is explicitly deferred.

## What Changes

- **Add structured weapon and armor catalogs to `data/equipment.ts`** covering every entry in PG p. 162–171: simple/martial melee, simple/martial ranged, alchemical, siege, light/medium/heavy armor, shields. Each entry encodes name, cost, weight, damage dice + type (weapons), AC formula (armor), and the Symbaroum property set: `finesse`, `versatile (Nd6)`, `light`, `heavy`, `two-handed`, `thrown (range)`, `ammunition (range)`, `loading`, `reach`, `range`, `concealed`, `deep-impact`, `ensnaring`, `massive`, `restraining`, `returning`, `siege`, `special`, `balanced`. Armor properties: `concealable`, `cumbersome`, `noisy`, `weighty (N)`.
- **Add `lib/character/equipment.ts`** with three pure-function helpers: `resolveCharacterInventory(c)` (tokenize the resolved class-equipment strings against the catalog, returning `{ weapons, armor, shield, other }`), `computeAC(c)` (base AC from worn armor + Dex per type rules + shield + unarmored fallback), and `resolveWeaponAttack(c, weapon, mode)` (returns `{ attackMod, damageDice, damageMod, damageType, abilityUsed, range }` with finesse / versatile / thrown logic baked in). Mirrors the structure of `lib/character/spells.ts`.
- **Surface AC on the sheet's Combat panel** as a new `<Stat label="Armor Class" value={ac} />` row, alongside Initiative / Speed / Proficiency Bonus.
- **Add Weapons and Armor subsections inside the Combat parchment** (not as separate top-level sections). The Combat parchment now contains the Initiative / AC / Speed / Proficiency stat block plus a Weapons subsection (one card per weapon, parallel to `<SpellCard onCast>` in display mode — clicking opens `<WeaponAttackPopover>`) and an Armor subsection (worn armor + shield with their AC formulas).
- **Equipment section narrows to non-weapon, non-armor items only** — adventuring packs, ammo qualifiers, free-text gear, and the background equipment prose. Weapons go to the Combat → Weapons subsection; armor goes to the Combat → Armor subsection. The standalone Equipment parchment hides entirely when both lists are empty.
- **The popover is read-only.** Unlike spells (which spend a slot via `spendSlot`), weapon attacks have no consumable resource in v1 — the popover surfaces the math; the player rolls the dice themselves at the table. (Ammunition tracking, attack-action queues, multi-attack, etc. stay in Tier 2.)
- **E2E coverage**: `e2e/weapon-attack.spec.ts` with assertions on AC for a representative armored character (Warrior with chain mail + shield) and on the attack popover's contents for a melee weapon (`+atk` and damage match the character's STR mod + prof bonus).
- **Backgrounds and unstructured equipment** (`bg.equipment` is free-text prose) stay rendered as text in the Equipment section — Tier 1 doesn't try to parse them. If a background grants a recognizable weapon name, we can opt into the catalog later.

## Capabilities

### New Capabilities
<!-- none — extends existing companion-mode and spell-catalog patterns -->

### Modified Capabilities
- `companion-mode`: extend the live-play sheet to surface AC and a tap-to-attack popover for the character's weapons, mirroring the existing tap-to-cast pattern for spells.
- `spell-catalog`: rename mental model — the "spell catalog" pattern of structured catalog data + a sheet renderer + a cast popover now applies to weapons too. (No spec rename needed; new requirements live under `companion-mode`.)

## Impact

- **`data/equipment.ts`** — gains `WEAPONS: WeaponDef[]` and `ARMORS: ArmorDef[]` exports plus name → entry lookups (`WEAPON_BY_NAME`, `ARMOR_BY_NAME`). The existing `COMMON_WEAPONS` / `ARMOR` string arrays are kept (some wizard surfaces still consume them) but wrapped or deprecated in JSDoc.
- **`lib/character/types.ts`** — adds `WeaponDef`, `ArmorDef`, `WeaponProperty`, `ArmorProperty`, `DamageType`, `DamageDice` types. No `Character` field changes.
- **`lib/character/equipment.ts`** (new) — pure functions: `resolveCharacterInventory`, `computeAC`, `resolveWeaponAttack`. Matches the shape of `lib/character/spells.ts`.
- **`lib/character/compute.ts`** — adds a `computeArmorClass(c)` re-export so the sheet doesn't need to know the equipment module exists.
- **`components/sheet/character-sheet.tsx`** — Combat panel gains an AC row; a new Weapons parchment section renders below Spellcraft (when there are weapons in inventory).
- **`components/sheet/weapon-attack-popover.tsx`** (new) — a Dialog-based popover parallel to `SpellCastPopover`, showing the resolved attack and damage. No state mutation; pure read.
- **`components/sheet/printable-sheet.tsx`** — gets the AC line and a structured weapons table (still print-friendly: name, atk, dmg, properties), replacing the bullet list of resolved option strings for items the catalog recognizes.
- **`e2e/weapon-attack.spec.ts`** (new) — covers the fresh-L1 happy paths.
- **No `Character` schema change.** No migration. Existing characters automatically pick up the AC and the weapons section on next render — their `classEquipmentPicks` resolve through the new catalog without touching `Character` storage. Items the catalog doesn't recognize fall through to the existing free-text rendering, so nothing regresses for hand-edited or future content.
- **Suite size**: 87 → ~90 tests after the new spec lands.
