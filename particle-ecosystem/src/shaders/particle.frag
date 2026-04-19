precision highp float;

varying vec3 vColor;
varying float vEnergy;
varying float vRot;

// ---------- shape library -----------
// All shape functions receive uv in [-1, 1] with +y as "forward"
// and return a density value in [0, ~1.2] used as silhouette weight.

float shapePlankton(vec2 uv) {
  float r = length(uv);
  if (r > 1.0) return 0.0;
  float core = smoothstep(0.25, 0.0, r);
  float glow = pow(1.0 - r, 3.2);
  return core * 0.9 + glow * 0.6;
}

float shapeCrystallite(vec2 uv) {
  // Elongated diamond / shard
  float d = abs(uv.x) * 1.4 + abs(uv.y);
  float body = smoothstep(1.05, 0.15, d);
  // inner bright streak
  float streak = smoothstep(0.18, 0.0, abs(uv.x)) * smoothstep(0.95, 0.0, abs(uv.y));
  return body + streak * 0.55;
}

float shapeSwarmer(vec2 uv) {
  // Arrowhead / chevron pointing +y
  float tail = smoothstep(0.18, 0.0, abs(uv.x)) * smoothstep(1.0, -0.8, uv.y) * smoothstep(-0.9, -0.2, uv.y);
  float tipSdf = abs(uv.x) * 1.6 + (0.95 - uv.y);
  float head = smoothstep(1.15, 0.35, tipSdf) * step(-0.25, uv.y);
  return max(tail * 0.8, head);
}

float shapeHunter(vec2 uv) {
  // T-shape: thin stem pointing +y with a crossbar near the head
  float stem = smoothstep(0.22, 0.0, abs(uv.x)) * smoothstep(1.05, -0.8, uv.y) * smoothstep(-1.0, -0.7, uv.y);
  float bar = smoothstep(1.0, 0.0, abs(uv.x)) * smoothstep(0.18, 0.0, abs(uv.y - 0.6));
  // bright spear tip
  float tip = smoothstep(0.22, 0.0, length(uv - vec2(0.0, 0.95)));
  return max(max(stem, bar), tip * 1.1);
}

float shapeAlpha(vec2 uv) {
  // Manta-ray: elongated body along +y with curved wings
  vec2 bodyUV = vec2(uv.x * 2.2, uv.y * 0.9);
  float body = smoothstep(1.05, 0.0, length(bodyUV));
  // Wings: falloff as you go out, concave trailing edge
  float wingShape = (1.0 - abs(uv.x)) - abs(uv.y) * 2.1 + 0.35;
  float wing = smoothstep(0.0, 0.25, wingShape);
  // head antennae hints
  float antL = smoothstep(0.12, 0.0, length(uv - vec2(-0.15, 0.9)));
  float antR = smoothstep(0.12, 0.0, length(uv - vec2( 0.15, 0.9)));
  return max(max(body * 1.1, wing * 0.85), max(antL, antR) * 0.9);
}

float shapeGhost(vec2 uv) {
  // Elongated wisp along +y, soft, very low density
  float r = length(vec2(uv.x * 1.9, uv.y * 0.75));
  float base = smoothstep(1.0, 0.0, r);
  // inner core
  float core = smoothstep(0.45, 0.0, r);
  return base * 0.45 + core * 0.5;
}

float shapeDecomposer(vec2 uv) {
  // 3-lobed trefoil + central hub
  float center = smoothstep(0.35, 0.0, length(uv));
  float l1 = smoothstep(0.45, 0.0, length(uv - vec2(0.0, 0.55)));
  float l2 = smoothstep(0.45, 0.0, length(uv - vec2(0.48, -0.3)));
  float l3 = smoothstep(0.45, 0.0, length(uv - vec2(-0.48, -0.3)));
  return max(max(center, l1), max(l2, l3));
}

float shapeHybrid(vec2 uv) {
  // Dumbbell: two lobes connected
  float l1 = smoothstep(0.55, 0.0, length(uv - vec2(0.0, 0.45)));
  float l2 = smoothstep(0.55, 0.0, length(uv - vec2(0.0, -0.45)));
  float beam = smoothstep(0.22, 0.0, abs(uv.x)) * smoothstep(0.55, 0.0, abs(uv.y));
  return max(max(l1, l2), beam * 0.75);
}

float shape(vec2 uv) {
#if SPECIES_ID == 0
  return shapePlankton(uv);
#elif SPECIES_ID == 1
  return shapeCrystallite(uv);
#elif SPECIES_ID == 2
  return shapeSwarmer(uv);
#elif SPECIES_ID == 3
  return shapeHunter(uv);
#elif SPECIES_ID == 4
  return shapeAlpha(uv);
#elif SPECIES_ID == 5
  return shapeGhost(uv);
#elif SPECIES_ID == 6
  return shapeDecomposer(uv);
#elif SPECIES_ID == 7
  return shapeHybrid(uv);
#else
  return shapePlankton(uv);
#endif
}

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  // gl_PointCoord has Y increasing downward; flip to match +y=forward convention
  p.y = -p.y;
  float c = cos(vRot);
  float s = sin(vRot);
  vec2 uv = vec2(c * p.x - s * p.y, s * p.x + c * p.y) * 2.0;

  if (length(p) > 0.5) discard;

  float silhouette = shape(uv);

  // Soft ambient halo that's always present, in screen-space (unrotated)
  float radialR = length(p) * 2.0;
  float halo = pow(1.0 - radialR, 3.4) * 0.35;

  float density = max(silhouette, halo);
  if (density <= 0.005) discard;

  float intensity = 0.6 + 0.9 * clamp(vEnergy, 0.0, 1.4);

  // Bright core tints toward white; outer body keeps species hue
  vec3 hotCore = mix(vColor, vec3(1.0), 0.55);
  vec3 col = mix(vColor, hotCore, clamp(silhouette * 0.9, 0.0, 1.0));

  vec3 finalColor = col * density * intensity;
  float alpha = clamp(density * 0.95, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, alpha);
}
