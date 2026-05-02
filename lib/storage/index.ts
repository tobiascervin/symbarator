// Persistence interface. localStorage adapter today; a server adapter
// (Vercel Marketplace Postgres + Clerk auth, etc.) can replace it later
// without touching UI code.

import type { Character, CharacterSummary } from "@/lib/character/types";

export interface CharacterStore {
  list(): Promise<CharacterSummary[]>;
  load(id: string): Promise<Character | null>;
  save(character: Character): Promise<void>;
  remove(id: string): Promise<void>;
  exportJson(id: string): Promise<string>;
  importJson(json: string): Promise<Character>;
}
