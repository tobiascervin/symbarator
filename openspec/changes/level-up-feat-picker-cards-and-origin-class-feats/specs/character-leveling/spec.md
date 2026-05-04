## ADDED Requirements

### Requirement: The feat catalog SHALL distinguish boons, origin feats, and class feats

The static feat data MUST be a single unified catalog where each entry declares a `category: "boon" | "origin" | "class"`. Origin feats MUST declare an `origins: ReadonlyArray<OriginId>` listing the origins that may take them (PG p. 153 lists Shadow-sight for Abducted/Humans, Change Self for Changelings, Retribution for Dwarves, Ancient Magic for Elves, Tough and Stringy for Goblins, Big-boned for Ogres, Robust for Trolls, Ravenous Hunger for Undead). Class feats MUST declare a `classId: ClassId` and MAY declare any of `approachId`, `minClassLevel`, `minAbilityScores`, `minSpellcastingAbility`, and `excludesFeatIds` per the PG-stated prerequisite for that feat. Boons MUST NOT declare any of `origins`, `classId`, or `approachId`.

The catalog MUST cover at minimum the canonical PG entries: 36 boons (already shipped), 8 origin feats per PG p. 153, and the per-class lists from PG p. 155–157 — Captain (Battle Speech, Command Expert, Parry); Hunter (Overwatch, Ranged Expert, Trick Shot); Mystic (Combat Magic Expert, Confessor, Dedicated Focus, Demonologist, Extensive Learning, Inquisitor, Necromancer, Pyromancer, Secrets of the Order); Scoundrel (Nimble, Shadow Walker, Skirmish Expert); Warrior (Bull Rush, Grappler, Melee Expert).

A unified `FEAT_BY_ID` lookup MUST resolve every catalog id, including `"change-self"`. The legacy `BOON_BY_ID` MAY be re-exported as a filtered view of `FEAT_BY_ID` to avoid churning L1-only call sites; if so, it MUST contain only `category: "boon"` entries.

#### Scenario: Origin-feat entries declare their origins

- **WHEN** the test suite reads the catalog entry for `change-self`
- **THEN** `category` is `"origin"` and `origins` contains exactly `"changeling"`

#### Scenario: Class-feat entries declare their class and any approach gate

- **WHEN** the test suite reads the catalog entry for Confessor
- **THEN** `category` is `"class"`, `classId` is `"mystic"`, `approachId` is `"theurg"`, and `minClassLevel` is `11`

#### Scenario: Class-feat entries with ability prerequisites declare them structurally

- **WHEN** the test suite reads the catalog entry for Grappler
- **THEN** `classId` is `"warrior"` and `minAbilityScores.str === 13`

#### Scenario: Mutually exclusive class feats reference each other

- **WHEN** the test suite reads the catalog entries for Confessor and Inquisitor
- **THEN** Confessor's `excludesFeatIds` contains `"inquisitor"` and Inquisitor's `excludesFeatIds` contains `"confessor"`

### Requirement: The level-up `asi-or-feat` step SHALL render available feats as a card grid sectioned by category

When the level-up flow displays the `asi-or-feat` step in feat mode, the picker MUST render every catalog entry visible to the character as a clickable card mirroring the L1 boons step's visual: name, optional ability-bonus badge, prerequisite text (when present), and full description, all visible without selecting the card. The picker MUST group cards into three labelled sections in this order: **Boons** (every `category: "boon"` entry not forbidden by the character's origin), **Origin Feats** (every `category: "origin"` entry whose `origins` includes the character's origin), and **Class Feats** (every `category: "class"` entry matching the character's `classId`, further filtered by `approachId` when set on the entry). Sections MUST be omitted when they would contain zero cards. The picker MUST NOT render a flat `<select>` / `<combobox>` for feats.

The L1 boons step in `components/builder/boons-burdens-step.tsx` and this level-up picker SHOULD share the same card component so the visual stays in lock-step.

#### Scenario: Picker renders three sections for a Warrior with origin feats and class feats

- **WHEN** a Warrior/Berserker Goblin at L3 reaches the L4 ASI/feat step in feat mode
- **THEN** the picker shows a "Boons" section with every non-forbidden boon, an "Origin Feats" section containing exactly one card (Tough and Stringy), and a "Class Feats" section containing the Warrior class feats (Bull Rush, Grappler, Melee Expert)
- **AND** none of the cards is rendered as a `<select>` option
- **AND** Skirmish Expert (a Scoundrel feat per PG p. 156) MUST NOT appear in the Class Feats section

#### Scenario: Approach-gated class feats are filtered out for the wrong approach

