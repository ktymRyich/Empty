export interface MutationParams {
  rate: number; // 0..0.1 typical
}

export function mutate(base: number, rate: number): number {
  if (rate <= 0) return base;
  const jitter = (Math.random() * 2 - 1) * rate;
  return Math.max(0.25, Math.min(2.0, base * (1 + jitter)));
}
