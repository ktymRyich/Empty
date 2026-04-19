import * as THREE from 'three';
import particleVert from '../shaders/particle.vert';
import particleFrag from '../shaders/particle.frag';
import { Particle, createParticle, resetParticle } from './Particle';
import { Species, SPECIES, SpeciesDef } from './SpeciesConfig';
import { ObjectPool } from '../utils/ObjectPool';
import { SpatialHashGrid } from '../utils/SpatialHashGrid';
import { mutate } from '../behaviors/Evolution';

const MAX_TOTAL = 10000;

export interface WorldParams {
  bounds: THREE.Box3;
  attractPoint: THREE.Vector3 | null;
  repelPoint: THREE.Vector3 | null;
  mouseStrength: number;
  timeScale: number;
  mutationRate: number;
  flocking: { separation: number; alignment: number; cohesion: number; perception: number };
  nebulaBoost: number;
  sizeScale: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  private pool: ObjectPool<Particle>;
  private nextId = 0;

  points: THREE.Points[] = [];
  private geoms: THREE.BufferGeometry[] = [];
  private positions: Float32Array[] = [];
  private sizes: Float32Array[] = [];
  private colors: Float32Array[] = [];
  private energies: Float32Array[] = [];
  private velocities: Float32Array[] = [];
  private counts: number[] = [];

  private grid: SpatialHashGrid;
  private neighborBuf: number[] = [];

  private tmpColor = new THREE.Color();

  public counters = new Int32Array(SPECIES.length);

  constructor(scene: THREE.Scene, pixelRatio: number) {
    this.pool = new ObjectPool<Particle>(() => createParticle(this.nextId++), 512);
    this.grid = new SpatialHashGrid(40);

    for (const def of SPECIES) {
      const cap = def.maxCount + 64;
      const geom = new THREE.BufferGeometry();
      const position = new Float32Array(cap * 3);
      const size = new Float32Array(cap);
      const color = new Float32Array(cap * 3);
      const energy = new Float32Array(cap);
      const velocity = new Float32Array(cap * 3);

      geom.setAttribute('position', new THREE.BufferAttribute(position, 3));
      geom.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      geom.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
      geom.setAttribute('aEnergy', new THREE.BufferAttribute(energy, 1));
      geom.setAttribute('aVel', new THREE.BufferAttribute(velocity, 3));
      geom.setDrawRange(0, 0);

      const mat = new THREE.ShaderMaterial({
        defines: { SPECIES_ID: def.id },
        uniforms: {
          uPixelRatio: { value: pixelRatio },
          uSizeScale: { value: 1.0 },
        },
        vertexShader: particleVert,
        fragmentShader: particleFrag,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geom, mat);
      points.frustumCulled = false;
      scene.add(points);

      this.points.push(points);
      this.geoms.push(geom);
      this.positions.push(position);
      this.sizes.push(size);
      this.colors.push(color);
      this.energies.push(energy);
      this.velocities.push(velocity);
      this.counts.push(0);
    }
  }

  setSizeScale(scale: number) {
    for (const p of this.points) (p.material as THREE.ShaderMaterial).uniforms.uSizeScale.value = scale;
  }

  setPixelRatio(pr: number) {
    for (const p of this.points) (p.material as THREE.ShaderMaterial).uniforms.uPixelRatio.value = pr;
  }

  get totalAlive() {
    let s = 0;
    for (let i = 0; i < this.counters.length; i++) s += this.counters[i];
    return s;
  }

  spawn(species: Species, x: number, y: number, z: number, parent?: Particle): Particle | null {
    const def = SPECIES[species];
    if (this.counters[species] >= def.maxCount) return null;
    if (this.totalAlive >= MAX_TOTAL) return null;

    const p = this.pool.acquire();
    resetParticle(p, species);
    p.px = x; p.py = y; p.pz = z;

    const ang = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const speed = def.maxSpeed * 0.3 * Math.random();
    p.vx = Math.sin(phi) * Math.cos(ang) * speed;
    p.vy = Math.cos(phi) * speed * 0.25;
    p.vz = Math.sin(phi) * Math.sin(ang) * speed;

    p.energy = def.initialEnergy;
    if (parent) {
      const mr = (window as any).__mutationRate ?? 0;
      p.speedMul = mutate(parent.speedMul, mr);
      p.sizeMul = mutate(parent.sizeMul, mr);
      p.perceptionMul = mutate(parent.perceptionMul, mr);
    }

    this.particles.push(p);
    this.counters[species]++;
    return p;
  }

  seed(bounds: THREE.Box3) {
    const min = bounds.min, max = bounds.max;
    const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    for (const def of SPECIES) {
      for (let i = 0; i < def.initialCount; i++) {
        this.spawn(def.id, rand(min.x, max.x), rand(min.y, max.y), rand(min.z, max.z));
      }
    }
  }

  kill(p: Particle) {
    if (!p.alive) return;
    p.alive = false;
    this.counters[p.species]--;
  }

  rebuildGrid() {
    this.grid.clear();
    const parts = this.particles;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p.alive) continue;
      this.grid.insert(i, p.px, p.py, p.pz);
    }
  }

  queryNeighbors(p: Particle, radius: number): number[] {
    const tmp = new THREE.Vector3(p.px, p.py, p.pz);
    this.grid.queryRadius(tmp, radius, this.neighborBuf);
    return this.neighborBuf;
  }

  compactDead() {
    const parts = this.particles;
    let w = 0;
    for (let r = 0; r < parts.length; r++) {
      const p = parts[r];
      if (p.alive) {
        parts[w++] = p;
      } else {
        this.pool.release(p);
      }
    }
    parts.length = w;
  }

  writeBuffers() {
    const counts = this.counts;
    for (let s = 0; s < SPECIES.length; s++) counts[s] = 0;

    const parts = this.particles;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p.alive) continue;
      const s = p.species;
      const def = SPECIES[s];
      const idx = counts[s];
      const pos = this.positions[s];
      const sz = this.sizes[s];
      const cl = this.colors[s];
      const en = this.energies[s];
      const vel = this.velocities[s];

      pos[idx * 3 + 0] = p.px;
      pos[idx * 3 + 1] = p.py;
      pos[idx * 3 + 2] = p.pz;

      vel[idx * 3 + 0] = p.vx;
      vel[idx * 3 + 1] = p.vy;
      vel[idx * 3 + 2] = p.vz;

      sz[idx] = def.baseSize * p.sizeMul;
      en[idx] = p.energy / def.maxEnergy;

      const t = p.energy / def.maxEnergy;
      this.tmpColor.copy(def.colorA).lerp(def.colorB, THREE.MathUtils.clamp(t, 0, 1));
      cl[idx * 3 + 0] = this.tmpColor.r;
      cl[idx * 3 + 1] = this.tmpColor.g;
      cl[idx * 3 + 2] = this.tmpColor.b;

      counts[s]++;
    }

    for (let s = 0; s < SPECIES.length; s++) {
      const geom = this.geoms[s];
      geom.setDrawRange(0, counts[s]);
      (geom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (geom.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
      (geom.attributes.aColor as THREE.BufferAttribute).needsUpdate = true;
      (geom.attributes.aEnergy as THREE.BufferAttribute).needsUpdate = true;
      (geom.attributes.aVel as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  particleByIndex(i: number): Particle | undefined {
    return this.particles[i];
  }

  getDef(species: Species): SpeciesDef {
    return SPECIES[species];
  }
}
