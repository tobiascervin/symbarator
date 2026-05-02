// Server-rendered changelog. Reads CHANGELOG.md at request time, parses to
// HTML via `marked`, and renders inside the parchment theme.

import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { marked } from "marked";
import { Parchment } from "@/components/theme/parchment";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { BlackletterTitle } from "@/components/theme/blackletter-title";
import { APP_VERSION } from "@/lib/version";

export const metadata = {
  title: "Changelog — Ruins of Symbaroum",
  description: "Release notes for the character builder.",
};

export default async function ChangelogPage() {
  const filePath = path.join(process.cwd(), "CHANGELOG.md");
  const md = await fs.readFile(filePath, "utf8");
  const html = await marked.parse(md, { gfm: true });

  return (
    <main className="flex flex-1 w-full justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.4em] text-muted-foreground hover:text-foreground"
          >
            ← Symbaroum
          </Link>
          <span className="font-display text-xs uppercase tracking-[0.4em] text-muted-foreground">
            v{APP_VERSION}
          </span>
        </header>

        <BlackletterTitle level={1} className="mb-3 text-center">
          Changelog
        </BlackletterTitle>

        <OrnateDivider className="mb-6" />

        <Parchment className="text-[#1d1814]">
          <article
            className="changelog-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Parchment>
      </div>
    </main>
  );
}
