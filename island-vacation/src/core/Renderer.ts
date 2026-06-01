import * as THREE from 'three';

export interface RendererBundle {
  renderer: THREE.WebGLRenderer;
  resize: (w: number, h: number) => void;
}

/**
 * Plain forward renderer. A toon game wants crisp edges, so there is no bloom
 * / EffectComposer here. An outline post-pass can be added later behind this
 * same bundle interface without touching callers.
 */
export function createRenderer(container: HTMLElement): RendererBundle {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false; // off for the slice; enable later
  container.appendChild(renderer.domElement);
  renderer.setSize(container.clientWidth, container.clientHeight, false);

  const resize = (w: number, h: number) => {
    renderer.setSize(w, h, false);
  };

  return { renderer, resize };
}
