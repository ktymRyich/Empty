import * as THREE from 'three';

export interface GroundHit {
  y: number;
  normal: THREE.Vector3;
}

/**
 * Ground abstraction. The character controller only ever asks for the floor
 * height at an (x, z) — it never cares whether the ground is a procedural
 * plane (slice) or an imported, sculpted glTF terrain (later). Swapping the
 * underlying mesh is all that is needed to support arbitrary topology
 * (cliffs, the central volcano's overhangs, etc.).
 */
export class Ground {
  private readonly raycaster = new THREE.Raycaster();
  private readonly origin = new THREE.Vector3();
  private static readonly DOWN = new THREE.Vector3(0, -1, 0);
  /** How far above any possible terrain we start the downward ray. */
  private readonly castHeight: number;

  constructor(
    private readonly mesh: THREE.Object3D,
    castHeight = 200,
  ) {
    this.castHeight = castHeight;
  }

  /** Returns floor height + surface normal at (x, z), or null if off-mesh. */
  raycastDown(x: number, z: number): GroundHit | null {
    this.origin.set(x, this.castHeight, z);
    this.raycaster.set(this.origin, Ground.DOWN);
    const hits = this.raycaster.intersectObject(this.mesh, true);
    if (hits.length === 0) return null;
    const hit = hits[0];
    const normal = hit.face
      ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
      : new THREE.Vector3(0, 1, 0);
    return { y: hit.point.y, normal };
  }
}
