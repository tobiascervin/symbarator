"use client";

import { nanoid } from "nanoid";
import type { Character, CharacterSummary } from "@/lib/character/types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { CLASS_BY_ID } from "@/data/classes";
import type { CharacterStore } from "./index";

const KEY_PREFIX = "symbaroum:character:";
const INDEX_KEY = "symbaroum:characters:index";

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
        const c = JSON.parse(raw) as Character;
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
      return JSON.parse(raw) as Character;
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
    const parsed = JSON.parse(json) as Character;
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
