import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devApiProxyTarget = env.VITE_DEV_API_PROXY_TARGET;

  return {
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT) || 5173,
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
      port: Number(env.VITE_PREVIEW_SERVER_PORT) || 4173,
    },
  };
});
