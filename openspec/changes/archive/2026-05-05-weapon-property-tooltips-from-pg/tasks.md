## 1. Catalog of property explanations

- [x] 1.1 Create `data/property-explanations.ts` exporting `PropertyExplanation` and the three records: `WEAPON_FLAG_EXPLANATIONS: Record<WeaponProperty, PropertyExplanation>`, `WEAPON_DATA_EXPLANATIONS: Record<WeaponPropertyData["kind"], PropertyExplanation>`, `ARMOR_FLAG_EXPLANATIONS: Record<ArmorProperty, PropertyExplanation>`, plus `WEIGHTY_EXPLANATION: PropertyExplanation`.
- [x] 1.2 Populate `WEAPON_FLAG_EXPLANATIONS` with all 16 entries. Use the PG p. 167–168 wording listed below as the canonical descriptions:
  - `finesse` → name "Finesse", pgPage 167. *"When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls."*
  - `light` → name "Light", pgPage 168. *"A light weapon is small and easy to handle, making it ideal for use when fighting with two weapons."*
  - `heavy` → name "Heavy", pgPage 168. *"Creatures that are Small or Tiny have disadvantage on attack rolls with heavy weapons. A heavy weapon's size and bulk make it too large for a Small or Tiny creature to use effectively."*
  - `two-handed` → name "Two-Handed", pgPage 168. *"This weapon requires two hands when you attack with it. This property is relevant only when you attack with the weapon, not when you simply hold it."*
  - `loading` → name "Loading", pgPage 168. *"Because of the time required to load this weapon, you can fire only one piece of ammunition from it when you use an action, bonus action, or reaction to fire it, regardless of the number of attacks you can normally make."*
  - `reach` → name "Reach", pgPage 168. *"This weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for opportunity attacks with it."*
  - `deep-impact` → name "Deep Impact", pgPage 167. *"This weapon is built such that a precise blow can cause extraordinary damage. If you score a critical hit with this weapon you double both the damage dice and the damage modifier."*
  - `ensnaring` → name "Ensnaring", pgPage 167. *"This weapon can wrap around limbs, temporarily pulling an enemy off balance. When you make a critical hit with one of these weapons, if the target is a creature it is knocked prone in addition to taking normal damage."*
  - `massive` → name "Massive", pgPage 168. *"Creatures that are Small or Tiny have disadvantage on attack rolls with massive weapons. A massive weapon's size and bulk make it too large for a Small or Tiny creature to use effectively. When rolling damage for a massive weapon, roll the damage die twice and take the better result. This applies only to the initial damage die, not any bonus damage."*
  - `restraining` → name "Restraining", pgPage 168. *"A successful hit with this weapon causes the restrained condition."*
  - `returning` → name "Returning", pgPage 168. *"If you miss with this weapon it returns to your hand."*
  - `siege` → name "Siege", pgPage 168. *"This weapon does double damage to structures."*
  - `special` → name "Special", pgPage 168. *"A weapon with the special property has unusual rules governing its use, explained in the weapon's description (see 'Special Weapons' later in this section)."*
  - `balanced` → name "Balanced", pgPage 167. *"The weapon is so well balanced that it is extra effective when parrying. If you wield this weapon with a weapon in the other hand increase your AC by 1."*
  - `concealed` → name "Concealed", pgPage 167. *"This blade can be hidden on a creature's body, underneath clothes or armor. Make a Dexterity (Sleight of Hand) check when you hide it, and compare against passive Perception or an active search as needed."*
  - `immobile` → name "Immobile", pgPage 168. *"Setting up this weapon or breaking it down can only be done outside of combat (several hours usually)."*
