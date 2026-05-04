## ADDED Requirements

### Requirement: The level-up known-spell swap SHALL be reversible from within the dialog

When the level-up flow's `spells-learned` step renders the optional "swap a known spell" picker, the player MUST be able to return either or both of the swap fields (swap-out, swap-in) to the unset state without closing the level-up dialog. The picker MUST expose a clear affordance whenever at least one of the two swap fields is set, and activating it MUST reset both fields to undefined so the answer represents "no swap."

#### Scenario: Clear control appears once a swap value is chosen
- **WHEN** the player has selected a value in the swap-out select (or the swap-in select) but not yet confirmed the level-up
- **THEN** a "Clear swap" control is visible alongside the two swap selects
- **AND** the control is hidden when both swap fields are unset

#### Scenario: Clearing resets the swap to no-op
- **WHEN** the player activates the clear control after picking a swap-out value
- **THEN** the answer's `swappedSpellOut` and `swappedSpellIn` are both undefined
- **AND** the swap selects display their placeholder text again
- **AND** the player can confirm the level-up without performing any swap

#### Scenario: Clearing does not affect new-spell or new-cantrip picks
- **WHEN** the player has selected new spells/cantrips for the level and also started a swap
- **AND** the player activates the clear control
- **THEN** only the swap fields reset; the new-spell and new-cantrip selections in the same step remain intact
