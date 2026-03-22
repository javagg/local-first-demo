<template>
  <AuthView
    v-if="!currentUser"
    :is-login-page="isLoginPage"
    :auth-form="authForm"
    :auth-error="authError"
    @submit="handleAuthSubmit"
    @toggle-mode="toggleAuthPage"
  />

  <template v-else>
    <AppNavbar :current-page="currentPage" @navigate="navigate" @logout="logout" />

    <div class="container">
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
    </div>
  </template>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AppNavbar from './components/layout/AppNavbar.vue';
import { useAppState } from './composables/useAppState';
import { isLocalFirst } from './config';
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
