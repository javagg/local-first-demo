import { MAX_UPLOAD_SIZE_BYTES } from '../config';
import { db } from '../db/database';
import type { FileRecord } from '../types';
import { wasmBackend } from '../wasm/backend';

class FileStorageService {
  private opfsSupport: boolean | null = null;

  private async checkOpfsSupport() {
    if (this.opfsSupport !== null) {
      return this.opfsSupport;
    }

    try {
      this.opfsSupport = await wasmBackend.opfsIsSupported();
    } catch {
      this.opfsSupport = false;
    }

    return this.opfsSupport;
  }

  private sanitizeFileName(input: string) {
    return input
      .replace(/[\\/]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'file';
  }

  async saveFile(userId: string, file: File): Promise<FileRecord> {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new Error(`文件大小不能超过 ${Math.floor(MAX_UPLOAD_SIZE_BYTES / 1024 / 1024)}MB`);
    }

    const id = await wasmBackend.generateId();
    const safeName = this.sanitizeFileName(file.name);
    const createdAt = new Date().toISOString();
    const opfsPath = `${userId}/${id}-${safeName}`;

    const opfsSupported = await this.checkOpfsSupport();

    if (opfsSupported) {
      try {
        const buffer = await file.arrayBuffer();
        await wasmBackend.opfsWriteFile(opfsPath, new Uint8Array(buffer));

        const record = await db.createFile({
          id,
          userId,
          name: safeName,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          storageBackend: 'opfs',
          opfsPath,
          createdAt,
        });

        return this.toPublicRecord(record);
      } catch {
        // OPFS 写入失败自动回退到 IndexedDB
      }
    }

    const record = await db.createFile({
      id,
      userId,
      name: safeName,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      storageBackend: 'indexeddb',
      blob: file,
      createdAt,
    });

    return this.toPublicRecord(record);
  }

  async listFiles(userId: string): Promise<FileRecord[]> {
    const files = await db.getFilesByUserId(userId);
    return files
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((file) => this.toPublicRecord(file));
  }

  async deleteFile(userId: string, fileId: string): Promise<void> {
    const file = await db.getFile(fileId);

    if (!file || file.userId !== userId) {
      throw new Error('文件不存在');
    }

    if (file.storageBackend === 'opfs' && file.opfsPath) {
      try {
        await wasmBackend.opfsDeleteFile(file.opfsPath);
      } catch {
        // 删除 OPFS 失败时仍删除元数据，避免脏状态阻塞用户操作
      }
    }

    await db.deleteFile(fileId);
  }

  private toPublicRecord(file: {
    id: string;
    userId: string;
    name: string;
    mimeType: string;
    size: number;
    storageBackend: 'opfs' | 'indexeddb';
    createdAt: string;
  }): FileRecord {
    return {
      id: file.id,
      userId: file.userId,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      storageBackend: file.storageBackend,
      createdAt: file.createdAt,
    };
  }
}

export const fileStorage = new FileStorageService();
