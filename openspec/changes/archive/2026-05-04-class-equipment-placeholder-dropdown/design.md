## Context

Class starting equipment is encoded as **free-text strings** in `data/classes.ts#startingEquipment`:

```ts
"(a) chain shirt OR (b) studded leather armor, longbow, and 20 arrows",
"(a) a martial weapon and a shield OR (b) two martial weapons",
"(a) a light crossbow and 20 bolts OR (b) two handaxes",
"(a) a dungeoneer's pack OR (b) an explorer's pack",
```

The wizard parses each line into options via `String.split(/\bOR\b/i)`, presents them as a `RadioGroup`, and stores the chosen option's index in `Character.classEquipmentPicks[i]`. The sheet's `resolveCharacterInventory(c)` re-parses the chosen option at render time, splitting on `,| and ` and looking each token up against the structured `WEAPONS` / `ARMORS` catalogs.

The two PG-canonical placeholder shapes are:

1. **Single placeholder**: `"a martial weapon"` / `"a simple weapon"` — appears in Captain and Warrior line 1 option (a). The player picks one weapon from the relevant proficiency category.
2. **Count-prefixed placeholder**: `"two martial weapons"` — appears in option (b) of the same line. Player picks two.

Sub-category constrained variants (`"a martial melee weapon"` / `"a simple ranged weapon"`) don't appear in current PG content but are forward-compatible with the same parsing shape.

The bug: today's resolver tokenizer doesn't recognize these placeholders. The token `"a martial weapon"` flows through `WEAPON_BY_NAME["martial weapon"]` (after the `a `/`an `/`the ` prefix strip), misses, and lands in `inventory.other` (free-text gear). The fix is to detect placeholder tokens and substitute them with the player's choice before the catalog lookup.

## Goals / Non-Goals

**Goals:**

- A player picking option (a) on a Warrior's line 1 sees a "Choose your martial weapon" dropdown directly under the option. Their pick (e.g. "Longsword") is persisted on `Character.classEquipmentChoices[1]`. On the sheet, the longsword surfaces as a tap-to-attack card under Combat → Weapons.
- Validator blocks the wizard advance until each placeholder slot has a pick.
- Existing characters (pre-1.15) load cleanly via the migrator; the placeholder remains in the gear list as it does today, until the player revisits the wizard or adds the item via the inventory modal.
- The detection regex covers PG-canonical phrases without false positives on concrete strings like `"chain shirt"` or `"a longbow"`.

**Non-Goals:**

- Restructuring `data/classes.ts#startingEquipment` from free-text strings to a structured shape. The existing strings + a regex-based parser work fine for v1; a future refactor can convert them when there's a need.
- Quantity tracking ("two daggers" already collapses to a single Dagger entry today, since the resolver depluralizes on lookup). This change keeps that behavior.
- A custom-weapon free-text option in the dropdown. Players who want a non-PG weapon can use the inventory modal's Gear tab post-creation; the wizard dropdown is constrained to the catalog.
- A "swap a starting weapon for any other martial weapon" rule. Players who want to deviate use the inventory modal.

## Decisions

### Decision: parsing — regex over a placeholder grammar

Detect placeholder tokens with two regexes:

```ts
// Single-placeholder: "a martial weapon", "a simple ranged weapon"
const SINGLE_RE = /^(?:a |an )(martial|simple)(?:\s+(melee|ranged))?\s+weapon$/i;

// Count-prefixed: "two martial weapons", "three simple weapons"
const COUNT_RE = /^(two|three|four)\s+(martial|simple)(?:\s+(melee|ranged))?\s+weapons$/i;
```

Run both against each tokenized chunk of the chosen option. A match yields a `Placeholder` shape:

```ts
type Placeholder = {
  kind: "martial" | "simple";
  subcategory?: "melee" | "ranged";
  count: 1 | 2 | 3 | 4;
};
```

A line's chosen option may contain 0, 1, or 2 placeholders (concrete + placeholder mix isn't currently in any PG line, but the parser handles N).

