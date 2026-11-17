import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, RUN_ID, superUserStorageState } from '../helpers/env';
import { chooseOption, roleSelect, screenshot, waitForIdle } from '../helpers/ui';

type Row = { group: number | string; role: string };

/** `settingValues` parameters of SitesManager.addSite / updateSite for the "Group access" field. */
function groupAccessParams(rows: Row[]): Record<string, string> {
  const params: Record<string, string> = { 'settingValues[GroupPermissions][0][name]': 'group_access' };
  rows.forEach((row, i) => {
    params[`settingValues[GroupPermissions][0][value][${i}][group]`] = String(row.group);
    params[`settingValues[GroupPermissions][0][value][${i}][role]`] = row.role;
  });
  return params;
}

/**
 * The "Group access" field the plugin adds to the website create/edit form of the SitesManager (measurable setting).
 */
test.describe('Group access in the website form', () => {
  let su: MatomoApi;

  const addSite = async (name: string, rows: Row[], api?: MatomoApi): Promise<number> =>
    Number((await (api ?? su).call('SitesManager.addSite', {
      siteName: `${name} ${RUN_ID}`,
      urls: `https://${name.toLowerCase().replace(/\W+/g, '-')}-${RUN_ID}.example.org`,
      ...groupAccessParams(rows),
    })).value);
  const updateSite = async (idSite: number, rows: Row[], api?: MatomoApi) =>
    (api ?? su).call('SitesManager.updateSite', { idSite, ...groupAccessParams(rows) });
  const fieldValue = async (idSite: number, api?: MatomoApi): Promise<Row[] | undefined> => {
    const plugins: Array<{ pluginName: string; settings: Array<{ name: string; value: Row[] }> }> =
      await (api ?? su).call('SitesManager.getSiteSettings', { idSite });
    return plugins.find((p) => p.pluginName === 'GroupPermissions')?.settings.find((s) => s.name === 'group_access')?.value;
  };

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  test('creating a website gives the groups of the field their role', async () => {
    const view = await su.createGroup('Form view');
    const admin = await su.createGroup('Form admin');
    const other = await su.createGroup('Form other');

    // the UI always sends an empty last row
    const idSite = await addSite('Form Create', [
      { group: view.idGroup, role: 'view' }, { group: admin.idGroup, role: 'admin' }, { group: '', role: '' },
    ]);

    const access = await su.groupAccess(idSite);
    expect(access[view.name]).toBe('view');
    expect(access[admin.name]).toBe('admin');
    expect(access[other.name]).toBe('noaccess');
    expect(await fieldValue(idSite)).toEqual([
      { group: String(admin.idGroup), role: 'admin' },
      { group: String(view.idGroup), role: 'view' },
    ]);
  });

  test('editing a website changes and removes roles, and keeps them when the field is not sent', async () => {
    const group = await su.createGroup('Form edit');
    const removed = await su.createGroup('Form removed');
    const idSite = await addSite('Form Edit', [{ group: group.idGroup, role: 'view' }, { group: removed.idGroup, role: 'write' }]);
    await su.call('GroupPermissions.addGroupCapabilities', { idGroup: removed.idGroup, capabilities: 'tagmanager_publish_live_container', idSites: String(idSite) });

    await updateSite(idSite, [{ group: group.idGroup, role: 'write' }]);
    const access = await su.groupAccess(idSite);
    expect(access[group.name]).toBe('write');
    expect(access[removed.name]).toBe('noaccess');
    const perSite = await su.call('GroupPermissions.getGroupPermissionsFromSite', { idSite });
    expect(perSite.find((g: { idGroup: number }) => g.idGroup === removed.idGroup).capabilities).toEqual([]);

    // updating other properties does not touch the group access
    await su.call('SitesManager.updateSite', { idSite, siteName: `Form Edit renamed ${RUN_ID}` });
    expect((await su.groupAccess(idSite))[group.name]).toBe('write');
  });

  test('invalid values are rejected without creating the website', async () => {
    const group = await su.createGroup('Form invalid');
    const sitesBefore = (await su.call('SitesManager.getAllSitesId', { filter_limit: -1 })).length;

    expect(await su.expectError('SitesManager.addSite', {
      siteName: `Form Invalid ${RUN_ID}`, ...groupAccessParams([{ group: 999999, role: 'view' }]),
    })).toMatch(/Group does not exist/);
    expect(await su.expectError('SitesManager.addSite', {
      siteName: `Form Invalid ${RUN_ID}`, ...groupAccessParams([{ group: group.idGroup, role: 'superuser' }]),
    })).toMatch(/must have one of the following values/);
    expect((await su.call('SitesManager.getAllSitesId', { filter_limit: -1 })).length).toBe(sitesBefore);
  });

  test('the field and the automatic access rules are combined, the higher role wins', async () => {
    const group = await su.createGroup('Form rules');
    await su.call('GroupPermissions.addAutoAccessRule', {
      idGroup: group.idGroup, matchType: 'url', pattern: `form-rules-*-${RUN_ID}.example.org`, access: 'write',
    });
    const lower = await addSite('Form Rules Lower', [{ group: group.idGroup, role: 'view' }]);
    const higher = await addSite('Form Rules Higher', [{ group: group.idGroup, role: 'admin' }]);
    expect((await su.groupAccess(lower))[group.name]).toBe('write');
    expect((await su.groupAccess(higher))[group.name]).toBe('admin');
  });

  test('website admins can change the group access of their website only', async () => {
    const group = await su.createGroup('Form site admin');
    const own = await addSite('Form Own', [{ group: group.idGroup, role: 'view' }]);
    const foreign = await addSite('Form Foreign', [{ group: group.idGroup, role: 'view' }]);
    const login = await su.createUser('formadmin');
    await su.setUserAccess(login, 'admin', own);
    const admin = await MatomoApi.forUser(login, DEFAULT_PASSWORD);

    expect(await fieldValue(own, admin)).toEqual([{ group: String(group.idGroup), role: 'view' }]);
    await updateSite(own, [{ group: group.idGroup, role: 'write' }], admin);
    expect((await su.groupAccess(own))[group.name]).toBe('write');

    expect(await admin.expectError('SitesManager.updateSite', { idSite: foreign, ...groupAccessParams([]) })).toMatch(/'?admin'? access/);
    expect((await su.groupAccess(foreign))[group.name]).toBe('view');
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('the website editor shows and changes the group access', async ({ page }) => {
      const group = await su.createGroup('Form UI');
      const idSite = await addSite('Form UI', [{ group: group.idGroup, role: 'view' }]);

      await page.goto(`/index.php?module=SitesManager&action=index&idSite=1&period=day&date=yesterday#/editsiteid=${idSite}`);
      const field = page.locator('.editingSite .form-group', { hasText: 'Group access' }).filter({ has: page.locator('.multiPairField') }).last();
      await expect(field).toBeVisible();
      await waitForIdle(page);

      const firstRow = field.locator('.multiPairFieldTable0');
      await expect(roleSelect(firstRow.locator('.fieldUiControl1'))).toHaveValue(group.name);
      await expect(roleSelect(firstRow.locator('.fieldUiControl2'))).toHaveValue('View');
      await screenshot(field, 'site-form-group-access');

      await chooseOption(firstRow.locator('.fieldUiControl2'), 'Admin');
      await page.locator('.editingSiteFooter input[type=submit]').click();
      await waitForIdle(page);
      await expect.poll(async () => (await su.groupAccess(idSite))[group.name]).toBe('admin');
    });
  });
});
