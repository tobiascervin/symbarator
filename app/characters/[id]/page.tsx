"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { LocalCharacterStore } from "@/lib/storage/local";
import type { Character } from "@/lib/character/types";
import { MAX_CHARACTER_LEVEL } from "@/lib/character/types";
import { CharacterSheet } from "@/components/sheet/character-sheet";
import { LevelUpDialog } from "@/components/level-up/level-up-dialog";
import { APP_VERSION } from "@/lib/version";
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
  const [levelUpOpen, setLevelUpOpen] = useState(false);

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
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground"
            >
              ← Symbaroum
            </Link>
            <Link
              href="/changelog"
              className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground/70 hover:text-foreground"
            >
              v{APP_VERSION}
            </Link>
          </div>
          {character && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export JSON
              </Button>
              <Button
                size="sm"
                onClick={() => setLevelUpOpen(true)}
                disabled={character.level >= MAX_CHARACTER_LEVEL}
                title={
                  character.level >= MAX_CHARACTER_LEVEL
                    ? "Already at maximum level"
                    : `Advance to level ${character.level + 1}`
                }
              >
                Level Up
              </Button>
              <Link
                href={`/builder/origin?id=${character.id}`}
                className={buttonVariants({ size: "sm", variant: "ghost" })}
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

        {character && (
          <CharacterSheet
            character={character}
            onChange={(updated) => {
              setCharacter(updated);
              void LocalCharacterStore.save(updated);
            }}
          />
        )}
      </div>
      {character && (
        <LevelUpDialog
          key={`${character.id}-${character.level}`}
          open={levelUpOpen}
          onOpenChange={setLevelUpOpen}
          character={character}
          onApplied={async (updated) => {
            await LocalCharacterStore.save(updated);
            setCharacter(updated);
          }}
        />
      )}
    </main>
  );
}
