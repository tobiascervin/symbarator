// Encode/decode characters for sharing via OS-level channels (Web Share API,
// AirDrop, iMessage, email, clipboard). The character travels in the URL
// itself — there is no backend or link-shortening involved. Recipients open
// the URL in any browser; the `/import` route reads the payload here and
// previews-then-imports the character into LocalStorage.

import type { Character } from "./types";
import { migrateCharacter } from "@/lib/storage/local";

/**
 * Soft warning threshold for the encoded URL length. Major browsers handle
 * URLs of 30k+ comfortably, but SMS gateways and some redirect chains can
 * truncate around 8k. The encoder still returns long URLs unchanged — the
 * UI surfaces a warning toast when this threshold is crossed.
 */
export const SHARE_URL_SOFT_LIMIT = 8000;

const SHARE_PARAM = "c";
const IMPORT_PATH = "/import";

/**
 * Returns the canonical share URL for a character: `${origin}/import?c=<base64>`
 * where `<base64>` is the UTF-8-safe base64 encoding of the minified Character
 * JSON. `btoa` only handles Latin-1, so we route the JSON through
 * `encodeURIComponent` first to escape any multi-byte characters.
 *
 * Pure function — no DOM dependencies. Pass `window.location.origin` (or any
 * protocol+host string) as the second argument.
 */
export function encodeCharacterToShareUrl(c: Character, origin: string): string {
  const json = JSON.stringify(c);
  const base64 = utf8ToBase64(json);
  // URLSearchParams handles percent-encoding the base64 payload (which can
  // contain `+`, `/`, `=` — all legal in URLs but sometimes mangled by
  // chat clients).
  const params = new URLSearchParams();
  params.set(SHARE_PARAM, base64);
  return `${stripTrailingSlash(origin)}${IMPORT_PATH}?${params.toString()}`;
}

/**
 * Reads a share URL (absolute or app-relative) and returns the decoded
 * character or a one-line error string. Reads the `c` parameter from the
 * query first; falls back to the `#c=` fragment for SMS clients that strip
 * query strings. All decode failures (bad base64, bad JSON, migrator throw)
 * surface as a clean `{ error }` rather than throwing.
 */
export function decodeCharacterFromUrl(
  url: string,
): { character: Character } | { error: string } {
  const payload = extractPayload(url);
  if (!payload) {
    return { error: "Share link is missing the character data parameter." };
  }
  let json: string;
  try {
    json = base64ToUtf8(payload);
  } catch {
    return { error: "Share link is malformed (couldn't decode the payload)." };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { error: "Share link contains invalid character data." };
  }
  let character: Character;
  try {
    character = migrateCharacter(raw);
  } catch {
    return { error: "Couldn't read this character — the data may be too old or too new." };
  }
  return { character };
}

/**
 * Convenience: given a string the user typed/pasted (URL or just the `c=`
 * payload portion), return the canonical `?c=<payload>` query string suitable
 * for navigating to `/import`. Returns `null` if no payload is detectable.
 *
 * The home-page paste affordance uses this to normalize whatever the user
 * pasted before pushing the route.
 */
export function extractSharePayload(input: string): string | null {
  return extractPayload(input);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function extractPayload(input: string): string | null {
  // Try parsing as a URL first — handles absolute URLs cleanly.
  try {
    const u = new URL(input, "http://example.invalid");
    const fromQuery = u.searchParams.get(SHARE_PARAM);
    if (fromQuery) return fromQuery;
    const hash = u.hash;
    if (hash) {
      // hash is "#c=...&other=..."
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      const fromHash = hashParams.get(SHARE_PARAM);
      if (fromHash) return fromHash;
    }
  } catch {
    // not a URL — fall through to bare-string parsing
  }
  // Bare-string fallback: strip a leading `?` or `#` if present, then parse.
  const trimmed = input.replace(/^[#?]/, "");
  // Could be `c=...` or `c=...&other=...` or just `<base64>`.
  if (trimmed.includes("=")) {
    const params = new URLSearchParams(trimmed);
    const direct = params.get(SHARE_PARAM);
    if (direct) return direct;
  }
  return null;
}

function utf8ToBase64(s: string): string {
  // `btoa(unescape(encodeURIComponent(s)))` — the standard cross-browser
  // idiom for UTF-8-safe base64. Modern alternatives (TextEncoder + manual
  // conversion) work too but are wordier; `unescape` is "deprecated" but
  // every browser implements it for backward compatibility.
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(s)));
  }
  // Node fallback for tests (unit-style asserts run in Node):
  return Buffer.from(s, "utf8").toString("base64");
}

function base64ToUtf8(b64: string): string {
  if (typeof atob === "function") {
    return decodeURIComponent(escape(atob(b64)));
  }
  return Buffer.from(b64, "base64").toString("utf8");
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
