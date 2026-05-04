## Context

Tier 1 left the inventory render-time-derived from `classEquipmentPicks`. That works for character creation but can't represent post-creation changes:

- **Add**: the GM hands the player a `+1 longsword`, or they buy a healer's kit, or they pick up a fallen Templar's shield.
- **Remove**: their chain shirt rusts during a swamp adventure, they sell a weapon, the GM confiscates a cursed item.
- **Custom**: a magic item that isn't in the PG catalog (custom GM creation, future content pack).

The data shape the inventory takes drives the modal's complexity. Today's catalog has lookup helpers (`WEAPON_BY_NAME`, `ARMOR_BY_NAME`) and `resolveCharacterInventory` returns a structured `{ weapons, armor, shield, other }`. Whatever shape we pick must round-trip cleanly through `JSON.stringify` + `JSON.parse` (the share/import flow) and through the storage migrator.

## Goals / Non-Goals

**Goals:**
- A player can add and remove weapons, armor, and gear from companion mode without leaving the sheet.
- Mutations persist through `localStorage` and JSON export/import.
- The catalog stays the source of truth for mechanical fields (damage, AC, properties) — the player's inventory is just a list of *which* catalog items they have plus any free-text additions.
- Existing characters automatically work with empty deltas (or a migrator-derived initial inventory). No save breaks.

**Non-Goals:**
- Encumbrance / weight tracking. Deferred — the catalog has weight data; UI surfacing is Tier 3.
- Currency / cost mechanics. Players track money manually for v1.
- Attunement slots, magic item rules.
- Equipped slots ("which weapon is in the main hand"). Today every weapon in inventory is a tap target; the player picks at attack time. Equipped slots stay Tier 3.
- Multi-quantity items (2× healing potion, 47 arrows). v1 stores each item as a single line; ammunition stays as free-text "20 arrows" gear tokens.
- Modifying `classEquipmentPicks` retroactively. Initial picks stay frozen — additions and removals layer on top via the new field.

## Decisions

### Decision: delta shape (`added` / `removed`) over full `inventory: InventoryItem[]`

Two ways to model this:

| | **Delta** (`{ added: string[]; removed: string[] }`) | **Full** (`inventory: InventoryItem[]`) |
|---|---|---|
| Migrator | Initialize empty (zero work) | Resolve `classEquipmentPicks` → seed inventory |
| Render | `picks - removed + added` (small extra step) | Read `inventory` directly |
| Round-trip share | Smaller payload | Larger payload |
| "What did I start with?" | Always derivable from `classEquipmentPicks` | Lost after first edit |
| Edit | Two list ops (push to `added` or `removed`) | One list op |

**Pick: delta shape.** Reasons: (1) zero migration cost (just an `inventoryOverrides: { added: [], removed: [] }` backfill), (2) preserves the original character-creation picks for archeology, (3) the share-link payload stays small, (4) the implementation matches existing migrator patterns (`featureUses: {}`, `boonAbilityChoices: {}`).

The downside — `picks - removed + added` at render time — is a small loop in `resolveCharacterInventory`, easy to test. The shape can graduate to a full inventory in a Tier 3 change if encumbrance / quantity tracking demands it.

### Decision: `added` and `removed` are arrays of free-text strings, not catalog ids

A player might add `"+1 longsword"`, `"Bag of Holding"`, or `"Old Master's Pipe"` — items the catalog doesn't recognize. The render-time tokenizer in `resolveCharacterInventory` already handles unknown tokens (they fall into `other: string[]`), so storing strings keeps the shape uniform and lets the same tokenizer work for both class picks and player-added items.

For "add a longsword from the catalog" the modal stores the literal `"Longsword"` (the catalog name); the tokenizer matches it. For a free-text item, the modal stores whatever the player typed; the tokenizer fails the lookup and routes it to `other`.

`removed` works against tokens too: matching a string against the resolved-from-picks tokens removes the first occurrence. This handles "I had two daggers and lost one" by storing one removal.

**Alternative considered:** structured items with `{ kind: "weapon" | "armor" | "gear"; id?: string; name: string }`. Rejected — adds nothing the tokenizer can't already determine, and bloats the payload.

### Decision: modal layout — three tabs (Weapons / Armor / Gear), search-and-pick UI

The modal is a `Dialog` primitive (matching `SpellCastPopover` / `WeaponAttackPopover` / `LevelUpDialog`). Three tabs along the top:

1. **Weapons** — search input + catalog list grouped by category (Melee / Ranged / Alchemical / Siege). Tapping a catalog entry adds it (writes to `inventoryOverrides.added`).
2. **Armor** — search input + catalog list grouped by category (Light / Medium / Heavy / Shields).
3. **Gear** — free-text input ("Add custom item…") that pushes to `added` as-is.

