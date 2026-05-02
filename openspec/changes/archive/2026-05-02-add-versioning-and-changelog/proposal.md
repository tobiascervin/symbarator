## Why

The app has shipped enough features (L1 builder, full level-up flow, full PG class data, full PG spell catalog, Playwright E2E suite) that "what version is this and what's in it?" is a real question for the user and any future contributor. There's no version surface in the UI today and no changelog tracked anywhere. `package.json` is still pinned at the create-next-app default `0.1.0` and the only record of what's been delivered is the git log. Adding semver-tracked releases plus a visible version + changelog gives us a shared vocabulary for shipping ("v1.1.0 added the spell catalog"), a place to summarize what changed for non-git readers, and one click for the user to confirm they're running the build they think they are.

## What Changes

- Bump `package.json` to `1.0.0` — the leveled character builder is feature-complete enough to call a 1.0. From here we follow [Semantic Versioning 2.0.0](https://semver.org/): MAJOR for breaking schema changes (e.g. another widening of `Character`), MINOR for additive features, PATCH for bug fixes.
- Add `CHANGELOG.md` at repo root following [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) — sections for `Added`, `Changed`, `Fixed`, `Removed`, dated per release. Backfill with the four shipped commits as the 1.0.0 entry.
- Expose the version at runtime via a small `lib/version.ts` module that reads `package.json#version` at build time (Next imports JSON modules natively under the existing `resolveJsonModule: true`).
- Render the version as a small badge in the home page footer and on the `/characters/[id]` sheet header, linked to a new `/changelog` route.
- Render `/changelog` as a server component that parses `CHANGELOG.md` to HTML at build time. Keep dependencies light: a tiny markdown→HTML converter (e.g. `marked`) is enough; no syntax highlighting, no MDX.
- Document the release process in `CLAUDE.md`: bump `package.json`, add a CHANGELOG entry, commit with a `release: vX.Y.Z` message.

Out of scope: automated release tooling (changesets, release-please), GitHub Releases, npm publishing, semantic-release CI, version negotiation against saved characters (the storage migrator already handles forward-compat).

## Capabilities

### New Capabilities
- `app-versioning`: A canonical app version exposed at runtime, a hand-curated changelog tracking shipped releases, and a UI surface that shows the running version and lets the user open the changelog without leaving the app.

### Modified Capabilities
<!-- None — this only adds a new capability; no existing requirements change. -->

## Impact

- **package.json** — version bumps to `1.0.0`. Adds `marked` (small, well-maintained markdown parser) as a dependency.
- **CHANGELOG.md** — new file at repo root, hand-maintained going forward.
- **lib/version.ts** — new module exporting `APP_VERSION` (read from `package.json`).
- **app/changelog/page.tsx** — new server-rendered route that reads `CHANGELOG.md`, parses it via `marked`, and renders styled HTML.
- **app/page.tsx + app/characters/[id]/page.tsx** — small footer/header addition: a "v1.0.0" link to `/changelog`.
- **CLAUDE.md** — short "Release process" subsection.
- **E2E**: a tiny test confirming the version badge is visible and `/changelog` renders. No regressions expected in the existing 19-test suite.
- **Risk**: low. Pure additive UI + a new route. No schema changes. Trivial rollback by removing the route + footer link.
