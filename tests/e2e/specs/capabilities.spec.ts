import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, superUserStorageState } from '../helpers/env';
import {
  accessRow, chooseOption, clickModalButton, openGroupEditor, openGroupPermissions, screenshot, toast, waitForIdle,
  websiteRow,
} from '../helpers/ui';

/**
 * Capabilities of groups (e.g. Tag Manager capabilities): API, how they apply to the group members, and the UI.
 */
test.describe('Group capabilities', () => {
  let su: MatomoApi;

  const WRITE = 'tagmanager_write';
  const PUBLISH = 'tagmanager_publish_live_container';
  const TEMPLATES = 'tagmanager_use_custom_templates';

  /** Capabilities of a user for a website, as Matomo core sees them. */
  const effectiveCapabilities = async (login: string, idSite: number): Promise<string[]> => {
    const user = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    const rows = await user.call('UsersManager.getUsersPlusRole', { idSite, filter_limit: -1 });
    const row = rows.find((r: { login: string }) => r.login === login);
    return row ? [...row.capabilities].sort() : [];
  };
  const groupSite = async (idGroup: number, idSite: number) =>
    (await su.call('GroupPermissions.getSitesAccessFromGroup', { idGroup, filter_limit: -1 }))
      .find((s: { idSite: number }) => Number(s.idSite) === idSite);
  const addCapabilities = (idGroup: number, capabilities: string | string[], idSites: number | string) =>
    su.call('GroupPermissions.addGroupCapabilities', { idGroup, capabilities, idSites: String(idSites) });
  const removeCapabilities = (idGroup: number, capabilities: string | string[], idSites: number | string) =>
    su.call('GroupPermissions.removeGroupCapabilities', { idGroup, capabilities, idSites: String(idSites) });

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    const available = (await su.call('UsersManager.getAvailableCapabilities')).map((c: { id: string }) => c.id);
    expect(available, 'the Tag Manager must be activated for these tests').toEqual(expect.arrayContaining([WRITE, PUBLISH, TEMPLATES]));
  });

  test('capabilities can be added and removed and are returned with the group access', async () => {
    const group = await su.createGroup('Caps api');
    const idSite = await su.createSite('Caps Api Site');
    await su.setGroupAccess(group.name, 'view', idSite);

    await addCapabilities(group.idGroup, [WRITE, PUBLISH], idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities.sort()).toEqual([PUBLISH, WRITE]);
    const perSite = (await su.call('GroupPermissions.getGroupPermissionsFromSite', { idSite }))
      .find((g: { idGroup: number }) => g.idGroup === group.idGroup);
    expect(perSite).toMatchObject({ name: group.name, access: 'view' });
    expect(perSite.capabilities.sort()).toEqual([PUBLISH, WRITE]);

    // adding again is a no-op
    await addCapabilities(group.idGroup, WRITE, idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities.sort()).toEqual([PUBLISH, WRITE]);

    await removeCapabilities(group.idGroup, PUBLISH, idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([WRITE]);
  });

  test('capabilities need a role and are validated', async () => {
    const group = await su.createGroup('Caps invalid');
    const idSite = await su.createSite('Caps Invalid Site');

    expect(await su.expectError('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: String(idSite) }))
      .toMatch(/needs a role for the website/);

    await su.setGroupAccess(group.name, 'view', idSite);
    expect(await su.expectError('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: 'view', idSites: String(idSite) }))
      .toMatch(/must have one of the following values/);
    expect(await su.expectError('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: 'unknown_capability', idSites: String(idSite) }))
      .toMatch(/must have one of the following values/);
    expect(await su.expectError('GroupPermissions.addGroupCapabilities', { idGroup: 999999, capabilities: WRITE, idSites: String(idSite) }))
      .toMatch(/Group does not exist/);
    expect(await su.expectError('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: '999999' }))
      .toMatch(/website id was set to '999999'/);
    expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([]);
  });

  test('capabilities included in the role are not stored', async () => {
    const group = await su.createGroup('Caps admin');
    const idSite = await su.createSite('Caps Admin Site');
    await su.setGroupAccess(group.name, 'admin', idSite);
    await addCapabilities(group.idGroup, [WRITE, PUBLISH, TEMPLATES], idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([]);
  });

  test('changing the role keeps the capabilities, removing the role removes them', async () => {
    const group = await su.createGroup('Caps role change');
    const idSite = await su.createSite('Caps Role Change Site');
    await su.setGroupAccess(group.name, 'view', idSite);
    await addCapabilities(group.idGroup, [WRITE, PUBLISH], idSite);

    // the write role includes tagmanager_write: only that one is redundant now
    await su.setGroupAccess(group.name, 'write', idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([PUBLISH]);
    await su.setGroupAccess(group.name, 'view', idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([PUBLISH]);

    // admin includes all Tag Manager capabilities
    await su.setGroupAccess(group.name, 'admin', idSite);
    await su.setGroupAccess(group.name, 'view', idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([]);

    await addCapabilities(group.idGroup, WRITE, idSite);
    await su.setGroupAccess(group.name, 'noaccess', idSite);
    await su.setGroupAccess(group.name, 'view', idSite);
    expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([]);
  });

  test('group members get the capabilities of their groups', async () => {
    const group = await su.createGroup('Caps members');
    const idSite = await su.createSite('Caps Members Site');
    const otherSite = await su.createSite('Caps Members Other');
    await su.setGroupAccess(group.name, 'view', `${idSite},${otherSite}`);
    await addCapabilities(group.idGroup, [WRITE, PUBLISH], idSite);

    const login = await su.createUser('caps_member');
    await su.addMembers(group.idGroup, [login]);

    expect(await effectiveCapabilities(login, idSite)).toEqual([PUBLISH, WRITE]);
    expect(await effectiveCapabilities(login, otherSite)).toEqual([]);

    await removeCapabilities(group.idGroup, PUBLISH, idSite);
    expect(await effectiveCapabilities(login, idSite)).toEqual([WRITE]);

    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login });
    const viewable = (await (await MatomoApi.forUser(login, DEFAULT_PASSWORD)).call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number);
    expect(viewable).not.toContain(idSite);
  });

  test('capabilities of groups and of the user add up, the role of another group is enough', async () => {
    const capsGroup = await su.createGroup('Caps sum caps');
    const roleGroup = await su.createGroup('Caps sum role');
    const idSite = await su.createSite('Caps Sum Site');
    await su.setGroupAccess(capsGroup.name, 'view', idSite);
    await su.setGroupAccess(roleGroup.name, 'write', idSite);
    await addCapabilities(capsGroup.idGroup, PUBLISH, idSite);

    const login = await su.createUser('caps_sum');
    await su.addMembers(capsGroup.idGroup, [login]);
    await su.addMembers(roleGroup.idGroup, [login]);
    // a capability of the user itself
    await su.setUserAccess(login, 'view', idSite);
    await su.call('UsersManager.addCapabilities', { userLogin: login, capabilities: TEMPLATES, idSites: String(idSite) });

    // tagmanager_write comes with the write role of the other group
    expect(await effectiveCapabilities(login, idSite)).toEqual([PUBLISH, TEMPLATES, WRITE]);
    const user = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    const role = (await user.call('UsersManager.getUsersPlusRole', { idSite })).find((r: { login: string }) => r.login === login).role;
    expect(role).toBe('write');
  });

  test('capabilities of the user itself are kept when the user is in a group', async () => {
    const group = await su.createGroup('Caps own');
    const groupSiteId = await su.createSite('Caps Own Group Site');
    const ownSite = await su.createSite('Caps Own User Site');
    await su.setGroupAccess(group.name, 'view', groupSiteId);

    const login = await su.createUser('caps_own');
    await su.setUserAccess(login, 'view', ownSite);
    await su.call('UsersManager.addCapabilities', { userLogin: login, capabilities: WRITE, idSites: String(ownSite) });
    await su.addMembers(group.idGroup, [login]);

    expect(await effectiveCapabilities(login, ownSite)).toEqual([WRITE]);
    expect(await effectiveCapabilities(login, groupSiteId)).toEqual([]);
  });

  test('site admins can change capabilities only for the websites they administer', async () => {
    const group = await su.createGroup('Caps site admin');
    const adminSite = await su.createSite('Caps Admin Owned');
    const otherSite = await su.createSite('Caps Admin Other');
    await su.setGroupAccess(group.name, 'view', `${adminSite},${otherSite}`);

    const adminLogin = await su.createUser('caps_site_admin');
    await su.setUserAccess(adminLogin, 'admin', adminSite);
    const admin = await MatomoApi.forUser(adminLogin, DEFAULT_PASSWORD);
    const viewLogin = await su.createUser('caps_view_user');
    await su.setUserAccess(viewLogin, 'view', adminSite);
    const viewUser = await MatomoApi.forUser(viewLogin, DEFAULT_PASSWORD);

    await admin.call('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: String(adminSite) });
    expect((await groupSite(group.idGroup, adminSite)).capabilities).toEqual([WRITE]);
    expect(await admin.expectError('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: String(otherSite) }))
      .toMatch(/'?admin'? access/);
    expect(await viewUser.expectError('GroupPermissions.removeGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: String(adminSite) }))
      .toMatch(/'?admin'? access/);
    await expect(MatomoApi.raw('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: String(adminSite) }))
      .rejects.toThrow(/./);
    expect((await groupSite(group.idGroup, otherSite)).capabilities).toEqual([]);

    await admin.call('GroupPermissions.removeGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: String(adminSite) });
    expect((await groupSite(group.idGroup, adminSite)).capabilities).toEqual([]);
  });

  test('deleting a website or group removes its capabilities', async () => {
    const group = await su.createGroup('Caps cleanup');
    const idSite = await su.createSite('Caps Cleanup Site');
    await su.setGroupAccess(group.name, 'view', idSite);
    await addCapabilities(group.idGroup, WRITE, idSite);
    const login = await su.createUser('caps_cleanup');
    await su.addMembers(group.idGroup, [login]);
    expect(await effectiveCapabilities(login, idSite)).toEqual([WRITE]);

    await su.deleteSite(idSite);
    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });
    expect(await su.expectError('GroupPermissions.getSitesAccessFromGroup', { idGroup: group.idGroup })).toMatch(/Group does not exist/);
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('the group editor shows and changes the capabilities per website', async ({ page }) => {
      const group = await su.createGroup('Caps ui editor');
      const idSite = await su.createSite('Caps Ui Editor Site');
      const siteName = (await su.call('SitesManager.getSiteFromId', { idSite })).name;
      await su.setGroupAccess(group.name, 'view', idSite);

      await openGroupEditor(page, group.idGroup, 'access');
      await expect(page.locator('.groupPermissionsWebsitesTable thead th')).toHaveText(['Website', 'Role', 'Capabilities', 'Actions'], { ignoreCase: true });
      const row = websiteRow(page, siteName);
      const cell = row.locator('td.capabilities-cell');
      await expect(cell.locator('.chip')).toHaveCount(0);

      // add a capability via the expandable select
      await cell.locator('.addCapability .select-wrapper').click();
      await cell.locator('.expandableListCategory', { hasText: 'Tag Manager' }).click();
      await cell.locator('.expandableListItem', { hasText: 'Publish Live Container' }).click();
      await waitForIdle(page);
      await expect(toast(page, `The group '${group.name}' now has the capability 'Publish Live Container'`)).toBeVisible();
      await expect(cell.locator(`.chip[data-capability="${PUBLISH}"]`)).toBeVisible();
      expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([PUBLISH]);
      await screenshot(page.locator('.groupPermissionsWebsiteAccess'), 'group-editor-capabilities');

      // the capabilities included in a role are shown, but cannot be removed
      await chooseOption(row.locator('td.access-cell'), 'Admin');
      await waitForIdle(page);
      await expect(cell.locator('.chip.includedInRole')).toHaveCount(3);
      await expect(cell.locator('.chip .icon-close')).toHaveCount(0);
      await expect(cell.locator('.addCapability')).toHaveCount(0);
      expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([]);

      // remove after confirmation
      await chooseOption(row.locator('td.access-cell'), 'View');
      await waitForIdle(page);
      await su.call('GroupPermissions.addGroupCapabilities', { idGroup: group.idGroup, capabilities: WRITE, idSites: String(idSite) });
      await page.reload();
      await waitForIdle(page);
      const chip = websiteRow(page, siteName).locator(`.chip[data-capability="${WRITE}"]`);
      await chip.locator('.icon-close').click();
      await expect(page.locator('.modal.open')).toContainText(`remove the capability 'Write' from the group '${group.name}'`);
      await clickModalButton(page, 'Yes');
      await waitForIdle(page);
      await expect(chip).toHaveCount(0);
      expect((await groupSite(group.idGroup, idSite)).capabilities).toEqual([]);
    });

    test('the Manage Access tab shows and changes the capabilities of the groups', async ({ page }) => {
      const group = await su.createGroup('Caps ui access');
      const idSite = await su.createSite('Caps Ui Access Site');
      await su.setGroupAccess(group.name, 'view', idSite);
      await addCapabilities(group.idGroup, PUBLISH, idSite);

      await openGroupPermissions(page, 'access', '', idSite);
      const row = accessRow(page, group.name);
      const cell = row.locator('td.capabilities-cell');
      await expect(cell.locator(`.chip[data-capability="${PUBLISH}"]`)).toBeVisible();
      await expect(cell.locator('.chip')).toHaveCount(1);
      await expect(cell.locator('.addCapability input.select-dropdown')).toHaveAttribute('placeholder', 'Add capability');
      await screenshot(row, 'manage-access-capabilities');

      await cell.locator('.addCapability .select-wrapper').click();
      await cell.locator('.expandableListCategory', { hasText: 'Tag Manager' }).click();
      await cell.locator('.expandableListItem', { hasText: 'Write' }).first().click();
      await waitForIdle(page);
      await expect(cell.locator(`.chip[data-capability="${WRITE}"]`)).toBeVisible();
      expect((await groupSite(group.idGroup, idSite)).capabilities.sort()).toEqual([PUBLISH, WRITE]);

      // without a role there is nothing to add
      await chooseOption(row.locator('td.access-cell'), 'No access');
      await waitForIdle(page);
      await expect(cell.locator('.chip')).toHaveCount(0);
      await expect(cell.locator('.addCapability')).toHaveCount(0);
      expect(await groupSite(group.idGroup, idSite)).toBeUndefined();
    });
  });
});
