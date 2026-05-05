## Context

`Character.abilities` is the player's L1 base scores keyed by `Ability`. Final scores on the sheet are computed by `computeFinalAbilities` (`lib/character/compute.ts:85`) which sums:

```
total[ab] = c.abilities[ab]
          + (origin.asi.fixed[ab] ?? 0)
          + (c.originAsiAllocation[ab] ?? 0)
          + (subchoice.asi[ab] ?? 0)
          + boonBonusesFor(c)[ab]      // c.boons × BOON_BY_ID × c.boonAbilityChoices
          + burdenBonusesFor(c)[ab]    // c.burdens × BURDEN_BY_ID × c.burdenAbilityChoices
```

The wizard's `AbilitiesStep` (`components/builder/abilities-step.tsx`) edits `c.abilities` and `c.abilityMethod` and renders a Final Ability Scores card that mirrors `computeFinalAbilities` arithmetic inline (rather than calling the helper — minor duplication today). It does *not* include the floating-ASI picker (that lives in `OriginStep`) or the boon/burden choice pickers (that live in `BoonsBurdensStep`); the wizard relies on previous steps to have set those fields, which is fine for a forward-only flow but doesn't help a post-creation editor that must show every modifier source in one place.

Level-up applies its ASI gains by mutating `c.abilities` directly (`lib/character/level-up.ts:307`: `c.abilities[a] += pick.allocation[a] ?? 0;`), so once `c.level > 1`, `c.abilities` is no longer the "L1 base" — it's the running base + all earned ASIs. Editing it at L≥2 would corrupt the implicit invariant.

The current global Edit link sends the player to `/builder/origin?id=...`. The wizard's `useDraft` hook (`components/builder/use-draft.ts`) loads the same character from storage, so re-entering the wizard mutates the live record — there is no separate draft state. This is why post-leveling re-entry is unsafe: if the player changes class in the wizard after leveling, the persisted character ends up with a class mismatch against its already-applied per-level features.

## Goals / Non-Goals

**Goals:**

- One in-place dialog at the L1 sheet that lets the player edit every input that contributes to final ability scores: base scores (any of three methods), origin floating ASI, choice-boon ability picks, choose-one/choose-two burden ability picks.
- A Final Ability Scores readout inside the dialog that always equals what the sheet renders for the same `Character` — no second source of truth.
- The same validation rules the wizard enforces gate the dialog's Save: point-buy budget exact, standard-array permutation complete, floating ASI total matches origin requirement, every choice-boon / choose-one / choose-two has its ability pick made.
- Removing the global Edit link does not break navigation: the home page still links characters to their sheet, the wizard still exists for new-character flow, and Share / Export / Print continue working.
- L≥2 characters see no editor affordance and no global Edit; they keep the safe path (level-up dialog or JSON import/export).
- Wizard's L1 abilities step keeps its existing UX byte-for-byte — the factoring extracts re-usable sub-components, doesn't change them.

**Non-Goals:**

- Editing the boon / burden *selection* itself from the sheet. Swapping a boon affects which ability bonus shape applies (fixed vs. choice) — out of scope; covered today by re-entering the wizard's boons-burdens step under the L1 house rule, or by JSON import/export. The dialog only edits the *ability pick* on already-selected choice-boons / choice-burdens.
- Editing the origin sub-choice from the sheet (e.g. swapping Human/Ambrian → Human/Barbarian). Sub-choice ASI is shown read-only; changing it is an origin re-pick.
- Editing class, approach, fighting style, background, or known spells from the sheet. None of those are reachable from this dialog; the user has the wizard or import/export for those.
- Editing the L1 abilities-method from outside the dialog. The dialog is the only surface offering method-switching at the sheet level; the persisted `Character.abilityMethod` updates per the dialog's tab choice.
- Editing abilities at L≥2. The L1 gate is enforced both in the UI (no pencil icon) and in a defensive guard in the dialog itself.
- An audit trail. We don't snapshot pre-edit state; the player's "undo" is "Cancel" in the dialog. Save commits.

## Decisions

### Decision 1: Dialog hosts a local **draft copy** of the four mutable fields

The dialog opens with a deep-cloned snapshot of `{ abilities, abilityMethod, originAsiAllocation, boonAbilityChoices, burdenAbilityChoices }` from the persisted character. All editing inside the dialog mutates the local draft only. Save merges the draft back into the persisted character; Cancel discards. This matches the existing wizard pattern (`useDraft` clones via `JSON.parse(JSON.stringify(...))`) and keeps the sheet's display stable while the user is mid-edit — no flicker of "you've already half-changed your scores".

