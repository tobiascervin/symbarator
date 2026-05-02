# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

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
