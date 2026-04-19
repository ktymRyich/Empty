import * as THREE from 'three';

export class SpatialHashGrid {
  private cellSize: number;
  private invCell: number;
  private cells = new Map<number, number[]>();

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.invCell = 1 / cellSize;
  }

  clear() {
    this.cells.clear();
  }

  private key(ix: number, iy: number, iz: number): number {
    return ((ix | 0) * 73856093) ^ ((iy | 0) * 19349663) ^ ((iz | 0) * 83492791);
  }

  insert(index: number, x: number, y: number, z: number) {
    const ix = Math.floor(x * this.invCell);
    const iy = Math.floor(y * this.invCell);
    const iz = Math.floor(z * this.invCell);
    const k = this.key(ix, iy, iz);
    let cell = this.cells.get(k);
    if (!cell) {
      cell = [];
      this.cells.set(k, cell);
    }
    cell.push(index);
  }

  queryRadius(p: THREE.Vector3, radius: number, out: number[]): number[] {
    out.length = 0;
    const r = Math.max(1, Math.ceil(radius * this.invCell));
    const cx = Math.floor(p.x * this.invCell);
    const cy = Math.floor(p.y * this.invCell);
    const cz = Math.floor(p.z * this.invCell);
    for (let dz = -r; dz <= r; dz++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const cell = this.cells.get(this.key(cx + dx, cy + dy, cz + dz));
          if (!cell) continue;
          for (let i = 0; i < cell.length; i++) out.push(cell[i]);
        }
      }
    }
    return out;
  }
}
