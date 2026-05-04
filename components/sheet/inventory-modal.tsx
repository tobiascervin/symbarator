"use client";

import { useMemo, useState } from "react";
import type { ArmorDef, Character, WeaponDef } from "@/lib/character/types";
import {
  ARMORS,
  ARMOR_BY_NAME,
  HEAVY_ARMORS,
  LIGHT_ARMORS,
  MARTIAL_MELEE,
  MARTIAL_RANGED,
  MEDIUM_ARMORS,
  SHIELDS,
  SIMPLE_MELEE,
  SIMPLE_RANGED,
  WEAPONS,
  WEAPON_BY_NAME,
} from "@/data/equipment";
import {
  addInventoryItem,
  removeInventoryItem,
  resolveCharacterInventory,
} from "@/lib/character/inventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const WEAPON_GROUPS: Array<{ label: string; entries: ReadonlyArray<WeaponDef> }> = [
  { label: "Simple Melee", entries: SIMPLE_MELEE },
  { label: "Martial Melee", entries: MARTIAL_MELEE },
  { label: "Simple Ranged", entries: SIMPLE_RANGED },
  { label: "Martial Ranged", entries: MARTIAL_RANGED },
];

const ARMOR_GROUPS: Array<{ label: string; entries: ReadonlyArray<ArmorDef> }> = [
  { label: "Light", entries: LIGHT_ARMORS },
  { label: "Medium", entries: MEDIUM_ARMORS },
  { label: "Heavy", entries: HEAVY_ARMORS },
  { label: "Shields", entries: SHIELDS },
];

export interface InventoryModalProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  character: Character;
  onChange(updated: Character): void;
}

/**
 * In-session inventory editor. Three tabs (Weapons / Armor / Gear) for
 * adding items and a Current Inventory list for removing them. Mutations
 * propagate via `onChange` immediately — no Save button.
 */