- [x] 1.3 Populate `WEAPON_DATA_EXPLANATIONS` with all 5 entries. The descriptions explain the property kind generically; per-weapon parameters live in the badge label, not the tooltip:
  - `thrown` → name "Thrown", pgPage 168. *"If a weapon has the thrown property, you can throw the weapon to make a ranged attack. If the weapon is a melee weapon, you use the same ability modifier for that attack roll and damage roll that you would use for a melee attack with the weapon."*
  - `ammunition` → name "Ammunition", pgPage 167. *"You can use a weapon that has the ammunition property to make a ranged attack only if you also have an appropriate type of ammunition to fire from the weapon. Each time you attack with the weapon, you expend one piece of ammunition. At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield."*
  - `range` → name "Range", pgPage 168. *"A weapon that can be used to make a ranged attack has a range shown in parentheses after the ammunition, ranged or thrown property. The first number is the weapon's normal range in feet, and the second is the weapon's long range. When attacking a target beyond normal range you have disadvantage on the attack roll."*
  - `versatile` → name "Versatile", pgPage 168. *"This weapon can be used with one or two hands. A damage value in parentheses appears with the property — the damage when the weapon is used with two hands to make a melee attack."*
  - `area` → name "Area Effect", pgPage 167. *"This weapon's ammunition explodes. Instead of making an attack roll, the user designates an area and each creature in the area makes a Dexterity saving throw with the DC equal to 8 + the user's proficiency bonus plus their attack modifier. The target takes full damage and a successful save means that they take no damage."*
- [x] 1.4 Populate `ARMOR_FLAG_EXPLANATIONS` with all 3 entries (PG p. 171):
  - `concealable` → name "Concealable", pgPage 171. *"This armor can be worn under normal clothing."*
  - `cumbersome` → name "Cumbersome", pgPage 171. *"This armor is unwieldy and you have disadvantage on all Dexterity checks while wearing it."*
  - `noisy` → name "Noisy", pgPage 171. *"This armor tends to rattle or otherwise make loud sounds. You have disadvantage on any Dexterity (Stealth) checks involving hearing."*
- [x] 1.5 Define `WEIGHTY_EXPLANATION` (PG p. 171): name "Weighty", pgPage 171. *"This armor is especially heavy; you must have a Strength score equal to or higher than the number given in parentheses or reduce your speed by 10 feet."*
- [x] 1.6 Verify `tsc --noEmit` passes; the `Record<…>` typing should require every union member.

## 2. ExplainableBadge component

