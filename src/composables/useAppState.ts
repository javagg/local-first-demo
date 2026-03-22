import { computed, reactive, ref } from 'vue';
import { api } from '../api-client';
import { isLocalFirst } from '../config';
import type { FileRecord, User } from '../types';
import { wasmBackend } from '../wasm/backend';

export type AppPage = 'landing' | 'login' | 'register' | 'dashboard' | 'profile' | 'settings' | 'uploads';

export function useAppState() {
  const currentUser = ref<User | null>(null);
  const currentPage = ref<AppPage>('landing');
  const profileName = ref('');
  const uploadedFiles = ref<FileRecord[]>([]);
  const uploadsLoaded = ref(false);
  const uploadMessage = ref('');
  const uploadError = ref('');
  const authError = ref('');

  const authForm = reactive({
    name: '',
    email: '',
    password: '',
  });

  const isLoginPage = computed(() => currentPage.value === 'login');
  const createdAtLabel = computed(() => {
    if (!currentUser.value?.createdAt) {
      return '';
    }

    return new Date(currentUser.value.createdAt).toLocaleDateString('zh-CN');
  });

  function resetAuthForm() {
    authForm.name = '';
    authForm.email = '';
    authForm.password = '';
  }

  async function initDatabase() {
    const { db } = await import('../db/database');
    await db.init();
  }

  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker 注册成功');
      } catch (error) {
        console.error('Service Worker 注册失败:', error);
      }
    }
  }

  async function loadUser() {
    const result = await api.getProfile();
    if (result.success && result.data) {
      currentUser.value = result.data;
      profileName.value = result.data.name;
      currentPage.value = 'dashboard';
    }
  }

  async function init() {
    if (isLocalFirst) {
      try {
        await wasmBackend.init();
        console.log('WASM 后端初始化成功');
        const testResult = await wasmBackend.processData('Hello from Local-First!');
        console.log('WASM 测试:', testResult);
      } catch (error) {
        console.error('WASM 后端初始化失败:', error);
      }
    }

    await initDatabase();

    if (isLocalFirst && !import.meta.env.DEV) {
      await registerServiceWorker();
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      await loadUser();
    }
  }

  function toggleAuthPage() {
    currentPage.value = isLoginPage.value ? 'register' : 'login';
    authError.value = '';
  }

  function goToLanding() {
    currentPage.value = 'landing';
    authError.value = '';
    resetAuthForm();
  }

  function startAuth() {
    currentPage.value = 'login';
    authError.value = '';
    resetAuthForm();
  }

  async function handleAuthSubmit() {
    authError.value = '';

    try {
      const result = isLoginPage.value
        ? await api.login({ email: authForm.email, password: authForm.password })
        : await api.register({ email: authForm.email, password: authForm.password, name: authForm.name });

      if (!result.success || !result.data) {
        authError.value = result.error || '操作失败';
        return;
      }

      currentUser.value = result.data.user;
      profileName.value = result.data.user.name;
      currentPage.value = 'dashboard';
      resetAuthForm();
    } catch {
      authError.value = '网络错误，请重试';
    }
  }

  async function logout() {
    await api.logout();
    currentUser.value = null;
    currentPage.value = 'landing';
    uploadedFiles.value = [];
    uploadsLoaded.value = false;
    uploadMessage.value = '';
    uploadError.value = '';
  }

  function resetUploadFeedback() {
    uploadMessage.value = '';
    uploadError.value = '';
  }

  async function navigate(page: Exclude<AppPage, 'login' | 'register'>) {
    currentPage.value = page;

    if (page === 'uploads') {
      resetUploadFeedback();
      if (!uploadsLoaded.value) {
        await loadUploadedFiles();
      }
    }
  }

  async function saveProfile(nextName: string) {
    const result = await api.updateProfile({ name: nextName });
    if (result.success && result.data) {
      currentUser.value = result.data;
      profileName.value = result.data.name;
    }
  }

  async function loadUploadedFiles() {
    const result = await api.listFiles();

    if (result.success && result.data) {
      uploadedFiles.value = result.data;
      uploadsLoaded.value = true;
    }
  }

  async function uploadFile(file?: File) {
    resetUploadFeedback();

    if (!file) {
      uploadError.value = '请选择一个文件';
      return;
    }

    const result = await api.uploadFile(file);

    if (!result.success) {
      uploadError.value = result.error || '上传失败';
      return;
    }

    uploadMessage.value = '上传成功';
    uploadsLoaded.value = false;
    await loadUploadedFiles();
  }

  async function removeFile(fileId: string) {
    resetUploadFeedback();
    const result = await api.deleteFile(fileId);

    if (!result.success) {
      uploadError.value = result.error || '删除失败';
      return;
    }

    uploadMessage.value = '删除成功';
    uploadsLoaded.value = false;
    await loadUploadedFiles();
  }

  return {
    goToLanding,
    startAuth,
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
  };
}
