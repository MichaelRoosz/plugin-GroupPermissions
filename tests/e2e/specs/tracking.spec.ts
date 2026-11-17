import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, MATOMO_URL } from '../helpers/env';

/**
 * Tracking requests that need a token_auth (custom timestamp older than 24 hours, custom IP, log imports): Matomo
 * accepts tokens of users with write or admin access to the website, including access granted by a group.
 */
test.describe('Authenticated tracking requests', () => {
  let su: MatomoApi;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  /** Tracks a visit two days in the past, which Matomo only accepts with a token_auth of a write/admin user. */
  async function trackInThePast(idSite: number, tokenAuth: string): Promise<number> {
    const params = new URLSearchParams({
      idsite: String(idSite),
      rec: '1',
      send_image: '0',
      url: 'https://tracking.example.org/',
      cdt: String(Math.floor(Date.now() / 1000) - 2 * 24 * 3600),
      token_auth: tokenAuth,
    });
    const response = await fetch(`${MATOMO_URL}/matomo.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // newer Matomo versions silently drop tracking requests of bots (e.g. Node's fetch)
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      },
      body: params,
    });
    return response.status;
  }

  test('members of groups with write or admin access can use their token_auth', async () => {
    const login = await su.createUser('tracker');
    const idSite = await su.createSite('Tracking Site');
    const group = await su.createGroup('Tracking');
    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);

    await su.setGroupAccess(group.name, 'write', idSite);
    expect(await trackInThePast(idSite, member.tokenAuth), 'not a member yet').toBe(400);

    await su.addMembers(group.idGroup, [login]);
    expect(await trackInThePast(idSite, member.tokenAuth), 'write through the group').toBe(204);

    await su.setGroupAccess(group.name, 'admin', idSite);
    expect(await trackInThePast(idSite, member.tokenAuth), 'admin through the group').toBe(204);

    await su.setGroupAccess(group.name, 'view', idSite);
    expect(await trackInThePast(idSite, member.tokenAuth), 'view is not enough').toBe(400);

    await su.setGroupAccess(group.name, 'write', idSite);
    expect(await trackInThePast(idSite, member.tokenAuth)).toBe(204);
    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: group.idGroup, login });
    expect(await trackInThePast(idSite, member.tokenAuth), 'removed from the group').toBe(400);

    await su.addMembers(group.idGroup, [login]);
    expect(await trackInThePast(idSite, member.tokenAuth)).toBe(204);
    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });
    expect(await trackInThePast(idSite, member.tokenAuth), 'group deleted').toBe(400);
  });

  test('the token only applies to the websites of the group', async () => {
    const login = await su.createUser('tracker_other');
    const idSite = await su.createSite('Tracking Granted');
    const otherSite = await su.createSite('Tracking Other');
    const group = await su.createGroup('Tracking other');
    const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    await su.addMembers(group.idGroup, [login]);
    await su.setGroupAccess(group.name, 'admin', idSite);

    expect(await trackInThePast(idSite, member.tokenAuth)).toBe(204);
    expect(await trackInThePast(otherSite, member.tokenAuth)).toBe(400);
  });
});
