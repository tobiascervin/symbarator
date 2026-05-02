@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack & commands

Next.js 16 (App Router) + React 19 + TypeScript strict, Tailwind v4 (`@tailwindcss/postcss`), shadcn/ui with style `base-nova` and Base UI primitives, `sonner` for toasts, `lucide-react`, `nanoid`, `zod`. Path alias `@/*` → repo root.

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm start`
- `npm run lint` — eslint flat config (extends `eslint-config-next`)
- No test runner is configured.

`AGENTS.md` warns that this is a *current* Next.js — APIs and conventions diverge from older training data. When touching routing, server components, caching, fonts, params, etc., consult `node_modules/next/dist/docs/` before writing code. Note in particular: `params` in app routes are `Promise`s (see `app/builder/[step]/page.tsx`, `app/characters/[id]/page.tsx`) and unwrapped via `use()`.

## Domain: Ruins of Symbaroum 5E

This is a level-1 character builder for the Ruins of Symbaroum 5E tabletop RPG, **not vanilla D&D 5e**. Mechanics that diverge from base 5e are encoded in `lib/character/types.ts` and `lib/character/compute.ts`:

- **HP and Hit Dice come from the Origin, not the Class** (`OriginDef.providesHp`, `OriginDef.hitDie`). Each class still defines a `fallbackHitDie` for non-Symbaroum settings — do not use it when `providesHp` is true.
- **Corruption Threshold** has two formulas (`ClassDef.shadowFormula`): `"standard"` = `2 × profBonus + Cha mod` (min 2); `"mystic"` = `spellcasting ability mod + profBonus` (min 2). See `computeCorruptionThreshold`.
- **Origins** can have sub-choices (e.g. Human → Ambrian / Barbarian) with their own ASI bumps. They also support **floating ASI** the player must allocate (`originAsiAllocation`) — the abilities step UI enforces the exact total.
- **Mystic** is the spellcasting class; its `ClassDef.spellcasting` drives required cantrip/spell pick counts at L1.
- Page references (`PG p. xx`) in code/data point to the Player's Guide PDF in `content/docs/` (gitignored, local only).

When changing rules, the source of truth is the static reference data in `data/` (`origins.ts`, `classes.ts` — which contains approaches, `backgrounds.ts`, `skills.ts`, `spells.ts`, `equipment.ts`, `feats.ts`). Each exposes a typed array plus a `*_BY_ID` lookup map.

## Architecture

The app has three surfaces:

1. **Home** (`app/page.tsx`) — lists characters from local storage, "Forge a New Hero", JSON import/export.
2. **Wizard** (`app/builder/[step]/page.tsx`) — 7-step builder. The `[step]` segment is validated against `STEPS` in `lib/character/validation.ts` and dispatched to a step component in `components/builder/`.
3. **Sheet** (`app/characters/[id]/page.tsx`) — read-only character sheet rendered by `components/sheet/character-sheet.tsx`, which calls the `compute*` helpers.

### Step flow (`lib/character/validation.ts`)

`STEPS = ["origin", "background", "class", "approach", "abilities", "skills-equipment", "identity"]` is the canonical order. `validateStep(step, character)` returns `null` when valid or a user-facing error string. `WizardShell` (`components/builder/wizard-shell.tsx`) calls it on "Continue" and toasts the error if non-null. To add or reorder steps, update `STEPS`, `STEP_LABELS`, the `switch` in `app/builder/[step]/page.tsx`, and `validateStep`.

### Draft state (`components/builder/use-draft.ts`)

`useDraft(id)` loads the character from storage into local state. Step components call `update(d => { ... })` for immediate in-memory edits (uses `JSON.parse(JSON.stringify(...))` for cloning — keep `Character` JSON-safe). `WizardShell` calls `save()` on navigation; there is no autosave.

### Storage (`lib/storage/`)

`CharacterStore` (`lib/storage/index.ts`) is the abstract interface — keep UI code talking to this, not directly to the adapter. The current adapter (`lib/storage/local.ts`) is browser localStorage keyed `symbaroum:character:<id>` with an index at `symbaroum:characters:index`. A server adapter (e.g. Vercel Marketplace Postgres + auth) is intended to replace it without UI changes.

### Compute (`lib/character/compute.ts`)

All derived stats (final abilities with origin bonuses applied, HP, prof bonus, corruption threshold, saves, skills, initiative, spellcasting at L1) live here. The character sheet and downstream UI should use these helpers rather than inlining math.

### Theming

Custom themed primitives in `components/theme/` (`Parchment`, `OrnateDivider`, `BlackletterTitle`) plus shadcn primitives in `components/ui/`. Fonts are Cinzel (display) and Spectral (body), wired in `app/layout.tsx`. shadcn config is `components.json` (style `base-nova`, base color neutral, icon library lucide).

## OpenSpec

`openspec/` is configured with `schema: spec-driven`. The repo uses the `opsx:*` slash commands (`propose`, `explore`, `apply`, `archive`) for proposing and applying spec-tracked changes. Use them when the user asks for spec-driven workflow; otherwise edit code directly.
