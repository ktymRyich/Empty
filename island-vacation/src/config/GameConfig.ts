/**
 * Central tunables for the game. Keeping these in one place makes the early
 * "feel" easy to iterate on, and gives later systems (physics swap, regions,
 * transports) a single source of truth.
 */
export const GameConfig = {
  /** Fixed simulation step. Movement/physics integrate against this only. */
  fixedDt: 1 / 60,

  /** Canonical avatar dimensions. Generated glTF gets normalized to these so
   *  the controller/camera never depend on whatever scale the art ships at. */
  avatar: {
    height: 1.7, // metres, feet at y=0
    radius: 0.35,
    headsTall: 4.5, // 4-5 heads-tall stylised proportions
    // Base yaw (radians) applied to a generated model so it faces forward (-Z).
    // If your avatar.glb faces the wrong way, set this: Math.PI = 180°,
    // Math.PI / 2 / -Math.PI / 2 = quarter turns.
    modelYawOffset: 0,
  },

  /** Ground locomotion. */
  move: {
    speed: 6, // m/s top walking speed
    acceleration: 35, // how fast we reach target velocity
    turnLerp: 14, // how fast the avatar rotates to face travel direction
  },

  /** Downward acceleration. Kept even though slice ground is walkable, so
   *  stepping off an edge later doesn't NaN. */
  gravity: 24,

  /** Third-person follow camera. */
  camera: {
    distance: 8,
    height: 3.5,
    lookHeight: 1.2,
    lambda: 6, // exponential follow smoothing (higher = snappier)
    fov: 55,
    near: 0.1,
    far: 2000,
  },

} as const;
