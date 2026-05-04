## ADDED Requirements

### Requirement: A weapon and armor catalog SHALL encode PG p. 162–171 mechanical fields

`data/equipment.ts` MUST export `WEAPONS: ReadonlyArray<WeaponDef>` and `ARMORS: ReadonlyArray<ArmorDef>` covering every entry in PG p. 162–171: simple/martial melee weapons, simple/martial ranged weapons, alchemical weapons, siege weapons, light/medium/heavy armor, and shields. Each entry MUST encode at minimum: name, category, cost, weight, damage dice + damage type (weapons), AC formula (armor), and the Symbaroum property set (`finesse`, `light`, `heavy`, `two-handed`, `loading`, `reach`, `versatile`, `thrown`, `ammunition`, `range`, `concealed`, `deep-impact`, `ensnaring`, `massive`, `restraining`, `returning`, `siege`, `special`, `balanced` for weapons; `concealable`, `cumbersome`, `noisy`, `weighty (N)` for armor).

Lookup helpers MUST be exposed: `WEAPON_BY_NAME: Record<string, WeaponDef>` and `ARMOR_BY_NAME: Record<string, ArmorDef>` (both case-insensitive on lookup, but the helpers themselves are name-keyed records).

#### Scenario: Catalog covers every PG p. 162–171 entry

- **WHEN** the test suite enumerates `WEAPONS` and `ARMORS`
- **THEN** the union contains entries with the exact names listed in PG p. 162–171's Simple Melee, Simple Ranged, Martial Melee, Martial Ranged, Alchemical, Siege, Light Armor, Medium Armor, Heavy Armor, and Shields tables
- **AND** every entry's `damage` (weapons) or `ac` (armor) field reflects the value in the corresponding PG table

#### Scenario: Versatile weapons declare both 1H and 2H damage

- **WHEN** the catalog is read for a versatile weapon (e.g. Longsword)
- **THEN** the entry's `damage` is the one-handed dice (`1d8`)
- **AND** the entry's `properties` array contains a `{ kind: "versatile", twoHandedDamage: { count: 1, faces: 10 } }` element

### Requirement: `computeAC(c)` SHALL return the character's Armor Class

`lib/character/equipment.ts` MUST export a `computeAC(character)` pure function that returns `{ ac: number; breakdown: string[] }` based on the character's resolved inventory. The formula MUST follow PG p. 168–171:

- **No armor**: `10 + Dex modifier`.
- **Light armor**: `armor.ac.base + Dex modifier` (no cap).
- **Medium armor**: `armor.ac.base + min(Dex modifier, 2)`.
- **Heavy armor**: `armor.ac.base` (no Dex contribution).
- **Shield**: adds its `ac.base` (Buckler +1, regular Shield +2) on top, regardless of armor type.

The character's worn armor and shield MUST be resolved from `Character.classEquipmentPicks` via `resolveCharacterInventory(c)`. When multiple armors are in the inventory, the helper MUST select the one with the highest base AC.

#### Scenario: Unarmored Mystic gets 10 + Dex

- **WHEN** `computeAC` is called on a Mystic character with no armor in the inventory and DEX 14
- **THEN** the returned `ac` is 12 (10 + 2)

#### Scenario: Warrior in chain mail with shield

- **WHEN** `computeAC` is called on a Warrior with chain mail (heavy, AC 16, no Dex contribution) and a shield (+2)
- **THEN** the returned `ac` is 18 regardless of the character's Dex modifier

#### Scenario: Studded leather + Dex caps correctly

- **WHEN** `computeAC` is called on a character wearing studded leather (light, AC 12 + Dex) with DEX 18 (mod +4)
- **THEN** the returned `ac` is 16 (no cap on light armor)

### Requirement: `resolveWeaponAttack(c, weapon, mode)` SHALL return the live attack/damage math

`lib/character/equipment.ts` MUST export `resolveWeaponAttack(character, weapon, mode)` returning `{ abilityUsed, attackMod, damageDice, damageMod, damageType, range }`. The mode argument MUST be one of `"1h" | "2h" | "thrown"`. Ability selection MUST follow PG p. 168:

