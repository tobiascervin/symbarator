## 1. Encode/decode module

- [x] 1.1 Create `lib/character/share.ts` (new module).
- [x] 1.2 Export `encodeCharacterToShareUrl(character: Character, origin: string): string`. Use the UTF-8-safe base64 idiom: `btoa(unescape(encodeURIComponent(JSON.stringify(c))))`. Return `${origin}/import?c=<base64>`.
- [x] 1.3 Export `decodeCharacterFromUrl(url: string): { character: Character } | { error: string }`. Accept absolute or relative URLs. Read `c` from query first, then `#c=` fragment. Decode base64 → JSON → `migrateCharacter`. Catch all failures and return a clean error string ("Invalid share link", "Character data couldn't be read", etc.).
- [x] 1.4 Add a `SHARE_URL_SOFT_LIMIT = 8000` constant exported from the same module so the Share button can check it.

## 2. /import route

- [x] 2.1 Create `app/import/page.tsx` as a `"use client"` route.
- [x] 2.2 Read the `c` parameter via `useSearchParams()`. If missing, fall back to `window.location.hash` matching `#c=...` inside a `useEffect` so SSR doesn't break.
- [x] 2.3 Call `decodeCharacterFromUrl` with the assembled URL. Render one of three states:
  - **error**: error card with the message from the decoder + a link back to `/`.
  - **collision** (id already exists in `LocalCharacterStore.list()`): preview card + three buttons (Replace / Import as a copy / Cancel).
  - **preview** (no collision): preview card + Import button + Cancel link.
- [x] 2.4 Preview card content: name, origin (subchoice if present), level + class + approach, counts of feats / boons / burdens / known spells. Match the visual language of the existing home-page character cards.
- [x] 2.5 Implement Import: on click, call `LocalCharacterStore.importJson(JSON.stringify(character))` and `router.push(\`/characters/${character.id}\`)`.
- [x] 2.6 Implement "Import as a copy": override `character.id = nanoid()` (importing `nanoid` from the existing dep), then save and route as above.
- [x] 2.7 Implement Replace: same as Import (the existing `importJson` will overwrite by id since `LocalCharacterStore.save` is keyed on id).
- [x] 2.8 Implement Cancel: `<Link href="/">Cancel</Link>`.

## 3. Sheet Share button

- [x] 3.1 In `app/characters/[id]/page.tsx`, add a "Share" button to the action bar (between "Export JSON" and "Print" reads naturally).
- [x] 3.2 On click: build the URL via `encodeCharacterToShareUrl(character, window.location.origin)`. Check `URL_SOFT_LIMIT` and if exceeded, surface a non-blocking toast warning.
- [x] 3.3 Detect Web Share API at click time: `if (typeof navigator.share === "function")` → call `navigator.share({ title: \`${name} — Symbarator\`, text: ..., url })`. Catch `AbortError` (user cancelled the share sheet) silently; surface other errors as a toast.
- [x] 3.4 Else if `typeof navigator.clipboard?.writeText === "function"` → write URL to clipboard, toast "Link copied to clipboard."
- [x] 3.5 Else fall back to a Dialog with a textarea pre-filled with the URL and select-on-mount so the user can manually copy. (Optional v1 — defensible to skip if the second tier is good enough; flag in design and decide.)

## 4. Home-page paste affordance

- [x] 4.1 In `app/page.tsx`, add a "Paste shared link" row near the existing import / new-character actions.
- [x] 4.2 Input + Submit button. On submit, validate the pasted value contains `c=` (query or fragment). If invalid, show a validation message inline.
- [x] 4.3 If valid, extract the `c` payload and `router.push(\`/import?c=${payload}\`)` — re-emitting the canonical query form regardless of whether the source URL used `?` or `#`.

## 5. Printable sheet — confirm no Share button

- [x] 5.1 Confirm `app/characters/[id]/print/page.tsx` does NOT add a Share button. Add a comment noting this is intentional.

## 6. E2E coverage

- [x] 6.1 Add `e2e/share.spec.ts`.
- [x] 6.2 Test: round-trip — encode `mysticAtL1` (or a fixture) via the encoder, navigate to the resulting URL, click Import, assert the sheet renders with the right name and the character is in localStorage.
- [x] 6.3 Test: malformed payload — navigate to `/import?c=garbage`, assert the error card renders and no character is saved.
- [x] 6.4 Test: id collision — seed `freshL1Hero`, navigate to `/import?c=<encoded freshL1Hero>`, assert the collision prompt renders. Click "Import as a copy", assert two characters now exist in storage with different ids.
- [x] 6.5 Test: home-page paste — go home, type a valid `/import?c=...` URL into the paste input, submit, assert the import preview renders.
- [x] 6.6 Test: home-page paste validation — type a URL without `c=`, submit, assert the inline validation message appears and no navigation happens.
- [x] 6.7 Test: clipboard fallback — stub `navigator.share` to be undefined and `navigator.clipboard.writeText` to capture writes (use `addInitScript`). Click Share, assert the captured URL matches `encodeCharacterToShareUrl(c, location.origin)` and a success toast appears.
- [x] 6.8 Test: Web Share API path — stub `navigator.share` via `addInitScript` to capture the payload. Click Share, assert `navigator.share` was called with the correct `url`.
- [x] 6.9 Test: printable sheet has no Share button — visit `/characters/<id>/print`, assert no "Share"-named role=button is present.

## 7. Verification

- [x] 7.1 `npm run build` — clean (TypeScript strict passes).
- [x] 7.2 `npm run test:e2e` — all passing.
- [x] 7.3 Manual smoke on macOS Safari: open a character sheet, click Share, confirm the share sheet opens with a tappable URL. Open the URL on a phone (AirDrop or pasted into Messages), confirm the import preview renders and importing lands the character on the phone.
- [x] 7.4 Manual smoke on desktop Chrome (likely no `navigator.share`): click Share, confirm the URL ends up on the clipboard and the success toast appears.
- [x] 7.5 `npx openspec validate "share-and-import-characters" --strict` — clean.
