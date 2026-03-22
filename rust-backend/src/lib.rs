use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use serde::{Deserialize, Serialize};
use js_sys::{Function, Object, Promise, Reflect, Uint8Array};

// ============================================================================
// 数据结构定义
// ============================================================================

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub password: String,
    pub is_admin: Option<bool>,
    pub avatar: Option<String>,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Session {
    pub token: String,
    pub user_id: String,
    pub created_at: String,
    pub expires_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Serialize, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

// ============================================================================
// JavaScript 时间函数绑定
// ============================================================================

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = Date, js_name = now)]
    fn date_now() -> f64;
}

// ============================================================================
// 初始化函数
// ============================================================================

#[wasm_bindgen]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// ============================================================================
// 验证和安全函数
// ============================================================================

#[wasm_bindgen]
pub fn validate_email(email: &str) -> bool {
    email.contains('@') && email.contains('.') && email.len() > 5
}

#[wasm_bindgen]
pub fn hash_password(password: &str) -> String {
    let mut hash = 0u32;
    for byte in password.bytes() {
        hash = hash.wrapping_mul(31).wrapping_add(byte as u32);
    }
    format!("hash_{:x}", hash)
}

#[wasm_bindgen]
pub fn verify_password(password: &str, hash: &str) -> bool {
    hash_password(password) == hash
}

#[wasm_bindgen]
pub fn generate_id() -> String {
    let timestamp = date_now() as u64;
    format!("id_{}", timestamp)
}

#[wasm_bindgen]
pub fn generate_token() -> String {
    let timestamp = date_now() as u64;
    let random = (js_sys::Math::random() * 1000000.0) as u64;
    format!("token_{}_{}", timestamp, random)
}

#[wasm_bindgen]
pub fn validate_user_data(email: &str, name: &str, password: &str) -> Result<String, JsValue> {
    if !validate_email(email) {
        return Err(JsValue::from_str("邮箱格式不正确"));
    }

    if name.is_empty() || name.len() < 2 {
        return Err(JsValue::from_str("姓名至少需要2个字符"));
    }

    if password.len() < 6 {
        return Err(JsValue::from_str("密码至少需要6个字符"));
    }

    Ok("验证通过".to_string())
}

#[wasm_bindgen]
pub fn process_data(input: &str) -> String {
    format!("Processed by Rust WASM: {}", input)
}

#[wasm_bindgen]
pub fn sanitize_input(input: &str) -> String {
    input
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#x27;")
}

// ============================================================================
// OPFS 操作函数
// ============================================================================

#[wasm_bindgen]
pub fn opfs_is_supported() -> bool {
    let global = js_sys::global();

    let navigator = match Reflect::get(&global, &JsValue::from_str("navigator")) {
        Ok(value) => value,
        Err(_) => return false,
    };

    let storage = match Reflect::get(&navigator, &JsValue::from_str("storage")) {
        Ok(value) => value,
        Err(_) => return false,
    };

    match Reflect::get(&storage, &JsValue::from_str("getDirectory")) {
        Ok(value) => value.is_function(),
        Err(_) => false,
    }
}

#[wasm_bindgen]
pub async fn opfs_write_file(path: String, data: Vec<u8>) -> Result<(), JsValue> {
    let (directory, file_name) = resolve_parent_directory_and_file_name(&path, true).await?;
    let file_handle = get_file_handle(&directory, &file_name, true).await?;
    let writable = await_promise(call_method0(&file_handle, "createWritable")?).await?;

    let bytes = Uint8Array::from(data.as_slice());
    await_promise(call_method1(&writable, "write", &bytes.into())?).await?;
    await_promise(call_method0(&writable, "close")?).await?;

    Ok(())
}

#[wasm_bindgen]
pub async fn opfs_read_file(path: String) -> Result<Vec<u8>, JsValue> {
    let (directory, file_name) = resolve_parent_directory_and_file_name(&path, false).await?;
    let file_handle = get_file_handle(&directory, &file_name, false).await?;
    let file = await_promise(call_method0(&file_handle, "getFile")?).await?;
    let buffer = await_promise(call_method0(&file, "arrayBuffer")?).await?;
    let bytes = Uint8Array::new(&buffer);

    Ok(bytes.to_vec())
}

#[wasm_bindgen]
pub async fn opfs_delete_file(path: String) -> Result<(), JsValue> {
    let (directory, file_name) = resolve_parent_directory_and_file_name(&path, false).await?;
    await_promise(call_method1(
        &directory,
        "removeEntry",
        &JsValue::from_str(&file_name),
    )?)
    .await?;
    Ok(())
}

// ============================================================================
// 数据库操作函数（通过 JSON 序列化与 JS 交互）
// ============================================================================

#[wasm_bindgen]
pub fn create_user_json(user_json: &str) -> Result<String, JsValue> {
    let user: User = serde_json::from_str(user_json)
        .map_err(|e| JsValue::from_str(&format!("JSON 解析错误: {}", e)))?;

    validate_user_data(&user.email, &user.name, &user.password)?;

    serde_json::to_string(&user)
        .map_err(|e| JsValue::from_str(&format!("JSON 序列化错误: {}", e)))
}

