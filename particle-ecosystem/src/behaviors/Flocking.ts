import { Particle } from '../entities/Particle';
import { ParticleSystem } from '../entities/ParticleSystem';
import { SPECIES } from '../entities/SpeciesConfig';

export interface FlockWeights {
  separation: number;
  alignment: number;
  cohesion: number;
  perception: number;
}

export function applyFlocking(
  p: Particle,
  system: ParticleSystem,
  weights: FlockWeights,
): void {
  const def = SPECIES[p.species];
  if (!def.flocking) return;

  const range = Math.max(def.perception, weights.perception) * p.perceptionMul * 0.6;
  const neighbors = system.queryNeighbors(p, range);

  let sepX = 0, sepY = 0, sepZ = 0;
  let aliX = 0, aliY = 0, aliZ = 0;
  let cohX = 0, cohY = 0, cohZ = 0;
  let aliCount = 0, cohCount = 0, sepCount = 0;

  const sepRange = def.baseSize * 3.0 + 6.0;
  const sepRangeSq = sepRange * sepRange;
  const rangeSq = range * range;

  for (let i = 0; i < neighbors.length; i++) {
    const other = system.particleByIndex(neighbors[i]);
    if (!other || !other.alive || other === p) continue;
    if (other.species !== p.species) continue;

    const dx = p.px - other.px;
    const dy = p.py - other.py;
    const dz = p.pz - other.pz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 === 0 || d2 > rangeSq) continue;

    if (d2 < sepRangeSq) {
      const inv = 1 / Math.sqrt(d2 + 0.0001);
      sepX += dx * inv;
      sepY += dy * inv;
      sepZ += dz * inv;
      sepCount++;
    }
    aliX += other.vx; aliY += other.vy; aliZ += other.vz;
    aliCount++;
    cohX += other.px; cohY += other.py; cohZ += other.pz;
    cohCount++;
  }

  const maxF = def.maxForce;
  const maxS = def.maxSpeed * p.speedMul;

  if (sepCount > 0) {
    p.ax += limit(sepX, sepY, sepZ, maxS, maxF, 0) * weights.separation * def.flocking.separation;
    p.ay += limit(sepX, sepY, sepZ, maxS, maxF, 1) * weights.separation * def.flocking.separation;
    p.az += limit(sepX, sepY, sepZ, maxS, maxF, 2) * weights.separation * def.flocking.separation;
  }
  if (aliCount > 0) {
    aliX /= aliCount; aliY /= aliCount; aliZ /= aliCount;
    const desX = aliX - p.vx, desY = aliY - p.vy, desZ = aliZ - p.vz;
    p.ax += limit(desX, desY, desZ, maxS, maxF, 0) * weights.alignment * def.flocking.alignment;
    p.ay += limit(desX, desY, desZ, maxS, maxF, 1) * weights.alignment * def.flocking.alignment;
    p.az += limit(desX, desY, desZ, maxS, maxF, 2) * weights.alignment * def.flocking.alignment;
  }
  if (cohCount > 0) {
    cohX = cohX / cohCount - p.px;
    cohY = cohY / cohCount - p.py;
    cohZ = cohZ / cohCount - p.pz;
    p.ax += limit(cohX, cohY, cohZ, maxS, maxF, 0) * weights.cohesion * def.flocking.cohesion;
    p.ay += limit(cohX, cohY, cohZ, maxS, maxF, 1) * weights.cohesion * def.flocking.cohesion;
    p.az += limit(cohX, cohY, cohZ, maxS, maxF, 2) * weights.cohesion * def.flocking.cohesion;
  }
}

function limit(x: number, y: number, z: number, maxS: number, maxF: number, axis: 0 | 1 | 2): number {
  const len = Math.sqrt(x * x + y * y + z * z) + 1e-6;
  const scale = maxS / len;
  let nx = x * scale, ny = y * scale, nz = z * scale;
  // steering = desired - 0 (we use desired as steering here); then clip to maxF
  const sl = Math.sqrt(nx * nx + ny * ny + nz * nz) + 1e-6;
  const f = Math.min(1, maxF / sl);
  nx *= f; ny *= f; nz *= f;
  return axis === 0 ? nx : axis === 1 ? ny : nz;
}
