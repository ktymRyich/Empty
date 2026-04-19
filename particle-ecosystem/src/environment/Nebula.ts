import * as THREE from 'three';
import nebulaVert from '../shaders/nebula.vert';
import nebulaFrag from '../shaders/nebula.frag';

export interface NebulaBlob {
  center: THREE.Vector3;
  radius: number;
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
}

export class Nebula {
  blobs: NebulaBlob[] = [];

  constructor(scene: THREE.Scene, bounds: THREE.Box3) {
    const configs = [
      { c: new THREE.Vector3(-180, 0, -120), r: 220, a: 0x1a0033, b: 0x003366 },
      { c: new THREE.Vector3(220, 40, 140), r: 180, a: 0x330066, b: 0x004488 },
      { c: new THREE.Vector3(0, -50, 240), r: 160, a: 0x220044, b: 0x2266aa },
    ];
    void bounds;
    for (const cfg of configs) {
      const geom = new THREE.SphereGeometry(cfg.r, 24, 18);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: new THREE.Color(cfg.a) },
          uColorB: { value: new THREE.Color(cfg.b) },
          uCenter: { value: cfg.c.clone() },
          uRadius: { value: cfg.r },
        },
        vertexShader: nebulaVert,
        fragmentShader: nebulaFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(cfg.c);
      mesh.frustumCulled = false;
      scene.add(mesh);
      this.blobs.push({ center: cfg.c.clone(), radius: cfg.r, mesh, mat });
    }
  }

  update(elapsed: number) {
    for (const b of this.blobs) {
      b.mat.uniforms.uTime.value = elapsed;
    }
  }

  boostAt(x: number, y: number, z: number): number {
    let max = 0;
    for (const b of this.blobs) {
      const dx = x - b.center.x, dy = y - b.center.y, dz = z - b.center.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const t = Math.max(0, 1 - d / b.radius);
      if (t > max) max = t;
    }
    return max;
  }
}
