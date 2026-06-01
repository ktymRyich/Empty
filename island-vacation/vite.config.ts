import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES_BASE ?? '/',
  server: { port: 5173, host: true, open: false },
  build: { target: 'es2020' },
  // Let Vite treat generated binary models as static assets so they can be
  // imported with `?url` or served from public/ once real art arrives.
  assetsInclude: ['**/*.glb', '**/*.gltf'],
});
