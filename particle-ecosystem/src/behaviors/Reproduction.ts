import { Particle } from '../entities/Particle';
import { ParticleSystem } from '../entities/ParticleSystem';
import { SPECIES, Species } from '../entities/SpeciesConfig';

export function updateLifecycle(
  p: Particle,
  system: ParticleSystem,
  dt: number,
  nebulaBoost: number,
): void {
  const def = SPECIES[p.species];
  p.age += dt;
  p.reproduceCooldown = Math.max(0, p.reproduceCooldown - dt);

  // Metabolism
  p.energy -= def.metabolism * dt * 10;

  // Plankton photosynthesis
  if (def.flags.photosynthesis) {
    p.energy += 0.02 * dt * 10 * (1 + nebulaBoost);
  }

  if (def.flags.hybrid) {
    // hybrid: auto-switch preys based on energy
    if (p.energy < 0.7) {
      if (!def.preys.includes(Species.Plankton)) def.preys.push(Species.Plankton);
    }
  }

  p.energy = Math.min(def.maxEnergy, p.energy);

  if (p.energy <= 0) {
    system.kill(p);
    return;
  }

  if (
    p.energy >= def.reproduceThreshold &&
    p.reproduceCooldown <= 0 &&
    Math.random() < def.reproduceChance * (1 + (def.flags.photosynthesis ? nebulaBoost : 0)) * dt * 60
  ) {
    const child = system.spawn(
      p.species,
      p.px + (Math.random() - 0.5) * 4,
      p.py + (Math.random() - 0.5) * 2,
      p.pz + (Math.random() - 0.5) * 4,
      p,
    );
    if (child) {
      p.energy -= def.reproduceCost;
      p.reproduceCooldown = 1.5;
    }
  }
}
