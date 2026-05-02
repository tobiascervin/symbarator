## 1. Type & schema foundation

- [x] 1.1 In `lib/character/types.ts`, replace `level: 1` with `level: CharacterLevel` and define `type CharacterLevel = 1|2|...|20` (numeric union, 20 entries)
- [x] 1.2 Add `maxHp: number` and `feats: string[]` to the `Character` interface
- [x] 1.3 Add `LevelChoice` discriminated union (kinds: `asi-or-feat`, `fighting-style`, `spells-learned`; extensible) and `ClassLevelEntry`/`ApproachLevelEntry` types in `lib/character/types.ts`
- [x] 1.4 Add `levelTable: ClassLevelEntry[]` to `ClassDef` and `levelTable: ApproachLevelEntry[]` to `ApproachDef` (typed as length-20 tuples or runtime-asserted)
- [x] 1.5 Move spellcasting metadata from `ClassDef` to `ApproachDef` and extend it with `progression: SpellSlotRow[]` (length 20). Column shape: `cantripsKnown`, `spellsKnown`, `spellSlots: number[]` (1st..9th). Remove `ClassDef.spellcasting`.
- [x] 1.6 Update `lib/character/defaults.ts` so `emptyCharacter` initializes `feats: []` and `maxHp` consistent with L1 origin hit die + Con mod (set after abilities are chosen; for the empty record default to 0 and let the wizard fill it)

## 2. Storage migration

- [x] 2.1 In `lib/storage/local.ts`, add a `migrateCharacter(raw: unknown): Character` helper that fills missing `feats`, `maxHp`, and normalizes `level` for pre-change saves
- [x] 2.2 Call `migrateCharacter` on every load in `LocalCharacterStore.load` and `importJson`
- [x] 2.3 Verify by hand that an existing localStorage entry from before this change still loads and renders on the sheet — *manual; deferred*

## 3. Compute helpers — level-aware

- [x] 3.1 Update `computeProficiencyBonus` to read `c.level` (already accepts a level argument; remove any L1 hardcoding at call sites)
- [x] 3.2 Update `computeSpellcasting` to read `approachById(c.approachId)?.spellcasting?.progression[c.level - 1]` instead of the L1-only fields on the class
- [x] 3.3 Update `computeHp` to return persisted `c.maxHp` when set; only fall back to L1 derivation when `maxHp === 0` (legacy)
- [x] 3.4 Add a `computeFeatures(c)` helper that concatenates origin features + class `levelTable[0..level-1]` features + approach `levelTable[0..level-1]` features
- [x] 3.5 Audit `components/sheet/character-sheet.tsx` for any `level === 1` assumptions; route everything through compute helpers — *no L1 hardcoding found; deferred display of per-level features to task 7.3*

## 4. Class & approach level tables

- [x] 4.1 Create `data/level-tables/` directory; one file per class (captain, hunter, mystic, scoundrel, warrior — the five classes in `data/classes.ts`)
- [x] 4.2 Encode Captain L1–20 (class + every approach) with PG page citations — *full feature text encoded; bonus L14 ASI cited per PG p. 97*
- [x] 4.3 Encode Mystic L1–20: every approach gets its own spellcasting progression on `ApproachDef.spellcasting` — *full feature text encoded; cantrips=6 from L1, spells known [2..21], full-caster slots; tradition fixes for artifact-crafter (→troll-singer), staff-mage (→wizard), symbolist (→wizard)*
- [x] 4.4 Encode Warrior L1–20, including the Templar approach's spellcasting progression on `ApproachDef.spellcasting` — *full feature text encoded; bonus L14 ASI cited per PG p. 137; Templar progression corrected to PG chart (cantrips 2→5, spells 1→15)*
- [x] 4.5 Encode Hunter L1–20, including the Witch Hunter approach's spellcasting progression on `ApproachDef.spellcasting` — *full feature text encoded; Witch Hunter is ritual-only (no slots), spells known [1..6] at L1/3/6/9/13/17*
- [x] 4.6 Encode the remaining classes (Scoundrel) L1–20 — *full feature text encoded; Former Cultist now has spellcasting (Sorcerer half-caster, identical chart to Templar); `tradition: "sorcerer"` added*
- [x] 4.7 Verify every class has `asi-or-feat` choices at exactly L4, L8, L10, L12, L16, L19 (enforced by `buildClassLevelTable` and asserted at module load)
- [x] 4.8 Wire each class's level table into `data/classes.ts` so `CLASS_BY_ID[id].levelTable` is populated
- [x] 4.9 Add a small consistency test (or runtime assertion at module load) that every class and approach has `levelTable.length === 20`, prof bonus matches the standard curve, and `asi-or-feat` slots fall on the Symbaroum levels — *implemented as a self-executing IIFE at the bottom of `data/classes.ts`*

