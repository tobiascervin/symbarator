"use client";

// Companion-mode interactive panels for the character sheet.
//
// Each panel takes the current character + a callback that receives the
// updated character (the parent persists via LocalCharacterStore.save).
// The panels never call storage directly — they're pure-UI wrappers around
// the lib/character/live-state.ts pure functions.

import { useState } from "react";
import type { Character } from "@/lib/character/types";
import {
  addTempHp,
  applyDamage,
  applyHeal,
  bumpCorruption,
  extendedRest,
  longRest,
  maxSlotsAt,
  recordDeathSave,
  restoreSlot,
  shortRest,
  spendHitDie,
  spendSlot,
} from "@/lib/character/live-state";
import { ORIGIN_BY_ID } from "@/data/origins";
import { CLASS_BY_ID } from "@/data/classes";
import { computeCorruptionThreshold } from "@/lib/character/compute";
import { Parchment } from "@/components/theme/parchment";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Parchment-themed button. The default shadcn Button uses design-system
// tokens (white-on-white outline, light grey text) that wash out against
// the cream parchment background — these classes give the panels readable
// dark-on-cream / light-on-crimson buttons that match the rest of the sheet.
function SymButton({
  children,
  variant = "primary",
  className,
  ...rest
}: {
  variant?: "primary" | "secondary";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-display tracking-wide whitespace-nowrap transition disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a1f1f]";
  const styles =
    variant === "primary"
      ? "bg-[#7a1f1f] text-[#f3ead2] hover:bg-[#5a1717] border border-[#5a1717]"
      : "bg-[#efe5cb] text-[#1d1814] hover:bg-[#e3d6b3] border border-[#9a8a6b]";
  return (
    <button className={cn(base, styles, className)} {...rest}>
      {children}
    </button>
  );
}

interface PanelProps {
  character: Character;
  onChange(updated: Character): void;
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

// ---------------------------------------------------------------------------
// HP & Vitals
// ---------------------------------------------------------------------------

export function HpVitalsPanel({ character: c, onChange }: PanelProps) {
  const [dmg, setDmg] = useState("");
  const [heal, setHeal] = useState("");
  const [temp, setTemp] = useState("");
  const downed = c.currentHp === 0;

  function applyN(setter: (n: number) => Character | null, raw: string, clear: () => void) {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a positive number.");
      return;
    }
    const updated = setter(Math.floor(n));
    if (updated) onChange(updated);
    clear();
  }

  function handleSpendHd() {
    if (c.hitDiceRemaining <= 0) {
      toast.error("No Hit Dice remaining. Take an extended rest.");
      return;
    }
    const { character, hpGained } = spendHitDie(c);
    onChange(character);
    toast.success(`Spent a Hit Die (+${hpGained} HP).`);
  }

  const origin = ORIGIN_BY_ID[c.originId];
  const cls = CLASS_BY_ID[c.classId];
  const die = origin?.providesHp ? origin.hitDie : (cls?.fallbackHitDie ?? 8);

  return (
    <Parchment>
      <SectionHeader>Vitals</SectionHeader>
      <div className="space-y-3 text-sm text-[#1d1814]">
        <div
          className={cn(
            "flex items-baseline justify-between rounded border px-3 py-2",
            downed
              ? "bg-[#7a1f1f]/15 border-[#7a1f1f]"
              : "bg-[#efe5cb] border-[#9a8a6b]",
          )}
          data-testid="hp-readout"
        >
          <span className="font-display text-xs uppercase tracking-widest text-[#5a4d2f]">
            Hit Points {downed && <span className="text-[#7a1f1f]">· Downed</span>}
          </span>
          <span className="font-display text-2xl">
            <span data-testid="current-hp">{c.currentHp}</span>
            <span className="text-[#5a4d2f]"> / </span>
            <span>{c.maxHp}</span>
            {c.tempHp > 0 && (
              <span className="text-[#3a322a] text-base ml-2">
                (+<span data-testid="temp-hp">{c.tempHp}</span> temp)
              </span>
            )}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <InlineApply
            label="Damage"
            value={dmg}
            onValue={setDmg}
            buttonLabel="Apply"
            onApply={() =>
              applyN((n) => applyDamage(c, n), dmg, () => setDmg(""))
            }
            testId="damage-input"
          />
          <InlineApply
            label="Heal"
            value={heal}
            onValue={setHeal}
            buttonLabel="Apply"
            onApply={() =>
              applyN((n) => applyHeal(c, n), heal, () => setHeal(""))
            }
            testId="heal-input"
          />
          <InlineApply
            label="Temp HP"
            value={temp}
            onValue={setTemp}
            buttonLabel="Set"
            onApply={() =>
              applyN((n) => addTempHp(c, n), temp, () => setTemp(""))
            }
            testId="temp-input"
          />
        </div>

        <div className="flex items-center justify-between rounded border border-[#9a8a6b] bg-[#efe5cb] px-3 py-2">
          <div>
            <div className="font-display text-xs uppercase tracking-widest text-[#5a4d2f]">
              Hit Dice (d{die})
            </div>
            <div className="font-display text-lg" data-testid="hd-readout">
              {c.hitDiceRemaining} / {c.level}
            </div>
          </div>
          <SymButton
            variant="primary"
            onClick={handleSpendHd}
            disabled={c.hitDiceRemaining <= 0}
          >
            Spend Hit Die
          </SymButton>
        </div>
      </div>
    </Parchment>
  );
}

