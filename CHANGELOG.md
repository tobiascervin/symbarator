# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [1.19.0] - 2026-05-05

The app is now phone-readable. Every primary surface (Home, the 7-step Wizard, the Character Sheet) and every modal (level-up, inventory, feat-tap, weapon-attack, spell-cast, ability-editor) renders without horizontal overflow at 360 px. Touch tap-targets meet 44 × 44 px. Live combat panels now sit above static reference content on phones; the desktop two-column layout is preserved at `≥ md`.

### Added

- **Mobile viewport metadata** in `app/layout.tsx` — `width=device-width`, `initialScale=1`, `viewportFit=cover`, plus a `themeColor=#efe5cb` matching the parchment cream so iOS Safari's tinted address bar aligns with the page background. `userScalable` is intentionally NOT set; pinch-to-zoom remains an accessibility lifeline.
- **`mobileVariant="bottom-sheet"`** on the shared Dialog primitive. At `< sm` modals anchor to the bottom edge, occupy full width, render with rounded top corners only, slide in from below, and respect `100dvh` (so mobile-browser chrome doesn't clip content). At `≥ sm` the existing centered behavior is preserved unchanged. All 6 modals adopted the variant — level-up, inventory, feat-tap, weapon-attack, spell-cast, and the ability-score editor.
- **`tap-target` utility** in `app/globals.css` inside `@media (pointer: coarse)`: `min-width: 2.75rem; min-height: 2.75rem` (44 px @ 16 px root). Applied to Corruption +/- buttons, HP/death-saves toggles, the rucksack inventory icon, the abilities pencil, and the Level Up trigger. Cursor viewports (`pointer: fine`) keep their existing dense sizing.
- **`e2e/mobile.spec.ts`** with 5 mobile-viewport tests at 360×800 (home / wizard step 1 / sheet HP-above-Abilities / level-up dialog bottom-anchor) plus a desktop counter-check at 1280×800 asserting the two-column grid activates and Combat sits to the right of HP. Suite total: **129/129** (was 124 at v1.18.0). Lint baseline unchanged.

### Changed

- **Character sheet primary grid** flips visual order on phones via `flex flex-col-reverse gap-6 md:grid md:grid-cols-3`. Live combat panels (Combat / Corruption / Rest / Saves) now sit above the static reference content (Abilities / Skills / Features) on phones, so phone players see HP and threshold without scrolling. DOM order is preserved (static reference first), so screen-reader linear traversal still hits Abilities before Combat — WCAG 2.4.3 trade-off documented inline.
- **Sheet header** wraps cleanly at narrow widths via `flex-wrap items-center justify-between gap-y-3 gap-x-4`. Share / Export JSON / Print / Level Up reflow onto the next line at 360 px instead of forcing horizontal overflow.
- **Header display title** (`BlackletterTitle` level-1) uses `clamp(2rem, 6vw + 0.5rem, 3.5rem)` for fluid scaling between phone (~2rem) and desktop (~3.5rem ≈ prior `text-6xl`). No JS resize listener; desktop visuals at ~1024 px+ unchanged.
- **Wizard bottom navigation** stacks vertically below `sm` (`flex flex-col-reverse gap-2 ... sm:flex-row sm:items-center sm:justify-between`) with both buttons full-width and Continue rendered visually above Back so the primary action sits closest to the thumb. Continue allows `whitespace-normal h-auto py-2` so the dynamic next-step label can wrap without overflowing the button.
- **Wizard card-grid breakpoints standardized.** `class-step.tsx`, `background-step.tsx`, and `approach-step.tsx` migrated `md:grid-cols-2` → `sm:grid-cols-2` so the two-column band begins at the same breakpoint across the wizard. `skills-equipment-step.tsx` keeps its tighter `sm:grid-cols-2 md:grid-cols-3` (skills are short labels and benefit from a denser tablet grid) with an inline comment citing the decision.
- **Home page per-character row** stacks `flex-col` on phone with the action buttons row picking up `flex-wrap`, so name + Edit / Export / Delete don't fight for ~300 px of content width at 360 px.
- **Level-up dialog inner scroller** switched `max-h-[60vh]` → `max-h-[60dvh]` so mobile-browser chrome (URL bar) doesn't clip content.

[1.19.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.19.0

## [1.18.0] - 2026-05-05

The character sheet's global "Edit" link is gone. Common ability-score adjustments — the only edits the global link was actually safe for at L1 and unsafe for at L≥2 — now happen in-place via a pencil icon on the Abilities panel header (L1 only), opening a dialog that hosts every input contributing to the final ability scores. Above L1 the trigger does not render; the wizard URL still resolves for power-users who type it manually.

### Added

- **In-place ability-score editor at L1.** A pencil icon in the Abilities panel's section header opens a modal with the same input methods as the wizard's Abilities step (Standard Array / Point Buy / Manual), plus every modifier source that contributes to `computeFinalAbilities`: origin floating ASI (with the origin's `from:` whitelist enforced), choice-boon ability picks, and choose-one / choose-two burden ability picks. A read-only summary lists the origin's fixed and sub-choice ASI contributors. A live Final Ability Scores card updates as any input changes, sourced directly from `computeFinalAbilities(draft)` so there's no second source of truth.
- **`validateAbilityEdit(c)`** in `lib/character/validation.ts` composes the wizard's per-step validators (origin floating ASI total + `from:` enforcement, boons-burdens choice picks) plus two defensive checks the wizard's UI handles implicitly (point-buy budget exact at 27, standard-array permutation complete). Returns `{ ok: true } | { ok: false; reason: string }`. The dialog's Save button is disabled while the result is `ok: false` and surfaces the reason inline.
- **Six shared picker components** under `components/builder/pickers/` — `StandardArrayPicker`, `PointBuyPicker`, `ManualPicker`, `FloatingAsiPicker`, `BoonAbilityChoicePicker`, `BurdenAbilityChoicePicker`. The wizard's L1 steps now consume these directly, so wizard and editor behavior cannot drift. `FloatingAsiPicker` carries an opt-in `compact` prop the dialog passes to lay out its 6 ability cells as 2 rows × 3 cells inside the narrower modal width.
- **`e2e/ability-score-editor.spec.ts`** with 8 new tests: no global Edit link, pencil presence at L1, manual-mode persistence, Human floating ASI re-allocation, Blood Ties choice-boon switch, point-buy over-budget Save gate, Cancel discards the draft, L≥2 has no pencil. Suite total: **124/124** (was 116 at v1.17.0). Lint baseline unchanged.

### Changed

- **Removed the global "Edit" link** from the character-sheet header. Share, Export JSON, Print, and Level Up are untouched. The wizard route at `/builder/<step>?id=<characterId>` is intentionally NOT locked — the URL still resolves for power-users with bookmarks. Common ability-score edits now happen in-place via the pencil icon (L1 only); other post-creation edits remain available via JSON import/export or the wizard URL.
- **Dialog reset semantics use a parent-side `key` prop** rather than a `useEffect` + `setState`. The parent flips `key={open ? "open" : "closed"}` so the dialog remounts on each open; the lazy `useState(() => snapshot(character))` initializer re-seeds the draft from the persisted character. Avoids React 19's setState-in-effect lint warning while preserving the "Cancel discards" semantics.

[1.18.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.18.0

## [1.17.0] - 2026-05-05

The spell cast popover stops showing stats the player would never roll for the spell open in front of them. The catalog already structured this via `effect.kind`; the popover just didn't gate on it. As a small but related correctness fix, save spells now label their DC with the spell's save ability instead of the caster's spellcasting ability — so a Wizard Mystic's Sacred Flame popover reads `DC 12 (DEX)`, not `DC 12 (INT)`.

### Added

- **Mode-gated computed-numbers band on `<SpellCastPopover>`.** The band now picks visible stats by `effect.kind`: attack spells show Spell Mod + Attack; save spells show Spell Mod + Save DC; heal, utility, and description-only spells show Spell Mod alone. Spell Mod stays visible whenever the character has a spellcasting ability — it's the parameter behind every other stat (Attack = prof + spellMod, DC = 8 + prof + spellMod) and a useful reference even when the popover doesn't model the attack itself. The 3-cell case is unreachable now (no kind shows both Attack and Save DC), so the grid adapts to 1 or 2 columns and cells stay readable instead of stretching.
- **Two new E2E tests** in `e2e/spell-cast.spec.ts`:
    - `utility-spell popover shows only Spell Mod (no Attack, no Save DC)` — opens Mage Hand on the seeded Mystic and asserts the band's contents. Exact-match locators are required because the EffectBand's utility prose reads "no save, no attack — utility effect".
    - `save-spell popover shows Spell Mod + Save DC with the spell's save ability` — seeds Acid Splash (Wizard tradition, Dex save) on a Mystic and asserts the DC cell label is `12 (DEX)` not `12 (INT)`, plus the absence of the Attack cell.
- Suite total: **116/116** (was 114 at v1.16.0).

### Changed

- **Save DC label uses the spell's save ability, not the caster's spellcasting ability.** Sacred Flame's save is Dex regardless of whether the caster's spellcasting ability is Int (Wizard), Wis (Templar), or Cha (Sorcerer). Previously the popover always wrote the caster's ability into the DC label, which produced technically-wrong copy like `DC 12 (INT)` on a Wizard Sacred Flame. Save DC labels now read `(DEX)`, `(CON)`, etc. per `resolveSpellEffect(spell, c, castAt).saveAbility`. The numeric value is unchanged.
- **Existing Fire Bolt assertion** in the spell-cast E2E suite dropped its `12 (INT)` Save DC check (Fire Bolt is `kind: "attack"`; the cell no longer renders) and added a `Save DC` absence check.

[1.17.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.17.0

## [1.16.0] - 2026-05-04

The level-up dialog's ASI/Feat picker becomes a sectioned card grid mirroring the L1 boons step's visual, and origin and class feats from PG p. 153–157 are now selectable. Players see every available feat's bonus, prerequisite, and full description without picking it first; class feats with unmet prerequisites surface as disabled cards with a one-line reason. Changeling characters now take Change Self through the same picker — the legacy third radio is gone.

### Added

- **Sectioned feat picker at level-up.** The ASI/Feat step's flat `<Select>` of 36 boons is replaced by a binary ASI/Feat radio plus three labelled card grids — **Boons**, **Origin Feats**, and **Class Feats** — that mirror the L1 boons step's visual one-for-one (same `<FeatPickCard>` component). Empty sections are omitted; cards show name, ability-bonus badge, prerequisite text, and full description without selection.
- **Disabled-with-reason cards.** Feats with unmet prerequisites (ability score, class level, approach, mutual exclusion, already taken, forbidden by origin) render with the dashed-border + opacity-50 affordance and a one-line reason inline (e.g. *"Requires Strength 13 — you have 12"*, *"Cannot be combined with Confessor"*, *"Already taken"*). The same predicate (`featAvailability(c, feat)`) backs both the UI gating and the persistence-time validator, so the two cannot drift.
- **8 origin feats per PG p. 153** in the catalog: Shadow-sight (Abducted/Humans), Change Self (Changelings), Retribution (Dwarves), Ancient Magic (Elves), Tough and Stringy (Goblins), Big-boned (Ogres, +1 STR), Robust (Trolls), Ravenous Hunger (Undead). Each declares its `origins` whitelist; Big-boned carries `abilityBonus: { ability: "str", amount: 1 }`.
- **21 class feats per PG p. 155–157** across all five classes:
    - **Captain**: Battle Speech (Cha 13+), Command Expert, Parry (Str/Dex 13+).
    - **Hunter**: Overwatch, Ranged Expert, Trick Shot (Dex 13+).
    - **Mystic**: Combat Magic Expert; Confessor (Theurg + L11+, mutually exclusive with Inquisitor); Dedicated Focus (spellcasting 13+); Demonologist (Sorcerer + L7+); Extensive Learning (spellcasting 13+); Inquisitor (Theurg + L11+, mutually exclusive with Confessor); Necromancer (Sorcerer + L9+); Pyromancer (Wizard + L9+); Secrets of the Order (Staff Mage + L11+).
    - **Scoundrel**: Nimble (Dex 13+), Shadow Walker (Dex 13+), Skirmish Expert.
    - **Warrior**: Bull Rush (Str 13+), Grappler (Str 13+), Melee Expert.
    - Approach-gated Mystic feats only appear at all for the matching approach (e.g. Pyromancer is invisible to non-Wizards) — section-level filtering, not card-level disabled.
- **Sheet-side rendering for origin and class feats.** The character sheet's Feats list and the printable sheet now resolve every feat id through a unified `FEAT_BY_ID` lookup. Cards section into "From the Boon list" / "Origin Feats" / "Class Feats" / "Special" and previously-saved `"change-self"` ids automatically render with the PG p. 153 description text — no migration.
- **`e2e/feat-picker.spec.ts`** with 6 new tests covering the sectioned grid, ability-prerequisite gating, Changeling Change Self path, Confessor↔Inquisitor mutual exclusion, data-integrity (FEAT_BY_ID resolution + classId/approachId correctness against `CLASS_BY_ID`/`ORIGIN_BY_ID`), and a hard-coded **class-feat-isolation guard** that pins every PG class-feat id to its expected `classId`. Suite total: **114/114**.

### Changed

- **Type model.** `lib/character/types.ts` introduces `FeatCategory = "boon" | "origin" | "class"` and a unified `FeatDef` interface that subsumes the old `BoonDef` shape and adds the gating fields above. `BoonDef` becomes a type alias `FeatDef & { category: "boon" }` to preserve all import sites; `BOONS` and `BOON_BY_ID` stay exported as filtered views over the new unified `FEATS` array.
- **`LevelChoiceAnswer` shape.** The `{ type: "change-self" }` arm is gone; Change Self is now `{ type: "feat", featId: "change-self" }` like every other feat. The `LevelChoiceAnswer` discriminated union loses one in-memory variant — no on-disk save shape changes since the dialog persists nothing mid-session.
- **`BOON_FORBIDDEN_ORIGINS` retired.** The hand-coded `Record<boonId, originIds[]>` map in `lib/character/validation.ts` is gone; both the L1 boons-step UI and the L1 validator now read `FeatDef.forbiddenOriginIds` directly. Single source of truth.

### Fixed

- **Skirmish Expert filed under the correct class.** The original proposal misfiled Skirmish Expert as a Warrior class feat; per PG p. 156 it's a Scoundrel feat. Catalog entry corrected; the new class-feat-isolation E2E test pins this down so the bug can't recur.

[1.16.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.16.0

## [1.15.1] - 2026-05-04

Fixes the Templar approach's Corruption Threshold to honor PG p. 143's wis-or-cha rule. Templar characters whose Wisdom modifier exceeds their Charisma modifier had been getting an undercount that made their threshold lower than the PG specifies.

### Fixed

- **Templar Corruption Threshold now uses `max(chaMod, wisMod)`** per PG p. 143: *"If your Wisdom modifier is higher than your Charisma modifier, you can use it instead of Charisma to calculate your Corruption Threshold."* Previously the formula always used Charisma for any Warrior approach (because the formula selection happens at the class layer and the approach had no way to influence it), undercounting the threshold for Templars whose Wis exceeds their Cha. The fix is approach-level data: a new optional `corruptionAbilityOverride: Ability` on `ApproachDef`, declared as `"wis"` only on Templar. When set on an approach whose parent class has `shadowFormula: "standard"`, the formula becomes `max(2, 2 × profBonus + max(chaMod, overrideMod))`. Non-Templar Warrior approaches (Berserker, Wrathguard, Rune Smith, Weapon Master) keep the unmodified standard formula. Mystic-formula classes ignore the field — their ability still comes from `spellcasting.abilityHint` exclusively. Existing Templar saves see a corrected (and usually higher) threshold the next time their sheet renders; no migration required because Corruption Threshold is computed at render time.

### Notes

- **Schema is unchanged** — `Character` JSON shape is identical, no migrator change. The new field lives on the static `ApproachDef` data type, not on the persisted character.

[1.15.1]: https://github.com/tobiascervin/symbarator/releases/tag/v1.15.1

## [1.15.0] - 2026-05-04

Equipment becomes first-class on the character sheet. Weapons and armor now live as structured catalog entries (PG p. 162–171) under a dedicated Combat section with tap-to-attack popovers and a real AC readout, players can manage their inventory mid-game via a rucksack modal that adds/removes items and persists, and the wizard finally asks which weapon to take when the class equipment line says "a martial weapon" instead of letting the placeholder fall through to gear.

### Added

- **Weapon and armor catalogs** in `data/equipment.ts` covering PG p. 162–171: 60+ `WeaponDef` entries across simple/martial × melee/ranged plus alchemical and siege, and `ArmorDef` entries across light/medium/heavy/shields. Each carries damage dice or AC formula plus Symbaroum properties (finesse, versatile, deep-impact, ensnaring, massive, restraining, returning, balanced, concealed, …) and 5e SRD aliases ("Chain mail", "Leather armor", "light crossbow"→"Crossbow, light").
- **Combat section restructure on the character sheet.** Initiative / AC / Speed / Proficiency now sit alongside two new subsections — Weapons and Armor — inside the Combat parchment. The standalone Equipment parchment narrows to non-weapon, non-armor items (adventuring packs, ammo qualifiers, free-text gear, background equipment prose).
- **`computeAC`** following PG p. 168–171 (unarmored 10+Dex; light base+Dex; medium base+min(Dex, 2); heavy base; +2 shield).
- **Tap-to-attack weapon popover** modeled on the spell-cast popover. Reads attack bonus and damage off the character: STR for melee, DEX for ranged, max(STR, DEX) for finesse, with versatile weapons rendering both 1H and 2H damage rows and a Symbaroum property badge row underneath.
- **Inventory modal** (rucksack-icon-with-text "Inventory" button beside the Combat and Equipment headings). Three tabs (Weapons / Armor / Gear) with search, category-grouped catalog lists in collapsible groups (search auto-expands matching groups), free-text Gear input, and a Current Inventory list with per-item remove buttons. Mutations persist through localStorage and JSON export/import.
- **Wizard dropdown for class-equipment placeholders.** Captain and Warrior starting-equipment lines like "a martial weapon" / "two martial weapons" / "a simple ranged weapon" now render an inline `<Select>` directly under the chosen radio option. The wizard validator blocks Continue when any placeholder slot is unfilled or out-of-category, and the resolver substitutes the catalog name into the inventory before tokenization — so the chosen item surfaces as a real tap-to-attack weapon card under Combat → Weapons rather than as free-text gear. Existing pre-1.15 saves with unfilled placeholders fall through to gear unchanged (back-compat).
- **E2E coverage**: `e2e/weapon-attack.spec.ts` (4 tests — armored Warrior AC, unarmored Mystic AC, Mystic quarterstaff popover, finesse dagger picks DEX), `e2e/inventory-modal.spec.ts` (7 tests — open, add weapon, add catalog armor including the "Concealed Armor" suffix regression, add free-text gear, remove chain shirt drops AC, migrator backfill), `e2e/post-creation-equipment.spec.ts` (Warrior/Mystic catalog items surface under Combat → Weapons / Armor and never duplicate as gear; Warrior with "two martial weapons" produces both picks). Builder happy-path updated to fill the martial-weapon Select with "Longsword". Suite total: 103/103.

### Changed

- **Schema (additive).** `Character` gains two required fields, both backfilled by the migrator for pre-1.15 saves and idempotent on already-migrated saves: `inventoryOverrides: { added: string[]; removed: string[] }` (delta on top of `classEquipmentPicks`) and `classEquipmentChoices: Record<number, string[]>` (catalog names keyed by equipment line index, ordered list per placeholder slot). New characters initialize both empty.

### Fixed

- **Catalog armor names ending in " Armor" routed to gear.** The resolver in `lib/character/equipment.ts` previously stripped the trailing " armor" suffix unconditionally before looking up the catalog, which broke Concealed Armor, Crow Armor, Laminated Armor, Field Armor, Field Armor of the Pansars, and Leather armor. Now tries candidate keys in order — alias → as-is → stripped — so suffix-bearing catalog names match before the fallback fires.

[1.15.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.15.0

## [1.14.2] - 2026-05-04

Fixes the Human origin's floating ASI rule (which was too permissive vs PG p. 71) and tightens the origin-step allocator UI to show the origin's fixed bonus inline.

### Fixed

- **Human floating +1 is now restricted to DEX, CON, or CHA** per PG p. 71 ("Increase Dexterity, Constitution or Charisma by 1"). Previously the rule was encoded as `any-other`, which let a player allocate the floating to INT or WIS — outside RAW. The picker disables the `+` buttons for STR (fixed), INT, and WIS; the validator rejects out-of-list allocations on advance as defense in depth for hand-edited saves. Audited the other eight origins against the PG: Human is the only one with a restricted RAW list, so all others stay `any-other`.
- **Origin-step allocator now folds the origin's fixed ASI into each cell's main `+{value}`.** Previously the cells showed only the player's floating allocation, hiding the origin's fixed bump entirely (a Human's STR cell read `+0` even though the origin grants `+2`). The cell value is now `fixed + floating`, and the `+`/`−` buttons modify only the floating portion — Human's STR cell now reads `+2` directly with the buttons disabled, while DEX/CON/CHA show `+0` then `+1` after the player allocates.

### Notes

- **Existing Human characters with an out-of-list allocation** (e.g. `originAsiAllocation: { int: 1 }`) keep their saved value on load — there's no migration. The next time they visit `/builder/origin`, the `−` button still works to bring the allocation back to 0; the `+` button on INT/WIS is disabled, so they re-allocate to a legal ability. Continue is gated by the new validator check, so they can't advance with the illegal allocation. No silent stat changes.
- **Schema change is additive** — `AbilityScoreBoost.floating` gains an optional `from?: ReadonlyArray<Ability>`. Origins without the field continue to validate. No `Character` shape change; saved characters still load.

[1.14.2]: https://github.com/tobiascervin/symbarator/releases/tag/v1.14.2

## [1.14.1] - 2026-05-04

Fixes a wizard preview discrepancy where origin sub-choice ASI was silently dropped from the abilities-step display, even though the downstream sheet handled it correctly.

### Fixed

- **Wizard's "Final Ability Scores" now folds origin sub-choice ASI into the displayed bonus.** The abilities step previously read `origin.asi.fixed + originAsiAllocation` only — Human → Ambrian's `+1 INT` and Barbarian's `+1 WIS` (and Goblin clan ASIs) silently dropped from the wizard preview, so a Human/Ambrian character looked like INT 13 in the wizard but landed on the sheet at INT 14. The displayed bonus now sums fixed + floating + sub-choice, matching the origin portion of `computeFinalAbilities`. Switching the sub-choice on `/builder/origin` (Ambrian ↔ Barbarian) updates the abilities step on next visit.
- **Re-enabled the regression test that surfaced this bug.** `e2e/origin-asi.spec.ts:Human sub-choice ASI updates the abilities-step display when toggled` was wrapped in `test.fail()` in v1.14.0 as a tripwire for this fix; with the fix landed it's now a regular `test()` and a forward-going regression guard. Suite total: **86 passing**.

[1.14.1]: https://github.com/tobiascervin/symbarator/releases/tag/v1.14.1

## [1.14.0] - 2026-05-04

E2E coverage for origin ASI propagation through the wizard. The single most rules-load-bearing piece of math in the L1 builder — origin fixed bonuses, floating allocations, and sub-choice ASI flowing into the abilities step's "Final Ability Scores" display — is now exercised end-to-end against the live wizard (no LocalStorage seed). One of the three new tests deliberately lands red as `test.fail()`, surfacing a real bug in `abilities-step.tsx` that the design doc anticipated and the next release will fix.

### Added

- **`e2e/origin-asi.spec.ts`** with three Playwright tests under `Origin ASI propagation`:
  - **Fixed + floating** — Abducted Human (fixed `{dex: 1, wis: 1}` + 1×+2 floating), allocates the +2 to STR, walks the wizard to `/builder/abilities` on Standard Array, asserts STR shows `base 8 +2` (total 10), DEX `base 10 +1` (11), WIS `base 14 +1` (15), and CON/INT/CHA have no bonus addend on their base lines.
  - **Sub-choice toggle** *(`test.fail()`)* — Human + Ambrian (`{int: 1}` sub-choice ASI) + 1×+1 floating to CHA, asserts STR/INT/CHA bonuses on the abilities step, then navigates back to `/builder/origin`, switches to Barbarian (`{wis: 1}`), and re-asserts. The test asserts the *correct* expected behavior; today's `abilities-step.tsx` reads only `origin.asi.fixed` and `originAsiAllocation` (not `subchoice.asi`), so the assertion fails as expected — wrapped in `test.fail()` to keep CI green. When the follow-up fix lands, this test will start passing and Playwright will flag it as "expected to fail but passed", forcing whoever shipped the fix to flip it back to a regular `test()`.
  - **Floating-allocation gate** — picks Abducted Human, clicks Continue without allocating, asserts the URL stays on `/builder/origin` and the validator's `Allocate exactly 2 bonus points` toast appears; allocates and re-clicks Continue, asserts `/builder/background`.
- **Three test helpers** in the same file: `finalCell(page, label)` scopes assertions to the "Final Ability Scores" card by `data-slot="card"`; `originCard(page, name)` resolves origin cards by their `data-slot="card-title"` since `role="button"` accessible names include flavor + ASI summary; `applyStandardArray(page)` round-trips Manual → Standard Array tabs to load the array values, since `setMethod`'s side-effect only fires on tab change (the default `draft.abilities` is all 10s).
- Suite total: **86 passing** (up from 83 at the v1.13.0 baseline).

### Notes

- **No production code change.** This release is pure test-coverage. The known sub-choice-ASI bug surfaced by the second test is intentionally left to a follow-up change rather than fixed here.
- **`test.fail()` as a regression tripwire** — Playwright treats a passing `test.fail()` as a failure. Once the abilities-step fix ships, the next CI run will turn red until someone removes the `.fail()` annotation, validating that the fix actually resolved the bug the test was tracking.

[1.14.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.14.0

## [1.13.0] - 2026-05-04

The level-up dialog's optional "swap a known spell" picker is now reversible — pick a swap target by mistake and you can back out without losing the rest of your level-up answers. Adds a ghost-variant `Clear swap` button beside the two swap selects that resets both fields together. Visible only when one or both swap fields are set, so the default presentation is unchanged.

### Added

- **`Clear swap` button in the level-up swap picker** (`components/level-up/level-up-dialog.tsx#SwapPicker`) — sits next to the helper text, ghost variant, `aria-label="Clear swap"`. Renders only when `swappedSpellOut || swappedSpellIn` is set; clicking it calls `onChange(undefined, undefined)` so both fields reset to the unset state in one tap. The shadcn/Radix `Select` primitive forbids `value=""` items, which is why the abandoned-swap path needed an out-of-band control rather than a `— none —` entry inside the dropdown.
- **New E2E test** (`e2e/level-up.spec.ts`) — Mystic at L1→L2 (where `canSwap: true` fires and `+1 spell known` is required): pick a swap-out value, assert the Clear swap button appears, click it, assert both swap selects return to their placeholder text and the Clear swap button disappears, then pick the required new spell and confirm — `spellPicks.spellsKnown` keeps the original `magic-missile` and `shield` and grows by exactly one. Suite total: **83 passing**.

### Changed

- **`SwapPicker` layout** — the helper text and the (conditional) Clear swap button now live in a flex row above the two-column select grid, so the keyboard tab order goes: helper text → Clear swap → swap-out → swap-in.

### Fixed

- **`react-hooks/rules-of-hooks` violations in the wizard's approach step** — the v1.12.0 templar-bless work added `useMemo` calls below the component's early returns, which works but trips the lint rule (and risks runtime hook-order mismatches if the early returns reshuffle later). Hoisted all three `useMemo` calls above the early returns and dropped an unused `grantedSpells` const. No functional change in the approach step; lint count drops by 1 against the v1.11.0 baseline.

### Notes

- **No `Character` schema change.** `LevelChoiceAnswer.swappedSpellOut` and `swappedSpellIn` were already `string | undefined` and the validator already treats both-undefined as a no-op, so the new control is a UI-only addition. No migration.
- **The known spell to be swapped out displays as a raw spell id** (e.g. `magic-missile` rather than `Magic Missile`) when picked from the swap-out dropdown — pre-existing behavior; the dropdown's name lookup uses the new-spell pool, which excludes already-known spells. Tracked as a separate follow-up; the new test asserts on the id text to avoid coupling the swap-clear scope to that fix.

[1.13.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.13.0

## [1.12.0] - 2026-05-04

Templar approach now grants the *bless* spell automatically, on top of the player's L1 spell picks (PG p. 143: "you learn 2 cantrips and 1 first-level spell from the Theurg tradition list, plus the bless spell"). Adds a generic `alwaysKnownSpells` list to `ApproachSpellcasting` so any approach can grant fixed spells without burning the player's choice budget — Templar declares `["bless"]` today, the door is open for future approaches with no further schema work. Granted spells surface as a read-only "Always known" section in the wizard, render with a "Granted" badge in the sheet's spellbook, and route through the existing cast popover with no extra plumbing. The wizard's cantrip picker also gains the same collapsible header treatment that the 1st-level picker got in v1.11.

### Added

- **`ApproachSpellcasting.alwaysKnownSpells?: ReadonlyArray<string>`** — an optional list of spell ids the approach grants automatically, in addition to (not instead of) the player-chosen `cantripsKnownAt1` / `spellsKnownAt1`. The Templar declares `["bless"]`. Approaches that don't grant any always-known spells leave the field undefined.
- **`computeSpellcasting(c).grantedSpells: ReadonlyArray<string>`** — the new field returns whatever the approach declared (or `[]` when undefined). Sheet rendering, printable rendering, and any future caller can look up the granted set without re-reading the approach themselves.
- **Module-load sanity check** in `data/classes.ts` walks every approach's `alwaysKnownSpells` and asserts each id resolves in `SPELL_BY_ID` — throws in dev, `console.error`s in prod, parity with the surrounding level-table assertions. A typo like `"bles"` is caught the moment the data file loads.
- **Read-only "Always known (granted by your approach)" section** in `components/builder/approach-step.tsx` — listed above the cantrip / 1st-level pickers when the approach declares granted spells. Each entry is a non-interactive card with the spell's name, school, and description, plus a dashed-border treatment so it reads visually distinct from the pickable options.
- **"Granted" badge on the sheet's spellbook** — the bless card in the Templar's 1st-level section now shows a primary-fill `Granted` badge alongside the existing school / ritual badges so the player can tell at a glance which spells they cannot swap. Plumbed via a new optional `granted?: boolean` on `SpellCard`'s display variant and `grantedSpellIds?: ReadonlySet<string>` on `SpellTabsMode.display`.
- **`e2e/templar-bless.spec.ts`** with 7 tests: sheet shows Bless with the Granted badge even when the player picks a different 1st-level spell, granted Bless casts through the standard popover, `computeSpellcasting` exposes `grantedSpells: ["bless"]` at every level L1–L20, `TEMPLAR_SPELLCASTING.alwaysKnownSpells` resolves in the catalog, `validateStep("approach")` accepts a Templar with non-bless picks, the wizard's approach step hides Bless from the picker pool while listing it in the Always-known section, and the cantrip picker renders as a collapsible section. Suite total: **82 passing**.

### Changed

- **`<SpellTabs>` display mode** accepts an optional `grantedSpellIds: ReadonlySet<string>` — when present, matching cards render the "Granted" badge. Picker mode is unaffected.
- **Sheet spellbook merge** in `components/sheet/character-sheet.tsx#SheetSpellbook` and `components/sheet/printable-sheet.tsx#SpellList` now de-dupes the resolved spell ids via `new Set([...cantrips, ...spellsKnown, ...grantedSpells])` so a save that happens to also list a granted id in `spellPicks.spellsKnown` doesn't render the same card twice.
- **Spellcraft section visibility gate** widens to render whenever the character has any picks *or* any granted spells, so a fresh Templar with empty `spellPicks` (until the wizard finishes) still shows the Spellbook with bless on the sheet.
- **Wizard cantrip picker** in `components/builder/approach-step.tsx` is now `<SpellTabs levels={[0]} mode="picker">` instead of a hand-rolled `<Label>`/`<Checkbox>` grid. It picks up the same collapsible header (with total-count + selected-count badges) the 1st-level picker uses. Behavior is unchanged — same `cantripsKnownAt1` cap, same toggle handler — but the layout is consistent across both pickers.
- **Picker pools filter granted spells out** — `cantripOptions` and `spellOptions` in the wizard's approach step now `.filter(s => !grantedSet.has(s.id))`, so granted spells can't appear as a pickable checkbox. Bless still shows in the read-only "Always known" section above the pickers.

### Notes

- **No `Character` schema change.** Granted spells are derived from the approach, never persisted to `c.spellPicks`. Existing characters automatically gain bless on next render — no migration. The L1 spell-pick validator in `lib/character/validation.ts` is unchanged: it inspects `c.spellPicks.cantrips.length` and `c.spellPicks.spellsKnown.length`, both unaffected by grants.
- **Granted spells are intentionally not blocked at level-up.** A fresh Templar at L3 *could* still pick bless from the new-spells pool (the level-up validator's "already known" set tracks `c.spellPicks.spellsKnown` only). Visual signal — the "Granted" badge — is the chosen mitigation per the design doc; future-tracked as a follow-up if it bites a player in practice.
- **Higher-tier always-known spells (e.g. oath spells unlocked at L3/L5) are out of scope.** Today's flat per-approach list is forward-compatible: when that need arises, evolve `alwaysKnownSpells` to `ReadonlyArray<{ spellId: string; minLevel?: number }>` without touching call sites.

[1.12.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.12.0

## [1.11.0] - 2026-05-04

Collapsible spell-level sections in the shared spell picker. The per-level tab strip in `<SpellTabs>` is replaced with one collapsible section per level — Cantrips, 1st, 2nd, … — all expanded by default so the player sees the full accessible catalog at once. Click a header to collapse just that section; siblings stay open. In picker mode each header shows a "selected" badge counting the player's picks at that level, so a player can collapse a level they've finished picking from without losing context. Affects all three call sites (Approach step, Level-Up dialog, companion sheet) without changing their source — the public `<SpellTabs>` API is unchanged.

### Added

- **`<Collapsible>` shadcn-style primitive** in `components/ui/collapsible.tsx` (`Collapsible` / `CollapsibleTrigger` / `CollapsibleContent`) — a small wrapper around Base UI `Collapsible` matching the project's `base-nova` style. Defaults to `defaultOpen: true`, exposes `data-slot` attributes for scoped styling, and uses Base UI's CSS-grid open/close transition (`grid-rows-[0fr] ↔ [1fr]` with an inner `overflow-hidden` wrapper) for animated collapse. Lives in `components/ui/` rather than inside the spell picker because it's generic — future surfaces (boon/burden picker, grouped feature lists) can reuse it.
- **Per-level "selected" badge in picker mode** — when `<SpellTabs>` is in `picker` mode and `mode.selected` overlaps a level's spells, the section header renders a second badge (primary fill, distinguishable from the secondary-fill total-count badge) with the count of selected spells in that level. Zero-count levels render no selected badge. Badge stays visible when the section is collapsed, so a player can compress a level they've finished picking from and still confirm their distribution at a glance.
- **`e2e/spell-picker-collapse.spec.ts`** with 2 new tests: (a) sections start expanded with `aria-expanded="true"`, clicking a header toggles only that section while siblings stay open, a 2nd-level spell card stays visible while the 1st section is collapsed; (b) selecting a 1st-level spell adds the "selected" badge to the 1st header, collapsing the section preserves the badge. Suite total: **75 passing**.
- **New `spell-picker-ui` capability spec** in `openspec/specs/spell-picker-ui/` — six requirements covering the collapsible layout, default-expanded state, click/keyboard toggling, total-count badge, picker-mode selected-count badge, and per-section scroll preservation.

### Changed

- **`<SpellTabs>` internals** are reworked from `Tabs` / `TabsList` / `TabsTrigger` / `TabsContent` to a flex column of `<Collapsible defaultOpen>` blocks, one per visible level. The `useMemo`'d `grouped` map, `sortedLevels`, and `visibleLevels` filter are unchanged. The `useState` / `active` / `setActive` pair is gone — collapse state is local to each `<Collapsible>` and not persisted. Per-section scroll (`max-h-72 overflow-y-auto`) is preserved verbatim, so a single very-large level still scrolls within its own block.
- **Section header layout** — chevron (`lucide-react` `ChevronRight` rotated 90° on `data-panel-open`), level label (`"Cantrips"`, `"1st"`, …) in display font, then the existing total-count `<Badge variant="secondary">`, plus the new picker-mode selected-count `<Badge variant="default">`. The header is a `<button>` (Base UI `Collapsible.Trigger`) so Enter/Space toggle the section and `aria-expanded` reflects state without extra ARIA wiring.
- **`<SpellTabs>` JSDoc** updated to describe the collapsible behavior — replaces the "Tabbed spell list" sentence with "Collapsible spell list, one section per level, all expanded by default".
- **`SpellTabsProps.defaultLevel`** is now JSDoc-deprecated (`@deprecated since this change — the collapsible layout shows all levels; this prop is ignored.`). The prop is kept on the type to avoid breaking the three call sites that pass it; the component no longer reads it. A follow-up cleanup change can drop it entirely.
- **E2E selectors migrated off `getByRole("tab", …)`** — `e2e/sheet.spec.ts` and `e2e/level-up.spec.ts` now look up the section triggers as `getByRole("button", { name: /^1st/ })` etc. `e2e/spell-cast.spec.ts:90` (the Magic Missile cast test) drops its tab click entirely — the 1st-level section is expanded by default, so Magic Missile is visible without a header click. The `sheet.spec.ts` "clicking a tab swaps the visible spell list" case is repurposed to assert that all known-spell levels render in one page (Magic Missile visible without any click).

### Notes

- **No schema changes.** No `Character` migration, no storage shape change, no `<SpellTabs>` API change at the call-site level. All three consumers (`approach-step`, `level-up-dialog`, `character-sheet`) get the new layout for free.
- **Collapse state does not persist.** Closing and re-opening the level-up dialog (or remounting the sheet) resets every section to expanded. Local component state is intentional — the proposal calls out that players opening the dialog want to *see* the catalog before committing, and persisted collapse would force every player to re-expand on every visit.
- **Printable sheet is unaffected.** It does not use `<SpellTabs>` and renders its own grouped list for print.

[1.11.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.11.0

## [1.10.0] - 2026-05-04

Tap-to-detail popover for feats and class features. Click any boon, burden, level-up feat, or class/approach feature on the sheet and a popover opens with the entry's name, source label, computed badges, structured effect (where encoded), and — for tracked features like Battle Wind, Action Surge, Indomitable, and Berserker Rage — a usage counter and a "Use" button that decrements via the same `live-state` pattern that powers spell slots and Hit Dice.

### Added

- **`<FeatTapPopover>`** in `components/sheet/feat-tap-popover.tsx` — the parallel of `<SpellCastPopover>` for non-spell sheet entries. Built on the same `Dialog` primitive. Header shows the entry's name + source label ("Warrior L1", "Berserker L1", "Boon", "Burden", "Origin: Abducted Human", etc.). Boon/burden bonuses (`+1 INT`, `+2 CON`) carry into the popover as badges. For features with structured `effect` data, the popover shows a resolved formula (e.g. "2d4+3 temp HP" with the character's CON mod folded in). For features with structured `usage`, the popover surfaces "<remaining> of <max> left" + a "Use" button (disabled at 0). Description always renders at the bottom.
- **New optional fields on `FeatureDef`** (the inline shape used by every class L1, per-level, and approach feature): `id?: string` (stable id for usage tracking — class-prefixed by convention, e.g. `"warrior:battle-wind"`), `usage?: FeatureUsage`, and `effect?: FeatureEffect`. All three are optional; existing entries continue to validate. Adding tracking to a feature is a one-line additive content edit.
- **`FeatureUsage` and `FeatureEffect` types**: `usage: { count: number | "profBonus" | "level"; per: "short-rest" | "long-rest" }` — string sentinels resolve at display time, so `count: "profBonus"` automatically scales with character level. `effect` is a discriminated union with `{ kind: "tempHp"; dice; addAbilityMod? }` and `{ kind: "passive"; note? }` (extensible).
- **`Character.featureUses: Record<string, number>`** — remaining uses keyed by feature id. Lazy: absence of an entry is treated as full uses (the popover lazy-initializes to max on first decrement). Migrator backfills `{}` for pre-1.10 saves; idempotent.
- **`lib/character/features.ts`** — new module exposing `resolveFeatureUsageMax`, `resolveFeatureEffect`, `featureSourceLabel`, `findTrackedFeatures` (walks class L1 + per-level + approach features, last-write-wins for repeated ids so the higher-level entry overrides — e.g. Action Surge L2 has 1 use, L15 has 2; same id, L15 wins at character L15+), and `remainingUses` (lazy-init from max).
- **`useFeature(c, id)` and `restoreFeature(c, id)`** in `lib/character/live-state.ts`. `useFeature` lazy-inits from the resolved max if the entry is absent, then decrements (floors at 0). Mirrors `spendSlot(c, level)` for spell slots — same primitive shape, same simplicity.
- **First-pass content fill** for the `usage` schema:
  - **Warrior** — Battle Wind (L1, profBonus uses per long rest, 2d4 + CON tempHp), Action Surge (L2 = 1 use, L15 = 2 uses; same id `"warrior:action-surge"` so the higher entry overrides), Indomitable (L7, 1 use per long rest).
  - **Berserker** — Rage (L1, profBonus uses per long rest).
  - Other classes/approaches stay description-only and degrade gracefully — popover opens with name + description, no usage band. A follow-up content change can extend coverage.
- **Long rest restores all `per: "long-rest"` AND `per: "short-rest"` tracked features**; short rest restores `per: "short-rest"` only; extended rest inherits via long rest. The Rest panel buttons already in companion mode trigger this — no new control.
- **`FeatCard.onTap` and `FeatList`/`FeatGroup.onTap`** drilled through the existing card primitives. The local `<Feature>` paragraph component in the sheet's Features section becomes a `<button>` when given an `onTap` handler. Wizard preview surfaces and the printable sheet leave `onTap` undefined and stay inert.
- **6 new E2E tests** in `e2e/feat-tap.spec.ts`: tap a boon (badge + description in popover), Battle Wind use-counter decrement (2d4+1 effect for CON 13 at L1 → "2 of 2 left" → "1 of 2 left" after Use, persisted to `featureUses["warrior:battle-wind"]`), Use disabled at 0, long rest restores Battle Wind back to max, migration backfill of `featureUses` for pre-1.10 saves, printable sheet has no tappable buttons. Suite total: **73 passing**.

### Changed

- **Schema widens additively**: `Character` gains required `featureUses: Record<string, number>` (default `{}`, migrator-backfilled). `OriginDef.features`, `OriginSubchoice.features?`, `ClassDef.level1Features`, `ApproachDef.level1Features`, `ClassLevelEntry.features`, and `ApproachLevelEntry.features` are widened from `{ name; description }` to the new `FeatureDef` (which adds three optional fields). Every existing entry still validates.

[1.10.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.10.0

## [1.9.0] - 2026-05-04

Tap-to-share characters via the OS share sheet. Click Share on the character sheet and the OS hands the link to AirDrop, iMessage, Messenger, email, or whatever channel you pick. Recipients tap the link, see a preview of the character, and confirm — no accounts, no backend, no file shuffling.

### Added

- **Share button** on the character sheet's action bar (left of "Export JSON"). On browsers that support the Web Share API (`navigator.share`), the click opens the OS share sheet with a self-contained import URL. On browsers without it (most desktop Chrome/Firefox), the URL is copied to the clipboard and a "Link copied to clipboard" toast appears. A defensive third tier surfaces a `window.prompt` dialog with the URL pre-filled if both APIs fail. Capability detection happens at click time so SSR / hydration is unaffected.
- **`/import` route** that reads an encoded share URL (`?c=<base64>` primary, `#c=` fragment fallback for SMS clients that strip queries), runs the payload through the existing `migrateCharacter` pipeline, and renders a preview card with the character's name, origin, level/class/approach, and counts of feats / boons / burdens / known spells. Nothing is written to localStorage until the user clicks Import. Statically prerendered with a Suspense boundary around `useSearchParams`.
- **Three-option id-collision prompt** on the import preview when the recipient already has a character with the same id: **Replace existing** (overwrites), **Import as a copy** (mints a fresh `nanoid` so both characters coexist), or **Cancel** (no write). Eliminates the silent-overwrite footgun where re-importing a stale share could clobber a session of edits.
- **`lib/character/share.ts`** — new pure-function module exposing `encodeCharacterToShareUrl(c, origin)`, `decodeCharacterFromUrl(url)` (returns `{ character }` or `{ error: string }` — never throws), `extractSharePayload(input)` (used by the home paste affordance), and a `SHARE_URL_SOFT_LIMIT = 8000` constant. Encoding uses the UTF-8-safe base64 idiom so non-ASCII identity names round-trip correctly.
- **"Paste shared link" affordance on the home page** — fallback for users on a different device than the one the link arrived on, or when the channel didn't autolink. Accepts a full URL or just the `c=...` payload portion, validates inline, and routes to `/import` on submit.
- **URL-length warning** at encode time. If the encoded share URL exceeds 8000 characters (a conservative SMS-truncation floor), the Share button surfaces a non-blocking toast: "may not work in SMS — AirDrop / email / Messenger should be fine." Doesn't block the share.
- **11 new E2E tests** covering: encoder/decoder round-trip, fragment fallback, malformed payload, end-to-end preview-and-import, error card on garbage input, id-collision "Import as a copy" mints a new id and keeps both characters, home paste accept + reject, `navigator.share` stub captures the right URL, clipboard fallback captures + toasts, printable sheet has no Share button. Suite total: **67 passing**.
- **New `character-sharing` capability spec** in `openspec/specs/character-sharing/`.

### Notes

- **No `Character` schema changes.** No migration. The shared payload is the existing JSON-export shape encoded in the URL.
- **No backend, no link shortening, no expiration.** The character data rides in the URL; recipients reconstruct it locally. This matches the existing JSON-export semantic — anyone you give the link to can import a copy.
- **Printable sheet stays Share-button-free** — it's a paper-transfer artifact, not the live source of truth. The "Back to sheet" link returns to where Share lives.
- **Web Share API isn't available on desktop Firefox** and is inconsistent on desktop Chrome; the clipboard fallback is the path you'll usually hit there. Mobile Safari, mobile Chrome, mobile Edge, and macOS Safari all hit the share-sheet path.

[1.9.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.9.0

## [1.8.0] - 2026-05-03

Tap-to-cast spells in companion mode. Click any spell on the sheet and a Cast popover opens showing the live computed numbers (Spell Mod, Attack, Save DC), the dice you'll actually roll for that spell at the character's current level, and per-tier "Cast at L<n>" buttons that spend a slot via the existing pip primitive. Cantrips auto-scale by character level (1d10 → 2d10 → 3d10 → 4d10 at L5/11/17); leveled spells expand their dice when cast at a higher slot.

### Added

- **`<SpellCastPopover>`** in `components/spells/spell-cast-popover.tsx` — built on the existing Dialog primitive. Header shows the spell's name, level, school, and ritual badge. A computed-numbers band always renders (Spell Mod, Attack, Save DC + the spellcasting ability used). An effect band renders when the spell has structured `effect` data — damage / heal dice with type, save ability + DC + half-on-save indicator, attack mod, scaling note. Description always renders at the bottom.
- **Cast-at-slot buttons** in the popover for leveled spells (L1+). One button per tier from the spell's base level through L9, showing the remaining slot count. Disabled tiers (zero slots) get a hover tooltip explaining why. Clicking spends the slot via the existing `spendSlot(c, n)` from `lib/character/live-state.ts` — same primitive the pip row already uses, so no parallel mutation path. Cantrips render no Cast buttons (they auto-scale instead).
- **`SpellEffect` discriminated union** on `SpellDef` (optional) — four kinds: `attack` (spell-attack roll → damage), `save` (target rolls a save → damage and/or rider effect), `heal` (HP dice), and `utility` (explicitly no roll). Plus `SpellScaling` (also optional): `cantrip` (a `bands` array marking the character-level thresholds at which damage scales) and `upcast` (per-slot-level dice added when cast at a higher tier).
- **`lib/character/spells.ts`** module with the cast-helper math: `spellcastingAbility(c)`, `spellAbilityModValue(c)`, `spellAttackMod(c)`, `spellSaveDc(c)`, and `resolveSpellEffect(spell, c, castAtLevel)`. The resolver applies cantrip-band scaling for cantrips and upcast scaling for leveled spells; description-only spells return a `kind: "utility"` shape so the popover can degrade to "see description" cleanly.
- **All 21 cantrips and all 49 1st-level spells** in `data/spells.ts` are now encoded with their effect/scaling shape — attack cantrips get a 4-band scaling table (L1/5/11/17), save cantrips the same; leveled damage spells get `upcast` scaling. The Symbaroum-flavored entries (Black Bolt, Holy Smoke, Spirit Walk, Tale of Ashes) are encoded per the PG mechanics, with utility-marked entries for spells whose effect doesn't need a roll. Higher-level spells (2nd–9th) remain description-only and degrade gracefully — a follow-up content pass can fill them in.
- **`SpellCard.display.onCast?`** prop turns the spell card into a `<button>` with hover/focus rings and an `aria-label="Cast {spell.name}"` when defined. The companion-mode wrapper drills the prop through `SpellTabs.display.onCast?`. Wizard picker mode and the printable sheet leave the prop undefined and behave as before.
- **7 new E2E tests** in `e2e/spell-cast.spec.ts` covering the compute helpers, cantrip scaling at L1 vs L5, Burning Hands upcast at L3, popover-open with computed-numbers verification (Mystic INT 15 → DC 12, attack +4), the slot-spend round-trip via `currentSpellSlots`, the description-only utility fallback, and the printable-sheet non-interactivity check. Suite total: **56 passing**.

### Known limitations

- **Magic Missile** and **Sleep** are encoded as `kind: "utility"` because their auto-hit / HP-pool mechanics don't fit the `attack` discriminator cleanly. Their description text carries the math.
- **Eldritch Blast** scales dice in the popover (1d10 → 2d10 → 3d10 → 4d10), but RAW each beam is a separate attack roll. Description notes this.
- **False Life's** `+5 temp HP per slot above L1` upcast isn't auto-scaled in the live dice — the description carries the rule.
- **Sorcerer's "choose your spellcasting ability at L1" rule** still uses the approach's `abilityHint` (CHA for Sorcerer), so a Sorcerer who picked INT or WIS at L1 will see `(CHA)` in the popover and a wrong DC. Tracked as a follow-up `sorcerer-ability-override` change.
- **Ritual cast button** is not yet implemented. Spells flagged `ritual: true` show the ritual badge but the popover doesn't offer a "cast as ritual (no slot)" path — for v1 the player just notes it and casts manually.
- **Cast popover uses Dialog** (centered overlay) rather than an anchored Popover. If it feels heavy mid-combat, swap is straightforward.

[1.8.0]: https://github.com/tobiascervin/symbarator/releases/tag/v1.8.0

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
