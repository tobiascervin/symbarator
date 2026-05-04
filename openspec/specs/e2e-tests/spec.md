# e2e-tests Specification

## Purpose
TBD - created by archiving change add-playwright-tests. Update Purpose after archive.
## Requirements
### Requirement: The repo SHALL provide an `npm run test:e2e` script that runs the Playwright suite headlessly

A single command MUST start the suite, boot or reuse a Next dev server on a fixed port, run all `e2e/**/*.spec.ts` files headlessly against Chromium, and exit with a non-zero status on any failure. No manual server startup or `npx` invocation MUST be required.

#### Scenario: Single-command run
- **WHEN** a developer runs `npm run test:e2e` against a fresh checkout (after `npm install` and `npx playwright install chromium`)
- **THEN** the Playwright suite starts the dev server, runs every spec under `e2e/`, and exits 0 on success or non-zero on failure

#### Scenario: Tests are typed
- **WHEN** `npx tsc --noEmit` is run
- **THEN** all files under `e2e/` are included in type checking and produce no errors

### Requirement: The suite SHALL cover the L1 builder happy path end-to-end

`e2e/builder.spec.ts` MUST exercise every wizard step (origin → background → class → approach → abilities → skills-equipment → identity) without using any LocalStorage seeding, simulating a real player creating a character from scratch.

#### Scenario: Forge a hero through every step
- **WHEN** the builder spec runs
- **THEN** it navigates from `/`, clicks "Forge a New Hero", makes a valid pick at each of the 7 wizard steps, lands on `/characters/<id>`, and asserts the resulting sheet shows the expected origin/class/approach name and a level of 1

#### Scenario: Validation gates step advancement
- **WHEN** the builder spec attempts to advance a step before its required picks are made (e.g., no origin selected, missing skill picks)
- **THEN** the toast displays an error matching the validator output and the URL does not advance to the next step

### Requirement: The suite SHALL cover the level-up flow with seeded starting characters

`e2e/level-up.spec.ts` MUST start each test with a seeded character at a known level/class/approach so the dialog flow can be exercised without re-walking the wizard. Coverage MUST include: HP gain (average and manual), an ASI pick, a feat pick, a Changeling Change Self pick (origin gated), a `spells-learned` pick on a spellcasting approach, the duplicate-pick guard, and the L20 disable.

#### Scenario: Level up with average HP
- **WHEN** a seeded L1 Warrior is leveled to L2 with HP set to "average"
- **THEN** the persisted character has `level: 2`, `maxHp` increased by `floor(hitDie/2) + 1 + conMod`, and the sheet header reflects the new level without a hard reload

#### Scenario: Level up with manual HP roll
- **WHEN** a seeded character is leveled with HP mode "manual" and a value within bounds
- **THEN** the persisted `maxHp` reflects the manual value plus the prior `maxHp`

#### Scenario: ASI/feat slot offers Change Self only for Changeling
- **WHEN** a Changeling character reaches an ASI level
- **THEN** the ASI/feat step renders three options (ASI / Feat / Change Self)
- **AND** non-Changeling characters at the same level see only two options

#### Scenario: Spell pickers exclude already-known spells
- **WHEN** a seeded Templar at L1 (knowing Bless) levels to L2 and the spells-learned step renders
- **THEN** Bless does not appear in the new-spell pool

#### Scenario: Level Up button disabled at L20
- **WHEN** a character with `level: 20` is viewed on the sheet
- **THEN** the Level Up button is rendered disabled and clicking it does not open the dialog

### Requirement: The suite SHALL cover storage migration of pre-leveling saves

`e2e/migration.spec.ts` MUST seed a LocalStorage entry shaped like a pre-leveling save (no `feats`, no `maxHp`, `level: 1`) and verify the character loads, renders on the sheet, and can be leveled.

#### Scenario: Pre-leveling save loads
- **WHEN** a pre-leveling-shaped LocalStorage entry is seeded and the sheet is opened
- **THEN** the sheet renders without console errors and shows `feats: []` and a non-zero `maxHp`

#### Scenario: Pre-leveling save can level up
- **WHEN** the pre-leveling save is leveled once via the dialog
- **THEN** the resulting JSON in LocalStorage has the level incremented and the new fields populated

### Requirement: The suite SHALL cover the JSON import/export round-trip

`e2e/import-export.spec.ts` MUST verify a character can be exported as JSON, re-imported, and produce an equivalent saved entry.

#### Scenario: Round-trip preserves character state
- **WHEN** a seeded character is exported, then re-imported with a different id (or after the original is deleted)
- **THEN** the re-imported character renders on the sheet with identical persisted fields (modulo `id` and `updatedAt`)

### Requirement: The repo SHALL document how to run and extend the suite

`CLAUDE.md` MUST gain a short section under "Stack & commands" pointing at `npm run test:e2e`, the one-time `npx playwright install chromium` step, and the `e2e/` directory convention.

#### Scenario: Documentation present
- **WHEN** a developer reads `CLAUDE.md`
- **THEN** they find the test command, the install prerequisite, and the location convention without needing to read source files

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