function InlineApply({
  label,
  value,
  onValue,
  buttonLabel,
  onApply,
  testId,
}: {
  label: string;
  value: string;
  onValue(v: string): void;
  buttonLabel: string;
  onApply(): void;
  testId: string;
}) {
  return (
    <div className="space-y-1">
      <div className="font-display text-[10px] uppercase tracking-widest text-[#5a4d2f]">
        {label}
      </div>
      <div className="flex gap-1">
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onValue(e.target.value)}
          className="h-9 bg-[#fbf6e6] border-[#9a8a6b] text-[#1d1814]"
          data-testid={testId}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply();
          }}
        />
        <SymButton variant="primary" onClick={onApply}>
          {buttonLabel}
        </SymButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Death Saves
// ---------------------------------------------------------------------------

export function DeathSavesPanel({ character: c, onChange }: PanelProps) {
  if (c.currentHp > 0) return null;
  const stable = c.deathSaves.successes >= 3;
  const dead = c.deathSaves.failures >= 3;
  return (
    <Parchment className="!bg-[#caa8a4]/40 !border-[#7a1f1f]">
      <SectionHeader>Death Saves</SectionHeader>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <SaveRow
            label="Successes"
            count={c.deathSaves.successes}
            color="text-[#1d1814]"
            symbol="✓"
            testId="death-successes"
          />
          <SymButton
            variant="secondary"
            onClick={() => onChange(recordDeathSave(c, "success"))}
            disabled={stable || dead}
            data-testid="record-success"
          >
            ✓ Success
          </SymButton>
        </div>
        <div className="flex items-center justify-between text-sm">
          <SaveRow
            label="Failures"
            count={c.deathSaves.failures}
            color="text-[#7a1f1f]"
            symbol="✗"
            testId="death-failures"
          />
          <SymButton
            variant="primary"
            onClick={() => onChange(recordDeathSave(c, "failure"))}
            disabled={stable || dead}
            data-testid="record-failure"
          >
            ✗ Failure
          </SymButton>
        </div>
        {stable && (
          <p
            className="font-display text-sm text-[#1d1814]"
            data-testid="death-stable"
          >
            Stable — regains 1 HP after 1d4 hours (GM call).
          </p>
        )}
        {dead && (
          <p
            className="font-display text-sm text-[#7a1f1f]"
            data-testid="death-dead"
          >
            Dead — the GM has the final word.
          </p>
        )}
      </div>
    </Parchment>
  );
}

function SaveRow({
  label,
  count,
  color,
  symbol,
  testId,
}: {
  label: string;
  count: number;
  color: string;
  symbol: string;
  testId: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-xs uppercase tracking-widest text-[#5a4d2f]">
        {label}
      </span>
      <span className={cn("font-display text-xl", color)} data-testid={testId}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < count ? "" : "opacity-25"}>
            {symbol}
          </span>
        ))}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spell slot pips
// ---------------------------------------------------------------------------

