## Context

The L1 character builder currently includes a Boons & Burdens step at a fixed position in `STEPS` (`lib/character/validation.ts:10-19`), reachable by every player on every new character. The step body itself is "optional" only in the sense that 0 picks satisfies validation — there is no signal in the UI that the whole mechanic is a house rule, and no way to remove it from the wizard for tables that play RAW. In Ruins of Symbaroum 5E, Boons are gained via the Boon feat at L4+ ASI levels, not at character creation; granting one at L1 is a common but not universal house rule.

In parallel, the character sheet currently renders Boons, Burdens, and Feats via `FeatGroup` (`components/sheet/feat-list.tsx`) — bordered divs with a name and description. Spells on the same sheet render via `SpellCard` (`components/spells/spell-card.tsx`) — bordered cards with the name in display font, badges (school, ritual), and a description. The two sit next to each other on the sheet and read inconsistently.

A storage migrator already exists (`lib/storage/local.ts:21`) and is used to backfill new fields on previously-saved characters without a versioned migration system. There is no existing `houseRules` namespace on `Character`.

## Goals / Non-Goals

**Goals:**

- Make L1 boons/burdens an explicit, opt-in house rule with a clear in-wizard toggle.
- Default new characters to RAW (`false`), so first-time users see a Symbaroum-faithful flow.
- Keep all existing saved characters working: anyone with a previously-picked boon or burden retains their selections and continues to see the step.
- Unify the visual treatment of Boons / Burdens / Feats on the sheet with the spell cards already present.
- Keep the wizard's step navigation (Continue, Back, deep links, step indicator) consistent whether the step is included or skipped.

**Non-Goals:**

- An app-level "house rules" settings screen. The toggle lives on the character itself.
- Multiple house rules — only `allowL1BoonBurden` is added by this change. The shape leaves room to add more later.
- Reorganising the sheet layout (the `add-tabbed-sheet` change tracks that separately).
- Changing the Boons/Burdens/Feats *content* or which characters can pick them — this is purely about gating the step and improving the visual rendering.

## Decisions

### Decision: per-character flag, not app-level setting

The flag lives on `Character.houseRules.allowL1BoonBurden`, not in app settings.

**Rationale:** A single browser may hold multiple characters across multiple campaigns, each with a different GM and different house rules. A per-character flag survives JSON export/import (the canonical share format) so a character built under house rules at one table reads correctly when imported at another. An app-level setting would lose this on transfer.

**Alternatives considered:**

- App-level localStorage flag — simpler, but bleeds across campaigns and dies on export/import.
- Implicit (presence of any boon means the rule is on) — fragile; can't represent "GM allows it but I chose not to take one."

### Decision: nested `houseRules` namespace, not a flat `allowL1BoonBurden`

The schema gains `houseRules: { allowL1BoonBurden: boolean }`, not a top-level boolean.

**Rationale:** Future house rules (e.g. "GM allows starting with a feat", "GM allows custom origins") can be added as siblings without further schema churn. The grouping also makes intent obvious in the JSON export.

### Decision: dynamic `STEPS` via `stepsFor(character)`, not a literal flag check sprinkled through nav

`lib/character/validation.ts` exports a new function `stepsFor(c: Character): ReadonlyArray<Step>` returning the active steps for a character. `nextStep` and `prevStep` take an optional character argument and consult `stepsFor` when provided. `WizardShell` calls `stepsFor(draft)` once and uses the result for the indicator, the index/count, and the Continue button label.

**Rationale:** Centralises the gating decision in one place. Step components, the URL dispatcher, and the indicator all read the same source of truth. Skipping the step only requires the flag — no special cases scattered across the codebase.

**Alternatives considered:**

- Always include the step in `STEPS`, render an "auto-advance / hidden" body when the flag is off — keeps things static, but the indicator and step-count UI lie about how many steps the user is actually clicking through.
- Branching `STEPS` constants (`STEPS_RAW`, `STEPS_HOUSE_RULES`) — works, but `stepsFor` reads as an extension point if more rules are added later.

### Decision: deep-link safety — `/builder/boons-burdens?id=<id>` redirects when disabled

If the flag is off and the URL is hit directly (typed, bookmarked from a previous run, or arrived at via Back from skills-equipment of a now-toggled-off character), `app/builder/[step]/page.tsx` redirects to the abilities step. No 404, no broken Continue chain.

### Decision: opt-in lives on the abilities step (footer toggle)

A small "GM allows L1 Boons & Burdens — house rule" toggle (with a one-line explainer) appears on the **abilities** step, beneath its own content. Toggling it on inserts the boons-burdens step into the remaining wizard flow; the user proceeds to it on Continue.

**Rationale:** Abilities is the immediate predecessor of where the step would appear, so the toggle is contextually adjacent. It's also the first step that benefits from boon ability bonuses — putting the toggle here makes the cause-and-effect visible. Origin/background steps come too early (before the player has thought about ability scores), and identity comes too late (after the step would have appeared).

