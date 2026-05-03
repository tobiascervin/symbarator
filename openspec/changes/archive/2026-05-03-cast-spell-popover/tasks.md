## 1. Schema extension

- [x] 1.1 In `lib/character/types.ts`, add `DiceExpression`, `DamageType` (string literal union of damage types used in the encoded subset; start small — `"acid" | "bludgeoning" | "cold" | "fire" | "force" | "lightning" | "necrotic" | "piercing" | "poison" | "psychic" | "radiant" | "slashing" | "thunder"`), `DamageRoll`, `SpellEffect` (discriminated union over `kind: "attack" | "save" | "heal" | "utility"`), and `SpellScaling` (discriminated union over `kind: "cantrip" | "upcast"`).
- [x] 1.2 Extend `SpellDef` with optional `effect?: SpellEffect` and `scaling?: SpellScaling`. Both optional — no breaking change to existing entries.

## 2. Compute helpers

- [x] 2.1 Create `lib/character/spells.ts` (new module).
- [x] 2.2 Export `spellcastingAbility(c: Character): Ability | null` — reads the approach's `spellcasting.abilityHint`, returns `null` if the approach isn't a spellcaster.
- [x] 2.3 Export `spellAttackMod(c: Character): number` — `proficiencyBonus + spellAbilityMod` (or 0 for non-spellcasters).
- [x] 2.4 Export `spellSaveDc(c: Character): number` — `8 + proficiencyBonus + spellAbilityMod` (or 8 for non-spellcasters).
- [x] 2.5 Export `resolveSpellEffect(spell: SpellDef, c: Character, castAtLevel: SpellLevel): ResolvedSpellEffect`. Define `ResolvedSpellEffect` as the popover's display-ready view: `{ kind, damageDice?: DiceExpression, damageType?: DamageType, halfOnSave?: boolean, saveAbility?: Ability, attackMod?: number, saveDc?: number, healingDice?: DiceExpression, scalingNote?: string }`. For cantrips, pick the appropriate `bands` entry by `c.level`. For leveled spells with `scaling: "upcast"`, expand the dice by `(castAtLevel - spell.level)` increments of `perLevel`.

## 3. SpellCastPopover component

