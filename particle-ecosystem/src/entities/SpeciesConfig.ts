import * as THREE from 'three';

export enum Species {
  Plankton = 0,
  Crystallite = 1,
  Swarmer = 2,
  Hunter = 3,
  Alpha = 4,
  Ghost = 5,
  Decomposer = 6,
  Hybrid = 7,
}

export const SPECIES_COUNT = 8;

export interface SpeciesDef {
  id: Species;
  name: string;
  colorA: THREE.Color;
  colorB: THREE.Color;
  baseSize: number;
  maxSpeed: number;
  maxForce: number;
  perception: number;
  initialEnergy: number;
  maxEnergy: number;
  metabolism: number;
  reproduceThreshold: number;
  reproduceCost: number;
  reproduceChance: number;
  predationRange: number;
  biteEnergy: number;
  preys: Species[];
  threats: Species[];
  flocking: { separation: number; alignment: number; cohesion: number } | null;
  wanderStrength: number;
  initialCount: number;
  maxCount: number;
  flags: {
    photosynthesis?: boolean;
    parasitic?: boolean;
    decomposer?: boolean;
    territorial?: boolean;
    hybrid?: boolean;
    ghost?: boolean;
  };
}

const col = (hex: number) => new THREE.Color(hex);

export const SPECIES: SpeciesDef[] = [
  {
    id: Species.Plankton,
    name: 'Plankton',
    colorA: col(0x00ff88),
    colorB: col(0x88ff00),
    baseSize: 1.6,
    maxSpeed: 6.0,
    maxForce: 2.0,
    perception: 18,
    initialEnergy: 0.7,
    maxEnergy: 1.2,
    metabolism: 0.006,
    reproduceThreshold: 0.9,
    reproduceCost: 0.4,
    reproduceChance: 0.010,
    predationRange: 0,
    biteEnergy: 0,
    preys: [],
    threats: [Species.Crystallite, Species.Swarmer, Species.Hybrid],
    flocking: null,
    wanderStrength: 1.0,
    initialCount: 500,
    maxCount: 1400,
    flags: { photosynthesis: true },
  },
  {
    id: Species.Crystallite,
    name: 'Crystallite',
    colorA: col(0x22ffff),
    colorB: col(0x33aaff),
    baseSize: 8.0,
    maxSpeed: 20,
    maxForce: 6.5,
    perception: 80,
    initialEnergy: 1.0,
    maxEnergy: 1.8,
    metabolism: 0.018,
    reproduceThreshold: 1.1,
    reproduceCost: 0.45,
    reproduceChance: 0.022,
    predationRange: 7.0,
    biteEnergy: 0.6,
    preys: [Species.Plankton],
    threats: [Species.Hunter, Species.Alpha, Species.Ghost],
    flocking: null,
    wanderStrength: 0.6,
    initialCount: 200,
    maxCount: 360,
    flags: {},
  },
  {
    id: Species.Swarmer,
    name: 'Swarmer',
    colorA: col(0xff33ff),
    colorB: col(0x9933ff),
    baseSize: 7.5,
    maxSpeed: 24,
    maxForce: 7.5,
    perception: 75,
    initialEnergy: 1.0,
    maxEnergy: 1.8,
    metabolism: 0.02,
    reproduceThreshold: 1.1,
    reproduceCost: 0.45,
    reproduceChance: 0.024,
    predationRange: 6.5,
    biteEnergy: 0.55,
    preys: [Species.Plankton],
    threats: [Species.Hunter, Species.Alpha],
    flocking: { separation: 1.6, alignment: 1.0, cohesion: 0.9 },
    wanderStrength: 0.35,
    initialCount: 220,
    maxCount: 400,
    flags: {},
  },
  {
    id: Species.Hunter,
    name: 'Hunter',
    colorA: col(0xffaa22),
    colorB: col(0xffee55),
    baseSize: 12.0,
    maxSpeed: 28,
    maxForce: 9.0,
    perception: 150,
    initialEnergy: 1.4,
    maxEnergy: 2.2,
    metabolism: 0.015,
    reproduceThreshold: 1.3,
    reproduceCost: 0.45,
    reproduceChance: 0.028,
    predationRange: 11.0,
    biteEnergy: 1.1,
    preys: [Species.Crystallite, Species.Swarmer, Species.Hybrid],
    threats: [Species.Alpha],
    flocking: { separation: 1.5, alignment: 0.6, cohesion: 0.4 },
    wanderStrength: 0.5,
    initialCount: 100,
    maxCount: 160,
    flags: {},
  },
  {
    id: Species.Alpha,
    name: 'Alpha',
    colorA: col(0xff3366),
    colorB: col(0xdd44ff),
    baseSize: 20.0,
    maxSpeed: 22,
    maxForce: 7.0,
    perception: 180,
    initialEnergy: 1.8,
    maxEnergy: 3.2,
    metabolism: 0.022,
    reproduceThreshold: 2.1,
    reproduceCost: 0.9,
    reproduceChance: 0.010,
    predationRange: 12.0,
    biteEnergy: 1.6,
    preys: [Species.Hunter, Species.Swarmer, Species.Hybrid],
    threats: [],
    flocking: null,
    wanderStrength: 0.6,
    initialCount: 22,
    maxCount: 45,
    flags: { territorial: true },
  },
  {
    id: Species.Ghost,
    name: 'Ghost',
    colorA: col(0xeeffff),
    colorB: col(0xbbddff),
    baseSize: 10.0,
    maxSpeed: 26,
    maxForce: 8.0,
    perception: 100,
    initialEnergy: 1.1,
    maxEnergy: 2.0,
    metabolism: 0.018,
    reproduceThreshold: 1.4,
    reproduceCost: 0.6,
    reproduceChance: 0.010,
    predationRange: 7.0,
    biteEnergy: 0.5,
    preys: [Species.Crystallite, Species.Swarmer, Species.Hunter, Species.Hybrid],
    threats: [Species.Alpha],
    flocking: null,
    wanderStrength: 0.8,
    initialCount: 40,
    maxCount: 90,
    flags: { parasitic: true, ghost: true },
  },
  {
    id: Species.Decomposer,
    name: 'Decomposer',
    colorA: col(0xaa33cc),
    colorB: col(0xff33cc),
    baseSize: 7.0,
    maxSpeed: 14,
    maxForce: 3.8,
    perception: 150,
    initialEnergy: 1.0,
    maxEnergy: 1.6,
    metabolism: 0.009,
    reproduceThreshold: 1.05,
    reproduceCost: 0.4,
    reproduceChance: 0.022,
    predationRange: 5.0,
    biteEnergy: 0.45,
    preys: [Species.Plankton],
    threats: [],
    flocking: null,
    wanderStrength: 0.5,
    initialCount: 95,
    maxCount: 180,
    flags: { decomposer: true },
  },
  {
    id: Species.Hybrid,
    name: 'Hybrid',
    colorA: col(0x66ffbb),
    colorB: col(0xff66aa),
    baseSize: 9.0,
    maxSpeed: 22,
    maxForce: 7.0,
    perception: 90,
    initialEnergy: 1.2,
    maxEnergy: 2.2,
    metabolism: 0.022,
    reproduceThreshold: 1.3,
    reproduceCost: 0.55,
    reproduceChance: 0.014,
    predationRange: 6.0,
    biteEnergy: 0.65,
    preys: [Species.Plankton, Species.Crystallite],
    threats: [Species.Hunter, Species.Alpha],
    flocking: null,
    wanderStrength: 0.6,
    initialCount: 55,
    maxCount: 140,
    flags: { hybrid: true },
  },
];