Below the tabs, a "Current Inventory" list shows everything the resolved inventory contains, with a remove button next to each item. Removing a class-pick item adds it to `removed`; removing an `added` item simply pops it from the array. Removing a removed item undoes the removal.

The modal closes via the standard Dialog close affordance; mutations propagate via the existing `onChange(updated)` pipeline.

### Decision: rucksack icon placement

The user's request: a rucksack icon "in the equipment section" that opens the modal. The natural placement:

- **Primary** — next to the Equipment parchment heading, since that's the player's mental model for "manage my stuff."
- **Secondary** — next to the Combat parchment's Weapons / Armor subsection headers, so a player who's mid-combat-tab doesn't have to scroll away.

Both icons open the same modal. The icon is `lucide-react`'s `Backpack` glyph, sized `size-4`, placed inline with the heading text.

### Decision: modal scope respects the catalog's PG p. 162–171 entries only

The modal's catalog browsing surfaces only items from `WEAPONS` and `ARMORS`. Future content packs can extend the catalog and the modal automatically picks them up. The "Gear" tab takes free-text since adventuring packs / consumables aren't structured.

**Alternative considered:** include `ADVENTURING_PACKS` strings in the modal as picker entries. Rejected — they're already covered by class equipment lines; the gear field handles the long tail.

## Risks / Trade-offs

- [Risk] A player removes their starting chain shirt and forgets they had it. → **Mitigation**: the "Current Inventory" list shows the live state with both `removed: false` and `added: true` items, so the player sees what's actually present. The picks themselves stay in `classEquipmentPicks` so a "Reset Inventory" affordance can restore them in a future change if needed.
- [Risk] Two characters with identical names but different states (one picked chain mail at creation; the other added it post-creation) produce different render paths — could mask bugs in the tokenizer. → **Mitigation**: E2E tests cover both — adding a chain shirt to a Mystic should produce the same AC as a Warrior who picked it. If not, the tokenizer is wrong.
- [Risk] Free-text additions ("+1 longsword") don't pick up the catalog's mechanical bonuses. → **Mitigation**: documented limitation in v1; magic-item modeling stays a Tier 3 concern. The free-text item appears in the Equipment / Gear list with no attack-popover affordance.
- [Risk] The `inventoryOverrides` shape diverges from a future `inventory: InventoryItem[]` if encumbrance lands. → **Mitigation**: a future migration translates `picks + overrides` to a single `inventory` list and drops `inventoryOverrides`. Strictly additive change, additive migrator, same v1 ergonomics.
- [Trade-off] Two paths into the data (class picks + overrides) makes "what does this character have?" require running the resolver. The benefit is preserving the creation-time history.

## Migration Plan

Schema change is additive. Steps:

1. Extend `Character` with `inventoryOverrides: { added: string[]; removed: string[] }`. Required field with default `{ added: [], removed: [] }`.
2. Update `migrateCharacter` to backfill the field on first load. Idempotent.
3. Update `emptyCharacter(id)` to initialize the field.
4. Extend `resolveCharacterInventory(c)` to apply `removed` (filter from class-pick tokens) then concatenate `added` tokens to the input list before the tokenizer runs.
5. Add `lib/character/inventory.ts` with `addInventoryItem(c, raw: string)` and `removeInventoryItem(c, raw: string)`. Pure functions; both use string identity (case-insensitive) to match catalog items.
6. Build the modal component and wire the rucksack icons.
7. E2E tests covering add-weapon-and-see-it-on-sheet, remove-armor-and-watch-AC-drop, add-gear-and-see-it-in-Equipment, JSON export/import round-trip with non-empty overrides.
8. Manual smoke for the three tabs and the rucksack icon placements.

Rollback: revert the file edits. Saved characters with `inventoryOverrides` present continue to load (the field gets ignored by older builds; revisiting Tier 1 just shows the class-pick-derived inventory).

## Open Questions

- **Should the modal show the catalog item's mechanical preview before adding?** (e.g., hovering "Longsword" surfaces "1d8 slashing, versatile (1d10), ...") Default no for v1 — the player can tap the weapon card afterwards to see the full popover. If users miss the affordance during pick, add it later.
- **Should the rucksack icon appear inside the Combat parchment's Weapons subsection too, or only at the Equipment heading?** Default: both. Two icons opening the same modal is cheap, and the Combat-tab placement matches "I'm playing combat and want to drop a weapon."
- **Should "remove" be confirm-prompted?** Default no. Removals are reversible (delete the entry from `removed` to restore). A confirm prompt adds friction for a common action.
- **Should the character sheet expose an "Undo last inventory change" button?** Tempting but adds state and complexity. Skip for v1; Tier 3 can add a small history if requested.
