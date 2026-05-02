## 1. Version source of truth

- [x] 1.1 Bump `package.json#version` from `0.1.0` to `1.0.0`
- [x] 1.2 Add `marked` to `dependencies` (exact-pinned, latest stable — 18.0.3)
- [x] 1.3 Create `lib/version.ts` exporting `APP_VERSION: string` read from `package.json`

## 2. Changelog content

- [x] 2.1 Create `CHANGELOG.md` at repo root using Keep a Changelog 1.1.0 format
- [x] 2.2 Backfill the `[1.0.0] - 2026-05-02` entry summarizing the four shipped features

## 3. Changelog route

- [x] 3.1 Create `app/changelog/page.tsx` as a server component (reads `CHANGELOG.md`, parses via `marked`, renders HTML)
- [x] 3.2 Apply parchment + ornate-divider theming + `.changelog-prose` CSS in `globals.css` for h2/h3/p/ul/li/strong/a
- [x] 3.3 "← Back" link to home in the page header

## 4. UI surfaces for version

- [x] 4.1 Version badge in `app/page.tsx`'s footer linking to `/changelog`
- [x] 4.2 Version badge in `app/characters/[id]/page.tsx`'s header linking to `/changelog`

## 5. Documentation

- [x] 5.1 "Release process" subsection added to `CLAUDE.md`

## 6. Verification

- [x] 6.1 `npx tsc --noEmit` clean
- [x] 6.2 `npm run build` green — `/changelog` is statically prerendered
- [x] 6.3 `npm run test:e2e` — 21/21 pass (was 19; +2 new changelog tests)
- [x] 6.4 New `e2e/changelog.spec.ts`: "home footer shows version badge linking to /changelog" + "/changelog renders the changelog content"
