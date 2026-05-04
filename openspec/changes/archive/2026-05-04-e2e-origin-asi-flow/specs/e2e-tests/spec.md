## ADDED Requirements

### Requirement: The suite SHALL cover origin ASI propagation through the wizard

`e2e/origin-asi.spec.ts` MUST drive the live builder (no LocalStorage seed) from `/builder/origin` through `/builder/abilities` and assert that origin ability score bonuses — fixed, floating, and sub-choice — are reflected in the abilities step's "Final Ability Scores" display. The spec MUST cover at least: an origin with fixed bonuses plus a floating allocation, an origin with a sub-choice that contributes its own ASI, and the floating-allocation gate that blocks advancement when not fully allocated.

#### Scenario: Fixed bonuses and floating allocation surface on the abilities step
- **WHEN** the player picks Abducted Human (fixed `{dex: 1, wis: 1}`, 1×+2 floating), allocates the +2 floating to STR, advances to `/builder/abilities`, and lands on the Standard Array tab
- **THEN** the STR card shows base 8 with a "+2" bonus and total 10
- **AND** the DEX card shows base 10 with a "+1" bonus and total 11
- **AND** the WIS card shows base 14 with a "+1" bonus and total 15
- **AND** the INT and CHA cards show no bonus addend

#### Scenario: Sub-choice ASI updates the abilities-step display when toggled
- **WHEN** the player picks Human (fixed `{str: 2}`, 1×+1 floating), selects the Ambrian sub-choice (sub-choice ASI `{int: 1}`), allocates the +1 floating to CHA, and advances to `/builder/abilities`
- **THEN** the STR card shows base 8 with a "+2" bonus, the INT card shows base 13 with a "+1" bonus, and the CHA card shows base 15 with a "+1" bonus
- **AND** when the player navigates back to `/builder/origin` and switches the sub-choice to Barbarian (sub-choice ASI `{wis: 1}`), the INT bonus is gone on the abilities step and the WIS card shows base 14 with a "+1" bonus

#### Scenario: Floating-allocation gate blocks advance until fully allocated
- **WHEN** the player picks Abducted Human and clicks Continue without allocating the floating bonus
- **THEN** the URL does not advance past `/builder/origin` and a toast message reflects the remaining-allocation validator
- **AND** after allocating the +2 to any eligible ability, Continue advances the URL to `/builder/background`
