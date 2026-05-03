## Why

The L1 Boons & Burdens step is currently always shown in the wizard, but in Ruins of Symbaroum 5E RAW, Boons are level-4+ feats — granting one at character creation is a house rule some GMs allow and others don't. Players running RAW campaigns have no way to opt out of the step, and the prompt itself makes the mechanic look standard. Separately, on the character sheet, Boons / Burdens / Feats render as plain text-block cards while spells render as visually rich cards (name + badges + description), creating an aesthetic mismatch in adjacent sections of the same sheet.

## What Changes

- Add a per-character `houseRules.allowL1BoonBurden` boolean (default `false`) that controls whether the L1 Boons & Burdens flow is offered.
- When the flag is `false` (RAW default), the wizard MUST skip the boons-burdens step in navigation (Continue from abilities goes directly to skills-equipment, Back from skills-equipment returns to abilities), and `Character.boons` / `Character.burdens` MUST be empty arrays. The deep link `/builder/boons-burdens?id=<id>` SHOULD redirect to the abilities step.
- Surface a clearly-labelled opt-in toggle ("GM allows L1 Boons & Burdens — house rule") in the wizard so players know the feature exists and can enable it without leaving the wizard.
- Existing characters MUST continue to show their previously-picked boons/burdens. The migrator MUST set `houseRules.allowL1BoonBurden` to `true` for any saved character with a non-empty `boons` or `burdens` array, and to `false` otherwise — preserving current behavior on first load.
- Refactor the sheet's Boons, Burdens, and Feats rendering to use a shared `FeatCard` component visually aligned with `SpellCard`: bordered card, name in display font, badges (e.g. `+1 INT`, `Boon`, `Burden`, `Special`, `Fighting Style`), description below.
- The picker cards in the boons-burdens wizard step SHOULD adopt the same shared visual treatment so the picker and the sheet read as the same artefact in two modes.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `character-creation`: the L1 Boons & Burdens step becomes opt-in via a house-rules flag; the sheet's Boons/Burdens sections render as structured cards aligned with the spell-card visual style.
- `character-leveling`: the sheet's Feats section renders feats as structured cards aligned with the spell-card visual style.

## Impact

- **Schema**: `Character` gains a `houseRules: { allowL1BoonBurden: boolean }` object. Migration backfills based on the presence of existing boons/burdens.
- **Wizard**: `STEPS` becomes flag-aware — `lib/character/validation.ts` exports a function (e.g. `stepsFor(c)`) that returns the active step list for a given character. `nextStep` / `prevStep` and `WizardShell`'s nav must use it. Affected files: `lib/character/validation.ts`, `components/builder/wizard-shell.tsx`, `app/builder/[step]/page.tsx`.
- **UI**: New shared component `components/sheet/feat-card.tsx` (card primitive) and refactored `components/sheet/feat-list.tsx` to use it. Sheet sections updated in `components/sheet/character-sheet.tsx`. Wizard picker (`components/builder/boons-burdens-step.tsx`) optionally aligned.
- **Tests**: E2E coverage for the gated step (RAW path skips, opt-in path includes). Existing boons/burdens tests need a "house rule enabled" precondition.
- **Out of scope**: Reorganising the sheet into tabs (tracked separately by the empty `add-tabbed-sheet` change), and any global app-level "house rules" settings UI beyond a per-character toggle in the wizard.
