## Context

Companion mode (v1.4) made HP, slots, hit dice, rests, corruption, and death saves interactive. The Spellcraft section adopted the spell-slot pip row but left individual spell cards as static info: `<SpellCard>` in display mode renders name + school + ritual badge + description, and that's it. The character object already carries everything needed to derive a spell's live numbers (level, ability scores, proficiency bonus, current spell slots), but no compute helper or UI surfaces them per spell.

`SpellDef` today is descriptive: `id`, `name`, `level`, `school`, `traditions`, optional `ritual`, and a free-text `description`. None of the mechanical data needed for a "live calculation" view is structured. The 297-spell catalog is largely paraphrased from PG/SRD entries; encoding the full mechanical shape for every spell is a content task larger than this change should swallow. A pragmatic schema extension that supports the highest-impact subset and degrades gracefully for the rest is the right shape.

The slot-spend primitive (`spendSlot(c, level)` in `lib/character/live-state.ts`) and the existing `onChange` plumbing already deliver state mutations from companion-mode panels. New UI just needs to call into them.

## Goals / Non-Goals

**Goals:**

- Tap-to-cast: clicking a spell card on the sheet (companion-mode context only) opens a focused view with character-specific numbers — Spell Mod, Spell Attack, Save DC — derived from `computeFinalAbilities` + `computeProficiencyBonus`.
- For spells with structured `effect` data: also show damage/heal dice with the appropriate scaling band ("at L5: 2d10" for cantrips; "+1d10 per slot above L1" for upcasts), the saving throw ability and DC, and a half-on-save indicator.
- Slot consumption from the cast view: a "Cast at L<n>" button per available slot tier ≥ the spell's level. Clicking spends a slot via the existing `spendSlot` primitive.
- A first-pass effect catalog covering every cantrip, every 1st-level spell, and the most-cast Symbaroum spells (~50 spells). Anything else degrades to "no auto-computed effect — see description below."
- Zero impact on the wizard's spell picker (which uses the same `<SpellCard>` in picker mode) and the printable sheet.

**Non-Goals:**

