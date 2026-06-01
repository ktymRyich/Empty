import * as THREE from 'three';
import type { Region, RegionContext, Season } from '../Region.ts';
import { Ground } from '../Ground.ts';

/** Gentle rolling height field — also used to displace the terrain mesh so the
 *  raycast ground and the visual mesh agree exactly. */
function hillHeight(x: number, z: number): number {
  return (
    Math.sin(x * 0.06) * Math.cos(z * 0.05) * 1.6 +
    Math.sin(x * 0.13 + z * 0.07) * 0.6
  );
}

/**
 * The single region for the first vertical slice: a spring grassland. Builds a
 * subdivided, gently displaced ground plane (the raycast target), a handful of
 * placeholder props so the space reads as a place, and a spring colour mood.
 * Requires zero external assets, so the game runs before any art exists.
 */
export class SpringGrassland implements Region {
  readonly id = 'spring-grassland';
  readonly season: Season = 'spring';
  readonly bounds = new THREE.Box3(
    new THREE.Vector3(-60, -20, -60),
    new THREE.Vector3(60, 40, 60),
  );

  private readonly group = new THREE.Group();
  private ground!: Ground;
  private grassMat?: THREE.MeshToonMaterial;

  async load(ctx: RegionContext): Promise<void> {
    const SIZE = 130;
    const SEG = 96;
    const geom = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    geom.rotateX(-Math.PI / 2); // lay flat on XZ
    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, hillHeight(x, z));
    }
    geom.computeVertexNormals();

    this.grassMat = new THREE.MeshToonMaterial({ color: 0x7cc24a });
    const groundMesh = new THREE.Mesh(geom, this.grassMat);
    groundMesh.name = 'ground';
    this.group.add(groundMesh);

    this.scatterProps();

    ctx.scene.add(this.group);
    this.ground = new Ground(groundMesh);

    // Spring mood: warm haze.
    if (ctx.scene.fog instanceof THREE.FogExp2) {
      ctx.scene.fog.color.set(0xcdeecb);
    }
  }

  private scatterProps(): void {
    const rng = mulberry32(1337);
    const trunkMat = new THREE.MeshToonMaterial({ color: 0x7a5230 });
    const leafMats = [0x5fae3a, 0x4f9c30, 0xf6a6c8].map(
      (c) => new THREE.MeshToonMaterial({ color: c }),
    );
    const rockMat = new THREE.MeshToonMaterial({ color: 0x9aa0a6 });

    for (let i = 0; i < 40; i++) {
      const x = (rng() - 0.5) * 110;
      const z = (rng() - 0.5) * 110;
      const y = hillHeight(x, z);
      if (rng() < 0.7) {
        // tree: trunk + cone canopy (pink for cherry-blossom variety)
        const tree = new THREE.Group();
        const h = 1.6 + rng() * 1.4;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, h, 6), trunkMat);
        trunk.position.y = h / 2;
        const canopy = new THREE.Mesh(
          new THREE.ConeGeometry(1.0 + rng() * 0.6, 1.8 + rng() * 1.0, 7),
          leafMats[(rng() * leafMats.length) | 0],
        );
        canopy.position.y = h + 0.7;
        tree.add(trunk, canopy);
        tree.position.set(x, y, z);
        this.group.add(tree);
      } else {
        // rock
        const r = 0.4 + rng() * 0.8;
        const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), rockMat);
        rock.position.set(x, y + r * 0.4, z);
        rock.rotation.set(rng() * 3, rng() * 3, rng() * 3);
        this.group.add(rock);
      }
    }
  }

  unload(): void {
    this.group.removeFromParent();
    this.group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const m = o.material as THREE.Material | THREE.Material[];
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else m.dispose();
      }
    });
  }

  update(_dt: number): void {
    // Seam for grass sway / falling petals later.
  }

  getGround(): Ground {
    return this.ground;
  }
}

/** Tiny deterministic PRNG so prop placement is stable across reloads. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
