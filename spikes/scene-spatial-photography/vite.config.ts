import { defineConfig } from 'vite';
export default defineConfig({
  build: { target: 'es2022' },
  server: { allowedHosts: ['.trycloudflare.com'], proxy: { '/scene-spatial/geometry': 'http://127.0.0.1:8765' } },
  preview: { allowedHosts: ['.trycloudflare.com'], proxy: { '/scene-spatial/geometry': 'http://127.0.0.1:8765' } },
});
