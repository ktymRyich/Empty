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
    baseSize: 2.0,
    maxSpeed: 6.0,
    maxForce: 2.0,
    perception: 18,
    initialEnergy: 0.6,
    maxEnergy: 1.2,
    metabolism: 0.008,
    reproduceThreshold: 0.85,
    reproduceCost: 0.35,
    reproduceChance: 0.02,
    predationRange: 0,
    biteEnergy: 0,
    preys: [],
    threats: [Species.Crystallite, Species.Swarmer, Species.Hybrid],
    flocking: null,
    wanderStrength: 1.0,
    initialCount: 650,
    maxCount: 1400,
    flags: { photosynthesis: true },
  },
  {
    id: Species.Crystallite,
    name: 'Crystallite',
    colorA: col(0x00ffff),
    colorB: col(0x0088ff),
    baseSize: 3.2,
    maxSpeed: 18,
    maxForce: 6.0,
    perception: 55,
    initialEnergy: 0.9,
    maxEnergy: 1.6,
    metabolism: 0.04,
    reproduceThreshold: 1.25,
    reproduceCost: 0.55,
    reproduceChance: 0.01,
    predationRange: 4.5,
    biteEnergy: 0.45,
    preys: [Species.Plankton],
    threats: [Species.Hunter, Species.Alpha, Species.Ghost],
    flocking: null,
    wanderStrength: 0.6,
    initialCount: 180,
    maxCount: 360,
    flags: {},
  },
  {
    id: Species.Swarmer,
    name: 'Swarmer',
    colorA: col(0xff00ff),
    colorB: col(0x8800ff),
    baseSize: 3.0,
    maxSpeed: 22,
    maxForce: 7.5,
    perception: 55,
    initialEnergy: 0.9,
    maxEnergy: 1.6,
    metabolism: 0.045,
    reproduceThreshold: 1.2,
    reproduceCost: 0.55,
    reproduceChance: 0.012,
    predationRange: 4.0,
    biteEnergy: 0.4,
    preys: [Species.Plankton],
    threats: [Species.Hunter, Species.Alpha],
    flocking: { separation: 1.6, alignment: 1.0, cohesion: 0.9 },
    wanderStrength: 0.35,
    initialCount: 200,
    maxCount: 400,
    flags: {},
  },
  {
    id: Species.Hunter,
    name: 'Hunter',
    colorA: col(0xff8800),
    colorB: col(0xffdd00),
    baseSize: 4.5,
    maxSpeed: 26,
    maxForce: 9.0,
    perception: 90,
    initialEnergy: 1.0,
    maxEnergy: 2.0,
    metabolism: 0.06,
    reproduceThreshold: 1.7,
    reproduceCost: 0.75,
    reproduceChance: 0.008,
    predationRange: 6.0,
    biteEnergy: 0.9,
    preys: [Species.Crystallite, Species.Swarmer, Species.Hybrid],
    threats: [Species.Alpha],
    flocking: { separation: 1.5, alignment: 0.6, cohesion: 0.4 },
    wanderStrength: 0.5,
    initialCount: 55,
    maxCount: 140,
    flags: {},
  },
  {
    id: Species.Alpha,
    name: 'Alpha',
    colorA: col(0xff0044),
    colorB: col(0xcc00ff),
    baseSize: 7.0,
    maxSpeed: 20,
    maxForce: 6.5,
    perception: 150,
    initialEnergy: 1.4,
    maxEnergy: 3.0,
    metabolism: 0.055,
    reproduceThreshold: 2.6,
    reproduceCost: 1.1,
    reproduceChance: 0.003,
    predationRange: 8.5,
    biteEnergy: 1.3,
    preys: [Species.Hunter, Species.Swarmer, Species.Hybrid],
    threats: [],
    flocking: null,
    wanderStrength: 0.6,
    initialCount: 14,
    maxCount: 35,
    flags: { territorial: true },
  },
  {
    id: Species.Ghost,
    name: 'Ghost',
    colorA: col(0xffffff),
    colorB: col(0xaaddff),
    baseSize: 3.8,
    maxSpeed: 24,
    maxForce: 8.0,
    perception: 80,
    initialEnergy: 0.9,
    maxEnergy: 1.8,
    metabolism: 0.035,
    reproduceThreshold: 1.5,
    reproduceCost: 0.7,
    reproduceChance: 0.004,
    predationRange: 5.0,
    biteEnergy: 0.5,
    preys: [Species.Crystallite, Species.Swarmer, Species.Hunter, Species.Hybrid],
    threats: [Species.Alpha],
    flocking: null,
    wanderStrength: 0.8,
    initialCount: 30,
    maxCount: 80,
    flags: { parasitic: true, ghost: true },
  },
  {
    id: Species.Decomposer,
    name: 'Decomposer',
    colorA: col(0x8800aa),
    colorB: col(0xff00aa),
    baseSize: 2.6,
    maxSpeed: 10,
    maxForce: 3.0,
    perception: 120,
    initialEnergy: 0.7,
    maxEnergy: 1.4,
    metabolism: 0.02,
    reproduceThreshold: 1.1,
    reproduceCost: 0.5,
    reproduceChance: 0.006,
    predationRange: 3.0,
    biteEnergy: 0.3,
    preys: [],
    threats: [],
    flocking: null,
    wanderStrength: 0.5,
    initialCount: 60,
    maxCount: 160,
    flags: { decomposer: true },
  },
  {
    id: Species.Hybrid,
    name: 'Hybrid',
    colorA: col(0x44ffaa),
    colorB: col(0xff4488),
    baseSize: 3.6,
    maxSpeed: 20,
    maxForce: 6.5,
    perception: 70,
    initialEnergy: 1.0,
    maxEnergy: 2.0,
    metabolism: 0.05,
    reproduceThreshold: 1.6,
    reproduceCost: 0.7,
    reproduceChance: 0.007,
    predationRange: 5.0,
    biteEnergy: 0.55,
    preys: [Species.Plankton, Species.Crystallite],
    threats: [Species.Hunter, Species.Alpha],
    flocking: null,
    wanderStrength: 0.6,
    initialCount: 45,
    maxCount: 120,
    flags: { hybrid: true },
  },
];