**Alternative considered:** restructure `startingEquipment` to a typed array shape:

```ts
startingEquipment: ReadonlyArray<{
  kind: "or";
  options: Array<{ tokens: Array<{ kind: "literal" | "placeholder"; ... }> }>;
}>;
```

Rejected — would touch every class file, every test fixture that hand-builds a class def, and the wizard's `parseOptions` helper. The regex approach keeps the data layer untouched and ships in a fraction of the code. If a future content pack adds many placeholder shapes, the structured form becomes worth it.

### Decision: storage — `classEquipmentChoices: Record<number, string[]>`

Keyed by **line index** (the same key as `classEquipmentPicks`). The value is an ordered list of catalog names — one entry per placeholder slot, in left-to-right order:

```ts
classEquipmentChoices: {
  1: ["Longsword"],          // Warrior line 1 option (a) — "a martial weapon"
}
// or after picking option (b) "two martial weapons":
classEquipmentChoices: {
  1: ["Longsword", "Battleaxe"],
}
```

Storing catalog names (not ids) keeps the data identical to what `inventoryOverrides.added` stores and lets the resolver run them through the same case-insensitive `WEAPON_BY_NAME` lookup. Switching the chosen pick (a → b) reset the array — orphan choices for the unpicked option don't survive.

**Alternative considered:** `Record<lineIdx, Record<placeholderIdx, string>>` for explicit slot-keying. Rejected — array-by-position is fine because placeholder count and order are derivable from the option string at any time.

### Decision: resolver substitution — token-level, in-place

`resolveCharacterInventory` builds the same `classTokens` array as today. After tokenization, walk the tokens (with knowledge of which line they came from), detect placeholder tokens via the regexes, and substitute them with `classEquipmentChoices[lineIdx]` values in left-to-right order:

```ts
let placeholderIdx = 0;
const choices = c.classEquipmentChoices?.[lineIdx] ?? [];
for (const token of tokens) {
  if (isPlaceholder(token)) {
    const choice = choices[placeholderIdx++];
    if (choice) replacedTokens.push(choice);
    // else: leave the placeholder token in — it'll fall through to `other`
    // and the validator should have caught the missing pick
  } else {
    replacedTokens.push(token);
  }
}
```

When a player has picked an option but not yet filled the placeholder dropdowns (mid-wizard state), the placeholder token survives and lands in gear — exactly today's behavior. Once they fill the dropdowns, the substitution kicks in.

### Decision: wizard UI — Select dropdowns, in-line below the option

In the skills-equipment step, after the player picks an option (radio click), parse the chosen option's placeholders and render N `<Select>` controls inline below the option:

```
┌─ Choice 2 ─────────────────────────────────────────┐
│  ◉ a martial weapon and a shield                  │
│       Choose your martial weapon: [Longsword ▾]   │
│  ◯ two martial weapons                            │
└────────────────────────────────────────────────────┘
```

Switching the radio (a → b) clears `classEquipmentChoices[lineIdx]`. Each Select's options are pulled from `WEAPONS` filtered by the placeholder's category and subcategory:

- `kind: "martial"` → `MARTIAL_MELEE ∪ MARTIAL_RANGED`
- `kind: "martial", subcategory: "melee"` → `MARTIAL_MELEE`
- `kind: "simple"` → `SIMPLE_MELEE ∪ SIMPLE_RANGED`
- etc.

Use the existing `Select` primitive for consistency with `LevelUpDialog`'s swap picker.

### Decision: validator — explicit per-line check

Extend `validateStep("skills-equipment", c)` after the existing skill / pick-count validation:

