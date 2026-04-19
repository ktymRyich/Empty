import * as THREE from 'three';
import { Particle } from '../entities/Particle';

interface Asteroid {
  position: THREE.Vector3;
  radius: number;
}

export class AsteroidBelt {
  asteroids: Asteroid[] = [];

  constructor(scene: THREE.Scene) {
    const count = 22;
    const geom = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x444455,
      roughness: 0.9,
      metalness: 0.1,
      emissive: 0x050510,
    });
    const mesh = new THREE.InstancedMesh(geom, mat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * 18;
      const x = (Math.random() - 0.5) * 900;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 900;
      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.setScalar(r);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      this.asteroids.push({ position: new THREE.Vector3(x, y, z), radius: r });
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);

    const ambient = new THREE.AmbientLight(0x223355, 0.6);
    const dir = new THREE.DirectionalLight(0x8899ff, 0.5);
    dir.position.set(300, 400, 200);
    scene.add(ambient, dir);
  }

  apply(p: Particle, _dt: number) {
    for (const a of this.asteroids) {
      const dx = p.px - a.position.x;
      const dy = p.py - a.position.y;
      const dz = p.pz - a.position.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const avoid = a.radius + 12;
      if (d2 < avoid * avoid) {
        const d = Math.sqrt(d2) + 0.001;
        const s = (avoid - d) / avoid;
        p.ax += (dx / d) * s * 60;
        p.ay += (dy / d) * s * 60;
        p.az += (dz / d) * s * 60;
      }
    }
  }
}
