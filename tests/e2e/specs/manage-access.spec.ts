import { test, expect, Page } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, superUserStorageState } from '../helpers/env';
import {
  ACCESS_LEVELS, accessCell, accessRow, accessTableGroups, clickModalButton, expectAccess, login,
  openGroupPermissions, screenshot, selectSite, waitForIdle,
} from '../helpers/ui';

/**
 * The "Manage Access" tab: choose a website and set the access of every group for it.
 */
test.describe('Manage Access tab', () => {
  test.use({ storageState: superUserStorageState });

  let su: MatomoApi;
  const siteNames = new Map<number, string>();

  async function createSite(name: string): Promise<number> {
    const idSite = await su.createSite(name);
    siteNames.set(idSite, (await su.call('SitesManager.getSiteFromId', { idSite })).name);
    return idSite;
  }

  async function openForSite(page: Page, idSite: number) {
    await openGroupPermissions(page, 'access');
    await selectSite(page, siteNames.get(idSite)!);
  }

  async function chooseAllWebsites(page: Page) {
    const selector = page.locator('.siteSelector').first();
    await selector.locator('.title').click();
    await selector.getByText('Apply to all websites').click();
    await expect(selector.locator('.title')).toContainText('Apply to all websites');
    await waitForIdle(page);
  }

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  test('shows the description and preselects a website whose access is shown', async ({ page }) => {
    const group = await su.createGroup('Initial');
    // give the group a different access on every site, so the table identifies the preselected website
    const levels = ['view', 'write', 'admin'] as const;
    const sites: Array<{ idsite: number; name: string }> = Object.values(await su.call('SitesManager.getAllSites', { filter_limit: -1 }));
    for (const [i, site] of sites.entries()) {
      await su.setGroupAccess(group.name, levels[i % 3], Number(site.idsite));
    }

    await openGroupPermissions(page, 'access');
    await expect(page.locator('.nav-pills li.active')).toHaveText('Manage Access');
    await expect(page.getByText('Decide which groups have access to your websites.')).toBeVisible();

    // note: the site selector preselects the first website of its list, not the idSite of the URL
    const shownName = (await page.locator('.siteSelector .title').first().innerText()).trim();
    const index = sites.findIndex((s) => s.name.toUpperCase() === shownName.toUpperCase());
    expect(index, `preselected website "${shownName}"`).toBeGreaterThanOrEqual(0);
    await expectAccess(accessRow(page, group.name), levels[index % 3]);
  });

  test('lists all groups alphabetically with their current access', async ({ page }) => {
    const idSite = await createSite('Listing Site');
    const groups: Record<string, string> = {};
    for (const [prefix, access] of [['Zulu', 'admin'], ['alpha', 'view'], ['Mike', 'write'], ['Bravo', 'noaccess']]) {
      const group = await su.createGroup(`List ${prefix}`);
      await su.setGroupAccess(group.name, access, idSite);
      groups[group.name] = access;
    }

    await openForSite(page, idSite);

    const shown = await accessTableGroups(page);
    const allGroups: string[] = (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).map((g: any) => g.name);
    expect([...shown].sort()).toEqual([...allGroups].sort());
    expect(shown).toEqual([...shown].sort());

    for (const [name, access] of Object.entries(groups)) {
      await expectAccess(accessRow(page, name), access as any);
    }
    await expect(page.locator('.entityTable thead th')).toHaveText(['Group', 'No access', 'View', 'Write', 'Admin'], { ignoreCase: true });
  });

  test('every access level can be set and is persisted', async ({ page }) => {
    const idSite = await createSite('Levels Site');
    const group = await su.createGroup('Levels');
    await openForSite(page, idSite);
    const row = accessRow(page, group.name);
    await expectAccess(row, 'noaccess');

    for (const access of ['view', 'write', 'admin', 'noaccess'] as const) {
      await accessCell(row, access).locator('img.updateAccess').click();
      await expectAccess(row, access);
      await waitForIdle(page);
      expect((await su.groupAccess(idSite))[group.name]).toBe(access);

      if (access === 'admin') {
        await screenshot(page, 'manage-access-admin-granted');
      }
    }

    // the granted level is not clickable
    await expect(accessCell(row, 'noaccess').locator('img.updateAccess')).toHaveCount(0);

    // reload shows the stored state
    await su.setGroupAccess(group.name, 'write', idSite);
    await openForSite(page, idSite);
    await expectAccess(accessRow(page, group.name), 'write');
  });

  test('changing the access of one site does not affect other sites or groups', async ({ page }) => {
    const s1 = await createSite('Isolated One');
    const s2 = await createSite('Isolated Two');
    const group = await su.createGroup('Isolated');
    const other = await su.createGroup('Isolated other');
    await su.setGroupAccess(other.name, 'view', s1);

    await openForSite(page, s1);
    await accessCell(accessRow(page, group.name), 'admin').locator('img.updateAccess').click();
    await expectAccess(accessRow(page, group.name), 'admin');
    await waitForIdle(page);

    expect(await su.groupAccess(s1)).toMatchObject({ [group.name]: 'admin', [other.name]: 'view' });
    expect((await su.groupAccess(s2))[group.name]).toBe('noaccess');
  });

  test('switching websites shows the access of the selected website', async ({ page }) => {
    const group = await su.createGroup('Switch sites');
    const s1 = await createSite('Switch One');
    const s2 = await createSite('Switch Two');
    await su.setGroupAccess(group.name, 'admin', s1);
    await su.setGroupAccess(group.name, 'write', s2);

    await openForSite(page, s1);
    await expectAccess(accessRow(page, group.name), 'admin');
    await selectSite(page, siteNames.get(s2)!);
    await expectAccess(accessRow(page, group.name), 'write');
  });

  test('"Apply to all websites" lists every group and asks for confirmation', async ({ page }) => {
    const group = await su.createGroup('All sites');
    const withAccess = await su.createGroup('All sites existing');
    await su.setGroupAccess(withAccess.name, 'admin', 1);
    await openGroupPermissions(page, 'access');
    await chooseAllWebsites(page);

    // the all-websites view does not show existing per-site access, every group starts at "no access"
    const allGroups: string[] = (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).map((g: any) => g.name);
    expect((await accessTableGroups(page)).sort()).toEqual([...allGroups].sort());
    await expectAccess(accessRow(page, withAccess.name), 'noaccess');

    const row = accessRow(page, group.name);
    await accessCell(row, 'view').locator('img.updateAccess').click();
    await expect(page.locator('.modal.open')).toContainText(`Are you sure you want to give 'view' access to the group '${group.name}' for all the websites?`);
    await screenshot(page, 'manage-access-all-websites-confirmation');

    await clickModalButton(page, 'No');
    await expectAccess(row, 'noaccess');
    expect((await su.groupAccess(1))[group.name]).toBe('noaccess');

    await accessCell(row, 'view').locator('img.updateAccess').click();
    await clickModalButton(page, 'Yes');
    await expectAccess(row, 'view');
    await waitForIdle(page);
    const allSites: number[] = (await su.call('SitesManager.getAllSitesId')).map(Number);
    for (const idSite of allSites) {
      expect((await su.groupAccess(idSite))[group.name]).toBe('view');
    }
  });

  test('shows an error if the group was deleted in the meantime', async ({ page }) => {
    const idSite = await createSite('Stale Site');
    const group = await su.createGroup('Stale');
    await openForSite(page, idSite);
    const row = accessRow(page, group.name);
    await expectAccess(row, 'noaccess');

    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });
    await accessCell(row, 'view').locator('img.updateAccess').click();

    await expect(page.locator('#ajaxErrorAccessGroupMember')).toContainText('Group does not exist');
    await expectAccess(row, 'noaccess');
    await screenshot(page, 'manage-access-error');
  });

  test.describe('as site admin', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('only the administered websites can be selected and changed', async ({ page }) => {
      const adminSite1 = await createSite('Admin Owned One');
      const adminSite2 = await createSite('Admin Owned Two');
      const viewSite = await createSite('Admin Only View');
      const group = await su.createGroup('Site admin');
      const admin = await su.createUser('access_admin');
      await su.setUserAccess(admin, 'admin', `${adminSite1},${adminSite2}`);
      await su.setUserAccess(admin, 'view', viewSite);

      await login(page, admin, DEFAULT_PASSWORD);
      await openGroupPermissions(page, 'access', '', adminSite1);

      const selector = page.locator('.siteSelector').first();
      await selector.locator('.title').click();
      // innerText is upper-cased by CSS
      const options = (await selector.locator('.custom_select_ul_list li a').allInnerTexts()).map((t) => t.trim().toUpperCase());
      expect(options.sort()).toEqual([siteNames.get(adminSite1)!, siteNames.get(adminSite2)!].map((n) => n.toUpperCase()).sort());
      await expect(selector.getByText('Apply to all websites')).toHaveCount(0);
      await selector.locator('.custom_select_ul_list li a', { hasText: siteNames.get(adminSite2)! }).click();
      await waitForIdle(page);

      const row = accessRow(page, group.name);
      for (const access of ACCESS_LEVELS.slice(1)) {
        await accessCell(row, access).locator('img.updateAccess').click();
        await expectAccess(row, access);
        await waitForIdle(page);
        expect((await su.groupAccess(adminSite2))[group.name]).toBe(access);
      }
      expect((await su.groupAccess(adminSite1))[group.name]).toBe('noaccess');
    });
  });
});
