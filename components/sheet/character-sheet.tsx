"use client";

import { useState } from "react";
import type { Character, FeatureDef, SpellDef } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER, ABILITY_SHORT } from "@/lib/character/types";
import { spendSlot, useFeature } from "@/lib/character/live-state";
import type { FeatureSource } from "@/lib/character/features";
import { SpellCastPopover } from "@/components/spells/spell-cast-popover";
import {
  FeatTapPopover,
  type TappedEntry,
} from "@/components/sheet/feat-tap-popover";
import type { FeatCardBadge } from "@/components/sheet/feat-card";
import { ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { CLASS_BY_ID, approachById } from "@/data/classes";
import { SKILL_BY_ID } from "@/data/skills";
import { SPELL_BY_ID } from "@/data/spells";
import {
  computeFinalAbilities,
  computeProficiencyBonus,
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
import { FeatList, FeatGroup } from "@/components/sheet/feat-list";
import {
  CorruptionPanel,
  DeathSavesPanel,
  HpVitalsPanel,
  RestPanel,
  SpellSlotPips,
} from "@/components/sheet/companion-panels";
import { BOON_BY_ID, BURDEN_BY_ID } from "@/data/feats";
import type { SpellLevel } from "@/lib/character/types";
import { cn } from "@/lib/utils";

export function CharacterSheet({
  character: c,
  onChange,
}: {
  character: Character;
  onChange?: (updated: Character) => void;
}) {
  const noop = (_u: Character) => {};
  const handleChange = onChange ?? noop;
  const origin = ORIGIN_BY_ID[c.originId];
  const subchoice = origin?.subchoices?.options.find(
    (o) => o.id === c.originSubchoiceId,
  );
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const cls = CLASS_BY_ID[c.classId];
  const approach = approachById(c.approachId);

  const finals = computeFinalAbilities(c);
  const profBonus = computeProficiencyBonus(c);
  const saves = computeSavingThrows(c);
  const skills = computeSkillScores(c);
  const spell = computeSpellcasting(c);
  const initiative = computeInitiative(c);

  // Companion-mode tap state for the FeatTapPopover. Non-null = open.
  const [tapped, setTapped] = useState<TappedEntry | null>(null);
  function openTap(feature: FeatureDef, source: FeatureSource, badges?: ReadonlyArray<FeatCardBadge>) {
    setTapped({ feature, source, badges });
  }

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
          {/* Companion-mode: HP & Vitals + conditional Death Saves */}
          <HpVitalsPanel character={c} onChange={handleChange} />
          <DeathSavesPanel character={c} onChange={handleChange} />

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
                <Feature
                  key={`origin-${f.name}`}
                  title={`${origin.name}: ${f.name}`}
                  onTap={() => openTap(f, { kind: "origin" })}
                >
                  {f.description}
                </Feature>
              ))}
              {subchoice?.features?.map((f) => (
                <Feature
                  key={`sub-${f.name}`}
                  title={`${subchoice.name}: ${f.name}`}
                  onTap={() => openTap(f, { kind: "subchoice" })}
                >
                  {f.description}
                </Feature>
              ))}
              {bg?.feature && (
                <Feature
                  title={`${bg.name}: ${bg.feature.name}`}
                  onTap={() =>
                    openTap(
                      { name: bg.feature.name, description: bg.feature.description },
                      { kind: "background" },
                    )
                  }
                >
                  {bg.feature.description}
                </Feature>
              )}
              {cls?.level1Features.map((f) => (
                <Feature
                  key={`class-${f.name}`}
                  title={`${cls.name}: ${f.name}`}
                  onTap={() => openTap(f, { kind: "class-l1" })}
                >
                  {f.description}
                </Feature>
              ))}
              {approach?.level1Features.map((f) => (
                <Feature
                  key={`approach-${f.name}`}
                  title={`${approach.name}: ${f.name}`}
                  onTap={() => openTap(f, { kind: "approach-l1" })}
                >
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
                  <Feature
                    key={`class-l${i + 1}-${f.name}`}
                    title={`${cls.name} L${i + 1}: ${f.name}`}
                    onTap={() => openTap(f, { kind: "class", level: i + 1 })}
                  >
                    {f.description}
                  </Feature>
                )),
              )}
              {/* Per-level approach features earned past L1. */}
              {approach?.levelTable.slice(0, c.level).flatMap((row, i) =>
                row.features.map((f) => (
                  <Feature
                    key={`approach-l${i + 1}-${f.name}`}
                    title={`${approach.name} L${i + 1}: ${f.name}`}
                    onTap={() => openTap(f, { kind: "approach", level: i + 1 })}
                  >
                    {f.description}
                  </Feature>
                )),
              )}
            </div>
          </Parchment>

          {/* Boons (taken at L1) */}
          {c.boons.length > 0 && (
            <Parchment>
              <SectionHeader>Boons</SectionHeader>
              <FeatGroup
                title="Taken at character creation"
                onTap={(e) => {
                  const boon = BOON_BY_ID[e.id];
                  if (!boon) return;
                  openTap(
                    { name: boon.name, description: boon.description },
                    { kind: "boon" },
                    e.badges,
                  );
                }}
                entries={c.boons.map((id) => {
                  const boon = BOON_BY_ID[id];
                  if (!boon) {
                    return { id, name: id, description: "Unknown boon id." };
                  }
                  const badges: { label: string; variant: "outline" }[] = [];
                  if (boon.abilityBonus) {
                    const ab =
                      boon.abilityBonus.ability === "choice"
                        ? c.boonAbilityChoices[id]
                        : boon.abilityBonus.ability;
                    if (ab) {
                      badges.push({
                        label: `+1 ${ABILITY_SHORT[ab]}`,
                        variant: "outline",
                      });
                    }
                  }
                  return {
                    id,
                    name: boon.name,
                    description: boon.description,
                    badges,
                  };
                })}
              />
            </Parchment>
          )}

          {/* Burdens (taken at L1) */}
          {c.burdens.length > 0 && (
            <Parchment>
              <SectionHeader>Burdens</SectionHeader>
              <FeatGroup
                title="Carried since character creation"
                muted
                onTap={(e) => {
                  const b = BURDEN_BY_ID[e.id];
                  if (!b) return;
                  openTap(
                    { name: b.name, description: b.description },
                    { kind: "burden" },
                    e.badges,
                  );
                }}
                entries={c.burdens.map((id) => {
                  const b = BURDEN_BY_ID[id];
                  if (!b) return { id, name: id, description: "Unknown burden id." };
                  const badges: { label: string; variant: "outline" }[] = [];
                  const bonus = b.abilityBonus;
                  if (bonus) {
                    if (bonus.kind === "fixed") {
                      badges.push({
                        label: `+${bonus.amount} ${ABILITY_SHORT[bonus.ability]}`,
                        variant: "outline",
                      });
                    } else {
                      const picks = c.burdenAbilityChoices[id] ?? [];
                      for (const ab of picks) {
                        badges.push({
                          label: `+${bonus.amount} ${ABILITY_SHORT[ab]}`,
                          variant: "outline",
                        });
                      }
                    }
                  }
                  return {
                    id,
                    name: b.name,
                    description: b.description,
                    badges,
                  };
                })}
              />
            </Parchment>
          )}

          {/* Level-up Feats */}
          {c.feats.length > 0 && (
            <Parchment>
              <SectionHeader>Feats</SectionHeader>
              <FeatList
                feats={c.feats}
                onTap={(e) =>
                  openTap(
                    { name: e.name, description: e.description },
                    { kind: "feat" },
                    e.badges,
                  )
                }
              />
            </Parchment>
          )}

          {/* Spells (any spellcasting approach) */}
          {spell && c.spellPicks && (c.spellPicks.cantrips.length + c.spellPicks.spellsKnown.length) > 0 && (
            <Parchment>
              <SectionHeader>Spellcraft</SectionHeader>
              <p className="text-sm text-[#3a322a] mb-3">
                Tradition: <span className="font-display">{spell.tradition ?? "—"}</span>
              </p>
              <SpellSlotPips character={c} onChange={handleChange} />
              {/* Bump contrast on the shared SpellTabs — its default
                  text-foreground/60 is washed out on the cream parchment. */}
              <div className="[&_[data-slot=tabs-trigger]]:text-[#5a4d2f] [&_[data-slot=tabs-trigger][data-active]]:text-[#1d1814] [&_[data-slot=tabs-trigger][data-active]]:after:!bg-[#7a1f1f]">
                <SheetSpellbook
                  character={c}
                  onChange={handleChange}
                  cantrips={c.spellPicks.cantrips}
                  spellsKnown={c.spellPicks.spellsKnown}
                />
              </div>
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
              <Stat label="Initiative" value={formatMod(initiative)} />
              <Stat label="Speed" value={`${origin?.speed ?? 30} ft.`} />
              <Stat label="Proficiency Bonus" value={`+${profBonus}`} />
            </dl>
          </Parchment>

          {/* Corruption — interactive +/- adjusters with threshold readout. */}
          <CorruptionPanel character={c} onChange={handleChange} />

          {/* Rest panel */}
          <RestPanel character={c} onChange={handleChange} />

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

      {/* Companion-mode tap popover for any feat / feature card. */}
      <FeatTapPopover
        open={tapped !== null}
        onOpenChange={(o) => {
          if (!o) setTapped(null);
        }}
        entry={tapped}
        character={c}
        onUse={(featureId) => {
          handleChange(useFeature(c, featureId));
          // Don't close the popover — let the player see the decremented count.
        }}
      />
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

function Feature({
  title,
  children,
  onTap,
}: {
  title: string;
  children: React.ReactNode;
  onTap?: () => void;
}) {
  if (onTap) {
    return (
      <button
        type="button"
        onClick={onTap}
        className="block w-full text-left rounded-sm transition-colors hover:bg-[#7a1f1f]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1f1f]/40 px-1 -mx-1"
        aria-label={`Open ${title}`}
      >
        <p className="font-display tracking-wide text-[#1d1814]">{title}</p>
        <p className="text-[#3a322a]">{children}</p>
      </button>
    );
  }
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
  character,
  onChange,
  cantrips,
  spellsKnown,
}: {
  character: Character;
  onChange(updated: Character): void;
  cantrips: ReadonlyArray<string>;
  spellsKnown: ReadonlyArray<string>;
}) {
  // Local state: which spell, if any, has the cast popover open. The popover
  // owns its preview cast level internally — it just resets when `castSpell`
  // changes id.
  const [castSpell, setCastSpell] = useState<SpellDef | null>(null);

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

  return (
    <>
      <SpellTabs
        spells={known}
        levels={levels}
        mode={{ kind: "display", onCast: setCastSpell }}
      />
      <SpellCastPopover
        open={castSpell !== null}
        onOpenChange={(o) => {
          if (!o) setCastSpell(null);
        }}
        spell={castSpell}
        character={character}
        onCast={(slotLevel) => {
          // Spend the slot via the existing live-state primitive, then close
          // the popover. The mutation propagates via the sheet's onChange
          // pipeline, which writes to localStorage.
          onChange(spendSlot(character, slotLevel));
          setCastSpell(null);
        }}
      />
    </>
  );
}
