## Context

The companion-mode pattern is well-established: structured catalog data (`data/spells.ts`, encoding damage dice and effect kinds) → a pure compute helper (`lib/character/spells.ts`, taking a `Character` and resolving live numbers) → a card primitive (`<SpellCard mode="display" onCast>`) → a popover (`<SpellCastPopover>`) that opens on tap and surfaces the resolved math. Spells optionally consume slots via `spendSlot`.

Weapons need the same shape minus the consumption: catalog (`data/equipment.ts` gaining `WEAPONS`/`ARMORS`) → compute (`lib/character/equipment.ts` with `computeAC` and `resolveWeaponAttack`) → card (a new `<WeaponCard>` mirroring `<SpellCard>`) → popover (`<WeaponAttackPopover>` mirroring `<SpellCastPopover>`). No "consume an arrow" logic in v1.

Two tactical questions drive the design: (1) where does the inventory come from, given that `Character.classEquipmentPicks: number[]` only resolves to free-text strings, and (2) how do we present versatile / finesse / thrown without making the popover a wall of options.

## Goals / Non-Goals

**Goals:**
- AC is visible on the sheet's Combat panel for any character whose worn armor is in the catalog. Unarmored characters fall back to `10 + Dex mod`.
- Tapping a weapon card opens a popover with the live attack mod and damage roll, ability mod folded in, finesse / versatile cases handled.
- All Tier 1 weapons and armor from PG p. 162–171 are encoded with their mechanical fields and properties.
- No `Character` schema change — inventory resolved at render time from existing picks.

**Non-Goals:**
- Adding an `inventory: InventoryItem[]` field to `Character`. (Tier 2 — covered in a follow-up change.)
- "Equipped" slots — letting the player nominate a primary weapon, off-hand, worn armor, or shield. Tier 1 treats every weapon in inventory as a tap target and assumes the player picks one armor + one shield (the first matches in the list).
- Magic items, attunement, encumbrance, currency, ammunition tracking, weapon-attack actions / multi-attack, opportunity attacks.
- Parsing `bg.equipment` (free-text background equipment prose). v1 leaves it as text.
- Ranged / thrown range deltas in the popover. Show the range as text; don't compute disadvantage at long range.
- Class proficiency lookups. v1 assumes the character is proficient with anything in their starting equipment (true for every starting kit per PG); the popover always adds prof bonus.

## Decisions

### Decision: Resolve inventory by tokenizing class-equipment strings against the catalog

`classEquipmentPicks: number[]` indexes into `cls.startingEquipment` lines like `"(a) Chain mail OR (b) Leather armor, longbow, and 20 arrows"`. The picked option string can contain multiple items glued by `,` and ` and `.

`resolveCharacterInventory(c)`:
1. For each pick, take the resolved option string.
2. Split on `,` and ` and ` after stripping the `(a) `/`(b) ` prefix.
3. Trim each token, normalize (lowercase, strip `"and "`, strip ammo qualifiers like `"20 arrows"`).
4. Look up against `WEAPON_BY_NAME` and `ARMOR_BY_NAME`. Items found go to their bucket; unknown tokens go to `other: string[]` (still rendered as text on the sheet, just not interactive).
5. Backgrounds stay text-only in v1.

Returns `{ weapons: WeaponDef[]; armor: ArmorDef[]; shield: ArmorDef | null; other: string[] }`.

