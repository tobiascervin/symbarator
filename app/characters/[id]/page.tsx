"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { LocalCharacterStore } from "@/lib/storage/local";
import type { Character } from "@/lib/character/types";
import { CharacterSheet } from "@/components/sheet/character-sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

export default function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void LocalCharacterStore.load(id).then((c) => {
      setCharacter(c);
      setLoading(false);
    });
  }, [id]);

  async function handleExport() {
    if (!character) return;
    const json = await LocalCharacterStore.exportJson(character.id);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(character.identity.name || "character").replace(/[^\w\-]+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported.");
  }

  return (
    <main className="min-h-full w-full px-4 py-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground"
          >
            ← Symbaroum
          </Link>
          {character && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export JSON
              </Button>
              <Link
                href={`/builder/origin?id=${character.id}`}
                className={buttonVariants({ size: "sm" })}
              >
                Edit
              </Link>
            </div>
          )}
        </header>

        {loading && (
          <p className="text-muted-foreground italic">Loading character…</p>
        )}

        {!loading && !character && (
          <div className="text-center py-12">
            <p className="text-muted-foreground italic mb-4">
              No character with that id was found in this browser.
            </p>
            <Link href="/" className={buttonVariants()}>
              Return home
            </Link>
          </div>
        )}

        {character && <CharacterSheet character={character} />}
      </div>
    </main>
  );
}
