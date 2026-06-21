export const appConfig = {
  appName: 'KAIROS',
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, ''),
} as const;
