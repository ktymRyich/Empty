uniform float uPixelRatio;
uniform float uSizeScale;

attribute float aSize;
attribute vec3 aColor;
attribute float aEnergy;

varying vec3 vColor;
varying float vEnergy;

void main() {
  vColor = aColor;
  vEnergy = aEnergy;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float dist = -mvPosition.z;
  float size = aSize * uSizeScale * uPixelRatio * (180.0 / max(dist, 1.0));
  gl_PointSize = clamp(size, 2.0, 128.0);
}
