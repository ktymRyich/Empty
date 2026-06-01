import * as THREE from 'three';

/**
 * Abstract input. Controllers read ONLY `moveVector()` and the named action
 * booleans — never raw keys — so adding gamepad / touch later is purely
 * additive (they just feed the same abstract state).
 */
export interface InputBundle {
  /** Desired movement in input space: x = right(+)/left(-), y = forward(+)/back(-).
   *  Magnitude is clamped to 1. The controller maps this to world space using
   *  the camera orientation. */
  moveVector(): THREE.Vector2;
  readonly actions: { jump: boolean; run: boolean };
  /** Gamepad seam — no-op until implemented. Call once per fixed step. */
  pollGamepad(): void;
  dispose(): void;
}

const FORWARD_KEYS = new Set(['KeyW', 'ArrowUp']);
const BACK_KEYS = new Set(['KeyS', 'ArrowDown']);
const LEFT_KEYS = new Set(['KeyA', 'ArrowLeft']);
const RIGHT_KEYS = new Set(['KeyD', 'ArrowRight']);

export function createInput(target: Window = window): InputBundle {
  const pressed = new Set<string>();
  const actions = { jump: false, run: false };
  const out = new THREE.Vector2();

  const onKeyDown = (e: KeyboardEvent) => {
    pressed.add(e.code);
    if (e.code === 'Space') actions.jump = true;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') actions.run = true;
  };
  const onKeyUp = (e: KeyboardEvent) => {
    pressed.delete(e.code);
    if (e.code === 'Space') actions.jump = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') actions.run = false;
  };

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);

  const has = (set: Set<string>): boolean => {
    for (const k of set) if (pressed.has(k)) return true;
    return false;
  };

  return {
    moveVector() {
      const x = (has(RIGHT_KEYS) ? 1 : 0) - (has(LEFT_KEYS) ? 1 : 0);
      const y = (has(FORWARD_KEYS) ? 1 : 0) - (has(BACK_KEYS) ? 1 : 0);
      out.set(x, y);
      if (out.lengthSq() > 1) out.normalize();
      return out;
    },
    actions,
    pollGamepad() {
      // Seam: merge navigator.getGamepads() axes into the same state here.
    },
    dispose() {
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
    },
  };
}
