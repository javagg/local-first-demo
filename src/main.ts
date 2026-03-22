import './styles.css';
import { isLocalFirst } from './config';
import { api } from './api-client';
import type { User } from './types';
import { wasmBackend } from './wasm/backend';

// 在开发模式下导入 API 拦截器
if (import.meta.env.DEV) {
  await import('./dev-api-interceptor');
}

class App {
  private currentUser: User | null = null;
  private currentPage: string = 'login';

  async init() {
    // 初始化 WASM 后端
    if (isLocalFirst) {
      try {
        await wasmBackend.init();
        console.log('WASM 后端初始化成功');

        // 测试 WASM 功能
        const testResult = await wasmBackend.processData('Hello from Local-First!');
        console.log('WASM 测试:', testResult);
      } catch (error) {
        console.error('WASM 后端初始化失败:', error);
      }
    }

    // 初始化数据库
    await this.initDatabase();

    // 在生产模式下注册 Service Worker
    if (isLocalFirst && !import.meta.env.DEV) {
      await this.registerServiceWorker();
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      await this.loadUser();
    } else {
      this.render();
    }
  }

  async initDatabase() {
    // 初始化数据库以创建超级管理员
    const { db } = await import('./db/database');
    await db.init();
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker 注册成功');
      } catch (error) {
        console.error('Service Worker 注册失败:', error);
      }
    }
  }

  async loadUser() {
    const result = await api.getProfile();
    if (result.success && result.data) {
      this.currentUser = result.data;
      this.currentPage = 'dashboard';
    }
    this.render();
  }

  render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (!this.currentUser) {
      app.innerHTML = this.renderAuth();
      this.attachAuthListeners();
    } else {
      app.innerHTML = this.renderApp();
      this.attachAppListeners();
    }
  }

  renderAuth() {
    const isLogin = this.currentPage === 'login';
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h1>${isLogin ? '登录' : '注册'}</h1>
          <form id="auth-form">
            ${!isLogin ? `
              <div class="form-group">
                <label>姓名</label>
                <input type="text" name="name" required />
              </div>
            ` : ''}
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" name="email" required />
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" name="password" required />
            </div>
            <button type="submit" class="btn">
              ${isLogin ? '登录' : '注册'}
            </button>
            <div class="error-message" id="error-message"></div>
          </form>
          <div class="auth-switch">
            ${isLogin ? '还没有账号？' : '已有账号？'}
            <a href="#" id="auth-switch">
              ${isLogin ? '立即注册' : '立即登录'}
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderApp() {
    const page = this.currentPage;
    return `
      <div class="navbar">
        <div class="navbar-content">
          <div class="navbar-brand">SaaS Demo</div>
          <div class="navbar-menu">
            <a href="#" data-page="dashboard" class="${page === 'dashboard' ? 'active' : ''}">
              仪表盘
            </a>
            <a href="#" data-page="profile" class="${page === 'profile' ? 'active' : ''}">
              个人资料
            </a>
            <a href="#" data-page="settings" class="${page === 'settings' ? 'active' : ''}">
              设置
            </a>
            <a href="#" id="logout">退出</a>
          </div>
        </div>
      </div>
      <div class="container">
        ${this.renderPage()}
      </div>
    `;
  }

  renderPage() {
    switch (this.currentPage) {
      case 'dashboard':
        return this.renderDashboard();
      case 'profile':
        return this.renderProfile();
      case 'settings':
        return this.renderSettings();
      default:
        return this.renderDashboard();
    }
  }

  renderDashboard() {
    return `
      <div class="dashboard">
        <div class="dashboard-header">
          <h1>欢迎回来，${this.currentUser?.name}！</h1>
          <p>这是您的仪表盘</p>
        </div>
        <div class="dashboard-grid">
          <div class="card">
            <h3>📊 数据统计</h3>
            <p>查看您的数据分析和统计信息</p>
          </div>
          <div class="card">
            <h3>📝 最近活动</h3>
            <p>查看您最近的操作记录</p>
          </div>
          <div class="card">
            <h3>⚙️ 快速设置</h3>
            <p>快速访问常用设置选项</p>
          </div>
        </div>
      </div>
    `;
  }

  renderProfile() {
    return `
      <div class="profile-section">
        <h2>个人资料</h2>
        ${this.currentUser?.isAdmin ? `
          <div class="admin-badge">
            <span style="background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">
              🔑 超级管理员
            </span>
          </div>
        ` : ''}
        <div class="profile-info">
          <label>姓名</label>
          <p>${this.currentUser?.name}</p>
        </div>
        <div class="profile-info">
          <label>邮箱</label>
          <p>${this.currentUser?.email}</p>
        </div>
        <div class="profile-info">
          <label>注册时间</label>
          <p>${new Date(this.currentUser?.createdAt || '').toLocaleDateString('zh-CN')}</p>
        </div>
        <form id="profile-form">
          <div class="form-group">
            <label>更新姓名</label>
            <input type="text" name="name" value="${this.currentUser?.name}" />
          </div>
          <button type="submit" class="btn">保存更改</button>
        </form>
      </div>
    `;
  }

  renderSettings() {
    return `
      <div class="profile-section">
        <h2>设置</h2>
        <div class="card">
          <h3>应用模式</h3>
          <p>当前模式: <strong>${isLocalFirst ? 'Local-First (浏览器本地)' : 'Server (服务器)'}</strong></p>
          <p style="margin-top: 10px; color: #666;">
            ${isLocalFirst
              ? '所有数据存储在浏览器本地，使用 Service Worker + IndexedDB'
              : '数据存储在远程服务器'}
          </p>
        </div>
      </div>
    `;
  }

  attachAuthListeners() {
    const form = document.getElementById('auth-form') as HTMLFormElement;
    const switchBtn = document.getElementById('auth-switch');
    const errorMsg = document.getElementById('error-message');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const result = this.currentPage === 'login'
          ? await api.login({ email: data.email as string, password: data.password as string })
          : await api.register({
              email: data.email as string,
              password: data.password as string,
              name: data.name as string
            });

        if (result.success && result.data) {
          this.currentUser = result.data.user;
          this.currentPage = 'dashboard';
          this.render();
        } else {
          if (errorMsg) errorMsg.textContent = result.error || '操作失败';
        }
      } catch (error) {
        if (errorMsg) errorMsg.textContent = '网络错误，请重试';
      }
    });

    switchBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.currentPage = this.currentPage === 'login' ? 'register' : 'login';
      this.render();
    });
  }

  attachAppListeners() {
    const navLinks = document.querySelectorAll('[data-page]');
    const logoutBtn = document.getElementById('logout');
    const profileForm = document.getElementById('profile-form') as HTMLFormElement;

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.currentPage = (e.target as HTMLElement).dataset.page || 'dashboard';
        this.render();
      });
    });

    logoutBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      await api.logout();
      this.currentUser = null;
      this.currentPage = 'login';
      this.render();
    });

    profileForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(profileForm);
      const name = formData.get('name') as string;

      const result = await api.updateProfile({ name });
      if (result.success && result.data) {
        this.currentUser = result.data;
        this.render();
      }
    });
  }
}

const app = new App();
app.init();
