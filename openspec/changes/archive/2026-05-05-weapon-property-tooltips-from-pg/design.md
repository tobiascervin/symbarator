## Context

`WeaponDef.flags: ReadonlySet<WeaponProperty>` (`lib/character/types.ts:529–545`) carries 16 boolean weapon properties: `finesse`, `light`, `heavy`, `two-handed`, `loading`, `reach`, `deep-impact`, `ensnaring`, `massive`, `restraining`, `returning`, `siege`, `special`, `balanced`, `concealed`, `immobile`. `WeaponDef.properties: ReadonlyArray<WeaponPropertyData>` carries 5 parameterized property kinds: `thrown`, `ammunition`, `range`, `versatile`, `area`. `ArmorDef.flags: ReadonlySet<ArmorProperty>` carries 3 boolean armor properties: `concealable`, `cumbersome`, `noisy`, plus the parameterized `weightyStrMin?: number` (PG p. 171).

`WeaponAttackPopover` (`components/sheet/weapon-attack-popover.tsx`) iterates both sets and emits a flat `propertyLabels: string[]` (e.g. `["finesse", "light", "thrown (20/60 ft)", "versatile (1d8)"]`) which it renders as bare shadcn `<Badge variant="secondary">` elements. The badges are visual-only — no role, no tooltip, no click handler.

`character-sheet.tsx::SheetArmor` and the inventory modal display armor names with their AC formula but currently surface the armor properties only in the printable sheet. Adding property visibility to `SheetArmor` is in scope for parity with the weapon-attack popover.

The shadcn `Tooltip` primitive (`components/ui/tooltip.tsx`) wraps Base UI's tooltip. `TooltipProvider` is already mounted at the app root (`app/layout.tsx:36`). Base UI Tooltip activates on hover/focus only and does not show on touch — the tap-to-show behavior must be implemented as a click-controlled `open` state on the Tooltip root, switching the badge from a passive `<Badge>` to an interactive button at tap targets.

The PG's own property descriptions live on PG p. 167–168 (weapon properties) and p. 171 (armor properties), each as a short paragraph after a bold heading. Reusing that wording near-verbatim is the cheapest way to ship correct content; we credit the page in the catalog so future readers can audit divergence.

## Goals / Non-Goals

**Goals:**

- Every property badge in the weapon-attack popover and the sheet's Armor subsection becomes hoverable on desktop and tappable on touch, with a tooltip/popover content that explains the property using PG-sourced text.
- The catalog is typed against the existing `WeaponProperty`, `WeaponPropertyData["kind"]`, and `ArmorProperty` unions so a new property added to the type system without a tooltip explanation fails to compile.
- Parameterized labels (`thrown (20/60 ft)`, `weighty (15)`) keep their parameter readout in the badge text — the player still sees the per-weapon range/value at a glance — and the tooltip explains the underlying property kind generically.
- Touch (`pointer: coarse`) viewports get the same content via tap; the tooltip stays open until the user taps elsewhere or the badge again. Hover viewports get a hover-and-focus tooltip with no click behavior change.
- A small Playwright check confirms the catalog covers every property currently used by any weapon/armor in `data/equipment.ts`, so a future weapon entry that introduces an unmapped flag fails the test.

**Non-Goals:**

- Tooltips on the printable sheet. Print is paper output — non-interactive by definition.
- Tooltips on the inventory-modal weapon picker. The picker shows damage-and-weight hints; properties aren't surfaced there yet, so there's nothing to wrap. If a follow-up wants property visibility in the picker, the same component drops in trivially.
- Tooltips on damage types (`piercing`, `slashing`, `bludgeoning`, etc.). Those are not property tags in the same sense and the PG doesn't carry one-line definitions for them.
- Modeling property *mechanics* in the resolver (e.g. enforcing *deep impact*'s "double damage dice on crit" or *balanced*'s "+1 AC when wielded with a weapon in the off hand"). The resolver still treats most Symbaroum-specific properties as catalog-only; adding tooltips is independent of expanding the resolver.
- Localizing the PG text. English-only, matching the rest of the app today.
- Editing the PG text in app at runtime (e.g. table rules variants). The catalog is static.

## Decisions

### Decision 1: One catalog, three keyspaces, one shared module

