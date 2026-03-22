<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>{{ isLoginPage ? '登录' : '注册' }}</h1>
      <form id="auth-form" @submit.prevent="emit('submit')">
        <div v-if="!isLoginPage" class="form-group">
          <label>姓名</label>
          <input v-model="authForm.name" type="text" name="name" required />
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input v-model="authForm.email" type="email" name="email" required />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input v-model="authForm.password" type="password" name="password" required />
        </div>

        <button type="submit" class="btn">{{ isLoginPage ? '登录' : '注册' }}</button>
        <div id="error-message" class="error-message">{{ authError }}</div>
      </form>

      <div class="auth-switch">
        {{ isLoginPage ? '还没有账号？' : '已有账号？' }}
        <a id="auth-switch" href="#" @click.prevent="emit('toggle-mode')">
          {{ isLoginPage ? '立即注册' : '立即登录' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isLoginPage: boolean;
  authForm: {
    name: string;
    email: string;
    password: string;
  };
  authError: string;
}>();

const emit = defineEmits<{
  submit: [];
  'toggle-mode': [];
}>();
</script>
