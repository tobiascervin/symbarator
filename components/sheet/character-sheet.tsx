"use client";

import type { Character } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER, ABILITY_SHORT } from "@/lib/character/types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { CLASS_BY_ID, approachById } from "@/data/classes";
import { SKILL_BY_ID } from "@/data/skills";
import { SPELL_BY_ID } from "@/data/spells";
import {
  computeFinalAbilities,
  computeHp,
  computeProficiencyBonus,
  computeCorruptionThreshold,
  computeSavingThrows,
  computeSkillScores,
  computeSpellcasting,
  computeInitiative,
  formatMod,
} from "@/lib/character/compute";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { Parchment } from "@/components/theme/parchment";
import { BlackletterTitle } from "@/components/theme/blackletter-title";
import { SpellTabs } from "@/components/spells/spell-tabs";
import { FeatList } from "@/components/sheet/feat-list";
import type { SpellLevel } from "@/lib/character/types";
import { cn } from "@/lib/utils";

export function CharacterSheet({ character: c }: { character: Character }) {
  const origin = ORIGIN_BY_ID[c.originId];
  const subchoice = origin?.subchoices?.options.find(
    (o) => o.id === c.originSubchoiceId,
  );
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const cls = CLASS_BY_ID[c.classId];
  const approach = approachById(c.approachId);

  const finals = computeFinalAbilities(c);
  const hp = computeHp(c);
  const profBonus = computeProficiencyBonus(c);
  const corruption = computeCorruptionThreshold(c);
  const saves = computeSavingThrows(c);
  const skills = computeSkillScores(c);
  const spell = computeSpellcasting(c);
  const initiative = computeInitiative(c);

  return (
    <div className="space-y-6">
      <Parchment className="space-y-3">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-[#5a4d2f]">
          Ruins of Symbaroum · Hero of Davokar
        </p>
        <BlackletterTitle level={1} className="!text-[#1d1814] mb-1">
          {c.identity.name || "(unnamed)"}
        </BlackletterTitle>
        <p className="text-[#3a322a] italic">
          {origin?.name ?? "—"}
          {subchoice && <> ({subchoice.name})</>} ·{" "}
          {bg?.name ?? "—"} · Level {c.level} {cls?.name ?? "—"} (
          {approach?.name ?? "—"})
          {c.identity.pronouns && (
            <span className="text-[#5a4d2f]"> · {c.identity.pronouns}</span>
          )}
        </p>
        <OrnateDivider className="!text-[#7a1f1f]" />
      </Parchment>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-2">
          {/* Abilities */}
          <Parchment>
            <SectionHeader>Abilities</SectionHeader>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ABILITY_ORDER.map((ab) => (
                <div
                  key={ab}
                  className="rounded border border-[#9a8a6b] bg-[#efe5cb] text-center py-2"
                >
                  <div className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f]">
                    {ABILITY_LABELS[ab]}
                  </div>
                  <div className="font-display text-3xl text-[#1d1814]">
                    {finals.total[ab]}
                  </div>
                  <div className="font-display text-base text-[#3a322a]">
                    {formatMod(finals.modifiers[ab])}
                  </div>
                </div>
              ))}
            </div>
          </Parchment>

          {/* Skills */}
          <Parchment>
            <SectionHeader>Skills</SectionHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
              {skills.map((s) => {
                const skill = SKILL_BY_ID[s.skill];
                return (
                  <div
                    key={s.skill}
                    className={cn(
                      "flex items-baseline justify-between border-b border-[#9a8a6b]/30 py-0.5",
                      s.proficient ? "text-[#1d1814]" : "text-[#5a4d2f]",
                    )}
                  >
                    <span>
                      <span
                        className={cn(
                          "inline-block w-2 h-2 rounded-full mr-1.5",
                          s.proficient ? "bg-[#7a1f1f]" : "border border-[#9a8a6b]",
                        )}
                      />
                      {skill.name}{" "}
                      <span className="text-xs text-[#5a4d2f]">
                        ({ABILITY_SHORT[skill.ability]})
                      </span>
                    </span>
                    <span className="font-display">{formatMod(s.modifier)}</span>
                  </div>
                );
              })}
            </div>
          </Parchment>

          {/* Features */}
          <Parchment>
            <SectionHeader>Features</SectionHeader>
            <div className="space-y-3 text-sm text-[#1d1814]">
              {origin?.features.map((f) => (
                <Feature key={`origin-${f.name}`} title={`${origin.name}: ${f.name}`}>
                  {f.description}
                </Feature>
              ))}
              {subchoice?.features?.map((f) => (
                <Feature key={`sub-${f.name}`} title={`${subchoice.name}: ${f.name}`}>
                  {f.description}
                </Feature>
              ))}
              {bg?.feature && (
                <Feature title={`${bg.name}: ${bg.feature.name}`}>
                  {bg.feature.description}
                </Feature>
              )}
              {cls?.level1Features.map((f) => (
                <Feature key={`class-${f.name}`} title={`${cls.name}: ${f.name}`}>
                  {f.description}
                </Feature>
              ))}
              {approach?.level1Features.map((f) => (
                <Feature key={`approach-${f.name}`} title={`${approach.name}: ${f.name}`}>
                  {f.description}
                </Feature>
              ))}
              {c.fightingStyle && (
                <Feature title={`Fighting Style: ${c.fightingStyle}`}>
                  See class entry.
                </Feature>
              )}
              {/* Per-level class features earned past L1. */}
              {cls?.levelTable.slice(0, c.level).flatMap((row, i) =>
                row.features.map((f) => (
                  <Feature key={`class-l${i + 1}-${f.name}`} title={`${cls.name} L${i + 1}: ${f.name}`}>
                    {f.description}
                  </Feature>
                )),
              )}
              {/* Per-level approach features earned past L1. */}
              {approach?.levelTable.slice(0, c.level).flatMap((row, i) =>
                row.features.map((f) => (
                  <Feature key={`approach-l${i + 1}-${f.name}`} title={`${approach.name} L${i + 1}: ${f.name}`}>
                    {f.description}
                  </Feature>
                )),
              )}
            </div>
          </Parchment>

          {/* Feats */}
          {c.feats.length > 0 && (
            <Parchment>
              <SectionHeader>Feats</SectionHeader>
              <FeatList feats={c.feats} />
            </Parchment>
          )}

          {/* Spells (any spellcasting approach) */}
          {spell && c.spellPicks && (c.spellPicks.cantrips.length + c.spellPicks.spellsKnown.length) > 0 && (
            <Parchment>
              <SectionHeader>Spellcraft</SectionHeader>
              <p className="text-sm text-[#3a322a] mb-3">
                Tradition: <span className="font-display">{spell.tradition ?? "—"}</span> ·
                Slots:{" "}
                {spell.spellSlots
                  .map((n, i) => (n > 0 ? `L${i + 1}: ${n}` : null))
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </p>
              <SheetSpellbook
                cantrips={c.spellPicks.cantrips}
                spellsKnown={c.spellPicks.spellsKnown}
              />
            </Parchment>
          )}

          {/* Identity */}
          <Parchment>
            <SectionHeader>Identity</SectionHeader>
            <div className="space-y-2 text-sm text-[#1d1814]">
              <Row label="Personality">{c.identity.personalityTrait || "—"}</Row>
              <Row label="Ideal">{c.identity.ideal || "—"}</Row>
              <Row label="Bond">{c.identity.bond || "—"}</Row>
              <Row label="Flaw">{c.identity.flaw || "—"}</Row>
              {c.notes && (
                <div className="pt-2 border-t border-[#9a8a6b]/40">
                  <div className="font-display tracking-widest text-[10px] uppercase text-[#5a4d2f] mb-1">
                    Notes
                  </div>
                  <p className="whitespace-pre-wrap">{c.notes}</p>
                </div>
              )}
            </div>
          </Parchment>
        </div>

        <div className="space-y-6">
          {/* Stat block */}
          <Parchment>
            <SectionHeader>Combat</SectionHeader>
            <dl className="text-sm space-y-2 text-[#1d1814]">
              <Stat label="Hit Points" value={hp} />
              <Stat label="Hit Dice" value={`1d${origin?.hitDie ?? cls?.fallbackHitDie ?? 8}`} />
              <Stat label="Initiative" value={formatMod(initiative)} />
              <Stat label="Speed" value={`${origin?.speed ?? 30} ft.`} />
              <Stat label="Proficiency Bonus" value={`+${profBonus}`} />
            </dl>
          </Parchment>

          {/* Corruption */}
          <Parchment className="!bg-gradient-to-br !from-[#e9dec6] !to-[#caa8a4]">
            <SectionHeader>Shadow & Corruption</SectionHeader>
            <dl className="text-sm space-y-2 text-[#1d1814]">
              <Stat label="Threshold" value={corruption} />
              <Stat label="Permanent" value={c.corruption.permanent} />
              <Stat label="Temporary" value={c.corruption.temporary} />
            </dl>
            <p className="text-xs italic text-[#3a322a] mt-2">
              {cls?.shadowFormula === "mystic"
                ? "Mystic threshold: prof bonus + casting modifier (≥ 2)."
                : "Standard threshold: 2× prof bonus + Charisma modifier (≥ 2)."}
            </p>
          </Parchment>

          {/* Saves */}
          <Parchment>
            <SectionHeader>Saving Throws</SectionHeader>
            <div className="space-y-1 text-sm text-[#1d1814]">
              {saves.map((s) => (
                <div
                  key={s.ability}
                  className="flex items-baseline justify-between border-b border-[#9a8a6b]/30 py-0.5"
                >
                  <span className={cn(s.proficient && "font-semibold")}>
                    <span
                      className={cn(
                        "inline-block w-2 h-2 rounded-full mr-1.5",
                        s.proficient ? "bg-[#7a1f1f]" : "border border-[#9a8a6b]",
                      )}
                    />
                    {ABILITY_LABELS[s.ability]}
                  </span>
                  <span className="font-display">{formatMod(s.modifier)}</span>
                </div>
              ))}
            </div>
          </Parchment>

          {/* Equipment */}
          <Parchment>
            <SectionHeader>Equipment</SectionHeader>
            <div className="text-sm text-[#1d1814] space-y-2">
              {cls && c.classEquipmentPicks.length > 0 && (
                <div>
                  <div className="font-display text-xs uppercase tracking-widest text-[#5a4d2f] mb-1">
                    From class
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {cls.startingEquipment.map((line, i) => {
                      const opts = line.split(/\bOR\b/i).map((s) =>
                        s.replace(/^\s*\([a-z]\)\s*/i, "").trim(),
                      );
                      return (
                        <li key={i}>{opts[c.classEquipmentPicks[i] ?? 0] ?? line}</li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {bg && (
                <div>
                  <div className="font-display text-xs uppercase tracking-widest text-[#5a4d2f] mb-1">
                    From background
                  </div>
                  <p className="italic text-[#3a322a]">{bg.equipment}</p>
                </div>
              )}
            </div>
          </Parchment>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-[#9a8a6b] pb-1 mb-3">
      <h2 className="font-display text-xs uppercase tracking-[0.4em] text-[#7a1f1f]">
        {children}
      </h2>
    </div>
  );
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display tracking-wide text-[#1d1814]">{title}</p>
      <p className="text-[#3a322a]">{children}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#9a8a6b]/30 py-0.5">
      <dt className="text-[#3a322a]">{label}</dt>
      <dd className="font-display text-lg">{value}</dd>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-display text-xs uppercase tracking-widest text-[#5a4d2f]">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SheetSpellbook({
  cantrips,
  spellsKnown,
}: {
  cantrips: ReadonlyArray<string>;
  spellsKnown: ReadonlyArray<string>;
}) {
  // Resolve every known id to its catalog entry (skip unknown ids silently;
  // they may be from a future schema or a typo in seeded data).
  const known = [...cantrips, ...spellsKnown]
    .map((id) => SPELL_BY_ID[id])
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  if (known.length === 0) return null;

  // Levels present in the character's known spells, ascending.
  const levels = Array.from(new Set(known.map((s) => s.level))).sort(
    (a, b) => a - b,
  ) as SpellLevel[];

  return <SpellTabs spells={known} levels={levels} mode={{ kind: "display" }} />;
}
