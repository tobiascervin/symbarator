## Why

Tier 1 of the equipment work (`weapon-attack-popover-and-ac`, archived 2026-05-04) shipped structured weapons + armor + AC by deriving everything from `Character.classEquipmentPicks` at render time. The model is **read-only**: a player can't pick up a magic sword the GM gave them, sell their chain shirt, or add a healer's kit they bought between sessions. The sheet faithfully reflects what they picked at character creation and nothing else.

For companion mode to be a play-time tool, the player needs to *modify* their inventory in-session — add and remove weapons, armor, and gear. The Tier 1 design.md flagged this explicitly as Tier 2 territory and deferred it.

## What Changes

- **A "rucksack" icon next to the Equipment section heading** (or near the Combat parchment's Weapons/Armor subsections) opens an inventory-management modal.
- **The modal lets the player add or remove items**:
  - Add weapon — pick from the structured `WEAPONS` catalog by name search.
  - Add armor / shield — pick from the structured `ARMORS` catalog.
  - Add free-text gear — for items the catalog doesn't cover (potions, magic items, custom GM rewards).
  - Remove any item from the current inventory, including catalog items (e.g. lose the chain shirt to rust).
- **`Character` schema gains a structured inventory delta** so the wizard's `classEquipmentPicks` stay the source-of-truth for character creation, but post-creation additions and removals are tracked separately. Two minimal shapes considered (see design.md):
  - **Delta shape**: `inventoryOverrides: { added: string[]; removed: string[] }` — small, additive, easy to migrate. Render time resolves `picks → inventory + added − removed`.
  - **Full inventory shape**: `inventory: InventoryItem[]` — replaces render-time derivation entirely with a stored inventory; migrator initializes from `classEquipmentPicks` once.
- **`resolveCharacterInventory(c)` extends to honor the override**: applies the deltas (or reads the full list) on top of (or instead of) the class-pick derivation.
- **Mutation primitives** in a new `lib/character/inventory.ts` module: `addInventoryItem(c, kind, idOrName)`, `removeInventoryItem(c, idOrName)`. Pure functions returning a new `Character`.
- **The modal is a `Dialog` primitive** (matching existing patterns like `SpellCastPopover` and `WeaponAttackPopover`) opened by the rucksack icon. Catalog browsing uses the same `<Collapsible>` group-by-category pattern as the Weapons subsection.
- **The Equipment parchment's heading gets the rucksack icon as a tap target.** The icon is also available next to the Combat parchment's Weapons/Armor subsections so a player on the Combat tab can manage gear without scrolling away.
- **Migrator backfills the new field** for existing characters (empty deltas / inventory derived from picks).
- **Schema change → minor version bump** when shipped (additive — old saves still load via the migrator).

## Capabilities

### New Capabilities
<!-- none — extends companion-mode + the existing equipment catalog -->

### Modified Capabilities
- `companion-mode`: the live-play sheet gains a rucksack icon and an inventory-management modal so players can add / remove weapons, armor, and gear in-session.
- `character-creation`: the migrator backfills the new `inventoryOverrides` (or `inventory`) field on first load.

## Impact

- **`lib/character/types.ts`** — adds `inventoryOverrides: { added: string[]; removed: string[] }` (or full `inventory: InventoryItem[]`, decided in design.md) to `Character`. New `InventoryItem` shape if going full-inventory. Required field; migrator backfills.
- **`lib/storage/local.ts` (`migrateCharacter`)** — backfills the new field on first load. Idempotent; pre-Tier-2 characters get an empty delta or an inventory derived from their picks.
- **`lib/character/equipment.ts`** — `resolveCharacterInventory(c)` extends to apply overrides on top of (or in place of) the class-pick derivation. The existing tokenization stays.
- **`lib/character/inventory.ts`** (new) — pure-function mutators: `addInventoryItem`, `removeInventoryItem`. Mirrors the shape of `live-state.ts`.
- **`components/sheet/inventory-modal.tsx`** (new) — Dialog with three tabs (Weapons / Armor / Gear), a search input per tab, catalog list, and a current-inventory list with remove buttons.
- **`components/sheet/character-sheet.tsx`** — rucksack icon next to the Equipment parchment heading and inside the Combat parchment (near the Weapons / Armor subsections). Opens the modal. Modal mutations propagate via the existing `onChange` pipeline.
- **`components/sheet/printable-sheet.tsx`** — no change to the printable; it already renders the resolved inventory and will pick up the deltas automatically.
- **E2E coverage**: new `e2e/inventory-modal.spec.ts` covers (a) opening the modal via the rucksack icon, (b) adding a weapon and seeing it in the Combat → Weapons subsection, (c) removing the chain shirt and watching AC drop, (d) adding free-text gear and seeing it in Equipment, (e) round-tripping the new field through JSON export/import.
- **Schema migration**: additive field; no breaking change. Old saves load with empty deltas (or migrator-computed initial inventory). Eligible for a minor (`/minor`) version bump on release.
- **Suite size**: 91 → ~96 tests after the new spec lands.
