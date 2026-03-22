<template>
  <div class="navbar">
    <div class="navbar-content">
      <div class="navbar-brand">SaaS Demo</div>
      <div class="navbar-menu">
        <a href="#" :class="{ active: currentPage === 'dashboard' }" @click.prevent="emit('navigate', 'dashboard')">仪表盘</a>
        <a href="#" :class="{ active: currentPage === 'profile' }" @click.prevent="emit('navigate', 'profile')">个人资料</a>
        <a href="#" :class="{ active: currentPage === 'settings' }" @click.prevent="emit('navigate', 'settings')">设置</a>
        <a href="#" :class="{ active: currentPage === 'uploads' }" @click.prevent="emit('navigate', 'uploads')">文件</a>
        <a id="logout" href="#" @click.prevent="emit('logout')">退出</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppPage } from '../../composables/useAppState';

defineProps<{
  currentPage: AppPage;
}>();

const emit = defineEmits<{
  navigate: [page: 'dashboard' | 'profile' | 'settings' | 'uploads'];
  logout: [];
}>();
</script>
