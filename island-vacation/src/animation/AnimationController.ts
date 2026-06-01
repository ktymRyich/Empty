import * as THREE from 'three';

/**
 * Thin wrapper over THREE.AnimationMixer. It is a no-op when the source has no
 * clips (the placeholder avatar), so the loop can always tick `update(dt)`
 * harmlessly. When generated assets bring `idle` / `walk` clips, wire clip
 * names + a speed-based state pick — no structural change to callers.
 */
export class AnimationController {
  private readonly mixer: THREE.AnimationMixer | null;
  private readonly actions = new Map<string, THREE.AnimationAction>();
  private current: string | null = null;

  constructor(root: THREE.Object3D, clips: THREE.AnimationClip[]) {
    if (clips.length === 0) {
      this.mixer = null;
      return;
    }
    this.mixer = new THREE.AnimationMixer(root);
    for (const clip of clips) {
      this.actions.set(clip.name, this.mixer.clipAction(clip));
    }
  }

  get hasClips(): boolean {
    return this.mixer !== null;
  }

  play(name: string, fade = 0.2): void {
    if (!this.mixer || this.current === name) return;
    const next = this.actions.get(name);
    if (!next) return;
    const prev = this.current ? this.actions.get(this.current) : undefined;
    next.reset().play();
    if (prev) prev.crossFadeTo(next, fade, false);
    this.current = name;
  }

  /** Speed-driven locomotion state pick. Safe to call with no clips. */
  updateLocomotion(speedXZ: number): void {
    if (!this.mixer) return;
    this.play(speedXZ > 0.2 ? 'walk' : 'idle');
  }

  update(dt: number): void {
    this.mixer?.update(dt);
  }
}
