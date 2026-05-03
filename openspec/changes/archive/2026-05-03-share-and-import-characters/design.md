## Context

Today the app already supports character export (downloads a JSON file) and import (file picker on the home page). Both are routed through `LocalCharacterStore.exportJson(id)` and `LocalCharacterStore.importJson(json)` in `lib/storage/local.ts`, which use the same `migrateCharacter` pipeline that handles legacy save shapes. The character itself is JSON-safe (UI mutations clone via `JSON.parse(JSON.stringify(...))`) so there are no sharing-incompatible fields.

What's missing is the OS-native moment: tap a button, see the share sheet, AirDrop or iMessage the character to another device or another person. The Web Share API exposes that capability via `navigator.share({ title, text, url })`. It's broadly available on mobile (Safari, Chrome on Android, Edge mobile) and on desktop Safari (macOS), but absent on desktop Firefox and historically flaky on desktop Chrome. A clipboard-write fallback covers the gap.

The app has no server, no auth, no shared backend. Any sharing mechanism that uses our infrastructure would mean adding one — out of scope. The pragmatic answer is to put the character data into the URL itself so it travels via whatever channel the user picks, and the receiving browser reconstructs the character locally.

## Goals / Non-Goals

**Goals:**

- One-tap share from the character sheet that opens the OS share sheet on supported browsers.
- Self-contained share URLs that don't depend on any backend or third-party service.
- A receiving experience that, for a recipient who taps the link, shows a preview of the character, asks for confirmation, then imports.
- Graceful collision handling when the recipient already has a character with the same id (a re-import-your-own-share scenario, common in testing).
- Clipboard-write fallback when `navigator.share` is unavailable.

**Non-Goals:**

- A backend / link-shortener / expiring share links. Adds infra and offline regressions for a small UX gain.
- Authentication or per-share permissions. The character is already shareable as a JSON file with zero protection; matching that semantic is enough.
- Encryption or passphrase-protected shares. The character contains no PII (name, stats, notes — all player-authored). If a player's notes contain something sensitive, the same concern applies to JSON export. Out of scope.
- Native mobile app packaging. The web app already runs on mobile browsers; the share link opens in whatever browser the OS hands it to.
- Compressing the payload (e.g. LZ-string). The encoded URL fits comfortably even for late-game characters; if this ever changes, it's a follow-up.
- Sharing multiple characters in one URL.

## Decisions

### Decision: payload encoding — minified JSON → base64 → query parameter

The shared URL is `https://<host>/import?c=<base64>` where `<base64>` is `btoa(unescape(encodeURIComponent(JSON.stringify(character))))` (the standard "UTF-8 safe base64" idiom — `btoa` only handles Latin-1 by default, so we percent-encode through UTF-8 first). The decoder reverses: `JSON.parse(decodeURIComponent(escape(atob(c))))`.

The `?` form (query) is used over `#` (fragment) because some SMS / mail clients strip fragments when previewing or shortening URLs. A fragment fallback is supported on the import side: if `?c=` is missing, the decoder also reads `window.location.hash` matching `#c=...`. Outbound shares always emit `?c=`.

**Alternatives considered:**

