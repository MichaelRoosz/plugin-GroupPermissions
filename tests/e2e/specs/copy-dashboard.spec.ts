import { test, expect, Page } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID, SUPERUSER, superUserStorageState, DEFAULT_PASSWORD } from '../helpers/env';
import { screenshot, waitForIdle, clickModalButton } from '../helpers/ui';

/**
 * Copy dashboards to all members of a group via the "Copy dashboard to user" dialog
 * (GroupPermissions.copyDashboardToGroup).
 */

async function dashboardNames(su: MatomoApi, login: string): Promise<string[]> {
  const dashboards = await su.call('Dashboard.getDashboards', { login, returnDefaultIfEmpty: 0 });
  return dashboards.map((d: { name: string }) => d.name);
}

async function createDashboard(api: MatomoApi, login: string, dashboardName: string): Promise<number> {
  const result = await api.call('Dashboard.createNewDashboardForUser', { login, dashboardName });
  const id = Number(typeof result === 'object' && result !== null ? result.value : result);
  expect(id).toBeGreaterThan(0);
  return id;
}

async function openCopyDashboardDialog(page: Page) {
  await page.goto('/index.php?module=CoreHome&action=index&idSite=1&period=day&date=yesterday#?idSite=1&period=day&date=yesterday&category=Dashboard_Dashboard&subcategory=1');
  await waitForIdle(page);
  await page.locator('.dashboard-manager .title').click();
  // Matomo 5.1 uses <li data-action>, newer 5.x versions a redesigned menu: select by the visible text
  await page.locator('text="Copy dashboard to user" >> visible=true').first().click();
  const dialog = page.locator('.modal.open', { hasText: 'Copy dashboard to user' });
  await expect(dialog).toBeVisible();
  const select = dialog.locator('select[name="copyDashboardUser"]');
  // wait for both requests (users + groups) to be rendered
  await expect(select.locator('optgroup')).toHaveCount(2);
  return { dialog, select };
}

