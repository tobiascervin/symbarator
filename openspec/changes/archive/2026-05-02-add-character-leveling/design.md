## Context

Today the builder is locked at L1: `Character.level: 1` is a literal type, `data/classes.ts` ends at the L1 entry, and `computeProficiencyBonus` is the only computation that already accepts a level argument. Players cannot create higher-level heroes (common at mid-campaign joins) and cannot advance a character after a session.

Constraints:
- Static-data-driven: no server, no runtime rules engine — the rules live in `data/`. Adding L1–20 data for five classes × ≤5 approaches is the bulk of the work.
- Symbaroum-specific: HP/HD comes from origin (`OriginDef.providesHp`), corruption threshold has two formulas, Mystic spellcasting differs by approach (tradition).
- Persistence is browser localStorage today; an existing user has L1 saved characters that must keep loading.
- Confirmed scope (in this change): full rules encoding, levels 1–20, level-up flow only on the sheet (builder stays L1), persist current totals only.

## Goals / Non-Goals

**Goals:**
- Players can level up an existing character one level at a time from the sheet, all the way to L20.
- The flow asks every mechanically-required question for the gained level (HP, ASI/feat, choices baked into class/approach features, spells learned/swapped) and refuses to advance until they're answered.
- Saved L1 characters from before this change still load and can be leveled up.
- All computed stats on the sheet (HP, prof bonus, saves, skills, corruption threshold, spell slots, spells known) reflect the current level without code paths that special-case L1.

**Non-Goals:**
- Multiclassing.
- Retraining / respec / undo of an earlier level's choice (you'd export, edit JSON, re-import — same as today).
- Per-level audit log ("at L4 you took +Cha"). Confirmed: only current totals persist.
- Building a higher-level character in one shot from `/builder` — the builder stays L1; level-ups happen on the sheet, sequentially.
- Level-down. The flow is forward-only.
- Adding new feats beyond what `data/feats.ts` already exposes (separate change).

## Decisions

### Decision 1: Encode progression as per-class level tables in `data/level-tables/<class>.ts`

Each class file exports a `LEVEL_TABLE` of length 20 (indices 0..19 for levels 1..20). Each row declares the level's mechanical effects in a structured shape the level-up flow can interpret without bespoke per-class code:

```ts
type ClassLevelEntry = {
  level: 1..20;
  profBonus: 2 | 3 | 4 | 5 | 6;
  // Generic feature grants — no choices required.
  features: ReadonlyArray<{ name: string; description: string }>;
  // Choice prompts the flow surfaces this level.
  choices?: ReadonlyArray<LevelChoice>;
};

type LevelChoice =
  | { kind: "asi-or-feat" }       // for Changeling, the ASI/feat step also offers Change Self in this same slot
  | { kind: "fighting-style"; from: FightingStyleId[] }
  | { kind: "spells-learned"; cantrips?: number; spells?: number; canSwap?: boolean }
  // …extensible. Each kind has its own UI step and validator.
  ;
```

Approach-specific features ride on a parallel `ApproachLevelEntry[]` so a player's class+approach is just two tables zipped at the current level.

**Alternatives considered:**
- A single flat `levels.ts` lookup keyed by `${classId}:${level}` — flat is simpler to scan but `data/classes.ts` would explode. Per-class files mirror today's structure.
- Generating tables from a YAML rulebook source — overkill; static TS gives us type-checked picks for free.

### Decision 2: Spell progression lives on `ApproachDef.spellcasting.progression: SpellSlotRow[20]`

Resolved per the Symbaroum Player's Guide: spell progression is **per approach**, not per class. The Mystic class is the obvious case, but Warrior/Templar and Hunter/Witch Hunter also have spellcasting tables on their approach pages (PG sect. 4). Putting progression on `ClassDef` would force Templar/Witch Hunter to be modeled as Mystic approaches, which contradicts their class identity.

Concretely:
- Move all spellcasting metadata (`cantripsKnownAt1`, `spellsKnownAt1`, `spellSlotsAt1`, plus the new `progression`) from `ClassDef.spellcasting` to `ApproachDef.spellcasting`.
- `ClassDef.spellcasting` is removed.
- `computeSpellcasting` (`lib/character/compute.ts`) reads from `approachById(c.approachId)?.spellcasting?.progression[c.level - 1]`.
- The L1 wizard's spell-pick gate already keys on the approach (Mystic-only today); after this change it will also fire for Templar and Witch Hunter approaches.

Approaches without spellcasting leave `spellcasting` undefined.

### Decision 3: Current-totals persistence — no audit log

The `Character` shape gains:

```ts
level: 1..20;
maxHp: number;            // computed once at L1 + each level-up; persisted because rolled HP is non-deterministic.
feats: string[];          // ids from data/feats.ts (was implicitly empty before)
abilities: ...;           // existing — ASIs mutate this in-place
spellPicks?: { cantrips: string[]; spellsKnown: string[] };  // existing — extended each level for Mystic
```

We do **not** add a `levelUps: LevelUpEntry[]` field. Rationale: re-asking "what did you pick at L4?" can be derived by walking the static table only when we don't need to know the answer (all picks are already baked into totals). The cost is undo: a wrong pick at L7 isn't reversible without exporting JSON and editing manually. Acceptable for v1; users can re-create the character if they really need to redo it.

**Alternative considered:** persist `levelUps`. Lets us show a level-up history on the sheet and supports "undo last level". Adds schema weight and bookkeeping for marginal value at this stage. Revisit if users ask.

### Decision 4: Level-up surface is sheet-only; flow is a focused dialog

