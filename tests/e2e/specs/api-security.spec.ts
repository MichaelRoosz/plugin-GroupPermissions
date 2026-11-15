import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD } from '../helpers/env';

/**
 * GroupPermissions.getAllGroups / getGroupWithId require admin access,
 * setGroupAccess checks admin access up front.
 */
test.describe('API access checks', () => {
  let su: MatomoApi;
  let viewUser: MatomoApi;
  let adminUser: MatomoApi;
  let group: { idGroup: number; name: string };
  let idSite: number;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    idSite = await su.createSite('Security');
    group = await su.createGroup('Security');

    const viewLogin = await su.createUser('viewer');
    await su.setUserAccess(viewLogin, 'view', idSite);
    viewUser = await MatomoApi.forUser(viewLogin, DEFAULT_PASSWORD);

    const adminLogin = await su.createUser('siteadmin');
    await su.setUserAccess(adminLogin, 'admin', idSite);
    adminUser = await MatomoApi.forUser(adminLogin, DEFAULT_PASSWORD);
  });

  test('anonymous user cannot read groups', async () => {
    await expect(MatomoApi.raw('GroupPermissions.getAllGroups')).rejects.toThrow(/'?admin'? access/);
    await expect(MatomoApi.raw('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).rejects.toThrow(/'?admin'? access/);
  });

  test('user with view access cannot read groups', async () => {
    expect(await viewUser.expectError('GroupPermissions.getAllGroups')).toMatch(/'?admin'? access/);
    expect(await viewUser.expectError('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).toMatch(/'?admin'? access/);
    expect(await viewUser.expectError('GroupPermissions.getMembersOfGroup', { idGroup: group.idGroup })).toMatch(/super ?user/i);
    expect(await viewUser.expectError('GroupPermissions.getGroupsOverview')).toMatch(/super ?user/i);
    expect(await viewUser.expectError('GroupPermissions.getSitesAccessFromGroup', { idGroup: group.idGroup })).toMatch(/super ?user/i);
  });

  test('user with view access cannot change group access, even for a site he can view', async () => {
    const message = await viewUser.expectError('GroupPermissions.setGroupAccess', {
      name: group.name,
      access: 'view',
      idSites: String(idSite),
    });
    expect(message).toMatch(/'?admin'? access/);
    expect(await su.call('GroupPermissions.getGroupAccessFromSite', { idSite })).toMatchObject({ [group.name]: 'noaccess' });
  });

  test('access check happens before the group name is validated (no group name enumeration)', async () => {
    const message = await viewUser.expectError('GroupPermissions.setGroupAccess', {
      name: 'this group does not exist',
      access: 'view',
      idSites: String(idSite),
    });
    expect(message).toMatch(/'?admin'? access/);
    expect(message).not.toMatch(/Group does not exist/);
  });

  test('site admin can read groups and set access for his site only', async () => {
    const groups = await adminUser.call('GroupPermissions.getAllGroups', { filter_limit: -1 });
    expect(groups).toEqual(expect.arrayContaining([{ idGroup: group.idGroup, name: group.name }]));
    expect(await adminUser.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup }))
      .toEqual({ idGroup: group.idGroup, name: group.name });

    await adminUser.call('GroupPermissions.setGroupAccess', { name: group.name, access: 'write', idSites: String(idSite) });
    expect(await su.call('GroupPermissions.getGroupAccessFromSite', { idSite })).toMatchObject({ [group.name]: 'write' });

    // site 1 is not administered by this user
    expect(await adminUser.expectError('GroupPermissions.setGroupAccess', { name: group.name, access: 'view', idSites: '1' }))
      .toMatch(/'?admin'? access/);
  });

  test('getGroupAccessFromSite requires admin access on that website', async () => {
    await expect(MatomoApi.raw('GroupPermissions.getGroupAccessFromSite', { idSite })).rejects.toThrow(/'?admin'? access/);
    expect(await viewUser.expectError('GroupPermissions.getGroupAccessFromSite', { idSite })).toMatch(/'?admin'? access/);
    expect(await adminUser.expectError('GroupPermissions.getGroupAccessFromSite', { idSite: 1 })).toMatch(/'?admin'? access/);
    expect(await adminUser.call('GroupPermissions.getGroupAccessFromSite', { idSite })).toHaveProperty([group.name]);
  });

  test('"all" websites for a site admin only means the websites he administers', async () => {
    const allGroup = await su.createGroup('Admin all');
    await adminUser.call('GroupPermissions.setGroupAccess', { name: allGroup.name, access: 'view', idSites: 'all' });
    expect((await su.groupAccess(idSite))[allGroup.name]).toBe('view');
    expect((await su.groupAccess(1))[allGroup.name]).toBe('noaccess');
  });

  test('a site admin cannot grant access to a website list containing a foreign website', async () => {
    const listGroup = await su.createGroup('Admin list');
    expect(await adminUser.expectError('GroupPermissions.setGroupAccess', { name: listGroup.name, access: 'view', idSites: `${idSite},1` }))
      .toMatch(/'?admin'? access/);
    // nothing was stored, not even for the administered website
    expect((await su.groupAccess(idSite))[listGroup.name]).toBe('noaccess');
  });

  test('view users cannot copy dashboards or manage groups', async () => {
    for (const [method, params] of [
      ['GroupPermissions.copyDashboardToGroup', { idDashboard: 1, idGroup: group.idGroup }],
      ['GroupPermissions.shareSegmentWithGroup', { idSegment: 1, idGroup: group.idGroup }],
      ['GroupPermissions.unshareSegmentFromGroup', { idSegment: 1, idGroup: group.idGroup }],
      ['GroupPermissions.getGroupsOfSegment', { idSegment: 1 }],
      ['GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login: viewUser.login }],
      ['GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login: viewUser.login }],
      ['GroupPermissions.renameGroup', { idGroup: group.idGroup, newName: 'x' }],
      ['GroupPermissions.deleteGroup', { idGroup: group.idGroup }],
    ] as const) {
      expect(await viewUser.expectError(method, params), method).toMatch(/access/);
    }
    expect(await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).toEqual(group);
  });

  test('the anonymous user cannot be added to a group (groups could grant admin access to every visitor)', async () => {
    const anonGroup = await su.createGroup('Anonymous');
    await su.setGroupAccess(anonGroup.name, 'admin', idSite);
    expect(await su.expectError('GroupPermissions.addUserToGroup', { idGroup: anonGroup.idGroup, login: 'anonymous' }))
      .toMatch(/anonymous user cannot be added to a group/);
    expect(await su.members(anonGroup.idGroup)).toEqual([]);
    expect((await MatomoApi.raw('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).not.toContain(idSite);
  });

  test('super user only methods are rejected for site admins', async () => {
    expect(await adminUser.expectError('GroupPermissions.createGroup', { groupName: 'nope' })).toMatch(/super ?user/i);
    for (const [method, params] of [
      ['GroupPermissions.getMembersOfGroup', { idGroup: group.idGroup }],
      ['GroupPermissions.getGroupsOverview', {}],
      ['GroupPermissions.getSitesAccessFromGroup', { idGroup: group.idGroup }],
      ['GroupPermissions.getSegmentsForGroup', { idGroup: group.idGroup }],
      ['GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login: adminUser.login }],
      ['GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login: adminUser.login }],
      ['GroupPermissions.renameGroup', { idGroup: group.idGroup, newName: 'nope' }],
      ['GroupPermissions.deleteGroup', { idGroup: group.idGroup }],
    ] as const) {
      expect(await adminUser.expectError(method, params), method).toMatch(/super ?user/i);
    }
    expect(await adminUser.expectError('GroupPermissions.inviteUserToGroups', {
      userLogin: 'nope', email: 'nope@example.org', idGroups: String(group.idGroup),
    })).toMatch(/super ?user/i);
  });
});
