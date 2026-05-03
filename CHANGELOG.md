# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2026-05-03

Burdens now mechanically count: the +2 (or +1/+1 for Dark Blood) ability bonus from a picked burden flows through `computeFinalAbilities` and shows up on the stat block, saves, and skill modifiers. Choice-burdens (Addiction, Impulsive, Seizures, Ward, Dark Blood) gain inline ability pickers in the wizard, and the sheet renders each burden's bonus as a badge alongside the spell-style boon and feat cards from v1.6.

### Added

- **`BurdenDef.abilityBonus`** as a discriminated union with three shapes: `fixed` (a single named ability gets +2), `choose-one` (player picks one ability — optionally restricted via `from`, defaults to any of six — that gets +2), and `choose-two` (player picks two distinct abilities, each gets +1; the Dark Blood shape). All 16 canonical PG burdens are now encoded with their bonus: 11 fixed (Arch Enemy/Bestial/Bloodthirst/Code of Honor/Dark Secret/Elderly/Mystical Mark/Nightmares/Sickly/Slow/Wanted), 4 choose-one (Addiction any-of-six, Impulsive STR/CHA, Seizures INT/WIS, Ward INT/CHA), and 1 choose-two (Dark Blood +1/+1, plus a `startingCorruption: 2` declaration).
- **`Character.burdenAbilityChoices: Record<string, ReadonlyArray<Ability>>`** persists choice-burden picks (length 1 for choose-one, length 2 for choose-two; fixed burdens have no entry). The migrator backfills `{}` for any saved character missing the field.
- **`burdenBonusesFor(c)`** helper in `lib/character/compute.ts` that mirrors `boonBonusesFor` and feeds into the existing `computeFinalAbilities` pipeline as a peer to origin/floating ASI/subchoice ASI/boon bonuses.
- **Inline ability pickers in the wizard's burden cards** for choice-burdens. `choose-one` is single-select constrained to `abilityBonus.from` (or all six). `choose-two` is toggle-select with a "X of 2 chosen" hint and max-2 enforcement (clicking a third pick replaces the oldest). The validator rejects advance on wrong cardinality, duplicate picks, or out-of-list picks with specific error messages.
- **Bonus badges on burden cards** in both the wizard picker and the sheet — one badge per `+X ABL` term. A fixed-bonus burden shows `+2 CON`; a choose-one with no pick shows `+2 (choose 1)`, and updates to `+2 STR` once the player picks; a choose-two shows `+1/+1 (choose 2)` until two picks are made, then renders two badges (`+1 STR`, `+1 WIS`).
- **Dark Blood corruption warning chip** — when Dark Blood is selected in the wizard, a destructive-styled chip appears reading "+2 permanent Corruption — track manually on the sheet's Corruption panel". The +2 is **not** auto-applied to `Character.corruption.permanent` (see Changed below for why).
- **5 new E2E tests** covering the fixed-bonus stat-block math, the choose-one picker validation flow (Impulsive), the Dark Blood choose-two flow with warning chip + double badges + sheet rendering, and the migrator backfill for an existing fixed-burden character. Suite total: **49 tests** passing. New `reseedCurrent(page, id)` test helper for cases that need a full page navigation after a wizard save.

### Changed

- **Existing burden picks now mechanically contribute their bonus on first load post-upgrade.** Anyone who already took, e.g., Bestial in v1.6 will see `CON +2` appear on their stat block, saves, and skill modifiers when they next open the character. If you had been compensating manually by reducing the base score, you'll want to revisit the abilities step. No data is lost — the migrator backfills `burdenAbilityChoices: {}` for fixed burdens (no entry needed) and the bonus is purely additive.
- **Burden description text trimmed** in `data/feats.ts` — the `"Bonus: +X to Y. ..."` prose prefix is removed from each description, since the bonus now renders as a badge on the card. The roleplay text remains.
- **Dark Blood's +2 permanent Corruption is intentionally a manual side-effect.** `Character.corruption.permanent` is a player-mutable field tracked in play (the Corruption panel adjusts it during sessions); auto-incrementing on burden pick and decrementing on unpick would corrupt that signal if the player has touched it between events. The wizard surfaces a clear warning chip; the player applies the +2 via the existing Corruption `+`/`−` adjusters.

