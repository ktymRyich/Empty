import { Particle } from '../entities/Particle';
import { ParticleSystem } from '../entities/ParticleSystem';
import { SPECIES } from '../entities/SpeciesConfig';

export function applyPredation(p: Particle, system: ParticleSystem, dt: number) {
  const def = SPECIES[p.species];
  if (def.preys.length === 0 && def.threats.length === 0 && !def.flags.decomposer && !def.flags.parasitic) return;

  const range = def.perception * p.perceptionMul;
  const neighbors = system.queryNeighbors(p, range);
  const rangeSq = range * range;
  const maxF = def.maxForce;
  const maxS = def.maxSpeed * p.speedMul;

  let preyBestDist = Infinity;
  let preyX = 0, preyY = 0, preyZ = 0;
  let preyFound = false;
  let preyRef: Particle | null = null;

  let threatX = 0, threatY = 0, threatZ = 0;
  let threatCount = 0;

  for (let i = 0; i < neighbors.length; i++) {
    const other = system.particleByIndex(neighbors[i]);
    if (!other || !other.alive || other === p) continue;

    const dx = other.px - p.px;
    const dy = other.py - p.py;
    const dz = other.pz - p.pz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 === 0 || d2 > rangeSq) continue;

    // prey
    if (def.preys.includes(other.species)) {
      if (d2 < preyBestDist) {
        preyBestDist = d2;
        preyX = dx; preyY = dy; preyZ = dz;
        preyFound = true;
        preyRef = other;
      }
    }

    // threat avoidance
    if (def.threats.includes(other.species)) {
      const inv = 1 / (Math.sqrt(d2) + 0.001);
      threatX -= dx * inv;
      threatY -= dy * inv;
      threatZ -= dz * inv;
      threatCount++;
    }

    // ghost parasitism
    if (def.flags.parasitic && other.species !== p.species && d2 < (def.predationRange * def.predationRange) * 1.5) {
      const drain = Math.min(0.05 * dt * 20, other.energy * 0.15);
      other.energy -= drain;
      p.energy = Math.min(def.maxEnergy, p.energy + drain * 0.8);
    }

    // decomposer seeks dying (low-energy) non-Decomposer / non-Plankton individuals
    if (def.flags.decomposer && other.energy < 0.25 && other.species !== p.species && d2 < preyBestDist) {
      preyBestDist = d2;
      preyX = dx; preyY = dy; preyZ = dz;
      preyFound = true;
      preyRef = other;
    }
  }

  // seek prey
  if (preyFound) {
    const len = Math.sqrt(preyX * preyX + preyY * preyY + preyZ * preyZ) + 1e-6;
    const sc = maxS / len;
    let desX = preyX * sc - p.vx;
    let desY = preyY * sc - p.vy;
    let desZ = preyZ * sc - p.vz;
    const dl = Math.sqrt(desX * desX + desY * desY + desZ * desZ) + 1e-6;
    const f = Math.min(1, maxF / dl);
    p.ax += desX * f * 1.2;
    p.ay += desY * f * 1.2;
    p.az += desZ * f * 1.2;

    // capture check
    if (preyRef) {
      const cd2 = (preyRef.px - p.px) ** 2 + (preyRef.py - p.py) ** 2 + (preyRef.pz - p.pz) ** 2;
      const bite = def.predationRange * (1 + p.sizeMul * 0.2);
      if (cd2 < bite * bite) {
        const drained = Math.min(preyRef.energy, def.biteEnergy);
        preyRef.energy -= drained;
        p.energy = Math.min(def.maxEnergy, p.energy + drained);
        if (preyRef.energy <= 0) {
          system.kill(preyRef);
        }
      }
    }
  }

  if (threatCount > 0) {
    const tx = threatX / threatCount;
    const ty = threatY / threatCount;
    const tz = threatZ / threatCount;
    const len = Math.sqrt(tx * tx + ty * ty + tz * tz) + 1e-6;
    const sc = maxS / len;
    const dx = tx * sc - p.vx;
    const dy = ty * sc - p.vy;
    const dz = tz * sc - p.vz;
    const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
    const f = Math.min(1, maxF / dl);
    const weight = def.flags.ghost ? 1.6 : 1.3;
    p.ax += dx * f * weight;
    p.ay += dy * f * weight;
    p.az += dz * f * weight;
  }
}
