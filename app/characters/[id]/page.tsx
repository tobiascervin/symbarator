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
import {
  encodeCharacterToShareUrl,
  SHARE_URL_SOFT_LIMIT,
} from "@/lib/character/share";

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

  async function handleShare() {
    if (!character) return;
    const url = encodeCharacterToShareUrl(character, window.location.origin);
    if (url.length > SHARE_URL_SOFT_LIMIT) {
      toast.warning(
        "This character's data is unusually large; the share link may be truncated by SMS. AirDrop / email / Messenger should be fine.",
      );
    }
    const name = character.identity.name || "Symbarator hero";
    // Capability detection happens at click time (not render time) to avoid
    // SSR / hydration mismatches.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${name} — Symbarator`,
          text: `Import ${name} into Symbarator`,
          url,
        });
        return;
      } catch (err) {
        // User cancelled the share sheet — silent. Other failures fall through
        // to the clipboard tier so the share still happens somehow.
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.clipboard?.writeText === "function"
    ) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard.");
        return;
      } catch {
        // fall through to manual copy
      }
    }
    // Last-resort fallback: prompt the URL so the user can copy it manually.
    window.prompt("Copy this share link:", url);
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
              <Button variant="outline" size="sm" onClick={handleShare}>
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export JSON
              </Button>
              <Link
                href={`/characters/${character.id}/print`}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                Print
              </Link>
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