```ts
for (let i = 0; i < cls.startingEquipment.length; i++) {
  const chosen = chosenOption(cls.startingEquipment[i], c.classEquipmentPicks[i]);
  const placeholders = parseOptionPlaceholders(chosen);
  const choices = c.classEquipmentChoices[i] ?? [];
  if (choices.length !== placeholders.length) {
    return `Pick the martial weapon${placeholders.length > 1 ? "s" : ""} for choice ${i + 1}.`;
  }
  // Validate each chosen catalog name matches the placeholder's category.
  for (let j = 0; j < placeholders.length; j++) {
    if (!matchesCategory(choices[j], placeholders[j])) {
      return `Choice ${i + 1}: "${choices[j]}" isn't a valid ${placeholders[j].kind} weapon.`;
    }
  }
}
```

Defense-in-depth — the dropdown disables out-of-category options anyway, but a hand-edited save can't slip through.

### Decision: migrator + back-compat for existing characters

Existing characters with `classEquipmentPicks` that include placeholder options keep their `"a martial weapon"` token in the gear list. The migrator backfills `classEquipmentChoices: {}`; the resolver sees no choices and leaves the placeholder unsubstituted. The character renders exactly as it did before.

When the player revisits the wizard, the validator's new check kicks in — they're forced to pick the specific weapon before re-saving. (Visiting a builder step doesn't auto-save; only Continue clicks save. So the character isn't silently broken.)

For players who don't revisit the wizard, the inventory modal (Tier 2) lets them add the specific weapon as a free-text addition. The placeholder token remains in gear but they have a real weapon under Combat → Weapons.

## Risks / Trade-offs

- [Risk] A future PG content pack adds a placeholder shape my regex doesn't cover (e.g. `"any thrown weapon"`) → resolver leaves it as gear, which is the safe fallback. → **Mitigation**: regex is permissive enough to cover the canonical shapes. Future shapes get added when content lands. The fallback to gear is non-destructive.
- [Risk] An existing player's character breaks visually (placeholder still in gear) until they revisit the wizard. → **Mitigation**: Tier 2's inventory modal already lets them add specific weapons in-session; the placeholder display is informational, not blocking. Migrator does no destructive cleanup.
- [Risk] The wizard's Select control adds vertical complexity to the equipment step layout, especially on mobile. → **Mitigation**: Selects render only when a placeholder is detected — concrete options (Mystic / Hunter / Scoundrel kits) see no extra UI. Captain / Warrior get 1–2 inline dropdowns at most.
- [Trade-off] Two layers of state on the equipment step: `classEquipmentPicks` (radio) + `classEquipmentChoices` (Selects). Manageable since both are scoped to the same step.

## Migration Plan

Schema is additive. Steps:

1. Extend `Character.classEquipmentChoices` and update `emptyCharacter` + `migrateCharacter` + `e2e/helpers/fixtures.ts`.
2. Build `parseOptionPlaceholders(option: string)` helper. Unit-test the regex against canonical phrases.
3. Extend `resolveCharacterInventory` to substitute placeholders during tokenization.
4. Wire the wizard's skills-equipment step to render Selects per detected placeholder.
5. Tighten the validator.
6. E2E: flip the `test.fail` to a regular `test()`; add a wizard-walk test that picks a martial weapon via the dropdown and asserts it surfaces under Combat → Weapons.
7. Manual smoke for Warrior, Captain (placeholder paths) and Mystic / Hunter / Scoundrel (concrete paths — verify no regression).

Rollback: revert the file edits. Saved characters with `classEquipmentChoices` populated load cleanly under older builds (the field is just ignored).

## Open Questions

- **Should switching the radio reset `classEquipmentChoices[lineIdx]`?** Default yes — switching from `(a) a martial weapon and a shield` to `(b) two martial weapons` invalidates the old choice (different placeholder shape). Persisting orphan choices would be more confusing than helpful.
- **Should the wizard remember the player's last martial-weapon pick across characters?** Default no — too speculative. Each character makes their own pick.
- **Should placeholder choices use ids (`"longsword"`) or names (`"Longsword"`)?** Names — matches `inventoryOverrides.added` and the way the resolver lookup works (case-insensitive name keys on `WEAPON_BY_NAME`). Storing ids would require extra plumbing for no benefit.
