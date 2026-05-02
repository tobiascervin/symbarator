## 1. Tradition lists (PG pp. 187–190)

- [x] 1.1 Read PG p. 187 (Important Notes + Sorcerer list); record every Sorcerer spell name + level
- [x] 1.2 Read PG p. 188 (Theurg + Troll Singer); record entries
- [x] 1.3 Read PG p. 189 (Witch); record entries
- [x] 1.4 Read PG p. 190 (Wizard); record entries
- [x] 1.5 Resolve Staff Mage and Symbolist tradition derivation — *both use the Wizard tradition list per PG p. 115 (Staff Mage) and p. 117 (Symbolist). Resolved during the leveling change; classes.ts traditions already corrected.*

## 2. Cantrips (PG p. 192)

- [x] 2.1 Transcribe every cantrip into `data/spells.ts`, tagging tradition tags from the lists in section 1 (21 cantrips)

## 3. 1st-level spells (PG p. 192–195)

- [x] 3.1 Transcribe every 1st-level spell (49 entries)

## 4. 2nd-level spells (PG p. 196–199)

- [x] 4.1 Transcribe (54 entries)

## 5. 3rd-level spells (PG p. 200–207)

- [x] 5.1 Transcribe (38 entries) — includes Symbaroum-specific Anathema, Animate Dead (modified), Flaming Servant, Judging Bonds, Larvae Boil, Purging Fire (descriptions paraphrased from PG mechanics)

## 6. 4th-level spells (PG p. 208–210)

- [x] 6.1 Transcribe (30 entries) — includes Symbaroum-specific Illusory Correction and Lifegiver

## 7. 5th-level spells (PG p. 211–216)

- [x] 7.1 Transcribe (34 entries) — includes Symbaroum-specific Commune with Spirits, Exorcism, Fire Soul, Purgatory, Turn Weather, plus modified Flame Strike

## 8. 6th-level spells (PG p. 217–220)

- [x] 8.1 Transcribe (26 entries) — includes Symbaroum-specific Atonement, Living Fortress, Patron Saint, plus modified Create Undead

## 9. 7th-level spells (PG p. 221–222)

- [x] 9.1 Transcribe (19 entries) — includes Symbaroum-specific Soul Stone, modified Ethereality (was Etherealness), modified Plane Shift (Yonderworld)

## 10. 8th-level spells (PG p. 223)

- [x] 10.1 Transcribe (16 entries) — includes Symbaroum-specific Blood Storm

## 11. 9th-level spells (PG p. 223)

- [x] 11.1 Transcribe (10 entries) — includes modified Mass Heal

## 12. Verification

- [x] 12.1 `tsc --noEmit` passes — clean
- [x] 12.2 For each `SpellTradition` and each level the tradition casts at, `spellsForTradition(tradition, level).length > 0` — verified by inspection: every tradition has multiple spells at every level it can cast (cross-checked against the tradition lists at PG pp. 187–190). The Symbolist and Staff Mage traditions inherit the Wizard list (PG pp. 115, 117), and `classes.ts` resolves them via `tradition: "wizard"` so the picker uses the Wizard pool.
- [x] 12.3 Spot-check via E2E suite — `npm run test:e2e` passes 19/19 including a Templar leveling test that exercises the spell-pick UI at L2→L3 with the expanded Theurg pool, and "shows higher-level spells when slots unlock" verifying L5→L6 surfaces both 1st- and 2nd-level spells.

## Final totals

- Catalog grew from 124 → **297 spells** across cantrips and 9 spell levels.
- All five PG-listed traditions (Sorcerer, Theurg, Troll Singer, Witch, Wizard) covered at every level they can cast.
- Symbaroum-specific spells included with PG-derived descriptions; core 5E spells use SRD-style mechanical paraphrases consistent with the existing terse style.
