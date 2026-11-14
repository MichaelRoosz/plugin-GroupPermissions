import { test, expect, Browser } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD } from '../helpers/env';
import { accessRow, login, screenshot, setAccess, waitForIdle } from '../helpers/ui';

async function pageAs(browser: Browser, user: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, user, DEFAULT_PASSWORD);
  return page;
}

/**
 * Who can open the Group Permissions admin page and what they see.
 */
test.describe('Admin page permissions', () => {
  let su: MatomoApi;
  let idSite: number;
  let siteName: string;
  let group: { idGroup: number; name: string };

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    idSite = await su.createSite('Admin Page Site');
    siteName = (await su.call('SitesManager.getSiteFromId', { idSite })).name;
    group = await su.createGroup('Admin Page');
  });

  test('anonymous users are redirected to the login', async ({ page }) => {
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday');
    await expect(page.locator('#login_form')).toBeVisible();
  });

  test('users with view access cannot open the page and do not see the menu entry', async ({ browser }) => {
    const viewer = await su.createUser('page_viewer');
    await su.setUserAccess(viewer, 'view', idSite);
    const page = await pageAs(browser, viewer);

    await page.goto(`/index.php?module=CoreAdminHome&action=home&idSite=${idSite}&period=day&date=yesterday`);
    await expect(page.locator('a:text-is("Group Permissions")')).toHaveCount(0);

    await page.goto(`/index.php?module=GroupPermissions&action=index&idSite=${idSite}&period=day&date=yesterday`);
    await expect(page.locator('body')).toContainText(/admin access/);
    await expect(page.locator('.groupPermissionsTabs')).toHaveCount(0);
    await page.context().close();
  });

  test('site admins only see the Manage Access tab for their websites', async ({ browser }) => {
    const admin = await su.createUser('page_admin');
    await su.setUserAccess(admin, 'admin', idSite);
    const page = await pageAs(browser, admin);

    await page.goto(`/index.php?module=CoreAdminHome&action=home&idSite=${idSite}&period=day&date=yesterday`);
    await page.locator('text="System" >> visible=true').first().click();
    await expect(page.locator('a:text-is("Group Permissions") >> visible=true')).toHaveCount(1);

    await page.goto(`/index.php?module=GroupPermissions&action=index&idSite=${idSite}&period=day&date=yesterday&show=groups`);
    await waitForIdle(page);
    await expect(page.locator('h2:text-is("Group Permissions")')).toBeVisible();
    await expect(page.locator('.groupPermissionsTabs')).toHaveCount(0);
    await expect(page.getByText('Create a new group')).toHaveCount(0);
    await expect(page.getByText('Decide which groups have access to your websites.')).toBeVisible();

    // only his website is selectable, no "Apply to all websites"
    const selector = page.locator('.siteSelector').first();
    await expect(selector.locator('.title')).toContainText(siteName);
    await selector.locator('.title').click();
    await expect(selector.getByText('Apply to all websites')).toHaveCount(0);
    await page.keyboard.press('Escape');

    const row = accessRow(page, group.name);
    await setAccess(page, row, 'write');
    await screenshot(page, 'manage-access-site-admin');
    await expect.poll(async () => (await su.groupAccess(idSite))[group.name]).toBe('write');
    await page.context().close();
  });
});
