import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, RUN_ID, superUserStorageState } from '../helpers/env';
import {
  clickModalButton, fillField, memberRow, openGroupEditor, saveButton, screenshot, switchEditorTab, toast, waitForIdle,
} from '../helpers/ui';

/**
 * Group sync from external directories (LDAP, SAML): external groups mapped to groups, memberships
 * synchronized via GroupPermissions.syncUserGroups (the same code path the LDAP login sync and the
 * GroupPermissions.syncUserGroups event use).
 */

type Member = { login: string; synced: boolean };

test.describe('Group sync from external directories', () => {
  let su: MatomoApi;
  let admins: { idGroup: number; name: string };
  let editors: { idGroup: number; name: string };
  let manual: { idGroup: number; name: string };
  let idSite: number;

  const adminsDn = `CN=Matomo Admins ${RUN_ID},OU=Groups,DC=example,DC=com`;
  const editorsName = `matomo-editors-${RUN_ID}`;

  const mappings = (idGroup: number): Promise<string[]> =>
    su.call('GroupPermissions.getExternalGroupMappings', { idGroup });
  const sync = (userLogin: string, externalGroups: string[]): Promise<{ added: string[]; removed: string[] }> =>
    su.call('GroupPermissions.syncUserGroups', { userLogin, externalGroups });
  const membersWithFlag = async (idGroup: number): Promise<Member[]> =>
    su.call('GroupPermissions.getMembersOfGroup', { idGroup, filter_limit: -1 });

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    admins = await su.createGroup('Sync Admins');
    editors = await su.createGroup('Sync Editors');
    manual = await su.createGroup('Sync Manual');
    idSite = await su.createSite('Sync Site');
    await su.setGroupAccess(admins.name, 'admin', idSite);

    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: admins.idGroup, externalGroup: adminsDn });
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: editors.idGroup, externalGroup: editorsName });
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: manual.idGroup, externalGroup: `manual-${RUN_ID}` });
  });

  test('mappings can be listed, are unique (case-insensitive) and can be removed', async () => {
    const group = await su.createGroup('Sync Mapping CRUD');
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup: '  R&D "Team" <x>  ' });
    expect(await mappings(group.idGroup)).toEqual(['R&D "Team" <x>']);

    expect(await su.expectError('GroupPermissions.addExternalGroupMapping', {
      idGroup: group.idGroup, externalGroup: 'r&d "TEAM" <X>',
    })).toContain('already mapped');
    // the database may consider names equal that differ in more than case (e.g. accents): then adding fails
    // instead of reporting success without storing the mapping
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup: 'Café' });
    const accentError = await su.expectError('GroupPermissions.addExternalGroupMapping', {
      idGroup: group.idGroup, externalGroup: 'Cafe',
    }).catch(() => null);
    if (accentError === null) {
      expect(await mappings(group.idGroup)).toContain('Cafe');
      await su.call('GroupPermissions.removeExternalGroupMapping', { idGroup: group.idGroup, externalGroup: 'Cafe' });
    } else {
      expect(accentError).toContain('already mapped');
    }
    await su.call('GroupPermissions.removeExternalGroupMapping', { idGroup: group.idGroup, externalGroup: 'Café' });
    expect(await mappings(group.idGroup)).toEqual(['R&D "Team" <x>']);

    expect(await su.expectError('GroupPermissions.addExternalGroupMapping', {
      idGroup: group.idGroup, externalGroup: '   ',
    })).toMatch(/Please (enter|specify)/);
    expect(await su.expectError('GroupPermissions.addExternalGroupMapping', {
      idGroup: group.idGroup, externalGroup: 'x'.repeat(191),
    })).toContain('too long');
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup: 'ä'.repeat(190) });
    await su.call('GroupPermissions.removeExternalGroupMapping', { idGroup: group.idGroup, externalGroup: 'ä'.repeat(190) });

    await su.call('GroupPermissions.removeExternalGroupMapping', { idGroup: group.idGroup, externalGroup: 'R&D "TEAM" <X>' });
    expect(await mappings(group.idGroup)).toEqual([]);
    expect(await su.expectError('GroupPermissions.removeExternalGroupMapping', {
      idGroup: group.idGroup, externalGroup: 'R&D "TEAM" <X>',
    })).toContain('is not mapped to this group');
  });

  test('sync adds the user to mapped groups, matching a DN by its first value and names case-insensitively', async () => {
    const user = await su.createUser('sync_user');
    const userApi = await MatomoApi.forUser(user, DEFAULT_PASSWORD);
    expect(await userApi.call('SitesManager.getSitesIdWithAdminAccess')).toEqual([]);

    // the IdP sends only the CN of the DN, in a different case; unknown groups are ignored
    const result = await sync(user, [`matomo admins ${RUN_ID}`, editorsName.toUpperCase(), 'Unrelated']);
    expect(result.added.sort()).toEqual([admins.name, editors.name].sort());
    expect(result.removed).toEqual([]);

    expect(await membersWithFlag(admins.idGroup)).toContainEqual({ login: user, synced: true });
    expect(await membersWithFlag(editors.idGroup)).toContainEqual({ login: user, synced: true });
    // the synced membership grants the access of the group
    expect(await userApi.call('SitesManager.getSitesIdWithAdminAccess')).toEqual([idSite]);

    // a second sync with the same groups changes nothing; the full DN matches too
    expect(await sync(user, [adminsDn, editorsName])).toEqual({ added: [], removed: [] });
  });

  test('sync removes synced memberships that no longer match, but keeps manual ones', async () => {
    const user = await su.createUser('sync_keep');
    await su.addMembers(manual.idGroup, [user]);
    expect(await membersWithFlag(manual.idGroup)).toContainEqual({ login: user, synced: false });

    await sync(user, [adminsDn, editorsName]);

    const result = await sync(user, [editorsName]);
    expect(result).toEqual({ added: [], removed: [admins.name] });
    expect(await su.members(admins.idGroup)).not.toContain(user);
    expect(await su.members(editors.idGroup)).toContain(user);

    // no external groups at all: only the manual membership is left
    expect(await sync(user, [])).toEqual({ added: [], removed: [editors.name] });
    expect(await su.members(manual.idGroup)).toContain(user);
    expect(await su.members(editors.idGroup)).not.toContain(user);
  });

  test('a manual membership is not turned into a synced one and survives losing the external group', async () => {
    const user = await su.createUser('sync_manual_first');
    await su.addMembers(editors.idGroup, [user]);

    expect(await sync(user, [editorsName])).toEqual({ added: [], removed: [] });
    expect(await membersWithFlag(editors.idGroup)).toContainEqual({ login: user, synced: false });
    expect(await sync(user, [])).toEqual({ added: [], removed: [] });
    expect(await su.members(editors.idGroup)).toContain(user);
  });

  test('adding a synced member manually keeps the membership when the external group is lost', async () => {
    const user = await su.createUser('sync_pinned');
    await sync(user, [editorsName]);
    expect(await membersWithFlag(editors.idGroup)).toContainEqual({ login: user, synced: true });

    await su.call('GroupPermissions.addUserToGroup', { idGroup: editors.idGroup, login: user });
    expect(await membersWithFlag(editors.idGroup)).toContainEqual({ login: user, synced: false });
    // a manual member cannot be added twice
    expect(await su.expectError('GroupPermissions.addUserToGroup', { idGroup: editors.idGroup, login: user }))
      .toContain('already in group');

    expect(await sync(user, [])).toEqual({ added: [], removed: [] });
    expect(await su.members(editors.idGroup)).toContain(user);
  });

  test('external groups can be passed one per line', async () => {
    const user = await su.createUser('sync_lines');
    const result = await su.call('GroupPermissions.syncUserGroups', {
      userLogin: user,
      externalGroups: `${adminsDn}\n${editorsName}`,
    });
    expect(result.added.sort()).toEqual([admins.name, editors.name].sort());
  });

  test('deleting a group removes its mappings; removing a mapping drops synced members on their next sync', async () => {
    const group = await su.createGroup('Sync Temp');
    const external = `temp-${RUN_ID}`;
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup: external });
    const user = await su.createUser('sync_temp');
    await sync(user, [external]);
    expect(await su.members(group.idGroup)).toEqual([user]);

    await su.call('GroupPermissions.removeExternalGroupMapping', { idGroup: group.idGroup, externalGroup: external });
    expect(await su.members(group.idGroup)).toEqual([user]);
    expect(await sync(user, [external])).toEqual({ added: [], removed: [group.name] });

    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup: external });
    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });
    expect(await sync(user, [external])).toEqual({ added: [], removed: [] });
  });

  test('sync rejects unknown users and the anonymous user', async () => {
    expect(await su.expectError('GroupPermissions.syncUserGroups', {
      userLogin: `nobody_${RUN_ID}`, externalGroups: [editorsName],
    })).toMatch(/doesn't exist|does not exist/);
    expect(await su.expectError('GroupPermissions.syncUserGroups', {
      userLogin: 'anonymous', externalGroups: [editorsName],
    })).toContain('anonymous');
  });

  test('only super users can manage mappings and sync users', async () => {
    const adminUser = await su.createUser('sync_admin');
    await su.setUserAccess(adminUser, 'admin', idSite);
    const adminApi = await MatomoApi.forUser(adminUser, DEFAULT_PASSWORD);

    const calls: Array<[string, Record<string, string | number | string[]>]> = [
      ['GroupPermissions.getExternalGroupMappings', { idGroup: admins.idGroup }],
      ['GroupPermissions.addExternalGroupMapping', { idGroup: admins.idGroup, externalGroup: 'x' }],
      ['GroupPermissions.removeExternalGroupMapping', { idGroup: admins.idGroup, externalGroup: adminsDn }],
      // an admin must not be able to make themselves a member of a group with more access
      ['GroupPermissions.syncUserGroups', { userLogin: adminUser, externalGroups: [adminsDn] }],
    ];
    for (const [method, params] of calls) {
      expect(await adminApi.expectError(method, params)).toMatch(/super ?user/i);
    }
    expect(await mappings(admins.idGroup)).toEqual([adminsDn]);
    expect(await su.members(admins.idGroup)).not.toContain(adminUser);
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('external groups can be mapped and removed in the group editor, synced members are marked', async ({ page }) => {
      const group = await su.createGroup('Sync UI');
      const external = `CN=Sync UI ${RUN_ID},OU=Groups,DC=example,DC=com`;

      await openGroupEditor(page, group.idGroup, 'members');
      await switchEditorTab(page, 'sync');
      await expect(page.locator('.groupPermissionsExternalGroupsTable .groupPermissionsEmpty')).toBeVisible();

      const form = page.locator('.groupPermissionsAddExternalGroup');
      const addButton = saveButton(form, 'groupPermissionsAddExternalGroupButton');
      await expect(addButton).toBeDisabled();
      await fillField(form.locator('input[name=groupPermissionsExternalGroup]'), external);
      await addButton.click();
      await waitForIdle(page);
      await expect(toast(page, `Users in the external group '${external}' now become members of the group '${group.name}'`)).toBeVisible();
      await expect(page.locator('tr.groupPermissionsExternalGroupRow td.externalGroup')).toHaveText([external]);
      expect(await mappings(group.idGroup)).toEqual([external]);
      // a DN gets no warning
      await expect(page.locator('.groupPermissionsPlainNameWarning')).toHaveCount(0);
      await screenshot(page.locator('.groupPermissionsEditGroup'), 'group-editor-directory-sync');

      // the URL keeps the section
      await page.reload();
      await expect(page.locator('.groupPermissionsEditGroup .listCircle li[data-tab="sync"]')).toHaveClass(/active/);
      await waitForIdle(page);

      // a synced member is marked in the member list, a manual one is not
      const syncedUser = await su.createUser('sync_ui_synced');
      const manualUser = await su.createUser('sync_ui_manual');
      await sync(syncedUser, [`sync ui ${RUN_ID}`]);
      await su.addMembers(group.idGroup, [manualUser]);
      await switchEditorTab(page, 'members');
      await expect(memberRow(page, syncedUser).locator('.groupPermissionsSyncedBadge')).toHaveText('synced');
      await expect(memberRow(page, manualUser)).toBeVisible();
      await expect(memberRow(page, manualUser).locator('.groupPermissionsSyncedBadge')).toHaveCount(0);
      await screenshot(page.locator('.groupPermissionsEditGroup'), 'group-editor-synced-members');

      await switchEditorTab(page, 'sync');
      await page.locator('tr.groupPermissionsExternalGroupRow .groupPermissionsRemoveExternalGroup').click();
      await clickModalButton(page, 'Yes');
      await waitForIdle(page);
      await expect(toast(page, `is no longer mapped to the group '${group.name}'`)).toBeVisible();
      await expect(page.locator('.groupPermissionsExternalGroupsTable .groupPermissionsEmpty')).toBeVisible();
      expect(await mappings(group.idGroup)).toEqual([]);
    });

    test('mappings of plain names show a warning that they match LDAP groups with that name anywhere', async ({ page }) => {
      const group = await su.createGroup('Sync UI plain');
      const plain = `Plain ${RUN_ID}`;
      await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup: `CN=Dn ${RUN_ID},DC=example` });
      await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup: plain });

      await openGroupEditor(page, group.idGroup, 'sync');
      await waitForIdle(page);
      const warning = page.locator('.groupPermissionsPlainNameWarning');
      await expect(warning).toContainText(`${plain}: names without a distinguished name also match every LDAP group`);
      await expect(warning).not.toContainText(`CN=Dn ${RUN_ID}`);

      await su.call('GroupPermissions.removeExternalGroupMapping', { idGroup: group.idGroup, externalGroup: plain });
      await page.reload();
      await waitForIdle(page);
      await expect(page.locator('tr.groupPermissionsExternalGroupRow')).toHaveCount(1);
      await expect(warning).toHaveCount(0);
    });
  });
});
