import { expect, test } from '@playwright/test';

test.describe('首页和注册功能端到端', () => {
  test('首页显示正确的产品宣传内容', async ({ page }) => {
    await page.goto('/');

    // 验证首页标题和副标题
    await expect(page.getByRole('heading', { name: '电磁仿真云 SaaS' })).toBeVisible();
    await expect(page.getByText('企业级电磁场仿真计算平台')).toBeVisible();
    await expect(
      page.getByText('基于云端 OPFS 本地存储和高性能计算引擎，为您提供快速、可靠的电磁仿真解决方案')
    ).toBeVisible();

    // 验证核心功能部分
    await expect(page.getByRole('heading', { name: '核心功能' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '本地优先存储' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '高性能计算' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '云端同步' })).toBeVisible();

    // 验证为什么选择我们部分
    await expect(page.getByRole('heading', { name: '为什么选择我们' })).toBeVisible();
    await expect(page.getByText('更快的原型设计')).toBeVisible();

    // 验证CTA部分
    await expect(page.getByRole('heading', { name: '立即开始使用电磁仿真云' })).toBeVisible();
  });

  test('首页开始体验按钮导航到登录页', async ({ page }) => {
    await page.goto('/');

    // 找到并点击"开始体验"按钮
    const startButtons = await page.locator('button:has-text("开始体验")').count();
    expect(startButtons).toBeGreaterThan(0);

    // 点击第一个按钮
    await page.locator('button:has-text("开始体验")').first().click();

    // 验证进入登录页面
    await expect(page.getByRole('heading', { name: '欢迎登录' })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('登录页面可以切换到注册页面', async ({ page }) => {
    await page.goto('/');

    // 进入登录页面
    await page.locator('button:has-text("开始体验")').first().click();

    // 验证在登录页面
    await expect(page.getByRole('heading', { name: '欢迎登录' })).toBeVisible();

    // 点击"立即注册"链接
    await page.getByRole('link', { name: '立即注册' }).click();

    // 验证进入注册页面
    await expect(page.getByRole('heading', { name: '立即注册' })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: '注册' })).toBeVisible();
  });

  test('注册页面可以切换回登录页面', async ({ page }) => {
    await page.goto('/');

    // 进入登录页面
    await page.locator('button:has-text("开始体验")').first().click();

    // 切换到注册页面
    await page.getByRole('link', { name: '立即注册' }).click();

    // 验证在注册页面
    await expect(page.getByRole('heading', { name: '立即注册' })).toBeVisible();

    // 点击"立即登录"链接
    await page.getByRole('link', { name: '立即登录' }).click();

    // 验证回到登录页面
    await expect(page.getByRole('heading', { name: '欢迎登录' })).toBeVisible();
  });

  test('登录页面可以返回首页', async ({ page }) => {
    await page.goto('/');

    // 进入登录页面
    await page.locator('button:has-text("开始体验")').first().click();

    // 验证在登录页面
    await expect(page.getByRole('heading', { name: '欢迎登录' })).toBeVisible();

    // 点击"返回首页"链接
    await page.getByRole('link', { name: '返回首页' }).click();

    // 验证回到首页
    await expect(page.getByRole('heading', { name: '电磁仿真云 SaaS' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '核心功能' })).toBeVisible();
  });

  test('注册页面可以返回首页', async ({ page }) => {
    await page.goto('/');

    // 进入登录页面
    await page.locator('button:has-text("开始体验")').first().click();

    // 切换到注册页面
    await page.getByRole('link', { name: '立即注册' }).click();

    // 验证在注册页面
    await expect(page.getByRole('heading', { name: '立即注册' })).toBeVisible();

    // 点击"返回首页"链接
    await page.getByRole('link', { name: '返回首页' }).click();

    // 验证回到首页
    await expect(page.getByRole('heading', { name: '电磁仿真云 SaaS' })).toBeVisible();
  });
});
