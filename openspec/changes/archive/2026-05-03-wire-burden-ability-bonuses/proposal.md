## Why

Burdens grant a `+2` ability bonus (or `+1/+1` for Dark Blood) in the PG — taking a burden is a deliberate trade: a roleplay disadvantage in exchange for a stat bump. Today the bonus exists only as descriptive text in `data/feats.ts`; `BurdenDef` has no `abilityBonus` field and `computeFinalAbilities` doesn't add anything for burdens. The asymmetry with boons is the point: a player picks Bestial expecting `+2 CON` on their stat block and instead the sheet shows their base score unchanged. With the L1 Boons & Burdens flow now opt-in (v1.6.0) the trade-off is explicit, so the missing mechanics are the natural next step.

## What Changes

- Extend `BurdenDef` with an optional `abilityBonus` field describing one of three shapes: `fixed` (`+2` to a single named ability), `choose-one` (`+2` to one ability the player picks from a list, or any of six), or `choose-two` (`+1` each to two distinct abilities the player picks). Optionally `startingCorruption` (number) for Dark Blood's `+2` permanent Corruption.
- Add `Character.burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>` so choice-burdens persist the player's selection (`["str"]` for a single pick, `["str", "wis"]` for Dark Blood). Fixed burdens have no entry.
- Update `computeFinalAbilities` to fold burden bonuses into the final ability totals, alongside origin / floating ASI / subchoice ASI / boon bonuses.
- Update the boons-burdens wizard step to: show each burden's bonus as a badge (`+2 CON`, `+1/+1`, etc.), surface an inline ability picker when a choice-burden is selected, and require the picker to be satisfied before Continue. For burdens with `startingCorruption`, surface a warning chip explaining the player must adjust permanent Corruption manually.
- Update the sheet's Burdens section so each burden card displays its bonus as a badge, mirroring how boons render their `+1 ABL` badges.
- Encode the canonical 16 burdens with their PG-accurate bonuses:
  - **Fixed (11)**: Arch Enemy `+2 CHA`, Bestial `+2 CON`, Bloodthirst `+2 STR`, Code of Honor `+2 WIS`, Dark Secret `+2 CHA`, Elderly `+2 WIS`, Mystical Mark `+2 CHA`, Nightmares `+2 CON`, Sickly `+2 WIS`, Slow `+2 WIS`, Wanted `+2 CHA`.
  - **Choose-one (4)**: Addiction `+2 to one of any` (drug-driven flavor; player picks the ability), Impulsive `+2 STR or CHA`, Seizures `+2 INT or WIS`, Ward `+2 INT or CHA`.
  - **Choose-two (1)**: Dark Blood `+1 to two different abilities of choice` + `startingCorruption: 2`.
- The migrator backfills `burdenAbilityChoices: {}` for any saved character missing the field.
- Validation rejects advance when a choice-burden is selected without a satisfied pick (1 or 2 distinct abilities depending on `kind`) — same shape as the existing choice-boon validation arm.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `character-creation`: extend the burden picker to show ability bonuses, surface choice-burden ability pickers, validate picks, persist choices in a new `burdenAbilityChoices` field, and flow the bonuses through `computeFinalAbilities` so they raise the final ability totals on the sheet.

## Impact

- **Schema**: `BurdenDef` gains optional `abilityBonus` and `startingCorruption` fields. `Character` gains a required `burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>` field, defaulting to `{}` and backfilled by `migrateCharacter`.
- **Compute**: `lib/character/compute.ts` — `computeFinalAbilities` adds a `burdenBonusesFor(c)` step in parallel to `boonBonusesFor(c)`.
- **Wizard**: `components/builder/boons-burdens-step.tsx` — burden cards gain a bonus badge and (for choice burdens) an inline ability picker. `lib/character/validation.ts` — the `boons-burdens` step's validator gains a per-burden choice-pick check.
- **Sheet**: `components/sheet/character-sheet.tsx` — Burdens section maps each id to a `FeatCard` with a `+2 ABL` (or `+1 ABL · +1 ABL`) badge using the existing badge rendering primitive.
- **Data**: `data/feats.ts` — each of the 16 burdens gains its `abilityBonus` (and Dark Blood gains `startingCorruption: 2`). The bonus information stays in the description text too for readability — matching the boon convention.
- **Tests**: E2E coverage for choice-burden picker validation, fixed-burden bonus showing on sheet stat block, Dark Blood two-ability picker, migrator backfill of `burdenAbilityChoices`. Unit-style asserts on `computeFinalAbilities` behavior live inside the E2E (since there's no Vitest in the project).
- **Out of scope**: Auto-applying Dark Blood's `+2` permanent Corruption to `Character.corruption.permanent`. The wizard surfaces a warning; the player adjusts manually via the existing Corruption panel. Wiring the side effect cleanly requires reasoning about pick/unpick mutations on a player-mutable field (they may have already adjusted corruption in play between picking and unpicking) and is best deferred to a follow-up if it proves needed.
