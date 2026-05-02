"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LocalCharacterStore, newCharacterId, originLabel, classLabel } from "@/lib/storage/local";
import { emptyCharacter } from "@/lib/character/defaults";
import type { CharacterSummary } from "@/lib/character/types";
import { APP_VERSION } from "@/lib/version";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { BlackletterTitle } from "@/components/theme/blackletter-title";
import { toast } from "sonner";

export default function HomePage() {
  const [characters, setCharacters] = useState<CharacterSummary[] | null>(null);
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
                <div className="flex items-center justify-between gap-4 px-6 py-4">
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
                  <div className="flex items-center gap-1 shrink-0">
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
