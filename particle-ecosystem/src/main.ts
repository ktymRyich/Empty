import * as THREE from 'three';
import { createRenderer } from './core/Renderer';
import { createScene, createStarfield } from './core/SceneManager';
import { Loop } from './core/Loop';
import { ParticleSystem } from './entities/ParticleSystem';
import { SPECIES, Species } from './entities/SpeciesConfig';
import { applyFlocking } from './behaviors/Flocking';
import { applyPredation } from './behaviors/Predation';
import { updateLifecycle } from './behaviors/Reproduction';
import { Nebula } from './environment/Nebula';
import { BlackHoleField } from './environment/BlackHole';
import { AsteroidBelt } from './environment/AsteroidBelt';
import { createSimParams, mountGui } from './ui/Controls';

const container = document.getElementById('app')!;
const hudStats = document.getElementById('hud-stats')!;

const { scene, camera, controls, worldBounds } = createScene(container);
const { renderer, composer, bloomPass, resize } = createRenderer(container, scene, camera);

createStarfield(scene);

const nebula = new Nebula(scene, worldBounds);
const blackHoles = new BlackHoleField(scene);
const asteroids = new AsteroidBelt(scene);

const system = new ParticleSystem(scene, renderer.getPixelRatio());
system.seed(worldBounds);

const params = createSimParams();
(window as any).__mutationRate = params.mutationRate;

// Trail effect via fade plane overlay
const trailCanvas = renderer.domElement;
void trailCanvas;

const gui = mountGui(params, {
  onParticleSizeChange: (v) => system.setSizeScale(v),
  onBloomChange: (v) => (bloomPass.strength = v),
  onTrailChange: (v) => {
    // Lower-friction frame persistence via renderer autoClear handling
    (renderer as any).__trail = v;
  },
  onMaxCountChange: (sp, v) => {
    SPECIES[sp].maxCount = Math.floor(v);
  },
  onReset: () => {
    for (const p of system.particles) system.kill(p);
    system.compactDead();
    system.seed(worldBounds);
  },
  onRandomize: () => {
    // Randomize simulation parameters + reseed population
    params.speedMultiplier = 0.5 + Math.random() * 1.5;
    params.mutationRate = Math.random() * 0.05;
    params.flocking.separation = 0.5 + Math.random() * 2.0;
    params.flocking.alignment = 0.3 + Math.random() * 1.7;
    params.flocking.cohesion = 0.3 + Math.random() * 1.7;
    params.flocking.perception = 30 + Math.random() * 120;
    params.blackHoleGravity = Math.random() * 2.5;
    params.nebulaBoost = 1 + Math.random() * 3;
    (window as any).__mutationRate = params.mutationRate;
    gui.controllersRecursive().forEach((c) => c.updateDisplay());
    for (const p of system.particles) system.kill(p);
    system.compactDead();
    system.seed(worldBounds);
  },
});
void gui;

bloomPass.strength = params.bloomIntensity;

// Mouse interaction
const mouseNDC = new THREE.Vector2();
const mouseRaycaster = new THREE.Raycaster();
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const mouseHit = new THREE.Vector3();
let mouseActive = false;
let mouseMode: 'attract' | 'repel' | null = null;

function updateMouseWorld(e: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  mouseRaycaster.setFromCamera(mouseNDC, camera);
  mouseRaycaster.ray.intersectPlane(mousePlane, mouseHit);
}

window.addEventListener('mousedown', (e) => {
  if (e.button === 0 && e.shiftKey) { mouseMode = 'attract'; mouseActive = true; controls.enabled = false; }
  else if (e.button === 2) { mouseMode = 'repel'; mouseActive = true; controls.enabled = false; }
  updateMouseWorld(e);
});
window.addEventListener('mousemove', (e) => {
  if (mouseActive) updateMouseWorld(e);
});
window.addEventListener('mouseup', () => { mouseActive = false; mouseMode = null; controls.enabled = true; });
window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('resize', () => {
  const w = container.clientWidth, h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  resize(w, h);
});

