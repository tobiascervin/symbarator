---
name: "Release: Patch (PATCH bump)"
description: Cut a SemVer PATCH release (X.Y.Z → X.Y.{Z+1}) — for backwards-compatible bug fixes only.
category: Release
tags: [release, semver, changelog]
---

Cut a SemVer **PATCH** release. Use this for backwards-compatible bug fixes — code that doesn't add features, doesn't change `Character` schema, and doesn't break any persisted save.

If the work since the last release adds new functionality, run `/minor` instead. If it widens `Character` or otherwise breaks saves, run `/major`.

## Steps — execute in order, halt on any failure

### 1. Preflight

Run these in parallel:

- `git status --porcelain` — abort with a clear message if **any** output (working tree must be clean before a release; the user can commit or stash and re-invoke).
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

From `CURRENT` (e.g. `1.1.0`), bump the patch component:

- `1.1.0` → `1.1.1`
- `2.3.7` → `2.3.8`

Capture as `NEXT`. The release tag will be `v${NEXT}`.

### 4. Draft the CHANGELOG entry

Read the commit log since `LAST_TAG` (or repo root) with full messages:

```
git log ${LAST_TAG:-$(git rev-list --max-parents=0 HEAD)}..HEAD --format='%s%n%n%b%n---'
```

Synthesize a Keep a Changelog 1.1.0 entry:

- Heading: `## [${NEXT}] - YYYY-MM-DD` (today's date, ISO).
- One short paragraph summarizing the release theme — for a hotfix this is usually one sentence.
- Subsections **only when populated**:
    - `### Fixed` — the meat for hotfix releases.
    - `### Changed` — only if a real behavioral change happened (rare for patch).
    - `### Security` — for security fixes.
- Each bullet describes the user-visible effect, not the commit hash. Group multiple commits that fix the same thing into one bullet.
- Finish with a link reference at the bottom: `[${NEXT}]: https://github.com/tobiascervin/symbarator/releases/tag/v${NEXT}`.

Insert the new entry **above** the most-recent existing entry in `CHANGELOG.md`. Place the link reference next to the existing release link references at the file end.

### 5. Bump `package.json`

```
npm version patch --no-git-tag-version
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
- The CHANGELOG entry that was added (the `### Fixed` bullets).
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
