import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD } from '../helpers/env';

/**
 * Site access of groups (setGroupAccess / getGroupAccessFromSite) and how group permissions are combined
 * with the users' own permissions by the Access override.
 */
test.describe('Group site access', () => {
  let su: MatomoApi;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  test('setGroupAccess sets, changes and removes access', async () => {
    const group = await su.createGroup('Access set');
    const idSite = await su.createSite('Access Set Site');
    expect((await su.groupAccess(idSite))[group.name]).toBe('noaccess');

    for (const access of ['view', 'write', 'admin', 'noaccess']) {
      await su.setGroupAccess(group.name, access, idSite);
      expect((await su.groupAccess(idSite))[group.name]).toBe(access);
    }
  });

  test('setGroupAccess accepts a list of sites and "all"', async () => {
    const group = await su.createGroup('Access multi');
    const s1 = await su.createSite('Access Multi One');
    const s2 = await su.createSite('Access Multi Two');

    await su.setGroupAccess(group.name, 'view', `${s1},${s2}`);
    expect((await su.groupAccess(s1))[group.name]).toBe('view');
    expect((await su.groupAccess(s2))[group.name]).toBe('view');

    await su.setGroupAccess(group.name, 'write', 'all');
    const allSites: number[] = (await su.call('SitesManager.getAllSitesId')).map(Number);
    for (const idSite of [1, s1, s2, allSites[allSites.length - 1]]) {
      expect((await su.groupAccess(idSite))[group.name]).toBe('write');
    }
  });

  test('setGroupAccess validates its input', async () => {
    const group = await su.createGroup('Access invalid');
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: group.name, access: 'superuser', idSites: '1' }))
      .toMatch(/must have one of the following values: \[ view, write, admin \], 'superuser' given/);
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: `unknown ${Date.now()}`, access: 'view', idSites: '1' }))
      .toMatch(/Group does not exist/);
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: group.name, access: 'view', idSites: '999999' }))
      .toMatch(/unexpected website was found in the request: website id was set to '999999'/);
  });

  test('group members get the access of their groups', async () => {
    const viewGroup = await su.createGroup('Eff view');
    const writeGroup = await su.createGroup('Eff write');
    const adminGroup = await su.createGroup('Eff admin');
    const siteView = await su.createSite('Eff View Site');
    const siteWrite = await su.createSite('Eff Write Site');
    const siteAdmin = await su.createSite('Eff Admin Site');
    await su.setGroupAccess(viewGroup.name, 'view', siteView);
    await su.setGroupAccess(writeGroup.name, 'write', siteWrite);
    await su.setGroupAccess(adminGroup.name, 'admin', siteAdmin);

    const login = await su.createUser('eff_member');
    await su.addMembers(viewGroup.idGroup, [login]);
    await su.addMembers(writeGroup.idGroup, [login]);
    await su.addMembers(adminGroup.idGroup, [login]);
    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);

    const viewable = (await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number).sort();
    expect(viewable).toEqual([siteView, siteWrite, siteAdmin].sort());
    expect((await member.call('SitesManager.getSitesIdWithAdminAccess')).map(Number)).toEqual([siteAdmin]);

    // write access: goals can be managed with write access, not with view access
    await member.call('Goals.addGoal', { idSite: siteWrite, name: 'Goal', matchAttribute: 'url', pattern: 'x', patternType: 'contains' });
    expect(await member.expectError('Goals.addGoal', { idSite: siteView, name: 'Goal', matchAttribute: 'url', pattern: 'x', patternType: 'contains' }))
      .toMatch(/write/);
  });

  test('the highest of user and group permissions wins', async () => {
    const group = await su.createGroup('Highest');
    const siteGroupHigher = await su.createSite('Group Higher Site');
    const siteUserHigher = await su.createSite('User Higher Site');
    await su.setGroupAccess(group.name, 'admin', siteGroupHigher);
    await su.setGroupAccess(group.name, 'view', siteUserHigher);

    const login = await su.createUser('highest_member');
    await su.setUserAccess(login, 'view', siteGroupHigher);
    await su.setUserAccess(login, 'admin', siteUserHigher);
    await su.addMembers(group.idGroup, [login]);

    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    const admin = (await member.call('SitesManager.getSitesIdWithAdminAccess')).map(Number).sort();
    expect(admin).toEqual([siteGroupHigher, siteUserHigher].sort());
  });

  test('removing a user from a group removes the access granted by it', async () => {
    const group = await su.createGroup('Remove access');
    const idSite = await su.createSite('Remove Access Site');
    await su.setGroupAccess(group.name, 'view', idSite);
    const login = await su.createUser('remove_access');
    await su.addMembers(group.idGroup, [login]);

    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    expect((await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).toEqual([idSite]);

    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login });
    expect((await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).toEqual([]);
  });

  test('deleting a website removes its group permissions', async () => {
    const group = await su.createGroup('Site delete');
    const idSite = await su.createSite('Deleted Site');
    await su.setGroupAccess(group.name, 'admin', idSite);
    const login = await su.createUser('site_delete');
    await su.addMembers(group.idGroup, [login]);

    await su.deleteSite(idSite);

    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    expect((await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).not.toContain(idSite);
    // a new site must not inherit the permissions of the deleted one
    const newSite = await su.createSite('After Delete Site');
    expect((await su.groupAccess(newSite))[group.name]).toBe('noaccess');
  });

  test('deleting a user removes him from all groups', async () => {
    const g1 = await su.createGroup('User delete 1');
    const g2 = await su.createGroup('User delete 2');
    const login = await su.createUser('user_delete');
    await su.addMembers(g1.idGroup, [login]);
    await su.addMembers(g2.idGroup, [login]);

    await su.deleteUser(login);

    expect(await su.members(g1.idGroup)).toEqual([]);
    expect(await su.members(g2.idGroup)).toEqual([]);
  });
});