// HUD updater
let hudTimer = 0;
function updateHud(dt: number, fps: number) {
  hudTimer += dt;
  if (hudTimer < 0.5) return;
  hudTimer = 0;
  const lines = [`FPS: ${fps.toFixed(0)}   Total: ${system.totalAlive}`];
  for (const def of SPECIES) {
    lines.push(`${def.name.padEnd(11)} ${system.counters[def.id]}`);
  }
  hudStats.textContent = lines.join('\n');
  hudStats.style.whiteSpace = 'pre';
}

let fpsSmooth = 60;
const tmpVec = new THREE.Vector3();

new Loop((dt, elapsed) => {
  const simDt = dt * params.speedMultiplier;
  fpsSmooth = fpsSmooth * 0.9 + (1 / Math.max(dt, 1e-4)) * 0.1;

  controls.update();
  nebula.update(elapsed);
  blackHoles.gravity = params.blackHoleGravity;
  blackHoles.update(dt);

  // Rebuild neighbor grid
  system.rebuildGrid();

  const bounds = worldBounds;
  const minX = bounds.min.x, maxX = bounds.max.x;
  const minY = bounds.min.y, maxY = bounds.max.y;
  const minZ = bounds.min.z, maxZ = bounds.max.z;

  const parts = system.particles;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p.alive) continue;
    p.ax = 0; p.ay = 0; p.az = 0;

    applyFlocking(p, system, params.flocking);
    applyPredation(p, system, simDt);

    // wander
    const def = SPECIES[p.species];
    p.ax += (Math.random() - 0.5) * def.wanderStrength * 6;
    p.ay += (Math.random() - 0.5) * def.wanderStrength * 3;
    p.az += (Math.random() - 0.5) * def.wanderStrength * 6;

    // environment
    if (!blackHoles.apply(p, simDt)) {
      system.kill(p);
      continue;
    }
    asteroids.apply(p, simDt);

    // mouse field
    if (mouseActive && mouseMode) {
      const dx = mouseHit.x - p.px;
      const dy = mouseHit.y - p.py;
      const dz = mouseHit.z - p.pz;
      const d2 = dx * dx + dy * dy + dz * dz + 4;
      const range2 = 180 * 180;
      if (d2 < range2) {
        const d = Math.sqrt(d2);
        const f = (1 - d / 180) * 40;
        const sign = mouseMode === 'attract' ? 1 : -1;
        p.ax += (dx / d) * f * sign;
        p.ay += (dy / d) * f * sign;
        p.az += (dz / d) * f * sign;
      }
    }

    // integrate
    p.vx += p.ax * simDt;
    p.vy += p.ay * simDt;
    p.vz += p.az * simDt;

    // damping
    const damp = 0.985;
    p.vx *= damp; p.vy *= damp; p.vz *= damp;

    // speed limit
    const maxS = def.maxSpeed * p.speedMul;
    const v2 = p.vx * p.vx + p.vy * p.vy + p.vz * p.vz;
    if (v2 > maxS * maxS) {
      const inv = maxS / Math.sqrt(v2);
      p.vx *= inv; p.vy *= inv; p.vz *= inv;
    }

    p.px += p.vx * simDt * 8;
    p.py += p.vy * simDt * 8;
    p.pz += p.vz * simDt * 8;

    // soft boundary: bounce back
    if (p.px < minX) { p.px = minX; p.vx = Math.abs(p.vx) * 0.5; }
    if (p.px > maxX) { p.px = maxX; p.vx = -Math.abs(p.vx) * 0.5; }
    if (p.py < minY) { p.py = minY; p.vy = Math.abs(p.vy) * 0.5; }
    if (p.py > maxY) { p.py = maxY; p.vy = -Math.abs(p.vy) * 0.5; }
    if (p.pz < minZ) { p.pz = minZ; p.vz = Math.abs(p.vz) * 0.5; }
    if (p.pz > maxZ) { p.pz = maxZ; p.vz = -Math.abs(p.vz) * 0.5; }

    // lifecycle
    const boost = nebula.boostAt(p.px, p.py, p.pz) * (params.nebulaBoost - 1);
    updateLifecycle(p, system, simDt, boost);
  }

  // Natural selection: if off, clamp size/speed mutations back
  if (!params.naturalSelection && params.mutationRate === 0) {
    // nothing to do
  }

  system.compactDead();
  system.writeBuffers();

  composer.render();

  updateHud(dt, fpsSmooth);

  void tmpVec;
}).start();
