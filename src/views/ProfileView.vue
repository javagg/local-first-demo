<template>
  <div class="profile-section">
    <h2>个人资料</h2>
    <div v-if="user?.isAdmin" class="admin-badge">
      <span style="background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: 600;">
        🔑 超级管理员
      </span>
    </div>

    <div class="profile-info">
      <label>姓名</label>
      <p>{{ user?.name }}</p>
    </div>
    <div class="profile-info">
      <label>邮箱</label>
      <p>{{ user?.email }}</p>
    </div>
    <div class="profile-info">
      <label>注册时间</label>
      <p>{{ createdAtLabel }}</p>
    </div>

    <form id="profile-form" @submit.prevent="emit('save-profile', localName)">
      <div class="form-group">
        <label>更新姓名</label>
        <input v-model="localName" type="text" name="name" />
      </div>
      <button type="submit" class="btn">保存更改</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { User } from '../types';

const props = defineProps<{
  user: User | null;
  profileName: string;
  createdAtLabel: string;
}>();

const emit = defineEmits<{
  'save-profile': [name: string];
}>();

const localName = ref(props.profileName);

watch(
  () => props.profileName,
  (next) => {
    localName.value = next;
  }
);
</script>
