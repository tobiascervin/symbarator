## Context

`SwapPicker` in `components/level-up/level-up-dialog.tsx` renders two shadcn `Select` controls — one to choose the known spell to swap out, one to choose the replacement to swap in. The shadcn/Radix `Select` primitive does not allow an empty string as an item value, so once an item is chosen there is no item the user can re-select to return to the placeholder/undefined state. The data model already supports "no swap" (both `swappedSpellOut` and `swappedSpellIn` are `string | undefined`), and the validator in `lib/character/level-up.ts` treats `undefined` on both sides as a no-op. The bug is purely a UI gap.

## Goals / Non-Goals

**Goals:**
- The player can return either swap field to undefined after picking a value, without closing the dialog.
- The cleared state is visually obvious and recoverable in one tap.
- No changes to validation, persistence, or the `LevelChoiceAnswer` shape.

**Non-Goals:**
- Redesigning the swap UI as an autocomplete or combobox.
- Allowing more than one swap per level-up (the rules permit one).
- Touching the L1 builder spell pickers — they don't expose a swap.

## Decisions

### Decision: Add a "Clear" button next to the swap selects rather than injecting a "— none —" option

Rationale: The shadcn/Radix `Select` primitive forbids `value=""` items (it throws at runtime). Workarounds either (a) use a sentinel value like `"__none__"` and translate it back to `undefined` in `onValueChange`, or (b) render a small "Clear" button alongside the two selects that resets both `out` and `inn` to `undefined`.

Option (b) is simpler, doesn't introduce a fake catalog id into the dropdown list, and matches the "optionally swap" framing — clearing is one tap, not buried inside the dropdown. The button only renders when at least one side is set, so the default state stays uncluttered.

Alternatives considered:
- Sentinel "none" item — rejected; pollutes the spell list visually and requires translating sentinel ↔ undefined in the change handler.
- Per-select clear icons (×) inside each `SelectTrigger` — rejected; would need a custom trigger override and the swap is a paired choice anyway, so a single clear control is more honest about the semantics.

### Decision: Clear resets both `out` and `inn` together

Rationale: A swap is a paired action — committing only one side is already invalid (caught by `validateLevelAnswer` returning the "You can only swap out a spell you currently know" error). Resetting both together gets the player back to a definitively valid no-swap state in one click. If they want to change just the swap-in target, the `Select` already allows picking a different item.

## Risks / Trade-offs

- [Risk] A player mid-pick might tap Clear by accident → Mitigation: render the button as a secondary/ghost variant labelled "Clear swap" with `aria-label`, positioned beside the selects but not in their tab order primary path.
- [Risk] The clear control adds visual noise → Mitigation: only render it when `out || inn` is set, so the default presentation matches today.