- A full virtual tabletop: no dice rolling, no animated rolls, no targeting, no concentration tracking, no condition application. The popover surfaces the numbers; the player rolls dice and updates state.
- Encoding effect data for every leveled spell. The schema supports it; filling in the catalog beyond the first pass is a separate change.
- Ritual casting flow (no slot consumed). The cast view shows the spell but doesn't currently model the ritual-cast pathway. Worth a follow-up.
- Sorcerer's "choose your spellcasting ability at L1" rule — for v1 the popover uses the approach's `abilityHint`. Tracked as an open question.
- Cantrip upcasts (cantrips don't upcast in 5E — they auto-scale by character level, which the popover already shows).

## Decisions

### Decision: discriminated `SpellEffect` union with optional `scaling` sibling

```ts
export type SpellEffect =
  | { kind: "attack"; damage: DamageRoll; onMiss?: "half" | "none" }
  | { kind: "save"; ability: Ability; damage?: DamageRoll; halfOnSave?: boolean; effect?: string }
  | { kind: "heal"; dice: DiceExpression; addSpellMod?: boolean }
  | { kind: "utility" };  // explicit "no roll, no damage" — distinguishes "we know it's utility" from "we haven't encoded it"

export interface DamageRoll {
  dice: DiceExpression;          // e.g. "1d10"
  type: DamageType;              // "fire" | "cold" | "necrotic" | …
  addSpellMod?: boolean;         // adds the spellcasting ability mod to the damage (rare for spells; common for healing)
}

export interface DiceExpression {
  count: number;                 // 1
  faces: 4 | 6 | 8 | 10 | 12;    // 10
  flat?: number;                 // optional flat add (e.g. +5)
}

export type SpellScaling =
  | { kind: "cantrip"; bands: ReadonlyArray<{ atLevel: 5 | 11 | 17; dice: DiceExpression }> }
  | { kind: "upcast"; perLevel: DiceExpression }; // "+1d10 per slot above the spell's base level"
```

Spells gain optional `effect: SpellEffect` and `scaling?: SpellScaling`. Both are optional. A spell with neither field set behaves exactly as today (description-only). `kind: "utility"` is reserved for explicitly-encoded "no roll" spells (Mage Hand, Prestidigitation) so the popover can confidently say "no save, no attack" instead of "we don't know."

**Alternatives considered:**

- Free-text `formula: string` per spell, parsed at runtime — rejected; parsing rolls/scaling text reliably for 297 entries is a tar pit, and we'd lose type safety.
- Required field on every spell — would force a 297-spell content task before the UI ships. Optional + per-spell rollout is much more pragmatic.
- Encode dice as raw strings (`"1d10 + spellMod"`) — rejected; we need to programmatically compute the actual modifier value at display time.

### Decision: cantrip scaling expressed as bands, not a function

The PG cantrip-scaling rule is "1d? at L1, 2d? at L5, 3d? at L11, 4d? at L17". Encoding this as a `bands` array means each cantrip declares its base damage (in `effect.damage`) and the scaling spec lists what dice to use at each character-level threshold. The compute helper picks the highest band ≤ `c.level`. Some cantrips scale differently (e.g. healing word doesn't scale; chill touch scales differently). The bands array makes those exceptions trivial to encode.

### Decision: use the existing `Dialog` primitive for the popover, not a new Popover wrapper

Base UI provides Popover, but the project hasn't wrapped one in `components/ui/` yet. Adding a new primitive is incidental to the goal. The Dialog primitive (`components/ui/dialog.tsx`) is available and works fine for this — a small modal anchored mid-screen with the cast info. Branding it "Cast Spell" (a verb-led title) reinforces the affordance.

**Alternative:** add a shadcn-style Popover wrapper now and use it. Cleaner UX (anchored to the spell card, doesn't dim the sheet) but defers the work. If the Dialog feels heavy in practice, swap it to Popover in a follow-up.

### Decision: separate compute module `lib/character/spells.ts`, not extending `compute.ts`

`compute.ts` is already 275 lines and covers abilities, HP, prof bonus, saves, skills, the spell-slot table read, initiative, features, corruption threshold. Adding spell attack / save DC / per-spell effect calculation crowds it. A new `lib/character/spells.ts` module exports:

```ts
export function spellcastingAbility(c: Character): Ability | null;        // null for non-spellcasters
export function spellAttackMod(c: Character): number;
export function spellSaveDc(c: Character): number;
export function resolveSpellEffect(spell: SpellDef, c: Character, castAtLevel: SpellLevel): ResolvedSpellEffect;
```

`ResolvedSpellEffect` is the popover-ready view: dice rolled out per scaling band, half-on-save resolved, attack/DC numbers attached.

### Decision: `SpellCard` gains `onCast?` instead of a new card variant

`SpellCard` is already a discriminated union (`display` vs `picker`). Adding a third `cast` variant doubles the surface. Instead, `display` gets an optional `onCast?: (spell, slotLevel) => void` prop. When defined, the card renders a tappable target (e.g. the entire card becomes a button, or a small "Cast" affordance appears). When undefined (picker mode, printable mode), no behavior change.

The companion-mode wrapper (`SheetSpellbook` inside `character-sheet.tsx`) constructs the `onCast` handler that opens the popover for the tapped spell. The popover itself manages `castAtLevel` state and the per-tier "Cast" buttons.

### Decision: `spellcastingAbility(c)` returns the approach's `abilityHint` for v1

The Sorcerer "choose any of INT/WIS/CHA at L1" rule is noted in a class feature description (`data/classes.ts:344`) but not encoded anywhere on `Character`. For v1 the helper just reads `approach.spellcasting.abilityHint` — Sorcerer's `abilityHint` is `cha` per the data file. A Sorcerer player who chose INT or WIS will see the wrong DC. Worth a follow-up: add `Character.spellcastingAbilityOverride?: Ability` and surface a one-time picker for Sorcerer at L1.

This is a known compromise; calling it out so it doesn't surprise anyone.

### Decision: cast popover spends slots through `spendSlot`, not a new primitive

`lib/character/live-state.ts` already exports `spendSlot(c, level)` — used by the existing pip row. The popover's "Cast at L<n>" button calls the same function. No new state shape, no parallel mutation path.

For cantrips (level 0), there's no slot to spend, so the popover renders no Cast buttons — just the computed effect (auto-scaled to character level) and description.

## Risks / Trade-offs

- **Risk: encoding 50 spell effects is still real content work and may sprawl.** → Scope guard: ship the schema + compute helpers + popover with a minimum viable encoding (cantrips + 1st-level spells). The schema's optionality means description-only spells continue to render correctly. A follow-up change can fill in 2nd–9th level spells incrementally.
- **Risk: Sorcerer players see the wrong save DC.** → Documented in design; tracked as an open question. The popover should also display the ability used (e.g. "vs DC 13 (CHA)") so the player can spot the discrepancy and mentally adjust. A follow-up adds the override.
- **Risk: tap-to-cast feels noisy if every card becomes a tap target.** → Visual treatment uses a subtle `cursor: pointer` + hover ring, not a loud "CAST" button. The cast affordance appears only in companion mode; the wizard picker keeps clean checkbox semantics.
- **Risk: opening a Dialog mid-combat is heavier than a Popover.** → Acceptable for v1. Swap to Popover in a follow-up if it proves disruptive.
- **Risk: a player taps a spell, sees no slots ≥ its level (all spent at that tier), and is confused.** → Render the slot tier buttons as disabled with tooltip "no slots remaining at L<n>". Clear messaging beats hiding the option.
- **Trade-off: cantrip scaling encoded as bands adds verbosity per cantrip (~3 extra fields each).** → Worth it for explicit-and-checkable scaling vs. a single-formula assumption that doesn't fit every cantrip.

## Migration Plan

1. Land the `SpellDef` extension (`effect?`, `scaling?`) and the new `lib/character/spells.ts` helpers in a single commit. No data fill yet — all spells remain description-only and continue to render.
2. Land the `<SpellCastPopover>` component, the `onCast?` prop on `SpellCard`, and the companion-mode wiring in `character-sheet.tsx` in a follow-up commit. Spells without `effect` open the popover with just the numbers band + description.
3. Land the data fill in incremental commits — cantrips first (most felt), then 1st-level, then key Symbaroum spells. Each commit is purely additive.
4. E2E tests for the popover open/close, computed numbers, cantrip scaling, upcast scaling, and the slot-spend round-trip land alongside step 2.

No persisted save changes. `Character` is unmodified.

## Open Questions

- **Sorcerer override**: should we add `Character.spellcastingAbilityOverride?: Ability` and a one-shot picker, or punt entirely to a follow-up? Likely punt — the schema-additive approach in this change minimizes risk.
- **Tap target on the card**: full-card tappable, or a dedicated small "Cast" button in the corner? Full-card is more discoverable but means every spell becomes a button (semantic noise). A small icon button is cleaner.
- **Ritual casting**: the existing data has a `ritual` flag. Should the popover surface a "Cast as ritual (no slot)" button when the spell is `ritual: true`? Suggested: yes for v1 if the cost is small — the popover already needs slot-tier buttons; one more "Ritual" button next to them is two more lines of UI. Worth deciding before implementation.
- **Where exactly does `effect` data come from for Symbaroum-flavored spells whose mechanics are paraphrased in the catalog already?** Re-reading the PG entries to encode dice precisely is tedious. The first pass should encode obviously-shaped spells (Magic Missile, Cure Wounds, Fireball-equivalents) and accept that some Symbaroum-specific entries stay descriptive.
