<template>
  <div class="profile-section">
    <h2>设置</h2>
    <div class="card">
      <h3>应用模式</h3>
      <p>当前模式: <strong>{{ isLocalFirst ? 'Local-First (浏览器本地)' : 'Server (服务器)' }}</strong></p>
      <p style="margin-top: 10px; color: #666;">
        {{ isLocalFirst ? '所有数据存储在浏览器本地，使用 Service Worker + IndexedDB' : '数据存储在远程服务器' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLocalFirst: boolean;
}>();
</script>