**Alternatives considered:**

- A pre-wizard "house rules" step at the very start — adds a step purely to ask one question; defeats RAW-default ergonomics.
- Toggle on the home page when forging a hero — splits the decision from the wizard context where it matters.
- Always-visible "boons-burdens" step with the toggle inside — defeats the goal (RAW players still see the prompt).

### Decision: migration backfills the flag from existing data

`migrateCharacter` sets `houseRules.allowL1BoonBurden` to `true` if the saved character already has a non-empty `boons` or `burdens` array, otherwise `false`. Saves predating this change therefore preserve current behavior on first load — anyone who already opted in (by picking a boon) keeps their step; anyone who didn't (or who has no characters) starts with the RAW default.

### Decision: shared `FeatCard` component, not a parallel implementation

A new `components/sheet/feat-card.tsx` exposes a single `FeatCard` (and grouping component) used by the Feats, Boons, and Burdens sheet sections. Visual contract matches `SpellCard`'s display mode: bordered card, name in display font, optional badges, description below. The component is sheet-themed (parchment palette `#1d1814` / `#3a322a` / `#9a8a6b`), unlike `SpellCard` which uses generic theme tokens.

**Rationale:** Two distinct callsites (sheet vs. wizard picker) and two distinct themes (parchment vs. shadcn) mean a single shared `SpellCard` would need extra props and conditional theming. A separate `FeatCard` keeps each component's responsibilities tight while presenting the same visual language.

**Alternatives considered:**

- Generalise `SpellCard` to accept arbitrary content — couples spells and feats; harder to evolve either independently.
- Render feats inline in `character-sheet.tsx` — duplicates the existing FeatList logic and loses the picker/sheet symmetry.

### Decision: wizard picker keeps shadcn `Card`, not the parchment `FeatCard`

The boons-burdens wizard step continues to use shadcn `Card` (which it already does well) for its picker. Visual alignment between picker and sheet is achieved by adding badges to the picker (e.g. `+1 INT`) consistent with the sheet's `FeatCard` — not by sharing the component.

**Rationale:** The wizard runs on the standard shadcn/Tailwind theme; the sheet runs on parchment. Forcing one component to handle both adds complexity for no behavioural win. Visual *language* alignment is what the proposal asks for, and badges + structured layout deliver that.

## Risks / Trade-offs

- **Risk: existing E2E coverage for the boons-burdens step breaks.** → Mitigation: any test that visits `/builder/boons-burdens` must first set `houseRules.allowL1BoonBurden = true` (either via the toggle or via the test's `localStorage` seeding helper in `e2e/helpers/`). Add this to the helper as a default-false field on the seed `Character` and update the affected tests.
- **Risk: a player who toggles the rule on, picks a boon, then toggles it off keeps the boon hidden but still active in compute.** → Mitigation: toggling off when boons or burdens are populated SHOULD prompt confirmation and clear `boons`, `burdens`, and `boonAbilityChoices` if the user accepts. Otherwise toggle is no-op (with toast).
- **Risk: dynamic `STEPS` introduces subtle off-by-one bugs in the step indicator (e.g. "Step 5 of 7" vs "Step 5 of 8").** → Mitigation: indicator and "Step N of M" text both read from `stepsFor(draft).length` and `stepsFor(draft).indexOf(step)`. Cover with an E2E that toggles mid-wizard and asserts the indicator updates.
- **Risk: visual divergence between the wizard picker (shadcn theme) and the sheet (parchment theme) is more apparent if both adopt cards.** → Mitigation: accept this. They're two surfaces; they should have related but distinct visual treatments. The proposal's goal is visual coherence within the sheet, not between sheet and wizard.
- **Trade-off: `houseRules` namespace adds nesting for a single field today.** → Worth it for forward extensibility. Migration cost is one line.

## Migration Plan

1. Land schema change (`Character.houseRules.allowL1BoonBurden: boolean`) + migrator backfill in a single commit. Migrator is forward-only; no rollback needed for already-migrated saves.
2. Land `stepsFor` + step gating + redirect. Shipped together with the abilities-step toggle so the flag is reachable immediately.
3. Land `FeatCard` and refactor sheet sections in a follow-up commit (independent of the gating work).
4. Update E2E helpers and affected tests as part of (2).

No production data is at risk — storage is per-browser localStorage. Anyone whose data shape ends up wrong can re-export and re-import, but the migrator is intended to make that unnecessary.

## Open Questions

- Should the abilities-step toggle confirm-and-clear when turned off after picks have been made, or just hide the step and leave `boons`/`burdens` populated (active in compute, invisible in UI)? Proposal favors confirm-and-clear, but this could be revisited based on UX testing.
- Does the `FeatCard` need a "source" badge (Boon / Burden / Special / Fighting Style) when the section header already names the source? Probably not on the sheet (header is enough) but worth deciding before implementation.
