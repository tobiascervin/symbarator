## Context

The character sheet at `/characters/[id]` is a screen-first artifact. Parchment gradients, BG3-style spell tabs that hide the spells you're not currently looking at, interactive HP/slot panels with crimson buttons — all designed to feel like a hero log on a dark wooden table. Print it from the browser as-is and the printer dumps half a tank of ink rendering the parchment background, the gradient on the Corruption parchment, and the dark Vitals header bar; spell tabs only show the active level so the printout is missing 80% of the spellbook; and the action bar (Export JSON / Print / Level Up) prints across the top of every page.

What the user wants is the *content* in a layout that respects paper: white background, near-black text, every static field visible at once so they can read it off and copy it onto their PG character sheet. They still want it to feel like a Symbaroum hero sheet — Cinzel display font, an ornate divider or two, a single crimson rule under section headers — but the parchment-and-firelight aesthetic stays on screen.

The Symbaroum app already has the right primitives in place: `LocalCharacterStore.load(id)` is the single read path, all derived stats live behind `compute*` helpers in `lib/character/compute.ts`, and Next.js 16 App Router lets us add a sibling print route under `app/characters/[id]/print/page.tsx` that opts out of the global layout if needed. So the change is mostly a layout component plus a print stylesheet — no new dependencies, no schema work, no new computation.

Constraints:
- Single-player, single-browser. The character lives in `localStorage`; the print route reads it the same way the regular sheet does.
- No server-side rendering of PDFs (no puppeteer / playwright). Stays consistent with the architecture.
- No new client-side dependency. Browser-print-to-PDF is the export.
- Print output must look correct in Chrome's "Save as PDF" (the dominant flow); Safari and Firefox are nice-to-have but not blockers.

## Goals / Non-Goals

**Goals:**
- One coherent printable page (or 2-3 for high-level Mystics with full spellbooks) showing every static character value in transferrable form.
- Look unmistakably like a Symbaroum hero sheet header — Cinzel title, ornate divider, single crimson accent — without burning ink.
- Zero new dependencies; pure CSS and React.
- "Print" entry-point on the regular sheet that opens the print route in a new tab and auto-fires the print dialog on mount.

**Non-Goals:**
- A "true PDF download" via jsPDF / react-pdf / pdf-lib. Browser-print-to-PDF is the export — it produces better fonts, better layout, and ships zero KB.
- Server-side PDF rendering. Out of architecture.
- Live companion-mode state in the printout (currentHp, slots spent, death saves). The use case is paper transfer at session zero, not session snapshot.
- Per-section page breaks under user control. Browser handles pagination via `@page` and CSS `break-inside: avoid` hints.
- A blank fillable PG-branded sheet image with overlay text (licensing risk).
- Spell description compaction. Print shows spell names + level only; the PG remains the source of full text.
- Multi-character batch print.

## Decisions

### Decision 1: Print route + browser print dialog, not a PDF library

```
/characters/[id]            ← screen-first interactive sheet
/characters/[id]/print      ← print-first read-only layout, auto-fires window.print()
```

The print route loads the same character via `LocalCharacterStore.load(id)`, renders `<PrintableSheet character={c} />`, and on mount calls `window.print()` (after a 200ms paint settle so fonts render before the dialog opens). The user picks "Save as PDF" in the system print dialog — Chrome, Edge, Safari, and Firefox all expose this as a default destination — and gets a sharable PDF with embedded fonts and crisp vector text.

