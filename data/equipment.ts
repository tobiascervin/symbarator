// Minimal equipment lookup tables (PG p. 162–186).
// MVP: just enough vocabulary for the wizard and sheet to render
// the class equipment choices and a basic gear list.

export const ADVENTURING_PACKS = [
  "Burglar's pack",
  "Dungeoneer's pack",
  "Explorer's pack",
  "Scholar's pack",
  "Priest's pack",
  "Entertainer's pack",
] as const;

export const COMMON_WEAPONS = [
  "Dagger",
  "Quarterstaff",
  "Handaxe",
  "Shortsword",
  "Longsword",
  "Fencing sword (rapier)",
  "Greatsword",
  "Mace",
  "Warhammer",
  "Battleaxe",
  "Spear",
  "Light crossbow",
  "Heavy crossbow",
  "Hand crossbow",
  "Shortbow",
  "Longbow",
  "Sling",
] as const;

export const ARMOR = [
  "Padded",
  "Leather",
  "Studded leather",
  "Lacquered silk cuirass",
  "Hide",
  "Chain shirt",
  "Scale mail",
  "Breastplate",
  "Half plate",
  "Ring mail",
  "Chain mail",
  "Splint",
  "Plate",
  "Shield",
] as const;
