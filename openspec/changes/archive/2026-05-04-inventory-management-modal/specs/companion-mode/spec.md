## ADDED Requirements

### Requirement: `Character` SHALL carry `inventoryOverrides` for post-creation inventory changes

`Character.inventoryOverrides: { added: string[]; removed: string[] }` MUST be a required field on the `Character` interface, defaulting to `{ added: [], removed: [] }` for new characters created via `emptyCharacter(id)`. The field MUST be JSON-safe (plain arrays of strings) so it round-trips through export / import unchanged.

`migrateCharacter` MUST backfill the field with `{ added: [], removed: [] }` for any character loaded from storage that lacks it. The migration MUST be idempotent.

#### Scenario: New character has empty overrides

- **WHEN** `emptyCharacter(id)` is called
- **THEN** the returned character's `inventoryOverrides` is `{ added: [], removed: [] }`

#### Scenario: Pre-Tier-2 saves get backfilled

- **WHEN** a character JSON without `inventoryOverrides` is loaded
- **THEN** `migrateCharacter` returns a character whose `inventoryOverrides` is `{ added: [], removed: [] }`
- **AND** the character renders on the sheet without errors

#### Scenario: Exported JSON includes the field

- **WHEN** a character with `inventoryOverrides: { added: ["Longsword"], removed: ["Chain Shirt"] }` is exported via the home-page Export JSON action
- **THEN** the exported JSON contains the `inventoryOverrides` object verbatim
- **AND** importing that JSON on another browser reproduces the same overrides

### Requirement: `resolveCharacterInventory(c)` SHALL honor `inventoryOverrides`

`lib/character/equipment.ts`'s `resolveCharacterInventory(c)` MUST apply `inventoryOverrides.removed` against the resolved class-pick tokens (filter, case-insensitive matching one occurrence per entry) and concatenate `inventoryOverrides.added` tokens before tokenization. The same tokenizer (catalog lookup, alias map, depluralization) MUST run over both class-pick and override tokens, so catalog matches go to `weapons` / `armor` / `shield` and free-text additions land in `other`.

#### Scenario: Adding a longsword surfaces it in the Weapons subsection

- **WHEN** a Mystic with `classEquipmentPicks` resolving to a quarterstaff has `inventoryOverrides.added: ["Longsword"]`
- **THEN** `resolveCharacterInventory(c).weapons` contains both the quarterstaff and the longsword catalog entries

#### Scenario: Removing the chain shirt drops AC

- **WHEN** a Warrior with `classEquipmentPicks` resolving to a chain shirt + shield has `inventoryOverrides.removed: ["Chain Shirt"]`
- **THEN** `resolveCharacterInventory(c).armor` is empty (the shield stays in `inventory.shield`)
- **AND** `computeAC(c).ac` reflects the unarmored formula plus the shield bonus

#### Scenario: Free-text gear lands in `other`

- **WHEN** a character has `inventoryOverrides.added: ["Bag of Holding"]`
- **THEN** `resolveCharacterInventory(c).other` contains the string `"Bag of Holding"`
- **AND** the Equipment parchment renders it as a bullet under the Gear list

### Requirement: Mutation primitives SHALL expose add and remove operations

`lib/character/inventory.ts` MUST export two pure functions: `addInventoryItem(c: Character, item: string): Character` (appends to `inventoryOverrides.added`) and `removeInventoryItem(c: Character, item: string): Character` (matches against the resolved inventory and either pops from `added` or pushes to `removed` depending on the source). Both MUST return a new `Character` and MUST NOT mutate the input.

#### Scenario: Adding an item appends to `added`

- **WHEN** `addInventoryItem(c, "Longsword")` is called on a Mystic
- **THEN** the returned character's `inventoryOverrides.added` includes `"Longsword"`
- **AND** the original character's `inventoryOverrides.added` is unchanged

#### Scenario: Removing an `added` item pops it from `added`

