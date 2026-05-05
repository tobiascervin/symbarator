"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LocalCharacterStore, newCharacterId, originLabel, classLabel } from "@/lib/storage/local";
import { emptyCharacter } from "@/lib/character/defaults";
import type { CharacterSummary } from "@/lib/character/types";
import { APP_VERSION } from "@/lib/version";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { BlackletterTitle } from "@/components/theme/blackletter-title";
import { extractSharePayload } from "@/lib/character/share";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void LocalCharacterStore.list().then(setCharacters);
  }, []);

  async function handleNew() {
    const id = newCharacterId();
    const character = emptyCharacter(id);
    await LocalCharacterStore.save(character);
    window.location.href = `/builder/origin?id=${id}`;
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this character? This cannot be undone.")) return;
    await LocalCharacterStore.remove(id);
    setCharacters((prev) => prev?.filter((c) => c.id !== id) ?? null);
    toast.success("Character deleted.");
  }

  async function handleExport(id: string) {
    const json = await LocalCharacterStore.exportJson(id);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const summary = characters?.find((c) => c.id === id);
    a.download = `${(summary?.name ?? "character").replace(/[^\w\-]+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = extractSharePayload(pasteValue.trim());
    if (!payload) {
      setPasteError("That doesn't look like a Symbarator share link.");
      return;
    }
    setPasteError(null);
    router.push(`/import?c=${encodeURIComponent(payload)}`);
  }

  async function handleImportFile(file: File) {
    const text = await file.text();
    try {
      const c = await LocalCharacterStore.importJson(text);
      const list = await LocalCharacterStore.list();
      setCharacters(list);
      toast.success(`Imported "${c.identity.name || "(unnamed)"}".`);
    } catch (err) {
      toast.error("That file did not parse as a character.");
      console.error(err);
    }
  }

  return (
    <main className="flex flex-1 w-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-12">
          <p className="font-display text-sm tracking-[0.4em] text-muted-foreground uppercase mb-3">
            Ruins of Symbaroum · 5E
          </p>
          <BlackletterTitle level={1} className="mb-3">
            Character Builder
          </BlackletterTitle>
          <p className="text-muted-foreground italic max-w-xl mx-auto">
            Forge a hero in the shadow of Davokar. Carry your shadow lightly,
            for the forest watches what we become.
          </p>
        </header>

        <OrnateDivider label="Your Heroes" className="mb-8" />

        {characters === null && (
          <p className="text-center text-muted-foreground">Loading…</p>
        )}

        {characters !== null && characters.length === 0 && (
          <Card className="text-center py-12 mb-6">
            <CardHeader>
              <CardTitle className="font-display tracking-wide">No characters yet</CardTitle>
              <CardDescription className="italic">
                The first step into Davokar begins below.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {characters !== null && characters.length > 0 && (
          <div className="grid gap-3 mb-8">
            {characters.map((c) => (
              <Card key={c.id} className="hover:border-ring/60 transition-colors">
                {/* Stack name+meta over the action buttons on phone (<sm)
                    so three ghost buttons + a long name don't fight over
                    ~300px of content width. */}
                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/characters/${c.id}`}
                      className="font-display text-lg hover:underline block truncate"
                    >
                      {c.name}
                    </Link>
                    <p className="text-sm text-muted-foreground truncate">
                      Level {c.level} · {originLabel(c.originId)} · {classLabel(c.classId)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:shrink-0 sm:flex-nowrap">
                    <Link
                      href={`/builder/origin?id=${c.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Edit
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleExport(c.id)}>
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(c.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button size="lg" onClick={handleNew} className="font-display tracking-wide">
            Forge a New Hero
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImportFile(f);
              e.currentTarget.value = "";
            }}
          />
          <Button
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
          >
            Import from JSON
          </Button>
        </div>

        {/* Paste shared link — fallback for users on a different device than
            the one the link arrived on, or for channels that don't autolink. */}
        <form
          onSubmit={handlePasteSubmit}
          className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-xl mx-auto"
        >
          <input
            type="text"
            placeholder="Paste a share link…"
            value={pasteValue}
            onChange={(e) => {
              setPasteValue(e.target.value);
              if (pasteError) setPasteError(null);
            }}
            aria-label="Paste shared character link"
            aria-invalid={pasteError !== null}
            className="flex-1 w-full px-3 py-2 rounded-md bg-input/40 border border-border text-sm font-mono"
          />
          <Button type="submit" variant="outline">
            Open shared link
          </Button>
        </form>
        {pasteError && (
          <p className="mt-2 text-center text-sm text-destructive">{pasteError}</p>
        )}

        <footer className="mt-16 text-center">
          <Link
            href="/changelog"
            className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground"
          >
            v{APP_VERSION}
          </Link>
        </footer>
      </div>
    </main>
  );
}
