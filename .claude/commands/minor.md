---
name: "Release: Minor (MINOR bump)"
description: Cut a SemVer MINOR release (X.Y.Z → X.{Y+1}.0) — for backwards-compatible additive features.
category: Release
tags: [release, semver, changelog]
---

Cut a SemVer **MINOR** release. Use this for backwards-compatible additive work — new features, new UI surfaces, expanded data, performance improvements that keep `Character` schema and persisted saves valid.

If everything since the last release is just bug fixes, run `/patch` instead. If `Character` widens or any persisted save would no longer load on the new build, run `/major`.

## Steps — execute in order, halt on any failure

### 1. Preflight

Run these in parallel:

- `git status --porcelain` — abort with a clear message if **any** output (working tree must be clean; the user can commit or stash and re-invoke).
- `git rev-parse --abbrev-ref HEAD` — abort if not `main`.
- `git fetch origin main` then `git rev-list HEAD..origin/main --count` — abort if non-zero (branch is behind; ask the user to `git pull --ff-only` first).
- `node -p "require('./package.json').version"` — capture as `CURRENT`.
- `git describe --tags --abbrev=0 --match "v*" 2>/dev/null` — capture as `LAST_TAG` (may be empty on first release).

If any step fails, halt and surface the exact reason. Do not proceed.

### 2. Confirm there's something to release

```
git log ${LAST_TAG:-$(git rev-list --max-parents=0 HEAD)}..HEAD --oneline
```

If the output is empty, abort: there are no commits to release. The user can either land more work or skip the release.

### 3. Compute the new version

From `CURRENT` (e.g. `1.1.0`), bump the minor component and reset patch:

- `1.1.0` → `1.2.0`
- `2.3.7` → `2.4.0`

Capture as `NEXT`. The release tag will be `v${NEXT}`.

### 4. Draft the CHANGELOG entry

Read the commit log since `LAST_TAG` (or repo root) with full messages:

```
git log ${LAST_TAG:-$(git rev-list --max-parents=0 HEAD)}..HEAD --format='%s%n%n%b%n---'
```

Synthesize a Keep a Changelog 1.1.0 entry:

- Heading: `## [${NEXT}] - YYYY-MM-DD` (today's date, ISO).
- One short paragraph capturing the release theme — what's new at a glance.
- Subsections **only when populated**:
    - `### Added` — main course for minor releases (new features, new components, new data).
    - `### Changed` — UI/behavioral changes that aren't bug fixes per se.
    - `### Fixed` — incidental fixes that landed alongside the new work.
    - `### Removed` — only if something is genuinely gone (would normally be major; rare).
- Each bullet describes the user-visible effect, not the commit hash. Group multiple commits that ship one feature into one bullet with sub-points if needed.
- Finish with a link reference at the bottom: `[${NEXT}]: https://github.com/tobiascervin/symbarator/releases/tag/v${NEXT}`.

Insert the new entry **above** the most-recent existing entry in `CHANGELOG.md`. Place the link reference next to the existing release link references at the file end.

### 5. Bump `package.json`

```
npm version minor --no-git-tag-version
```

This updates `package.json` and `package-lock.json` only. No git side effects (we make our own commit).

### 6. Commit + tag

Stage exactly these three files:

```
git add CHANGELOG.md package.json package-lock.json
```

Verify nothing else is staged. Commit with the canonical release message:

```
git commit -m "release: v${NEXT}"
```

Create the tag:

```
git tag v${NEXT}
```

### 7. Push

```
git push origin main
git push origin v${NEXT}
```

(Two pushes — `--follow-tags` only handles annotated tags, which we don't use.)

### 8. Confirm

Print a short summary:

- Old → new version.
- The CHANGELOG entry that was added (top-level paragraph + bullets).
- Commit + tag SHAs.
- Push results.

## Guardrails

- **Halt on failure.** Any non-zero exit before commit means abort and surface the reason.
- **No automatic conflict resolution.** If `git pull --ff-only` is needed, ask the user to run it themselves and re-invoke.
- **Don't amend or force-push.** Releases are append-only.
- **Don't squash or rebase commits since the last tag.** The release captures whatever's been merged.
- **Never re-tag an existing version.** If `v${NEXT}` already exists locally or on origin, abort with a clear message.
- **Don't run `npm install` or `npm audit fix`.** This command only cuts releases; it doesn't touch dependencies.
- **Don't mention this release flow to the user beyond the summary.** They invoked the command; they know what's happening.

## When to escalate to `/major`

If reading the commits reveals any of the following, **stop and tell the user** rather than proceeding with a minor release:

- A `Character` field was added/widened/removed (breaks pre-leveling-style saves).
- A storage key or shape changed.
- A spec scenario was modified or removed (the `MODIFIED Requirements` / `REMOVED Requirements` headers in any archived openspec change since the last tag).
- A removed UI surface that an existing user-facing route depended on.
- A dependency was upgraded across a major version line that affects runtime behavior.

Don't auto-promote — surface the finding and let the user decide.
