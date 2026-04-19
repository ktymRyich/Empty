import { Species } from './SpeciesConfig';

export interface Particle {
  id: number;
  alive: boolean;
  species: Species;
  // Position / velocity / accel
  px: number; py: number; pz: number;
  vx: number; vy: number; vz: number;
  ax: number; ay: number; az: number;
  // State
  energy: number;
  age: number;
  reproduceCooldown: number;
  // Per-individual variance (evolution hook)
  speedMul: number;
  sizeMul: number;
  perceptionMul: number;
}

export function resetParticle(p: Particle, species: Species): Particle {
  p.alive = true;
  p.species = species;
  p.px = p.py = p.pz = 0;
  p.vx = p.vy = p.vz = 0;
  p.ax = p.ay = p.az = 0;
  p.energy = 1;
  p.age = 0;
  p.reproduceCooldown = 0;
  p.speedMul = 1;
  p.sizeMul = 1;
  p.perceptionMul = 1;
  return p;
}

export function createParticle(id: number): Particle {
  return {
    id,
    alive: false,
    species: Species.Plankton,
    px: 0, py: 0, pz: 0,
    vx: 0, vy: 0, vz: 0,
    ax: 0, ay: 0, az: 0,
    energy: 1,
    age: 0,
    reproduceCooldown: 0,
    speedMul: 1,
    sizeMul: 1,
    perceptionMul: 1,
  };
}
