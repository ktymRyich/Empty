export interface HudInfo {
  position: { x: number; y: number; z: number };
  region: string;
  fps: number;
}

export interface Hud {
  update(info: HudInfo): void;
}

/**
 * Minimal debug HUD writing into #hud-stats. lil-gui can be mounted alongside
 * this later for live tuning of GameConfig — this is the seam for it.
 */
export function mountHud(): Hud {
  const el = document.getElementById('hud-stats');
  let acc = 0;
  let frames = 0;
  let shownFps = 0;

  return {
    update(info: HudInfo) {
      // Smooth the FPS readout over ~0.5s.
      frames++;
      acc += 1 / Math.max(info.fps, 1);
      if (acc >= 0.5) {
        shownFps = Math.round(frames / acc);
        acc = 0;
        frames = 0;
      }
      if (!el) return;
      const p = info.position;
      el.textContent =
        `region: ${info.region}  |  ` +
        `pos: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}  |  ` +
        `${shownFps} fps`;
    },
  };
}
