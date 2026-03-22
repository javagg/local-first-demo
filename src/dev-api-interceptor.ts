import { apiRouter } from './api/router';
import { isLocalFirst } from './config';

class DevApiInterceptor {
  private originalFetch: typeof fetch;

  constructor() {
    this.originalFetch = window.fetch;
  }

  install() {
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

      // 拦截 /api/ 请求
      if (url.includes('/api/')) {
        const method = init?.method || 'GET';
        let body: any = {};

        if (init?.body) {
          try {
            body = JSON.parse(init.body as string);
          } catch {
            body = {};
          }
        }

        // 从 headers 中提取 token
        const headers = init?.headers as Record<string, string> | undefined;
        const authHeader = headers?.['Authorization'];
        const token = authHeader?.replace('Bearer ', '');

        // 将 token 添加到 body 中（即使是 GET 请求）
        if (token) {
          body.token = token;
        }

        return apiRouter.handleRequest(url, method, body);
      }

      // 其他请求使用原始 fetch
      return this.originalFetch(input, init);
    };
  }

  uninstall() {
    window.fetch = this.originalFetch;
  }
}

export const devApiInterceptor = new DevApiInterceptor();

// 在开发模式下自动安装拦截器
if (isLocalFirst && import.meta.env.DEV) {
  devApiInterceptor.install();
  console.log('开发模式 API 拦截器已启用');
}
