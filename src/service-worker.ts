/// <reference lib="webworker" />

import { apiRouter } from './api/router';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

async function handleApiRequest(request: Request): Promise<Response> {
  const url = request.url;
  const method = request.method;

  let body: unknown;
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('Content-Type') || '';

    try {
      if (contentType.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        body = await request.json();
      }
    } catch {
      body = undefined;
    }
  }

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  return apiRouter.handleRequest(url, method, body, token);
}