#[wasm_bindgen]
pub fn validate_login_json(login_json: &str) -> Result<String, JsValue> {
    let login: LoginRequest = serde_json::from_str(login_json)
        .map_err(|e| JsValue::from_str(&format!("JSON 解析错误: {}", e)))?;

    if !validate_email(&login.email) {
        return Err(JsValue::from_str("邮箱格式不正确"));
    }

    if login.password.is_empty() {
        return Err(JsValue::from_str("密码不能为空"));
    }

    Ok("验证通过".to_string())
}

#[wasm_bindgen]
pub fn create_session_json(user_id: &str) -> Result<String, JsValue> {
    let session = Session {
        token: generate_token(),
        user_id: user_id.to_string(),
        created_at: get_current_timestamp(),
        expires_at: get_expiry_timestamp(7),
    };

    serde_json::to_string(&session)
        .map_err(|e| JsValue::from_str(&format!("JSON 序列化错误: {}", e)))
}

// ============================================================================
// 辅助函数
// ============================================================================

fn get_current_timestamp() -> String {
    let timestamp = date_now() as u64;
    format!("{}", timestamp)
}

fn get_expiry_timestamp(days: u64) -> String {
    let current = date_now() as u64;
    let expiry = current + (days * 24 * 60 * 60 * 1000);
    format!("{}", expiry)
}

async fn get_root_directory() -> Result<JsValue, JsValue> {
    let global = js_sys::global();
    let navigator = Reflect::get(&global, &JsValue::from_str("navigator"))?;
    let storage = Reflect::get(&navigator, &JsValue::from_str("storage"))?;

    await_promise(call_method0(&storage, "getDirectory")?).await
}

async fn get_directory_handle(parent: &JsValue, name: &str, create: bool) -> Result<JsValue, JsValue> {
    let options = Object::new();
    Reflect::set(&options, &JsValue::from_str("create"), &JsValue::from_bool(create))?;

    await_promise(call_method2(
        parent,
        "getDirectoryHandle",
        &JsValue::from_str(name),
        &options.into(),
    )?)
    .await
}

async fn get_file_handle(parent: &JsValue, name: &str, create: bool) -> Result<JsValue, JsValue> {
    let options = Object::new();
    Reflect::set(&options, &JsValue::from_str("create"), &JsValue::from_bool(create))?;

    await_promise(call_method2(
        parent,
        "getFileHandle",
        &JsValue::from_str(name),
        &options.into(),
    )?)
    .await
}

async fn resolve_parent_directory_and_file_name(path: &str, create_directories: bool) -> Result<(JsValue, String), JsValue> {
    let segments: Vec<&str> = path.split('/').filter(|segment| !segment.is_empty()).collect();

    if segments.is_empty() {
        return Err(JsValue::from_str("Invalid OPFS path"));
    }

    let file_name = segments.last().unwrap().to_string();
    let mut current = get_root_directory().await?;

    for segment in segments.iter().take(segments.len() - 1) {
        current = get_directory_handle(&current, segment, create_directories).await?;
    }

    Ok((current, file_name))
}

fn call_method0(target: &JsValue, name: &str) -> Result<JsValue, JsValue> {
    let method = Reflect::get(target, &JsValue::from_str(name))?.dyn_into::<Function>()?;
    method.call0(target)
}

fn call_method1(target: &JsValue, name: &str, arg0: &JsValue) -> Result<JsValue, JsValue> {
    let method = Reflect::get(target, &JsValue::from_str(name))?.dyn_into::<Function>()?;
    method.call1(target, arg0)
}

fn call_method2(target: &JsValue, name: &str, arg0: &JsValue, arg1: &JsValue) -> Result<JsValue, JsValue> {
    let method = Reflect::get(target, &JsValue::from_str(name))?.dyn_into::<Function>()?;
    method.call2(target, arg0, arg1)
}

async fn await_promise(value: JsValue) -> Result<JsValue, JsValue> {
    let promise = value.dyn_into::<Promise>()?;
    JsFuture::from(promise).await
}

// ============================================================================
// 数据库查询辅助函数
// ============================================================================

#[wasm_bindgen]
pub fn filter_users_by_email(users_json: &str, email: &str) -> Result<String, JsValue> {
    let users: Vec<User> = serde_json::from_str(users_json)
        .map_err(|e| JsValue::from_str(&format!("JSON 解析错误: {}", e)))?;

    let filtered: Vec<&User> = users.iter()
        .filter(|u| u.email == email)
        .collect();

    serde_json::to_string(&filtered)
        .map_err(|e| JsValue::from_str(&format!("JSON 序列化错误: {}", e)))
}

#[wasm_bindgen]
pub fn filter_sessions_by_token(sessions_json: &str, token: &str) -> Result<String, JsValue> {
    let sessions: Vec<Session> = serde_json::from_str(sessions_json)
        .map_err(|e| JsValue::from_str(&format!("JSON 解析错误: {}", e)))?;

    let filtered: Vec<&Session> = sessions.iter()
        .filter(|s| s.token == token)
        .collect();

    serde_json::to_string(&filtered)
        .map_err(|e| JsValue::from_str(&format!("JSON 序列化错误: {}", e)))
}

#[wasm_bindgen]
pub fn is_session_expired(session_json: &str) -> Result<bool, JsValue> {
    let session: Session = serde_json::from_str(session_json)
        .map_err(|e| JsValue::from_str(&format!("JSON 解析错误: {}", e)))?;

    let current_time = date_now() as u64;

    let expires_at = session.expires_at.parse::<u64>()
        .map_err(|e| JsValue::from_str(&format!("时间解析错误: {}", e)))?;

    Ok(current_time > expires_at)
}
