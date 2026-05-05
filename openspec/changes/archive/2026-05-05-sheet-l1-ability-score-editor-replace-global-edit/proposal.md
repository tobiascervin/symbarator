## Why

The character sheet's header today carries a global **Edit** link (`app/characters/[id]/page.tsx:135–140`) that sends the player back to `/builder/origin?id=...` — i.e. the first step of the 7-step wizard. That single button covers far too much surface: it lets a player re-pick their origin, class, approach, background, fighting style, and L1 spells *after* they have leveled up, which is unsafe (changing origin invalidates HP, the corruption-threshold formula source, and origin-feat eligibility tracked through `Character.feats`). Most legitimate uses of the button reduce to "I miscounted my point-buy" or "the Final Ability Scores card looks wrong because I forgot to choose my floating ASI" — i.e. **ability-score adjustments**. The other rare cases (changing class, swapping a spell, retraining a fighting style) are not what the wizard surface should be casually re-entered for.

In parallel, players have no way to fix ability scores from the sheet without leaving it. They have to navigate through 5 wizard steps to reach the abilities step, change a number, and walk back out — risking accidental re-clicks on origin/class/approach cards along the way. This is friction for the most-common edit, exposes risk for the least-common ones, and uses one button for both jobs.

The proposal: **remove the global Edit link** and replace it with an in-place **Edit Ability Scores** affordance available only at L1 — opening a dialog that mirrors the wizard's Abilities step so the player can adjust base scores AND every modifier source that contributes to the final scores (origin floating ASI, choice-boon ability picks, choose-one/choose-two burden ability picks). The editor MUST hold the same logic as the wizard so the Final Ability Scores readout matches what `computeFinalAbilities` produces — no second source of truth.

The L1 gate is intentional: starting at L2, ASI gains from level-up are folded directly into `Character.abilities` (`lib/character/level-up.ts:307`), so the "L1 base" is no longer cleanly separable from accrued ASI. Letting the user tweak `c.abilities` post-leveling would silently rewrite history. At L≥2 the editor is hidden; players who want to reset abilities at higher levels must continue to use JSON import/export.

## What Changes

- Remove the **Edit** button from the character-sheet header (`app/characters/[id]/page.tsx`). The Share, Export JSON, Print, and Level Up buttons remain.
- Add an **Edit Ability Scores** affordance to the sheet's Abilities panel — a small pencil-icon button rendered in the panel's section header *only when `Character.level === 1`*. Tapping it opens a modal.
- The modal MUST present the same three input methods as the wizard's `AbilitiesStep`: **Standard Array**, **Point Buy** (27-point budget), and **Manual** (3–20 per ability). The active method is read from / written to `Character.abilityMethod` so the choice survives across opens.
- The modal MUST surface every ability-bonus source already aggregated by `computeFinalAbilities`:
  - Origin **fixed** ASI (read-only — display-only, can't be edited from this surface).
  - Origin **floating** ASI allocation — editable via the same `+`/`−` UI as the wizard's `OriginFloatingPicker`, with the same `from:` / count restrictions enforced.
  - Origin **sub-choice** ASI (read-only — display-only).
  - **Boon** ability bonuses, including choice-boons whose ability picks (`Character.boonAbilityChoices`) are editable inline (just the choice — the boon itself is not swappable here).
  - **Burden** ability bonuses, including choose-one and choose-two burdens whose ability picks (`Character.burdenAbilityChoices`) are editable inline.
- The modal MUST render a Final Ability Scores breakdown identical to the wizard's, sourced from `computeFinalAbilities(draft)` so the user sees totals update live as they adjust base scores or any of the modifier choices.
- The modal MUST run the same validation gates the wizard's "abilities" and "boons-burdens" `validateStep` cases run (point-buy budget for point-buy mode, full standard-array permutation for standard-array mode, total floating ASI matching origin's `count × size`, every choice-boon and choose-one/choose-two burden has its picks made). The "Save" button is disabled while validation fails, with the failure reason shown.
- Per the existing release rules in `CLAUDE.md`, this is a MINOR bump (additive UI feature, removes one affordance but adds an equivalent — no `Character` schema change, no migrator).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-mode`: extends the sheet's mutable-state affordances with an L1-only ability-score editor that reuses the wizard's input methods and modifier-source logic, and removes the global "Edit" link from the sheet header.

## Impact

- Code: `app/characters/[id]/page.tsx` (delete the Edit `<Link>`), `components/sheet/character-sheet.tsx` (add the pencil-icon trigger inside the Abilities panel header, conditional on `c.level === 1`), new `components/sheet/ability-score-editor-dialog.tsx` (or analogous) hosting the dialog, and `components/builder/abilities-step.tsx` (factor the pickers — `StandardArrayPicker`, `PointBuyPicker`, `ManualPicker` — into reusable sub-components so both the wizard and the sheet editor render the same UI without forking).
- Modifier-source UI: the floating ASI picker (currently inlined in `OriginStep`) and the boon/burden choice pickers (currently inlined in `BoonsBurdensStep`) need extraction into shared components used by both the wizard and the new dialog. The factoring is mechanical — props flow from local draft state in either case.
- Validation: `validateStep` rules for `abilities` and `boons-burdens` must be callable from the dialog, OR a sibling helper `validateAbilityEdit(c)` MUST be exposed alongside the existing step validators. Either path keeps a single source of truth.
- Storage: untouched. `Character` schema, `Character.abilityMethod`, `Character.originAsiAllocation`, `Character.boonAbilityChoices`, and `Character.burdenAbilityChoices` are all already persisted — the dialog mutates these existing fields. No migrator.
- Tests: Playwright e2e covering (a) the global Edit button is no longer in the sheet header, (b) at L1 the pencil icon opens the dialog and a base-score change recomputes the displayed Abilities panel, (c) at L≥2 the pencil icon does not render, (d) editing the floating ASI / boon ability / burden ability picks in the dialog updates `computeFinalAbilities` output reflected in the panel, (e) leaving the dialog with invalid state (e.g. point-buy over budget) keeps the Save button disabled and does not persist.
- Sharing & export: unchanged. The dialog mutates the persisted `Character`; subsequent Share / Export / Print already read from the up-to-date storage record.