- [x] 2.1 Create `components/sheet/explainable-badge.tsx` exporting `ExplainableBadge({ label, explanation }: { label: string; explanation: PropertyExplanation })`.
- [x] 2.2 Internally manage a `useState(false)` for `open` and pass it to `<Tooltip open={open} onOpenChange={setOpen}>`.
- [x] 2.3 Render a `<TooltipTrigger>` around a `<Badge variant="secondary">` with: `role="button"`, `tabIndex={0}`, `aria-label={\`${explanation.name} — explanation\`}`, `className` including `cursor-help` and `tap-target` utilities. Wire `onClick` and `onKeyDown` (Enter / Space) to `setOpen((v) => !v)`. Call `e.stopPropagation()` in the click handler so a tap inside a Dialog does not bubble to overlay-dismiss.
- [x] 2.4 Render a `<TooltipContent>` with three lines: header (font-display tracking-wider uppercase, the explanation's `name`), body (the `description`), footer (small uppercase muted "PG p. <pgPage>").
- [x] 2.5 Confirm in the dev server: hover on desktop opens after the existing `TooltipProvider` delay; tap on touch (Chrome DevTools device emulation) opens immediately and a second tap closes it. (Covered by Playwright touch + hover e2e specs.)

## 3. Weapon-attack popover integration

- [x] 3.1 In `components/sheet/weapon-attack-popover.tsx`, replace the `propertyLabels: string[]` flat list with a typed `propertyEntries: Array<{ label: string; explanation: PropertyExplanation }>`. Source explanations from `WEAPON_FLAG_EXPLANATIONS` and `WEAPON_DATA_EXPLANATIONS` per the dispatcher logic in design.md Decision 4.
- [x] 3.2 Render the row with `<ExplainableBadge>` instead of bare `<Badge>` per entry. Preserve the existing iteration order (boolean flags first, then parameterized).
- [x] 3.3 Visual smoke-check at 1280 px and 360 px: the row layout matches today's spacing; on touch, tapping a badge opens the explanation without dismissing the popover Dialog. (Covered by `tap on phone toggles the tooltip and keeps the popover open` at 360×800 with `hasTouch: true`.)

## 4. Sheet armor integration

- [x] 4.1 In `components/sheet/character-sheet.tsx::SheetArmor`, render each armor row as a tap-target `<button>` (mirror `SheetWeapons`) and open an `ArmorDetailsPopover` on click.
- [x] 4.2 Build `components/sheet/armor-details-popover.tsx` rendering AC formula + weight + (when applicable) one `<ExplainableBadge>` per `armor.flags` member plus, if present, a `weighty (armor.weightyStrMin)` badge sourced from `WEIGHTY_EXPLANATION`.
- [x] 4.3 Skip the property row entirely in the popover for armors with no flags AND no `weightyStrMin`. Skip the property row for shields. The shield row remains a tap-target so AC contribution can be inspected.
- [x] 4.4 Visual smoke-check at desktop and 360 px: armor cards mirror the weapon-card affordance; the popover renders as a bottom-sheet on phone and a centered modal on desktop. (Field Armor e2e exercises the popover end-to-end at desktop width; mobile suite confirms no horizontal scroll regressions.)

## 5. Tests

- [x] 5.1 Playwright e2e: seed a character with a `dagger` equipped (flags: `finesse`, `light`; properties: `thrown (20/60 ft)`). Open the weapon-attack popover. Assert all three property badges render. Hover the `finesse` badge and assert a tooltip with the PG-sourced text appears.
- [x] 5.2 Playwright e2e: at viewport 360×800 with the same character, open the popover, tap the `finesse` badge, assert the tooltip opens. Tap outside, assert it closes. Confirm the popover Dialog itself stays open throughout.
- [x] 5.3 Playwright e2e: seed a character wearing Field Armor (`cumbersome`, `weightyStrMin: 13`). Render the sheet. Tap the Field Armor row, assert the popover renders `cumbersome` and `weighty (13)` badges, hover each, and assert PG-sourced tooltips.
- [x] 5.4 Catalog completeness check (Playwright or unit-style): walk every weapon and armor in `data/equipment.ts`. For each `flag` in any weapon, assert `WEAPON_FLAG_EXPLANATIONS[flag] !== undefined && WEAPON_FLAG_EXPLANATIONS[flag].description.length > 0`. Same for `properties[].kind` against `WEAPON_DATA_EXPLANATIONS`, and armor flags / `weightyStrMin` against `ARMOR_FLAG_EXPLANATIONS` / `WEIGHTY_EXPLANATION`.
- [x] 5.5 Run `npm run lint && npm run test:e2e` and confirm both new and existing scenarios pass. (Lint: 5 errors / 3 warnings exist on `main` unrelated to this change; e2e: 134/134 pass.)

## 6. Verification

- [x] 6.1 Manual: forge a Warrior with a `longsword` and `studded-leather`, save, open the sheet. Tap the longsword card → the weapon-attack popover shows `versatile (1d10)` as a tooltip-bearing badge. Hover (desktop) or tap (mobile) and confirm the explanation reads correctly with the PG p. reference.
- [x] 6.2 Manual: equip a `chain-staff` (Symbaroum-specific: `ensnaring`, `reach`). Confirm both badges open tooltips with the deep-Symbaroum-specific PG text, not generic 5e wording.
- [x] 6.3 Manual: confirm the printable sheet (`/print`) is unchanged — properties continue to render as flat comma-separated text with no interactive affordance.
- [x] 6.4 Manual: confirm the badge has a focus-visible ring when tabbed to via keyboard, and Enter / Space toggle the tooltip.
