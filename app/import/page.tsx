"use client";

// Receiver side of the share-and-import flow. The page reads the encoded
// character payload from the URL (?c=... primary, #c=... fallback), shows a
// preview card, and lets the user confirm — handling the id-collision case
// with three explicit options. Nothing is written to localStorage until the
// user clicks Import / Replace / Import as a copy.

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import type { Character } from "@/lib/character/types";
import { decodeCharacterFromUrl } from "@/lib/character/share";
import { LocalCharacterStore, originLabel, classLabel } from "@/lib/storage/local";
import { approachById } from "@/data/classes";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { BlackletterTitle } from "@/components/theme/blackletter-title";
import { toast } from "sonner";

type ImportState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "preview"; character: Character; collision: boolean };

export default function ImportPage() {
  // Wrap the inner component in Suspense so Next can statically prerender the
  // page shell — `useSearchParams()` reads at request time and would otherwise
  // bail prerender out on this route.
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 w-full items-center justify-center px-4 py-16">
          <p className="text-muted-foreground italic">Reading share link…</p>
        </main>
      }
    >
      <ImportPageInner />
    </Suspense>
  );
}

function ImportPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<ImportState>({ kind: "loading" });

  useEffect(() => {
    // Assemble the URL we want to decode. Primary read is the App Router's
    // search params; the fragment (#c=...) is read from window directly as a
    // fallback for SMS clients that mangled the query.
    const queryC = params.get("c");
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const url = queryC
      ? `?c=${encodeURIComponent(queryC)}`
      : hash
        ? hash
        : "";
    if (!url) {
      setState({
        kind: "error",
        message: "No character data found in the share link.",
      });
      return;
    }
    const result = decodeCharacterFromUrl(url);
    if ("error" in result) {
      setState({ kind: "error", message: result.error });
      return;
    }
    void LocalCharacterStore.list().then((list) => {
      const collision = list.some((s) => s.id === result.character.id);
      setState({ kind: "preview", character: result.character, collision });
    });
  }, [params]);

  async function commit(character: Character) {
    await LocalCharacterStore.importJson(JSON.stringify(character));
    toast.success(`Imported "${character.identity.name || "(unnamed)"}".`);
    router.push(`/characters/${character.id}`);
  }

  return (
    <main className="flex flex-1 w-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-8">
          <p className="font-display text-sm tracking-[0.4em] text-muted-foreground uppercase mb-3">
            Ruins of Symbaroum · 5E
          </p>
          <BlackletterTitle level={1} className="mb-3">
            Import a Hero
          </BlackletterTitle>
        </header>

        <OrnateDivider className="mb-8" />

        {state.kind === "loading" && (
          <p className="text-center text-muted-foreground italic">
            Reading share link…
          </p>
        )}

        {state.kind === "error" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display tracking-wide">
                Couldn&apos;t open this share link
              </CardTitle>
              <CardDescription>{state.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className={buttonVariants({ variant: "outline" })}>
                ← Back home
              </Link>
            </CardContent>
          </Card>
        )}

        {state.kind === "preview" && (
          <Preview
            character={state.character}
            collision={state.collision}
            onImport={() => commit(state.character)}
            onImportCopy={() =>
              commit({ ...state.character, id: nanoid(10) })
            }
          />
        )}
      </div>
    </main>
  );
}

function Preview({
  character: c,
  collision,
  onImport,
  onImportCopy,
}: {
  character: Character;
  collision: boolean;
  onImport(): void;
  onImportCopy(): void;
}) {
  const approach = approachById(c.approachId);
  const knownSpells =
    (c.spellPicks?.cantrips.length ?? 0) +
    (c.spellPicks?.spellsKnown.length ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">
          {c.identity.name || "(unnamed)"}
        </CardTitle>
        <CardDescription>
          {originLabel(c.originId)} · Level {c.level} {classLabel(c.classId)}
          {approach && <> ({approach.name})</>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <Row label="Boons" value={c.boons.length} />
          <Row label="Burdens" value={c.burdens.length} />
          <Row label="Feats" value={c.feats.length} />
          <Row label="Known spells" value={knownSpells} />
        </dl>

        {collision ? (
          <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
            <p className="text-sm">
              A character with this id already exists in your library. Choose how to
              proceed:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="destructive" onClick={onImport}>
                Replace existing
              </Button>
              <Button variant="default" onClick={onImportCopy}>
                Import as a copy
              </Button>
              <Link
                href="/"
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button onClick={onImport} className="font-display tracking-wide">
              Import
            </Button>
            <Link
              href="/"
              className={buttonVariants({ variant: "ghost" })}
            >
              Cancel
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-display text-right">{value}</dd>
    </>
  );
}
