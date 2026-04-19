import GUI from 'lil-gui';
import { SPECIES, Species } from '../entities/SpeciesConfig';

export interface SimParams {
  speedMultiplier: number;
  mutationRate: number;
  naturalSelection: boolean;
  flocking: { separation: number; alignment: number; cohesion: number; perception: number };
  blackHoleGravity: number;
  nebulaBoost: number;
  bloomIntensity: number;
  particleSize: number;
  trailLength: number;
  maxCounts: Record<string, number>;
  reset: () => void;
}

export function createSimParams(): SimParams {
  const maxCounts: Record<string, number> = {};
  for (const s of SPECIES) maxCounts[s.name] = s.maxCount;
  return {
    speedMultiplier: 1.0,
    mutationRate: 0.0,
    naturalSelection: false,
    flocking: { separation: 1.5, alignment: 1.0, cohesion: 0.9, perception: 55 },
    blackHoleGravity: 1.0,
    nebulaBoost: 2.5,
    bloomIntensity: 0.95,
    particleSize: 1.0,
    trailLength: 6,
    maxCounts,
    reset: () => {},
  };
}

export function mountGui(params: SimParams, hooks: {
  onParticleSizeChange: (v: number) => void;
  onBloomChange: (v: number) => void;
  onTrailChange: (v: number) => void;
  onMaxCountChange: (species: Species, v: number) => void;
  onReset: () => void;
  onRandomize: () => void;
}): GUI {
  const gui = new GUI({ title: 'Particle Ecosystem', width: 300 });

  // Top-level actions (always visible, above folders)
  const actions = {
    reset: () => hooks.onReset(),
    randomize: () => hooks.onRandomize(),
  };
  gui.add(actions, 'reset').name('▶ Reset (re-seed)');
  gui.add(actions, 'randomize').name('🎲 Randomize all');

  const sim = gui.addFolder('Simulation');
  sim.add(params, 'speedMultiplier', 0.1, 5.0, 0.1).name('Speed multiplier');

  const pop = gui.addFolder('Population Limits');
  for (const s of SPECIES) {
    const min = s.name === 'Plankton' ? 100 : s.name === 'Alpha' ? 5 : 10;
    const max = s.name === 'Plankton' ? 2000 : s.name === 'Alpha' ? 50 : 500;
    pop.add(params.maxCounts, s.name, min, max, 1).onChange((v: number) => hooks.onMaxCountChange(s.id, v));
  }
  pop.close();

  const flock = gui.addFolder('Flocking');
  flock.add(params.flocking, 'separation', 0, 3, 0.05).name('Separation');
  flock.add(params.flocking, 'alignment', 0, 3, 0.05).name('Alignment');
  flock.add(params.flocking, 'cohesion', 0, 3, 0.05).name('Cohesion');
  flock.add(params.flocking, 'perception', 10, 200, 1).name('Perception');

  const env = gui.addFolder('Environment');
  env.add(params, 'blackHoleGravity', 0, 5, 0.05).name('BlackHole gravity');
  env.add(params, 'nebulaBoost', 1, 5, 0.05).name('Nebula boost');

  const evo = gui.addFolder('Evolution');
  evo.add(params, 'mutationRate', 0, 0.1, 0.005).name('Mutation rate').onChange((v: number) => {
    (window as any).__mutationRate = v;
  });
  evo.add(params, 'naturalSelection').name('Natural selection');

  const vis = gui.addFolder('Visuals');
  vis.add(params, 'bloomIntensity', 0, 3, 0.05).name('Bloom intensity').onChange(hooks.onBloomChange);
  vis.add(params, 'particleSize', 0.5, 3, 0.05).name('Particle size').onChange(hooks.onParticleSizeChange);
  vis.add(params, 'trailLength', 0, 20, 1).name('Trail length').onChange(hooks.onTrailChange);

  return gui;
}
