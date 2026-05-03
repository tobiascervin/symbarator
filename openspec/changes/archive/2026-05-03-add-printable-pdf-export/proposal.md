## Why

Plenty of Symbaroum tables still play with paper sheets — even players who'd happily build a hero in the app then want a tidy printout to bring to the table and copy into the official PG character sheet. Today the only way to get the numbers off the screen is to read them off the live `/characters/[id]` route, which is built for screen interaction (parchment gradients, interactive HP/slot panels, BG3-style spell tabs that hide most of the catalog at once). Print it from the browser as-is and you get one ink-soaked, partially-hidden mess across three pages.

This change adds a dedicated printable view at `/characters/[id]/print` that's optimized for paper transfer: white background, black text, every static value visible at once, with a tasteful Symbaroum header treatment so it still feels like a hero sheet rather than a tax return. Browser print-to-PDF turns it into a sharable file with no extra dependencies.

## What Changes

- **New route** `app/characters/[id]/print/page.tsx` that renders a `<PrintableSheet>` component for the seeded character. Auto-opens the browser print dialog on mount (with a graceful "Print again" button if the user dismisses it).
- **`<PrintableSheet>` component** in `components/sheet/printable-sheet.tsx` — a print-first layout that shows everything in one scrolling page (CSS `@page` controls actual page breaks):
    - Identity block (name, pronouns, level/origin/class/approach/background)
    - Ability scores + modifiers + saving throws (compact two-column block)
    - Skills with proficiency markers and modifiers
    - Combat stats: max HP, hit die, prof bonus, initiative, speed, corruption threshold (one row of pill stats)
    - All earned features (origin / subchoice / background / class / approach / per-level), with full descriptions
    - Boons + Burdens (one card each with full text)
    - Feats accumulated via level-up
    - Spells known — one column per spell level, listing names only (description summaries are quick reference; full PG text stays in the book)
    - Equipment from class picks + background gear
    - Identity tropes (personality / ideal / bond / flaw) + notes
- **Print stylesheet** wired into the print route: white background, near-black text, no gradients, no interactive controls, ornate dividers reduced to thin SVG strokes, single crimson accent under headings. Page size A4 with Letter as a fallback (CSS `@page size: A4`).
- **"Print" button on the regular character sheet** in `components/sheet/character-sheet.tsx`, sitting next to "Export JSON" / "Level Up". Opens `/characters/[id]/print` in a new tab.
- **Print uses the static character snapshot only** — `currentHp`, `tempHp`, `currentSpellSlots`, `hitDiceRemaining`, and `deathSaves` are deliberately NOT printed. The printable sheet is for paper transfer; live state belongs on the screen.
- **No new dependencies.** Browser handles print → PDF; we own only the layout and CSS.

Out of scope:
- Server-side or client-side PDF generation libraries (jsPDF, react-pdf, puppeteer). Browser-print-to-PDF is the export. Adding a PDF lib would mean a 100KB+ bundle for a worse-looking output (font subsetting issues, layout drift). Revisit only if a user can't access browser print-to-PDF.
- A blank fillable Symbaroum-branded sheet image (PG asset) with overlay text. Out of scope until we know there's licensing room to redistribute the official sheet.
- Printing live companion-mode state (currentHp, slots spent, death saves). The use case is "transfer to paper at session zero," not "snapshot mid-session."
- Multi-character batch printing.
- Custom paper size beyond A4 / Letter, or custom page breaks per section.
- Translating spell descriptions into compact summaries — names + level only at print time. The PG remains the source for full spell text.

## Capabilities

### New Capabilities
- `printable-export`: A static, printer-friendly view of any saved character at `/characters/[id]/print`, plus the entry point on the regular sheet that links to it. Covers print-stylesheet rules, what fields appear vs. are deliberately omitted, page-setup conventions, and the auto-open-print-dialog behavior.

### Modified Capabilities
<!-- None. The character-creation, character-leveling, companion-mode, and other capabilities don't change their requirements — this adds a new render surface that reads the existing static character data. -->

## Impact

- **New files**:
    - `app/characters/[id]/print/page.tsx` — print-mode route that loads the character and renders `<PrintableSheet>`.
    - `components/sheet/printable-sheet.tsx` — the print-optimized layout component.
    - Optional `app/characters/[id]/print/print.css` (or scoped Tailwind print: utilities) for `@page` size + paper-friendly overrides that screen Tailwind doesn't model cleanly.
- **Touched files**:
    - `components/sheet/character-sheet.tsx` — adds a "Print" button to the existing action bar, OR (more likely) `app/characters/[id]/page.tsx` since that's where the action bar lives.
    - `app/globals.css` — may need a small `@media print` block to hide the global header/footer on the print route, depending on whether the print route opts out of the app layout.
- **No schema impact** — the print view is read-only, never writes to `Character`.
- **No storage impact** — same `LocalCharacterStore.load(id)` call the regular sheet uses.
- **No new dependencies.**
- **E2E**: a new `e2e/print.spec.ts` exercising the print route renders end-to-end and that the static character data shows up in the printable surface (cannot easily assert on the actual print dialog from Playwright, but the rendered page is what gets printed).
- **Risk**: low. New route, new component, no mutations, no schema changes. The only failure mode is "print looks bad" — a CSS-only correction.
- **Versioning**: minor bump. Additive new surface, zero breakage.
