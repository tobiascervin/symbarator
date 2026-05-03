## Why

The app already supports character export/import via JSON files, which solves "I built a hero on my laptop and want to use it on my phone" but only with friction: download a file, find it on the phone, open the app, navigate to import, pick the file. That's six steps and most players never get past step three. Tabletop play is intrinsically multi-device — the player builds at home, runs the character on a phone or tablet at the table, and shares with the GM or another player. The OS already knows how to move a URL between devices via AirDrop, iMessage, Messenger, email, etc. Wiring up the Web Share API + a deep-linkable import route turns "share a character with another player" into one tap.

## What Changes

- Add a **Share button** to the character sheet's action bar (next to "Export JSON" and "Print"). On browsers that support `navigator.share`, the button opens the OS share sheet with a self-contained import URL. On browsers that don't, the button copies the same URL to the clipboard and toasts a success message — no functional regression, just a different outbound channel.
- The shared URL is `https://<host>/import?c=<base64-json>`, where the payload is the base64-encoded minified `Character` JSON. No server-side storage; the character travels entirely in the URL. Recipients of the link don't need any account, sign-in, or shared backend — they just tap and the app reads the data directly.
- New **`/import` route** that:
  - Reads the `c` parameter (query first, then `#c=` fragment as a fallback for SMS clients that strip query strings).
  - Decodes base64 → minified JSON → `migrateCharacter` → preview.
  - Renders a preview card with the incoming character's name, origin, level/class/approach, and a primary "Import" button + secondary "Cancel" link.
  - On Import, saves to `LocalCharacterStore` and navigates to `/characters/<id>`.
  - On id collision (the recipient already has a character with that id, e.g. they're re-importing their own share), prompts: "A character with this id already exists. Replace it, import as a copy (new id), or cancel?"
- An **inbound import affordance on the home page** as a fallback: a small "Open shared link" input that accepts a pasted import URL, decodes it, and routes to `/import?c=...`. Useful for users on a browser that didn't follow the link directly (e.g. opening the SMS on a different device than the app is running on, or when the link comes through a channel that doesn't autolink).
- An **error state on `/import`** that explains what went wrong if the payload is malformed, the schema is too old to migrate, or the URL was truncated.
- The Share button MUST work on the printable sheet route's "Back to sheet" navigation, but the printable sheet itself does NOT get a Share button (it's already a paper-transfer artifact, not the source of truth).

## Capabilities

### New Capabilities

- `character-sharing`: outbound Share button on the sheet using the Web Share API (with clipboard fallback), URL-based encoding of `Character` payloads, the `/import` route that decodes and previews-then-saves the incoming character, and the inbound paste affordance on the home page.

### Modified Capabilities

(none — character creation, leveling, companion mode, etc. are untouched)

## Impact

- **New module**: `lib/character/share.ts` exporting `encodeCharacterToShareUrl(character, origin)` and `decodeCharacterFromUrl(url): Character | { error: string }`. Pure functions; no DOM dependencies so they're easy to test and reuse.
- **New route**: `app/import/page.tsx` — client-rendered, reads URL params via `useSearchParams` + `window.location.hash` fallback, calls `decodeCharacterFromUrl`, renders preview / error / collision prompt.
- **Sheet UI**: `app/characters/[id]/page.tsx` gains a `Share` button. `navigator.share` capability is detected at click time (not render time, to avoid SSR mismatches). Falls back to clipboard write.
- **Home UI**: `app/page.tsx` gains a small "Paste shared link" input (collapsible or always-visible — design decides). On submit, validates the URL shape and routes to `/import`.
- **No schema change**: `Character` is unchanged. The shared payload is the same shape as the existing JSON export.
- **No persistence change**: `LocalCharacterStore.save` is the existing primitive; the importer calls `importJson` (already in the store) which migrates and saves.
- **URL-length envelope**: a typical L1 character minified is ~1.5–3 KB, base64 → ~2–4 KB. A maxed L20 character with notes/feats/spells could push 10–15 KB raw, ~14–20 KB encoded. All major browsers and modern messaging apps handle URLs of that length. Compression (e.g. LZ-string before base64) is **out of scope**; if a real character ever exceeds the practical limit, that's a follow-up.
- **Tests**: E2E coverage for the round-trip (export → share URL → decode → re-import shows the same character), the home-page paste flow, the id-collision prompt, and a malformed-payload error state. Web Share API's native share sheet can't be Playwright-driven; we stub `navigator.share` to capture the payload it would have sent, and exercise the clipboard fallback path directly.
- **Out of scope**: server-side character storage, link shortening, expiring share links, encryption / passphrase protection, sharing multiple characters in one URL, native mobile app packaging (this is a web app — opening the link in any browser is the import path), PWA install promotion (worth doing later but doesn't gate this).
