import * as THREE from 'three';
import type { Avatar } from './Avatar.ts';

/**
 * The player as a simulation entity. `object` is the root transform that the
 * controller moves and that the camera follows; the Avatar (its visual) is
 * parented to it. Player knows nothing about input or rendering.
 */
export class Player {
  readonly object = new THREE.Group();
  readonly avatar: Avatar;

  readonly velocity = new THREE.Vector3();
  /** Vertical velocity, kept separate so gravity/landing reads clearly. */
  fall = 0;
  grounded = false;
  /** Horizontal speed this step — consumed by avatar bob / animation state. */
  speedXZ = 0;
  /** Previous fixed-step position, reserved for render interpolation. */
  readonly previousPosition = new THREE.Vector3();

  constructor(avatar: Avatar) {
    this.avatar = avatar;
    this.object.add(avatar.root);
  }

  get position(): THREE.Vector3 {
    return this.object.position;
  }
}
