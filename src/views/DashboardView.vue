<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>欢迎回来，{{ userName }}！</h1>
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
</template>

<script setup lang="ts">
defineProps<{
  userName: string;
}>();
</script>
