# 数据库架构说明和建议

## 当前实现

### Rust WASM 数据库层

我已经在 Rust 中实现了一个轻量级的数据库抽象层，包含以下功能：

#### 1. **数据结构定义**
```rust
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub password: String,
    pub is_admin: Option<bool>,
    pub avatar: Option<String>,
    pub created_at: String,
}

pub struct Session {
    pub token: String,
    pub user_id: String,
    pub created_at: String,
    pub expires_at: String,
}
```

#### 2. **数据库操作函数**
- `create_user_json()` - 创建用户（带验证）
- `validate_login_json()` - 验证登录数据
- `create_session_json()` - 创建会话
- `filter_users_by_email()` - 按邮箱过滤用户
- `filter_sessions_by_token()` - 按 token 过滤会话
- `is_session_expired()` - 检查会话是否过期

#### 3. **数据验证和安全**
- 邮箱格式验证
- 密码强度验证
- 输入清理（XSS 防护）
- 密码哈希

## 关于 SurrealDB 的说明

### 为什么不使用 SurrealDB？

1. **包体积问题**
   - SurrealDB 完整库非常大（>10MB）
   - 会显著增加 WASM 文件大小
   - 影响首次加载性能

2. **WASM 兼容性**
   - SurrealDB 的 WASM 支持还在发展中
   - 某些功能在浏览器环境中不可用
   - 需要额外的配置和依赖

3. **复杂性**
   - 对于 Local-First 应用来说过于复杂
   - IndexedDB 已经足够满足需求

### 推荐的数据库方案

#### 方案 1：当前实现（推荐用于 Local-First）

```
┌─────────────────────────────────────────┐
│         TypeScript 前端                  │
│  - UI 和用户交互                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Rust WASM 业务逻辑层                │
│  - 数据验证                              │
│  - 数据序列化/反序列化                   │
│  - 业务规则                              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      IndexedDB (浏览器原生)              │
│  - 数据持久化                            │
│  - 事务支持                              │
│  - 索引和查询                            │
└─────────────────────────────────────────┘
```

**优点**：
- ✅ 轻量级（WASM 文件 ~40KB）
- ✅ 浏览器原生支持
- ✅ 无需额外依赖
- ✅ 快速加载
- ✅ 类型安全（Rust + TypeScript）

**缺点**：
- ❌ 需要 TypeScript 和 Rust 之间的数据传递
- ❌ IndexedDB API 相对底层

#### 方案 2：使用 sql.js（SQLite WASM）

如果你需要 SQL 数据库，可以使用 `sql.js`：

```toml
# 不需要在 Rust 中添加依赖
# 直接在 TypeScript 中使用 sql.js
```

```typescript
import initSqlJs from 'sql.js';

const SQL = await initSqlJs({
  locateFile: file => `/sql-wasm.wasm`
});

const db = new SQL.Database();
db.run("CREATE TABLE users (id, email, name, password)");
```

**优点**：
- ✅ 完整的 SQL 支持
- ✅ 成熟稳定
- ✅ 体积适中（~500KB）

**缺点**：
- ❌ 比 IndexedDB 大
- ❌ 需要额外的库

#### 方案 3：混合方案（推荐用于生产）

```
开发/演示环境：
  - IndexedDB (Local-First)
  - Rust WASM 业务逻辑

生产环境：
  - 真实后端数据库（PostgreSQL/MySQL）
  - Rust 后端服务
  - 相同的业务逻辑代码
```

## 当前架构的优势

### 1. **职责清晰**

```rust
// Rust 负责：业务逻辑和验证
#[wasm_bindgen]
pub fn create_user_json(user_json: &str) -> Result<String, JsValue> {
    let user: User = serde_json::from_str(user_json)?;
    validate_user_data(&user.email, &user.name, &user.password)?;
    serde_json::to_string(&user)
}
```

```typescript
// TypeScript 负责：数据持久化
async createUser(user: User) {
  // 先通过 Rust 验证
  const validated = await wasmBackend.createUserJson(JSON.stringify(user));
  // 然后存储到 IndexedDB
  await db.add('users', JSON.parse(validated));
}
```

### 2. **类型安全**

- Rust 的强类型系统
- TypeScript 的类型检查
- 编译时错误捕获

### 3. **性能优化**

- 验证逻辑在 WASM 中执行（快）
- 数据存储使用浏览器原生 API（快）
- 无需网络请求（Local-First）

### 4. **可扩展性**

```rust
// 轻松添加新的数据模型
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Post {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub content: String,
    pub created_at: String,
}

#[wasm_bindgen]
pub fn create_post_json(post_json: &str) -> Result<String, JsValue> {
    // 实现...
}
```

## 如果你仍然想使用 SurrealDB

如果你确实需要 SurrealDB，可以这样做：

### 1. **仅在服务器端使用**

```rust
// 服务器端 Rust 代码
use surrealdb::Surreal;
use surrealdb::engine::remote::ws::Ws;

let db = Surreal::new::<Ws>("localhost:8000").await?;
```

### 2. **浏览器端使用 SurrealDB JavaScript SDK**

```typescript
import Surreal from 'surrealdb.js';

const db = new Surreal('http://localhost:8000/rpc');
await db.signin({ user: 'root', pass: 'root' });
```

### 3. **混合架构**

```
Local-First 模式：
  - IndexedDB + Rust WASM

Server 模式：
  - SurrealDB + Rust 后端服务
```

## 建议

### 对于当前的 Local-First Demo：

✅ **保持当前实现**
- IndexedDB 用于数据存储
- Rust WASM 用于业务逻辑
- 轻量、快速、可靠

### 对于未来的生产应用：

✅ **考虑以下方案**
1. **开发环境**：IndexedDB + Rust WASM
2. **生产环境**：PostgreSQL/SurrealDB + Rust 后端
3. **共享代码**：相同的 Rust 业务逻辑

## 当前实现的文件

### Rust 后端
- [rust-backend/src/lib.rs](rust-backend/src/lib.rs) - 完整的数据库抽象层
- [rust-backend/Cargo.toml](rust-backend/Cargo.toml) - 轻量级依赖

### TypeScript 前端
- [src/db/database.ts](src/db/database.ts) - IndexedDB 封装
- [src/wasm/backend.ts](src/wasm/backend.ts) - WASM 接口
- [src/api/router.ts](src/api/router.ts) - API 路由（使用 WASM）

## 性能对比

| 方案 | WASM 大小 | 首次加载 | 查询性能 | 复杂度 |
|------|----------|---------|---------|--------|
| 当前（IndexedDB + Rust） | ~40KB | 快 | 快 | 低 |
| sql.js | ~500KB | 中等 | 快 | 中等 |
| SurrealDB WASM | >10MB | 慢 | 快 | 高 |
| SurrealDB 服务器 | N/A | 需要网络 | 很快 | 高 |

## 总结

✅ **当前实现是最佳选择**，因为：
1. 轻量级（40KB WASM）
2. 快速加载
3. 浏览器原生支持
4. 类型安全
5. 易于维护

如果你需要更复杂的数据库功能，建议：
- 开发/演示：保持当前方案
- 生产环境：使用真实的后端数据库（PostgreSQL/SurrealDB）

这样可以在开发时保持简单快速，在生产时获得完整的数据库功能。
