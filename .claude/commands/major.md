---
name: "Release: Major (MAJOR bump)"
description: Cut a SemVer MAJOR release (X.Y.Z → {X+1}.0.0) — for breaking changes that invalidate existing saves or shift contracts.
category: Release
tags: [release, semver, changelog, breaking]
---

Cut a SemVer **MAJOR** release. Use this when the new build is **not** drop-in-compatible with the old one — the most likely triggers in this repo are:

- A `Character` field was added/widened/removed in a way that the storage migrator can't transparently fill (i.e. would break saves shipped to users).
- A storage key or shape changed (`symbaroum:character:*` keys, `symbaroum:characters:index`).
- A spec scenario was modified or removed (the `MODIFIED Requirements` / `REMOVED Requirements` headers in any archived openspec change since the last tag — the user-facing contract narrowed).
- A removed UI route that an existing user-facing URL depended on.
- A dependency was upgraded across a major version line in a way that affects runtime behavior visibly.

If none of that is true, run `/minor` (additive features) or `/patch` (fixes) instead.

## Steps — execute in order, halt on any failure

### 1. Preflight

Run these in parallel:

- `git status --porcelain` — abort with a clear message if **any** output (working tree must be clean; the user can commit or stash and re-invoke).
- `git rev-parse --abbrev-ref HEAD` — abort if not `main`.
- `git fetch origin main` then `git rev-list HEAD..origin/main --count` — abort if non-zero (branch is behind; ask the user to `git pull --ff-only` first).
- `node -p "require('./package.json').version"` — capture as `CURRENT`.
- `git describe --tags --abbrev=0 --match "v*" 2>/dev/null` — capture as `LAST_TAG`.

If any step fails, halt and surface the exact reason. Do not proceed.

### 2. Confirm there's a real breaking change

Before continuing, **scan** the commit log and the openspec archive for evidence of a breaking change:

```
git log ${LAST_TAG:-$(git rev-list --max-parents=0 HEAD)}..HEAD --format='%s%n%n%b%n---'
git diff ${LAST_TAG:-$(git rev-list --max-parents=0 HEAD)}..HEAD -- lib/character/types.ts lib/storage/local.ts openspec/specs/
```

Look for:

- Type changes to `Character`, `CharacterLevel`, `LevelChoice`, `ApproachDef`, `ClassDef`.
- New required fields on `Character` without a corresponding fallback in `migrateCharacter`.
- Renamed or removed storage keys.
- `## MODIFIED Requirements` or `## REMOVED Requirements` blocks in any archived change folder under `openspec/changes/archive/<date>-*/specs/**/*.md` since the last tag.

If you can't identify a concrete breaking change, **stop** and ask the user to either point to the breakage or run `/minor` instead. Do not auto-justify a major bump.

### 3. Confirm there's something to release

```
git log ${LAST_TAG:-$(git rev-list --max-parents=0 HEAD)}..HEAD --oneline
```

If the output is empty, abort: there are no commits to release.

### 4. Compute the new version

From `CURRENT` (e.g. `1.7.3`), bump the major component and zero the rest:

- `1.7.3` → `2.0.0`
- `0.9.4` → `1.0.0`

Capture as `NEXT`. The release tag will be `v${NEXT}`.

### 5. Draft the CHANGELOG entry

Read the commit log since `LAST_TAG` (or repo root) with full messages:

```
git log ${LAST_TAG:-$(git rev-list --max-parents=0 HEAD)}..HEAD --format='%s%n%n%b%n---'
```

Synthesize a Keep a Changelog 1.1.0 entry:

- Heading: `## [${NEXT}] - YYYY-MM-DD` (today's date, ISO).
- A short paragraph naming the release and explicitly calling out the breaking change.
- Subsections **only when populated**:
    - `### BREAKING` (or fold into `### Removed` / `### Changed` with a leading `**BREAKING**:` callout per Keep a Changelog conventions). Either way, the breaking nature must be obvious in the entry.
    - `### Added` — new features that landed alongside the break.
    - `### Changed` — non-breaking behavioral changes.
    - `### Fixed` — incidental fixes.
    - `### Removed` — anything genuinely gone.
- Each bullet describes the user-visible effect, not the commit hash. Migration guidance — even if just a sentence — should appear next to the breaking item.
- Finish with a link reference at the bottom: `[${NEXT}]: https://github.com/tobiascervin/symbarator/releases/tag/v${NEXT}`.

Insert the new entry **above** the most-recent existing entry in `CHANGELOG.md`. Place the link reference next to the existing release link references at the file end.

### 6. Bump `package.json`

```
npm version major --no-git-tag-version
```

This updates `package.json` and `package-lock.json` only. No git side effects (we make our own commit).

### 7. Commit + tag

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

### 8. Push

```
git push origin main
git push origin v${NEXT}
```

(Two pushes — `--follow-tags` only handles annotated tags, which we don't use.)

### 9. Confirm

Print a short summary:

- Old → new version.
- The breaking change(s) in plain English (1–3 lines), so the user can paste these into a release announcement if needed.
- The full CHANGELOG entry that was added.
- Commit + tag SHAs.
- Push results.

## Guardrails

- **Halt on failure.** Any non-zero exit before commit means abort and surface the reason.
- **No automatic conflict resolution.** If `git pull --ff-only` is needed, ask the user to run it themselves and re-invoke.
- **Don't auto-promote from minor.** If you can't justify the breaking change, refuse and surface the finding — let the user choose between `/minor`, `/patch`, or hand-confirming the major.
- **Don't amend or force-push.** Releases are append-only.
- **Don't squash or rebase commits since the last tag.** The release captures whatever's been merged.
- **Never re-tag an existing version.** If `v${NEXT}` already exists locally or on origin, abort with a clear message.
- **Don't run `npm install` or `npm audit fix`.** This command only cuts releases; it doesn't touch dependencies.
- **Don't mention this release flow to the user beyond the summary.** They invoked the command; they know what's happening.