- **WHEN** the player added a longsword (`inventoryOverrides.added: ["Longsword"]`) and then removes it
- **THEN** the returned character's `inventoryOverrides.added` is `[]`
- **AND** `inventoryOverrides.removed` is unchanged (the longsword was never in the class picks)

#### Scenario: Removing a class-pick item pushes it to `removed`

- **WHEN** the player removes the chain shirt that came from their class picks
- **THEN** the returned character's `inventoryOverrides.removed` includes `"Chain Shirt"`
- **AND** `resolveCharacterInventory` no longer surfaces the chain shirt

### Requirement: A rucksack icon SHALL open the inventory-management modal

The character sheet (companion mode) MUST render a rucksack icon (`lucide-react`'s `Backpack` glyph) next to the Equipment parchment's heading and inside the Combat parchment near the Weapons / Armor subsection headers. Both icons MUST open the same `<InventoryModal>` Dialog. The modal MUST close via the standard Dialog close affordance, and mutations MUST propagate via the existing `onChange(updated)` pipeline (same path as the spell-cast / level-up flows).

The icons MUST NOT render in the printable sheet — that surface stays read-only.

#### Scenario: Tapping the Equipment rucksack opens the modal

- **WHEN** the player taps the rucksack icon next to the Equipment parchment heading
- **THEN** the `<InventoryModal>` Dialog opens
- **AND** closing the Dialog returns the player to the sheet

#### Scenario: Tapping the Combat-section rucksack opens the same modal

- **WHEN** the player taps the rucksack icon inside the Combat parchment
- **THEN** the same `<InventoryModal>` Dialog opens
- **AND** mutations applied are visible on the sheet on close

#### Scenario: The printable sheet has no rucksack icon

- **WHEN** the printable sheet is rendered
- **THEN** no rucksack icon is present
- **AND** the printable sheet's Equipment table renders the resolved inventory (including any overrides) but is non-interactive

### Requirement: The modal SHALL surface Weapons, Armor, and Gear tabs plus a current-inventory list

The `<InventoryModal>` MUST render three tabs along the top: Weapons, Armor, Gear. The Weapons tab MUST list the catalog entries from `WEAPONS` grouped by category (Melee / Ranged / Alchemical / Siege) with a search input. The Armor tab MUST list the catalog entries from `ARMORS` grouped by category (Light / Medium / Heavy / Shields) with a search input. The Gear tab MUST surface a free-text input ("Add custom item…") that pushes the typed value to `inventoryOverrides.added` on submit.

Below the tabs, a "Current Inventory" list MUST show every item the resolved inventory currently contains, with a remove button next to each entry. Tapping the remove button MUST call `removeInventoryItem(c, item)` and propagate the new character via `onChange`.

#### Scenario: Adding a weapon from the catalog

- **WHEN** the player opens the modal, switches to the Weapons tab, taps "Longsword" in the catalog list
- **THEN** `inventoryOverrides.added` gains `"Longsword"`
- **AND** the "Current Inventory" list updates to show the longsword
- **AND** closing the modal reveals the longsword card under the Combat → Weapons subsection on the sheet

#### Scenario: Adding free-text gear via the Gear tab

- **WHEN** the player opens the modal, switches to the Gear tab, types "Bag of Holding" and submits
- **THEN** `inventoryOverrides.added` gains `"Bag of Holding"`
- **AND** the Equipment parchment's Gear list contains the new entry on close

#### Scenario: Removing the chain shirt drops AC live

- **WHEN** the player opens the modal and taps the remove button next to "Chain Shirt" in the Current Inventory list
- **THEN** `inventoryOverrides.removed` gains `"Chain Shirt"`
- **AND** the Combat parchment's Armor Class value drops accordingly on close

#### Scenario: Search filters the catalog list within a tab

- **WHEN** the player types "long" in the Weapons tab's search input
- **THEN** the catalog list narrows to entries whose name contains "long" (case-insensitive — Longsword, Longbow, Long Hammer)
