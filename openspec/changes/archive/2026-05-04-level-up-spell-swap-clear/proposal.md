## Why

The level-up flow lets a spellcaster optionally swap one known spell for another, but the swap UI uses two `Select` controls with no clear/none option. Once a spell is picked into either dropdown, the player cannot back out — the only way to abandon the swap is to refresh or close the dialog, which loses the rest of their level-up answers. The intent is "optionally swap," not "you must commit."

## What Changes

- The level-up "swap a known spell" UI MUST allow the player to deselect either side of the swap and return to the unset/no-swap state.
- A clear affordance (e.g. a "Clear swap" button or an explicit "— none —" option in each select) MUST be present whenever at least one of the two values is set.
- Behavior is unchanged when no swap is initiated; the optional swap remains optional.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `character-leveling`: tighten the `spells-learned` step requirement so the optional known-spell swap is reversible — the player can clear the swap-out and swap-in choices independently.

## Impact

- `components/level-up/level-up-dialog.tsx` — `SwapPicker` rendering only.
- No changes to `Character` schema, persistence, or `lib/character/level-up.ts` validation/apply logic. The existing validation already treats both swap fields being undefined as "no swap."
- `e2e/level-up.spec.ts` gains coverage for clearing a started swap.
