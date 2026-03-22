import { API_BASE_URL } from './config';
import type {
  ApiResponse,
  AuthResponse,
  FileRecord,
  LoginRequest,
  RegisterRequest,
  UploadFileResponse,
  User,
} from './types';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers);
    const isFormDataBody = options.body instanceof FormData;

    if (!isFormDataBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    return response.json();
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const result = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.success && result.data) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const result = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.success && result.data) {
      this.setToken(result.data.token);
    }

    return result;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/user/profile', { method: 'GET' });
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async uploadFile(file: File): Promise<ApiResponse<UploadFileResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<UploadFileResponse>('/files/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async listFiles(): Promise<ApiResponse<FileRecord[]>> {
    return this.request<FileRecord[]>('/files', { method: 'GET' });
  }

  async deleteFile(fileId: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
