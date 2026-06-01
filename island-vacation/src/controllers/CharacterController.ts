import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.ts';
import { clamp, damp, dampAngle } from '../utils/math.ts';
import type { InputBundle } from '../core/Input.ts';
import type { FollowCamera } from '../camera/FollowCamera.ts';
import type { World } from '../world/World.ts';
import type { Player } from '../entities/Player.ts';

/**
 * Kinematic character controller: camera-relative WASD movement + raycast to
 * ground. Deliberately NOT physics-engine backed for the slice (no slopes,
 * steps or dynamic obstacles to justify it yet).
 *
 * PHYSICS-SWAP POINT: the narrow `update(...)` interface mutates only the
 * Player transform via `world.sampleGround`. Replacing the internals with a
 * Rapier KinematicCharacterController later does not touch Player / Camera /
 * World callers. Adopt physics when slopes/steps/water-vehicles need it.
 */
export class CharacterController {
  private readonly worldDir = new THREE.Vector3();
  private readonly targetVel = new THREE.Vector3();
  private facing = 0; // current avatar yaw (radians)

  update(
    fixedDt: number,
    input: InputBundle,
    camera: FollowCamera,
    world: World,
    player: Player,
  ): void {
    player.previousPosition.copy(player.position);

    // 1. Input → camera-relative world direction (on the XZ plane).
    const move = input.moveVector();
    const forward = camera.getForwardXZ();
    const right = camera.getRightXZ();
    this.worldDir
      .set(0, 0, 0)
      .addScaledVector(right, move.x)
      .addScaledVector(forward, move.y);
    const moving = this.worldDir.lengthSq() > 1e-4;
    if (moving) this.worldDir.normalize();

    // 2. Accelerate horizontal velocity toward the target.
    const speed = GameConfig.move.speed * (input.actions.run ? 1.6 : 1);
    this.targetVel.copy(this.worldDir).multiplyScalar(moving ? speed : 0);
    const a = 1 - Math.exp(-GameConfig.move.acceleration * fixedDt);
    player.velocity.x = damp2(player.velocity.x, this.targetVel.x, a);
    player.velocity.z = damp2(player.velocity.z, this.targetVel.z, a);
    player.speedXZ = Math.hypot(player.velocity.x, player.velocity.z);

    // 3. Integrate horizontal position.
    const pos = player.position;
    pos.x += player.velocity.x * fixedDt;
    pos.z += player.velocity.z * fixedDt;

    // 4. Clamp to the active region's bounds.
    const region = world.activeRegion;
    if (region) {
      pos.x = clamp(pos.x, region.bounds.min.x, region.bounds.max.x);
      pos.z = clamp(pos.z, region.bounds.min.z, region.bounds.max.z);
    }

    // 5. Snap to ground (with a small gravity fall so edges later don't NaN).
    const hit = world.sampleGround(pos.x, pos.z);
    if (hit) {
      if (pos.y <= hit.y + 0.001 || player.grounded) {
        pos.y = hit.y;
        player.fall = 0;
        player.grounded = true;
      } else {
        player.fall -= GameConfig.gravity * fixedDt;
        pos.y += player.fall * fixedDt;
        if (pos.y <= hit.y) {
          pos.y = hit.y;
          player.fall = 0;
          player.grounded = true;
        }
      }
    }

    // 6. Rotate the avatar to face the travel direction.
    if (moving) {
      const targetYaw = Math.atan2(this.worldDir.x, this.worldDir.z);
      this.facing = dampAngle(this.facing, targetYaw, GameConfig.move.turnLerp, fixedDt);
      player.avatar.root.rotation.y = this.facing;
    }
  }
}

/** Lerp helper local to this file (the exponential factor is precomputed). */
function damp2(current: number, target: number, t: number): number {
  return current + (target - current) * t;
}
