import * as THREE from 'three';
import type { Region, RegionContext } from './Region.ts';
import type { GroundHit } from './Ground.ts';

/**
 * Owns the set of regions that make up the island and answers spatial
 * queries. The character controller depends only on `sampleGround` and
 * `regionAt`, so it is agnostic to how many regions exist or how each one
 * represents its terrain.
 */
export class World {
  private readonly regions: Region[] = [];
  private active: Region | null = null;
  private readonly point = new THREE.Vector3();

  constructor(private readonly ctx: RegionContext) {}

  registerRegion(region: Region): void {
    this.regions.push(region);
  }

  /** Loads a region's content and marks it active. */
  async activate(id: string): Promise<void> {
    const region = this.regions.find((r) => r.id === id);
    if (!region) throw new Error(`World: unknown region "${id}"`);
    await region.load(this.ctx);
    this.active = region;
  }

  get activeRegion(): Region | null {
    return this.active;
  }

  /** Which region contains (x, z). Drives ambient music / allowed transport
   *  later; for the slice there is exactly one region. */
  regionAt(x: number, z: number): Region | null {
    this.point.set(x, 0, z);
    for (const r of this.regions) {
      if (x >= r.bounds.min.x && x <= r.bounds.max.x && z >= r.bounds.min.z && z <= r.bounds.max.z) {
        return r;
      }
    }
    return this.active;
  }

  /** Floor query, delegated to the region containing the point. */
  sampleGround(x: number, z: number): GroundHit | null {
    const region = this.regionAt(x, z) ?? this.active;
    return region ? region.getGround().raycastDown(x, z) : null;
  }

  update(dt: number): void {
    for (const r of this.regions) r.update(dt);
  }
}
