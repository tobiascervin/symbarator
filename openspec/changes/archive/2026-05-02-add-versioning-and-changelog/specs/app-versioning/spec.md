## ADDED Requirements

### Requirement: The app SHALL expose its version at runtime via a single canonical source

`lib/version.ts` MUST export a constant `APP_VERSION: string` whose value is the `version` field of `package.json` at build time. No code MUST hard-code the version string anywhere else.

#### Scenario: Single source of truth
- **WHEN** the version is referenced in any UI surface
- **THEN** the displayed string equals `APP_VERSION` exactly

#### Scenario: Bumping the version updates every surface in one edit
- **WHEN** `package.json#version` changes from one release to the next
- **THEN** rebuilding the app updates the home-page footer badge, the sheet header badge, and the `/changelog` page version heading without any other code change

### Requirement: The version SHALL appear on the home page and on the character sheet

The home page (`app/page.tsx`) MUST render a small "v{APP_VERSION}" badge that links to `/changelog`. The character sheet header (`app/characters/[id]/page.tsx`) MUST render the same badge.

#### Scenario: Home footer shows version
- **WHEN** a user lands on `/`
- **THEN** the footer contains a link reading `v{APP_VERSION}` (e.g. `v1.0.0`) that navigates to `/changelog` on click

#### Scenario: Sheet header shows version
- **WHEN** a user views any character sheet at `/characters/<id>`
- **THEN** the page header contains a link reading `v{APP_VERSION}` that navigates to `/changelog` on click

### Requirement: The repo SHALL maintain a `CHANGELOG.md` following Keep a Changelog 1.1.0

`CHANGELOG.md` at the repo root MUST exist and follow the Keep a Changelog 1.1.0 conventions: a top-of-file note describing the format, then versioned sections in reverse-chronological order with a dated heading and one or more of `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, `Security` subsections.

#### Scenario: Format conformance
- **WHEN** `CHANGELOG.md` is reviewed
- **THEN** every released version has a heading of the form `## [X.Y.Z] - YYYY-MM-DD` and lists changes under one of the documented subsection types

#### Scenario: 1.0.0 entry exists
- **WHEN** the file is read
- **THEN** it contains a `[1.0.0]` entry summarizing the leveling, Playwright suite, and spell catalog work

### Requirement: The app SHALL render a `/changelog` route that displays the changelog

A Next.js route at `/changelog` MUST render `CHANGELOG.md` as styled HTML. The page MUST be a server component reading the file at build time (or request time on a dynamic route — either is acceptable). The page MUST be reachable from both the home and the sheet via the version badge.

#### Scenario: /changelog renders
- **WHEN** a user navigates to `/changelog`
- **THEN** the page renders the changelog content with headings, lists, and links visible (markdown faithfully converted to HTML)
- **AND** the page does not 404

#### Scenario: Round-trip from version badge
- **WHEN** a user clicks the version badge on the home page
- **THEN** they land on `/changelog`
- **AND** the same is true from the sheet header badge

### Requirement: The release process SHALL be documented in `CLAUDE.md`

`CLAUDE.md` MUST gain a short "Release process" subsection describing the steps: bump `package.json`, add a `CHANGELOG.md` entry, commit.

#### Scenario: Documented
- **WHEN** a developer reads `CLAUDE.md`
- **THEN** they find the release-process steps without needing to read source files
