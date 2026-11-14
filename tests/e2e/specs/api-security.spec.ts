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

  test('super user only methods are rejected for site admins', async () => {
    expect(await adminUser.expectError('GroupPermissions.createGroup', { groupName: 'nope' })).toMatch(/super ?user/i);
    expect(await adminUser.expectError('GroupPermissions.inviteUserToGroups', {
      userLogin: 'nope', email: 'nope@example.org', idGroups: String(group.idGroup),
    })).toMatch(/super ?user/i);
  });
});
