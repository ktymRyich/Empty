import * as THREE from 'three';
import type { Ground } from './Ground.ts';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'volcano';

export interface RegionContext {
  scene: THREE.Scene;
}

/**
 * A spatial sub-zone of the single island. The island is one continuous world,
 * so regions are NOT swapped levels — they are areas that coexist. `load` /
 * `unload` are kept in the contract for future streaming (e.g. unload far
 * regions on low-end devices) even though the slice keeps everything loaded.
 *
 * Future, optional fields (left commented intentionally so adding them is
 * additive and obvious):
 *   // allowedTransports?: TransportMode[]
 */
export interface Region {
  readonly id: string;
  readonly season: Season;
  /** Walkable extent. Used to clamp the player and for point-in-region tests. */
  readonly bounds: THREE.Box3;
  load(ctx: RegionContext): Promise<void>;
  unload(): void;
  /** Ambient animation (grass sway, water, etc). */
  update(dt: number): void;
  getGround(): Ground;
}
