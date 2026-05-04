"use client";

import { useState } from "react";
import type { Character, FeatureDef, SpellDef } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER, ABILITY_SHORT } from "@/lib/character/types";
import { spendSlot, useFeature } from "@/lib/character/live-state";
import type { FeatureSource } from "@/lib/character/features";
import { SpellCastPopover } from "@/components/spells/spell-cast-popover";
import { WeaponAttackPopover } from "@/components/sheet/weapon-attack-popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
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
  computeArmorClass,
  computeFinalAbilities,
  computeProficiencyBonus,
  computeSavingThrows,
  computeSkillScores,
  computeSpellcasting,
  computeInitiative,
  formatMod,
} from "@/lib/character/compute";
import { resolveCharacterInventory, resolveWeaponAttack } from "@/lib/character/equipment";
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
import type { SpellLevel, WeaponDef } from "@/lib/character/types";
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
  const armorClass = computeArmorClass(c);
  const inventory = resolveCharacterInventory(c);

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
          {spell && (
            (c.spellPicks &&
              (c.spellPicks.cantrips.length + c.spellPicks.spellsKnown.length) > 0) ||
            spell.grantedSpells.length > 0
          ) && (
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
                  cantrips={c.spellPicks?.cantrips ?? []}
                  spellsKnown={c.spellPicks?.spellsKnown ?? []}
                  grantedSpells={spell.grantedSpells}
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
          {/* Combat — stats, weapons, and armor live together. */}
          <Parchment>
            <SectionHeader>Combat</SectionHeader>
            <dl className="text-sm space-y-2 text-[#1d1814]">
              <Stat label="Initiative" value={formatMod(initiative)} />
              <Stat label="Armor Class" value={`${armorClass.ac}`} />
              <Stat label="Speed" value={`${origin?.speed ?? 30} ft.`} />
              <Stat label="Proficiency Bonus" value={`+${profBonus}`} />
            </dl>

            {inventory.weapons.length > 0 && (
              <div className="mt-4">
                <SubSectionHeader>Weapons</SubSectionHeader>
                <SheetWeapons character={c} weapons={inventory.weapons} />
              </div>
            )}

            {(inventory.armor.length > 0 || inventory.shield) && (
              <div className="mt-4">
                <SubSectionHeader>Armor</SubSectionHeader>
                <SheetArmor armor={inventory.armor} shield={inventory.shield} />
              </div>
            )}
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

          {/* Equipment — non-weapons, non-armor only. Weapons and armor live
              under the Combat parchment now. */}
          {(inventory.other.length > 0 || bg) && (
            <Parchment>
              <SectionHeader>Equipment</SectionHeader>
              <div className="text-sm text-[#1d1814] space-y-2">
                {inventory.other.length > 0 && (
                  <div>
                    <div className="font-display text-xs uppercase tracking-widest text-[#5a4d2f] mb-1">
                      Gear
                    </div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {inventory.other.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
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
          )}
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

function SubSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display tracking-widest text-[10px] uppercase text-[#5a4d2f] border-b border-[#9a8a6b]/40 pb-1 mb-2">
      {children}
    </div>
  );
}

function SheetArmor({
  armor,
  shield,
}: {
  armor: ReadonlyArray<import("@/lib/character/types").ArmorDef>;
  shield: import("@/lib/character/types").ArmorDef | null;
}) {
  return (
    <ul className="space-y-1 text-sm text-[#1d1814]">
      {armor.map((a) => (
        <li key={a.id} className="flex items-baseline justify-between border-b border-[#9a8a6b]/30 py-0.5">
          <span>{a.name}</span>
          <span className="font-display text-xs text-[#5a4d2f]">
            AC {a.ac.base}
            {a.ac.addDex
              ? ` + Dex${a.ac.dexMax !== undefined ? ` (max +${a.ac.dexMax})` : ""}`
              : ""}
          </span>
        </li>
      ))}
      {shield && (
        <li className="flex items-baseline justify-between border-b border-[#9a8a6b]/30 py-0.5">
          <span>{shield.name}</span>
          <span className="font-display text-xs text-[#5a4d2f]">+{shield.ac.base} AC</span>
        </li>
      )}
    </ul>
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
  grantedSpells,
}: {
  character: Character;
  onChange(updated: Character): void;
  cantrips: ReadonlyArray<string>;
  spellsKnown: ReadonlyArray<string>;
  grantedSpells: ReadonlyArray<string>;
}) {
  // Local state: which spell, if any, has the cast popover open. The popover
  // owns its preview cast level internally — it just resets when `castSpell`
  // changes id.
  const [castSpell, setCastSpell] = useState<SpellDef | null>(null);

  // Resolve every known id to its catalog entry (skip unknown ids silently;
  // they may be from a future schema or a typo in seeded data). Granted
  // spells (e.g. Templar's bless) are merged on top of the player's picks
  // — they are derived from the approach, never persisted. De-duplicate so
  // a save that happens to also list a granted id in `spellsKnown` doesn't
  // render the same card twice.
  const knownIds = Array.from(new Set([...cantrips, ...spellsKnown, ...grantedSpells]));
  const known = knownIds
    .map((id) => SPELL_BY_ID[id])
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  if (known.length === 0) return null;

  const grantedSpellIds = new Set(grantedSpells);

  // Levels present in the character's known spells, ascending.
  const levels = Array.from(new Set(known.map((s) => s.level))).sort(
    (a, b) => a - b,
  ) as SpellLevel[];

  return (
    <>
      <SpellTabs
        spells={known}
        levels={levels}
        mode={{ kind: "display", onCast: setCastSpell, grantedSpellIds }}
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

const WEAPON_GROUP_LABEL: Record<string, string> = {
  melee: "Melee",
  ranged: "Ranged",
  alchemical: "Alchemical",
  siege: "Siege",
};

function weaponGroup(category: WeaponDef["category"]): keyof typeof WEAPON_GROUP_LABEL {
  if (category === "simple-melee" || category === "martial-melee") return "melee";
  if (category === "simple-ranged" || category === "martial-ranged") return "ranged";
  return category;
}

function SheetWeapons({
  character,
  weapons,
}: {
  character: Character;
  weapons: ReadonlyArray<WeaponDef>;
}) {
  const [tappedWeapon, setTappedWeapon] = useState<WeaponDef | null>(null);

  // Group weapons by display category, preserving inventory order within
  // each group. Empty groups are skipped.
  const grouped = new Map<string, WeaponDef[]>();
  for (const w of weapons) {
    const g = weaponGroup(w.category);
    const list = grouped.get(g) ?? [];
    list.push(w);
    grouped.set(g, list);
  }
  const orderedGroups = ["melee", "ranged", "alchemical", "siege"].filter((g) =>
    grouped.has(g),
  );

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        {orderedGroups.map((g) => {
          const list = grouped.get(g)!;
          return (
            <Collapsible key={g}>
              <CollapsibleTrigger>
                <span className="flex items-center gap-2 min-w-0">
                  <ChevronRight className="size-4 shrink-0 transition-transform group-data-[panel-open]/collapsible-trigger:rotate-90" />
                  <span className="font-display text-sm">{WEAPON_GROUP_LABEL[g]}</span>
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{list.length}</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid sm:grid-cols-2 gap-2 pt-2">
                  {list.map((w) => {
                    const r = resolveWeaponAttack(character, w, "1h");
                    return (
                      <button
                        key={w.id}
                        type="button"
                        aria-label={`Attack with ${w.name}`}
                        onClick={() => setTappedWeapon(w)}
                        className="rounded-md border border-border p-3 text-left transition-colors cursor-pointer hover:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="font-display text-base text-foreground block">{w.name}</span>
                        <span className="block text-xs text-muted-foreground mt-1">
                          {signedNum(r.attackMod)} to hit · {r.damageDice.count}d
                          {r.damageDice.faces} {signedNum(r.damageMod)} {w.damageType}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
      <WeaponAttackPopover
        open={tappedWeapon !== null}
        onOpenChange={(o) => {
          if (!o) setTappedWeapon(null);
        }}
        weapon={tappedWeapon}
        character={character}
      />
    </>
  );
}

function signedNum(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