- **Default melee** → STR.
- **Default ranged** (`ammunition` or `range` property) → DEX.
- **Finesse** → max(STR mod, DEX mod). The same chosen ability MUST be used for both attack and damage.
- **Thrown on a non-finesse melee weapon** → same ability the melee attack uses (typically STR).
- **Thrown on a finesse weapon (Dagger, Stiletto, Whip…)** → finesse rule (max).

Damage dice MUST follow PG p. 168 versatile rule:

- `mode: "2h"` on a versatile weapon → `properties` array's `versatile.twoHandedDamage`.
- `mode: "2h"` on a non-versatile weapon → unchanged from `weapon.damage` (player's holding the grip differently; no damage delta).
- `mode: "1h"` always → `weapon.damage`.

`attackMod` MUST equal `proficiencyBonus(c) + abilityMod(abilityUsed)`. v1 MUST assume the character is proficient with any weapon resolved from their starting equipment — proficiency lookup is deferred to a later change.

`damageMod` MUST equal `abilityMod(abilityUsed)`.

#### Scenario: Longsword 1H attack on STR 17 Warrior at L1

- **WHEN** `resolveWeaponAttack(c, longsword, "1h")` is called on a Warrior with STR 17, prof bonus +2
- **THEN** `attackMod` is +5 (+2 prof, +3 STR)
- **AND** `damageDice` is `{ count: 1, faces: 8 }`
- **AND** `damageMod` is +3
- **AND** `damageType` is `"slashing"`
- **AND** `abilityUsed` is `"str"`

#### Scenario: Longsword 2H attack picks up versatile dice

- **WHEN** `resolveWeaponAttack(c, longsword, "2h")` is called on the same Warrior
- **THEN** `damageDice` is `{ count: 1, faces: 10 }` (versatile two-handed)
- **AND** `attackMod` and `damageMod` are unchanged

#### Scenario: Dagger uses Dex when Dex is higher (finesse)

- **WHEN** `resolveWeaponAttack(c, dagger, "1h")` is called on a Scoundrel with STR 10 (+0), DEX 16 (+3)
- **THEN** `abilityUsed` is `"dex"`
- **AND** `attackMod` includes the +3 Dex contribution

#### Scenario: Longbow uses Dex by default

- **WHEN** `resolveWeaponAttack(c, longbow, "1h")` is called on a Hunter with DEX 16, prof bonus +2
- **THEN** `abilityUsed` is `"dex"`
- **AND** `attackMod` is +5
- **AND** `range` is `[150, 600]`

### Requirement: The Combat panel SHALL display the character's Armor Class

`components/sheet/character-sheet.tsx` MUST render an "Armor Class" stat row in the Combat panel, alongside Initiative, Speed, and Proficiency Bonus. The displayed value MUST be `computeAC(character).ac`.

#### Scenario: Sheet renders AC for an armored Warrior

- **WHEN** a Warrior with chain mail and a shield is rendered on the sheet
- **THEN** the Combat panel contains a row labelled "Armor Class" with the value `18`

#### Scenario: Sheet renders AC for an unarmored Mystic

- **WHEN** a Mystic with no armor in the inventory and DEX 14 is rendered on the sheet
- **THEN** the Combat panel contains a row labelled "Armor Class" with the value `12`

### Requirement: A Weapons subsection inside the Combat parchment SHALL list inventory weapons as tap-to-attack cards

The character sheet (companion mode) MUST render Weapons as a subsection inside the Combat parchment (alongside the Initiative / Armor Class / Speed / Proficiency Bonus stat block), not as its own top-level section. The subsection MUST show one card per weapon resolved from the character's inventory. Cards MUST be grouped by category — Melee, Ranged, Alchemical, Siege — using the same collapsible primitive (`<Collapsible>`) as the spellbook, all expanded by default. Each card MUST be a tap target that opens the `<WeaponAttackPopover>` for that weapon.

The Weapons subsection MUST NOT render in the printable sheet's interactive form — the printable sheet renders weapons as a table of name, attack mod, damage, and properties without tap interaction.

The Weapons subsection MUST NOT render when the character's inventory contains zero recognized weapons.

### Requirement: An Armor subsection inside the Combat parchment SHALL list worn armor and shield with their AC contributions

The character sheet (companion mode) MUST render Armor as a subsection inside the Combat parchment (below the Weapons subsection when present). The subsection MUST list each worn armor entry resolved from the character's inventory with its AC formula (e.g. `AC 13 + Dex (max +2)`) and, when present, the shield with its AC bonus (e.g. `+2 AC`).

The Armor subsection MUST NOT render when the character's inventory contains no armor and no shield.

### Requirement: The Equipment section SHALL only contain non-weapon, non-armor items

The character sheet's standalone Equipment parchment MUST contain only items the equipment catalog does not classify as weapons or armor — adventuring packs, ammunition qualifiers, components, free-text gear, and the background's equipment prose. Weapons and armor MUST appear under the Combat parchment instead of in the Equipment section.

The Equipment parchment MUST NOT render when there are no recognized non-weapon/non-armor items and no background equipment prose.

#### Scenario: Warrior with longsword and longbow

- **WHEN** a Warrior whose `classEquipmentPicks` resolve to a longsword + longbow + 20 arrows is rendered on the sheet
- **THEN** the Combat parchment contains a "Weapons" subsection
- **AND** the subsection has a "Melee" collapsible with one card labelled "Longsword"
- **AND** the subsection has a "Ranged" collapsible with one card labelled "Longbow"

#### Scenario: Mystic with no weapons hides the subsection

- **WHEN** a Mystic whose `classEquipmentPicks` resolve to a quarterstaff (recognized) is rendered on the sheet
- **THEN** the Combat parchment's Weapons subsection renders with one card under Melee
- **AND** when the Mystic instead has only a "scholar's pack" (no recognized weapons), the Weapons subsection does NOT render

#### Scenario: Armored Warrior shows armor under Combat with the AC formula

- **WHEN** a Warrior whose `classEquipmentPicks` resolve to a chain shirt + shield is rendered on the sheet
- **THEN** the Combat parchment contains an "Armor" subsection
- **AND** the subsection lists "Chain Shirt" with the formula `AC 13 + Dex (max +2)`
- **AND** the subsection lists "Shield" with `+2 AC`

#### Scenario: Equipment parchment only renders non-weapon, non-armor items

- **WHEN** a Warrior's `classEquipmentPicks` resolve to a chain shirt, shield, light crossbow, 20 bolts, and a dungeoneer's pack
- **THEN** the standalone Equipment parchment lists only the dungeoneer's pack and the "20 bolts" ammo qualifier (plus any background equipment prose)
- **AND** the chain shirt and shield appear in the Combat parchment's Armor subsection
- **AND** the light crossbow appears in the Combat parchment's Weapons subsection

### Requirement: Tapping a weapon card SHALL open a popover with live attack and damage math

`<WeaponAttackPopover>` MUST be a Dialog-based popover (matching `<SpellCastPopover>`) that, when open, renders the resolved `resolveWeaponAttack` output as plain text rows: an Attack row (`+N to hit`), one or more Damage rows (`NdX +M <type>`), the ability used, and any range. The popover MUST surface both 1H and 2H damage rows for versatile weapons. The popover MUST NOT mutate `Character` state — it is read-only in v1.

#### Scenario: Tapping a longsword opens the popover with both modes

- **WHEN** the player taps the longsword card on a STR 17 Warrior's sheet
- **THEN** the popover opens
- **AND** it contains an "Attack" row reading `+5 to hit`
- **AND** it contains a "Damage (1H)" row reading `1d8 + 3 slashing`
- **AND** it contains a "Damage (2H)" row reading `1d10 + 3 slashing`
- **AND** closing the popover does not modify the character

#### Scenario: Tapping a finesse weapon uses the higher of STR/DEX

- **WHEN** the player taps the dagger card on a STR 10 / DEX 16 character's sheet
- **THEN** the popover's Attack row uses the DEX contribution
- **AND** the Damage row uses the same DEX modifier
