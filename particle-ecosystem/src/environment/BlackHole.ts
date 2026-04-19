import * as THREE from 'three';
import { Particle } from '../entities/Particle';

export interface BlackHoleDef {
  position: THREE.Vector3;
  mass: number;
  eventHorizon: number;
  visual: THREE.Object3D;
}

export class BlackHoleField {
  holes: BlackHoleDef[] = [];
  gravity = 1.0;

  constructor(scene: THREE.Scene) {
    const configs = [
      { pos: new THREE.Vector3(-140, 20, 180), mass: 8000, eh: 10 },
      { pos: new THREE.Vector3(200, -40, -160), mass: 6000, eh: 8 },
    ];
    for (const cfg of configs) {
      const group = new THREE.Group();
      group.position.copy(cfg.pos);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.eh, 24, 16),
        new THREE.MeshBasicMaterial({ color: 0x000000 }),
      );
      group.add(core);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.eh * 2.4, 32, 20),
        new THREE.ShaderMaterial({
          uniforms: { uColor: { value: new THREE.Color(0x4400ff) } },
          vertexShader: `
            varying vec3 vN;
            void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
          `,
          fragmentShader: `
            precision highp float; uniform vec3 uColor; varying vec3 vN;
            void main() {
              float rim = pow(1.0 - abs(vN.z), 2.5);
              gl_FragColor = vec4(uColor * rim * 1.8, rim * 0.9);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.FrontSide,
        }),
      );
      group.add(glow);

      // orbit disc
      const disc = new THREE.Mesh(
        new THREE.RingGeometry(cfg.eh * 1.5, cfg.eh * 4.5, 64),
        new THREE.MeshBasicMaterial({
          color: 0x9966ff,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      disc.rotation.x = Math.random() * Math.PI * 2;
      disc.rotation.y = Math.random() * Math.PI * 2;
      (disc as any).__spin = (Math.random() * 0.5 + 0.3);
      group.add(disc);

      scene.add(group);
      this.holes.push({ position: cfg.pos.clone(), mass: cfg.mass, eventHorizon: cfg.eh, visual: group });
    }
  }

  update(dt: number) {
    for (const h of this.holes) {
      for (const child of h.visual.children) {
        const spin = (child as any).__spin;
        if (spin) child.rotation.z += spin * dt;
      }
    }
  }

  apply(p: Particle, dt: number): boolean {
    for (const h of this.holes) {
      const dx = h.position.x - p.px;
      const dy = h.position.y - p.py;
      const dz = h.position.z - p.pz;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < h.eventHorizon * h.eventHorizon) return false;
      const d = Math.sqrt(d2) + 0.001;
      const a = (this.gravity * h.mass) / (d2 + 25);
      p.ax += (dx / d) * a;
      p.ay += (dy / d) * a;
      p.az += (dz / d) * a;
      // tangential spiral
      const tanX = -dz / d, tanZ = dx / d;
      p.ax += tanX * a * 0.35;
      p.az += tanZ * a * 0.35;
    }
    void dt;
    return true;
  }
}