**Why local draft over inline mutation?** Inline mutation would surface every keystroke in point-buy mode through `computeFinalAbilities` and re-render the entire sheet repeatedly. Worse, an over-budget intermediate state would briefly show invalid scores. Drafting localizes the work and makes Cancel cheap.

### Decision 2: Reusable sub-components for the three pickers and the modifier-source pickers

Extract from `components/builder/abilities-step.tsx`:

- `StandardArrayPicker(props: { abilities, onChange })` → keep its current internals; remove the `draft, update` prop pattern in favor of `abilities` + `onChange` so the same component works against the wizard's `useDraft` and the dialog's local draft.
- `PointBuyPicker(props: { abilities, onChange })` → same shape.
- `ManualPicker(props: { abilities, onChange })` → same shape.

Extract from `components/builder/origin-step.tsx`:

- `FloatingAsiPicker(props: { origin, allocation, onChange })` — the `+`/`−` UI per ability with the `from:`/`count`/`size` constraints.

Extract from `components/builder/boons-burdens-step.tsx`:

- `BoonAbilityChoicePicker(props: { boon, value, onChange })` — only the inline ability-pick row that appears when a choice-boon is selected.
- `BurdenAbilityChoicePicker(props: { burden, picks, onChange })` — for choose-one / choose-two ability rows.

The wizard call sites migrate to the extracted components first (no behavior change). The new dialog composes the same components.

**Why factor instead of duplicating?** Two implementations of point-buy math with the same 27-point budget, plus two copies of the floating-ASI `from:` enforcement, are guaranteed to drift. Factoring is one PR's worth of mechanical work and creates the "one source of truth" the proposal requires.

### Decision 3: A single `validateAbilityEdit(c)` helper, not a re-use of `validateStep`

`validateStep("abilities", c)` and `validateStep("boons-burdens", c)` together cover the rules we need, but they:

- Return strings tailored to the wizard's "Continue" toast messaging.
- Read `c.abilityMethod` for free but do not validate point-buy budget at the spec level (the wizard mode-tab handles that visually).
- Don't independently validate floating-ASI allocation (that's tied to the `origin` step's validator).

A new helper `validateAbilityEdit(c): { ok: true } | { ok: false; reason: string }` consolidates the four checks the dialog needs:

1. `validateStep("origin", c)` — covers floating-ASI total + `from:` enforcement.
2. Point-buy budget exact at 27 when `c.abilityMethod === "point-buy"` (this gate isn't enforced inside `validateStep("abilities")` today; the wizard relies on its UI to prevent over-budget — the dialog should be defensive here so a hand-edited JSON can't slip through).
3. Standard-array permutation complete when `c.abilityMethod === "standard-array"` (mirror the `isPermutation` check from `StandardArrayPicker`).
4. `validateStep("boons-burdens", c)` — covers choice-boon / choose-one / choose-two pick presence + restriction enforcement.

The helper composes the three `validateStep` invocations and adds the standard-array / point-buy gates the wizard's UI handles implicitly. Both the wizard's `WizardShell.handleAdvance` and the dialog's Save button can call it, but the wizard already calls `validateStep` per-step so we don't change the wizard's behavior — only the dialog uses `validateAbilityEdit` directly.

### Decision 4: Pencil-icon affordance inside the Abilities panel header

The sheet's `SectionHeader` (`components/sheet/character-sheet.tsx:564`) accepts an optional `action` slot already. Render a `<Button variant="ghost" size="icon">` with a `Pencil` icon (lucide) into that slot for the Abilities panel, conditional on `c.level === 1`. The icon opens the dialog. Tap target follows the responsive-mobile-layout work (44×44 on touch viewports).

**Why pencil-icon and not "Edit" text?** The button needs to fit inside the existing `SectionHeader` row without crowding the header label, and a single icon is consistent with the Combat panel's existing rucksack icon for inventory management. Keep the visual language.

**Why on the Abilities panel and not the page header?** Page-header buttons are global and global is what we're trying to remove. Co-locating the affordance with the affected data makes the relationship obvious and makes it impossible to accidentally hit while reaching for Share / Export / Print.

### Decision 5: At L≥2 the pencil icon does not render — dialog is unreachable from the UI

