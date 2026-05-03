"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { LocalCharacterStore } from "@/lib/storage/local";
import type { Character } from "@/lib/character/types";
import { PrintableSheet } from "@/components/sheet/printable-sheet";
import "./print.css";

export default function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const printedRef = useRef(false);

  useEffect(() => {
    void LocalCharacterStore.load(id).then((c) => {
      setCharacter(c);
      setLoading(false);
    });
  }, [id]);

  // Auto-fire the print dialog once the character is loaded. Guard against
  // React strict-mode double-mount with the ref so we don't open twice.
  useEffect(() => {
    if (!character || printedRef.current) return;
    printedRef.current = true;
    const t = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(t);
  }, [character]);

  return (
    <main className="min-h-full w-full bg-white">
      <div className="no-print sticky top-0 z-10 bg-white border-b border-[#1d1814]/20 px-4 py-2 flex items-center justify-between text-sm">
        <Link
          href={`/characters/${id}`}
          className="text-[#5a4d2f] hover:text-[#1d1814]"
        >
          ← Back to sheet
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded border border-[#7a1f1f] bg-[#7a1f1f] text-[#f3ead2] px-3 py-1 font-display text-xs uppercase tracking-widest hover:bg-[#5a1717]"
        >
          Print again
        </button>
      </div>

      {loading && (
        <p className="px-6 py-8 text-[#5a4d2f] italic">Loading character…</p>
      )}

      {!loading && !character && (
        <div className="px-6 py-12 text-center">
          <p className="text-[#5a4d2f] italic mb-4">
            No character with that id was found in this browser.
          </p>
          <Link
            href="/"
            className="text-[#7a1f1f] underline underline-offset-4 hover:text-[#1d1814]"
          >
            Return home
          </Link>
        </div>
      )}

      {character && <PrintableSheet character={character} />}
    </main>
  );
}
