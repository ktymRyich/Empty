export interface LoopCallbacks {
  /** Fixed-timestep simulation. Called 0..n times per frame draining the
   *  accumulator. All movement/physics must integrate against `fixedDt`. */
  update: (fixedDt: number, elapsed: number) => void;
  /** Called once per rendered frame. `alpha` is the interpolation factor
   *  (accumulator / fixedDt) for rendering between fixed states; `frameDt`
   *  is the real frame delta for cosmetic, non-deterministic smoothing
   *  (camera follow, etc). */
  render: (alpha: number, frameDt: number) => void;
}

/**
 * Fixed-timestep game loop with an accumulator. This is the foundation that
 * keeps movement deterministic and stable, and is a prerequisite for dropping
 * in a fixed-step physics engine (e.g. Rapier) later without reshaping the loop.
 */
export class Loop {
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private accumulator = 0;
  private running = false;
  private readonly fixedDt: number;
  private readonly callbacks: LoopCallbacks;

  constructor(callbacks: LoopCallbacks, fixedDt = 1 / 60) {
    this.callbacks = callbacks;
    this.fixedDt = fixedDt;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const frame = (now: number) => {
      if (!this.running) return;
      // Clamp the frame delta to avoid a spiral-of-death after a tab stall.
      const frameDt = Math.min((now - this.last) / 1000, 0.25);
      this.last = now;

      this.accumulator += frameDt;
      while (this.accumulator >= this.fixedDt) {
        this.elapsed += this.fixedDt;
        this.callbacks.update(this.fixedDt, this.elapsed);
        this.accumulator -= this.fixedDt;
      }

      const alpha = this.accumulator / this.fixedDt;
      this.callbacks.render(alpha, frameDt);

      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
