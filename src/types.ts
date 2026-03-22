export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type FileStorageBackend = 'opfs' | 'indexeddb';

export interface FileRecord {
  id: string;
  userId: string;
  name: string;
  mimeType: string;
  size: number;
  storageBackend: FileStorageBackend;
  createdAt: string;
}

export interface UploadFileResponse {
  file: FileRecord;
}
