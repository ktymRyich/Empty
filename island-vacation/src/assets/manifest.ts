/**
 * The single swap point for generated art. Drop a `.glb` into
 * `public/models/`, add a key here, and reference it by logical name —
 * that is the whole asset workflow. Files in public/ are served verbatim
 * (no hashing), which keeps the manual drop-in predictable.
 */
export const MODELS = {
  avatar: '/models/avatar.glb',
  // springTree: '/models/spring_tree.glb',
} as const;

export type ModelKey = keyof typeof MODELS;
