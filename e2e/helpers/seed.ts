// LocalStorage seeding for E2E tests.
//
// Playwright's `page.addInitScript` runs before any page script, which is
// exactly when we need to populate localStorage so the app boots into a
// known character state. The runtime app already has a forward-only
// migrator that fills missing fields, so seed shapes can be either a full
// `Character` or an intentionally-minimal raw shape (used by migration tests).

import type { Page } from "@playwright/test";
import type { Character } from "@/lib/character/types";
import { migrateCharacter } from "@/lib/storage/local";

const KEY_PREFIX = "symbaroum:character:";
const INDEX_KEY = "symbaroum:characters:index";

/**
 * Writes a character to localStorage so the next `page.goto` lands in the
 * seeded state. Returns the character's id.
 *
 * If `character.id` is set it's used as-is; otherwise a stable id is
 * generated from the test title for easier debugging.
 */
export async function seedCharacter(page: Page, character: Character): Promise<string> {
  const id = character.id;
  await page.addInitScript(
    ({ id, key, indexKey, payload }) => {
      window.localStorage.setItem(key, payload);
      const rawIndex = window.localStorage.getItem(indexKey);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      if (!index.includes(id)) {
        index.push(id);
        window.localStorage.setItem(indexKey, JSON.stringify(index));
      }
    },
    {
      id,
      key: KEY_PREFIX + id,
      indexKey: INDEX_KEY,
      payload: JSON.stringify(character),
    },
  );
  return id;
}

/**
 * Same as `seedCharacter` but accepts a raw object (for migration tests
 * that want to seed pre-leveling-shape entries lacking `feats`/`maxHp`).
 */
export async function seedRaw(
  page: Page,
  id: string,
  raw: Record<string, unknown>,
): Promise<string> {
  await page.addInitScript(
    ({ id, key, indexKey, payload }) => {
      window.localStorage.setItem(key, payload);
      const rawIndex = window.localStorage.getItem(indexKey);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      if (!index.includes(id)) {
        index.push(id);
        window.localStorage.setItem(indexKey, JSON.stringify(index));
      }
    },
    {
      id,
      key: KEY_PREFIX + id,
      indexKey: INDEX_KEY,
      payload: JSON.stringify(raw),
    },
  );
  return id;
}

/**
 * Re-registers the seeding init script with the character's CURRENT
 * localStorage state. Use this between the wizard's client-side save and a
 * subsequent full page navigation (`page.goto`) so the init script doesn't
 * overwrite mutations the wizard made via SPA navigation. Without this,
 * `gotoSheet(...)` after a wizard Continue reverts localStorage to the
 * original seed payload.
 */
export async function reseedCurrent(page: Page, id: string): Promise<void> {
  const current = await page.evaluate(
    ({ key }) => window.localStorage.getItem(key),
    { key: KEY_PREFIX + id },
  );
  if (!current) return;
  await page.addInitScript(
    ({ key, payload }) => {
      window.localStorage.setItem(key, payload);
    },
    { key: KEY_PREFIX + id, payload: current },
  );
}

/** Read a character back from the page's localStorage (post-action assertions). */
export async function readCharacter(page: Page, id: string): Promise<Character | null> {
  return page.evaluate(
    ({ key }) => {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Character) : null;
    },
    { key: KEY_PREFIX + id },
  );
}

/**
 * Reads localStorage and applies the migrator the same way `LocalCharacterStore.load`
 * does at runtime — so a test can assert on the post-migration shape even when
 * no save has been triggered to write the migrated form back to disk.
 */
export async function readMigratedCharacter(page: Page, id: string): Promise<Character | null> {
  const raw = await page.evaluate(
    ({ key }) => window.localStorage.getItem(key),
    { key: KEY_PREFIX + id },
  );
  if (!raw) return null;
  return migrateCharacter(JSON.parse(raw));
}