**Alternative considered:** A client-side PDF library (`jsPDF` + `html2canvas`, or `@react-pdf/renderer`).
- `jsPDF + html2canvas` rasterizes the DOM to a bitmap and embeds it in a PDF. Output looks soft, fonts look wrong, file sizes balloon, and you lose selectable text.
- `@react-pdf/renderer` is a totally separate render tree (uses its own JSX components, can't share `<PrintableSheet>` with the screen). ~150 KB extra bundle.
- Both options produce worse output than browser print-to-PDF for this use case (text-heavy, single-character sheet, no need to programmatically composite multiple PDFs). Rejected.

The downside of the chosen approach is that the user has to confirm the system print dialog. That's a single click and matches every other "print this page" flow on the web.

### Decision 2: Print route opts into a minimal layout (no app chrome)

Next.js 16 lets a route segment override the default `RootLayout`. `app/characters/[id]/print/layout.tsx` returns a minimal layout that includes only the fonts and the global stylesheet — no header, no footer, no toaster. This way `window.print()` doesn't have to fight against the screen layout.

The print stylesheet additionally hides any controls within the print component itself (a "Print again" button, a "← Back to sheet" link) using `@media print { .no-print { display: none } }`.

**Alternative considered:** Reuse the default app layout and just hide the chrome via CSS. Simpler, but the chrome still mounts (header SVG, fonts, version badge), wastes paint, and is fragile — adding any future global UI would silently leak into the print view. Rejected.

### Decision 3: White-and-black with one crimson accent

Print palette:
- Page background: `white`
- Body text: `#1d1814` (near-black, matches the screen sheet's primary text color so the layout still feels like Symbaroum)
- Section heading underline: a single 1px crimson rule (`#7a1f1f`)
- Pill stats (HP, prof bonus, etc.): plain text in a thin black border, no fill
- Skill / save proficiency markers: outlined dot when not proficient, filled dot when proficient (both render fine on B&W printers)
- No gradients, no `bg-[#efe5cb]` parchment fills, no shadows

The crimson rule is the single concession to "looks like Symbaroum" — every printer renders one accent color cleanly, and dropping it entirely makes the sheet feel sterile. Three ornate dividers (top, after identity, before features) use thin SVG strokes (existing `<OrnateDivider>` component) — they're cheap on ink and convey the right vibe.

**Alternative considered:** Mimic the parchment look via beige paper background. Looks great in mockups, looks terrible on every actual printer (uneven, smudgy, ink-hungry). Rejected.

### Decision 4: One layout, one CSS file, opt-in `print:` Tailwind utilities

The component lives at `components/sheet/printable-sheet.tsx`. Layout is built with regular Tailwind utilities optimized for paper: tight spacing, two-column grids for skills, condensed font sizes. A small `app/characters/[id]/print/print.css` file adds:

```css
@page {
  size: A4;
  margin: 12mm 14mm;
}
@media print {
  body { background: white; color: #1d1814; }
  .no-print { display: none !important; }
}
```

Tailwind's `print:` variants handle the per-element overrides (`print:bg-white`, `print:border-black`).

**Alternative considered:** Two components — one for screen preview, one for print — sharing data. Rejected as over-engineering: the same layout looks fine on screen-as-a-preview if we just don't apply parchment colors to it. The user previewing the print page in a tab IS the preview.

### Decision 5: Auto-fire `window.print()` on mount

When the user clicks "Print" on the regular sheet, a new tab opens to `/characters/[id]/print`. On that route, an `useEffect` fires `setTimeout(() => window.print(), 250)` so fonts have a beat to load before the print dialog renders the page snapshot.

If the user dismisses the dialog (or wants to re-print), a `<button class="no-print">Print again</button>` re-fires the dialog. A `<Link class="no-print" href="/characters/[id]">← Back to sheet</Link>` lets them return.

**Alternative considered:** Don't auto-fire, leave it to a manual button. Rejected because the user came here intending to print — making them click twice (button to open tab, button to print) is friction with no upside. The 250ms paint settle handles the font-load race.

### Decision 6: Print the static snapshot, never the live state

The printable sheet shows:
- Identity, abilities, skills, saves, combat stats (max HP only, hit die only)
- All earned features (with full descriptions — these don't change between sessions)
- Boons, burdens, level-up feats
- Spells known (names + level — full descriptions belong in the PG)
- Equipment
- Identity tropes + notes

The printable sheet **does not** show:
- `currentHp`, `tempHp` — these change every fight
- `currentSpellSlots` (spent vs max) — same
- `hitDiceRemaining`, `deathSaves`
- `corruption.permanent`, `corruption.temporary` — these track per-session state

Justification: a printout is a transfer artifact. The player wants to copy their *character* to paper and then track play on the paper. Printing the live state would mean a stale printout that's wrong by the second session.

**Alternative considered:** A toggle for "static" vs "snapshot" mode. Rejected for v1 — adds UI complexity for a use case nobody asked for. Add later only if a player asks for it.

### Decision 7: Page-break hints, no enforced layout

Use CSS `break-inside: avoid` on each section card so the printer doesn't split a feature description mid-paragraph. Don't enforce specific page breaks — let the browser flow content. For a typical L1-L5 character the print should fit one to two A4 pages; high-level Mystics with full spellbooks may run three. The whole point is that all the data is there; if it's three pages, it's three pages.

If we ever need a "compact" mode for casters with massive spell lists, it's an additive class — not a v1 concern.

## Risks / Trade-offs

- **Browser print rendering varies.** Chrome/Edge are reliable; Safari has tighter `@page` margin behavior; Firefox sometimes mis-renders custom fonts at print-time → Mitigation: test in Chrome first, document Chrome-as-recommended in CLAUDE.md if Safari/Firefox produce visibly worse output. The PDF is identical across browsers once the user picks "Save as PDF" — only the live print dialog rendering varies.
- **Auto-fire `window.print()` can confuse users who landed on the route by URL.** → Mitigation: 250ms delay + visible "Print again" button + "← Back to sheet" link on the page so the route is functional even after dialog dismissal.
- **High-level Mystic with full spellbook overflows pages.** → Mitigation: spells render as a compact two-column list (name + level) — even a 21-known list fits on one A4 page. If a future change adds more spells per character, revisit with a "compact spell list" toggle.
- **Boon / Burden / Feat descriptions are long.** → Mitigation: `break-inside: avoid` on each card so descriptions never split mid-sentence. If a section overflows, it pushes to the next page intact.
- **No companion-mode state means the printout is wrong if the player tries to print mid-session as a snapshot.** → Mitigation: documented as a non-goal. A future "snapshot mode" can layer on if requested.
- **Print stylesheet might leak into screen view.** → Mitigation: scope the print-only CSS inside `@media print { ... }` blocks; verify on the print route's screen render that it looks like a clean preview.
- **Tab-opening for the print route could be blocked by popup blockers.** → Mitigation: the "Print" button on the sheet is a normal `<a target="_blank">` link, not a `window.open()` call — popup blockers leave anchor-tag clicks alone.

## Migration Plan

1. Land the print route + `<PrintableSheet>` component + print stylesheet (additive, no schema changes).
2. Wire the "Print" link into the sheet header alongside Export JSON / Level Up.
3. Add `e2e/print.spec.ts` exercising the print route renders and that key fields appear.
4. `/minor` release as `v1.5.0`.

Rollback: revert. Nothing else depends on the print route; persisted characters are unaffected.

## Open Questions

- **Q1**: Should the print route exclude the identity notes field if it's blank, or always reserve a "Notes" block (so the player can pencil in things on paper later)?
  *Default: always show a "Notes" header with the notes content if present, an empty block if blank, so the printed sheet has a defined area for handwritten additions.*
- **Q2**: Should the print include a small "Generated from symbarator vX.Y.Z on YYYY-MM-DD" footer for traceability?
  *Default: yes — prints fine in faint grey at the bottom, useful for tournament/league players to prove their build is current.*
- **Q3**: Should the "Print" button open a new tab or navigate in place?
  *Default: new tab — auto-firing `window.print()` in-place means the user has to navigate back after dismissal, which is more friction. New tab is the standard "preview before print" pattern.*
- **Q4**: Should Boon/Burden/Feat descriptions render in full or be truncated to the first sentence with a "see PG" suffix?
  *Default: full descriptions — saving paper isn't the goal; transferring information is. A two-page printout with full text beats a one-page printout that sends the player back to the PG to look up what their boon does.*
