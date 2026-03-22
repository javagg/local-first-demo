import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const ADMIN_EMAIL = 'admin@nowhere.com';
const ADMIN_PASSWORD = 'admin123';
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

async function loginAndOpenUploadPage(page: Page) {
  await page.goto('/');

  // 从首页点击"开始体验"进入登录页面
  await expect(page.getByRole('heading', { name: '电磁仿真云 SaaS' })).toBeVisible();
  await page.getByRole('button', { name: /开始体验/ }).click();

  // 登录
  await expect(page.getByRole('heading', { name: '欢迎登录' })).toBeVisible();
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: '登录' }).click();

  // 验证进入仪表盘
  await expect(page.getByRole('heading', { name: /欢迎回来/ })).toBeVisible();

  // 导航到文件上传页面
  await page.getByRole('link', { name: '文件' }).click();
  await expect(page.getByRole('heading', { name: '文件上传' })).toBeVisible();
  await expect(page.locator('.file-list')).toContainText('我的文件');
  await page.waitForTimeout(400);
}

test.describe('文件上传端到端', () => {
  test.describe.configure({ mode: 'serial' });

  test('单文件上传后可见并可删除', async ({ page }) => {
    await loginAndOpenUploadPage(page);

    const fileName = `e2e-${Date.now()}.txt`;
    await page.setInputFiles('#file-input', {
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from('hello local-first e2e'),
    });

    await page.getByRole('button', { name: '上传文件' }).click();

    await expect(page.getByText('上传成功')).toBeVisible();
    const fileItem = page.locator('.file-item', { hasText: fileName });
    await expect(fileItem).toBeVisible();
    await expect(fileItem).toContainText(/OPFS|INDEXEDDB/);

    await fileItem.getByRole('button', { name: '删除' }).click();
    await expect(page.getByText('删除成功')).toBeVisible();
    await expect(page.locator('.file-item', { hasText: fileName })).toHaveCount(0);
  });

  test('超过 10MB 文件会被拒绝', async ({ page }) => {
    await loginAndOpenUploadPage(page);

    await page.setInputFiles('#file-input', {
      name: 'too-large.bin',
      mimeType: 'application/octet-stream',
      buffer: Buffer.alloc(MAX_UPLOAD_SIZE_BYTES + 1, 1),
    });

    await page.getByRole('button', { name: '上传文件' }).click();
    await expect(page.getByText('文件大小不能超过 10MB')).toBeVisible();
  });
});
