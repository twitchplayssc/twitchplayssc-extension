/*
micro-0, macro-0, attack-0, defense-0, detection-0,
blink-0, storm-0, sentry-0, phoenix-0, nova-0,
stim-0, raven-0, liberator-0, ghost-0, yamato-0,
queen-0, burrow-0, bile-0, viper-0, infestor-0*/

var SKILLS = [];
var SKILLS_GENERAL = [0, 9, 1, 2, 3];
var SKILLS_PROTOSS = [4, 5, 6, 7, 8];
var SKILLS_TERRAN = [10, 11, 12, 13, 14];
var SKILLS_ZERG = [16, 17, 18, 19, 20];

SKILLS[0] = {
    shortName: "micro",
    name: "Micro",
    description: "This skill affects all units automatic micro behaviors and abilities. To achieve the best result, make sure to level up this skill along with Attack / Defense skills and specific ability skills that you want to improve."
};

SKILLS[1] = {
    shortName: "attack",
    name: "Attack",
    description: "Every offensive ability is affected by this skill; it also determines the stutter step precision and some other behaviors in aggressive stance."
};

SKILLS[2] = {
    shortName: "defense",
    name: "Defense",
    description: "Every defensive ability is affected by this skill, along with kiting micro in defensive stance."
};

SKILLS[3] = {
    shortName: "detection",
    name: "Detection",
    description: ""
};

SKILLS[4] = {
    shortName: "blink",
    name: "Blink",
    description: "Affects the probability of successful auto-blink for Stalkers; can be attack or defense skill depending on the stance. In offensive stance, Stalkers will try to blink forward to catch up with retreating enemy. In defensive stance, Stalkers will try to blink away from danger when their shields are depleted."
};

SKILLS[5] = {
    shortName: "storm",
    name: "Psionic Storm",
    description: "Attack skill; affects the probability and precision of High Templars auto-casting Psionic Storm"
};

SKILLS[6] = {
    shortName: "sentry",
    name: "Force Field",
    description: "Affects the probability and positioning of Force Fields placed by Sentries. In offensive stance, Sentries try to place Force Fields behind enemy groups, cutting of their retreat path (attack skill). In defensive stance, Sentries try to place Force Fields between themselves and approaching enemy unit (defense skill). In neutral stance, Sentries try to place Force Fields in the middle of enemy army, splitting in in two (defense skill)."
};

SKILLS[7] = {
    shortName: "phoenix",
    name: "Graviton Beam",
    description: "Attack skill; affects the probability of Phoenix casting Graviton Beam when focusing ground units."
};

SKILLS[8] = {
    shortName: "nova",
    name: "Disruptor Nova",
    description: "Attack skill; determines the precision of Disruptor Nova."
};

SKILLS[9] = {
    shortName: "macro",
    name: "Macro",
    description: "This skill affects the taxing of the minerals. Every one point spent on this skill reduces the tax by 1% and increases worker limit by 1."
};

SKILLS[10] = {
    shortName: "raven",
    name: "Raven skills",
    description: "Affects the probability of multiple abilities used by Ravens.In offensive stance, Ravens try to cast Anti-Armor Missile on enemy unit, an attack skill. In defensive stance, Ravens try to cast Interference Matrix on enemy Mechanical or Psionic unit, a defense skill. In neutral stance, Ravens try to drop Auto-Turret near the enemy units or structures, a defense skill."
};

SKILLS[11] = {
    shortName: "yamato",
    name: "Yamato Cannon",
    description: "Attack skill; affects the probability of Battlecruisers auto-casting Yamato Cannon."
};

SKILLS[12] = {
    shortName: "liberator",
    name: "Defender Mode",
    description: "Attack skill; determines the positioning of Liberator's Defender Mode. Doesn't work for now"
};

SKILLS[13] = {
    shortName: "stim",
    name: "Stimpack",
    description: "Affects the probability of Marines and Marauders using Stimpack; Stimpack is used when the effect is not active depending on the stance. In defensive and neutral stance, Marines and Marauders will use Stimpack when their current health is at least 75% and 50% of their maximum health respectively. In offensive stance, Marines and Marauders will use Stimpack without limitation."
};

SKILLS[14] = {
    shortName: "ghost",
    name: "Ghost abilities",
    description: "Attack skill; affects the probability of Ghost casting Steady Targeting and EMP Round."
};

SKILLS[15] = null; // "split"

SKILLS[16] = {
    shortName: "bile",
    name: "Corrosive Bile",
    description: "Attack skill; determines the precision of Ravager's Corrosive Bile."
};

SKILLS[17] = {
    shortName: "queen",
    name: "Transfusion",
    description: "Affects the probability of Queen casting Transfusion on ally biological units and structures"
};

SKILLS[18] = {
    shortName: "infestor",
    name: "Infestor abilities",
    description: "Affects the probability of abilities used by Infestors. When not focusing on unit type, Infestors try to cast Fungal Growth on group of enemy units, an attack skill. Infestors also try to cast Microbial Shroud on allied units damaged by air attacks, a defense skill. When focusing on unit type, Infestors try to cast Neural Parasite on a unit that matches the selected unit type, an attack skill."
};

SKILLS[19] = {
    shortName: "viper",
    name: "Viper abilities",
    description: "Affects the probability of abilities used by Vipers. When idle, Vipers Consume on nearby biological structures with >550HP. Can be interrupted with army control commands. When not focusing on unit type, Vipers try to cast Parasitic Bomb on enemy air unit, an attack skill. Vipers also try to cast Blinding Cloud on enemy ranged units when friendly units are damaged by ranged attacks, a defense skill. When focusing on unit type, Vipers try to Abduct a unit that matches the selected unit type, an attack skill."
};

SKILLS[20] = {
    shortName: "burrow",
    name: "Burrow",
    description: ""
};

for (var i = 0; i < SKILLS.length; i++) {
    if (SKILLS[i]) SKILLS[i].maxPoints = 12;//randomInt(20, 12);
}