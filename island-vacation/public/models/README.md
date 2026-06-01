# Generated models

Drop generated `.glb` / `.gltf` files here (served verbatim at `/models/...`).

Workflow:
1. Generate a model (e.g. with pixal3d) and export as `.glb`.
2. Save it here, e.g. `avatar.glb`.
3. Add a key in `src/assets/manifest.ts` (e.g. `avatar: '/models/avatar.glb'`).
4. Load via `AssetManager.load('avatar')` and wrap with `Avatar.fromGLTF(...)`,
   or set `GameConfig.useGeneratedAvatar = true` for the player avatar.
