## ADDED Requirements

### Requirement: Origin floating-ASI MAY restrict the eligible abilities to a fixed list

`AbilityScoreBoost.floating` MUST support an optional `from: ReadonlyArray<Ability>` field. When set, the player MUST only be able to allocate the floating point(s) to abilities listed in `from`, intersected with whatever the existing `rule` already excludes (e.g. `rule: "any-other"` continues to exclude abilities named in `fixed`). When unset, the existing `rule`-only behavior MUST be preserved.

The Human origin (`origins[*].id === "human"`) MUST declare `floating.from: ["dex", "con", "cha"]`, matching the PG p. 71 rule "Increase Dexterity, Constitution or Charisma by 1." The Human origin MUST be the only origin in `data/origins.ts` to declare `from`; all other origins remain `rule`-only per their respective PG entries.

#### Scenario: Human floating allocator only enables DEX, CON, and CHA

- **WHEN** a player selects the Human origin in the wizard
- **THEN** the floating-allocator cells for DEX, CON, and CHA each have an enabled `+` button
- **AND** the floating-allocator cells for STR, INT, and WIS each have a disabled `+` button (STR because it's fixed; INT and WIS because they are not in `from`)

#### Scenario: Origin step validator rejects out-of-list allocation

- **WHEN** a Human character has `originAsiAllocation: { int: 1 }` (only reachable via hand-edited JSON, since the picker disables the `+` button for INT)
- **THEN** `validateStep("origin", character)` returns an error string indicating the allocation is not allowed

#### Scenario: Origins without `from` keep `any-other` semantics

- **WHEN** a player selects an origin whose `floating` declares `rule: "any-other"` and no `from` (e.g. Abducted Human, Changeling, Dwarf, Elf, Goblin, Ogre, Troll, Undead)
- **THEN** the floating-allocator cells for every ability except those named in `fixed` have enabled `+` buttons
- **AND** the cells for abilities named in `fixed` have disabled `+` buttons

### Requirement: The origin step's allocator SHALL surface the origin's fixed ASI per ability

Each cell in the floating-allocator grid (`components/builder/origin-step.tsx`) MUST display the sum of the origin's `asi.fixed[ab]` and the player's floating allocation as the cell's main `+{value}` number — no separate badge or label. The cell's `+`/`−` buttons MUST modify only the floating portion. Abilities with a fixed bonus but no floating allocation (e.g. Human STR) MUST therefore display the fixed value directly (e.g. `+2`) with the buttons disabled.

#### Scenario: Human STR cell shows `+2` directly

- **WHEN** a player selects the Human origin in the wizard
- **THEN** the floating-allocator's STR cell renders `+2` as its main value (the origin's fixed bonus, folded directly into the displayed value)
- **AND** the cell's `+` and `−` buttons are disabled (STR is in `fixed`, not allocatable)

#### Scenario: Allocating to a non-fixed ability updates the cell value

- **WHEN** a player selects the Human origin and clicks the CHA `+` button
- **THEN** the CHA cell's main value updates from `+0` to `+1`
- **AND** the STR cell's value remains `+2` (the fixed portion is unaffected)

#### Scenario: Abilities ineligible for the floating with no fixed bonus render dimmed

- **WHEN** a player selects the Human origin (whose `floating.from` is `["dex", "con", "cha"]`, excluding INT and WIS)
- **THEN** the INT and WIS cells display `+0` and are visually dimmed
- **AND** their `+` buttons are disabled
