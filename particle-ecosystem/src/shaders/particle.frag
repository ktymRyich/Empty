precision highp float;

varying vec3 vColor;
varying float vEnergy;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float r = length(uv) * 2.0;
  if (r > 1.0) discard;

  float core = smoothstep(0.8, 0.0, r);
  float glow = pow(1.0 - r, 2.2);

  float intensity = 0.55 + 0.85 * clamp(vEnergy, 0.0, 1.5);
  vec3 color = vColor * (core * 2.0 + glow) * intensity;

  float alpha = clamp(core + glow * 0.8, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