export function SpellSlotPips({ character: c, onChange }: PanelProps) {
  const max = maxSlotsAt(c);
  if (max.every((m) => m === 0)) return null;

  // Use "L1 / L2 / …" labels here so the row doesn't visually clash with the
  // sibling SpellTabs below, which already uses "1st / 2nd / …" tab labels.
  return (
    <div className="rounded border border-[#9a8a6b] bg-[#fbf6e6] p-3 mb-3">
      <div className="font-display text-xs uppercase tracking-[0.3em] text-[#7a1f1f] mb-2">
        Spell Slots
      </div>
      <div className="space-y-1.5">
        {max.map((maxN, i) => {
          if (maxN === 0) return null;
          const cur = c.currentSpellSlots[i] ?? 0;
          const spellLevel = i + 1;
          return (
            <div
              key={i}
              className="flex items-center gap-3"
              data-testid={`slot-row-${spellLevel}`}
            >
              <span className="font-display text-sm text-[#1d1814] w-8">
                L{spellLevel}
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: maxN }, (_, idx) => {
                  const filled = idx < cur;
                  return (
                    <button
                      key={idx}
                      type="button"
                      aria-label={
                        filled
                          ? `Spend L${spellLevel} slot`
                          : `Restore L${spellLevel} slot`
                      }
                      data-testid={`slot-pip-${spellLevel}-${idx}`}
                      data-filled={filled ? "true" : "false"}
                      onClick={() =>
                        onChange(
                          filled
                            ? spendSlot(c, spellLevel)
                            : restoreSlot(c, spellLevel),
                        )
                      }
                      className={cn(
                        "w-5 h-5 rounded-full border-2 border-[#7a1f1f] transition cursor-pointer",
                        filled
                          ? "bg-[#7a1f1f] hover:bg-[#5a1717]"
                          : "bg-[#fbf6e6] hover:bg-[#7a1f1f]/20",
                      )}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-[#5a4d2f] ml-auto">
                {cur} / {maxN}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Corruption
// ---------------------------------------------------------------------------

export function CorruptionPanel({ character: c, onChange }: PanelProps) {
  const threshold = computeCorruptionThreshold(c);
  const overThreshold = c.corruption.temporary > threshold;

  return (
    <Parchment className="!bg-gradient-to-br !from-[#e9dec6] !to-[#caa8a4]">
      <SectionHeader>Corruption</SectionHeader>
      <div className="space-y-2 text-sm text-[#1d1814]">
        <div className="flex items-baseline justify-between border-b border-[#9a8a6b]/30 py-0.5">
          <dt className="text-[#3a322a]">Threshold</dt>
          <dd className="font-display text-lg flex items-center gap-2">
            <span data-testid="corruption-threshold">{threshold}</span>
            {overThreshold && (
              <span
                data-testid="corruption-over"
                className="text-xs uppercase tracking-widest text-[#7a1f1f] font-display"
              >
                Over
              </span>
            )}
          </dd>
        </div>
        <CorruptionRow
          label="Permanent"
          value={c.corruption.permanent}
          testId="corruption-permanent"
          onMinus={() => onChange(bumpCorruption(c, "permanent", -1))}
          onPlus={() => onChange(bumpCorruption(c, "permanent", +1))}
        />
        <CorruptionRow
          label="Temporary"
          value={c.corruption.temporary}
          testId="corruption-temporary"
          onMinus={() => onChange(bumpCorruption(c, "temporary", -1))}
          onPlus={() => onChange(bumpCorruption(c, "temporary", +1))}
        />
      </div>
    </Parchment>
  );
}

function CorruptionRow({
  label,
  value,
  testId,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  testId: string;
  onMinus(): void;
  onPlus(): void;
}) {
  const stepBtn =
    "w-7 h-7 inline-flex items-center justify-center rounded border border-[#9a8a6b] bg-[#efe5cb] text-[#1d1814] font-display text-base hover:bg-[#7a1f1f] hover:text-[#f3ead2] hover:border-[#7a1f1f] transition";
  return (
    <div className="flex items-baseline justify-between border-b border-[#9a8a6b]/30 py-0.5">
      <dt className="text-[#3a322a]">{label}</dt>
      <dd className="flex items-center gap-2">
        <button
          type="button"
          className={stepBtn}
          onClick={onMinus}
          aria-label={`Decrease ${label}`}
          data-testid={`${testId}-minus`}
        >
          −
        </button>
        <span className="font-display text-lg w-6 text-center" data-testid={testId}>
          {value}
        </span>
        <button
          type="button"
          className={stepBtn}
          onClick={onPlus}
          aria-label={`Increase ${label}`}
          data-testid={`${testId}-plus`}
        >
          +
        </button>
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rest
// ---------------------------------------------------------------------------

export function RestPanel({ character: c, onChange }: PanelProps) {
  return (
    <Parchment>
      <SectionHeader>Rest</SectionHeader>
      <div className="space-y-2">
        <RestButton
          label="Short Rest"
          summary="Spend Hit Dice from the Vitals panel."
          onClick={() => {
            onChange(shortRest(c));
            toast.success("Short rest taken.");
          }}
        />
        <RestButton
          label="Long Rest"
          summary="Full HP, half HD restored, all spell slots, death saves cleared."
          onClick={() => {
            onChange(longRest(c));
            toast.success("Long rest taken.");
          }}
          testId="rest-long"
        />
        <RestButton
          label="Extended Rest"
          summary="Long rest + every Hit Die restored."
          onClick={() => {
            onChange(extendedRest(c));
            toast.success("Extended rest taken.");
          }}
          testId="rest-extended"
        />
      </div>
    </Parchment>
  );
}

function RestButton({
  label,
  summary,
  onClick,
  testId,
}: {
  label: string;
  summary: string;
  onClick(): void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="w-full text-left rounded border border-[#9a8a6b] bg-[#efe5cb] px-3 py-2 hover:border-[#7a1f1f] transition"
    >
      <div className="font-display text-sm uppercase tracking-widest text-[#1d1814]">
        {label}
      </div>
      <div className="text-xs text-[#5a4d2f]">{summary}</div>
    </button>
  );
}
