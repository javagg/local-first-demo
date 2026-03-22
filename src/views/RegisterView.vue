<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card">
        <div class="register-header">
          <h1>立即注册</h1>
          <p>电磁仿真云 SaaS</p>
        </div>

        <form @submit.prevent="emit('submit')">
          <div class="form-group">
            <label for="name">姓名</label>
            <input
              id="name"
              v-model="authForm.name"
              type="text"
              name="name"
              placeholder="请输入姓名"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              id="email"
              v-model="authForm.email"
              type="email"
              name="email"
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              id="password"
              v-model="authForm.password"
              type="password"
              name="password"
              placeholder="请输入密码（至少6位）"
              minlength="6"
              required
            />
          </div>

          <p class="terms">
            点击注册即表示同意<a href="#">服务条款</a>和<a href="#">隐私政策</a>
          </p>

          <button type="submit" class="btn btn-primary">注册</button>

          <div v-if="authError" class="error-message">{{ authError }}</div>
        </form>

        <div class="auth-switch">
          <p>已有账号？<a href="#" @click.prevent="emit('toggle-mode')">立即登录</a></p>
          <p><a href="#" @click.prevent="emit('back')">返回首页</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
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
  back: [];
}>();
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-container {
  width: 100%;
  max-width: 400px;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 40px;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 2rem;
  margin: 0 0 10px 0;
  color: #333;
  font-weight: 800;
}

.register-header p {
  margin: 0;
  color: #667eea;
  font-size: 0.95rem;
  font-weight: 600;
}

form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input::placeholder {
  color: #999;
}

.terms {
  font-size: 0.85rem;
  color: #666;
  margin: 15px 0;
  line-height: 1.5;
}

.terms a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.terms a:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 15px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 15px;
}

.auth-switch {
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.auth-switch p {
  margin: 10px 0;
  font-size: 0.9rem;
  color: #666;
}

.auth-switch a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-switch a:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 1.5rem;
  }
}
</style>
