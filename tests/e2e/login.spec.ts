import { expect, test } from '@playwright/test';

const ADMIN_EMAIL = 'admin@nowhere.com';
const ADMIN_PASSWORD = 'admin123';

test.describe('登录功能端到端', () => {
  test('管理员可以成功登录并进入仪表盘', async ({ page }) => {
    await page.goto('/');

    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page.getByRole('heading', { name: /欢迎回来/ })).toBeVisible();
    await expect(page.getByRole('link', { name: '退出' })).toBeVisible();
  });

  test('错误密码会提示登录失败', async ({ page }) => {
    await page.goto('/');

    await page.locator('input[name="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"]').fill('wrong-password');
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page.getByText('邮箱或密码错误')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });
});
