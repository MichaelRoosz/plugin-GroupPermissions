import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, RUN_ID } from '../helpers/env';

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

  test('concurrent createGroup requests with the same name create only one group', async () => {
    const name = `Concurrent ${RUN_ID}`;
    const results = await Promise.allSettled(
      Array.from({ length: 6 }, () => su.call('GroupPermissions.createGroup', { groupName: name })),
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const groups: { name: string }[] = await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 });
    expect(groups.filter((g) => g.name === name)).toHaveLength(1);
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

  test('names longer than the name column are rejected instead of being truncated', async () => {
    const fits = `${'x'.repeat(64 - RUN_ID.length - 1)} ${RUN_ID}`;
    expect(fits).toHaveLength(64);
    const created = await su.call('GroupPermissions.createGroup', { groupName: fits });
    expect((await su.call('GroupPermissions.getGroupWithId', { idGroup: created.idGroup })).name).toBe(fits);

    const tooLong = `${fits}y`;
    expect(await su.expectError('GroupPermissions.createGroup', { groupName: tooLong })).toMatch(/group name is too long \(at most 64 characters/);
    expect(await su.groupByName(tooLong.slice(0, 64))).toEqual(created); // no truncated duplicate
    expect(await su.expectError('GroupPermissions.renameGroup', { idGroup: created.idGroup, newName: tooLong })).toMatch(/too long/);

    // escaped special characters count with their escaped length: 13 quotes are stored as 78 characters
    expect(await su.expectError('GroupPermissions.createGroup', { groupName: '"'.repeat(13) })).toMatch(/too long/);
  });

  test('getGroupsOverview returns all groups sorted by name with member and website counts', async () => {
    const busy = await su.createGroup('Overview busy');
    const idle = await su.createGroup('overview idle');
    await su.addMembers(busy.idGroup, [await su.createUser('overview_a'), await su.createUser('overview_b')]);
    await su.setGroupAccess(busy.name, 'view', `1,${await su.createSite('Overview Site')}`);

    const overview: Array<{ idGroup: number; name: string; memberCount: number; siteCount: number }> =
      await su.call('GroupPermissions.getGroupsOverview', { filter_limit: -1 });
    expect(overview.find((g) => g.idGroup === busy.idGroup)).toEqual({ idGroup: busy.idGroup, name: busy.name, memberCount: 2, siteCount: 2 });
    expect(overview.find((g) => g.idGroup === idle.idGroup)).toEqual({ idGroup: idle.idGroup, name: idle.name, memberCount: 0, siteCount: 0 });

    const names = overview.map((g) => g.name);
    expect(names).toEqual([...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
    expect(overview).toHaveLength((await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).length);
  });

  test('getSitesAccessFromGroup returns the websites of a group sorted by name', async () => {
    const group = await su.createGroup('Sites of group');
    const zeta = await su.createSite('Zeta Group Site');
    const alpha = await su.createSite('Alpha Group Site');
    await su.setGroupAccess(group.name, 'admin', zeta);
    await su.setGroupAccess(group.name, 'view', alpha);
    const name = async (idSite: number) => (await su.call('SitesManager.getSiteFromId', { idSite })).name;

    expect(await su.call('GroupPermissions.getSitesAccessFromGroup', { idGroup: group.idGroup })).toEqual([
      { idSite: alpha, name: await name(alpha), access: 'view', capabilities: [] },
      { idSite: zeta, name: await name(zeta), access: 'admin', capabilities: [] },
    ]);
    expect(await su.call('GroupPermissions.getSitesAccessFromGroup', { idGroup: (await su.createGroup('No sites')).idGroup })).toEqual([]);
    expect(await su.expectError('GroupPermissions.getSitesAccessFromGroup', { idGroup: 999999 })).toMatch(/Group does not exist/);
  });

  test('getGroupWithId rejects unknown groups', async () => {
    expect(await su.expectError('GroupPermissions.getGroupWithId', { idGroup: 999999 })).toMatch(/Group does not exist/);
    expect(await su.expectError('GroupPermissions.getMembersOfGroup', { idGroup: 999999 })).toMatch(/Group does not exist/);
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

  test('names are trimmed and must not be empty', async () => {
    // Matomo itself already rejects empty (and blank) parameters
    for (const groupName of ['', '   ']) {
      expect(await su.expectError('GroupPermissions.createGroup', { groupName })).toMatch(/Please (enter a group name|specify a value)/);
    }

    const name = `Trimmed ${RUN_ID}`;
    const group = await su.call('GroupPermissions.createGroup', { groupName: `  ${name}  ` });
    expect(group.name).toBe(name);
    expect(await su.expectError('GroupPermissions.createGroup', { groupName: ` ${name}` })).toMatch(/Group already exists/);

    expect(await su.expectError('GroupPermissions.renameGroup', { idGroup: group.idGroup, newName: ' ' })).toMatch(/Please (enter a group name|specify a value)/);
    await su.call('GroupPermissions.renameGroup', { idGroup: group.idGroup, newName: ` ${name} 2 ` });
    expect((await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).name).toBe(`${name} 2`);
  });

  test('renameGroup can change only the case of the name', async () => {
    const group = await su.createGroup('case rename');
    const upper = group.name.toUpperCase();

    await su.call('GroupPermissions.renameGroup', { idGroup: group.idGroup, newName: upper });
    expect((await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).name).toBe(upper);
    // renaming to its own name is no error either
    await su.call('GroupPermissions.renameGroup', { idGroup: group.idGroup, newName: upper });
  });

  test('setGroupAccessById sets the role of a group by its ID', async () => {
    const group = await su.createGroup('By id');
    const idSite = await su.createSite('By Id Site');
    const role = async () => (await su.call('GroupPermissions.getSitesAccessFromGroup', { idGroup: group.idGroup }))
      .find((s: { idSite: number }) => s.idSite === idSite)?.access;

    await su.call('GroupPermissions.setGroupAccessById', { idGroup: group.idGroup, access: 'write', idSites: String(idSite) });
    expect(await role()).toBe('write');
    await su.call('GroupPermissions.setGroupAccessById', { idGroup: group.idGroup, access: 'noaccess', idSites: String(idSite) });
    expect(await role()).toBeUndefined();

    expect(await su.expectError('GroupPermissions.setGroupAccessById', { idGroup: 999999, access: 'view', idSites: String(idSite) }))
      .toMatch(/Group does not exist/);
    expect(await su.expectError('GroupPermissions.setGroupAccessById', { idGroup: group.idGroup, access: 'owner', idSites: String(idSite) }))
      .toMatch(/owner/);

    // like setGroupAccess, only for websites the user administers
    const viewer = await su.createUser('by_id_viewer');
    await su.setUserAccess(viewer, 'view', idSite);
    const viewerApi = await MatomoApi.forUser(viewer, 'secretPass1!');
    expect(await viewerApi.expectError('GroupPermissions.setGroupAccessById', {
      idGroup: group.idGroup, access: 'admin', idSites: String(idSite),
    })).toMatch(/admin/i);
    expect(await role()).toBeUndefined();
  });

  test('group names are compared case-insensitively, but not accent-insensitively', async () => {
    const plain = await su.call('GroupPermissions.createGroup', { groupName: `Cafe ${RUN_ID}` });
    // the database collation may ignore accents, the plugin does not
    const accented = await su.call('GroupPermissions.createGroup', { groupName: `Café ${RUN_ID}` });
    expect(accented.idGroup).not.toBe(plain.idGroup);
    expect(await su.expectError('GroupPermissions.createGroup', { groupName: `CAFÉ ${RUN_ID}` })).toMatch(/Group already exists/);
    expect(await su.expectError('GroupPermissions.renameGroup', { idGroup: plain.idGroup, newName: `café ${RUN_ID}` }))
      .toMatch(/Group already exists/);

    const idSite = await su.createSite('Accent Site');
    await su.setGroupAccess(`CAFÉ ${RUN_ID}`, 'view', idSite);
    const access = await su.call('GroupPermissions.getGroupPermissionsFromSite', { idSite });
    expect(access.find((g: { idGroup: number }) => g.idGroup === accented.idGroup).access).toBe('view');
    expect(access.find((g: { idGroup: number }) => g.idGroup === plain.idGroup).access).toBe('noaccess');
  });

  test('concurrent addUserToGroup requests for the same user add one membership without a database error', async () => {
    const group = await su.createGroup('Concurrent members');
    const login = await su.createUser('concurrent_member');
    const results = await Promise.allSettled(
      Array.from({ length: 6 }, () => su.call('GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login })),
    );
    for (const result of results) {
      if (result.status === 'rejected') expect(String(result.reason)).toMatch(/User is already in group/);
    }
    expect(results.some((r) => r.status === 'fulfilled')).toBe(true);
    expect(await su.members(group.idGroup)).toEqual([login]);
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
    expect(await su.expectError('GroupPermissions.getMembersOfGroup', { idGroup: group.idGroup })).toMatch(/Group does not exist/);
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
    expect(await su.expectError('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login: alice }))
      .toMatch(/is not in the group/);
  });

  test('members are stored with the login of the user, whatever spelling is used', async () => {
    const group = await su.createGroup('Member Spelling');
    const [alice, bob] = [await su.createUser('spelling_alice'), await su.createUser('spelling_bob')];

    await su.call('GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login: alice.toUpperCase() });
    expect(await su.members(group.idGroup)).toEqual([alice]);
    expect(await su.expectError('GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login: alice }))
      .toMatch(/User is already in group/);
    expect(await su.expectError('GroupPermissions.addUserToGroup', { idGroup: group.idGroup, login: 'ANONYMOUS' }))
      .toMatch(/anonymous/i);

    const synced = await su.call('GroupPermissions.syncUserGroups', { userLogin: bob.toUpperCase(), externalGroups: [] });
    expect(synced).toEqual({ added: [], removed: [] });

    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login: alice.toUpperCase() });
    expect(await su.members(group.idGroup)).toEqual([]);
  });

  test('deleting a user with another spelling of the login removes only their memberships', async () => {
    const group = await su.createGroup('Delete spelling');
    const gone = await su.createUser('delete_spelling_gone');
    const kept = await su.createUser('delete_spelling_kept');
    await su.addMembers(group.idGroup, [gone, kept]);
    await su.setGroupAccess(group.name, 'admin', 1);

    const idSegment = Number((await su.call('SegmentEditor.add', {
      name: `Spelling ${RUN_ID}`, definition: `pageUrl=@delete-spelling-${RUN_ID}`, idSite: 1,
    })).value);
    await su.call('GroupPermissions.shareSegmentWithGroup', { idSegment, idGroup: group.idGroup });

    await su.deleteUser(gone.toUpperCase());

    expect(await su.members(group.idGroup)).toEqual([kept]);
    // a new user with the login does not inherit anything
    await su.call('UsersManager.addUser', {
      userLogin: gone, password: DEFAULT_PASSWORD, email: `${gone}_new@example.org`, initialIdSite: 1,
    });
    expect(await su.members(group.idGroup)).toEqual([kept]);
    // shares made by other users are kept
    const shared: Array<{ idGroup: number }> = await su.call('GroupPermissions.getGroupsOfSegment', { idSegment });
    expect(shared.map((g) => g.idGroup)).toEqual([group.idGroup]);
    await su.deleteUser(gone);
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
