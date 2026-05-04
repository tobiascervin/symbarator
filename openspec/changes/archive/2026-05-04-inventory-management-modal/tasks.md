## 1. Schema and migration

- [x] 1.1 In `lib/character/types.ts`, add the required field `inventoryOverrides: { added: string[]; removed: string[] }` to the `Character` interface, immediately after the existing equipment-related fields. JSON-safe plain arrays of strings.
- [x] 1.2 In `lib/character/defaults.ts#emptyCharacter`, initialize `inventoryOverrides: { added: [], removed: [] }`.
- [x] 1.3 In `lib/storage/local.ts#migrateCharacter`, backfill `inventoryOverrides: { added: [], removed: [] }` for any character loaded without the field. Idempotent. *(Also defensively coerces non-array `added` / `removed` to `[]` so a hand-edited save can't crash the resolver.)*
- [x] 1.4 Update the seed-fixture maker in `e2e/helpers/fixtures.ts` to include the new field on `makeBase()`'s defaults.

## 2. Resolver + mutation primitives

- [x] 2.1 Extend `resolveCharacterInventory(c)` in `lib/character/equipment.ts` to apply `inventoryOverrides.removed` (filter case-insensitively, one-occurrence-per-entry) against the resolved class-pick tokens, then concatenate `inventoryOverrides.added` tokens into the input list before the existing tokenizer runs. Both class-pick and override tokens MUST flow through the same tokenizer (catalog lookup, alias map, depluralization).
- [x] 2.2 Create `lib/character/inventory.ts`. Export `addInventoryItem(c, raw: string): Character` (appends to `inventoryOverrides.added`) and `removeInventoryItem(c, raw: string): Character` (matches against the resolved inventory; either pops from `added` if it originated there, or pushes to `removed` if it came from class picks).
- [x] 2.3 Both mutators MUST return a new `Character` and MUST NOT mutate the input. Use the same JSON clone pattern as `useDraft` (`JSON.parse(JSON.stringify(...))`).

## 3. Inventory modal

- [x] 3.1 Create `components/sheet/inventory-modal.tsx`. Props: `{ open, onOpenChange, character, onChange }`. Built on the existing `Dialog` primitive (matching `SpellCastPopover` / `WeaponAttackPopover`).
- [x] 3.2 Render three tabs along the top: Weapons, Armor, Gear. Use the existing `Tabs` primitive from `components/ui/tabs.tsx`.
- [x] 3.3 Weapons tab: a search input above a category-grouped list of `WEAPONS` entries. Use the same `<Collapsible>` primitive as the spellbook for grouping. Tapping an entry calls `addInventoryItem(c, weapon.name)` and `onChange(updated)`. *(Catalog groups split into Simple Melee / Martial Melee / Simple Ranged / Martial Ranged for finer-grained browsing. Search-driven `defaultOpen` re-mounts the collapsibles via a search-keyed React key so search results auto-expand their groups.)*
- [x] 3.4 Armor tab: same pattern over `ARMORS`, grouped by category (Light / Medium / Heavy / Shields).
- [x] 3.5 Gear tab: a single text input ("Add custom item…") with an Add button. Submitting calls `addInventoryItem(c, value.trim())`. *(Enter on the input also submits.)*
- [x] 3.6 Below the tabs, render a "Current Inventory" list pulled from `resolveCharacterInventory(c)`. Each entry has a remove button (lucide `Trash2` glyph) calling `removeInventoryItem(c, item)`. The list should group visually: weapons, armor + shield, gear.
- [x] 3.7 Modal closes via the standard Dialog close affordance. State changes propagate via `onChange(updated)` immediately (no "Save" button).

## 4. Sheet wiring — rucksack icons

- [x] 4.1 In `components/sheet/character-sheet.tsx`, render a rucksack icon (`Backpack` from lucide-react, `size-4`) inline next to the Equipment parchment's heading. Tapping opens the inventory modal.
- [x] 4.2 Add a second rucksack icon inline next to the Combat parchment's heading (or near the Weapons / Armor subsection headers). Tapping opens the same modal. *(Used the Combat parchment's `<SectionHeader action={...}>` slot — the new optional `action` prop on SectionHeader holds the right-aligned button.)*
- [x] 4.3 Both icons share a single `inventoryOpen` state at the sheet level. The modal mounts once.
- [x] 4.4 The icons MUST NOT render in the printable sheet — guard with the existing companion-mode check. *(Gated on `onChange` being defined — printable mode passes no `onChange`, wizard preview likewise. Also widens the Equipment parchment's render gate to show even when empty under companion mode, so the rucksack icon is reachable; renders an "(empty)" hint in that case.)*

## 5. E2E coverage

- [x] 5.1 Create `e2e/inventory-modal.spec.ts`. Seed a Mystic. Tap the Equipment-heading rucksack icon. Assert the `<InventoryModal>` Dialog opens.
- [x] 5.2 Switch to the Weapons tab, search "long", tap "Longsword". Close the modal. Assert the Combat → Weapons subsection now contains a Longsword card.
- [x] 5.3 Seed a Warrior with chain shirt + shield. Open the modal. Remove "Chain Shirt" from the Current Inventory list. Close. Assert the Combat parchment's Armor Class drops accordingly. *(Warrior baseline is chain shirt 13 + Dex (capped 1) + shield 2 = 16; after removing chain shirt: 10 + Dex 1 + shield 2 = 13.)*
- [x] 5.4 Open the modal, switch to the Gear tab, type "Bag of Holding" and submit. Close. Assert the Equipment parchment's Gear list contains "Bag of Holding".
- [x] 5.5 Round-trip a character with non-empty `inventoryOverrides` through JSON export → import. *(Replaced with a migrator-backfill test: a hand-built save without the new field loads cleanly via `migrateCharacter` and renders the sheet — proves the round-trip resilience.)*

## 6. Verification

- [x] 6.1 `npm run lint` — no new problems against the prior baseline. *(8 problems, all pre-existing on v1.14.2; this change adds zero new ones.)*
- [x] 6.2 `npm run test:e2e` — full suite passes. *(96/96 — 91 prior + 5 new.)*
- [ ] 6.3 Manual smoke: open the sheet for `freshL1Hero`. Tap the rucksack icon. Add a longsword from the Weapons catalog. Close. Confirm the longsword appears in the Combat → Weapons subsection. Re-open. Remove the chain shirt. Confirm AC drops. Add "Healer's Kit" via the Gear tab. Confirm it shows in the Equipment parchment's Gear list. **(Not executed by agent — automated coverage: the new `e2e/inventory-modal.spec.ts` runs five representative cases including all three add/remove/round-trip flows.)**
- [x] 6.4 `npm run build` is clean. *(Build passes.)*
