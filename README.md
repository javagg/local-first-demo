# SaaS Demo - Local-First 架构演示

这是一个完整的 SaaS 服务演示项目，支持两种架构模式：

1. **Local-First Demo**: 使用 Service Worker + Web Worker + IndexedDB 在浏览器中模拟完整的前后端
2. **Server Mode**: 传统的客户端-服务器架构

## 技术栈

### 前端
- TypeScript + Vite
- Service Worker (请求拦截和路由)
- Web Worker (后台处理)
- IndexedDB (本地数据存储)

### 后端
- Rust (支持 WASM 编译)
- 数据库抽象层 (支持多种数据库)

## 功能特性

- ✅ 用户认证 (登录/注册)
- ✅ 超级管理员账户
- ✅ 仪表盘面板
- ✅ 个人资料管理
- ✅ 设置页面
- ✅ API 网关和路由
- ✅ 模拟网络延迟
- ✅ 构建时选择架构模式

## 默认账户

系统会在首次启动时自动创建超级管理员账户：

- **邮箱**: `admin@nowhere.com`
- **密码**: `admin123`
- **权限**: 超级管理员

您可以使用此账户登录系统进行测试。

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式 (Local-First)

```bash
npm run dev
```

### 构建

```bash
# Local-First 模式
npm run build:local-first

# Server 模式
npm run build:server
```

### 编译 Rust WASM 模块

```bash
npm run wasm:build
```

## 项目结构

```
localdemo/
├── src/
│   ├── api/
│   │   └── router.ts          # API 路由处理
│   ├── db/
│   │   └── database.ts        # IndexedDB 封装
│   ├── worker/
│   │   └── background-worker.ts  # Web Worker
│   ├── api-client.ts          # API 客户端
│   ├── config.ts              # 配置文件
│   ├── main.ts                # 应用入口
│   ├── service-worker.ts      # Service Worker
│   ├── styles.css             # 样式文件
│   └── types.ts               # TypeScript 类型定义
├── rust-backend/
│   ├── src/
│   │   └── lib.rs             # Rust 后端逻辑
│   └── Cargo.toml
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 架构说明

### Local-First 模式

在此模式下：
- Service Worker 拦截所有 `/api/*` 请求
- 请求被路由到本地 API 处理器
- 数据存储在 IndexedDB 中
- 模拟网络延迟以提供真实体验
- 无需后端服务器即可运行

### Server 模式

在此模式下：
- 请求发送到真实的后端服务器
- 需要配置 `VITE_API_URL` 环境变量
- 使用传统的客户端-服务器通信

## 环境变量

创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:8080/api
BUILD_MODE=local-first
```

## 开发说明

### 添加新的 API 端点

1. 在 `src/api/router.ts` 中添加路由处理
2. 在 `src/api-client.ts` 中添加客户端方法
3. 更新 `src/types.ts` 中的类型定义

### 数据库操作

所有数据库操作都通过 `src/db/database.ts` 中的 `db` 实例进行。

### Service Worker 更新

修改 `src/service-worker.ts` 后，需要：
1. 更新 `CACHE_NAME` 版本号
2. 重新注册 Service Worker

## 许可证

MIT
