## ADDED Requirements

### Requirement: The wizard's abilities step SHALL fold origin sub-choice ASI into its displayed bonus

The "Final Ability Scores" card on `/builder/abilities` (`components/builder/abilities-step.tsx`) MUST include each origin sub-choice's `asi` map in the displayed bonus addend, summed with `origin.asi.fixed` and `originAsiAllocation`. The displayed total MUST equal `base + fixed + floating + subchoice` for every ability, matching the origin portion of what `computeFinalAbilities` produces on the sheet.

The displayed values MUST update reactively when the player navigates back to `/builder/origin` and switches the sub-choice — the abilities step on next visit MUST reflect the new sub-choice's ASI without a full page reload.

#### Scenario: Human → Ambrian sub-choice +1 INT surfaces on the abilities step

- **WHEN** a character with `originId: "human"`, `originSubchoiceId: "ambrian"`, and `originAsiAllocation: { cha: 1 }` is rendered on `/builder/abilities` with Standard Array bases (str:8, dex:10, con:12, int:13, wis:14, cha:15)
- **THEN** the STR cell shows `base 8 +2` and total 10 (origin fixed)
- **AND** the INT cell shows `base 13 +1` and total 14 (sub-choice ASI)
- **AND** the CHA cell shows `base 15 +1` and total 16 (floating)
- **AND** the DEX, CON, and WIS cells show no bonus addend on the base line

#### Scenario: Switching from Ambrian to Barbarian moves the sub-choice bonus

- **WHEN** the player has rendered the abilities step with `originSubchoiceId: "ambrian"` and the INT cell showing `+1`
- **AND** the player navigates back to `/builder/origin` and switches the sub-choice to Barbarian (`asi: { wis: 1 }`)
- **THEN** on returning to `/builder/abilities`, the INT cell no longer shows the `+1` addend
- **AND** the WIS cell now shows `base 14 +1` and total 15

#### Scenario: Origins without sub-choices are unaffected

- **WHEN** a character with an origin that has no `subchoices` (e.g. Abducted Human, Changeling, Dwarf, Elf) is rendered on the abilities step
- **THEN** the displayed bonus per ability equals `origin.asi.fixed[ab] + originAsiAllocation[ab]` exactly
- **AND** no sub-choice term is added

#### Scenario: Wizard preview agrees with the sheet's `computeFinalAbilities`

- **WHEN** any L1 character is rendered on `/builder/abilities` and then has its draft persisted and the sheet rendered
- **THEN** for every ability, `total` displayed on the abilities step (base + fixed + floating + sub-choice) equals the corresponding `computeFinalAbilities(c).total[ab]` minus any boon/burden bonus contributed by `c.boons` and `c.burdens` (which the abilities step does not display since boons and burdens are picked on a later step)
