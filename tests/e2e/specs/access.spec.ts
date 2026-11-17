import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, RUN_ID } from '../helpers/env';

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
    const allSites: number[] = (await su.call('SitesManager.getAllSitesId', { filter_limit: -1 })).map(Number);
    for (const idSite of [1, s1, s2, allSites[allSites.length - 1]]) {
      expect((await su.groupAccess(idSite))[group.name]).toBe('write');
    }
  });

  test('getGroupAccessFromSite rejects unknown websites', async () => {
    expect(await su.expectError('GroupPermissions.getGroupAccessFromSite', { idSite: 999999 })).toMatch(/website id was set to '999999'/);
  });

  test('setGroupAccess validates its input', async () => {
    const group = await su.createGroup('Access invalid');
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: group.name, access: 'superuser', idSites: '1' }))
      .toMatch(/must have one of the following values: \[ view, write, admin \], 'superuser' given/);
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: `unknown ${Date.now()}`, access: 'view', idSites: '1' }))
      .toMatch(/Group does not exist/);
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: group.name, access: 'view', idSites: '999999' }))
      .toMatch(/unexpected website was found in the request: website id was set to '999999'/);
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: group.name, access: 'view', idSites: 'abc' }))
      .toMatch(/./);
    expect(await su.expectError('GroupPermissions.setGroupAccess', { name: group.name, access: 'view', idSites: '' }))
      .toMatch(/idSites/);
    // nothing was stored by the failed calls
    expect((await su.groupAccess(1))[group.name]).toBe('noaccess');
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

  test('two groups with different access on the same website: the higher one wins', async () => {
    const idSite = await su.createSite('Two Groups Site');
    const viewGroup = await su.createGroup('Same site view');
    const adminGroup = await su.createGroup('Same site admin');
    await su.setGroupAccess(viewGroup.name, 'view', idSite);
    await su.setGroupAccess(adminGroup.name, 'admin', idSite);
    const login = await su.createUser('two_groups');
    await su.addMembers(viewGroup.idGroup, [login]);
    await su.addMembers(adminGroup.idGroup, [login]);

    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    expect((await member.call('SitesManager.getSitesIdWithAdminAccess')).map(Number)).toEqual([idSite]);

    // removing the admin group falls back to the view access of the other group
    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: adminGroup.idGroup, login });
    expect((await member.call('SitesManager.getSitesIdWithAdminAccess')).map(Number)).toEqual([]);
    expect((await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).toEqual([idSite]);
  });

  test('write access of a group upgrades the view access of the user (and vice versa)', async () => {
    const goal = { name: 'Goal', matchAttribute: 'url', pattern: 'x', patternType: 'contains' };
    const group = await su.createGroup('Write upgrade');
    const groupWriteSite = await su.createSite('Group Write Site');
    const userWriteSite = await su.createSite('User Write Site');
    await su.setGroupAccess(group.name, 'write', groupWriteSite);
    await su.setGroupAccess(group.name, 'view', userWriteSite);

    const login = await su.createUser('write_upgrade');
    await su.setUserAccess(login, 'view', groupWriteSite);
    await su.setUserAccess(login, 'write', userWriteSite);
    await su.addMembers(group.idGroup, [login]);
    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);

    await member.call('Goals.addGoal', { idSite: groupWriteSite, ...goal });
    await member.call('Goals.addGoal', { idSite: userWriteSite, ...goal });
    expect((await member.call('SitesManager.getSitesIdWithAdminAccess')).map(Number)).toEqual([]);
  });

  test('a group without members or permissions changes nothing', async () => {
    const login = await su.createUser('no_group');
    await su.setUserAccess(login, 'view', 1);
    await su.createGroup('Unrelated');
    const user = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    expect((await user.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).toEqual([1]);
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

  test('SitesManager.getSitesIdFromSiteUrl also finds websites the user can access through a group', async () => {
    const url = `https://url-lookup-${RUN_ID}.example.org`;
    const addSite = async (name: string) =>
      Number((await su.call('SitesManager.addSite', { siteName: `${name} ${RUN_ID}`, urls: url })).value);
    const viaGroup = await addSite('Lookup via group');
    const direct = await addSite('Lookup direct');
    const noAccess = await addSite('Lookup no access');

    const login = await su.createUser('url_lookup');
    const group = await su.createGroup('URL lookup');
    await su.addMembers(group.idGroup, [login]);
    await su.setGroupAccess(group.name, 'view', viaGroup);
    await su.setUserAccess(login, 'view', direct);

    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    const ids = async (api: MatomoApi, lookup: string) =>
      ((await api.call('SitesManager.getSitesIdFromSiteUrl', { url: lookup })) as Array<{ idsite: string | number }>)
        .map((row) => Number(row.idsite))
        .sort((a, b) => a - b);

    expect(await ids(member, url)).toEqual([viaGroup, direct]);
    expect(await ids(member, `${url}/`)).toEqual([viaGroup, direct]); // normalized like in core
    expect(await ids(member, 'https://no-such-site.example.org')).toEqual([]);
    expect(await ids(su, url)).toEqual([viaGroup, direct, noAccess]);

    // without the group, only the direct access remains
    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login });
    expect(await ids(member, url)).toEqual([direct]);
  });
});
