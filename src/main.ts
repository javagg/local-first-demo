import './styles.css';
import { createApp } from 'vue';
import { isLocalFirst } from './config';
import App from './App.vue';

// 在开发模式下导入 API 拦截器
if (import.meta.env.DEV) {
  await import('./dev-api-interceptor');
}

if (isLocalFirst && import.meta.env.DEV) {
  console.log('Vue3 Local-First 模式已启用');
}

createApp(App).mount('#app');
