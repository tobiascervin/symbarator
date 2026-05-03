## ADDED Requirements

### Requirement: A pure-function module SHALL encode and decode shareable character URLs

A new module `lib/character/share.ts` MUST export at least:

- `encodeCharacterToShareUrl(character: Character, origin: string): string` — returns a URL of the form `${origin}/import?c=<base64>` where `<base64>` is the UTF-8-safe base64 encoding of the minified `Character` JSON. The function MUST NOT depend on the DOM or `window`.
- `decodeCharacterFromUrl(url: string): { character: Character } | { error: string }` — accepts an absolute or app-relative URL, locates the `c` parameter (query first, then `#c=` fragment as a fallback), decodes base64 → JSON, runs `migrateCharacter`, and returns either the resulting character or a one-line error string. Malformed base64, malformed JSON, and migrator failures MUST all surface as a clean error string rather than throwing.

#### Scenario: Round-trip preserves character fields
- **WHEN** a character is passed through `encodeCharacterToShareUrl` then `decodeCharacterFromUrl`
- **THEN** the returned character is deep-equal to the input character (after migration normalization)

#### Scenario: Fragment fallback is read when query parameter is absent
- **WHEN** the encoded URL has the `c` parameter only in `#c=...` (not `?c=...`)
- **THEN** `decodeCharacterFromUrl` still returns the character

#### Scenario: Malformed base64 returns an error
- **WHEN** `decodeCharacterFromUrl` is called with `?c=not%20valid%20base64`
- **THEN** the function returns `{ error: <descriptive string> }` and does NOT throw

#### Scenario: Malformed JSON returns an error
- **WHEN** `decodeCharacterFromUrl` is called with a URL whose `c` parameter decodes to non-JSON text
- **THEN** the function returns `{ error: <descriptive string> }` and does NOT throw

#### Scenario: Encoder warns at the size threshold
- **WHEN** the encoded URL exceeds 8000 characters
- **THEN** `encodeCharacterToShareUrl` still returns the URL (no truncation, no failure)
- **AND** the calling UI surfaces a non-blocking warning toast about SMS truncation risk

### Requirement: The character sheet SHALL surface a Share button that uses the OS share sheet when available

The character sheet (`/characters/[id]`) MUST include a "Share" button in its action bar, positioned near the existing "Export JSON" and "Print" controls. When clicked:

1. If `typeof navigator.share === "function"` is true, the handler MUST call `navigator.share({ title, text, url })` where `url` is the encoded share URL and `title` includes the character's name and the app name.
2. Otherwise, if `typeof navigator.clipboard?.writeText === "function"` is true, the handler MUST write the same URL to the clipboard and surface a success toast ("Link copied to clipboard").
3. Otherwise, the handler MUST surface a fallback dialog containing a textarea with the URL pre-selected so the user can manually copy it.

The button label MUST be "Share" in all three cases. The button MUST NOT cause a hydration mismatch (capability detection happens at click time, not render time).

#### Scenario: Web Share API is invoked when available
- **WHEN** the user clicks Share on a browser where `navigator.share` exists
- **THEN** `navigator.share` is called with `{ url: <encoded share url> }`

#### Scenario: Clipboard fallback fires when share is unavailable
- **WHEN** the user clicks Share on a browser where `navigator.share` is undefined but `navigator.clipboard.writeText` exists
- **THEN** the encoded URL is written to the clipboard
- **AND** a success toast appears reading "Link copied to clipboard" or similar

#### Scenario: Print and JSON export are unaffected
- **WHEN** the Share button is added to the action bar
- **THEN** the existing "Export JSON" and "Print" controls continue to work as before

### Requirement: A `/import` route SHALL preview and import characters from share URLs

A new client-rendered route at `/import` MUST:

- Read the `c` parameter from `useSearchParams()` first, then from `window.location.hash` (matching `#c=...`) as a fallback.
- Call `decodeCharacterFromUrl` and branch on the result.
- On success, render a preview card showing at least: the character's name, origin (and subchoice if present), level, class, approach, and a count of feats / boons / burdens / known spells (where applicable). The preview MUST NOT write anything to localStorage.
- Render a primary "Import" button and a secondary "Cancel" link (back to the home page).
- On Import click, call `LocalCharacterStore.importJson(json)` (or equivalent) and navigate to `/characters/<id>` of the imported character.
- On id collision (the recipient already has a character with the same id), prompt with three explicit options: **Replace**, **Import as a copy** (mints a new id via `nanoid`), **Cancel**. No silent overwrite.
- On decode error, render an error card with the error message and a link back to the home page.

#### Scenario: Tapping a share link opens the preview
- **WHEN** the user navigates to `/import?c=<valid-base64>` for a character not currently in their library
- **THEN** the preview card renders the character's identity and a primary Import button
- **AND** localStorage is unchanged until the user clicks Import

#### Scenario: Importing writes the character and routes to the sheet
- **WHEN** the user clicks Import on the preview
- **THEN** the character is saved to `LocalCharacterStore`
- **AND** the browser navigates to `/characters/<id>`

#### Scenario: Id collision surfaces a three-option prompt
- **WHEN** the user navigates to `/import?c=<base64>` and a character with the same id already exists in localStorage
- **THEN** the preview shows a collision notice and three buttons: Replace, Import as a copy, Cancel
- **WHEN** the user clicks "Import as a copy"
- **THEN** the character is saved with a new id (different from the incoming one) and the existing character is left untouched
- **WHEN** the user clicks "Replace"
- **THEN** the existing character is overwritten with the incoming payload

#### Scenario: Malformed payload surfaces a clean error
- **WHEN** the user navigates to `/import?c=garbage`
- **THEN** an error card renders explaining the issue
- **AND** a link back to the home page is visible
- **AND** no character is saved to localStorage

### Requirement: The home page SHALL accept a pasted share URL as an inbound import path

The home page MUST include a "Paste shared link" affordance (a labelled text input + submit button, or equivalent control) that accepts an arbitrary URL string. On submit, the input's value MUST be validated as containing a `c` parameter (query or fragment). If valid, the page MUST navigate to `/import?c=<...>` (preserving the original `c` payload). If invalid, the input MUST surface a one-line validation message ("That doesn't look like a Symbarator share link") without navigating.

#### Scenario: Pasting a valid share URL routes to the import preview
- **WHEN** the user pastes a valid `?c=...` URL into the home-page paste input and submits
- **THEN** the browser navigates to `/import?c=<payload>` and the preview card renders

#### Scenario: Pasting an invalid URL surfaces an inline error
- **WHEN** the user pastes a URL that doesn't contain `c=` and submits
- **THEN** the input shows a validation message and the URL does not navigate

### Requirement: The printable sheet SHALL NOT surface the Share button

The printable sheet route (`/characters/[id]/print`) MUST continue to expose only the existing "Back to sheet" and "Print again" controls — no Share affordance. Printable mode is a paper-transfer artifact, not the live source of truth, and the existing "Back to sheet" path returns the user to the route where Share lives.

#### Scenario: Printable sheet has no Share button
- **WHEN** the user opens `/characters/<id>/print`
- **THEN** no element with `role="button"` and accessible name `/Share/i` is present
