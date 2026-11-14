import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID } from '../helpers/env';

/**
 * Group management API: create, rename, delete groups and manage their members.
 */
test.describe('Group management API', () => {
  let su: MatomoApi;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  test('createGroup returns the new group and rejects duplicate names', async () => {
    const name = `Created ${RUN_ID}`;
    const group = await su.call('GroupPermissions.createGroup', { groupName: name });
    expect(group).toEqual({ idGroup: expect.any(Number), name });
    expect(await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).toEqual(group);

    expect(await su.expectError('GroupPermissions.createGroup', { groupName: name })).toMatch(/Group already exists/);
  });

  test('getAllGroups returns all groups, without the 100 rows limit', async () => {
    const prefix = `Many ${RUN_ID}`;
    const created: number[] = [];
    try {
      for (let i = 0; i < 105; i++) {
        created.push((await su.call('GroupPermissions.createGroup', { groupName: `${prefix} ${String(i).padStart(3, '0')}` })).idGroup);
      }
      const names: string[] = (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).map((g: any) => g.name);
      const ours = names.filter((n) => n.startsWith(prefix));
      expect(ours).toHaveLength(105);
    } finally {
      // keep the instance (and the screenshots of later specs) readable
      for (const idGroup of created) await su.call('GroupPermissions.deleteGroup', { idGroup });
    }
  });

  test('getGroupWithId rejects unknown groups', async () => {
    expect(await su.expectError('GroupPermissions.getGroupWithId', { idGroup: 999999 })).toMatch(/Group does not exist/);
  });

  test('renameGroup renames and rejects existing names and unknown groups', async () => {
    const a = await su.createGroup('Rename A');
    const b = await su.createGroup('Rename B');
    const newName = `Renamed ${RUN_ID}`;

    await su.call('GroupPermissions.renameGroup', { idGroup: a.idGroup, newName });
    expect(await su.call('GroupPermissions.getGroupWithId', { idGroup: a.idGroup })).toEqual({ idGroup: a.idGroup, name: newName });

    expect(await su.expectError('GroupPermissions.renameGroup', { idGroup: a.idGroup, newName: b.name })).toMatch(/Group already exists/);
    expect(await su.expectError('GroupPermissions.renameGroup', { idGroup: 999999, newName: `x ${RUN_ID}` })).toMatch(/Group does not exist/);
  });

  test('deleteGroup removes the group, its members and its permissions', async () => {
    const group = await su.createGroup('Delete me');
    const idSite = await su.createSite('Delete Group Site');
    const login = await su.createUser('delete_member');
    await su.addMembers(group.idGroup, [login]);
    await su.setGroupAccess(group.name, 'view', idSite);
    expect((await su.groupAccess(idSite))[group.name]).toBe('view');

    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });

    expect(await su.groupByName(group.name)).toBeUndefined();
    expect((await su.groupAccess(idSite))[group.name]).toBeUndefined();
    expect(await su.members(group.idGroup)).toEqual([]);
    // the user lost the access he had through the group
    const member = await MatomoApi.forUser(login, 'secretPass1!');
    expect((await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).not.toContain(idSite);

    expect(await su.expectError('GroupPermissions.deleteGroup', { idGroup: group.idGroup })).toMatch(/Group does not exist/);
  });

  test('a recreated group with the same name does not inherit old members or permissions', async () => {
    const group = await su.createGroup('Recreate');
    const idSite = await su.createSite('Recreate Site');
    await su.addMembers(group.idGroup, [await su.createUser('recreate_member')]);
    await su.setGroupAccess(group.name, 'admin', idSite);
    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });

    const recreated = await su.call('GroupPermissions.createGroup', { groupName: group.name });
    expect(await su.members(recreated.idGroup)).toEqual([]);
    expect((await su.groupAccess(idSite))[group.name]).toBe('noaccess');
  });

  test('addUserToGroup / removeUserFromGroup', async () => {
    const group = await su.createGroup('Members');
    const [alice, bob] = [await su.createUser('member_alice'), await su.createUser('member_bob')];

    await su.addMembers(group.idGroup, [bob, alice]);
    expect(await su.members(group.idGroup)).toEqual([alice, bob].sort());

    expect(await su.expectError('GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login: alice }))
      .toMatch(/User is already in group/);
    expect(await su.expectError('GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login: `nobody_${RUN_ID}` }))
      .toMatch(/doesn't exist/);
    expect(await su.expectError('GroupPermissions.addUserToGroup', { idGroup: 999999, login: alice }))
      .toMatch(/Group does not exist/);

    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login: alice });
    expect(await su.members(group.idGroup)).toEqual([bob]);

    expect(await su.expectError('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login: `nobody_${RUN_ID}` }))
      .toMatch(/doesn't exist/);
    expect(await su.expectError('GroupPermissions.removeUserFromGroup', { idGroup: 999999, login: bob }))
      .toMatch(/Group does not exist/);
  });

  test('getMembersOfGroup returns more than 100 members', async () => {
    const group = await su.createGroup('Big group');
    const logins: string[] = [];
    for (let i = 0; i < 102; i++) {
      logins.push(await su.createUser(`big_${String(i).padStart(3, '0')}`));
    }
    await su.addMembers(group.idGroup, logins);
    const members = await su.call('GroupPermissions.getMembersOfGroup', { idGroup: group.idGroup, filter_limit: -1 });
    expect(members).toHaveLength(102);
    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });
    for (const login of logins) await su.deleteUser(login);
  });

  test('a user can be member of multiple groups', async () => {
    const g1 = await su.createGroup('Multi 1');
    const g2 = await su.createGroup('Multi 2');
    const login = await su.createUser('multi_member');
    await su.addMembers(g1.idGroup, [login]);
    await su.addMembers(g2.idGroup, [login]);
    expect(await su.members(g1.idGroup)).toEqual([login]);
    expect(await su.members(g2.idGroup)).toEqual([login]);
  });
});