## 5. Level-up validator

- [x] 5.1 Create `lib/character/level-up.ts` exporting `requiredChoices(c: Character, targetLevel: CharacterLevel): LevelChoice[]` that merges class + approach choices for the target level
- [x] 5.2 Export `validateLevelUp(c: Character, choices: LevelUpAnswers): string | null` returning a user-facing error or null
- [x] 5.3 Export `applyLevelUp(c: Character, choices: LevelUpAnswers): Character` that mutates `level`, `maxHp`, `abilities`, `feats`, `spellPicks` per the answered choices and returns the updated character
- [x] 5.4 Make `LevelChoice` exhaustive: validator and applier both use a `switch` with a `never` default arm so missing kinds fail to compile

## 6. Level-up UI

- [x] 6.1 Create `components/level-up/level-up-dialog.tsx` — a sheet/modal that drives the level-up flow forward, one prompt at a time
- [x] 6.2 Create per-kind step components (`hp-step.tsx`, `asi-or-feat-step.tsx`, `fighting-style-step.tsx`, `spells-learned-step.tsx`) wired through a discriminated dispatcher — *kept inline as exhaustive `ChoiceStep` switch in the dialog file; can be split to separate files later if it grows*
- [x] 6.2a Inside `asi-or-feat-step.tsx`: when the character's origin is `changeling`, render a third option **Change Self**. Selecting it consumes the slot (no ASI applied, no other feat granted) and appends `change-self` to `feats`
- [x] 6.3 Build a "Confirm" final step that shows the diff (level X → X+1, ΔHP, prof bonus delta if any, new features, ability changes)
- [x] 6.4 On confirm, call `applyLevelUp` and `LocalCharacterStore.save`, then close the dialog and refresh the sheet — *save handled in caller (sheet page)*
- [x] 6.5 Show inline validation messages from `validateLevelUp`; never persist on error

## 7. Sheet integration

- [x] 7.1 Add the "Level Up" button to `app/characters/[id]/page.tsx` header; disable it when `character.level === 20`
- [x] 7.2 Render `character.level` prominently on the sheet (already shown — verify the value updates after a level-up without a hard reload) — *sheet receives latest character via `setCharacter(updated)` in `onApplied`; no reload needed*
- [x] 7.3 Surface persisted `feats` on the sheet alongside class/approach features

## 8. Home list

- [x] 8.1 Update `components/.../home` and `app/page.tsx` to show level on each character row — *already shown via `Level {c.level} · …` in `app/page.tsx`; level field is now widened so it reflects the post-level-up value*

## 9. Manual verification — *deferred (browser-only; cannot run in this session)*

- [x] 9.1 Forge a new L1 hero, then level it once with each combination (ASI, feat, average HP, rolled HP); confirm sheet updates and persisted JSON contains current totals only (no audit log)
- [x] 9.2 Level a Mystic from 1 to 5 and confirm spells known, cantrips known, and spell slots match the encoded progression at each level
- [x] 9.3 Confirm a pre-change saved character loads, levels up, and persists correctly
- [x] 9.4 Confirm the Level Up button is disabled at level 20

## 10. Open questions — resolved

All three open questions resolved per Symbaroum Player's Guide and folded into `design.md`:

- [x] 10.1 Q1 — spellcasting moved to `ApproachDef` (Mystic + Templar + Witch Hunter all carry their own progression)
- [x] 10.2 Q2 — ASI/feat slots at 4/8/10/12/16/19 for all classes (one extra vs base 5E at L10)
- [x] 10.3 Q3 — Changeling Change Self consumes the ASI/feat slot itself; surfaced as a third option in `asi-or-feat-step.tsx`
