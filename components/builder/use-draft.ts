"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/character/types";
import { LocalCharacterStore } from "@/lib/storage/local";

export interface DraftState {
  draft: Character | null;
  loading: boolean;
  update: (mut: (d: Character) => void) => void;
  save: () => Promise<void>;
}

/**
 * Loads a character draft from storage, exposes a mutation function and a
 * save handler. We snapshot the draft into local state and write back on
 * `save()` — UI mutations are immediate.
 */
export function useDraft(id: string | null): DraftState {
  const [draft, setDraft] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const draftRef = useRef<Character | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!id) {
        setDraft(null);
        setLoading(false);
        return;
      }
      const c = await LocalCharacterStore.load(id);
      if (cancelled) return;
      setDraft(c);
      draftRef.current = c;
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = useCallback((mut: (d: Character) => void) => {
    setDraft((current) => {
      if (!current) return current;
      const next: Character = JSON.parse(JSON.stringify(current));
      mut(next);
      draftRef.current = next;
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    const cur = draftRef.current;
    if (!cur) return;
    await LocalCharacterStore.save(cur);
  }, []);

  return { draft, loading, update, save };
}
