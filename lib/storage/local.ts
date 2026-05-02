"use client";

import { nanoid } from "nanoid";
import type { Character, CharacterLevel, CharacterSummary } from "@/lib/character/types";
import { MAX_CHARACTER_LEVEL } from "@/lib/character/types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { CLASS_BY_ID } from "@/data/classes";
import { computeHp } from "@/lib/character/compute";
import type { CharacterStore } from "./index";

const KEY_PREFIX = "symbaroum:character:";
const INDEX_KEY = "symbaroum:characters:index";

/**
 * Forward-only schema normalizer. Pre-leveling-change saves are missing
 * `feats` and `maxHp`, and may have `level` typed as a literal `1`. This
 * helper fills sane defaults so older characters keep loading without
 * needing a versioned migration system. Idempotent — running it twice on a
 * current-schema character is a no-op.
 */
export function migrateCharacter(raw: unknown): Character {
  const c = (raw as Partial<Character> & Record<string, unknown>) ?? {};
  const level = clampLevel(c.level);
  const feats = Array.isArray(c.feats) ? c.feats.filter((f): f is string => typeof f === "string") : [];

  // Use a temporary partial object so we can compute HP from origin + abilities
  // without recursively triggering the migrator.
  const character: Character = {
    ...(c as Character),
    level,
    feats,
    maxHp: typeof c.maxHp === "number" && c.maxHp > 0 ? c.maxHp : 0,
  };

  if (character.maxHp === 0) {
    // L1 derivation — origin hit die + Con mod. computeHp handles missing data
    // safely (origin lookup may miss while building).
    character.maxHp = computeHp(character);
  }

  // Dedupe spell picks. An earlier bug let a level-up insert a spell the
  // character already knew (e.g. Templar's auto-granted Bless), which broke
  // the sheet's React keys. Idempotent — running on a clean character is a no-op.
  if (character.spellPicks) {
    character.spellPicks = {
      cantrips: dedupe(character.spellPicks.cantrips),
      spellsKnown: dedupe(character.spellPicks.spellsKnown),
    };
  }

  return character;
}

function dedupe(xs: ReadonlyArray<string> | undefined): string[] {
  if (!xs) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of xs) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

function clampLevel(value: unknown): CharacterLevel {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  const n = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Math.floor(value)));
  return n as CharacterLevel;
}

function safeWindow() {
  return typeof window === "undefined" ? null : window;
}

function readIndex(): string[] {
  const w = safeWindow();
  if (!w) return [];
  try {
    const raw = w.localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  const w = safeWindow();
  if (!w) return;
  w.localStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

function summarize(c: Character): CharacterSummary {
  return {
    id: c.id,
    name: c.identity.name || "(unnamed)",
    originId: c.originId,
    classId: c.classId,
    level: c.level,
    updatedAt: c.updatedAt,
  };
}

export const LocalCharacterStore: CharacterStore = {
  async list(): Promise<CharacterSummary[]> {
    const w = safeWindow();
    if (!w) return [];
    const ids = readIndex();
    const summaries: CharacterSummary[] = [];
    for (const id of ids) {
      const raw = w.localStorage.getItem(KEY_PREFIX + id);
      if (!raw) continue;
      try {
        const c = migrateCharacter(JSON.parse(raw));
        summaries.push(summarize(c));
      } catch {
        // skip invalid
      }
    }
    summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return summaries;
  },

  async load(id: string): Promise<Character | null> {
    const w = safeWindow();
    if (!w) return null;
    const raw = w.localStorage.getItem(KEY_PREFIX + id);
    if (!raw) return null;
    try {
      return migrateCharacter(JSON.parse(raw));
    } catch {
      return null;
    }
  },

  async save(character: Character): Promise<void> {
    const w = safeWindow();
    if (!w) return;
    character.updatedAt = new Date().toISOString();
    w.localStorage.setItem(
      KEY_PREFIX + character.id,
      JSON.stringify(character),
    );
    const ids = readIndex();
    if (!ids.includes(character.id)) {
      ids.push(character.id);
      writeIndex(ids);
    }
  },

  async remove(id: string): Promise<void> {
    const w = safeWindow();
    if (!w) return;
    w.localStorage.removeItem(KEY_PREFIX + id);
    writeIndex(readIndex().filter((x) => x !== id));
  },

  async exportJson(id: string): Promise<string> {
    const c = await this.load(id);
    if (!c) throw new Error("Character not found");
    return JSON.stringify(c, null, 2);
  },

  async importJson(json: string): Promise<Character> {
    const parsed = migrateCharacter(JSON.parse(json));
    if (!parsed.id) parsed.id = nanoid();
    parsed.updatedAt = new Date().toISOString();
    await this.save(parsed);
    return parsed;
  },
};

export function newCharacterId(): string {
  return nanoid(10);
}

export function originLabel(id: string): string {
  return ORIGIN_BY_ID[id]?.name ?? "—";
}

export function classLabel(id: string): string {
  return CLASS_BY_ID[id]?.name ?? "—";
}
