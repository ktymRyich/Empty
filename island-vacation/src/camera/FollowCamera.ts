import * as THREE from 'three';
import { GameConfig } from '../config/GameConfig.ts';
import { dampVec3 } from '../utils/math.ts';

/**
 * Smoothed third-person chase camera. The controller asks this camera for its
 * forward/right axes so that movement is camera-relative (the "Go Vacation"
 * feel). For the slice the yaw is fixed (camera sits at a constant offset);
 * `setYaw` exists as the seam for mouse-drag / right-stick orbit later — the
 * controller math already consumes the camera axes, so enabling orbit is
 * additive.
 */
export class FollowCamera {
  readonly camera: THREE.PerspectiveCamera;
  private yaw = 0; // radians; 0 = camera behind, looking toward -Z
  private readonly desired = new THREE.Vector3();
  private readonly lookTarget = new THREE.Vector3();
  private readonly tmpForward = new THREE.Vector3();
  private readonly tmpRight = new THREE.Vector3();

  constructor(aspect: number) {
    const c = GameConfig.camera;
    this.camera = new THREE.PerspectiveCamera(c.fov, aspect, c.near, c.far);
    this.camera.position.set(0, c.height, c.distance);
    this.lookTarget.set(0, c.lookHeight, 0);
    this.camera.lookAt(this.lookTarget);
  }

  setYaw(yaw: number): void {
    this.yaw = yaw;
  }

  /** Place the camera instantly behind a target (used on spawn to avoid a
   *  visible swoop on the first frame). */
  snapTo(target: THREE.Vector3): void {
    this.computeDesired(target);
    this.camera.position.copy(this.desired);
    this.lookTarget.set(target.x, target.y + GameConfig.camera.lookHeight, target.z);
    this.camera.lookAt(this.lookTarget);
  }

  update(dt: number, target: THREE.Vector3): void {
    this.computeDesired(target);
    dampVec3(this.camera.position, this.desired, GameConfig.camera.lambda, dt);
    const look = this.tmpForward.set(
      target.x,
      target.y + GameConfig.camera.lookHeight,
      target.z,
    );
    dampVec3(this.lookTarget, look, GameConfig.camera.lambda, dt);
    this.camera.lookAt(this.lookTarget);
  }

  private computeDesired(target: THREE.Vector3): void {
    const c = GameConfig.camera;
    // Offset behind the target along the camera yaw.
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    this.desired.set(
      target.x + sin * c.distance,
      target.y + c.height,
      target.z + cos * c.distance,
    );
  }

  /** Horizontal forward direction (camera → target, flattened). */
  getForwardXZ(): THREE.Vector3 {
    this.tmpForward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
    return this.tmpForward;
  }

  /** Horizontal right direction. */
  getRightXZ(): THREE.Vector3 {
    this.tmpRight.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
    return this.tmpRight;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
