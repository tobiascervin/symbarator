## Context

The spell popover (v1.8) demonstrates the tap-to-popover pattern: tap a spell card → modal opens with character-derived numbers (Spell Mod / Attack / Save DC) + structured effect (damage dice / scaling / save DC) + per-tier "Cast at L<n>" buttons that spend a slot via the existing `spendSlot` primitive in `live-state.ts`. Spells without structured `effect` data degrade to "see description below."

Feats and class features have a similar surface area but a different dominant shape:

- **Boons** (~36 in the catalog) — most are passive `+1 ABL` bumps (already shown as a badge on the card) or "advantage on a specific check." A handful have triggered uses but the vast majority are passive.
- **Burdens** (~16 in the catalog) — most are passive `+2 ABL` bumps with a roleplay disadvantage. None have active uses.
- **Level-up feats** (`Character.feats[]`) — fed from `BOON_BY_ID`, plus markers for `change-self` and `fighting-style:<id>`. Same shape as boons.
- **Class / approach features** (per-level entries in `data/level-tables/*.ts`) — this is where the active-use mechanics live: Battle Wind (Warrior L1, profBonus uses per long rest, gain 2d4+CON temp HP), Action Surge (Warrior L2, 1/rest, then 2/rest at L17), Indomitable (Warrior L7, 1/long rest), Rage (Berserker L1, profBonus uses per long rest), Channel Divinity-style mechanics on Templar, etc.

The "calculated depending on lvl and other factors" framing in the user request maps cleanly to the **per-rest usage counts that scale with proficiency bonus and character level**. That's the high-value mechanical surface. Boons and burdens get the popover for consistency (tap a card → focused single-thing view) but the popover doesn't add much over the existing card for them.

## Goals / Non-Goals

**Goals:**

