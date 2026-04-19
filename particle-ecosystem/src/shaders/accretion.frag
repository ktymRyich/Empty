precision highp float;

uniform float uTime;
uniform float uInner;
uniform float uOuter;
uniform vec3 uHot;
uniform vec3 uMid;
uniform vec3 uCool;

varying vec2 vLocal;

float hash(float n) { return fract(sin(n) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(dot(i, vec2(1.0, 57.0)));
  float b = hash(dot(i + vec2(1.0, 0.0), vec2(1.0, 57.0)));
  float c = hash(dot(i + vec2(0.0, 1.0), vec2(1.0, 57.0)));
  float d = hash(dot(i + vec2(1.0, 1.0), vec2(1.0, 57.0)));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.13;
    a *= 0.5;
  }
  return v;
}

void main() {
  float r = length(vLocal);
  float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
  float phi = atan(vLocal.y, vLocal.x);

  // Differential rotation: inner faster than outer
  float angularVel = mix(2.4, 0.55, t);
  float phiRot = phi + uTime * angularVel;

  // Spiral arms (logarithmic)
  float spiral = phiRot * 2.0 - log(max(r, 1.0)) * 2.2;
  float bandNoise = fbm(vec2(spiral * 1.8, r * 0.025));
  float band = 0.35 + 0.65 * smoothstep(0.35, 0.9, bandNoise);

  // Temperature gradient: hot inside -> cool outside
  vec3 col;
  if (t < 0.35) {
    col = mix(uHot, uMid, smoothstep(0.0, 0.35, t));
  } else {
    col = mix(uMid, uCool, smoothstep(0.35, 1.0, t));
  }

  // Soft inner / outer edges
  float innerFade = smoothstep(0.0, 0.18, t);
  float outerFade = smoothstep(1.0, 0.7, t);
  float edgeFade = innerFade * outerFade;

  // Thin disk cross-section
  float intensity = band * edgeFade;
  vec3 finalCol = col * (0.6 + 1.7 * intensity);
  float alpha = edgeFade * (0.25 + 0.7 * band);

  gl_FragColor = vec4(finalCol, alpha);
}