The dialog itself includes a defensive guard: if `c.level !== 1`, render the dialog body as a "This editor is only available at level 1; level-up dialog handles ASI gains" message and disable Save. This guard is belt-and-suspenders against future code paths that might open the dialog programmatically. Today the only opener is the conditional pencil-icon, so the guard is dead code in normal usage — but cheap insurance.

### Decision 6: Removing the global Edit is a hard removal — no soft-deprecation

The Edit link is dead code as soon as we ship. Some power-users may have it bookmarked; bookmarks point to `/builder/origin?id=...` which still routes correctly to the wizard for new characters and continues to work for in-progress characters who haven't reached the sheet yet. Existing characters reaching that URL will succeed (the wizard does not check level), so we deliberately *do not* close the wizard route — only the affordance from the sheet. Power-users who really want to re-enter the wizard for a leveled character can still type the URL.

**Why not also lock the wizard route at L≥2?** The wizard is the only interactive way to migrate a partial-creation character (level still 1, missing fields). Locking it adds risk for a benefit (preventing footguns we don't know users hit). We accept the URL escape hatch.

### Decision 7: This is a MINOR release

Per `CLAUDE.md`'s SemVer rules: MAJOR for `Character` schema breaks, MINOR for additive features, PATCH for fixes. This change adds an editor and removes one affordance, with a net-additive feature surface. `Character` JSON shape is untouched. PATCH is too small (the proposal is a feature, not a bug fix); MAJOR is wrong (no save-file break). MINOR.

## Risks / Trade-offs

- **[Risk] Removing the global Edit link without replacement might surprise users who relied on it for class / approach / fighting-style swaps.** **→ Mitigation:** the proposal explicitly notes that those edits remain available via the wizard route by URL, JSON import/export, or by deleting and recreating the character. A CHANGELOG entry under `Changed` calls out the removal and the L1 ability-score editor as the replacement for the *common* case.
- **[Risk] Factoring the wizard's pickers into shared components is a wide change touching `abilities-step.tsx`, `origin-step.tsx`, and `boons-burdens-step.tsx`.** **→ Mitigation:** factor first, migrate wizard call sites in the same commit, run the existing Playwright wizard suite to catch regressions before adding the dialog. The factoring is mechanical (copy bodies, swap props from `draft, update` → `value, onChange`) and reversible.
- **[Risk] The dialog can leave `Character.abilityMethod` in a state the wizard would not produce — e.g. `manual` mode with arbitrary 3–20 scores after the player tabbed away from `point-buy`.** **→ Mitigation:** this is the existing wizard behavior already; method-switching freely changes scores in the wizard too. The dialog inherits, not extends, this property.
- **[Risk] Floating-ASI editing on the sheet exposes a path to invalid `originAsiAllocation` totals (e.g. user lowers Strength bump but doesn't re-allocate elsewhere).** **→ Mitigation:** Save is gated by `validateAbilityEdit` which reuses `validateStep("origin", c)`; an unbalanced allocation blocks Save with a visible reason. Mid-edit unbalanced states are local to the draft and don't leak to storage.
- **[Risk] Choice-boon / choose-two edits in the dialog could leave a previously-validated character in an invalid state if the player changes the boon's ability pick to one that violates a forbidden-origin rule somehow.** **→ Mitigation:** the boon catalog's `forbiddenOriginIds` rule is on the boon itself, not on its ability bonus, so re-picking the bonus ability cannot trip it. The dialog still re-runs `validateStep("boons-burdens", c)` on Save for defense in depth.
- **[Trade-off] No undo after Save.** Save commits to localStorage; closing the dialog and re-opening it does not show "previous values" because we don't snapshot. The player's undo is to remember what they had and re-enter it. We accept this; an undo stack is its own design and adds storage cost; the loss-of-data window is small (one dialog session).
- **[Trade-off] No diff or preview-on-save.** The Save button writes the new values without a "you're about to change Strength from 14 to 12 — confirm?" interstitial. The dialog already shows the live Final Ability Scores breakdown, so the player has been seeing the effect of their changes throughout the session. An additional confirm step would be friction without information value.
- **[Trade-off] L≥2 has no editor and no global Edit.** Power-users who want to retroactively change L1 abilities at L5 must edit JSON. We considered allowing the dialog at any level with a guard to recompute "L1 base = current abilities − applied ASI gains", but the gain history isn't stored — only the running totals are — so the recovery is fundamentally lossy. Keeping the L1 gate is the only honest position.
