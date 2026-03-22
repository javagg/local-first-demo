<template>
  <div class="profile-section upload-section">
    <h2>文件上传</h2>
    <p class="upload-hint">单文件上传，大小不超过 10MB。支持 OPFS，自动回退 IndexedDB。</p>
    <form id="upload-form" class="upload-form" @submit.prevent="submitUpload">
      <div class="form-group">
        <label>选择文件</label>
        <input id="file-input" ref="fileInputRef" type="file" name="file" required />
      </div>
      <button type="submit" class="btn">上传文件</button>
      <div id="upload-success" class="upload-success">{{ uploadMessage }}</div>
      <div id="upload-error" class="upload-error">{{ uploadError }}</div>
    </form>

    <div class="file-list">
      <h3>我的文件</h3>
      <template v-if="uploadedFiles.length > 0">
        <div v-for="file in uploadedFiles" :key="file.id" class="file-item" :data-file-id="file.id">
          <div>
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              {{ formatSize(file.size) }} KB · {{ file.storageBackend.toUpperCase() }} · {{ formatDateTime(file.createdAt) }}
            </div>
          </div>
          <button type="button" class="btn file-delete-btn" :data-delete-file="file.id" @click="emit('remove-file', file.id)">删除</button>
        </div>
      </template>
      <p v-else class="empty-files">暂无文件</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FileRecord } from '../types';

defineProps<{
  uploadedFiles: FileRecord[];
  uploadMessage: string;
  uploadError: string;
}>();

const emit = defineEmits<{
  'upload-file': [file: File | undefined];
  'remove-file': [fileId: string];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN');
}

function formatSize(size: number) {
  return (size / 1024).toFixed(1);
}

function submitUpload() {
  const file = fileInputRef.value?.files?.[0];
  emit('upload-file', file);

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}
</script>
