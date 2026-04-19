import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  base: process.env.GITHUB_PAGES_BASE ?? '/',
  plugins: [glsl()],
  server: { port: 5173, host: true, open: false },
  build: { target: 'es2020' },
});
