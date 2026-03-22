<template>
  <div class="sidebar-wrapper">
    <!-- Toggle Button -->
    <button class="sidebar-toggle" @click="toggled = !toggled" title="切换侧边栏">
      <span class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed: !toggled }]">
      <!-- Header -->
      <div class="sidebar-header">
        <h1 class="sidebar-brand">电磁仿真云</h1>
        <button class="sidebar-close" @click="toggled = false" title="关闭">
          <span>✕</span>
        </button>
      </div>

      <!-- User Info -->
      <div class="sidebar-user">
        <div class="user-avatar">{{ userName.charAt(0).toUpperCase() }}</div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-status">已登录</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <a
          class="nav-item"
          :class="{ active: currentPage === 'dashboard' }"
          href="#"
          @click.prevent="handleNavigate('dashboard')"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">仪表盘</span>
        </a>
        <a
          class="nav-item"
          :class="{ active: currentPage === 'profile' }"
          href="#"
          @click.prevent="handleNavigate('profile')"
        >
          <span class="nav-icon">👤</span>
          <span class="nav-label">个人资料</span>
        </a>
        <a
          class="nav-item"
          :class="{ active: currentPage === 'uploads' }"
          href="#"
          @click.prevent="handleNavigate('uploads')"
        >
          <span class="nav-icon">📁</span>
          <span class="nav-label">文件</span>
        </a>
        <a
          class="nav-item"
          :class="{ active: currentPage === 'settings' }"
          href="#"
          @click.prevent="handleNavigate('settings')"
        >
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">设置</span>
        </a>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <a id="logout" class="logout-btn" href="#" @click.prevent="emit('logout')">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">退出登录</span>
        </a>
      </div>
    </aside>

    <!-- Overlay (for mobile) -->
    <div v-if="toggled" class="sidebar-overlay" @click="toggled = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AppPage } from '../../composables/useAppState';

defineProps<{
  currentPage: AppPage;
  userName: string;
}>();

const emit = defineEmits<{
  navigate: [page: 'dashboard' | 'profile' | 'settings' | 'uploads'];
  logout: [];
}>();

const toggled = ref(true);

function handleNavigate(page: 'dashboard' | 'profile' | 'settings' | 'uploads') {
  emit('navigate', page);
  // 在移动端，导航后自动关闭侧边栏
  if (window.innerWidth < 768) {
    toggled.value = false;
  }
}
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
}

.sidebar-toggle {
  display: none;
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  width: 40px;
  height: 40px;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
}

.hamburger span {
  width: 100%;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  z-index: 99;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease;
  overflow-y: auto;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-brand {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #667eea;
}

.sidebar-close {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  transition: color 0.3s ease;
}

.sidebar-close:hover {
  color: #667eea;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin: 8px 0;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  margin: 12px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(102, 126, 234, 0.1);
  color: white;
  border-left-color: #667eea;
}

.nav-item.active {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border-left-color: #667eea;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-footer {
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.logout-btn:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-left-color: #e74c3c;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 98;
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar {
    width: 100%;
    max-width: 280px;
  }

  .sidebar-close {
    display: block;
  }

  .sidebar-overlay {
    display: block;
  }

  body.sidebar-open {
    overflow: hidden;
  }
}

/* 滚动条美化 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
