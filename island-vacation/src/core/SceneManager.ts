import * as THREE from 'three';

export interface SceneBundle {
  scene: THREE.Scene;
  sun: THREE.DirectionalLight;
  hemi: THREE.HemisphereLight;
}

/**
 * Builds the scene, lighting and atmosphere. The camera is intentionally NOT
 * created here — the FollowCamera owns it. No OrbitControls.
 */
export function createScene(): SceneBundle {
  const scene = new THREE.Scene();
  const sky = new THREE.Color(0x9ad9ff);
  scene.background = sky;
  // Cheap depth cue that suits the cozy, hazy look. Region load() can retint.
  scene.fog = new THREE.FogExp2(0xbfe9ff, 0.012);

  // Sky/ground ambient — gives the toon shading its soft fill.
  const hemi = new THREE.HemisphereLight(0xcfeeff, 0x6b8f4a, 0.9);
  scene.add(hemi);

  // Sun — the key light. Shadows configured but disabled for the slice.
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.6);
  sun.position.set(30, 60, 20);
  sun.castShadow = false;
  scene.add(sun);
  scene.add(sun.target);

  return { scene, sun, hemi };
}
