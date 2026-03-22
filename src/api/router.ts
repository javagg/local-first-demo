import { db } from '../db/database';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { SIMULATED_NETWORK_DELAY } from '../config';
import { wasmBackend } from '../wasm/backend';

async function simulateDelay() {
  await new Promise(resolve => setTimeout(resolve, SIMULATED_NETWORK_DELAY));
}

export class ApiRouter {
  async handleRequest(url: string, method: string, body?: any): Promise<Response> {
    await simulateDelay();

    const path = new URL(url, 'http://localhost').pathname;

    try {
      if (path === '/api/auth/login' && method === 'POST') {
        return this.handleLogin(body);
      }

      if (path === '/api/auth/register' && method === 'POST') {
        return this.handleRegister(body);
      }

      if (path === '/api/auth/logout' && method === 'POST') {
        return this.handleLogout(body);
      }

      if (path === '/api/user/profile' && method === 'GET') {
        return this.handleGetProfile(body);
      }

      if (path === '/api/user/profile' && method === 'PUT') {
        return this.handleUpdateProfile(body);
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: (error as Error).message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  private async handleLogin(req: LoginRequest): Promise<Response> {
    // 使用 WASM 验证邮箱格式
    const isEmailValid = await wasmBackend.validateEmail(req.email);
    if (!isEmailValid) {
      return new Response(
        JSON.stringify({ success: false, error: '邮箱格式不正确' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await db.getUserByEmail(req.email);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: '邮箱或密码错误' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 使用 WASM 验证密码
    const isPasswordValid = await wasmBackend.verifyPassword(req.password, user.password);

    // 简单比较（因为我们存储的是明文，生产环境应该存储哈希）
    if (user.password !== req.password && !isPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, error: '邮箱或密码错误' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 使用 WASM 生成 token
    const token = await wasmBackend.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await db.createSession({
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          isAdmin: user.isAdmin,
        },
        token,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleRegister(req: RegisterRequest): Promise<Response> {
    // 使用 WASM 验证用户数据
    try {
      await wasmBackend.validateUserData(req.email, req.name, req.password);
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: (error as Error).message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 使用 WASM 清理输入
    const sanitizedName = await wasmBackend.sanitizeInput(req.name);
    const sanitizedEmail = await wasmBackend.sanitizeInput(req.email);

    const existing = await db.getUserByEmail(sanitizedEmail);

    if (existing) {
      return new Response(
        JSON.stringify({ success: false, error: '该邮箱已被注册' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 使用 WASM 生成 ID
    const userId = await wasmBackend.generateId();
    // 注意：生产环境应该使用 WASM 哈希密码并存储哈希值
    // const passwordHash = await wasmBackend.hashPassword(req.password);

    const user = await db.createUser({
      id: userId,
      email: sanitizedEmail,
      password: req.password, // 简化版本，生产环境应存储哈希密码
      name: sanitizedName,
      createdAt: new Date().toISOString(),
    });

    // 使用 WASM 生成 token
    const token = await wasmBackend.generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await db.createSession({
      token,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          isAdmin: user.isAdmin,
        },
        token,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleLogout(req: { token: string }): Promise<Response> {
    await db.deleteSession(req.token);
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  private async handleGetProfile(req: { token: string }): Promise<Response> {
    const session = await db.getSession(req.token);

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, error: '未授权' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await db.getUser(session.userId);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: '用户不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response: ApiResponse<User> = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleUpdateProfile(req: { token: string; updates: Partial<User> }): Promise<Response> {
    const session = await db.getSession(req.token);

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, error: '未授权' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 使用 WASM 清理输入
    if (req.updates.name) {
      req.updates.name = await wasmBackend.sanitizeInput(req.updates.name);
    }

    const updated = await db.updateUser(session.userId, req.updates);

    const response: ApiResponse<User> = {
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatar: updated.avatar,
        createdAt: updated.createdAt,
        isAdmin: updated.isAdmin,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const apiRouter = new ApiRouter();
