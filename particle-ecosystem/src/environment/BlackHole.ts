import * as THREE from 'three';
import { Particle } from '../entities/Particle';
import accretionVert from '../shaders/accretion.vert';
import accretionFrag from '../shaders/accretion.frag';

export interface BlackHoleDef {
  position: THREE.Vector3;
  mass: number;
  eventHorizon: number;
  visual: THREE.Object3D;
}

interface DiscEntry {
  mesh: THREE.Mesh;
  mat: THREE.ShaderMaterial;
  baseTilt: THREE.Euler;
}

export class BlackHoleField {
  holes: BlackHoleDef[] = [];
  private discs: DiscEntry[] = [];
  gravity = 1.0;

  constructor(scene: THREE.Scene) {
    const configs = [
      {
        pos: new THREE.Vector3(-140, 20, 180), mass: 8000, eh: 10,
        hot: new THREE.Color(0xfff4d8),
        mid: new THREE.Color(0xff5cc2),
        cool: new THREE.Color(0x2a1a8a),
        tilt: new THREE.Euler(Math.PI * 0.45, 0.2, 0.6),
      },
      {
        pos: new THREE.Vector3(200, -40, -160), mass: 6000, eh: 8,
        hot: new THREE.Color(0xfff0a8),
        mid: new THREE.Color(0x8a7bff),
        cool: new THREE.Color(0x1a0a55),
        tilt: new THREE.Euler(Math.PI * 0.55, -0.3, -0.4),
      },
    ];
    for (const cfg of configs) {
      const group = new THREE.Group();
      group.position.copy(cfg.pos);

      // Pure black sphere at event horizon
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.eh, 48, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000 }),
      );
      group.add(core);

      // Inner rim: thin intense halo
      const rim = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.eh * 1.25, 48, 32),
        new THREE.ShaderMaterial({
          uniforms: { uColor: { value: cfg.hot.clone() } },
          vertexShader: `
            varying vec3 vN;
            void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
          `,
          fragmentShader: `
            precision highp float; uniform vec3 uColor; varying vec3 vN;
            void main() {
              float rim = pow(1.0 - abs(vN.z), 4.0);
              gl_FragColor = vec4(uColor * rim * 2.6, rim);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.FrontSide,
        }),
      );
      group.add(rim);

      // Outer volumetric glow
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.eh * 3.0, 48, 32),
        new THREE.ShaderMaterial({
          uniforms: { uColor: { value: cfg.mid.clone() } },
          vertexShader: `
            varying vec3 vN;
            void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
          `,
          fragmentShader: `
            precision highp float; uniform vec3 uColor; varying vec3 vN;
            void main() {
              float rim = pow(1.0 - abs(vN.z), 2.2);
              gl_FragColor = vec4(uColor * rim * 0.9, rim * 0.6);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.FrontSide,
        }),
      );
      group.add(glow);

      // High-res accretion disc with shader
      const inner = cfg.eh * 1.4;
      const outer = cfg.eh * 6.5;
      const discGeom = new THREE.RingGeometry(inner, outer, 256, 4);
      const discMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uInner: { value: inner },
          uOuter: { value: outer },
          uHot: { value: cfg.hot.clone() },
          uMid: { value: cfg.mid.clone() },
          uCool: { value: cfg.cool.clone() },
        },
        vertexShader: accretionVert,
        fragmentShader: accretionFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.rotation.copy(cfg.tilt);
      group.add(disc);

      // Secondary thinner disc rotated the other way for depth
      const disc2Geom = new THREE.RingGeometry(inner * 1.1, outer * 0.75, 256, 3);
      const disc2Mat = discMat.clone();
      disc2Mat.uniforms = {
        uTime: { value: 0 },
        uInner: { value: inner * 1.1 },
        uOuter: { value: outer * 0.75 },
        uHot: { value: cfg.hot.clone() },
        uMid: { value: cfg.mid.clone() },
        uCool: { value: cfg.cool.clone() },
      };
      const disc2 = new THREE.Mesh(disc2Geom, disc2Mat);
      disc2.rotation.copy(cfg.tilt);
      disc2.rotation.z += 0.4;
      disc2.rotation.x += 0.15;
      group.add(disc2);

      this.discs.push({ mesh: disc, mat: discMat, baseTilt: cfg.tilt });
      this.discs.push({ mesh: disc2, mat: disc2Mat, baseTilt: cfg.tilt });

      scene.add(group);
      this.holes.push({ position: cfg.pos.clone(), mass: cfg.mass, eventHorizon: cfg.eh, visual: group });
    }
  }

  update(_dt: number, elapsed: number) {
    for (const d of this.discs) {
      d.mat.uniforms.uTime.value = elapsed;
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
