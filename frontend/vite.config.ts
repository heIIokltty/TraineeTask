import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devApiProxyTarget = env.VITE_DEV_API_PROXY_TARGET;

  return {
    server: {
      host: env.VITE_DEV_SERVER_HOST || '127.0.0.1',
      port: Number(env.VITE_DEV_SERVER_PORT) || 5173,
      strictPort: true,
      proxy: devApiProxyTarget
        ? {
            '/api': {
              target: devApiProxyTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    preview: {
      host: env.VITE_PREVIEW_SERVER_HOST || '127.0.0.1',
      port: Number(env.VITE_PREVIEW_SERVER_PORT) || 4173,
      strictPort: true,
    },
  };
});