**Edge cases:**
- Multiple armors in inventory (e.g. a Warrior with both chain mail and a leather backup). Pick the first armor with the highest base AC for `computeAC`. Document this choice in code; players who want to wear the lighter set can edit JSON until Tier 2 ships equipped slots.
- Shield resolved separately (it's an `ArmorDef` with a `kind: "shield"` discriminator). Always added on top of the worn armor's AC.
- A weapon can also be an armor name (e.g. "Long Hammer" looks like a martial weapon, not armor). The lookup is case-insensitive exact-match against the catalog name, which keeps disambiguation simple.

### Decision: catalog shape — discriminated unions for weapon and armor types

```ts
type DamageType = "bludgeoning" | "piercing" | "slashing" | "fire" | "thunder";

type DamageDice = { count: number; faces: 4|6|8|10|12 };

type WeaponProperty =
  | "finesse" | "light" | "heavy" | "two-handed" | "loading" | "reach"
  | "deep-impact" | "ensnaring" | "massive" | "restraining" | "returning"
  | "siege" | "special" | "balanced" | "concealed";
type WeaponPropertyData =
  | { kind: "thrown"; range: [number, number] }
  | { kind: "ammunition"; range: [number, number] }
  | { kind: "range"; range: [number, number] }
  | { kind: "versatile"; twoHandedDamage: DamageDice }
  | { kind: "area"; shape: "radius" | "cone" | "line"; size: number };

interface WeaponDef {
  id: string;            // kebab-case "longsword"
  name: string;          // "Longsword"
  category: "simple-melee" | "simple-ranged" | "martial-melee" | "martial-ranged" | "alchemical" | "siege";
  cost: { thaler?: number; shilling?: number; orteg?: number };
  weight: number;        // lb. — 0 for weightless (Sling), -1 for "see ammunition"
  damage: DamageDice;    // primary 1H damage. Versatile 2H damage lives in propertyData.versatile.
  damageType: DamageType;
  flags: ReadonlySet<WeaponProperty>;        // boolean properties
  properties?: ReadonlyArray<WeaponPropertyData>; // properties with parameters
  description?: string;  // optional flavor / special rules text
}

type ArmorCategory = "light" | "medium" | "heavy" | "shield";
type ArmorProperty = "concealable" | "cumbersome" | "noisy";

interface ArmorDef {
  id: string;
  name: string;
  category: ArmorCategory;
  cost: { thaler?: number; shilling?: number; orteg?: number };
  weight: number;
  /** AC formula. For shields, this is the additive bonus. */
  ac: { base: number; addDex: boolean; dexMax?: number; isShield?: boolean };
  flags: ReadonlySet<ArmorProperty>;
  /** Weighty (N) — minimum STR required, or speed reduces by 10 ft. */
  weightyStrMin?: number;
  description?: string;
}
```

`flags` as `Set<>` lets `resolveWeaponAttack` ask `weapon.flags.has("finesse")` cheaply. `properties` as an array of discriminated objects keeps thrown range and versatile damage co-located with the property name.

**Alternative considered:** flat boolean fields (`finesse: boolean`, `light: boolean`, …). Rejected — there are 18+ weapon properties, and the Set form scales better; the existing `SpellEffect` discriminated union pattern works the same way.

### Decision: AC computation

```ts
function computeAC(c: Character): { ac: number; breakdown: string[] } {
  const inv = resolveCharacterInventory(c);
  const dexMod = abilityMod(computeFinalAbilities(c).total.dex);
  const armor = inv.armor[0];  // see "edge cases" above

  let ac = 10 + dexMod;
  let breakdown = ["10 base", `${formatMod(dexMod)} Dex`];

  if (armor) {
    const dex = armor.ac.addDex
      ? (armor.ac.dexMax !== undefined ? Math.min(dexMod, armor.ac.dexMax) : dexMod)
      : 0;
    ac = armor.ac.base + dex;
    breakdown = [
      `${armor.ac.base} ${armor.name}`,
      ...(armor.ac.addDex ? [`${formatMod(dex)} Dex${armor.ac.dexMax !== undefined ? ` (max +${armor.ac.dexMax})` : ""}`] : []),
    ];
  }
  if (inv.shield) {
    ac += inv.shield.ac.base;
    breakdown.push(`+${inv.shield.ac.base} ${inv.shield.name}`);
  }
  // Weighty STR check: if Strength score < weightyStrMin, speed reduces 10ft.
  // Speed adjustment is informational here; the sheet's Speed stat will read
  // it once Tier 2 lands an equipped-armor mutator. v1 stores the breakdown
  // so a future popover can surface it.
  return { ac, breakdown };
}
```

Display: `<Stat label="Armor Class" value={ac} />` shows just the number. A future popover can expose the breakdown.

### Decision: WeaponAttack resolution

```ts
function resolveWeaponAttack(
  c: Character,
  weapon: WeaponDef,
  mode: "1h" | "2h" | "thrown" = "1h",
): {
  abilityUsed: Ability;
  attackMod: number;       // prof + ability mod
  damageDice: DamageDice;  // possibly weapon.properties.versatile.twoHandedDamage if mode === "2h"
  damageMod: number;       // ability mod
  damageType: DamageType;
  range: [number, number] | null;  // for ranged/thrown
}
```

Ability selection rules (matches PG):
- **Default melee** → STR.
- **Default ranged** (ammunition or range) → DEX.
- **Finesse** → max of STR and DEX (player's choice; v1 picks higher).
- **Thrown on a melee weapon** → same ability the melee attack uses (keeps the choice consistent).
- **Thrown on a finesse weapon** → finesse rule (max of STR/DEX).

Damage dice selection:
- **`mode: "1h"`** → `weapon.damage` (the primary table value).
- **`mode: "2h"`** for a versatile weapon → `propertyData.versatile.twoHandedDamage`. Caller resolves which mode to ask for.
- **`mode: "2h"`** for a non-versatile weapon → still `weapon.damage` (player's holding it two-handed for grip; no damage change).

The popover renders **both modes** for versatile weapons (two rows: "One-handed: 1d8+3 slashing" and "Two-handed: 1d10+3 slashing"). For non-versatile weapons, one row.

### Decision: WeaponAttackPopover layout

```
┌──────────────────────────────────────────┐
│ Longsword                                │
│ Martial Melee · Slashing                 │
├──────────────────────────────────────────┤
│ Attack          +5 to hit                │
│ Damage (1H)     1d8 + 3 slashing         │
│ Damage (2H)     1d10 + 3 slashing  versatile│
├──────────────────────────────────────────┤
│ Properties: versatile (1d10)             │
│                                          │
│ [Close]                                  │
└──────────────────────────────────────────┘
```

For ranged: replace "Damage (1H)" with "Damage" and add a "Range: 80 / 320 ft" line. For thrown: a separate "Damage (Thrown)" row with the thrown range.

For weapons with `area` property (alchemical): replace the attack roll with a "Save DC: X (Dex)" line and the damage row, since the PG specifies a save instead of an attack roll. Out of scope for Tier 1's MVP — alchemical/siege weapons render the catalog text but no popover. Document this gap.

### Decision: Card layout — collapsible by category, mirroring SpellTabs

The sheet's spellbook uses one collapsible section per spell level. Weapons mirror that with sections by category:

```
┌─ Weapons ──────────────────────────────────┐
│ ▾ Melee     [3]                            │
│   ┌────────┐ ┌────────┐ ┌────────┐         │
│   │Longsword│ │Dagger │ │Spear  │          │
│   └────────┘ └────────┘ └────────┘         │
│ ▾ Ranged    [2]                            │
│   ┌────────┐ ┌────────┐                    │
│   │Longbow │ │Sling  │                     │
│   └────────┘ └────────┘                    │
└────────────────────────────────────────────┘
```

Reuses the `<Collapsible>` primitive from v1.11. Each card shows the weapon name + a compact "+atk / Nd? type" line. Tap opens the popover.

**Alternative considered:** flat list. Rejected — categories aid scanning when a character has 3+ weapons (a Warrior with longsword + dagger + longbow is the common case).

## Risks / Trade-offs

- [Risk] Class equipment lines bundle armor + weapon + ammo in one option, and the resolver might mis-parse some strings the catalog doesn't anticipate. → Mitigation: any unrecognized token falls into `other: string[]` and renders as text. The existing free-text Equipment section stays as a backup display, so nothing visually regresses. The new Weapons / AC surfaces are purely additive.
- [Risk] The "first armor wins" rule for AC is fiddly when a player has two armors in inventory (rare but possible). → Mitigation: pick the highest-base-AC armor; document in code; Tier 2 introduces equipped slots.
- [Risk] Symbaroum-specific properties (`balanced`, `deep-impact`, `ensnaring`, `massive`, `concealed`, `restraining`, `returning`) are catalog-only in Tier 1 — the popover lists them as text but doesn't apply their crit / restraint / extra-damage rules at attack time. → Mitigation: the player at the table knows these from the PG; the popover surfaces the property name as a reminder. Tier 2 can add interactive crit modeling.
- [Risk] No "equipped" state — for a two-weapon-fighting Warrior, the popover treats both weapons as independent tap-targets, which doesn't model main-hand / off-hand mechanics. → Mitigation: the popover just shows the math for each weapon individually; the player decides which is main/off and rolls accordingly. Tier 2 introduces equipped slots and bonus-action two-weapon damage modeling.
- [Risk] Ammunition isn't tracked. → Mitigation: explicit non-goal; the player tracks arrows manually until Tier 2.
- [Trade-off] Render-time parsing of `classEquipmentPicks` strings adds a little CPU per render. The `resolveCharacterInventory` result can be `useMemo`'d on the character's pick array; cheap.

## Migration Plan

UI / data only. No `Character` schema change, no migration, no persistence touch.

Steps:
1. Extend `lib/character/types.ts` with `WeaponDef`, `ArmorDef`, related property types.
2. Build `data/equipment.ts` catalog: encode every PG p. 162–171 entry.
3. Add `lib/character/equipment.ts` with the three pure-function helpers.
4. Wire `computeAC` into the sheet's Combat panel.
5. Add `<WeaponAttackPopover>` and the Weapons parchment section to `character-sheet.tsx`.
6. Mirror the structured weapons list into the printable sheet.
7. E2E spec covering the AC and attack-popover happy paths.
8. Manual smoke for one melee, one ranged, one finesse, one versatile weapon.

Rollback: revert the file edits. No data layer changes to undo.

## Open Questions

- **Should the AC line be tappable to surface the breakdown?** (`12 (studded leather) +3 Dex +2 shield`). Default no — leaves the surface area smaller for v1; can be added when a player asks.
- **Should the popover include a "roll" affordance (e.g. a die-rolling mini-widget)?** Default no — the table session uses physical dice or a separate roller; the popover's job is to show the right math, not replace the roll.
- **Should ammo qualifiers like "20 arrows" register as a separate inventory line?** Default no for v1 — ammo lives as a free-text token in `other: string[]`, surfaced as text. Tier 2's `inventory: InventoryItem[]` handles this with `kind: "ammunition"` items.
- **Does Symbaroum's "Heavy" property only mean the small-creature-disadvantage rule, or also a thrust attack penalty?** PG says Small/Tiny only — confirmed. No L1 character is Small/Tiny in the existing origin set, so the property is informational for v1.
