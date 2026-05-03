## 1. Schema & migration

- [x] 1.1 In `lib/character/types.ts`, add `BurdenBonus` discriminated union (`fixed` | `choose-one` | `choose-two`) and extend `BurdenDef` with optional `abilityBonus: BurdenBonus` and `startingCorruption?: number`.
- [x] 1.2 In `lib/character/types.ts`, add required `burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>` to `Character`.
- [x] 1.3 In `lib/character/defaults.ts`, default `burdenAbilityChoices` to `{}` in `emptyCharacter(id)`.
- [x] 1.4 In `lib/storage/local.ts`, update `migrateCharacter` to backfill `burdenAbilityChoices: {}` when missing or non-object. Keep idempotent.

## 2. Data — encode PG burden bonuses

- [x] 2.1 In `data/feats.ts`, add `abilityBonus` to all 16 burdens per the proposal:
  - **Fixed (11)**: Arch Enemy → CHA, Bestial → CON, Bloodthirst → STR, Code of Honor → WIS, Dark Secret → CHA, Elderly → WIS, Mystical Mark → CHA, Nightmares → CON, Sickly → WIS, Slow → WIS, Wanted → CHA (each `{ kind: "fixed", ability, amount: 2 }`).
  - **Choose-one (4)**: Addiction (`from` omitted = any of six), Impulsive (`from: ["str", "cha"]`), Seizures (`from: ["int", "wis"]`), Ward (`from: ["int", "cha"]`) (each `{ kind: "choose-one", from?, amount: 2 }`).
  - **Choose-two (1)**: Dark Blood `{ kind: "choose-two", amount: 1 }` plus `startingCorruption: 2`.
- [x] 2.2 Verify the burden description text (which already mentions the bonus in prose) doesn't visually conflict with the new badge — trim or rephrase if needed so the bonus isn't shown twice in a clumsy way.

## 3. Compute integration

- [x] 3.1 In `lib/character/compute.ts`, add a `burdenBonusesFor(c: Character): Record<Ability, number>` helper that mirrors `boonBonusesFor` and handles all three `kind`s.
- [x] 3.2 Update `computeFinalAbilities` so each ability's total adds the burden term: `(fixed[k] ?? 0) + (floating[k] ?? 0) + (subchoiceAsi[k] ?? 0) + boon[k] + burden[k]`.

## 4. Wizard validator

- [x] 4.1 In `lib/character/validation.ts`, in the `boons-burdens` step's switch arm, after the existing burden-id resolve check, add: for each picked burden whose `abilityBonus.kind === "choose-one"`, require `burdenAbilityChoices[id]` to have exactly 1 ability that's a member of `from` (or any of six if `from` is undefined).
- [x] 4.2 Add: for each picked burden whose `abilityBonus.kind === "choose-two"`, require `burdenAbilityChoices[id]` to have exactly 2 distinct abilities, each a member of `from` (or any of six if `from` is undefined).

## 5. Wizard picker UI

- [x] 5.1 In `components/builder/boons-burdens-step.tsx`, in the burden card rendering: when a burden has `abilityBonus`, show a Badge in the card header — `+2 CON`, `+2 (choose 1)` for unselected choose-one, `+1/+1 (choose 2)` for unselected choose-two, etc. (Use the burden's catalog data; for choice burdens, show the chosen ability/abilities once selected.)
- [x] 5.2 When a `choose-one` burden is selected, render an inline ability picker (mirroring the existing choice-boon picker pattern) constrained to `abilityBonus.from` (or `ABILITY_ORDER` when undefined). Clicking sets `burdenAbilityChoices[id] = [ab]`.
- [x] 5.3 When a `choose-two` burden is selected, render the same picker but in toggle-select mode. Clicking adds the ability to the array if not present (max 2); clicking the third ability replaces the oldest. Show "X of 2 chosen" hint text.
- [x] 5.4 When deselecting a choice-burden (clicking the active card to clear it), drop its entry from `burdenAbilityChoices` — same shape as the existing boon deselect cleanup.
- [x] 5.5 When a burden has `startingCorruption`, render a warning chip below the card body: e.g. "+2 permanent Corruption — track manually on the sheet's Corruption panel."

## 6. Sheet badge rendering

- [x] 6.1 In `components/sheet/character-sheet.tsx`, in the Burdens section's entry mapping, derive a `badges` array from each burden's `abilityBonus`:
  - `fixed` → one badge `+${amount} ${ABILITY_SHORT[ability]}`.
  - `choose-one` → one badge from `burdenAbilityChoices[id][0]` if present, else no badge.
  - `choose-two` → two badges from `burdenAbilityChoices[id][0]` and `[1]` if present, else no badges.
- [x] 6.2 Pass the `badges` into the existing `FeatCard` via the `FeatGroup` entry. No new component needed — reuses the boon badge plumbing already shipped in v1.6.0.

## 7. E2E test updates

- [x] 7.1 Update `e2e/helpers/fixtures.ts` `makeBase()` to include `burdenAbilityChoices: {}` in the defaults.
- [x] 7.2 Update existing `e2e/boons-burdens.spec.ts` "burden seeded directly is shown on the sheet" test to assert the bonus badge renders (e.g. `+2 CON` for Nightmares — wait, Nightmares is +2 CON, confirm and use that).
- [x] 7.3 Add an E2E covering a fixed-bonus burden raising the stat block: seed a character with `burdens: ["bestial"]` and the house rule on, navigate to the sheet, assert the CON cell shows `base + 2` total.
- [x] 7.4 Add an E2E covering a choose-one burden's wizard picker: seed a character with the house rule on, visit `/builder/boons-burdens`, click Impulsive, click Continue (expect validation toast), pick Strength via the inline picker, click Continue, assert URL advances and `burdenAbilityChoices.impulsive` is `["str"]`.
- [x] 7.5 Add an E2E covering Dark Blood's choose-two picker: seed a character with the house rule on, visit `/builder/boons-burdens`, click Dark Blood, expect the "+2 permanent Corruption — track manually" warning chip to be visible, pick STR and WIS via the inline picker, advance, assert `burdenAbilityChoices["dark-blood"]` equals `["str", "wis"]` and the sheet shows two badges plus +1 to each chosen ability.
- [x] 7.6 Add a migration E2E: seed a pre-1.7-shape raw save (no `burdenAbilityChoices` field) with `burdens: ["bestial"]`, load via `readMigratedCharacter`, assert `burdenAbilityChoices` is `{}` and `computeFinalAbilities`'s output (read indirectly via the sheet's CON cell value) reflects the +2.

## 8. Verification

- [x] 8.1 `npm run build` — clean (TypeScript strict passes; the new discriminated union doesn't break existing callers).
- [x] 8.2 `npm run test:e2e` — all passing.
- [x] 8.3 Manual smoke: forge a hero with the house rule on, take Bestial, confirm CON jumps by 2 on the abilities-step "Final Ability Scores" panel and on the sheet. Repeat with Dark Blood (pick two abilities), confirm both bump by 1 and the warning chip appears. Repeat with Impulsive (pick one), confirm the bump.
- [x] 8.4 `npx openspec validate "wire-burden-ability-bonuses" --strict` — clean.