```ts
// data/property-explanations.ts
import type {
  ArmorProperty,
  WeaponProperty,
  WeaponPropertyData,
} from "@/lib/character/types";

export interface PropertyExplanation {
  /** Display name shown above the explanation (e.g. "Two-Handed"). */
  name: string;
  /** PG page where this paragraph is sourced from. */
  pgPage: number;
  /** One-paragraph PG-sourced explanation. */
  description: string;
}

export const WEAPON_FLAG_EXPLANATIONS: Record<WeaponProperty, PropertyExplanation> = { /* ... */ };
export const WEAPON_DATA_EXPLANATIONS: Record<WeaponPropertyData["kind"], PropertyExplanation> = { /* ... */ };
export const ARMOR_FLAG_EXPLANATIONS: Record<ArmorProperty, PropertyExplanation> = { /* ... */ };
```

The `Record<…, …>` shape is the single most important design decision: TypeScript forces every union member to have an entry. Adding a new `WeaponProperty` member without updating the catalog fails `tsc --noEmit`, the same gate `npm run build` already runs.

For the `weighty` armor-property edge case (it's a `weightyStrMin?: number` field on `ArmorDef`, not a member of `ArmorProperty`), the catalog adds a separate `WEIGHTY_EXPLANATION: PropertyExplanation` constant keyed by that field's presence. This sidesteps a phantom union extension.

### Decision 2: A single `<ExplainableBadge>` component, hover OR tap

Replace bare `<Badge>` with `<ExplainableBadge label={...} explanation={...} />`. Internals:

```tsx
function ExplainableBadge({ label, explanation }: ExplainableBadgeProps) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        render={
          <Badge
            variant="secondary"
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen((v) => !v);
              }
            }}
            className="cursor-help tap-target..."
          />
        }
      >
        {label}
      </TooltipTrigger>
      <TooltipContent>
        <div className="font-display tracking-wider text-xs uppercase">{explanation.name}</div>
        <p className="mt-1 text-xs leading-snug">{explanation.description}</p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">PG p. {explanation.pgPage}</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

Why controlled `open`? Base UI Tooltip's default behavior triggers on `mouseenter` / `focus` and never on `click`. Letting the component control `open` lets us layer click-to-toggle on top, which is what touch viewports need. Pointer viewports still get the hover-trigger (Base UI fires `onOpenChange(true)` on hover) — clicks don't break that flow because clicking opens the tooltip you can already see.

Why `Badge` keeps its visual role and gains `role="button"`? The Badge primitive renders a `<span>`. Adding `role="button"` + `tabIndex={0}` + keyboard handlers makes it accessibly interactive without restyling. The `cursor-help` class signals the tooltip on desktop hover; `tap-target` (added in the responsive-mobile-layout change) ensures 44 px tap area on touch.

Why not `Popover` instead of `Tooltip`? Popover is a heavier surface designed for menus / forms, with focus-trap behavior. We want a hover tooltip that also responds to tap — Tooltip with controlled state is the smallest piece that does both.

### Decision 3: Catalog ships with full PG-sourced text on day one

Every entry in `WEAPON_FLAG_EXPLANATIONS`, `WEAPON_DATA_EXPLANATIONS`, and `ARMOR_FLAG_EXPLANATIONS` (plus `WEIGHTY_EXPLANATION`) lands populated. Below are the canonical wordings derived from PG p. 167–168 and p. 171; tasks.md lists them verbatim so the implementor doesn't re-author. Examples:

- **Finesse** (PG p. 167): "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls."
- **Two-Handed** (PG p. 168): "This weapon requires two hands when you attack with it. This property is relevant only when you attack with the weapon, not when you simply hold it."
- **Versatile** (PG p. 168): "This weapon can be used with one or two hands. A damage value in parentheses appears with the property — the damage when the weapon is used with two hands to make a melee attack."
- **Cumbersome** (PG p. 171): "This armor is unwieldy and you have disadvantage on all Dexterity checks while wearing it."
- **Weighty** (PG p. 171): "This armor is especially heavy; you must have a Strength score equal to or higher than the number given in parentheses or reduce your speed by 10 feet."

The full set is itemized in tasks.md.

### Decision 4: Dispatcher in the popover translates raw labels → catalog entries

`weapon-attack-popover.tsx` currently builds `propertyLabels: string[]` like `["finesse", "thrown (20/60 ft)", "versatile (1d8)"]`. Refactor that into a typed `propertyEntries: ExplainableBadgeProps[]` whose entries carry the original label *and* the explanation lookup:

```ts
const entries: ExplainableBadgeProps[] = [];
for (const f of weapon.flags) {
  entries.push({ label: f, explanation: WEAPON_FLAG_EXPLANATIONS[f] });
}
for (const p of weapon.properties ?? []) {
  if (p.kind === "thrown") entries.push({ label: `thrown (${p.range[0]}/${p.range[1]} ft)`, explanation: WEAPON_DATA_EXPLANATIONS.thrown });
  // ... etc
}
```

The label-formatting logic stays exactly where it is today (no behavior change for the visible string); only the lookup is added. This keeps the dispatcher local to the popover; the catalog stays a pure data module.

### Decision 5: Armor cards mirror the weapon-attack popover pattern

`character-sheet.tsx::SheetArmor` previously rendered armor as a static list of name + AC formula. To match the weapon flow (where each weapon is a tap-target opening `WeaponAttackPopover`), each armor row becomes a `<button>` that opens a new `<ArmorDetailsPopover>` carrying the AC formula, weight, optional description, and a property row of `<ExplainableBadge>`s built from `armor.flags` and (if present) `weighty (armor.weightyStrMin)`.

This is a deliberate pivot from the original "inline-badges-on-the-row" design: mixing two interaction models (inline tooltips on armor vs. a popover for weapons) made the badges easy to miss on phone — particularly when the only worn item had no properties to surface inline. Putting both behind a tap-target gives consistent affordance and a single mental model: "tap any combat item to inspect."

The shield row uses the same `<ArmorDetailsPopover>` so the AC contribution is inspectable, but per PG p. 171 shields carry no body-armor property tags — the popover renders no property row for them.

### Decision 6: Inventory modal stays out of scope

The inventory modal's weapon list (`components/sheet/inventory-modal.tsx::handleAddWeapon` row) shows damage-and-weight hints but no property badges today. Adding tooltips there means first surfacing the badges, which is a UX call about picker density, not a tooltip change. We deliberately skip it; if/when a future change adds property badges to the picker, this catalog and component drop in trivially.

### Decision 7: Test coverage gate, not just sample tests

The Playwright test file gets two new specs:

1. **Hover/tap reveals the explanation** (sample weapon `dagger`: badges include `finesse`, hover/tap reveals "When making an attack with a finesse weapon…").
2. **Catalog completeness** — a static check that walks every weapon and armor in `data/equipment.ts` and asserts that every property used has an entry in the catalog. This is implemented as a unit-style assertion (or a test runtime-loaded check) rather than reliance on the type system alone, because catalog entries can have empty / placeholder strings the type system can't catch.

### Decision 8: This is a MINOR release

Per `CLAUDE.md`'s SemVer rules: MAJOR for `Character` schema breaks, MINOR for additive features, PATCH for fixes. This change adds a tooltip layer over existing badges and a static catalog. It is a MINOR bump.

## Risks / Trade-offs

- **[Risk] Base UI Tooltip's hover behavior is fast — desktop users moving across the row may flicker through multiple badges.** **→ Mitigation:** rely on Base UI's built-in `delayDuration` / `closeDelay` defaults from `TooltipProvider` rather than overriding per-component. The default 200 ms open delay smooths flicker. If feedback says the delay is too long for our context, tune at the provider level.
- **[Risk] PG text is the publisher's IP. Reproducing paragraphs verbatim ships their wording in our app.** **→ Mitigation:** the wordings are short rules-text definitions (a few sentences each), the kind of fair-use snippet a reference tool needs. We credit `PG p. <n>` on every tooltip so the source is unambiguous. If the publisher objects, the catalog is one file to swap with paraphrases.
- **[Risk] Mobile click-toggle on a Tooltip can dismiss the underlying weapon-attack popover Dialog if click events propagate.** **→ Mitigation:** the click handler in `ExplainableBadge` calls `e.stopPropagation()`, which keeps the parent dialog open. A Playwright e2e exercises this on a phone viewport to verify.
- **[Risk] The catalog grows when new properties are added, and the `Record<…>` typing forces a code change anyway — but a test asserting "every property used by any equipment row has a catalog entry" double-counts and could lock the test suite to whichever weapons existed at write time.** **→ Mitigation:** the catalog-completeness test enumerates the *current* `data/equipment.ts` rows; adding a new weapon with an existing flag set is fine; adding a new flag must add a `WeaponProperty` union member, which forces the catalog entry — caught by `tsc`. The Playwright check is belt-and-suspenders for hand-written entries with empty descriptions.
- **[Trade-off] We change `Badge` from a static visual to an interactive control — the visual treatment shifts (cursor changes, focus ring becomes visible).** Acceptable: the focus ring already exists on shadcn buttons elsewhere on the sheet, and a cursor-help on hover is the convention for "this has more info." If desktop users find the focus ring noisy, we can scope to `focus-visible:` only — already standard on shadcn primitives.
- **[Trade-off] Touch tap requires the `tap-target` 44 px floor to apply on the badge, which makes badges visually larger on touch viewports than desktop.** Aligns with the responsive-mobile-layout requirements; the visual change is intentional and consistent with other touch-interactive controls on the sheet.