- [x] 3.1 Create `components/spells/spell-cast-popover.tsx` using the existing `<Dialog>` primitive from `components/ui/dialog.tsx`. Props: `{ open, onOpenChange, spell: SpellDef, character: Character, onCast(slotLevel: SpellLevel): void }`.
- [x] 3.2 Header: spell name, level, school, ritual badge if applicable.
- [x] 3.3 Computed-numbers band: render `Spell Mod +X (ABL)`, `Spell Attack +Y`, `Save DC Z`. Hide the band cleanly if `spellcastingAbility(c)` is null (non-spellcaster — shouldn't happen but defensive).
- [x] 3.4 Effect band (only when `spell.effect` is structured): render damage / heal dice with type, save ability + DC + half-on-save indicator (for save), or attack mod (for attack). For utility, show "No save, no attack."
- [x] 3.5 Cast-at-slot buttons: only for `spell.level >= 1`. For each tier `n` from `spell.level` to `9`, render a `<Button>` "Cast at L<n>" disabled if `currentSpellSlots[n-1] === 0`. Clicking calls `onCast(n)`. The popover maintains a local `castAtLevel` state used to drive the effect band's upcast scaling display.
- [x] 3.6 Description band: always render the spell's `description` text at the bottom.
- [x] 3.7 For description-only spells (no `effect`), the effect band is replaced by a one-line note: "No auto-computed effect — see description below."

## 4. SpellCard integration

- [x] 4.1 Extend `SpellCardDisplayProps` in `components/spells/spell-card.tsx` with `onCast?: () => void`.
- [x] 4.2 In display mode: when `onCast` is defined, wrap the card in a `<button>` (or use `role="button"` + `tabIndex` + key handler) that calls `onCast` on click. Add a subtle `cursor: pointer` + hover ring so the affordance is visible. When `onCast` is undefined (printable mode, picker mode), no behavior change.
- [x] 4.3 Picker mode is unchanged (existing checkbox semantics).

## 5. Sheet wiring

- [x] 5.1 In `components/sheet/character-sheet.tsx`'s `<SheetSpellbook>` wrapper, manage local state `{ castSpell: SpellDef | null }`.
- [x] 5.2 Pass `onCast: () => setCastSpell(spell)` into each rendered `<SpellCard>`. (`SpellCard` is rendered through `<SpellTabs>` — verify the prop drills through; if not, add the plumbing.)
- [x] 5.3 Render `<SpellCastPopover open={castSpell !== null} onOpenChange={(o) => !o && setCastSpell(null)} spell={castSpell} character={c} onCast={(slotLevel) => { handleChange(spendSlot(c, slotLevel)); setCastSpell(null); }} />`.
- [x] 5.4 Confirm the printable sheet (`components/sheet/printable-sheet.tsx`) does NOT pass `onCast`, so its spell cards stay non-interactive.
- [x] 5.5 Confirm the wizard's spell picker uses `mode: "picker"` (not display) and is unaffected.

## 6. SpellTabs prop drilling

- [x] 6.1 If `<SpellTabs>` doesn't currently accept a per-card prop forwarder, extend it with an optional `onCast?: (spell: SpellDef) => void` that it forwards to each rendered `<SpellCard>` in display mode.

## 7. Data fill — cantrips

- [x] 7.1 Encode `effect` and (where applicable) `scaling` for every cantrip in `data/spells.ts`. Reference the SRD/PG for canonical dice. Examples: Fire Bolt (`attack`, `1d10 fire`, cantrip bands at L5/11/17), Mage Hand (`utility`), Sacred Flame (`save`, `dex`, `1d8 radiant`, cantrip bands), Toll the Dead (`save`, `wis`, `1d8/1d12 necrotic` — pick the simpler interpretation for v1 if dual-die is awkward), etc.
- [x] 7.2 For Symbaroum-specific cantrips whose mechanics aren't standard 5E, encode what's clearly stated; leave others as `kind: "utility"` if no roll is involved.

## 8. Data fill — 1st-level spells

- [x] 8.1 Encode `effect` and `scaling: "upcast"` (where applicable) for every 1st-level spell in `data/spells.ts`. Examples: Magic Missile (`attack` shape — no roll, but encode as auto-hit damage if the schema allows; otherwise mark as utility and document the gap), Cure Wounds (`heal`, `1d8`, `addSpellMod: true`, upcast `+1d8 per level above`), Burning Hands (`save`, `dex`, `3d6 fire`, half on save, upcast `+1d6 per level`), Shield (`utility`), etc.
- [x] 8.2 If Magic Missile's auto-hit shape doesn't fit the `attack` discriminator cleanly, document it in design.md as a known gap and mark as `utility` for v1.

## 9. E2E coverage

- [x] 9.1 Update `e2e/helpers/fixtures.ts` if needed — the existing `mysticAtL1` fixture should suffice for spellcasting tests; verify `currentSpellSlots` is non-zero so the cast tests can spend slots.
- [x] 9.2 Add `e2e/spell-cast.spec.ts` (new file).
- [x] 9.3 Test: tapping a spell opens the popover with correct computed numbers (use `mysticAtL1`, check Spell Mod / Attack / Save DC against expected values for INT 15 → mod +2 → DC 12, attack +4 at L1).
- [x] 9.4 Test: Fire Bolt cantrip popover shows `1d10 fire` at L1; bumping the fixture's level to 5 shows `2d10 fire` (use a per-test character override).
- [x] 9.5 Test: Magic Missile (or another upcastable 1st-level spell) — open popover, verify "Cast at L1" enabled and a higher tier disabled if no slot. Click "Cast at L1" and verify `currentSpellSlots[0]` decrements via `readMigratedCharacter`.
- [x] 9.6 Test: a description-only spell still opens the popover and renders "No auto-computed effect — see description below" + the description text.
- [x] 9.7 Test: printable sheet does not render an interactive spell tap target.

## 10. Verification

- [x] 10.1 `npm run build` — clean (TypeScript strict passes; new discriminated unions don't break existing callers).
- [x] 10.2 `npm run test:e2e` — all passing.
- [x] 10.3 Manual smoke: open companion mode for a Mystic/Wizard at L1, tap Fire Bolt → popover shows correct numbers; tap Magic Missile → "Cast at L1" enabled, click it → slot pip drops; tap a description-only spell → popover opens with computed numbers + description.
- [x] 10.4 `npx openspec validate "cast-spell-popover" --strict` — clean.
