import { defineConfig, type Plugin } from 'vite';

const LOCAL_RUNTIME_ASSET = /^\/(?:models|mediapipe-wasm)\//;

function runtimeAssetCacheHeaders(): Plugin {
  const install = (middlewares: { use: (handler: (request: { url?: string }, response: { setHeader: (name: string, value: string) => void }, next: () => void) => void) => void }) => {
    middlewares.use((request, response, next) => {
      if (LOCAL_RUNTIME_ASSET.test(request.url ?? '')) {
        response.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      }
      next();
    });
  };

  return {
    name: 'xfx-local-runtime-asset-cache',
    configureServer(server) { install(server.middlewares); },
    configurePreviewServer(server) { install(server.middlewares); },
  };
}

export default defineConfig({
  plugins: [runtimeAssetCacheHeaders()],
});