test.describe('Copy dashboard to group', () => {
  let su: MatomoApi;
  let team: { idGroup: number; name: string };
  let members: string[];
  let outsider: string;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    team = await su.createGroup('Dashboard Team');
    members = [await su.createUser('dash_alice'), await su.createUser('dash_bob')];
    outsider = await su.createUser('dash_outsider');
    // the super user is a member too and must be skipped
    await su.addMembers(team.idGroup, [...members, SUPERUSER.login]);
    // on a fresh install the default dashboard is not persisted until the layout is saved once
    if ((await dashboardNames(su, SUPERUSER.login)).length === 0) {
      await createDashboard(su, SUPERUSER.login, 'Dashboard');
    }
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('dialog lists users and all groups (more than 100)', async ({ page }) => {
      let total = (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).length;
      const fillers: number[] = [];
      for (; total <= 100; total++) {
        fillers.push((await su.call('GroupPermissions.createGroup', { groupName: `Filler ${RUN_ID} ${String(total).padStart(3, '0')}` })).idGroup);
      }

      const { dialog, select } = await openCopyDashboardDialog(page);

      const users = select.locator('optgroup[label="Users"] option');
      const groups = select.locator('optgroup[label="Groups"] option');
      await expect(users.first()).toHaveText(SUPERUSER.login);
      await expect(users.filter({ hasText: members[0] })).toHaveCount(1);
      await expect(users.filter({ hasText: 'anonymous' })).toHaveCount(0);
      await expect(groups.filter({ hasText: team.name })).toHaveCount(1);
      await expect(groups).toHaveCount(total);
      const groupLabels = await groups.allInnerTexts();
      expect(groupLabels).toEqual([...groupLabels].sort((x, y) => x.localeCompare(y)));
      for (const idGroup of fillers) await su.call('GroupPermissions.deleteGroup', { idGroup });
      await expect(groups.filter({ hasText: team.name })).toHaveAttribute('value', `grouppermissions-group:${team.idGroup}`);

      await select.selectOption({ label: team.name });
      await screenshot(dialog, 'copy-dashboard-dialog');
    });

    test('copies the dashboard to all group members except the current user', async ({ page }) => {
      const dashboardName = `Team dashboard ${RUN_ID}`;
      const superUserDashboardsBefore = await dashboardNames(su, SUPERUSER.login);

      const { dialog, select } = await openCopyDashboardDialog(page);
      await dialog.locator('input[name="copyDashboardName"]').fill(dashboardName);
      await select.selectOption({ label: team.name });
      await clickModalButton(page, 'Ok');

      const alert = page.locator('.modal.open').filter({ hasText: 'Dashboard copied to' });
      await expect(alert).toContainText(`Dashboard copied to 2 member(s) of the group '${team.name}'.`);
      await screenshot(alert, 'copy-dashboard-success');

      for (const login of members) {
        expect(await dashboardNames(su, login)).toContain(dashboardName);
      }
      expect(await dashboardNames(su, outsider)).not.toContain(dashboardName);
      expect(await dashboardNames(su, SUPERUSER.login)).toEqual(superUserDashboardsBefore);
    });

    test('falls back to the user list if the groups cannot be loaded', async ({ page }) => {
      await page.route(/method=GroupPermissions\.getAllGroups/, (route) =>
        route.fulfill({ contentType: 'application/json', body: '{"result":"error","message":"failed"}' }));
      await page.goto('/index.php?module=CoreHome&action=index&idSite=1&period=day&date=yesterday#?idSite=1&period=day&date=yesterday&category=Dashboard_Dashboard&subcategory=1');
      await waitForIdle(page);
      await page.locator('.dashboard-manager .title').click();
      await page.locator('text="Copy dashboard to user" >> visible=true').first().click();
      const select = page.locator('.modal.open select[name="copyDashboardUser"]');
      await expect(select.locator('option', { hasText: members[0] })).toHaveCount(1);
      await expect(select.locator('optgroup')).toHaveCount(0);
      await expect(select.locator('option').first()).toHaveText(SUPERUSER.login);
    });

    test('copying to a single user still works', async ({ page }) => {
      const dashboardName = `Single dashboard ${RUN_ID}`;

      const { dialog, select } = await openCopyDashboardDialog(page);
      await dialog.locator('input[name="copyDashboardName"]').fill(dashboardName);
      await select.selectOption({ label: outsider });
      await clickModalButton(page, 'Ok');

      await expect(page.locator('.modal.open').filter({ hasText: 'dashboard successfully copied to selected user' })).toBeVisible();
      expect(await dashboardNames(su, outsider)).toContain(dashboardName);
      expect(await dashboardNames(su, members[0])).not.toContain(dashboardName);
    });
  });

  test.describe('API', () => {
    let idDashboard: number;

    test.beforeAll(async () => {
      idDashboard = await createDashboard(su, SUPERUSER.login, `Source ${RUN_ID}`);
    });

    test('returns the logins the dashboard was copied to', async () => {
      const copiedTo = await su.call('GroupPermissions.copyDashboardToGroup', {
        idDashboard,
        idGroup: team.idGroup,
        dashboardName: `API copy ${RUN_ID}`,
      });
      expect([...copiedTo].sort()).toEqual([...members].sort());
      for (const login of members) {
        expect(await dashboardNames(su, login)).toContain(`API copy ${RUN_ID}`);
      }
    });

    test('without a dashboard name the copies are created with the default name', async () => {
      const before = await Promise.all(members.map((login) => dashboardNames(su, login)));
      const copiedTo = await su.call('GroupPermissions.copyDashboardToGroup', { idDashboard, idGroup: team.idGroup });
      expect([...copiedTo].sort()).toEqual([...members].sort());
      for (const [i, login] of members.entries()) {
        expect((await dashboardNames(su, login)).length).toBe(before[i].length + 1);
      }
    });

    test('empty group copies to nobody', async () => {
      const emptyGroup = await su.createGroup('Empty Dashboard Group');
      expect(await su.call('GroupPermissions.copyDashboardToGroup', { idDashboard, idGroup: emptyGroup.idGroup })).toEqual([]);
    });

    test('rejects unknown groups and dashboards', async () => {
      expect(await su.expectError('GroupPermissions.copyDashboardToGroup', { idDashboard, idGroup: 999999 }))
        .toMatch(/Group does not exist/);
      expect(await su.expectError('GroupPermissions.copyDashboardToGroup', { idDashboard: 999999, idGroup: team.idGroup }))
        .toMatch(/Dashboard not found/);
    });

    test('site admins only copy to the group members they are allowed to see', async () => {
      const idSite = await su.createSite('Dashboard Admin Site');
      const adminLogin = await su.createUser('dash_admin');
      await su.setUserAccess(adminLogin, 'admin', idSite);
      // only alice has access to the admin's website
      await su.setUserAccess(members[0], 'view', idSite);

      const admin = await MatomoApi.forUser(adminLogin, DEFAULT_PASSWORD);
      const adminDashboard = await createDashboard(admin, adminLogin, 'Admin source');

      const copiedTo = await admin.call('GroupPermissions.copyDashboardToGroup', {
        idDashboard: adminDashboard,
        idGroup: team.idGroup,
        dashboardName: `Admin copy ${RUN_ID}`,
      });
      expect(copiedTo).toEqual([members[0]]);
      expect(await dashboardNames(su, members[0])).toContain(`Admin copy ${RUN_ID}`);
      expect(await dashboardNames(su, members[1])).not.toContain(`Admin copy ${RUN_ID}`);
      expect(await dashboardNames(su, SUPERUSER.login)).not.toContain(`Admin copy ${RUN_ID}`);
    });

    test('users without admin access cannot copy dashboards to groups', async () => {
      const viewer = await su.createUser('dash_viewer');
      await su.setUserAccess(viewer, 'view', 1);
      const api = await MatomoApi.forUser(viewer, DEFAULT_PASSWORD);
      expect(await api.expectError('GroupPermissions.copyDashboardToGroup', { idDashboard: 1, idGroup: team.idGroup }))
        .toMatch(/'?admin'? access/);
    });
  });
});