[1.7.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.7.0

## [1.6.0] - 2026-05-03

Optional L1 Boons & Burdens — the wizard now respects RAW Symbaroum (Boons are L4+ feats); a per-character toggle adds the L1 step for tables that allow the house rule. The sheet's Boons, Burdens, and Feats sections render as visually unified cards alongside spells, and the Boon and Burden catalogs are filled out to the PG canon (36 and 16 entries respectively).

### Added

- **House-rules toggle on the abilities step** — a labelled checkbox with explainer that flips `Character.houseRules.allowL1BoonBurden` on or off. Toggling on inserts the Boons & Burdens step into the wizard live (indicator, "Step N of M", and Continue label all update); toggling off with picks already made surfaces a confirmation dialog before clearing `boons`, `burdens`, and `boonAbilityChoices`.
- **`<FeatCard>` and `<FeatCardGroup>`** in `components/sheet/feat-card.tsx` — a parchment-themed card primitive with name (display font), optional badge row (`+1 INT`-style), and description. Visual structure mirrors `SpellCard` so adjacent sheet sections read as one design language.
- **Full PG-canon Boons** — the 6 missing entries are now in `data/feats.ts` (Medium, Mirage, Pathfinder with `+1 WIS`, Pet, Servant, Soulmate). Total: **36 boons** (PG p. 147).
- **Full PG-canon Burdens** — the 4 placeholder entries are replaced by the canonical **16 burdens** (PG p. 151–152): Addiction, Arch Enemy, Bestial, Bloodthirst, Code of Honor, Dark Blood, Dark Secret, Elderly, Impulsive, Nightmares, Mystical Mark, Seizures, Sickly, Slow, Wanted, Ward. Each burden's `+2 to X` (or `+1/+1`) bonus is captured in its description text.
- **`stepsFor(character)`** in `lib/character/validation.ts` — single source of truth for the active wizard step list. `nextStep` and `prevStep` now accept an optional `character` argument and consult `stepsFor` so step navigation, indicator, and counter all agree.
- **Deep-link guard** — visiting `/builder/boons-burdens?id=<id>` on a flag-off character redirects to `/builder/abilities?id=<id>` rather than rendering an unreachable step.
- **6 new E2E tests** covering the RAW skip path, deep-link redirect, toggle insertion, `houseRules` JSON export round-trip, and migrator backfill for both with-boons and without-boons saves. Suite total: **45 tests**, all passing.

### Changed

- **L1 Boons & Burdens step is now opt-in.** RAW Symbaroum 5E grants Boons via the L4+ Boon feat, not at character creation. New characters default to `houseRules.allowL1BoonBurden: false` and the wizard skips the step entirely; only existing characters that previously picked a boon or burden are migrated to `true` so they keep their step. The validator still allows 0–1 boon and 0–1 burden when the flag is on.
- **Sheet rendering of Boons / Burdens / Feats** now uses the shared `<FeatCard>`. Choice-boons display the chosen ability as a badge (e.g. `+1 CHA`) rather than embedded in the boon name.
- **Schema** — `Character` gains a required `houseRules: { allowL1BoonBurden: boolean }` namespace, designed for additional rule flags later. `migrateCharacter` backfills the field on first load: `true` if the saved character has any existing boon or burden (preserving prior behavior), otherwise `false`. No persisted save fails to load.
- **`gotoBuilder` test helper** now accepts `"boons-burdens"` in its step union (it didn't before, despite a test using it).

[1.6.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.6.0

## [1.5.0] - 2026-05-03

Printable PDF export — a paper-friendly view of any saved character so players who build in the app can carry the build to a tabletop session on a real PG sheet.

### Added

- **Print route at `/characters/[id]/print`** — a sibling to the regular sheet that loads the same character via `LocalCharacterStore.load(id)` and renders a `<PrintableSheet>` optimized for paper.
- **`<PrintableSheet>` component** showing every static field needed for paper transfer: identity, ability scores + modifiers, saving throws, all 18 skills, combat pills (max HP / hit die / prof bonus / initiative / speed / corruption threshold), the full feature list (origin → subchoice → background → class → approach, plus per-level features through current level), boons and burdens with full descriptions, level-up feats with descriptions, spells known grouped by level (name + level only — descriptions stay in the PG), equipment from class picks + background, identity tropes, and a Notes block with reserved space for handwritten additions.
- **Auto-fire `window.print()` on mount** with a 250ms paint settle so fonts load before the dialog snapshots the page. A no-print control bar above the sheet exposes "← Back to sheet" and "Print again" for re-firing or stepping back.
- **"Print" link in the regular sheet's action bar** (next to "Export JSON") that opens the print route in a new browser tab.
- **Print stylesheet** — `@page { size: A4; margin: 12mm 14mm }`, white body background, near-black text, `@media print` overrides that hide controls. Section cards apply CSS `break-inside: avoid` so the printer never splits a feature mid-paragraph.
- **Traceability footer** — `Generated by symbarator vX.Y.Z on YYYY-MM-DD` reading from `lib/version.ts`.
- **5 new E2E tests** in `e2e/print.spec.ts` covering route render, deliberate omission of companion-mode live state, the regular sheet's Print link wiring, empty-section hiding (Notes always shows), and the version+date footer format. Existing 35 tests still pass.

### Changed

- **The print route deliberately omits companion-mode live state** (`currentHp`, `tempHp`, `currentSpellSlots`, `hitDiceRemaining`, `deathSaves`, `corruption.permanent`/`temporary`). The printout is a paper-transfer artifact for the character snapshot — only the computed Corruption Threshold appears, not the running counters.
- **Visual style is paper-first**: the parchment / gradient look from the screen sheet is intentionally absent on the print route. A single crimson rule (`#7a1f1f`) under each section header is the only color accent.

[1.5.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.5.0

## [1.4.0] - 2026-05-03

Companion mode — the read-only character sheet becomes a play-time companion. Apply damage, spend slots, take rests, track death saves, and adjust Corruption directly from the sheet.

### Added

- **HP & Vitals panel** at the top of the sheet. Current/max readout (downed pill turns crimson when at 0), Damage / Heal / Set-Temp-HP inputs that apply on click or Enter. Temp HP soaks before currentHp; healing caps at maxHp; currentHp floors at 0.
- **Hit Dice tracker + "Spend Hit Die" button** inside the Vitals panel. Heals by `floor(hitDie/2) + 1 + Con mod` (min 1) and decrements `hitDiceRemaining`.
- **Death Saves panel** — appears only when `currentHp === 0`. Three success and three failure pips with explicit ✓ / ✗ buttons; counters cap at 3. Three successes shows a "Stable" indicator; three failures shows "Dead". Healing above 0 hides the panel and zeroes the counters.
- **Spell Slot pip rows** above the Spellcraft tabs (only for spellcasting approaches). One pip per slot, click filled to spend, click empty to restore. Bounded by the approach's progression at the current level.
- **Corruption parchment** with explicit `+` / `−` adjusters next to the computed Threshold; "Over" badge when `temporary > threshold`. Surfaces fields that already lived on `Character` but were never editable.
- **Rest panel** with three buttons: Short Rest (UI affordance), Long Rest (full HP, half HD restored rounded up, all spell slots, death saves cleared, temp HP cleared), Extended Rest (long rest + every Hit Die restored).
- **`lib/character/live-state.ts`** — pure-function module exporting every state transition (`applyDamage`, `applyHeal`, `addTempHp`, `spendSlot`, `restoreSlot`, `spendHitDie`, `recordDeathSave`, `shortRest`, `longRest`, `extendedRest`, `bumpCorruption`). All bound checks live here; UI never produces invalid state.
- **5 new E2E tests** in `e2e/companion.spec.ts` — damage round-trip + persistence, slot spend/restore, long rest restoration, death-saves cap-and-hide, wounded level-up keeps current HP at the offset (capacity grows, no auto-heal).

### Changed

- **Schema** — `Character` gains five required fields: `currentHp: number`, `tempHp: number`, `currentSpellSlots: number[]` (length 9), `hitDiceRemaining: number`, `deathSaves: { successes; failures }`. Pre-1.4 saves are backfilled by `migrateCharacter` on first load: `currentHp = maxHp`, `tempHp = 0`, `currentSpellSlots` from the approach's progression row at the character's level (or nine zeros for non-spellcasters), `hitDiceRemaining = level`, `deathSaves = { 0, 0 }`. No persisted save fails to load.
- **Level-up flow** now bumps live state alongside max stats: `currentHp` advances by the same delta `maxHp` does (a wounded character gains capacity, not healing); `hitDiceRemaining` increments by 1; newly-unlocked spell-slot tiers start full while already-existing tiers keep their spent count. The Confirm step now surfaces the current-HP delta and HD bump.
- **Sheet layout** — the static "Hit Points" and "Hit Dice" rows in the right-column Combat block were removed (the new Vitals panel is the source of truth). The static "Shadow & Corruption" parchment is replaced by the interactive Corruption panel. The Spellcraft parchment shows pips above the spellbook tabs.
- **Companion-mode buttons** use a Symbaroum-themed `SymButton` (crimson primary, dark-on-cream secondary) instead of shadcn `Button` defaults — the design-token palette washed out against the cream parchment background.

[1.4.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.4.0

## [1.3.0] - 2026-05-02

Boons & Burdens at character creation, with ability bonuses flowing through to the sheet.

### Added

- **Boons & Burdens wizard step** between Abilities and Skills/Equipment. Pick 0 or 1 boon and 0 or 1 burden at L1; the step is optional and skipping it is valid.
- **Choice-boon support**: when a boon's ability bonus is `"choice"` (e.g. Blood Ties, Con Artist, Enterprise), the wizard surfaces an inline ability picker. The chosen ability persists in the new `Character.boonAbilityChoices` field.
- **Boon ability bonuses honored on the sheet**. `computeFinalAbilities` now adds boon `+1`s as a fourth bonuses term alongside origin-fixed, origin-floating, and subchoice. A character with Archivist (INT +1) sees their final INT total bumped by 1 wherever it's displayed.
- **Origin restrictions for boons** — hand-coded `BOON_FORBIDDEN_ORIGINS` map blocks Absolute Memory for Dwarves and Beast Tongue for Goblins (per PG p. 147–155). Restricted boons are visibly disabled in the picker and rejected by the validator if reached via hand-edited JSON.
- **Boons and Burdens sections on the character sheet**. Resolved via `BOON_BY_ID` / `BURDEN_BY_ID`. Each section hides when its array is empty. Boons that grant an ability bonus show a `(+1 INT)`-style suffix on the card title.
- **Reusable `<FeatGroup>` component** factored out of `<FeatList>` so Boons / Burdens / level-up Feats all share the same card style without duplication.
- **6 new E2E tests** in `e2e/boons-burdens.spec.ts` covering: empty hides section, fixed-ability boon shows on sheet with chosen-ability label, choice-boon shows the chosen ability, burden shows on sheet, wizard picks Archivist and persists, choice-boon validation rejects empty advance then accepts after picking the ability.

### Changed

- **Schema** — `Character` gains a required `boonAbilityChoices: Record<string, Ability>` field. Pre-1.3 saves are backfilled with `{}` by `migrateCharacter` on first load. No persisted save fails to load.
- **Wizard `STEPS`** widens from 7 to 8 entries; the new step lives at `/builder/boons-burdens?id=<id>`.
- **`<FeatList>`'s "Boons" subgroup** renamed to "From the Boon list" to clarify it's the level-up `Character.feats` resolved against the boon catalog, not the new L1 `Character.boons`.

### Fixed

- **`/changelog` E2E selector** tightened with `.first()` — three released versions now share the date string and the previous selector matched all of them.

[1.3.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.3.0

## [1.2.0] - 2026-05-02

Release tooling: three Claude Code slash commands that automate the documented SemVer release flow.

### Added

- **`/patch`, `/minor`, `/major` slash commands** under `.claude/commands/`. Each one runs the full release flow non-interactively: preflight (clean tree, on `main`, up-to-date with `origin`), abort if no commits since the last `v*` tag, compute the next version, draft a Keep a Changelog entry from `git log <last-tag>..HEAD`, run `npm version <level> --no-git-tag-version`, commit `release: vX.Y.Z` with CHANGELOG + package.json + package-lock.json, tag, push branch, push tag.
- **Bias and guardrails per command**:
    - `/patch` biases the changelog toward `### Fixed`.
    - `/minor` biases toward `### Added` and surfaces detected breaking changes (Character/storage shape edits, modified spec scenarios) instead of silently promoting.
    - `/major` refuses to proceed without a concrete breaking change identified, and fronts the entry with an explicit `BREAKING` callout plus migration guidance.
- **Shared safety rails** across all three: halt on any failure, never amend or force-push, never re-tag an existing version, no `npm install` / `npm audit fix` side effects.

[1.2.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.2.0

## [1.1.0] - 2026-05-02

Tab-per-level spells UI and a proper grouped feat list on the sheet.

### Added

- **Reusable `<SpellTabs>` component** — one tab per spell level with a count badge, empty levels auto-hidden, default-active = lowest available. Used in three places: the sheet spellbook, the level-up picker, and the L1 builder approach step.
- **`<SpellCard>` leaf component** with `display` and `picker` modes via a discriminated union; school and ritual badges; reused inside every tabbed view.
- **`<FeatList>` component** on the character sheet — resolves boon ids via `BOON_BY_ID` and renders one card per feat (name + description). The Changeling sentinel `change-self` and `fighting-style:*` markers are grouped under a separate "Special" subsection.
- **`e2e/sheet.spec.ts`** with two tests covering the sheet spellbook tabs (renders for known levels only; clicking a tab swaps the visible pool).
- **`spell-tabs switch the visible pool when clicked`** test in `e2e/level-up.spec.ts`.

### Changed

- **Sheet spellbook** uses `<SpellTabs>` in display mode instead of two flat `<SpellList>` blocks. Only renders tabs for spell levels the character actually knows spells at.
- **Level-up `SpellsLearnedStep`** uses `<SpellTabs>` for leveled spells; cantrips stay as a flat grid above. Removed the inline `(L1)` annotation and the "Pick from any level you have slots for: 1, 2" hint paragraph since the tab row makes the available levels self-evident.
- **L1 builder `ApproachStep`** uses `<SpellTabs levels={[1]}>` so the visual language matches what the player will see at level-up time.
- **Sheet feats** rendered as a grouped card list (Boons / Special) in their own Parchment section instead of `c.feats.join(", ")` inside the Features blurb.

### Fixed

- "Higher-level spells when slots unlock" E2E test asserts tab presence (`1st`, `2nd`) instead of the deprecated hint paragraph.

[1.1.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.1.0

## [1.0.0] - 2026-05-02

First feature-complete release. The character builder ships with the full Ruins of Symbaroum 5E rules data, sheet-driven leveling from L1 to L20, an E2E test suite, and the canonical PG spell catalog.

### Added

- **L1 character builder.** Seven-step wizard (Origin → Background → Class → Approach → Abilities → Skills & Equipment → Identity) with localStorage persistence and JSON export/import.
- **Origins, classes, approaches, backgrounds, skills.** All five Symbaroum classes (Captain, Hunter, Mystic, Scoundrel, Warrior) and their approaches encoded with PG-accurate rules data.
- **Leveling from L1 to L20.** Sheet-driven Level Up dialog covering HP gain (average / rolled), ASI / feat / Changeling Change Self, fighting-style picks, and spell learning. Symbaroum places ASI/feat slots at L4/8/10/12/16/19, with Captain and Warrior gaining a bonus slot at L14 per the PG.
- **Spellcasting on approaches, not classes.** Mystic (full caster, every approach), Warrior/Templar (half caster), Hunter/Witch Hunter (ritual-only), Scoundrel/Former Cultist (half caster). Per-approach progression matches the PG charts.
- **Full spell catalog.** 297 spells across cantrips through 9th level, tagged by tradition (Sorcerer, Theurg, Troll Singer, Witch, Wizard) per PG pp. 187–190. Symbaroum-specific spells (Black Bolt, Spirit Walk, Holy Smoke, Anathema, Lifegiver, Soul Stone, Blood Storm, etc.) included with PG-derived mechanical summaries.
- **Storage migration.** Pre-leveling-shape saves load cleanly and gain `feats`/`maxHp`/widened `level` on first load.
- **End-to-end test suite.** Playwright + Chromium, 19 tests covering the L1 builder happy path, every level-up variant (including the duplicate-spell dedupe and dialog-remount regressions), schema migration, JSON round-trip, and the L20 disable. Runs in ~5 seconds via `npm run test:e2e`.
- **Versioning surface.** This changelog, plus a `v1.0.0` badge in the home footer and on the character sheet header that links here.

### Changed

- **`Character.level`** widened from the literal `1` to a `1..20` numeric union.
- **`ClassDef.spellcasting`** moved to `ApproachDef.spellcasting` so non-Mystic spellcasting approaches (Templar, Witch Hunter, Former Cultist) can carry their own progressions.
- **Mystic L1 cantrips known** corrected from 2 to 6 per PG p. 108; spells known progression set to `[2, 3, 4, …, 21]` (+1 per level).
- **Tradition tags** corrected: Artifact Crafter → Troll Singer list, Staff Mage / Symbolist → Wizard list, Former Cultist → Sorcerer list (PG pp. 111, 115, 117, 129).

### Fixed

- Dialog state retention across consecutive level-ups (`answer.pick` undefined on second open) — the sheet now keys the dialog on `${id}-${level}` so it remounts fresh each time.
- Level-up spell pickers exclude already-known spells, fixing the duplicate-Bless regression for Templars.
- Spell pickers surface every spell level the character has slots for (e.g. a Templar at L6 sees both 1st- and 2nd-level Theurg spells).

[1.0.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.0.0
