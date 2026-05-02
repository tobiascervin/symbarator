// Background sub-origins from PG p. 46–93.
// Each background lists skill/tool grants, equipment, a feature, and the
// d8 personality / d6 ideal / d6 bond / d6 flaw roll tables used at step 7.

import type { BackgroundDef } from "@/lib/character/types";

const ANY_TOOLS = { id: "any-tool", label: "Any one set of tools" };
const ANY_ARTISAN = { id: "any-artisan", label: "Any artisan's tools" };

export const BACKGROUNDS: ReadonlyArray<BackgroundDef> = [
  // -------- Abducted Human ------------------------------------------------
  {
    id: "runaway",
    originId: "abducted-human",
    name: "Runaway",
    description:
      "For curiosity, home-sickness, or abuse, the abductee chose to flee the Iron Pact for the realm of humans — a stranger of a special sort.",
    skillProficiencies: ["nature"],
    toolChoices: {
      count: 1,
      from: [
        { id: "cobblers", label: "Cobbler's tools" },
        { id: "cooks", label: "Cook's utensils" },
        { id: "leatherworkers", label: "Leatherworker's tools" },
        { id: "weavers", label: "Weaver's tools" },
      ],
    },
    equipment: "A kit to match your tool, leather clothes and 1d6 ortegs.",
    feature: {
      name: "Bushcraft",
      description:
        "DC 10 Wisdom (Survival) finds enough food and water for you (and up to 5 others, +1 DC each) in the wilds — provided the group is not on the move.",
    },
    tables: {
      personalityTraits: [
        "I listen to learn, I speak only when I have to.",
        "Life is short and I want to master one thing — this is what I focus on.",
        "I can adapt to any situation, and I love seeking out new places and people to learn from them.",
        "I am slow to trust and I have few friends. However, I never let a friend down.",
        "I always find a leader to follow; I do not function well on my own.",
        "I speak my mind and expect others to do the same.",
        "I look for patterns in the chaos of everyday life; I follow randomness far enough and find it tied to fate.",
        "I know I will not live long, and I am at peace with this knowledge.",
      ],
      ideals: [
        "Sacrifice. I am not important; the struggle against Darkness is.",
        "Service. Freedom is empty — meaning comes from my obligations to others.",
        "Nature. Civilization is just a stop on the way to Darkness.",
        "Fatalism. We do not have to win, we only have to fight.",
        "Vengeance. The dark deeds of the past must be washed away with the blood of the wicked.",
        "Transcendence. The grand forces just are; accepting all is the way to a full and free life.",
      ],
      bonds: [
        "I am compelled to protect changelings — they represent a missing part of me.",
        "The secrets of Davokar must not fall into the wrong hands.",
        "I have sworn to hunt down creatures of Corruption.",
        "My elven parents are lost, and I need to find them.",
        "My travel companions are the family I never really had.",
        "I must find my human parents to become whole again.",
      ],
      flaws: [
        "I was raised by elves, so my plans are always better than non-elven ones.",
        "I long for recognition from elves and will do anything to get it.",
        "I resent elves for taking my human life away from me.",
        "I resent my parents and humans for allowing me to be taken by the elves.",
        "I do not know who I am, I feel like a stranger everywhere.",
        "I feel a rage in me, like an echo of the Corruption of Davokar.",
      ],
    },
  },

  // -------- Changeling ----------------------------------------------------
  {
    id: "broken-home",
    originId: "changeling",
    name: "Broken Home",
    description:
      "When you were revealed as a changeling, your family fractured. You moved forward, taking solace in a found family.",
    skillProficiencies: [],
    skillChoices: {
      count: 1,
      from: ["athletics", "acrobatics", "history", "nature"],
    },
    toolChoices: { count: 1, from: [ANY_TOOLS] },
    equipment: "A kit to match your tool, clothes, 2d6 + 3 shillings.",
    feature: {
      name: "Open Senses",
      description:
        "On a Wisdom (Insight or Perception) check, you can focus your senses to give yourself advantage. Recharges on a short or long rest.",
    },
    tables: {
      personalityTraits: [
        "I am curious about everything elven, changeling, or Iron Pact-related.",
        "I will likely do the opposite of what people expect, just to show who runs my life.",
        "I am cautious, always expecting people to abandon or turn on me.",
        "I prefer animals to other supposedly intelligent creatures.",
        "I can't handle praise — something bad will surely follow.",
        "I speak my mind, no matter what.",
        "I keep a bug-out bag nearby at all times, always prepared to run.",
        "I am thankful for the smallest things; everything is better than where I come from.",
      ],
      ideals: [
        "Independence. I was left here to my own devices; I will follow my own path through life.",
        "Truth. My childhood was a lie, but my life won't be.",
        "Friendship. The world is horrible — close friends are all you can count on.",
        "Wealth. The wealthy rule the world, and I will be one of them.",
        "Passion. Our feelings are both compass and destination.",
        "Kindness. No one can make it without help from others.",
      ],
      bonds: [
        "Someone saved me from the mob. I am forever bound to this person.",
        "One of my 'human family' did not give up on me even when my true heritage was revealed.",
        "I seek the elf who swapped me for who I should have been. I will demand an explanation.",
        "I am a dedicated member of one of the world's factions; I cannot imagine living without them.",
        "Somewhere out there is a human whose childhood I lived. We must meet to become whole.",
        "I am sworn to help and protect changelings everywhere.",
      ],
      flaws: [
        "I don't really trust anyone; I assume they will leave when I need them most.",
        "I've always felt different and special; now I know why.",
        "Humans are no longer worth my time.",
        "I despise elves and enjoy seeing them struggle.",
        "I abandoned my earlier 'friends', and they are now out to get me.",
        "I am envious of those who have more than me in life.",
      ],
    },
  },
  {
    id: "mages-assistant",
    originId: "changeling",
    name: "Mage's Assistant",
    description:
      "A mystic, intrigued by your fey nature, took you on as apprentice. You may have been the best-treated child in your village.",
    skillProficiencies: ["arcana"],
    toolChoices: {
      count: 1,
      from: [
        { id: "alchemists", label: "Alchemist's supplies" },
        { id: "glassblowers", label: "Glassblower's tools" },
        { id: "disguise-kit", label: "Disguise kit" },
        { id: "herbalism-kit", label: "Herbalism kit" },
      ],
    },
    equipment: "A kit to match your tool, robes and 1d6 + 4 thalers.",
    feature: {
      name: "Student of Magic",
      description:
        "You have practiced both magic and the danger of Corruption. Your Corruption Threshold is 1 higher than it would otherwise be.",
    },
    tables: {
      personalityTraits: [
        "I seek out the company of mystics whenever I can.",
        "I chose the opposing view in discussions, just to make it more interesting.",
        "I keep my knowledge to myself, unless it's needed for survival.",
        "I share my magical insights with everyone, whether they ask for it or not.",
        "If a problem can be solved by using magic, I will use magic.",
        "I am careful to only use magic when it is really needed, preferring mundane methods if at all possible.",
        "I talk too loud and stand too close to people when I do it. Feels perfectly normal to me.",
        "I can't keep my mind on the topic at hand; I always find a more interesting tangent to explore.",
      ],
      ideals: [
        "Study. Nothing about my personal history matters, only learning more magic.",
        "Purity. I must keep my body and soul free from Corruption.",
        "Fight fire with fire. Corruption is a gift; we must use it to win.",
        "Power. With enough magic I can do whatever I want, and no one can stop me.",
        "Common good. Magic should be used to better society for all.",
        "Legacy. I will transmit all I have learned to the next generation.",
      ],
      bonds: [
        "The mystic who brought me here saved my life.",
        "I feel a calling toward the forest, despite my fears.",
        "I carry something from my childhood, to remind me of simpler days.",
        "I feel a connection with magic itself, more important than any person.",
        "I have a tome of study that I always keep within me — it changed my whole worldview.",
        "I remember my 'sibling' weeping when my nature was discovered. I keep that memory forever.",
      ],
      flaws: [
        "I deserve an explanation for my life, even if it must be written in blood.",
        "I know magic will be the end of me, but I can't stop longing for more of it.",
        "I am caught between human and elven ways and will never feel at home.",
        "When people call me names, I am tempted to believe them.",
        "I want to grow so strong in magic that no one dares question me.",
        "I am superior to humanity and that is why they are afraid of me.",
      ],
    },
  },

  // -------- Dwarf ---------------------------------------------------------
  {
    id: "dreams-of-doom",
    originId: "dwarf",
    name: "Dreams of Doom",
    description:
      "You are haunted by nightmares of doom and death. You left to seek the meaning of these dreams and to avert disaster.",
    skillProficiencies: ["insight"],
    toolChoices: { count: 1, from: [ANY_TOOLS] },
    equipment: "A kit to match your tool, simple clothes, 4d6 + 1 shillings.",
    feature: {
      name: "Haunted",
      description:
        "On a long rest, gain a prophecy die (d6). Before any skill check, declare the dream reminds you of the situation and add the d6 to the roll. Recharges on long or extended rest.",
    },
    tables: {
      personalityTraits: [
        "I finish people's sentences.",
        "I sometimes stop mid-sentence as I sense a vision coming over me.",
        "I am as carefree as only one who has truly accepted death can be.",
        "I often remind people that all is as it is meant to be.",
        "When people get too happy, I tell them about my visions of doom.",
        "I talk a lot to drown out the voices in my head.",
        "I argue out loud with the spirits that haunt me.",
        "I keep silent so as not to speak about the horrible things I see.",
      ],
      ideals: [
        "Accuracy. There is no point in speaking to others unless you can be precise.",
        "Fate. All is as it must be; all will become what it is meant to be.",
        "The End is Near. Prepare for the end, because it is coming.",
        "Hope. In a world of certain doom, hope is all we can cling to.",
        "Stoicism. I balance the brutal facts of existence with the faith that we will prevail.",
        "Simplicity. Surrender your false needs. Work, eat, sleep. That is all.",
      ],
      bonds: [
        "A doom haunts me, and I must prevent it from happening.",
        "I have a role to play in the realization of a beautiful vision.",
        "I will not make it, but I will make sure my friends do.",
        "To die well is the only meaningful choice.",
        "I gave my word once, and I will honor it till my last breath.",
        "I will chronicle the last struggle of the world, and to do that I must survive at all costs.",
      ],
      flaws: [
        "I struggle with the dreadful sense that nothing really matters.",
        "I expect bad things to happen and often miss the good in life.",
        "I keep my distance from people I like, the thought of losing them hurts too much.",
        "In my despair I make everything about me.",
        "I secretly fear that my visions are nothing but a dark version of delusions of grandeur.",
        "I don't understand why you'd only have one ale, when you can have all of them.",
      ],
    },
  },
  {
    id: "life-debt",
    originId: "dwarf",
    name: "Life-debt",
    description:
      "An outsider saved your life without asking for anything. To repay this is the worst disgrace a dwarf could face.",
    skillProficiencies: [],
    skillChoices: {
      count: 1,
      from: ["history", "insight", "medicine", "nature"],
    },
    toolChoices: { count: 1, from: [ANY_TOOLS] },
    equipment: "A kit to match your tool, simple clothes, 2d6 + 3 shillings.",
    feature: {
      name: "Driven",
      description:
        "When you fail a saving throw, you can choose to have a second chance at it (rolling again, applying any bonuses or penalties). Once per extended rest.",
    },
    tables: {
      personalityTraits: [
        "Time away from family and related duties is not all bad; I'll make the most of it.",
        "I long for the day when I can return home to my kin.",
        "I'll show these long-shanks what a dwarf can do.",
        "The world is so much larger and more wondrous than I ever imagined.",
        "I'll bide my time until I can repay my debt in full.",
        "I actually like the creature I am indebted to — but I will never admit it openly.",
        "I will repay my debt, and until that time comes I will make my creditor regret making me come along on this demented quest.",
        "I stoically accept my fate, whatever that will be. Or at least that's what I pretend.",
      ],
      ideals: [
        "Pride. Slights not punished will stick to you forever.",
        "Tradition. We used to do things a certain way, and it was always superior to this madness.",
        "Duty. I will do what is asked of me, on pain of death.",
        "Companionship. Blood trumps everything, but this lot is not all bad either.",
        "Greed. I promised to save their lives, not share treasure with them.",
        "Fame. I will return to my family with a fearsome reputation.",
      ],
      bonds: [
        "I will not leave the side of the person to whom I owe a life-debt.",
        "I need to find the love of my life, life-debt or not.",
        "My family's enemies are out there, and if I can somehow get this lot to help me fight them, even better.",
        "I must unravel the mystery of my people's origin.",
        "I dream of reinvigorating my people; we are so much more than this.",
        "There is a darkness gathering in the world, and we will all have to fight it in the end.",
      ],
      flaws: [
        "The person to whom I owe the life-debt has stolen my own life.",
        "I seek to repay this life-debt as soon as possible and create reckless situations to that end.",
        "I love my new life and secretly hope that my life-debt is never repaid.",
        "I am more concerned with the well-being of one other in my company than the one to whom I owe the life-debt.",
        "Life-debt, life-schwebt, dumber tradition does not exist. How do I get out of this mess?",
        "I will repay the life-debt, but no one said I need to be sober doing it.",
      ],
    },
  },
  {
    id: "outcast",
    originId: "dwarf",
    name: "Outcast",
    description:
      "You behaved disloyally; for this you are banished. To most dwarves, exile is a punishment worse than death.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["deception", "persuasion"] },
    toolChoices: { count: 1, from: [ANY_ARTISAN] },
    equipment: "A kit to match your tool, thick working clothes, 1d6 + 4 shillings.",
    feature: {
      name: "Quick Learner",
      description:
        "If asked to use tools you are not proficient with, you can determine the most efficient way to use them. Add half your proficiency bonus (rounded down) to ability checks made with the new tools.",
    },
    tables: {
      personalityTraits: [
        "Since I am exiled, the old rules do not apply to me. I try to speak with strangers, though it often goes wrong.",
        "I stick to the old ways, regardless.",
        "I treat my new companions like a substitute for my family. I will hurt anyone who looks weird at them.",
        "I will go to great lengths to avoid other dwarves.",
        "I am certain that I was given a purpose in life, and this is not it.",
        "When you can't forget anything, sometimes you must be very cautious in what you say.",
        "I expect everyone to play by the rules that I know, even though I don't tell anyone that.",
        "There is no accounting for the other peoples — they are not dwarves.",
      ],
      ideals: [
        "Family. I hope to accomplish something that will allow them to forgive me.",
        "Righteousness. What I did had to be done and I do not regret my choices.",
        "Vengeance. Family or not — if you come at me or mine, be prepared to pay.",
        "Forgiveness. I realize my old life was wrong, and I seek forgiveness from the grander world.",
        "Dwarven superiority. I will fight for dwarves everywhere, regardless if my own people want me or not.",
        "A worthy end. I will find a worthy way to end this miserable existence, and hope my final act will be worthy of remembrance.",
      ],
      bonds: [
        "I did what I did to keep someone else safe. As long as they are unharmed I can withstand anything.",
        "I have replaced my family with a new group, and given them my all.",
        "My exile was the fault of someone else, and this someone will pay.",
        "I have a recurring dream where dwarves play a huge role in the fight against the mounting darkness. I will not back down from that battle.",
        "Part of my family is lost, and I need to find them.",
        "When I was young, I heard of a legendary dwarven artifact. I seek it.",
      ],
      flaws: [
        "No one deserves an explanation for my actions; no one can judge me.",
        "I am a dwarf, and no one is above me.",
        "I have a book where every insult towards me is chronicled. I will never forget.",
        "I am so afraid; this world with no family makes no sense to me.",
        "I actually like these other people; they can never know or they will use it against me.",
        "Returning to my family is worth every non-dwarf life I encounter.",
      ],
    },
  },

  // -------- Elf -----------------------------------------------------------
  {
    id: "avenger",
    originId: "elf",
    name: "Avenger",
    description:
      "You and your kin were ambushed; you alone survived. As lone survivor you may feel guilty and will not return home before the traitor pays.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["athletics", "acrobatics"] },
    toolChoices: {
      count: 1,
      from: [
        { id: "gaming-set", label: "Gaming set" },
        { id: "musical", label: "Musical instrument" },
      ],
    },
    equipment: "A kit to match your tool, supple leather clothes, 4d6 + 1 ortegs.",
    feature: {
      name: "Tracker",
      description:
        "When in a wilderness area pursuing a creature you have seen before, you have advantage on the first Wisdom (Survival) check of the day to follow their tracks.",
    },
    tables: {
      personalityTraits: [
        "I am curious about the world outside the forest — it's curious, but not really important.",
        "How can all these people not be aware that there is a war on Corruption going on?",
        "These short-lived folk intrigue me more than I care to admit.",
        "I conserve my breath and strength until it is needed.",
        "I stay in the shadows as I seek my prey.",
        "I pretend to be casual and calm, but this place terrifies me.",
        "The killers of my kin are out to get me too, I am sure of it.",
        "I need information and will trade what I know for it.",
      ],
      ideals: [
        "Justice. It is only right to bring death to those who have killed others.",
        "Knowledge. I must know why my quarry did what they did; I am owed an explanation.",
        "Nature. Defending the forest against ignorance and willful damage is all that matters.",
        "Duty. We will not succeed in defeating the darkness, but our valiant struggle will echo through eternity.",
        "Finesse. Nothing is worth doing unless done with style — vengeance in particular should have a certain dash to it.",
        "Redemption. I do not know if my failure to protect my kin can ever be redeemed; if it can I will find out, and then I will spend the rest of my days trying.",
      ],
      bonds: [
        "I feel closer to the person I am tracking than to almost anyone else.",
        "The oath of the Iron Pact feels as real to me as the day I first spoke it.",
        "My new companions are not that bad; I would consider risking my life to save some of them.",
        "My bow has special meaning to me, and I long for the person that gave it to me.",
        "Animals have always felt as close to me as other elves. I will not see them harmed.",
        "All of the old peoples have a special place in my heart. Humans not so much.",
      ],
      flaws: [
        "I won't leave the trail, even for the best of reasons.",
        "Besting my quarry is more important than the health of anyone I travel with.",
        "My quarry scares me senseless, and I am not sure if I can face it.",
        "I fear I will again let my companions down, and survive.",
        "Non-elven plans are worse than mine, for obvious reasons.",
        "One of my companions has my heart, and I will forgo more important actions to keep them safe from even the slightest harm.",
      ],
    },
  },
  {
    id: "exile",
    originId: "elf",
    name: "Exile",
    description:
      "You acted against the rules of the collective. Maybe you are one of these. Or your exile is self-imposed, a result of feeling as if you had been disloyal or dishonorable.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["deception", "intimidation", "performance"] },
    toolChoices: {
      count: 1,
      from: [
        { id: "carpenters", label: "Carpenter's tools" },
        { id: "tinkers", label: "Tinker's tools" },
        { id: "weavers", label: "Weaver's tools" },
        { id: "woodcarvers", label: "Woodcarver's tools" },
      ],
    },
    equipment: "A kit to match your tool, elvish clothing, 1d6 ortegs.",
    feature: {
      name: "Unpredictable",
      description:
        "After you roll initiative, but before combat begins, you can choose to change your initiative count to any number smaller than your result, to a minimum of your Dexterity modifier.",
    },
    tables: {
      personalityTraits: [
        "I try to surprise everyone with what I say; it amuses me.",
        "I often feel my personal loss deeply, but hide it from others.",
        "I feel a wanderlust that I can't suppress; I need to know what's over the next hill.",
        "I avoid elves, and all things elven; it reminds me of a dark time.",
        "I am drawn to changelings and other elven things; they remind me of home.",
        "I hide my elven features as best I can, better if people think me a changeling.",
        "I make other people's problems my own, perhaps to keep the loneliness at bay.",
        "My curiosity gets me in trouble, but I just can't help myself.",
      ],
      ideals: [
        "Promises. I have guaranteed myself that I will once again take my rightful place.",
        "Exploration. I am seeking a secret place and will keep looking into dark holes until I find it.",
        "Survival. I am more concerned with not losing, than with winning; live to fight another day, I say.",
        "Mercy. Everyone — and everyTHING — deserves another chance. It's the only hope for good in this world.",
        "Knowledge. What is not known will be penned by my hand.",
        "Elven superiority. I am an elf; most others are not. They should not forget that.",
      ],
      bonds: [
        "I made my decision for the sake of others; my personal feelings do not come into it.",
        "I have heard stories of a legendary exile; I seek to emulate them.",
        "I have a book or other ancient thing that tells of a lost place.",
        "I made one last oath before leaving home, and I intend to keep that promise.",
        "I long for my family, and would do anything to protect them if something threatened them.",
        "Someone helped me when I first stumbled out of the forest; I owe this person a lot.",
      ],
      flaws: [
        "I sometimes allow my doubts to overwhelm me and make me indecisive.",
        "I rarely stop and listen long enough to learn anything new; I have to discover things for myself.",
        "Since I made that huge mistake, I refuse to make any other decisions.",
        "I will do almost anything to impress someone in the hope that they can get my exile reversed.",
        "I secretly feel special and am easy to manipulate for those who play on this feeling.",
        "I am jealous of those who have a special someone; I will be happy if they break up.",
      ],
    },
  },
  {
    id: "mediator",
    originId: "elf",
    name: "Mediator",
    description:
      "You have been sent to establish relations with a group of humans and try to teach them about the value of the forest and the dangers of exploration.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["history", "insight", "performance", "persuasion"] },
    toolChoices: { count: 1, from: [{ id: "musical", label: "Any musical instrument" }] },
    equipment: "The musical instrument, elven clothes, 4d6 + 1 shillings.",
    feature: {
      name: "Orator",
      description:
        "Your strength with words is such that you can make enemies hesitant to attack you. If the enemy can hear and understand you, and you have spoken within 1 minute before combat begins, then those enemies have disadvantage on their initiative rolls.",
    },
    tables: {
      personalityTraits: [
        "I believe in peace but that doesn't mean I am not prepared for war.",
        "Even the lowest mortal has a story worth listening to.",
        "It is not about winning or losing, it is about having the best meeting possible.",
        "I have been doing this a while and I'm starting to see the same old faces, time and time again.",
        "I do this because I was ordered to do it, just so everyone knows.",
        "Just because I listen does not mean others get to decide what the best course of action is.",
        "Everyone lies to themselves sometimes. Everyone knows the truth also.",
        "War and diplomacy are the two sides of the same coin.",
      ],
      ideals: [
        "Discussion. If we can get leaders to the table there is always room to negotiate.",
        "Rule of Law. The law of the Iron Pact still applies, no matter how old it is.",
        "Trouble. If I know what makes you upset, I also know what makes you happy.",
        "Self-perfection. I am actually here to learn more about myself; mediating in conflict is the best way to get to know oneself.",
        "Pragmatism. I am okay with dodging the truth to reach a lasting peace.",
        "Wisdom. Some conflicts will not get solved, I accept that and move on to the next one.",
      ],
      bonds: [
        "My mentor gave me hope in this process but now they are lost to me.",
        "Every time I meet others for the first time I feel a warmness in my heart.",
        "I have a treasured old book that tells of various ancient agreements and meetings.",
        "I am smitten by the representative for one of the warring factions.",
        "The Iron Pact must hold, at any cost.",
        "I do this for the light I see in humanity; it's all for them.",
      ],
      flaws: [
        "I am so certain that a good speech will fix any dispute that I am often surprised by violence.",
        "I am certain that my proposal is the best of all possible ideas.",
        "Secretly, I wish that others would shut up and listen to me.",
        "Deep down I think that war is inevitable; we should strike the first blow.",
        "I fear that nothing I do will make a difference in the end.",
        "I am unconcerned with the price paid by non-elves.",
      ],
    },
  },
  {
    id: "scout",
    originId: "elf",
    name: "Scout",
    description:
      "You have been sent to gather knowledge, to assess the enemy's strengths and weaknesses before the battle that is sure to come.",
    skillProficiencies: ["stealth"],
    toolChoices: {
      count: 1,
      from: [
        { id: "carpenters", label: "Carpenter's tools" },
        { id: "masons", label: "Mason's tools" },
      ],
    },
    equipment: "A kit to match your tool, thick working clothes, 1d6 + 4 shillings.",
    feature: {
      name: "Adept of the Wild",
      description:
        "When you are in a wilderness area, you can choose to take advantage on your Dexterity (Stealth) check. If you do, you can't use this feature again until you take a short or longer rest.",
    },
    tables: {
      personalityTraits: [
        "I can understand the language of the forest better than anyone else.",
        "I pretend to enjoy the company of my enemies. It was way easier than I thought it would be.",
        "I have a hard time hiding my hatred for the enemy; I must keep my distance from them.",
        "Some on the opposing side are very good, I will learn from them.",
        "I pretend to be a trapper with no agenda other than earning money for my family.",
        "I walk and talk like a monster-hunter, it gives me access to places.",
        "I am amazed by the world, I sometimes almost forget my mission.",
        "I prefer the company of animals and often talk to them.",
      ],
      ideals: [
        "Tranquility. I try to co-exist with nature instead of making nature adapt to my presence.",
        "Observation. So many go through life without paying attention to what is happening beneath their feet and all around them.",
        "Testing. I will take any chance to sharpen my skills; one day all will depend on them.",
        "From the shadows. I want to shape things without being seen as the one doing the changing.",
        "Oathbound. I am the embodiment of my oath. Without it I am nothing.",
        "My enemy's enemy. I am willing to find common cause with lesser evils in order to destroy the main threat.",
      ],
      bonds: [
        "Someone taught me how to hunt and track. I owe them my entire life's work.",
        "There is an animal in the forest that I have seen more than once. I may never catch it, but I will always seek it out.",
        "I carry a bone with me. You will not see it, and if you do, I will not explain it.",
        "I keep my word, always. I also rarely give it.",
        "I will not let my prey get away.",
        "I speak bluntly and accept the consequences.",
      ],
      flaws: [
        "I am impatient and rude to those without wilderness skills.",
        "I never explain myself.",
        "If I am talking to any non-elf, I speak slowly and simply. How could they understand more?",
        "I do not count the cost to others when fighting the true enemy.",
        "I fear I might not be able to go all the way.",
        "I know I will die in this fight, and am given to bouts of fatalistic apathy.",
      ],
    },
  },

  // -------- Goblin --------------------------------------------------------
  {
    id: "goblin-laborer",
    originId: "goblin",
    name: "Laborer",
    description:
      "You earn your scraps doing the dirty work nobody else will — draining marshes, emptying latrines, scaling rotten scaffolds in Thistle Hold.",
    skillProficiencies: ["athletics"],
    toolChoices: { count: 1, from: [ANY_ARTISAN] },
    equipment: "A kit to match your tool, work clothes and 1d6 + 4 ortegs.",
    feature: {
      name: "Patient Drudge",
      description:
        "You can stand long, dull, dangerous tasks better than any tall-folk. You have advantage on saves to resist exhaustion from forced labor or repetitive effort.",
    },
    tables: {
      personalityTraits: [
        "I keep my head down and my hands moving.",
        "I joke loudly to make the work go faster — sometimes the joke is at someone's expense.",
        "I see everything; people forget I'm there.",
        "I save every coin, every scrap, every nail.",
        "I admire the big folk and try to copy their ways.",
        "I have nicknames for every person I work for, and not nice ones.",
        "I sing while I work, even when I shouldn't.",
        "I always know where the back door is.",
      ],
      ideals: [
        "Endurance. The day ends when the work ends.",
        "Solidarity. Goblins look out for goblins.",
        "Comfort. I work hard so I can sleep warm.",
        "Up. One day I will not be a laborer.",
        "Memory. The mistreated remember everything.",
        "Joy. Even the ditch can be sung over.",
      ],
      bonds: [
        "There's a child in my home who depends on what I send back.",
        "I owe a foreman who once stood up for me.",
        "I have a beloved tool I will never lose.",
        "A goblin friend disappeared into Davokar; I'll find them.",
        "My clan trusts me to remember its songs.",
        "A tall-folk taught me to read; I won't forget.",
      ],
      flaws: [
        "I steal small things, always.",
        "Drink ruins me before I notice.",
        "I am too proud to ask for help.",
        "I trust kind words and get burned.",
        "I will lie about anything to avoid trouble.",
        "I hate idleness and bother those who rest.",
      ],
    },
  },
  {
    id: "goblin-convert",
    originId: "goblin",
    name: "Convert",
    description:
      "You were brought up at the convent school, where a handful of patient monks have committed themselves to saving whatever soul resides in a goblin.",
    skillProficiencies: ["religion"],
    toolChoices: { count: 1, from: [{ id: "calligraphers", label: "Calligrapher's supplies" }] },
    equipment: "Holy symbol of Prios, simple clothes, 1d6 + 2 ortegs.",
    feature: {
      name: "Convent-trained",
      description:
        "You can read and write Ambrian. You may invoke the protection of the Sun Church for free shelter at any temple of Prios — provided you do not bring trouble to its doors.",
    },
    tables: {
      personalityTraits: [
        "I quote Prios at every opportunity.",
        "I cross myself before every dangerous task.",
        "I correct others' theology, however gently.",
        "I am always the first to volunteer for hard tasks.",
        "I was small among the small; I treasure being seen.",
        "I confess every doubt, out loud.",
        "I see signs and omens everywhere.",
        "I am ferociously polite.",
      ],
      ideals: [
        "Salvation. Even a goblin can be saved.",
        "Service. The Sun shines for those who serve.",
        "Light. Corruption is the night; we are the dawn.",
        "Penitence. I owe more than I can ever pay.",
        "Mission. There is a world to convert.",
        "Mercy. A wise priest taught me; now I teach others.",
      ],
      bonds: [
        "A monk pulled me from a gutter and named me.",
        "I carry a worn prayer book; it is everything.",
        "I owe my education to the convent and will defend it.",
        "I dream of a goblin saint and seek their relics.",
        "I miss my old clan and pray for them.",
        "A fellow convert is in danger; I must reach them.",
      ],
      flaws: [
        "I judge sin in others before I see my own.",
        "I am terrified of falling into old goblin ways.",
        "I trust priests more than I should.",
        "I cannot abide blasphemy, which causes fights.",
        "I am secretly proud of being saved.",
        "I sermon when I should listen.",
      ],
    },
  },
  {
    id: "wild",
    originId: "goblin",
    name: "Wild",
    description:
      "You and your clan stayed away from both the Ambrians and barbarians by sticking to the darker parts of Davokar. The forest is changing and you've decided to explore.",
    skillProficiencies: ["nature"],
    toolChoices: {
      count: 1,
      from: [
        { id: "carpenters", label: "Carpenter's tools" },
        { id: "leatherworkers", label: "Leatherworker's tools" },
        { id: "potters", label: "Potter's tools" },
        { id: "weavers", label: "Weaver's tools" },
      ],
    },
    equipment: "A kit to match your tool, scant clothes and 2d6 + 8 ortegs.",
    feature: {
      name: "Go to Ground",
      description:
        "If you're in the wilderness you can always find a hiding place. You can have advantage on a Dexterity (Stealth) check as part of your Hide action. Recharges on a short or longer rest.",
    },
    tables: {
      personalityTraits: [
        "I am now realizing that the world is much bigger than I thought.",
        "I think that being free is the best way to be and will share that with everyone.",
        "I will become a troll someday, so you better treat me with respect.",
        "I only have a few years to experience everything, so let's go.",
        "I want to know what is important because everyone has a different answer.",
        "I invite others to play goblin games, but almost nobody wants to join in.",
        "I have a pet that I talk to, what's weird about that?",
        "I cast bones to help me make decisions. They're my uncle's bones, very wise goblin he was.",
      ],
      ideals: [
        "Fear. If you're scared of everything you are always cautious.",
        "Wonder. Learn something new every day or you have wasted your time.",
        "Nature. Nothing built by people compares to the truly wild places of the world.",
        "Might makes right. I have learned the lesson well, and soon it's my turn.",
        "Chaos. Randomness favors the underdog, so I maximize chaos wherever I can.",
        "Greed. What better legacy than a golden statue of the greatest goblin that ever lived?",
      ],
      bonds: [
        "I keep a vision in my head of my little nook in the forest. I'm going back there someday.",
        "I made a promise and I will keep that promise, no matter how foolish others think me.",
        "I am convinced the gods love me, and I will not let them down.",
        "I swore to lead my people to a better place, and this I will do.",
        "Someone saved my bony behind and I am forever in that person's debt.",
        "I have an animal that I love, and will always protect.",
      ],
      flaws: [
        "No one that knows me would confuse me for being civilized. At all.",
        "I crave attention, and will get it, one way or another.",
        "Eating the hearts of my enemies will make me live longer.",
        "There is something about fire, I can't explain it, it just speaks to me.",
        "Dressing like powerful people will make me more like them.",
        "Kleptomaniac, klepto-schmeniak. I love shiny things, that's all.",
      ],
    },
  },

  // -------- Human ---------------------------------------------------------
  {
    id: "common-folk",
    originId: "human",
    name: "Common Folk",
    description:
      "You are a member of the largest group of humans — those who work every day for their food and board.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["animal-handling", "athletics", "nature", "survival"] },
    toolChoices: { count: 1, from: [ANY_ARTISAN] },
    equipment: "A kit to match your tool, common clothing, 2d6 + 8 ortegs.",
    feature: {
      name: "Close to the Earth",
      description:
        "If you spend a moment considering it, you can predict the weather for the next 24 hours with great accuracy. You also know the current phase of the moon to the day, and the number of days until the next solstice or equinox.",
    },
    tables: {
      personalityTraits: [
        "I am content with very little.",
        "I dream big and talk even bigger.",
        "I let my hands do the talking, both in work and in arguments.",
        "I am careful not to offend anyone important.",
        "I bow to no one, noble or not.",
        "I make talismans for luck, for friends too if they want them.",
        "I draw extensive conclusions about people's character from their looks.",
        "I often start sentences with 'back home...'",
      ],
      ideals: [
        "Cycles. There is a time for everything.",
        "Simplicity. It is better for the mind to keep things clean and uncluttered.",
        "Worthiness. Those folks who work for what they have appreciate it more than those who are just given things.",
        "Work. I will work harder and longer than everyone else, and get out of here.",
        "Revolution. The rich live off the work of the poor. Time to change that.",
        "Modesty. Don't think you are something special; I certainly am not.",
      ],
      bonds: [
        "I love my simple background and the honest people there; I will always side with them.",
        "I have found someone to take me out of here, and I have that person's back.",
        "My tools mean more to me than just a way to make a living.",
        "Here and now matters; those I travel with, what we do. Who knows what tomorrow brings.",
        "I stay close to the people that come from similar circumstances; the high and mighty make literally no sense to me.",
        "I yearn for knowledge like my uncle yearned for the bottle.",
      ],
      flaws: [
        "I have a hard time looking beneath the surface of people's words and judging their intent.",
        "Why be sober if you don't have to? And you don't have to, since someone else is already doing the thinking.",
        "I think education makes people morally corrupt. Do not trust them.",
        "Most people don't deserve what they have; why should I not take it from them?",
        "Dreams are dangerous; I'm sticking to what little I have, thank you very much.",
        "People that don't look like me make me nervous.",
      ],
    },
  },
  {
    id: "faithful-of-prios",
    originId: "human",
    name: "Faithful of Prios",
    description:
      "You sought a deeper connection to your god. You learned the ways of the Sun Church — as a liturgist, theurg, Templar, or Twilight Friar.",
    skillProficiencies: ["religion"],
    toolChoices: {
      count: 1,
      from: [
        { id: "brewers", label: "Brewer's kit" },
        { id: "herbalism-kit", label: "Herbalism kit" },
      ],
    },
    equipment: "A kit to match your tool, priestly vestments, 2d6 + 3 shillings.",
    feature: {
      name: "Shelter of the Faithful",
      description:
        "As a servant of Prios, you can perform the religious ceremonies of everyday life. You and your companions can expect to receive free healing and care at any established presence of Prios; you must provide any material components.",
    },
    tables: {
      personalityTraits: [
        "I idolize a champion of Prios and constantly refer to their deeds.",
        "My ancestors supported the Church and it is my time to give my service.",
        "I was always destined for the Church and thus take it for granted.",
        "I was lost before the Church found me and now I finally feel at home.",
        "I want to help the less-fortunate and the Church seems the easiest way to do that.",
        "I like the respect that I receive when I am in my formal robes.",
        "I come from humble beginnings, and I remind everyone of that fact.",
        "I sometimes make references to the Young Gods, and correct myself. My family was into that heresy, I for sure am not.",
      ],
      ideals: [
        "Charity. I will help those in need, despite whatever cost I must pay.",
        "Justice. The words of the Lawgiver are the foundation for a life worth living.",
        "Leadership. We must be the beacon that saves humanity from the evils of the world.",
        "Purity. Prios is the only way to a righteous life; all other ways are sinful.",
        "Salvation. This life can be grim, but remember: Prios will judge all of us.",
        "Deliverance. Prios will guide your steps in this life, if your prayers are sincere.",
      ],
      bonds: [
        "Everything I do is for the common people.",
        "I want to impress the Church's superiors.",
        "My family brags about me and my missions.",
        "I want to leave behind my past and Prios helps me forget.",
        "There is one specific sinner I want to reach, and hopefully change.",
        "I want to die a martyr of the Sun.",
      ],
      flaws: [
        "I judge others harshly and myself even more severely.",
        "I can be blind to my faults, despite having them pointed out.",
        "In order to present an open nature, I forgive all transgressions even when I should not.",
        "This way was chosen for me, I am very despondent about my lot in life.",
        "I think myself chosen by Prios and I am certain he will forgive some of my transgressions.",
        "As I serve Prios, others should serve me.",
      ],
    },
  },
  {
    id: "houses-of-nobility",
    originId: "human",
    name: "Houses of Nobility",
    description:
      "You are a member of the nobility of Ambria, however minor. You have decided to embrace adventure to make a name for yourself.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["history", "persuasion"] },
    toolChoices: {
      count: 1,
      from: [
        { id: "calligraphers", label: "Calligrapher's supplies" },
        { id: "gaming-set", label: "Gaming set" },
        { id: "musical", label: "Musical instrument" },
      ],
    },
    equipment: "A kit to match your tool, signet ring, wax, paper, 3d6 + 50 shillings.",
    feature: {
      name: "Privileged",
      description:
        "You are a noble by blood and given advantages others must pay for, in either silver or hard work. You have advantage on introductions for social challenges within your own society — unless you strive for something questionable.",
    },
    tables: {
      personalityTraits: [
        "I am a good friend but a fierce enemy. Do not wrong me, or I shall have my vengeance on you.",
        "I believe in the teachings of the Giver of Laws: All have their rightful place under the sun.",
        "I tend to be blind to the needs of others and idealistic in my expectations.",
        "I use my station to get rewards but then often pass them to others.",
        "I tend to over-correct myself and stammer when in new situations.",
        "Both the pen and the sword are weapons; you just have to choose the right one.",
        "I never fail to mention my glorious family history when presenting myself.",
        "I ask about other people's family history, as I judge their character by it.",
      ],
      ideals: [
        "Responsibility. I owe my service to my betters just the same as the common folk owe service to me. I protect the common folk, just as the kingdom protects me.",
        "Trial of Arms. Prios ensures that the just are victorious.",
        "Nobility. I must serve as an example to all of how to conduct oneself.",
        "Order. The world must make sense or my birthright is in question.",
        "Rebuilding. I will make my house great again, like in the olden days.",
        "Fame. My name is everything, it and the deeds I have done will outlive me.",
      ],
      bonds: [
        "My family name must not be tarnished; it may be all that I have at present, but I will make it known throughout the kingdom.",
        "I have a favorite relative that I admire and look up to at all times.",
        "I place my faith in my war gear and companions.",
        "I view the Queen as blood kin and will do anything to defend her.",
        "I took an oath whilst inebriated. Matters not, I must keep my word.",
        "I have been handed a protégé to protect, and this I will do.",
      ],
      flaws: [
        "I did not venture forth from my family's land by choice, instead I embarrassed them and they made me leave.",
        "I often act haughty and feel that my station demands respect at all times.",
        "I am too eager to see every action as right vs. wrong; good vs. evil.",
        "I too easily enjoy the comforts of a noble's life.",
        "I fear that before the end I will let my blood and family history down.",
        "I wish I was not noble, but of common stock, with simple tastes and lower expectations.",
      ],
    },
  },
  {
    id: "merchant",
    originId: "human",
    name: "Merchant",
    description:
      "You bring goods, news, and notions between settlements — or work in a single shop or tavern as a baker, tanner, weaver.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["deception", "insight", "persuasion"] },
    toolChoices: { count: 1, from: [ANY_ARTISAN] },
    equipment: "A kit to match your tool, fine clothing, 6d6 + 4 shillings.",
    feature: {
      name: "Negotiation",
      description:
        "You can choose to have advantage on a Wisdom (Insight) or Charisma (Deception or Persuasion) check. Recharges on a short or long rest.",
    },
    tables: {
      personalityTraits: [
        "I will trade with anyone.",
        "I love the negotiation as much as the gold.",
        "I measure my success in life in the amount of gold I have.",
        "I firmly believe everyone can win on a deal.",
        "Everybody wants something, and I want to find out what.",
        "I up the stakes so I have something to back down from.",
        "I gather gold to help my family or cause.",
        "I want to make money and have fun. And making money is fun.",
      ],
      ideals: [
        "Noble greed. The profit motive drives the world forward.",
        "Enlightened self-interest. Give to them you pass on the way up, so they can give to you on the way down.",
        "Hard work. Idle hands are Corruption's best friend; keep busy and Prios will help you.",
        "Risk and reward. If you do what others do, you get what others get. I go where few dare to get the returns I crave.",
        "Reputation. I cannot do what I do unless people trust me.",
        "Early retirement. I do things I hate for a while so that I then can do what I love for the rest of my life.",
      ],
      bonds: [
        "My business was handed to me from someone I love, and I will not see it fail.",
        "There is this one charity that really speaks to me; all I get is a good feeling from giving.",
        "When I was down someone gave me a loan, and that saved me. The debt is repaid, but I still feel obliged to help out.",
        "I am indebted to some not very nice people, and I will repay in full.",
        "The one I love comes from a fine family and I must succeed in business to turn our betrothal to marriage.",
        "I have a precious item that I will never sell. It means too much to me.",
      ],
      flaws: [
        "I don't think I could stop hoarding gold even if I had more than I could ever spend. It's a compulsion.",
        "No matter how well I do, the empty and cold place inside me persists.",
        "I judge people on their net worth.",
        "I don't get people who value things other than money.",
        "I think my 'friends' and 'family' just want my money.",
        "I see people around me in terms of risk and return.",
      ],
    },
  },
  {
    id: "refugee",
    originId: "human",
    name: "Refugee",
    description:
      "You have fled the wars or the fall of Alberetor in the south. You make do with what you have and hope to find peace someday.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["nature", "sleight-of-hand", "survival"] },
    toolChoices: { count: 1, from: [ANY_ARTISAN] },
    equipment: "Simple clothes and 2d6 + 3 ortegs.",
    feature: {
      name: "Makeshift Tools",
      description:
        "When you need to make a tool check with an instrument you are proficient with but do not possess, you can substitute scrounged items instead.",
    },
    tables: {
      personalityTraits: [
        "I am just happy to be alive.",
        "I did not ask to come here; I will not live by your dumb rituals.",
        "I can't seem to get a fair shake and will do what I need to survive.",
        "I want to learn as much as I can to fit in and be prosperous.",
        "When I get drunk I cry and sing sad songs from the old country.",
        "I often point out that I am not like most of these other refugees.",
        "I sometimes get lost in the pleasures of this place.",
        "I speak of going back and setting things straight.",
      ],
      ideals: [
        "Family. Now more than ever it is important to remember that blood is what unites us.",
        "Tradition. The preservation of our old way of life is what will save us.",
        "Opportunity. Some harp on about the past and miss the fantastic opportunities given here.",
        "Generosity. It's important to give to those who have less, even if we have little.",
        "Survival. We left the old rules back there, and the laws of this place are not mine.",
        "The Chosen People. My tribe is chosen by the gods, and right now tested by them.",
      ],
      bonds: [
        "The first person I met here was really nice to me; I will never forget.",
        "I have this piece of jewelry from back home, and I will not part with it.",
        "My weapon is an heirloom, and using it feels like honoring those that made it.",
        "I betrayed some people when we fled; I am pretty sure I saw one of them here.",
        "There is this organization that helped me and my family when we first came.",
        "Someone dear to me died back there, and I want to give that person a proper burial.",
      ],
      flaws: [
        "I feel out of place here, and fear I would feel the same back home too.",
        "I have nightmares about what happened when we escaped.",
        "I sometimes drink to forget.",
        "I feel guilty for surviving when so many others did not.",
        "I blame my bad habits on the past, which stops me from changing them.",
        "If someone insults my lost home I get really angry.",
      ],
    },
  },
  {
    id: "scholar-of-ordo-magica",
    originId: "human",
    name: "Scholar of Ordo Magica",
    description:
      "You are a scholar, seeking the secrets of the universe — both magical and mundane.",
    skillProficiencies: ["arcana"],
    toolChoices: {
      count: 1,
      from: [
        { id: "alchemists", label: "Alchemist's supplies" },
        { id: "painters", label: "Painter's supplies" },
        { id: "tinkers", label: "Tinker's tools" },
      ],
    },
    equipment: "A kit to match your tool, thick robes, 2d6 + 8 shillings.",
    feature: {
      name: "Practical Knowledge",
      description:
        "When you encounter a new task, on a successful DC 15 Intelligence check you can declare that the situation reminds you of a previous experience and gain advantage on that check. Recharges on a long or extended rest.",
    },
    tables: {
      personalityTraits: [
        "When I leave the halls of Ordo Magica, I am certain that I am no longer among equals.",
        "I like to be thought of as the smart one and often over-explain things.",
        "I don't like conflict and so I try to broker peace among my friends.",
        "If I know that I'm right about something I'll say so, it doesn't matter how it affects others.",
        "I have a hard time keeping secrets.",
        "I tend to brag about what I've done to help others.",
        "I routinely use minor magics to impress the masses.",
        "I use my magic sparingly, Corruption is everywhere.",
      ],
      ideals: [
        "Knowledge. Learning something new justifies any expense or danger.",
        "Rationality. Emotions have no place in decision-making.",
        "Discovery. Only by pressing at the boundaries of knowledge can we learn something new.",
        "Secrets. I love being the only person in the world to know something.",
        "Recognition. Accolades and trophies are proof of my excellence.",
        "Power. What I can do is who I am; the rest is just talk.",
      ],
      bonds: [
        "A warrior once saved my life when I faltered. Now I make sure that they are always safe.",
        "I owe my sanity to my teachers here. Otherwise the darkness would have consumed me.",
        "I am responsible for the others, they don't understand what I do.",
        "I will do anything to advance the power of Ordo Magica.",
        "I am the disciplinarian of all that is chaotic, wild and under-developed.",
        "I once made a silly bet to be the one recovering the pure Arch-magic. The idea is growing on me.",
      ],
      flaws: [
        "I find it hard to explain my ideas and often get frustrated and expect people to just follow along.",
        "I am easily distracted by new information.",
        "I don't have any sense of self-preservation when given the chance to explore.",
        "I tend to think myself smarter than others even when it's obviously not true.",
        "I speak to myself when I get nervous, like really loud.",
        "To die helping me fulfill my destiny is all mere mortals can aspire to. I do not grieve.",
      ],
    },
  },

  // -------- Ogre ----------------------------------------------------------
  {
    id: "learned-in-magic",
    originId: "ogre",
    name: "Learned in Magic",
    description:
      "You were discovered by a group of mystics — most often the witches of Davokar or Ordo Magica or possibly a troll singer.",
    skillProficiencies: ["arcana"],
    toolChoices: { count: 1, from: [{ id: "musical", label: "Any musical instrument" }] },
    equipment: "An instrument to match your proficiency, tattered clothes, 1d4 + 1 shillings.",
    feature: {
      name: "Spellbound",
      description:
        "Ogres usually have a little of their own magic about them and those that study the magical arts gain a resistance to force damage.",
    },
    tables: {
      personalityTraits: [
        "Magic is the most wonderful thing in the world, regardless of Corruption.",
        "Magic scares me, but I'm good at it, so what can I do?",
        "Corruption makes me nauseous, but I can handle it.",
        "I try to sound more lore-wise than I am.",
        "I don't say it if I can sing it.",
        "I enjoy simple pleasures in life: food, drink, singing.",
        "I take myself very seriously and hope this means others will too.",
        "I am most often found with my nose in a book.",
      ],
      ideals: [
        "Balance. The great forces — nature, civilization, Corruption — exist in delicate balance.",
        "Self-discovery. Life is about finding out who you are.",
        "Protection. I am a part of the mystic community, and I must defend it.",
        "Nature. From it we come, and to it we go. It's the most important thing.",
        "Civilization. Discipline turns creativity to use and ideas to value.",
        "Corruption. Grossly misunderstood, what others call 'darkness' I call a tool of great power.",
      ],
      bonds: [
        "I have this staff, just a stick to me really, with feathers and carvings and color paints on it. I keep it.",
        "The witch that found me walking mindlessly in the woods taught me how to live.",
        "For the first time I have found somewhere I belong: in magic, and with those that practice it.",
        "Goblins make me laugh, I like them.",
        "I see myself as a wayward troll, regardless of what other trolls say.",
        "There are very few people that mean anything to me; for those that do I would do anything.",
      ],
      flaws: [
        "I like the taste of Corruption, it's like black honey on my tongue.",
        "I can't stand Corruption, and refrain from doing things that produce it if I can.",
        "Most mystics are less competent than me, even highly regarded ones.",
        "I still feel like that lumbering oaf, wandering aimlessly through a darkening forest.",
        "I equate keeping secrets with being important; I trade them only for more secrets.",
        "Sometimes my anger gets the best of me, and I use magic recklessly.",
      ],
    },
  },
  {
    id: "raised-by-common-folk",
    originId: "ogre",
    name: "Raised by Common Folk",
    description:
      "You were discovered by the average folk of a village. Noted for your large size and endurance you were soon put to work.",
    skillProficiencies: ["athletics"],
    toolChoices: {
      count: 1,
      from: [
        { id: "carpenters", label: "Carpenter's tools" },
        { id: "masons", label: "Mason's tools" },
        { id: "smiths", label: "Smith's tools" },
      ],
    },
    equipment: "A kit to match your tool, thick working clothes, 3d6 + 2 shillings.",
    feature: {
      name: "Unending Labors",
      description:
        "You don't tire as easily as humans and you recover faster. When you take a long rest and have some food and drink, you reduce your exhaustion level by 2.",
    },
    tables: {
      personalityTraits: [
        "I've never known any other sort of life, so I think this is the best possible place for me.",
        "I get confused around good manners.",
        "I always seem to have something to eat in my pockets.",
        "When I eat, pigs look at me with disgust.",
        "I was taught manners by someone as a joke. I don't understand why others look so perplexed when I do my very best to fit in.",
        "I don't know where to look when someone is nice to me. It's so uncomfortable.",
        "I always try to be useful.",
        "I relate more to animals than to people.",
      ],
      ideals: [
        "Work. There is nothing better than a true day's labor, gladly given.",
        "Pastoralism. Sure, it is a lot of effort. But chores done, you can be happy.",
        "Perfection. In my craft, you don't always get it right every time. But when you do, that's special.",
        "Simplicity. I don't need much, and neither does anyone else if you ask me.",
        "Privacy. I prefer to be left alone and show others the same courtesy.",
        "Common folk. I will do anything for common folk, but don't expect them to care more for me than they do their animals.",
      ],
      bonds: [
        "My first teachers made special tools for me, I keep them still.",
        "The villagers used me as a beast of burden, and that gave me purpose.",
        "I have started to get this longing for the depth of the forest. It haunts me.",
        "Goblins and trolls feel both strange and strangely familiar to me.",
        "I killed a fearsome beast with my hands. I still carry its pelt at all times.",
        "These people gave me food, and I want to help them.",
      ],
      flaws: [
        "I am very defensive of the little people.",
        "I despise physically weak people.",
        "I am afraid of fire, like I panic if I get too close to it.",
        "I decorate myself with trophies from the bodies of those I kill, it gives me strength.",
        "I am afraid of smart people, they see right through me.",
        "Without someone to tell me what to do, I don't do anything.",
      ],
    },
  },
  {
    id: "sellsword",
    originId: "ogre",
    name: "Sellsword",
    description:
      "You were pressed into service as a warrior almost as soon as you were discovered. The folks who found you might have meant well — or not.",
    skillProficiencies: [],
    skillChoices: {
      count: 1,
      from: ["athletics", "acrobatics", "deception", "intimidation"],
    },
    toolChoices: {
      count: 1,
      from: [
        { id: "carpenters", label: "Carpenter's tools" },
        { id: "masons", label: "Mason's tools" },
      ],
    },
    equipment: "A kit to match your tool, thick working clothes, 1d6 + 4 shillings.",
    feature: {
      name: "Routine Punishment",
      description:
        "You have advantage on your first death saving throw. Recharges on a short or longer rest.",
    },
    tables: {
      personalityTraits: [
        "Everyone underestimates me because I'm slow to talk. But I want to be sure I say what I mean.",
        "I stand too close to people on purpose; it makes them more inclined to agree with me.",
        "I give one warning, and only one.",
        "I play dumb to lull my enemies into thinking this will be an easy fight.",
        "I know people expect me to be slow so I overcompensate to come off as clever.",
        "I love to talk, sing and drink.",
        "I plan meticulously for the next fight. That's how I was taught to do it.",
        "I am always ready, and it shows in where I stand, sit, sleep and how I move.",
      ],
      ideals: [
        "Duty. The best thing I can do is my job. It's why I'm here.",
        "Fairness. I protect the little people because I am big.",
        "Might. I am the biggest and the strongest, I get first choice.",
        "Pragmatism. I will fight for the one who pays best; allegiance is just another word for paycheck.",
        "Companionship. The winner of the fight is the one with the most friends.",
        "Fatalism. No reason to worry about outcomes — we plan and the gods laugh.",
      ],
      bonds: [
        "The warrior that took care of me was harsh but fair, she taught me all I needed to live this life.",
        "There is this goblin that annoys the hell out of me, and I cannot imagine not having the creature around.",
        "I have found my leader and will follow that person till the end.",
        "It's all about the friends next to me, it's as simple as that.",
        "I was left for dead by earlier 'companions,' this they will regret.",
        "My first job was for someone I really admire. I still carry a piece of the battle standard we flew around my arm.",
      ],
      flaws: [
        "I don't know any other ways of solving problems except by violence.",
        "I am freaked out by enemies as big as or bigger than me; it takes away my only advantage.",
        "I hate fighting small enemies; it's embarrassing when they hurt me.",
        "I once deserted a unit I was in. They won the fight anyway.",
        "I become all giggly and silly when drinking; it's just very un-ogre-like.",
        "I follow orders blindly, I know no other way.",
      ],
    },
  },

  // -------- Troll ---------------------------------------------------------
  {
    id: "artifact-collector",
    originId: "troll",
    name: "Artifact Collector",
    description:
      "Troll-made artifacts have been given as gifts to allies — or stolen. You are sent to collect one or more from ancient tombs, Symbarian ruins or unworthy thieves.",
    skillProficiencies: [],
    skillChoices: { count: 1, from: ["insight", "investigation", "perception"] },
    toolChoices: { count: 1, from: [ANY_ARTISAN] },
    equipment:
      "Supplies/tools to match your tool proficiency, over-sized clothes, 4d6 + 6 shillings (troll minted, often taken at face value).",
    feature: {
      name: "Inspector",
      description:
        "On a successful DC 15 Intelligence (Investigation) check of a manufactured item, you can identify which of the peoples made the item and might be able to make a guess about the specific community of the crafter.",
    },
    tables: {
      personalityTraits: [
        "Our heritage belongs to us and there is no justification for you stealing it.",
        "I am awkward talking to people but need to do it to learn more about the things they carry.",
        "I invite people to drinking games to learn more about their secrets.",
        "I prefer to be silent and observe. Words just get in the way of clarity.",
        "I pretend to like people but I love them.",
        "I genuinely love to hear stories from treasure-hunters; there are life lessons in them.",
        "I prefer the direct approach: 'that is troll-made, how did you get it?' is all that is needed.",
        "I find that teaching troll-lore makes people confide in me, often revealing where they have seen troll-made things.",
      ],
      ideals: [
        "Beauty. There are universal rules that define when something is well made.",
        "Trial by fire. We must put pressure on everything; that's how we know what is strong and what is not.",
        "Heritage. Troll culture is built on artifacts, and losing them means losing ourselves.",
        "Lessons from history. The past is a guide to what works and what does not.",
        "Hierarchy. I will listen to those above me, they know more and can teach me how to grow.",
        "Opportunity. Those above me were strong once — that's how they came to power. I wait for weakness to show, and then I will show my strength.",
      ],
      bonds: [
        "I would not be the troll I am today if it wasn't for one specific person. I owe that person a lot.",
        "My family is lost and I need to find them, or at least learn what happened to them.",
        "There is one troll who betrayed me, and I will make right on that slight.",
        "I dislike the company of goblins, but they are our children or parents and need our protection.",
        "There is one troll artifact in particular that has so far eluded me; I must find it.",
        "We the trolls are the best people on and under the land. Challenge me and I will show you what I mean.",
      ],
      flaws: [
        "I am too particular sometimes, and see flaws more easily than accomplishments.",
        "I am impatient and do not like to listen to complicated explanations.",
        "I feel lost in the world, but will never admit it.",
        "I use artifact hunting as an excuse to get away from the repressive troll society.",
        "I know where a long lost artifact is hidden, but I am afraid to go get it.",
        "My rage is strong. I fear it will consume me and destroy that which I love.",
      ],
    },
  },
  {
    id: "journey-of-discovery",
    originId: "troll",
    name: "Journey of Discovery",
    description:
      "Trolls usually send their young ones abroad to learn about the world and its creatures.",
    skillProficiencies: [],
    skillChoices: {
      count: 1,
      from: ["arcana", "history", "medicine", "religion"],
    },
    toolChoices: {
      count: 1,
      from: [
        { id: "calligraphers", label: "Calligrapher's supplies" },
        { id: "cartographers", label: "Cartographer's tools" },
        { id: "painters", label: "Painter's supplies" },
        { id: "herbalism-kit", label: "Herbalism kit" },
      ],
    },
    equipment: "Supplies to match your tool, large clothes, 2d6 + 8 shillings.",
    feature: {
      name: "Cunning Student",
      description:
        "At the end of an extended rest, choose a skill that you are not proficient in. You have a bonus to that skill equal to half of your proficiency bonus, rounded down. When you take another extended rest, you must select a different skill.",
    },
    tables: {
      personalityTraits: [
        "I am easily impressed by the works of goblins and humans. They are short-lived but accomplish so much!",
        "Everything I see is interesting, but nothing like home. I miss it.",
        "There's so much to learn, I don't think I could ever keep track of it all.",
        "I can listen to stories all day long.",
        "I feel I have much to teach as well, and do so at every opportunity.",
        "I am not comfortable talking to strangers unless I've had a strong drink.",
        "I am more interested in the stories told by places and things. People are just noisy.",
        "I sing all the time, even if it's just low humming.",
      ],
      ideals: [
        "Preservation. The darkness is growing but I want to at least have a written record of life before the shadows destroy everything.",
        "Moment of Truth. Pain, fear and death reveals who we truly are. Peace obscures truth.",
        "Responsibility. If I do not act on the things I know, what point is there to seek more knowledge?",
        "Legacy. The knowledge I will pass on to future generations is the measure of my life.",
        "Mentoring. Seeing the growth of others is the greatest reward in life.",
        "Power. Knowledge not used is a weapon left to rust; watch me swing my mighty truth-hammer!",
      ],
      bonds: [
        "I brought something from home with me, I look at it every night.",
        "I have a favorite knick-knack that I bought in these lands, I plan to keep it forever.",
        "Someone taught me a special song or story, I thanked them for their gift.",
        "I make notes of my journeys in my precious lore-book.",
        "I am caught up in a mystery, one I must unravel.",
        "I feel sorry for ogres, and want to help them rejoin the troll community.",
      ],
      flaws: [
        "I am starting to think that troll society is very flawed.",
        "I think that these strangers need more challenges in their lives, they are too soft.",
        "In my darker hours I find myself judging everyone and finding them lacking.",
        "I fear I am not as strong as I project, and take big risks to prove my fear wrong.",
        "I have ventured too far, and sometimes feel spiritually lost.",
        "I have visions of my own death, and that makes me cautious in the eyes of men — and a coward in the eyes of other trolls.",
      ],
    },
  },

  // -------- Undead --------------------------------------------------------
  {
    id: "revenant",
    originId: "undead",
    name: "Revenant",
    description:
      "You have been reborn — or at least you did not stay dead. You didn't choose this fate. You must constantly be on guard against witch hunters and Black Cloaks.",
    skillProficiencies: ["deception"],
    toolChoices: {
      count: 1,
      from: [{ id: "herbalism-kit", label: "Herbalism kit" }],
    },
    equipment: "A kit to match your tool, clothes to cover most of your body, 2d6 + 3 shillings.",
    feature: {
      name: "Undead Resilience",
      description:
        "You are immune to poison damage and the poisoned condition. Diseases do not affect you.",
    },
    tables: {
      personalityTraits: [
        "I pretend to be who I was in life, and feel like a phony doing it.",
        "I once knew someone that impressed me; I now try to emulate that person.",
        "I keep to myself, even among those who know what I am.",
        "I pretend to be a leper and sometimes even enjoy the horrid looks I get.",
        "I use copious amounts of perfume to hide the stench I imagine surrounds me.",
        "My breath reeks of sulfur and doom, and I use it to my advantage.",
        "I try to come off as nice and optimistic, but end up being creepy.",
        "I sometimes forget to breathe when I speak and instead just hiss. Always makes me giggle.",
      ],
      ideals: [
        "Memory. I try to hang on to recollections of my previous life.",
        "Redemption. I got a second chance and have promised myself I will use it wisely.",
        "Vengeance. Someone killed me, and now they will die by my hand.",
        "Mystery. How can I die and yet live? This unlife must be understood.",
        "Hedonism. I will live like every day was my last. Besides, debauchery only harms the living.",
        "Resurrection. I and others like me must return to the living, there has to be a way.",
      ],
      bonds: [
        "I have something rescued from where I lived when I was alive.",
        "I have a special treasure, something that may have come from my grave.",
        "My old family still needs me, even though they can't know I am still around.",
        "I worship the living around me and would gladly die for real for them.",
        "There is one place where I still feel alive, and I will not let it go to ruin.",
        "My curse is tied to the darkening of the world; as a last good deed I will fight the coming darkness.",
      ],
      flaws: [
        "I am beginning to forget what it's like to be hot or cold because of the weather.",
        "I was always a little careless, even in life. But now I don't feel pain — and I can't afford to lose anything else.",
        "I only feel alive when I do something bad. Really bad.",
        "I do not form feelings for people I didn't already know in life.",
        "I am desperately scared that someone will find out — and what I will do to them.",
        "I long for true death and might drag others down with me.",
      ],
    },
  },
];

export const BACKGROUND_BY_ID: Record<string, BackgroundDef> = Object.fromEntries(
  BACKGROUNDS.map((b) => [b.id, b]),
);

export function backgroundsForOrigin(originId: string): BackgroundDef[] {
  return BACKGROUNDS.filter((b) => b.originId === originId);
}
