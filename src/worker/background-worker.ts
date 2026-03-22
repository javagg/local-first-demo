/// <reference lib="webworker" />

const workerSelf = self as unknown as DedicatedWorkerGlobalScope;

let wasmModule: any = null;

// 加载 WASM 模块
async function loadWasm() {
  try {
    // 动态导入 WASM 模块
    const wasmImport = await import('../wasm/localdemo_backend.js');
    await wasmImport.default();
    wasmModule = wasmImport;
    console.log('WASM 模块加载成功');

    // 初始化 WASM
    if (wasmModule.init) {
      wasmModule.init();
    }

    workerSelf.postMessage({
      type: 'WASM_LOADED',
      payload: { success: true },
    });
  } catch (error) {
    console.error('WASM 模块加载失败:', error);
    workerSelf.postMessage({
      type: 'WASM_LOAD_ERROR',
      payload: { error: String(error) },
    });
  }
}

// 启动时加载 WASM
loadWasm();

workerSelf.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'VALIDATE_EMAIL':
      handleValidateEmail(payload);
      break;
    case 'HASH_PASSWORD':
      handleHashPassword(payload);
      break;
    case 'VERIFY_PASSWORD':
      handleVerifyPassword(payload);
      break;
    case 'VALIDATE_USER_DATA':
      handleValidateUserData(payload);
      break;
    case 'GENERATE_ID':
      handleGenerateId(payload);
      break;
    case 'GENERATE_TOKEN':
      handleGenerateToken(payload);
      break;
    case 'PROCESS_DATA':
      handleProcessData(payload);
      break;
    case 'SANITIZE_INPUT':
      handleSanitizeInput(payload);
      break;
    case 'SYNC_DATA':
      handleDataSync(payload);
      break;
    case 'PROCESS_TASK':
      handleTaskProcessing(payload);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
});

function handleValidateEmail(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'VALIDATE_EMAIL_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  const isValid = wasmModule.validate_email(payload.email);
  workerSelf.postMessage({
    type: 'VALIDATE_EMAIL_RESULT',
    payload: { isValid, requestId: payload.requestId },
  });
}

function handleHashPassword(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'HASH_PASSWORD_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  const hash = wasmModule.hash_password(payload.password);
  workerSelf.postMessage({
    type: 'HASH_PASSWORD_RESULT',
    payload: { hash, requestId: payload.requestId },
  });
}

function handleVerifyPassword(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'VERIFY_PASSWORD_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  const isValid = wasmModule.verify_password(payload.password, payload.hash);
  workerSelf.postMessage({
    type: 'VERIFY_PASSWORD_RESULT',
    payload: { isValid, requestId: payload.requestId },
  });
}

function handleValidateUserData(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'VALIDATE_USER_DATA_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  try {
    const result = wasmModule.validate_user_data(
      payload.email,
      payload.name,
      payload.password
    );
    workerSelf.postMessage({
      type: 'VALIDATE_USER_DATA_RESULT',
      payload: { success: true, message: result, requestId: payload.requestId },
    });
  } catch (error) {
    workerSelf.postMessage({
      type: 'VALIDATE_USER_DATA_RESULT',
      payload: { success: false, error: String(error), requestId: payload.requestId },
    });
  }
}

function handleGenerateId(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'GENERATE_ID_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  const id = wasmModule.generate_id();
  workerSelf.postMessage({
    type: 'GENERATE_ID_RESULT',
    payload: { id, requestId: payload.requestId },
  });
}

function handleGenerateToken(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'GENERATE_TOKEN_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  const token = wasmModule.generate_token();
  workerSelf.postMessage({
    type: 'GENERATE_TOKEN_RESULT',
    payload: { token, requestId: payload.requestId },
  });
}

function handleProcessData(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'PROCESS_DATA_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  const result = wasmModule.process_data(payload.input);
  workerSelf.postMessage({
    type: 'PROCESS_DATA_RESULT',
    payload: { result, requestId: payload.requestId },
  });
}

function handleSanitizeInput(payload: any) {
  if (!wasmModule) {
    workerSelf.postMessage({
      type: 'SANITIZE_INPUT_RESULT',
      payload: { error: 'WASM module not loaded' },
    });
    return;
  }

  const sanitized = wasmModule.sanitize_input(payload.input);
  workerSelf.postMessage({
    type: 'SANITIZE_INPUT_RESULT',
    payload: { sanitized, requestId: payload.requestId },
  });
}

async function handleDataSync(_payload: any) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  workerSelf.postMessage({
    type: 'SYNC_COMPLETE',
    payload: { success: true, timestamp: Date.now() },
  });
}

async function handleTaskProcessing(payload: any) {
  await new Promise(resolve => setTimeout(resolve, 500));

  workerSelf.postMessage({
    type: 'TASK_COMPLETE',
    payload: { taskId: payload.taskId, result: 'processed' },
  });
}