- A `<FeatTapPopover>` parallel to `<SpellCastPopover>` that opens on tap of any feat / boon / burden / class feature card on the sheet (companion mode only).
- Structured `usage` data on class/approach features that scales with `profBonus` or `level`, with a counter persisted on `Character.featureUses` and a "Use" button that decrements via a new `useFeature` primitive.
- Long rest restores all `usage.per === "long-rest"` features to max; short rest restores `usage.per === "short-rest"` features.
- Structured `effect` data on features that have a derivable formula (e.g., Battle Wind's `2d4 + CON mod`), shown as a resolved value in the popover.
- A first-pass content fill for Warrior + Berserker. The pattern is the same for all other classes; filling them in is a follow-up content change.
- Boons / burdens / level-up feats also tappable for UX consistency. Their popover is mostly a description display + the ability badges they already show on the card.

**Non-Goals:**

- Encoding `usage` / `effect` for every class/approach in the catalog. Schema first, content fills later.
- Auto-applying advantage / disadvantage / temporary modifiers to subsequent rolls. The popover shows; the player rolls.
- Concentration tracking (already out of scope for spells; same here).
- Rendering the popover in the wizard or printable surfaces. Both leave `onTap` undefined.
- A "uses remaining" pip row on the sheet itself (analogous to the spell-slot pip row). The usage counter lives only inside the popover for v1; if multiple features need at-a-glance tracking, a pip strip can be added later.

## Decisions

### Decision: extend the existing feature shape, don't introduce a parallel "active feature" type

The Class/Approach level-table entries already type features as `ReadonlyArray<{ name: string; description: string }>`. Adding optional `id?: string`, `usage?: FeatureUsage`, `effect?: FeatureEffect` to that shape is purely additive — every existing entry continues to validate. Encoding new mechanics on a feature is a one-line edit per entry, not a refactor.

**Alternative considered:** a sibling `ReadonlyArray<ActiveFeature>` field on the level entry. Cleaner separation but doubles the surface and forces every consumer to read both arrays. Not worth the duplication for a transparently-additive change.

### Decision: storage shape — `Character.featureUses: Record<string, number>` keyed by feature `id`

A flat map. The value is the *remaining* uses (not the max — max is derived from the catalog at display time). This matches `currentSpellSlots` (which holds remaining slots, not max). Initial value when a feature is first surfaced: max uses. Migrator backfills `{}` for pre-1.10 saves; the popover lazy-initializes a feature's counter to max on first interaction so existing characters don't need a synthetic "you have X uses" event.

**Why an explicit `id` and not a slug of the name?** Renaming a feature shouldn't reset the player's tracked usage. Explicit `id` is a stable contract; the slug is a fragile inference.

**Why optional `id`?** Most features are passive narrative ("Mindless Rage", "Reckless Attack" — descriptions, not resources). Forcing every entry to declare an id is busywork. Only features with `usage` need an `id`. The data files declare `id` only on the entries that need it; the popover reads the description for everything else.

### Decision: `FeatureUsageMax = number | "profBonus" | "level"` — string sentinels for character-derived counts

```ts
type FeatureUsageMax = number | "profBonus" | "level";
interface FeatureUsage { count: FeatureUsageMax; per: "short-rest" | "long-rest" }
```

`"profBonus"` resolves to `computeProficiencyBonus(c)` at display time; `"level"` resolves to `c.level`. Numbers are taken as-is. Extensible: adding `"halfLevel"` or `"conMod"` later is a one-line union widening.

**Alternative considered:** a function `count: (c: Character) => number`. More flexible but loses serializability — feature definitions are statically declared in TS modules, and a function in there can't be JSON-serialized for tooling / debugging / future server-side use. The string-sentinel approach is honest about the small set of derivations actually needed.

### Decision: `FeatureEffect` is narrow for v1 — only `tempHp` and `passive`

```ts
type FeatureEffect =
  | { kind: "tempHp"; dice: DiceExpression; addAbilityMod?: Ability }
  | { kind: "passive"; note?: string };
```

Most class features that have a "compute me" shape are temp-HP grants (Battle Wind, Heroism-flavored boons). The `passive` variant is the explicit "we know there's no roll" marker — distinguishes "encoded as no-roll" from "we haven't gotten to it yet" (the absent case). Extensible — `"attackMod"`, `"saveDc"`, etc. can join the union later as content demands.

**Why not reuse `SpellEffect` exactly?** Spells have specific shapes (`attack` / `save` / `heal` / `utility`) keyed to spell mechanics. Feature effects are different: temp HP, AC bonuses, advantage on a roll, resistance, etc. Reusing the spell union would mostly add discriminator branches the popover would never render. A small dedicated union is clearer.

### Decision: lazy-initialize `featureUses[id]` to max on first interaction

When the popover opens for a feature with `usage` data and `featureUses[id]` is undefined, treat it as `max` (full uses). The popover doesn't write anything to localStorage just from being opened. Only `useFeature(c, id)` writes, decrementing from max → max−1.

This means a character can be at full uses with no entry in `featureUses` (the absent case). The renderer treats `undefined` as full. This avoids needing a "level up grants this feature → initialize counter" handshake; the implicit max is the source of truth until the player spends a use.

### Decision: long rest restores all `long-rest` features; short rest restores `short-rest` features (only)

`shortRest(c)` extends to also restore (set to max) every feature whose `usage.per === "short-rest"`. `longRest(c)` restores BOTH (because long rest = short rest + more). `extendedRest(c)` calls `longRest` already and so inherits.

The implementation walks `computeFeatures(c)` to find every feature with `usage` data, then sets `featureUses[id] = max` for each match per the rest type.

### Decision: tap targets — only on companion-mode sheet, not wizard or print

`<FeatCard>` gains optional `onTap?: () => void` mirroring `SpellCard.onCast?`. When defined, the card becomes a `<button>` with hover/focus rings. The Features section's paragraph-style entries (origin / background / class / approach features) get the same treatment via a wrapping `<button>` when in companion mode.

The wizard's preview surfaces (boons-burdens-step picker, level-up dialog, etc.) leave the prop undefined; they have their own selection semantics. The printable sheet stays inert.

### Decision: popover header includes the source label so the player knows where the feature came from

Header reads "Battle Wind · Warrior L1" or "Archivist · Boon" or "Cannot Read Elvish · Origin (Abducted Human)". The new `featureSourceLabel(c, feature)` helper resolves this from the catalog. Clear contextualization; useful when the player has many features and the names alone are ambiguous (e.g., "Extra Attack" appears at L5, L11, L20 with different descriptions).

### Decision: `useFeature` is the only mutation primitive for feature usage

No "spend N uses at once," no "add a temporary use" — the only operation is decrement-by-one. Mirrors the simplicity of `spendSlot(c, level)`. If a feature triggers multiple uses (rare; e.g., L17 Action Surge with 2 uses on different turns), the player taps Use twice. Keeps the primitive boring and the rest primitive predictable.

## Risks / Trade-offs

- **Risk: most boons/burdens have nothing to compute, so the popover for them is just a duplicate of the card.** → Acceptable. The consistency of "tap any feat → popover" is worth a slightly redundant view for the passive cases. The popover for an active class feature does a lot more work; the same trigger across the board is a clean UX.
- **Risk: encoding `usage` for one class first leaves the others looking inconsistent ("Warrior tracks Action Surge but Mystic doesn't track Channel Magic Expert").** → Honestly call it out in the changelog (Warrior + Berserker are the first content fill; other classes will follow). The schema is uniform; only the data is partial. A follow-up change can fill the rest.
- **Risk: lazy-initializing usage to max means a player who used Battle Wind 1 turn ago, then loaded the character on a new device, sees full uses.** → True. The character's persisted state was 0 entries, which means full. This is the correct behavior for the absent-entry case (otherwise we'd need to write `featureUses[id] = max` on every level-up that grants a tracked feature). The cost: cross-device consistency requires the player to take a long rest before transferring, OR the player notes they used a feature already. Acceptable.
- **Risk: rest restoration walks `computeFeatures(c)` every time, which iterates origin + class + approach + per-level features.** → It's already O(features) and called only on rest button clicks, not on every render. Cheap.
- **Risk: features without `id` can't be tapped to a popover that does anything beyond description.** → Right. The popover still opens (consistent UX) but renders only the description. As more features get encoded, more open with structured content. Graceful.
- **Risk: a feature's `id` collides across classes (e.g., two classes both define a feature called "indomitable").** → Use class-prefixed ids when encoding (e.g., `warrior:indomitable`). The popover treats id as opaque; the catalog assigns it.
- **Trade-off: not using a `useFeature(c, id, count)` for batch decrement keeps the API tiny.** → Acceptable cost; rare case.

