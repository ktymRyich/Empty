import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GameConfig } from '../config/GameConfig.ts';

/**
 * The visual representation of the player. The rest of the game depends only
 * on `root` (an Object3D normalized to canonical avatar dimensions) and the
 * exposed `clips`. Whether `root` is a primitive placeholder or a generated
 * glTF is invisible to the controller / camera / animation systems.
 */
export class Avatar {
  readonly root: THREE.Object3D;
  /** Animation clips, if the source provided any (placeholder has none). */
  readonly clips: THREE.AnimationClip[];
  private bobTime = 0;
  private readonly visual: THREE.Object3D;

  private constructor(root: THREE.Object3D, clips: THREE.AnimationClip[], visual: THREE.Object3D) {
    this.root = root;
    this.clips = clips;
    this.visual = visual;
  }

  /** A 4–5 heads-tall stylised humanoid from primitives, flat toon-shaded.
   *  Faces -Z (with a small nose marker so facing is readable). */
  static createPlaceholder(): Avatar {
    const root = new THREE.Group();
    const visual = new THREE.Group();
    root.add(visual);

    const { height, headsTall } = GameConfig.avatar;
    const headSize = height / headsTall; // diameter of one "head"
    const headR = headSize * 0.5;
    const bodyH = height - headSize; // body occupies the rest
    const bodyR = headR * 0.95;

    const skin = new THREE.MeshToonMaterial({ color: 0xffd9b3 });
    const shirt = new THREE.MeshToonMaterial({ color: 0x4aa3df });
    const pants = new THREE.MeshToonMaterial({ color: 0x35506b });

    // Body (capsule) centred so feet sit at y=0.
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(bodyR, bodyH - bodyR * 2, 6, 12),
      shirt,
    );
    body.position.y = bodyH / 2;
    visual.add(body);

    // Head.
    const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 16, 12), skin);
    head.position.y = bodyH + headR * 0.9;
    visual.add(head);

    // Nose marker (forward = -Z).
    const nose = new THREE.Mesh(new THREE.ConeGeometry(headR * 0.18, headR * 0.4, 8), skin);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, head.position.y, -headR);
    visual.add(nose);

    // Simple legs for proportion.
    const legGeo = new THREE.CapsuleGeometry(bodyR * 0.5, bodyH * 0.3, 4, 8);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(legGeo, pants);
      leg.position.set(side * bodyR * 0.5, bodyH * 0.18, 0);
      visual.add(leg);
    }

    return new Avatar(root, [], visual);
  }

  /** Wrap a generated glTF: normalize so feet sit at y=0 and total height
   *  matches the canonical avatar height the controller assumes. */
  static fromGLTF(gltf: GLTF): Avatar {
    const root = new THREE.Group();
    const visual = gltf.scene;
    root.add(visual);

    const box = new THREE.Box3().setFromObject(visual);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = size.y > 0 ? GameConfig.avatar.height / size.y : 1;
    visual.scale.setScalar(scale);

    // Orient the model to face forward (-Z); configurable per generated asset.
    visual.rotation.y = GameConfig.avatar.modelYawOffset;

    // Re-measure after scaling/rotation and seat the feet at y=0.
    const scaledBox = new THREE.Box3().setFromObject(visual);
    visual.position.y -= scaledBox.min.y;
    // Centre horizontally on the root.
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    visual.position.x -= center.x;
    visual.position.z -= center.z;

    return new Avatar(root, gltf.animations ?? [], visual);
  }

  /** Cosmetic walk bob, sells motion before real animation clips exist. */
  update(dt: number, speedXZ: number): void {
    if (this.clips.length > 0) return; // real animation drives motion instead
    const moving = speedXZ > 0.1;
    this.bobTime += dt * speedXZ * 2.2;
    const bob = moving ? Math.abs(Math.sin(this.bobTime)) * 0.08 : 0;
    this.visual.position.y = bob;
  }
}