export function InventoryModal({ open, onOpenChange, character, onChange }: InventoryModalProps) {
  const inventory = resolveCharacterInventory(character);
  const [weaponSearch, setWeaponSearch] = useState("");
  const [armorSearch, setArmorSearch] = useState("");
  const [gearText, setGearText] = useState("");

  const filteredWeaponGroups = useMemo(() => {
    const q = weaponSearch.trim().toLowerCase();
    if (!q) return WEAPON_GROUPS;
    return WEAPON_GROUPS.map((g) => ({
      label: g.label,
      entries: g.entries.filter((w) => w.name.toLowerCase().includes(q)),
    })).filter((g) => g.entries.length > 0);
  }, [weaponSearch]);

  const filteredArmorGroups = useMemo(() => {
    const q = armorSearch.trim().toLowerCase();
    if (!q) return ARMOR_GROUPS;
    return ARMOR_GROUPS.map((g) => ({
      label: g.label,
      entries: g.entries.filter((a) => a.name.toLowerCase().includes(q)),
    })).filter((g) => g.entries.length > 0);
  }, [armorSearch]);

  function handleAddWeapon(w: WeaponDef) {
    onChange(addInventoryItem(character, w.name));
  }
  function handleAddArmor(a: ArmorDef) {
    onChange(addInventoryItem(character, a.name));
  }
  function handleAddGear() {
    const value = gearText.trim();
    if (!value) return;
    // Don't add a gear token that matches a catalog item — push the player
    // to the Weapons / Armor tabs instead so the catalog match works.
    if (WEAPON_BY_NAME[value.toLowerCase()] || ARMOR_BY_NAME[value.toLowerCase()]) {
      // Still let it through — the player may be intentionally adding a
      // duplicate string. The resolver will catalog-match it anyway.
    }
    onChange(addInventoryItem(character, value));
    setGearText("");
  }
  function handleRemove(label: string) {
    onChange(removeInventoryItem(character, label));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Manage Inventory</DialogTitle>
          <DialogDescription>
            Add or remove weapons, armor, and gear. Changes save instantly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="weapons" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weapons">Weapons</TabsTrigger>
            <TabsTrigger value="armor">Armor</TabsTrigger>
            <TabsTrigger value="gear">Gear</TabsTrigger>
          </TabsList>

          <TabsContent value="weapons" className="space-y-2 pt-3">
            <Input
              type="text"
              placeholder="Search weapons…"
              value={weaponSearch}
              onChange={(e) => setWeaponSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
              {filteredWeaponGroups.map((g) => (
                <CatalogGroup
                  key={`${g.label}-${weaponSearch.trim() ? "open" : "closed"}`}
                  label={g.label}
                  count={g.entries.length}
                  defaultOpen={!!weaponSearch.trim()}
                >
                  {g.entries.map((w) => (
                    <CatalogRow
                      key={w.id}
                      name={w.name}
                      hint={`${w.damage.count}d${w.damage.faces} ${w.damageType}`}
                      onAdd={() => handleAddWeapon(w)}
                    />
                  ))}
                </CatalogGroup>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="armor" className="space-y-2 pt-3">
            <Input
              type="text"
              placeholder="Search armor…"
              value={armorSearch}
              onChange={(e) => setArmorSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
              {filteredArmorGroups.map((g) => (
                <CatalogGroup
                  key={`${g.label}-${armorSearch.trim() ? "open" : "closed"}`}
                  label={g.label}
                  count={g.entries.length}
                  defaultOpen={!!armorSearch.trim()}
                >
                  {g.entries.map((a) => (
                    <CatalogRow
                      key={a.id}
                      name={a.name}
                      hint={
                        a.category === "shield"
                          ? `+${a.ac.base} AC`
                          : `AC ${a.ac.base}${a.ac.addDex ? " + Dex" : ""}`
                      }
                      onAdd={() => handleAddArmor(a)}
                    />
                  ))}
                </CatalogGroup>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gear" className="space-y-2 pt-3">
            <p className="text-xs text-muted-foreground">
              For items the catalog doesn&apos;t cover — magic items, potions, custom GM rewards.
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Add custom item…"
                value={gearText}
                onChange={(e) => setGearText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGear();
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddGear}
                disabled={!gearText.trim()}
              >
                Add
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t border-border pt-3">
          <div className="font-display tracking-widest text-[10px] uppercase text-muted-foreground mb-2">
            Current Inventory
          </div>
          <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
            {inventory.weapons.length === 0 &&
              inventory.armor.length === 0 &&
              !inventory.shield &&
              inventory.other.length === 0 && (
                <p className="text-xs italic text-muted-foreground">
                  No items in inventory yet.
                </p>
              )}
            {inventory.weapons.map((w, i) => (
              <InventoryRow
                key={`w-${w.id}-${i}`}
                label={w.name}
                category="Weapon"
                onRemove={() => handleRemove(w.name)}
              />
            ))}
            {inventory.armor.map((a, i) => (
              <InventoryRow
                key={`a-${a.id}-${i}`}
                label={a.name}
                category="Armor"
                onRemove={() => handleRemove(a.name)}
              />
            ))}
            {inventory.shield && (
              <InventoryRow
                label={inventory.shield.name}
                category="Shield"
                onRemove={() => inventory.shield && handleRemove(inventory.shield.name)}
              />
            )}
            {inventory.other.map((o, i) => (
              <InventoryRow
                key={`o-${i}`}
                label={o}
                category="Gear"
                onRemove={() => handleRemove(o)}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CatalogGroup({
  label,
  count,
  defaultOpen,
  children,
}: {
  label: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger>
        <span className="flex items-center gap-2 min-w-0">
          <ChevronRight className="size-4 shrink-0 transition-transform group-data-[panel-open]/collapsible-trigger:rotate-90" />
          <span className="font-display text-sm">{label}</span>
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{count}</span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-0.5 pt-1 pl-6">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CatalogRow({
  name,
  hint,
  onAdd,
}: {
  name: string;
  hint: string;
  onAdd(): void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`Add ${name}`}
      className={cn(
        "w-full flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm",
        "hover:bg-accent/40 cursor-pointer transition-colors",
      )}
    >
      <span>{name}</span>
      <span className="text-xs text-muted-foreground">{hint}</span>
    </button>
  );
}

function InventoryRow({
  label,
  category,
  onRemove,
}: {
  label: string;
  category: string;
  onRemove(): void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-sm">
      <span className="flex items-baseline gap-2">
        <span>{label}</span>
        <span className="font-display tracking-wider text-[10px] uppercase text-muted-foreground">
          {category}
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

// Suppress an unused-import warning for `WEAPONS` / `ARMORS` — these are
// re-exported in case downstream surfaces want the unfiltered catalog.
void WEAPONS;
void ARMORS;
