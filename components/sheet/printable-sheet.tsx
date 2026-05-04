"use client";

// Print-first character sheet.
//
// Renders the static character snapshot in a layout that prints cleanly:
// white background, near-black text, single crimson accent under section
// headers, no parchment fills or gradients. Companion-mode live state
// (currentHp, slot pips, death saves) is intentionally NOT rendered — the
// printout is a paper-transfer artifact, not a session snapshot.

import type { Character } from "@/lib/character/types";
import { ABILITY_LABELS, ABILITY_ORDER, ABILITY_SHORT } from "@/lib/character/types";
import { ORIGIN_BY_ID } from "@/data/origins";
import { BACKGROUND_BY_ID } from "@/data/backgrounds";
import { CLASS_BY_ID, approachById } from "@/data/classes";
import { SKILL_BY_ID } from "@/data/skills";
import { SPELL_BY_ID } from "@/data/spells";
import { BOON_BY_ID, BURDEN_BY_ID, FEAT_BY_ID } from "@/data/feats";
import {
  computeArmorClass,
  computeFinalAbilities,
  computeProficiencyBonus,
  computeCorruptionThreshold,
  computeSavingThrows,
  computeSkillScores,
  computeSpellcasting,
  computeInitiative,
  formatMod,
} from "@/lib/character/compute";
import { resolveCharacterInventory, resolveWeaponAttack } from "@/lib/character/equipment";
import { OrnateDivider } from "@/components/theme/ornate-divider";
import { APP_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";

const FIGHTING_STYLE_LABELS: Record<string, string> = {
  archery: "Archery",
  defense: "Defense",
  dueling: "Dueling",
  "great-weapon": "Great Weapon Fighting",
  polearm: "Polearm Fighting",
  shield: "Shield Fighting",
  snare: "Snare Fighting",
  "two-weapon": "Two-Weapon Fighting",
};

export function PrintableSheet({ character: c }: { character: Character }) {
  const origin = ORIGIN_BY_ID[c.originId];
  const subchoice = origin?.subchoices?.options.find(
    (o) => o.id === c.originSubchoiceId,
  );
  const bg = BACKGROUND_BY_ID[c.backgroundId];
  const cls = CLASS_BY_ID[c.classId];
  const approach = approachById(c.approachId);

  const finals = computeFinalAbilities(c);
  const profBonus = computeProficiencyBonus(c);
  const armorClass = computeArmorClass(c);
  const inventory = resolveCharacterInventory(c);
  const threshold = computeCorruptionThreshold(c);
  const saves = computeSavingThrows(c);
  const skills = computeSkillScores(c);
  const spell = computeSpellcasting(c);
  const initiative = computeInitiative(c);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-[210mm] bg-white text-[#1d1814] font-sans p-6 print:p-0">
      {/* Identity block */}
      <Section avoidBreak first>
        <h1 className="font-display text-3xl tracking-wide">
          {c.identity.name || "(unnamed)"}
        </h1>
        <p className="text-sm mt-1">
          {origin?.name ?? "—"}
          {subchoice && <> ({subchoice.name})</>} ·{" "}
          {bg?.name ?? "—"} · Level {c.level} {cls?.name ?? "—"} (
          {approach?.name ?? "—"})
          {c.identity.pronouns && <> · {c.identity.pronouns}</>}
        </p>
        <OrnateDivider className="!text-[#7a1f1f] mt-2" />
      </Section>

      {/* Combat block */}
      <Section heading="Combat" avoidBreak>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-3 text-sm">
          <Pill label="Max HP" value={c.maxHp || "—"} />
          <Pill label="Hit Die" value={`d${origin?.hitDie ?? cls?.fallbackHitDie ?? 8}`} />
          <Pill label="Prof Bonus" value={`+${profBonus}`} />
          <Pill label="Initiative" value={formatMod(initiative)} />
          <Pill label="AC" value={armorClass.ac} />
          <Pill label="Speed" value={`${origin?.speed ?? 30} ft`} />
          <Pill label="Corruption Thr." value={threshold} />
        </div>
      </Section>

      {/* Abilities */}
      <Section heading="Abilities" avoidBreak>
        <div className="grid grid-cols-6 gap-2 text-center">
          {ABILITY_ORDER.map((ab) => (
            <div key={ab} className="border border-[#1d1814]/40 rounded p-1.5">
              <div className="font-display text-[9px] uppercase tracking-widest">
                {ABILITY_LABELS[ab]}
              </div>
              <div className="font-display text-2xl">{finals.total[ab]}</div>
              <div className="font-display text-sm">
                {formatMod(finals.modifiers[ab])}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Saves + Skills side-by-side */}
      <div className="grid sm:grid-cols-3 gap-4 mt-4">
        <Section heading="Saving Throws" avoidBreak>
          <ul className="text-sm space-y-0.5">
            {saves.map((s) => (
              <li key={s.ability} className="flex items-baseline justify-between">
                <span className="flex items-center gap-1.5">
                  <ProfDot proficient={s.proficient} />
                  {ABILITY_LABELS[s.ability]}
                </span>
                <span className="font-display">{formatMod(s.modifier)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <div className="sm:col-span-2">
          <Section heading="Skills" avoidBreak>
            <ul className="text-sm grid grid-cols-2 gap-x-4 gap-y-0.5">
              {skills.map((s) => {
                const sk = SKILL_BY_ID[s.skill];
                return (
                  <li
                    key={s.skill}
                    className="flex items-baseline justify-between"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <ProfDot proficient={s.proficient} />
                      {sk.name}{" "}
                      <span className="text-xs text-[#5a4d2f]">
                        ({ABILITY_SHORT[sk.ability]})
                      </span>
                    </span>
                    <span className="font-display">{formatMod(s.modifier)}</span>
                  </li>
                );
              })}
            </ul>
          </Section>
        </div>
      </div>

      {/* Features */}
      <Section heading="Features" avoidBreak>
        <ul className="text-sm space-y-2">
          {origin?.features.map((f) => (
            <FeatureLI
              key={`origin-${f.name}`}
              source={origin.name}
              name={f.name}
              description={f.description}
            />
          ))}
          {subchoice?.features?.map((f) => (
            <FeatureLI
              key={`sub-${f.name}`}
              source={subchoice.name}
              name={f.name}
              description={f.description}
            />
          ))}
          {bg?.feature && (
            <FeatureLI
              source={bg.name}
              name={bg.feature.name}
              description={bg.feature.description}
            />
          )}
          {cls?.level1Features.map((f) => (
            <FeatureLI
              key={`class-${f.name}`}
              source={cls.name}
              name={f.name}
              description={f.description}
            />
          ))}
          {approach?.level1Features.map((f) => (
            <FeatureLI
              key={`appr-${f.name}`}
              source={approach.name}
              name={f.name}
              description={f.description}
            />
          ))}
          {cls?.levelTable.slice(0, c.level).flatMap((row, i) =>
            row.features.map((f) => (
              <FeatureLI
                key={`class-l${i + 1}-${f.name}`}
                source={`${cls.name} L${i + 1}`}
                name={f.name}
                description={f.description}
              />
            )),
          )}
          {approach?.levelTable.slice(0, c.level).flatMap((row, i) =>
            row.features.map((f) => (
              <FeatureLI
                key={`appr-l${i + 1}-${f.name}`}
                source={`${approach.name} L${i + 1}`}
                name={f.name}
                description={f.description}
              />
            )),
          )}
        </ul>
      </Section>

      {/* Boons */}
      {c.boons.length > 0 && (
        <Section heading="Boons" avoidBreak>
          <ul className="text-sm space-y-1.5">
            {c.boons.map((id) => {
              const boon = BOON_BY_ID[id];
              if (!boon) {
                return (
                  <CardLI key={id} name={id} description="Unknown boon id." />
                );
              }
              let suffix = "";
              if (boon.abilityBonus) {
                const ab =
                  boon.abilityBonus.ability === "choice"
                    ? c.boonAbilityChoices[id]
                    : boon.abilityBonus.ability;
                if (ab) suffix = ` (+1 ${ABILITY_SHORT[ab]})`;
              }
              return (
                <CardLI
                  key={id}
                  name={`${boon.name}${suffix}`}
                  description={boon.description}
                />
              );
            })}
          </ul>
        </Section>
      )}

      {/* Burdens */}
      {c.burdens.length > 0 && (
        <Section heading="Burdens" avoidBreak>
          <ul className="text-sm space-y-1.5">
            {c.burdens.map((id) => {
              const b = BURDEN_BY_ID[id];
              if (!b) {
                return (
                  <CardLI key={id} name={id} description="Unknown burden id." />
                );
              }
              return <CardLI key={id} name={b.name} description={b.description} />;
            })}
          </ul>
        </Section>
      )}

      {/* Feats */}
      {c.feats.length > 0 && (
        <Section heading="Feats" avoidBreak>
          <ul className="text-sm space-y-1.5">
            {c.feats.map((id) => {
              if (id.startsWith("fighting-style:")) {
                const styleId = id.slice("fighting-style:".length);
                return (
                  <CardLI
                    key={id}
                    name={`Fighting Style — ${FIGHTING_STYLE_LABELS[styleId] ?? styleId}`}
                    description="See class entry for the style's mechanical effect."
                  />
                );
              }
              const feat = FEAT_BY_ID[id];
              return (
                <CardLI
                  key={id}
                  name={feat?.name ?? id}
                  description={feat?.description ?? "No description available — unknown feat id."}
                />
              );
            })}
          </ul>
        </Section>
      )}

      {/* Spells */}
      {spell &&
        (
          (c.spellPicks &&
            (c.spellPicks.cantrips.length + c.spellPicks.spellsKnown.length) > 0) ||
          spell.grantedSpells.length > 0
        ) && (
          <Section heading="Spells" avoidBreak>
            <p className="text-xs text-[#5a4d2f] mb-2">
              Tradition: <span className="font-display">{spell.tradition ?? "—"}</span>
            </p>
            <SpellList
              cantrips={c.spellPicks?.cantrips ?? []}
              spellsKnown={c.spellPicks?.spellsKnown ?? []}
              grantedSpells={spell.grantedSpells}
            />
          </Section>
        )}

      {/* Equipment */}
      <Section heading="Equipment" avoidBreak>
        <div className="text-sm space-y-2">
          {inventory.weapons.length > 0 && (
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f] mb-1">
                Weapons
              </p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1d1814]/40">
                    <th className="text-left font-display tracking-widest uppercase text-[9px] py-1">Name</th>
                    <th className="text-right font-display tracking-widest uppercase text-[9px] py-1 pl-2">Atk</th>
                    <th className="text-right font-display tracking-widest uppercase text-[9px] py-1 pl-2">Damage</th>
                    <th className="text-left font-display tracking-widest uppercase text-[9px] py-1 pl-2">Properties</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.weapons.map((w) => {
                    const r = resolveWeaponAttack(c, w, "1h");
                    const props = [...w.flags];
                    return (
                      <tr key={w.id} className="border-b border-[#1d1814]/15">
                        <td className="py-1 font-display">{w.name}</td>
                        <td className="py-1 pl-2 text-right">{formatMod(r.attackMod)}</td>
                        <td className="py-1 pl-2 text-right whitespace-nowrap">
                          {r.damageDice.count}d{r.damageDice.faces} {formatMod(r.damageMod)} {w.damageType}
                        </td>
                        <td className="py-1 pl-2 text-[10px] text-[#5a4d2f]">{props.join(", ") || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {(inventory.armor.length > 0 || inventory.shield) && (
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f] mb-1">
                Armor
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {inventory.armor.map((a) => (
                  <li key={a.id}>
                    {a.name} <span className="text-[10px] text-[#5a4d2f]">(AC {a.ac.base}{a.ac.addDex ? ` + Dex${a.ac.dexMax !== undefined ? ` max ${a.ac.dexMax}` : ""}` : ""})</span>
                  </li>
                ))}
                {inventory.shield && (
                  <li>
                    {inventory.shield.name} <span className="text-[10px] text-[#5a4d2f]">(+{inventory.shield.ac.base} AC)</span>
                  </li>
                )}
              </ul>
            </div>
          )}
          {inventory.other.length > 0 && (
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f] mb-1">
                Gear
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {inventory.other.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          {bg && (
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f] mb-1">
                From background
              </p>
              <p>{bg.equipment}</p>
            </div>
          )}
        </div>
      </Section>

      {/* Identity tropes */}
      <Section heading="Identity" avoidBreak>
        <dl className="text-sm space-y-1">
          <Row label="Personality">{c.identity.personalityTrait || "—"}</Row>
          <Row label="Ideal">{c.identity.ideal || "—"}</Row>
          <Row label="Bond">{c.identity.bond || "—"}</Row>
          <Row label="Flaw">{c.identity.flaw || "—"}</Row>
        </dl>
      </Section>

      {/* Notes — always rendered, leaves room for handwritten additions */}
      <Section heading="Notes" avoidBreak>
        <div className="min-h-[3rem] text-sm whitespace-pre-wrap">
          {c.notes || ""}
        </div>
      </Section>

      {/* Traceability footer */}
      <p className="mt-6 text-[10px] text-[#9a8a6b] text-center">
        Generated by symbarator v{APP_VERSION} on {today}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Section({
  heading,
  children,
  avoidBreak,
  first,
}: {
  heading?: string;
  children: React.ReactNode;
  avoidBreak?: boolean;
  first?: boolean;
}) {
  return (
    <section
      className={cn(
        "mt-4",
        first && "mt-0",
        avoidBreak && "break-inside-avoid",
      )}
    >
      {heading && (
        <h2 className="font-display text-[11px] uppercase tracking-[0.4em] text-[#7a1f1f] border-b border-[#7a1f1f] pb-0.5 mb-2">
          {heading}
        </h2>
      )}
      {children}
    </section>
  );
}

function Pill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-[#1d1814]/40 rounded p-1.5 text-center">
      <div className="font-display text-[9px] uppercase tracking-widest">
        {label}
      </div>
      <div className="font-display text-base">{value}</div>
    </div>
  );
}

function ProfDot({ proficient }: { proficient: boolean }) {
  return (
    <span
      className={cn(
        "inline-block w-2 h-2 rounded-full",
        proficient
          ? "bg-[#7a1f1f] border border-[#7a1f1f]"
          : "bg-transparent border border-[#1d1814]/50",
      )}
    />
  );
}

function FeatureLI({
  source,
  name,
  description,
}: {
  source: string;
  name: string;
  description: string;
}) {
  return (
    <li className="break-inside-avoid">
      <p className="font-display tracking-wide">
        {source}: {name}
      </p>
      <p className="text-xs text-[#3a322a]">{description}</p>
    </li>
  );
}

function CardLI({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <li className="border border-[#1d1814]/30 rounded p-1.5 break-inside-avoid">
      <p className="font-display tracking-wide">{name}</p>
      <p className="text-xs text-[#3a322a]">{description}</p>
    </li>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 text-sm">
      <dt className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f] w-24 shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="flex-1">{children}</dd>
    </div>
  );
}

function SpellList({
  cantrips,
  spellsKnown,
  grantedSpells,
}: {
  cantrips: ReadonlyArray<string>;
  spellsKnown: ReadonlyArray<string>;
  grantedSpells: ReadonlyArray<string>;
}) {
  const knownIds = Array.from(new Set([...cantrips, ...spellsKnown, ...grantedSpells]));
  const known = knownIds
    .map((id) => SPELL_BY_ID[id])
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  if (known.length === 0) return null;

  // Group by spell level (ascending).
  const byLevel = new Map<number, typeof known>();
  for (const s of known) {
    const bucket = byLevel.get(s.level) ?? [];
    bucket.push(s);
    byLevel.set(s.level, bucket);
  }
  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);

  const labelFor = (lvl: number) =>
    lvl === 0 ? "Cantrips" : `${ordinal(lvl)} level`;

  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
      {levels.map((lvl) => (
        <div key={lvl} className="break-inside-avoid">
          <p className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f] mb-1">
            {labelFor(lvl)}
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {(byLevel.get(lvl) ?? [])
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ordinal(n: number): string {
  const map: Record<number, string> = {
    1: "1st",
    2: "2nd",
    3: "3rd",
  };
  return map[n] ?? `${n}th`;
}
