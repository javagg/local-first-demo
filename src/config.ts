export const BUILD_MODE = (import.meta as any).env?.BUILD_MODE || 'local-first';

export const isLocalFirst = BUILD_MODE === 'local-first';

export const API_BASE_URL = isLocalFirst
  ? '/api'
  : (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';

export const SIMULATED_NETWORK_DELAY = 100; // ms

// 添加 Vite 环境变量类型声明
declare global {
  interface ImportMeta {
    env: {
      DEV: boolean;
      PROD: boolean;
      BUILD_MODE?: string;
      VITE_API_URL?: string;
    };
  }
}
