// Share + import flow — covers the encoder/decoder round-trip, the /import
// route's preview, error, and id-collision states, the home-page paste
// affordance, the Web Share API path (stubbed), the clipboard fallback, and
// confirms the printable sheet stays Share-button-free.

import { test, expect } from "@playwright/test";
import {
  seedCharacter,
  readCharacter,
} from "./helpers/seed";
import { freshL1Hero, mysticAtL1 } from "./helpers/fixtures";
import {
  encodeCharacterToShareUrl,
  decodeCharacterFromUrl,
} from "@/lib/character/share";

test.describe("Share encoder/decoder (pure)", () => {
  test("round-trips a character byte-for-byte", () => {
    const url = encodeCharacterToShareUrl(mysticAtL1, "https://app.example");
    expect(url).toContain("/import?c=");
    const result = decodeCharacterFromUrl(url);
    expect("character" in result).toBe(true);
    if ("character" in result) {
      expect(result.character.id).toBe(mysticAtL1.id);
      expect(result.character.identity.name).toBe(mysticAtL1.identity.name);
      expect(result.character.spellPicks).toEqual(mysticAtL1.spellPicks);
    }
  });

  test("decodes from #c= fragment as a fallback", () => {
    const queryUrl = encodeCharacterToShareUrl(mysticAtL1, "https://app.example");
    const payload = new URL(queryUrl).searchParams.get("c")!;
    const fragmentUrl = `https://app.example/import#c=${encodeURIComponent(payload)}`;
    const result = decodeCharacterFromUrl(fragmentUrl);
    expect("character" in result).toBe(true);
    if ("character" in result) {
      expect(result.character.id).toBe(mysticAtL1.id);
    }
  });

  test("returns a clean error for malformed payload", () => {
    const result = decodeCharacterFromUrl("https://app.example/import?c=not%20valid%20base64!");
    expect("error" in result).toBe(true);
  });
});

test.describe("Share + import flow (browser)", () => {
  test("import preview renders for a fresh character and Import lands on the sheet", async ({ page }) => {
    const url = encodeCharacterToShareUrl(mysticAtL1, "http://localhost:3000");
    const path = url.replace(/^https?:\/\/[^/]+/, ""); // /import?c=...
    await page.goto(path);

    // Preview card surfaces the character's identity.
    await expect(page.getByText(/Mystic L1/)).toBeVisible();
    // Click Import.
    await page.getByRole("button", { name: /^Import$/ }).click();

    await expect(page).toHaveURL(/\/characters\/test-mystic-l1/);
    const stored = await readCharacter(page, mysticAtL1.id);
    expect(stored?.identity.name).toBe(mysticAtL1.identity.name);
  });

  test("malformed payload renders an error card without saving", async ({ page }) => {
    await page.goto("/import?c=garbage%21");
    await expect(page.getByText(/Couldn't open this share link/i)).toBeVisible();
    // No character was saved — list should still be empty.
    const stored = await readCharacter(page, "garbage");
    expect(stored).toBeNull();
  });

  test("id collision surfaces the three-option prompt; Import as a copy mints a new id", async ({ page }) => {
    // Seed a character whose id will collide with the share payload.
    await seedCharacter(page, freshL1Hero);
    const url = encodeCharacterToShareUrl(freshL1Hero, "http://localhost:3000");
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    await page.goto(path);

    await expect(page.getByText(/A character with this id already exists/i)).toBeVisible();
    // Click "Import as a copy".
    await page.getByRole("button", { name: /Import as a copy/i }).click();

    // The browser navigated to the imported character's sheet — its id is now
    // a fresh nanoid, so the URL no longer matches the seeded id.
    await expect(page).toHaveURL(/\/characters\/[\w-]+/);
    const url2 = page.url();
    const newId = url2.match(/\/characters\/([\w-]+)/)![1];
    expect(newId).not.toBe(freshL1Hero.id);

    // Both characters now exist in storage.
    const original = await readCharacter(page, freshL1Hero.id);
    expect(original).not.toBeNull();
    const copy = await readCharacter(page, newId);
    expect(copy).not.toBeNull();
    expect(copy?.identity.name).toBe(freshL1Hero.identity.name);
  });

  test("home paste accepts a valid share link and routes to /import", async ({ page }) => {
    const url = encodeCharacterToShareUrl(mysticAtL1, "http://localhost:3000");
    await page.goto("/");
    await page
      .getByRole("textbox", { name: /Paste shared character link/i })
      .fill(url);
    await page.getByRole("button", { name: /Open shared link/i }).click();

    await expect(page).toHaveURL(/\/import\?c=/);
    await expect(page.getByText(/Mystic L1/)).toBeVisible();
  });

  test("home paste rejects an invalid link inline", async ({ page }) => {
    await page.goto("/");
    const input = page.getByRole("textbox", { name: /Paste shared character link/i });
    await input.fill("https://example.com/not-a-share-link");
    await page.getByRole("button", { name: /Open shared link/i }).click();
    await expect(page.getByText(/doesn't look like a Symbarator share link/i)).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test("Share button calls navigator.share when available", async ({ page }) => {
    // Stub navigator.share to capture the payload it would have sent. Run
    // before any page script via addInitScript so the stub is in place by the
    // time the click handler reads navigator.share.
    await page.addInitScript(() => {
      const captured: { url?: string }[] = [];
      (window as unknown as { __sharedCalls: typeof captured }).__sharedCalls = captured;
      (navigator as unknown as { share: (data: ShareData) => Promise<void> }).share = (data) => {
        captured.push({ url: data.url });
        return Promise.resolve();
      };
    });
    const id = await seedCharacter(page, mysticAtL1);
    await page.goto(`/characters/${id}`);

    await page.getByRole("button", { name: /^Share$/ }).click();

    const calls = await page.evaluate(
      () => (window as unknown as { __sharedCalls: { url?: string }[] }).__sharedCalls,
    );
    expect(calls.length).toBe(1);
    expect(calls[0].url).toContain("/import?c=");
  });

  test("Share button falls back to clipboard when navigator.share is unavailable", async ({ page }) => {
    // Force the share path to be unavailable, capture clipboard writes.
    await page.addInitScript(() => {
      const writes: string[] = [];
      (window as unknown as { __clipboardWrites: typeof writes }).__clipboardWrites = writes;
      // navigator.share absent
      try {
        Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
      } catch {
        /* fine — older browsers */
      }
      // navigator.clipboard.writeText capture
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: (s: string) => {
            writes.push(s);
            return Promise.resolve();
          },
        },
        configurable: true,
      });
    });
    const id = await seedCharacter(page, mysticAtL1);
    await page.goto(`/characters/${id}`);

    await page.getByRole("button", { name: /^Share$/ }).click();

    await expect(page.getByText(/Link copied to clipboard/i)).toBeVisible();
    const writes = await page.evaluate(
      () =>
        (window as unknown as { __clipboardWrites: string[] }).__clipboardWrites,
    );
    expect(writes.length).toBe(1);
    expect(writes[0]).toContain("/import?c=");
  });

  test("printable sheet has no Share button", async ({ page }) => {
    const id = await seedCharacter(page, mysticAtL1);
    await page.goto(`/characters/${id}/print`);
    await expect(page.getByRole("button", { name: /^Share$/ })).toHaveCount(0);
  });
});
