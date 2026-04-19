export type Tick = (dt: number, elapsed: number) => void;

export class Loop {
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private tick: Tick;
  private running = false;

  constructor(tick: Tick) {
    this.tick = tick;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const frame = (now: number) => {
      if (!this.running) return;
      const rawDt = (now - this.last) / 1000;
      this.last = now;
      const dt = Math.min(rawDt, 0.05);
      this.elapsed += dt;
      this.tick(dt, this.elapsed);
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}
