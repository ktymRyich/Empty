import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MODELS, type ModelKey } from './manifest.ts';

/**
 * Loads and caches glTF/GLB models.
 *
 * DRACO SEAM: generated glTF may be Draco-compressed. To enable, place the
 * decoder under `public/draco/` and wire a DRACOLoader in ONE place here:
 *   import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
 *   const draco = new DRACOLoader();
 *   draco.setDecoderPath('/draco/');
 *   this.loader.setDRACOLoader(draco);
 * (Likewise KTX2Loader / meshopt if textures/meshes ship compressed.)
 */
export class AssetManager {
  private readonly loader = new GLTFLoader();
  private readonly cache = new Map<ModelKey, Promise<GLTF>>();

  load(key: ModelKey): Promise<GLTF> {
    let pending = this.cache.get(key);
    if (!pending) {
      const url = MODELS[key];
      pending = this.loader.loadAsync(url);
      this.cache.set(key, pending);
    }
    return pending;
  }
}
