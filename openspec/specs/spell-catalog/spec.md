# spell-catalog Specification

## Purpose
TBD - created by archiving change add-spell-catalog. Update Purpose after archive.
## Requirements
### Requirement: The spell catalog SHALL contain every spell from the Player's Guide

`data/spells.ts` MUST export a `SPELLS` array containing one entry per spell described in PG sect. 5 (pp. 192–223). Each entry MUST conform to the existing `SpellDef` interface and include a `name`, kebab-case `id`, `level`, `school`, non-empty `traditions` array, optional `ritual` flag, and a terse mechanical `description`.

#### Scenario: Cantrips
- **WHEN** the catalog is loaded
- **THEN** every cantrip listed in PG p. 192 is present with `level: 0`

#### Scenario: 1st–9th level spells
- **WHEN** the catalog is loaded
- **THEN** every spell listed at PG pp. 192 (1st), 196 (2nd), 200 (3rd), 208 (4th), 211 (5th), 217 (6th), 221 (7th), 223 (8th), 223 (9th) is present at the matching `level`

#### Scenario: Tradition tagging
- **WHEN** any tradition list at PG pp. 187–190 names a spell
- **THEN** that spell's `traditions` array in the catalog includes that tradition's `SpellTradition` id

### Requirement: Tradition lists SHALL be exhaustive across the seven `SpellTradition` ids

The `SpellTradition` union (`sorcerer`, `theurg`, `troll-singer`, `witch`, `wizard`, `staff-mage`, `symbolist`) MUST each have at least one spell tagged at every spell level the tradition can cast per the PG. Where the PG models a tradition by inheriting another tradition's list (Staff Mage and Symbolist), each spell in the inherited list MUST also include the inheriting tradition in its `traditions` array.

#### Scenario: Each tradition has spells at every level it can cast
- **WHEN** `spellsForTradition(tradition, level)` is called for any `(tradition, level)` pair the tradition can cast per the PG
- **THEN** the result is non-empty

### Requirement: Spell descriptions SHALL be terse mechanical paraphrases

Each spell description in the catalog MUST summarize the rule mechanics (range, action type, save, damage/effect, duration) in one short paragraph. Descriptions MUST NOT verbatim-quote the PG flavor prose. Descriptions MUST be precise enough that a player can resolve the spell at the table without reopening the PG.

#### Scenario: Descriptions are mechanical
- **WHEN** any spell entry is reviewed
- **THEN** its `description` reads as a concise mechanics summary (under ~250 characters typical), consistent in tone with the existing entries

### Requirement: Ritual spells SHALL be flagged

Spells the PG marks with the (R) or "ritual" tag MUST set `ritual: true`. Spells without that tag MUST omit the `ritual` field.

#### Scenario: Ritual flag matches PG
- **WHEN** a spell tagged "(R)" or "ritual" in the PG is loaded
- **THEN** its catalog entry has `ritual: true`

