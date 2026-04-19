import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneBundle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  worldBounds: THREE.Box3;
}

export function createScene(container: HTMLElement): SceneBundle {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x00000a);
  scene.fog = new THREE.FogExp2(0x00000a, 0.0015);

  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(55, aspect, 1, 4000);
  camera.position.set(0, 120, 520);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 80;
  controls.maxDistance = 1200;
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.PAN,
  };

  const half = 500;
  const worldBounds = new THREE.Box3(
    new THREE.Vector3(-half, -half * 0.6, -half),
    new THREE.Vector3(half, half * 0.6, half),
  );

  return { scene, camera, controls, worldBounds };
}

export function createStarfield(scene: THREE.Scene): void {
  const layers = [
    { count: 2400, range: 2400, size: 1.4, color: 0xaaccff, opacity: 0.9 },
    { count: 1600, range: 3200, size: 1.0, color: 0x667788, opacity: 0.7 },
    { count: 800, range: 3800, size: 0.8, color: 0xffeecc, opacity: 0.5 },
  ];

  for (const layer of layers) {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(layer.count * 3);
    for (let i = 0; i < layer.count; i++) {
      const r = layer.range * (0.55 + Math.random() * 0.45);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: layer.color,
      size: layer.size,
      sizeAttenuation: true,
      transparent: true,
      opacity: layer.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geom, mat);
    points.frustumCulled = false;
    scene.add(points);
  }
}
