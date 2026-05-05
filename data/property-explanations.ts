// PG-sourced one-paragraph definitions for every weapon and armor property
// surfaced on the sheet. Wording is lifted near-verbatim from the Player's
// Guide (PG p. 167–168 weapons, p. 171 armor) so the tooltip on a property
// badge reads exactly like the rulebook entry. Keyed by the existing union
// types so a new `WeaponProperty` / `WeaponPropertyData["kind"]` /
// `ArmorProperty` member without an entry fails to compile.

import type {
  ArmorProperty,
  WeaponProperty,
  WeaponPropertyData,
} from "@/lib/character/types";

export interface PropertyExplanation {
  /** Display name shown above the explanation (e.g. "Two-Handed"). */
  name: string;
  /** PG page where this paragraph is sourced from. */
  pgPage: number;
  /** One-paragraph PG-sourced explanation. */
  description: string;
}

export const WEAPON_FLAG_EXPLANATIONS: Record<WeaponProperty, PropertyExplanation> = {
  finesse: {
    name: "Finesse",
    pgPage: 167,
    description:
      "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls.",
  },
  light: {
    name: "Light",
    pgPage: 168,
    description:
      "A light weapon is small and easy to handle, making it ideal for use when fighting with two weapons.",
  },
  heavy: {
    name: "Heavy",
    pgPage: 168,
    description:
      "Creatures that are Small or Tiny have disadvantage on attack rolls with heavy weapons. A heavy weapon's size and bulk make it too large for a Small or Tiny creature to use effectively.",
  },
  "two-handed": {
    name: "Two-Handed",
    pgPage: 168,
    description:
      "This weapon requires two hands when you attack with it. This property is relevant only when you attack with the weapon, not when you simply hold it.",
  },
  loading: {
    name: "Loading",
    pgPage: 168,
    description:
      "Because of the time required to load this weapon, you can fire only one piece of ammunition from it when you use an action, bonus action, or reaction to fire it, regardless of the number of attacks you can normally make.",
  },
  reach: {
    name: "Reach",
    pgPage: 168,
    description:
      "This weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for opportunity attacks with it.",
  },
  "deep-impact": {
    name: "Deep Impact",
    pgPage: 167,
    description:
      "This weapon is built such that a precise blow can cause extraordinary damage. If you score a critical hit with this weapon you double both the damage dice and the damage modifier.",
  },
  ensnaring: {
    name: "Ensnaring",
    pgPage: 167,
    description:
      "This weapon can wrap around limbs, temporarily pulling an enemy off balance. When you make a critical hit with one of these weapons, if the target is a creature it is knocked prone in addition to taking normal damage.",
  },
  massive: {
    name: "Massive",
    pgPage: 168,
    description:
      "Creatures that are Small or Tiny have disadvantage on attack rolls with massive weapons. A massive weapon's size and bulk make it too large for a Small or Tiny creature to use effectively. When rolling damage for a massive weapon, roll the damage die twice and take the better result. This applies only to the initial damage die, not any bonus damage.",
  },
  restraining: {
    name: "Restraining",
    pgPage: 168,
    description: "A successful hit with this weapon causes the restrained condition.",
  },
  returning: {
    name: "Returning",
    pgPage: 168,
    description: "If you miss with this weapon it returns to your hand.",
  },
  siege: {
    name: "Siege",
    pgPage: 168,
    description: "This weapon does double damage to structures.",
  },
  special: {
    name: "Special",
    pgPage: 168,
    description:
      "A weapon with the special property has unusual rules governing its use, explained in the weapon's description (see 'Special Weapons' later in this section).",
  },
  balanced: {
    name: "Balanced",
    pgPage: 167,
    description:
      "The weapon is so well balanced that it is extra effective when parrying. If you wield this weapon with a weapon in the other hand increase your AC by 1.",
  },
  concealed: {
    name: "Concealed",
    pgPage: 167,
    description:
      "This blade can be hidden on a creature's body, underneath clothes or armor. Make a Dexterity (Sleight of Hand) check when you hide it, and compare against passive Perception or an active search as needed.",
  },
  immobile: {
    name: "Immobile",
    pgPage: 168,
    description:
      "Setting up this weapon or breaking it down can only be done outside of combat (several hours usually).",
  },
};

export const WEAPON_DATA_EXPLANATIONS: Record<
  WeaponPropertyData["kind"],
  PropertyExplanation
> = {
  thrown: {
    name: "Thrown",
    pgPage: 168,
    description:
      "If a weapon has the thrown property, you can throw the weapon to make a ranged attack. If the weapon is a melee weapon, you use the same ability modifier for that attack roll and damage roll that you would use for a melee attack with the weapon.",
  },
  ammunition: {
    name: "Ammunition",
    pgPage: 167,
    description:
      "You can use a weapon that has the ammunition property to make a ranged attack only if you also have an appropriate type of ammunition to fire from the weapon. Each time you attack with the weapon, you expend one piece of ammunition. At the end of the battle, you can recover half your expended ammunition by taking a minute to search the battlefield.",
  },
  range: {
    name: "Range",
    pgPage: 168,
    description:
      "A weapon that can be used to make a ranged attack has a range shown in parentheses after the ammunition, ranged or thrown property. The first number is the weapon's normal range in feet, and the second is the weapon's long range. When attacking a target beyond normal range you have disadvantage on the attack roll.",
  },
  versatile: {
    name: "Versatile",
    pgPage: 168,
    description:
      "This weapon can be used with one or two hands. A damage value in parentheses appears with the property — the damage when the weapon is used with two hands to make a melee attack.",
  },
  area: {
    name: "Area Effect",
    pgPage: 167,
    description:
      "This weapon's ammunition explodes. Instead of making an attack roll, the user designates an area and each creature in the area makes a Dexterity saving throw with the DC equal to 8 + the user's proficiency bonus plus their attack modifier. The target takes full damage and a successful save means that they take no damage.",
  },
};

export const ARMOR_FLAG_EXPLANATIONS: Record<ArmorProperty, PropertyExplanation> = {
  concealable: {
    name: "Concealable",
    pgPage: 171,
    description: "This armor can be worn under normal clothing.",
  },
  cumbersome: {
    name: "Cumbersome",
    pgPage: 171,
    description:
      "This armor is unwieldy and you have disadvantage on all Dexterity checks while wearing it.",
  },
  noisy: {
    name: "Noisy",
    pgPage: 171,
    description:
      "This armor tends to rattle or otherwise make loud sounds. You have disadvantage on any Dexterity (Stealth) checks involving hearing.",
  },
};

export const WEIGHTY_EXPLANATION: PropertyExplanation = {
  name: "Weighty",
  pgPage: 171,
  description:
    "This armor is especially heavy; you must have a Strength score equal to or higher than the number given in parentheses or reduce your speed by 10 feet.",
};
