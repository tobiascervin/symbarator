## Why

The level-up dialog's `asi-or-feat` step only exposes the 36 generic Boons (`data/feats.ts`) through a flat shadcn `<Select>` dropdown. Per PG p. 146, the rules describe **three** kinds of feats: boons & burdens, **origin feats** (PG p. 153 — Shadow-sight, Change Self, Retribution, Ancient Magic, Tough and Stringy, Big-boned, Robust, Ravenous Hunger), and **class feats** (PG p. 155–157 — Battle Speech, Command Expert, Parry, Overwatch, Ranged Expert, Trick Shot, Combat Magic Expert, Confessor, Dedicated Focus, Demonologist, Extensive Learning, Inquisitor, Necromancer, Pyromancer, Secrets of the Order, Nimble, Shadow Walker, Bull Rush, Grappler, Melee Expert, Skirmish Expert). None of the latter two are selectable today; players cannot choose between origin- and class-specific feats when they level up. Compounding this, the picker UI is a dropdown that hides each feat's bonus, prerequisite, and description until the user selects it — unlike the L1 boons step, which renders all options as inspectable cards.

Changeling characters currently get a special-cased third radio option (`change-self`) that registers a sentinel feat id; this is a workaround for the same missing data — Change Self is just an origin feat for Changelings. With proper origin-feats data we can fold it into the unified picker and stop carrying the sentinel.

## What Changes

- Introduce two new feat catalogs alongside `BOONS` in `data/`: an origin-feats catalog (one feat per the eight origins on PG p. 153) and a class-feats catalog (the per-class lists on PG p. 155–157 — Captain: Battle Speech, Command Expert, Parry; Hunter: Overwatch, Ranged Expert, Trick Shot; Mystic: Combat Magic Expert plus the approach-gated Confessor / Inquisitor / Demonologist / Necromancer / Pyromancer / Secrets of the Order, plus Dedicated Focus and Extensive Learning; Scoundrel: Nimble, Shadow Walker, Skirmish Expert; Warrior: Bull Rush, Grappler, Melee Expert).
- Extend the data shape so each feat declares which origin(s) and/or class(es) (and where applicable: approach + minimum class level) it belongs to, plus its prerequisite text. Boons remain origin/class-agnostic; their entries in the catalog declare neither.
- Replace the level-up `asi-or-feat` feat selector with a card grid that mirrors the L1 boons step's visual: one card per available feat, sectioned by **Boons**, **Origin Feats** (filtered to the character's origin), and **Class Feats** (filtered to the character's class — and approach where the PG ties the feat to one — with prerequisite badges and disabled-state styling for unmet prerequisites).
- Fold the changeling `pick.type === "change-self"` branch into the unified picker by adding Change Self as an origin feat for Changelings. The `change-self` sentinel feat id stays valid for backwards compatibility on previously-saved characters but the dialog no longer offers a third radio option. **BREAKING** for in-progress level-up answers stored in component state mid-session — none of these are persisted. No `Character` schema change.
- Validation in `lib/character/level-up.ts` enforces: origin-only feats require the character's origin to match; class-only feats require the character's class (and approach where required) to match and class-level threshold to be satisfied; ability-score prerequisites (e.g. Str ≥ 13 for Bull Rush / Grappler) consult the character's *current* abilities at the moment of leveling.
- The chosen feat id is stored in `Character.feats` exactly as today (a string id). Sheet-side rendering through `BOON_BY_ID` is augmented so origin/class feats also resolve to a card on the sheet (display-only follow-up).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `character-leveling`: extends the `asi-or-feat` flow to expose origin and class feats from new catalogs, requires a card-grid picker UI, and adds prerequisite/origin/class/approach gating to the validator.

## Impact

- Code: `data/feats.ts` (or new sibling files `data/origin-feats.ts` / `data/class-feats.ts`); `lib/character/types.ts` (extend `BoonDef` or introduce a sibling `FeatDef`); `lib/character/level-up.ts` (validate the new gates); `components/level-up/level-up-dialog.tsx` (replace dropdown with card grid, remove the changeling-only radio); shared card UI in `components/sheet/feat-card.tsx` may be reused or a sibling created in `components/level-up/`.
- Sheet rendering: `BOON_BY_ID` lookup callsites in `components/sheet/feat-list.tsx` and `printable-sheet.tsx` should fall back to a unified feat catalog so origin/class feats show their proper name and description on the sheet, not an unresolved id.
- Tests: extend the leveling Playwright suite to cover (a) selecting an origin feat as a Changeling/Goblin/Ogre/Troll/Undead/Dwarf/Elf/Human, (b) selecting a class feat that meets prerequisites, (c) rejecting a class feat whose prerequisites aren't met, (d) the card-grid layout being rendered (`getByRole("button")` for each card) instead of a `combobox`.
- Storage / migration: no `Character` schema change. Previously persisted `change-self` ids on `Character.feats` continue to resolve via the new catalog; no migrator needed beyond a redirect of the `BOON_BY_ID` fallback. Per the release process this is a MINOR bump (additive feature; no save-file break).
- User-facing: players see a richer, scrollable card picker at level-up with PG-correct content for their character; Changeling players now pick Change Self from the same surface as everyone else.