Entry point: a "Level Up" button in `app/characters/[id]/page.tsx` header (disabled when `level === 20`). Clicking opens a dialog (or routes to `/characters/[id]/level-up`) that runs through the new level's required questions in order:

1. **HP gain** — choose "average" (default; deterministic, equals `floor(hitDie/2) + 1 + conMod`) or "roll" (entered value, bounded). Persist into `maxHp`.
2. **ASI / feat** — only when this level grants one (Symbaroum places these at **4, 8, 10, 12, 16, 19** for every class — note the extra L10 slot vs. base 5E). ASI = +2 to one ability or +1/+1 to two; feat = pick from `data/feats.ts`. For Changeling characters this slot also offers a third option, **Change Self** (PG p. 51), which consumes the ASI/feat slot rather than being granted in addition to one.
3. **Class & approach feature picks** — driven by `LevelChoice[]` from the two tables. Each `kind` has a small dedicated component.
4. **Spells (Mystic only)** — when `progression[newLevel-1]` shows new cantrips or spells, the player picks them from the tradition list; if the rules allow swapping, also offer one swap.
5. **Confirm** — show a diff (level X → X+1, HP +n, prof bonus change if any, new features, ability changes). Save.

The dialog is dispatched-on the same `LevelChoice` discriminated union the data uses, so adding new choice kinds = one switch arm in the UI plus one validator.

**Alternative considered:** reuse the existing wizard infrastructure (`WizardShell`, `useDraft`). The wizard model assumes you can revisit any step and resave — a level-up is a forward-only mutation. Forking the component is cleaner than parameterizing the wizard.

### Decision 5: Storage migration is a forward-only normalizer in `LocalCharacterStore.load` and `importJson`

Saved L1 characters are missing `feats`, `maxHp`, and have a non-widened `level: 1`. The store's load path runs them through a `migrateCharacter(raw): Character` that fills sane defaults (`feats: []`, `maxHp = computeHp(c)` at L1, `level: 1`). No version field is needed yet — the migration is idempotent and runs on every load. If the schema grows further we'll add `Character.schemaVersion`.

### Decision 6: HP roll vs average — default to average; allow manual entry

Symbaroum origin hit dies are d6/d8/d10/d12. Average HP per level past 1 is `floor(hitDie/2) + 1 + conMod`. The level-up flow defaults to that and lets the player overwrite with a rolled value bounded by `[1 + conMod, hitDie + conMod]`. This avoids a dice-roller dependency while still supporting tables that roll.

### Decision 7: Type widening of `Character.level` — keep it a numeric literal union

`type CharacterLevel = 1|2|...|20;` rather than `number`. Catches off-by-one bugs and makes exhaustive switches over level tables possible. Generated via a helper:

```ts
type CharacterLevel = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20;
```

## Risks / Trade-offs

- **Data volume risk** → 5 classes × up to 5 approaches × 20 rows is ~500 entries to encode from the Player's Guide. Mitigation: encode generic level tables (prof bonus, ASI slots) once across all classes; only class- and approach-specific feature rows differ. Stage delivery: land Decisions 1–7 + Captain fully encoded first as the reference shape, then fill the other four classes in follow-up commits within the same change.
- **Mystic spell progression complexity** → spell slot tables differ per tradition in some editions. Mitigation: confirm with the Player's Guide before implementing Mystic. If tradition-specific, push `progression` onto `ApproachDef` instead of `ClassDef`.
- **Schema drift on load** → migration on every load adds CPU per character. Mitigation: cheap (object spread + defaults). If it ever costs, add `schemaVersion` and short-circuit.
- **Choice kinds proliferate** → the `LevelChoice` union grows over time. Mitigation: each kind owns its UI component and its validator; adding a kind is local. Exhaustiveness checks via `never` in switches catch missed kinds at compile time.
- **No undo** → a misclick at L8 means the player can't roll back without manual JSON edits. Trade-off accepted at v1; Decision 3 explains why.
- **Level cap blast radius** → widening `Character.level` from `1` to a union is a typescript-level breaking change for any code that relied on the literal. Mitigation: small codebase; the compiler will surface every site.

## Migration Plan

1. Land type widening + storage migration first (no UI). All L1 characters keep loading; new fields default safely.
2. Land level-table data shape + Captain L1–20 + the level-up dialog. Mystic remains L1-only behind a "Mystic leveling coming soon" notice on the level-up button for that class.
3. Fill in remaining classes (Treasure Hunter, Warrior, Mystic, Troll Singer / Hunter — whatever the five are per `data/classes.ts`) one PR at a time, each adding the class's level table and toggling its level-up button on.
4. No rollback strategy beyond reverting the change — the level-up writes are persisted only locally, so users with leveled-up characters would need to roll back via export/import if we yanked the feature.

## Open Questions

All resolved per the Symbaroum Player's Guide:

- **Q1 — resolved**: Spell progression is **per approach**. Mystic, Warrior/Templar, and Hunter/Witch Hunter each have their own progression table on the approach page; Mystic also varies by tradition. `spellcasting` therefore lives on `ApproachDef`, not `ClassDef`. See Decision 2.
- **Q2 — resolved**: Symbaroum places ASI/feat slots at **4, 8, 10, 12, 16, 19** (six slots) for every class — one more than base 5E (the extra is at L10). This is uniform across the five classes. Encoded in every class's level table.
- **Q3 — resolved**: Changeling's **Change Self** is taken **instead of** the ASI/feat for that slot — it consumes the slot, not in addition to it. The `asi-or-feat` step's UI offers a third radio (ASI / Feat / Change Self) when the character is a Changeling. Validator and applier handle "Change Self" by appending it to `feats` (or a similar marker) without granting an extra ASI or feat.
