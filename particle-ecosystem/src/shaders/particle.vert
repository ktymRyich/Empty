uniform float uPixelRatio;
uniform float uSizeScale;

attribute float aSize;
attribute vec3 aColor;
attribute float aEnergy;
attribute vec3 aVel;

varying vec3 vColor;
varying float vEnergy;
varying float vRot;

void main() {
  vColor = aColor;
  vEnergy = aEnergy;

  vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
  vec4 viewTip = modelViewMatrix * vec4(position + aVel, 1.0);

  vec2 p0 = viewPos.xy / max(-viewPos.z, 0.0001);
  vec2 p1 = viewTip.xy / max(-viewTip.z, 0.0001);
  vec2 dir = p1 - p0;
  float dirLen = length(dir);
  vRot = dirLen > 1e-4 ? atan(dir.y, dir.x) - 1.5707963 : 0.0;

  gl_Position = projectionMatrix * viewPos;

  float dist = -viewPos.z;
  float size = aSize * uSizeScale * uPixelRatio * (260.0 / max(dist, 1.0));
  gl_PointSize = clamp(size, 3.0, 256.0);
}