## Migration Plan

1. Land schema (`Character.featureUses`, `FeatureUsage`/`FeatureEffect` types on level-table entries) + migrator backfill in a single commit.
2. Land `lib/character/features.ts` compute helpers + `useFeature` / `restoreFeature` + rest extensions in `live-state.ts` in the same commit.
3. Land `<FeatTapPopover>`, `<FeatCard>` `onTap?` prop, and Features-section button wrappers in a follow-up commit (or same — they're small).
4. Land Warrior + Berserker data fill (id + usage + effect for Battle Wind, Action Surge, Indomitable, Rage) in the same commit.
5. Land E2E tests in the same commit.

No persisted save changes beyond the additive `featureUses` backfill. `Character` widens with one optional-by-default field.

## Open Questions

- **Feature `id` namespacing**: prefix by class id (e.g., `warrior:battle-wind`) or just bare slug? Going with bare slug for legibility in the popover header source label, but reserving the class-prefix option if collisions arise.
- **Should boons / burdens get a synthetic "passive" `effect` so the popover can confidently say "passive — see description" instead of degrading to the same default?** Probably yes — the spell catalog uses `kind: "utility"` for the explicit-no-roll case. The same pattern for boons keeps the UX honest. Tracked but not blocking; the description-only fallback works.
- **The Berserker's Rage damage scales with character level (PG p. 138 — `+1 + half profBonus to melee damage with Strength weapons`).** Should the popover render this as a resolved value? Yes if the schema supports it; for v1 the popover surfaces the usage counter and lets the description carry the damage formula. A follow-up can add a `damageMod` effect kind.
- **Multi-tier features (Action Surge L2 = 1 use, L17 = 2 uses)**: should the L17 entry override the L2 entry's usage, or do they stack? They override — the higher-level entry replaces the earlier one in the popover's display. This is encoded by giving both entries the same `id` (e.g., `warrior:action-surge`) — `computeFeatures(c)` returns both, but the popover's resolver picks the latest one whose level ≤ c.level. Worth verifying during implementation.
