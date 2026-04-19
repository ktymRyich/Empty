import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface RendererBundle {
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  resize: (w: number, h: number) => void;
}

export function createRenderer(
  container: HTMLElement,
  scene: THREE.Scene,
  camera: THREE.Camera,
): RendererBundle {
  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000010, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  const size = new THREE.Vector2(container.clientWidth, container.clientHeight);
  renderer.setSize(size.x, size.y, false);

  const composer = new EffectComposer(renderer);
  composer.setSize(size.x, size.y);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(size, 1.2, 0.8, 0.18);
  composer.addPass(bloomPass);

  composer.addPass(new OutputPass());

  const resize = (w: number, h: number) => {
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
  };

  return { renderer, composer, bloomPass, resize };
}
