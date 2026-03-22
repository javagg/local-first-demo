<template>
  <!-- Landing Page -->
  <LandingView v-if="!currentUser && currentPage === 'landing'" @start="startAuth" />

  <!-- Login Page -->
  <LoginView
    v-else-if="!currentUser && currentPage === 'login'"
    :auth-form="authForm"
    :auth-error="authError"
    @submit="handleAuthSubmit"
    @toggle-mode="toggleAuthPage"
    @back="goToLanding"
  />

  <!-- Register Page -->
  <RegisterView
    v-else-if="!currentUser && currentPage === 'register'"
    :auth-form="authForm"
    :auth-error="authError"
    @submit="handleAuthSubmit"
    @toggle-mode="toggleAuthPage"
    @back="goToLanding"
  />

  <!-- Dashboard (Logged In) -->
  <template v-else-if="currentUser">
    <div class="app-layout">
      <AppSidebar :current-page="currentPage" :user-name="currentUser?.name || ''" @navigate="navigate" @logout="logout" />

      <main class="main-content">
      <DashboardView v-if="currentPage === 'dashboard'" :user-name="currentUser?.name || ''" />
      <ProfileView
        v-else-if="currentPage === 'profile'"
        :user="currentUser"
        :profile-name="profileName"
        :created-at-label="createdAtLabel"
        @save-profile="saveProfile"
      />
      <SettingsView v-else-if="currentPage === 'settings'" :is-local-first="isLocalFirst" />
      <UploadsView
        v-else
        :uploaded-files="uploadedFiles"
        :upload-message="uploadMessage"
        :upload-error="uploadError"
        @upload-file="uploadFile"
        @remove-file="removeFile"
      />
      </main>
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppSidebar from './components/layout/AppSidebar.vue';
import { useAppState } from './composables/useAppState';
import { isLocalFirst } from './config';
import LandingView from './views/LandingView.vue';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import AuthView from './views/AuthView.vue';
import DashboardView from './views/DashboardView.vue';
import ProfileView from './views/ProfileView.vue';
import SettingsView from './views/SettingsView.vue';
import UploadsView from './views/UploadsView.vue';

const {
  currentUser,
  currentPage,
  profileName,
  uploadedFiles,
  uploadMessage,
  uploadError,
  authError,
  authForm,
  isLoginPage,
  createdAtLabel,
  init,
  toggleAuthPage,
  goToLanding,
  startAuth,
  handleAuthSubmit,
  logout,
  navigate,
  saveProfile,
  uploadFile,
  removeFile,
} = useAppState();

onMounted(async () => {
  await init();
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 20px;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 60px 16px 20px 16px;
  }
}
</style>
