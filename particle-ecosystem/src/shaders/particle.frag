precision highp float;

varying vec3 vColor;
varying float vEnergy;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float r = length(uv) * 2.0;
  if (r > 1.0) discard;

  // Very small bright core, wide soft halo
  float core = smoothstep(0.35, 0.0, r);
  float halo = pow(1.0 - r, 3.4);
  float mist = pow(1.0 - r, 1.6) * 0.35;

  float intensity = 0.65 + 0.85 * clamp(vEnergy, 0.0, 1.4);

  // Core is warmer / whiter; halo keeps the species hue
  vec3 hotCore = mix(vColor, vec3(1.0), 0.55);
  vec3 color = hotCore * core * 1.25 + vColor * halo * 0.95 + vColor * mist;
  color *= intensity;

  float alpha = clamp(core * 0.85 + halo * 0.6 + mist * 0.3, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
