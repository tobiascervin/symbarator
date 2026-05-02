## 1. Tradition lists (PG pp. 187–190)

- [x] 1.1 Read PG p. 187 (Important Notes + Sorcerer list); record every Sorcerer spell name + level
- [x] 1.2 Read PG p. 188 (Theurg + Troll Singer); record entries
- [x] 1.3 Read PG p. 189 (Witch); record entries
- [x] 1.4 Read PG p. 190 (Wizard); record entries
- [ ] 1.5 Resolve Staff Mage and Symbolist tradition derivation (which list(s) they inherit) and capture the rule — *PG p. 187–190 has no dedicated lists for these; need to read PG p. 114 (Staff Mage approach) and p. 116 (Symbolist) to see how spells are sourced*

## 2. Cantrips (PG p. 192)

- [x] 2.1 Transcribe every cantrip into `data/spells.ts`, tagging tradition tags from the lists in section 1 (21 cantrips encoded)

## 3. 1st-level spells (PG p. 192–195)

- [x] 3.1 Transcribe every 1st-level spell, dedupe-merging with existing entries (49 1st-level encoded)

## 4. 2nd-level spells (PG p. 196–199)

- [x] 4.1 Transcribe (54 2nd-level encoded)

## 5. 3rd-level spells (PG p. 200–207)

- [ ] 5.1 Transcribe

## 6. 4th-level spells (PG p. 208–210)

- [ ] 6.1 Transcribe

## 7. 5th-level spells (PG p. 211–216)

- [ ] 7.1 Transcribe

## 8. 6th-level spells (PG p. 217–220)

- [ ] 8.1 Transcribe

## 9. 7th-level spells (PG p. 221–222)

- [ ] 9.1 Transcribe

## 10. 8th-level spells (PG p. 223)

- [ ] 10.1 Transcribe

## 11. 9th-level spells (PG p. 223)

- [ ] 11.1 Transcribe

## 12. Verification

- [ ] 12.1 `tsc --noEmit` passes
- [ ] 12.2 For each `SpellTradition` and each level the tradition casts at, `spellsForTradition(tradition, level).length > 0`
- [ ] 12.3 Spot-check a few traditions (Theurg, Sorcerer, Wizard) by leveling a Mystic of that tradition through L1–L20 in the dev app; the spell picker is non-empty at every level that grants new spells