- **WHEN** a Mystic/Sorcerer at L7 reaches an ASI/feat step
- **THEN** the Class Feats section includes Demonologist (Sorcerer-gated) and excludes Pyromancer (Wizard-gated) and Secrets of the Order (Staff Mage-gated)

#### Scenario: Sections with no entries are omitted

- **WHEN** a Captain Human at L4 reaches an ASI/feat step
- **THEN** the picker shows the Boons and Class Feats sections, and omits the Origin Feats section because Humans have no origin feat per PG p. 153 (Abducted-only)

#### Scenario: Picker visual matches the L1 boons step

- **WHEN** any feat card is rendered in either the L1 boons step or the level-up picker
- **THEN** both surfaces use the same card component, badges, and disabled-state styling
- **AND** snapshot drift between the two is detectable by reading the same component identifier in tests

### Requirement: Cards for feats with unmet prerequisites SHALL render disabled with the specific reason

A feat card MUST render in a visibly disabled state (dashed border + reduced opacity + `aria-disabled="true"`, matching the L1 step's forbidden-boon affordance) when any of the following hold for the current character at the moment of leveling: an `minAbilityScores` entry is unmet against `Character.abilities`; `minSpellcastingAbility` is unmet against the approach's spellcasting ability score; `minClassLevel` is greater than the target level; an entry in `excludesFeatIds` is already in `Character.feats`; the character's origin appears in `forbiddenOriginIds`; or the feat is already in `Character.feats` (one-shot feats only). Each disabled card MUST display a one-line reason explaining *why* it is disabled (e.g. "Requires Strength 13 — you have 12", "Requires Theurg approach", "Already taken").

Disabled cards MUST NOT be selectable; clicking or pressing Enter/Space on them MUST be a no-op and MUST NOT record a feat answer.

#### Scenario: Ability prerequisite displayed and enforced

- **WHEN** a Warrior/Berserker character with `str: 12` views the Grappler card in the level-up picker
- **THEN** Grappler is rendered with the disabled affordance and the reason text "Requires Strength 13 — you have 12"
- **AND** clicking Grappler does not change the answer state

#### Scenario: Class-level prerequisite displayed and enforced

- **WHEN** a Mystic/Theurg leveling from 9 to 10 views the Confessor card
- **THEN** Confessor is rendered disabled with reason "Requires class level 11"

#### Scenario: Mutual exclusion between Confessor and Inquisitor

- **WHEN** a character whose `feats` already contains `"confessor"` views the level-up picker
- **THEN** the Inquisitor card is disabled with reason citing the conflict
- **AND** the validator rejects an answer with `featId: "inquisitor"`

#### Scenario: Already-taken feat is disabled

- **WHEN** a character whose `feats` already contains `"melee-expert"` reaches another ASI/feat slot
- **THEN** the Melee Expert card is rendered disabled with reason "Already taken"

### Requirement: Validation SHALL gate the chosen feat by origin, class, approach, level, and ability prerequisites

`validateChoiceAnswer` for an `asi-or-feat` answer with `pick.type === "feat"` MUST resolve `pick.featId` against the unified feat catalog and reject the answer with a user-facing error string when any declared gate (`origins`, `classId`, `approachId`, `minClassLevel`, `minAbilityScores`, `minSpellcastingAbility`, `excludesFeatIds`, `forbiddenOriginIds`) is unmet. Ability gates MUST be evaluated against the character's abilities *before* applying any pending answer in the same level-up — picking a feat does not get to claim ASI gains earned in the same step. An unknown `featId` MUST yield "Pick a feat." (or equivalent), preserving today's behavior for unselected feats.

`applyChoiceAnswer` MUST append `pick.featId` to `Character.feats` for any valid feat answer, regardless of category. No category-specific application logic is permitted in the apply path; the catalog is the single source of truth for what an id represents.

#### Scenario: Origin feat selected by mismatched origin is rejected

- **WHEN** a Warrior/Berserker Dwarf submits an answer with `featId: "change-self"`
- **THEN** validation returns an error citing the origin mismatch
- **AND** the persisted `feats` is unchanged

#### Scenario: Class feat selected by mismatched class is rejected

- **WHEN** a Captain submits an answer with `featId: "grappler"`
- **THEN** validation returns an error citing the class mismatch

#### Scenario: Class feat selected without meeting an ability prerequisite is rejected

- **WHEN** a Warrior/Berserker with `str: 12` submits an answer with `featId: "grappler"`
- **THEN** validation returns an error citing Str 13+ requirement

#### Scenario: Spellcasting-ability prerequisite consults the approach's ability hint

- **WHEN** a Mystic/Wizard whose Int score is 12 submits an answer with `featId: "extensive-learning"`
- **THEN** validation rejects the answer because Wizard's `spellcasting.abilityHint` is `"int"` and Int 12 < 13

#### Scenario: Mutually exclusive feat with prior pick is rejected

- **WHEN** a Mystic/Theurg whose `feats` already contains `"confessor"` submits `featId: "inquisitor"`
- **THEN** validation returns an error citing the mutual exclusion

### Requirement: Change Self SHALL be selected via the unified picker, not a separate radio option

The Changeling-specific "Change Self" option MUST be a normal entry in the feat catalog (`id: "change-self"`, `category: "origin"`, `origins: ["changeling"]`), and MUST be selected through the same `pick.type === "feat"` answer shape used by every other feat. The `LevelChoiceAnswer` discriminated union MUST NOT carry a separate `{ type: "change-self" }` arm. Persisted `Character.feats` containing `"change-self"` from earlier versions MUST continue to resolve via `FEAT_BY_ID` and render as a card on the sheet.

#### Scenario: Changeling sees Change Self in Origin Feats

- **WHEN** a Changeling Scoundrel/Nimble levels to 4
- **THEN** the picker's Origin Feats section contains exactly one card, Change Self
- **AND** the picker has no `change-self` radio option

#### Scenario: Persisted change-self ids resolve on the sheet

- **WHEN** a character whose `feats` array contains `"change-self"` (from before this change) is loaded
- **THEN** the sheet's feat list renders a card with the Change Self name and PG p. 153 description
- **AND** no unresolved-id placeholder is shown

#### Scenario: Non-Changeling cannot pick Change Self

- **WHEN** a Goblin character submits an answer with `featId: "change-self"`
- **THEN** validation returns an error citing the origin mismatch and the answer is rejected

## MODIFIED Requirements

### Requirement: A level-up SHALL collect every mechanically required choice for the gained level before persisting

A level-up from level N to N+1 MUST present every required choice declared by the class's and approach's level table for level N+1, in order, and MUST refuse to persist the new level until each required choice is answered. Optional flavor questions MAY be skipped.

#### Scenario: HP gain is required every level past 1

- **WHEN** a character levels up to any level greater than 1
- **THEN** the flow asks for HP gained (default: average for the origin's hit die plus current Constitution modifier; alternative: a manually entered value bounded by [1 + conMod, hitDie + conMod])
- **AND** the new HP value is added to the persisted `maxHp`

#### Scenario: ASI-or-feat is required when the level grants one

- **WHEN** the new level's table entry contains a `LevelChoice` of kind `asi-or-feat`
- **THEN** the flow asks the player to pick either an Ability Score Improvement (+2 to one or +1/+1 to two) or a feat from the unified feat catalog (boons, origin feats, and class feats)
- **AND** an ASI mutates the persisted `abilities` directly; a feat appends to the persisted `feats` list
- **AND** these slots appear at character levels 4, 8, 10, 12, 16, and 19 (Symbaroum places one extra slot at L10 vs base 5E)

#### Scenario: Changeling may take Change Self via the unified feat picker

- **WHEN** the new level's table entry contains a `LevelChoice` of kind `asi-or-feat`
- **AND** the character's origin is Changeling
- **THEN** the Origin Feats section of the feat picker contains a Change Self card
- **AND** picking Change Self consumes the same slot (no ASI is granted, no other feat is granted) and is recorded on the character via `feats.push("change-self")`
- **AND** the dialog does NOT render a separate "Change Self" radio option alongside ASI / Feat

#### Scenario: Spells learned advance with level for any spellcasting approach

- **WHEN** the character's approach has `spellcasting.progression` defined (Mystic approaches, Warrior/Templar, Hunter/Witch Hunter)
- **AND** the new level's row of that progression grants additional cantrips known, additional spells known, or permits a known-spell swap
- **THEN** the flow asks the player to pick exactly the additional cantrips and spells, and (if permitted) one swap of an already-known spell
- **AND** the persisted `spellPicks` reflects the new totals

#### Scenario: Class- or approach-specific feature picks

- **WHEN** the new level's table entry contains a `LevelChoice` whose kind requires a player decision (e.g. `fighting-style`)
- **THEN** the flow asks the corresponding question and persists the resulting selection in the appropriate field

#### Scenario: Validation gates persistence

- **WHEN** the player attempts to confirm the level-up while any required question is unanswered or invalid
- **THEN** the flow displays the validation error and does not change `level`, `maxHp`, `abilities`, `feats`, or `spellPicks`