- **JSON in fragment** (`#c=`) — privacy benefit (fragments aren't sent to servers), but breaks for shorteners and some SMS clients. Privacy gain is theoretical for a TTRPG character with no PII.
- **JSON in path segment** (`/import/<base64>`) — requires Next routing to accept arbitrary base64 (which contains `/` characters). Brittle.
- **Compressed payload** (LZ-string before base64) — saves ~40-60% size. Adds a dependency and complicates the encoder/decoder. Defer until URL-length actually becomes a problem.

### Decision: a dedicated `/import` route, not a home-page modal

The import flow lives at `/import` rather than as a query parameter on `/`. Two reasons:

1. The OS share sheet is going to expose the URL — landing on a route whose name explicitly says "import" is honest and reassuring ("this URL imports a character"). A home page that secretly imports a character based on a URL parameter is surprising.
2. The import flow has its own UI states (preview, error, collision) that benefit from a dedicated page rather than competing with the home page's character list.

The home page still gets a small "Paste shared link" affordance for users who copied the URL out of one channel into another and need to manually paste it.

### Decision: collision policy — explicit prompt, not silent overwrite

When the import payload's `id` already exists in localStorage, the import preview prompts the user with three options:

- **Replace** — overwrites the existing character. Useful when the player updated their character on another device and is re-importing the latest version.
- **Import as a copy** — mints a new id (via `nanoid`), preserves everything else. Useful when sharing a character with a friend who happens to already have a character with that id (rare but possible in testing).
- **Cancel** — back to the home page. Nothing is written.

Silent overwrite would make destructive cases (the player has spent two sessions evolving their character on Browser A, then re-imports the original from a stale share link on Browser B) catastrophic. An explicit prompt is the right floor.

### Decision: preview-then-confirm, not auto-import

The `/import` route renders a preview card (name, origin, level/class/approach, a short feature/equipment summary) and a primary "Import" button. The character is NOT written to localStorage until the user clicks Import. This matches the JSON-import flow's spirit ("you can see what you're getting") and makes the URL-as-payload model clear.

### Decision: outbound share builds the URL via `lib/character/share.ts`, not inline in the button handler

The encode/decode logic lives in a pure-function module so:

- The button handler is a one-liner: `navigator.share({ title, text, url: encodeCharacterToShareUrl(c, location.origin) })`.
- E2E and unit-style tests can call the encoder directly and assert the payload shape.
- The decoder lives next to the encoder (single source of truth for the URL format).

### Decision: Web Share API capability detection at click time, not render time

`navigator.share` is undefined in SSR, so checking it during render either causes a hydration mismatch or forces a client-only render guard. Instead the button is always rendered; on click, the handler checks `typeof navigator !== "undefined" && typeof navigator.share === "function"`. If true → call `navigator.share`. If false → write the URL to the clipboard via `navigator.clipboard.writeText` and toast "Link copied to clipboard". The button label stays "Share" in both cases — the divergence is in what happens after.

For browsers that have neither `navigator.share` nor `navigator.clipboard` (extremely rare in practice; e.g. very old browsers on insecure http origins), the handler falls back to a third path: it surfaces the URL in a `<dialog>` with a textarea the user can manually copy. That's a defensive third tier; the e2e suite covers paths 1 and 2.

### Decision: clipboard fallback uses the **same URL** the share sheet would have used

No divergence in payload between the two channels. Recipients see exactly the same `?c=` URL whether it came via AirDrop or paste. Easier to reason about, easier to test.

### Decision: URL-length sanity check happens at encode time, with a soft warning

If the encoded URL exceeds 8000 characters (a conservative floor — most browsers handle 30k+, but SMS gateways and some redirect chains break around 8k), the encoder still returns the URL but the share button surfaces a toast warning: "This character's data is unusually large; the share link may not work in SMS. AirDrop, email, and Messenger should be fine." This keeps the door open for power users while giving them a heads-up.

8k is also a reasonable line for "should we add compression?" — if a real character regularly hits it, that's the follow-up signal.

## Risks / Trade-offs

- **Risk: the URL contains the entire character JSON.** → That's the point — it's the design. Players already share JSON files with zero protection. The URL is the same shape with a different transport. Worth a one-liner in the share dialog explaining: "Anyone with this link can import a copy of your character."
- **Risk: pasting a malicious URL imports a malicious character.** → The `/import` route runs the payload through `migrateCharacter` (which only fills sane defaults — it doesn't trust arbitrary fields) and then writes a `Character` object to localStorage. Worst case: a malformed character renders weirdly on the sheet. There's no code execution path; the JSON is data, not script. Acceptable.
- **Risk: `navigator.share` calls inside Playwright don't trigger a real OS share sheet.** → True; `navigator.share` returns a promise that resolves immediately when stubbed, or rejects in headless contexts. The e2e suite stubs `navigator.share` via `addInitScript` to capture the payload it would have received, and exercises the clipboard fallback path directly via `navigator.clipboard.writeText`.
- **Risk: clipboard write requires a user gesture and may fail with permission errors in some browsers.** → The share button click IS a user gesture, so this should work in all modern browsers. If `navigator.clipboard.writeText` rejects, the third-tier "copy from textarea" dialog handles the failure.
- **Risk: late-game characters generate long URLs that some channels truncate.** → Toast warning at encode time when over 8k. Compression is a follow-up if needed.
- **Risk: an SSR/hydration mismatch on the import route if the data is read at render time.** → The `/import` route is `"use client"` and reads `useSearchParams` (App Router primitive) plus `window.location.hash` inside a `useEffect`. No SSR.
- **Trade-off: query parameter (vs fragment) means the encoded data hits Vercel access logs.** → Acceptable for a hobby app sharing TTRPG characters. If this becomes a concern, switching to fragment is a one-line change in the encoder.

## Migration Plan

1. Land `lib/character/share.ts` (encoder/decoder) and the `/import` route in a single commit.
2. Land the Share button on the sheet and the home-page paste affordance in the same commit (both depend on the encoder).
3. Land E2E tests in the same commit.

No persisted save changes. `Character` is unchanged. Existing JSON export/import unaffected.

## Open Questions

- **Home-page paste affordance: always visible or behind a "have a shared link?" expander?** — Default to a small always-visible row to keep the discoverability story tight. The expander wins on visual cleanliness but loses on muscle memory.
- **Share button label: "Share" vs "Share link" vs "Send"?** — "Share" matches the OS metaphor; reads cleanly next to "Export JSON" and "Print".
- **Preview card depth: just identity, or include a feature snippet?** — Start with identity (name, origin, level, class, approach) + the count of feats / boons / burdens / known spells. A full feature list belongs on the sheet, not the preview.
- **Should the import route rate-limit pasted URLs in some way?** — No, this is a client-only flow. Nothing to rate-limit.
