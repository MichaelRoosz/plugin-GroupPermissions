import { test, expect, Page } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, superUserStorageState } from '../helpers/env';
import {
  ACCESS_LEVELS, accessRow, accessTableGroups, chooseOption, clickModalButton, expectAccess, fillField, login,
  openGroupPermissions, ROLE_LABELS, roleSelect, screenshot, selectSite, setAccess, toast, waitForIdle,
} from '../helpers/ui';

/**
 * The "Manage Access" tab: choose a website and set the role of every group for it.
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
    await openGroupPermissions(page, 'access', '', idSite);
    await expect(page.locator('.siteSelector .title').first()).toContainText(siteNames.get(idSite)!, { ignoreCase: true });
    await waitForIdle(page);
  }

  async function chooseAllWebsites(page: Page) {
    const selector = page.locator('.siteSelector').first();
    await selector.locator('.title').click();
    await selector.getByText('Apply to all websites').click();
    await expect(selector.locator('.title')).toContainText('Apply to all websites', { ignoreCase: true });
    await waitForIdle(page);
  }

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    siteNames.set(1, 'Site One');
  });

  test('shows the description and opens with the website from the URL', async ({ page }) => {
    const idSite = await createSite('Initial Site');
    const group = await su.createGroup('Initial');
    await su.setGroupAccess(group.name, 'write', idSite);

    await openForSite(page, idSite);
    await expect(page.locator('.groupPermissionsTabs li.active')).toHaveText('Manage Access');
    await expect(page.getByText('Decide which groups have access to your websites.')).toBeVisible();
    await expect(page.locator('.groupPermissionsManageAccess .card-title')).toHaveText(`Roles of the groups for '${siteNames.get(idSite)}'`);
    await expectAccess(accessRow(page, group.name), 'write');

    // and for another website of the URL
    await openGroupPermissions(page, 'access', '', 1);
    await expect(page.locator('.siteSelector .title').first()).toContainText('Site One', { ignoreCase: true });
    await expectAccess(accessRow(page, group.name), 'noaccess');
  });

  test('lists all groups alphabetically with their current role', async ({ page }) => {
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
    expect(shown).toEqual([...shown].sort((a, b) => a.localeCompare(b)));

    for (const [name, access] of Object.entries(groups)) {
      await expectAccess(accessRow(page, name), access as any);
    }
    await expect(page.locator('.groupPermissionsAccessTable thead th')).toHaveText(['Group', 'Role', 'Capabilities'], { ignoreCase: true });
  });

  test('every role can be selected, is saved immediately and confirmed by a toast', async ({ page }) => {
    const idSite = await createSite('Levels Site');
    const group = await su.createGroup('Levels');
    await openForSite(page, idSite);
    const row = accessRow(page, group.name);
    await expectAccess(row, 'noaccess');

    // the role select offers "No access" and Matomo's roles
    await roleSelect(row).click();
    await expect(row.locator('ul.select-dropdown li')).toHaveText(Object.values(ROLE_LABELS));
    await page.locator('.groupPermissionsIntro').click(); // close the dropdown

    for (const access of ['view', 'write', 'admin', 'noaccess'] as const) {
      await setAccess(page, row, access);
      await expect(toast(page, `The group '${group.name}' now has the role '${ROLE_LABELS[access]}'`).first()).toBeVisible();
      expect((await su.groupAccess(idSite))[group.name]).toBe(access);
      if (access === 'admin') {
        await screenshot(page, 'manage-access-admin-granted');
      }
    }

    // reload shows the stored state
    await su.setGroupAccess(group.name, 'write', idSite);
    await openForSite(page, idSite);
    await expectAccess(accessRow(page, group.name), 'write');
  });

  test('changing the role for one website does not affect other websites or groups', async ({ page }) => {
    const s1 = await createSite('Isolated One');
    const s2 = await createSite('Isolated Two');
    const group = await su.createGroup('Isolated');
    const other = await su.createGroup('Isolated other');
    await su.setGroupAccess(other.name, 'view', s1);

    await openForSite(page, s1);
    await setAccess(page, accessRow(page, group.name), 'admin');

    expect(await su.groupAccess(s1)).toMatchObject({ [group.name]: 'admin', [other.name]: 'view' });
    expect((await su.groupAccess(s2))[group.name]).toBe('noaccess');
  });

  test('switching websites shows the roles of the selected website', async ({ page }) => {
    const group = await su.createGroup('Switch sites');
    const s1 = await createSite('Switch One');
    const s2 = await createSite('Switch Two');
    await su.setGroupAccess(group.name, 'admin', s1);
    await su.setGroupAccess(group.name, 'write', s2);

    await openForSite(page, s1);
    await expectAccess(accessRow(page, group.name), 'admin');
    await selectSite(page, siteNames.get(s2)!);
    await expect(page.locator('.groupPermissionsManageAccess .card-title')).toContainText(siteNames.get(s2)!);
    await expectAccess(accessRow(page, group.name), 'write');
  });

  test('the search filters the groups', async ({ page }) => {
    const idSite = await createSite('Search Site');
    const needle = await su.createGroup('Needle');
    await su.createGroup('Haystack');
    await openForSite(page, idSite);

    const search = page.locator('.groupPermissionsSearch input');
    await fillField(search, needle.name.toLowerCase());
    await expect(page.locator('tr.groupPermissionsAccessRow')).toHaveCount(1);
    await expect(accessRow(page, needle.name)).toBeVisible();

    await fillField(search, 'no group has this name');
    await expect(page.locator('tr.groupPermissionsAccessRow')).toHaveCount(0);
    await expect(page.locator('tr.groupPermissionsEmpty')).toHaveText('No groups match your search.');
  });

  test('the role help explains the roles', async ({ page }) => {
    await openForSite(page, 1);
    await page.locator('.groupPermissionsAccessTable .groupPermissionsRolesHelpToggle').click();
    const help = page.locator('.groupPermissionsAccessTable tr.groupPermissionsRolesHelp');
    await expect(help).toContainText('View:');
    await expect(help).toContainText('Write:');
    await expect(help).toContainText('Admin:');
    await page.locator('.groupPermissionsAccessTable .groupPermissionsRolesHelpToggle').click();
    await expect(help).toHaveCount(0);
  });

  test('a slow response of the previously selected website does not overwrite the current one', async ({ page }) => {
    const slowSite = await createSite('Slow Site');
    const fastSite = await createSite('Fast Site');
    const group = await su.createGroup('Race');
    await su.setGroupAccess(group.name, 'admin', slowSite);
    await su.setGroupAccess(group.name, 'view', fastSite);

    await openForSite(page, 1);
    // delay the access list of the slow website
    await page.route(/method=GroupPermissions\.getGroupPermissionsFromSite/, async (route) => {
      if ((route.request().postData() || '').includes(`idSite=${slowSite}`)) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      await route.continue();
    });
    const selector = page.locator('.siteSelector').first();
    for (const idSite of [slowSite, fastSite]) {
      await selector.locator('.title').click();
      const search = selector.locator('input.websiteSearch');
      if (await search.isVisible()) await search.fill(siteNames.get(idSite)!);
      await selector.locator('.custom_select_ul_list li a', { hasText: siteNames.get(idSite)! }).first().click();
    }
    await expectAccess(accessRow(page, group.name), 'view');
    await page.waitForTimeout(3500); // the slow response arrives
    await expectAccess(accessRow(page, group.name), 'view');
    await expect(selector.locator('.title')).toContainText(siteNames.get(fastSite)!, { ignoreCase: true });
  });

  test('"Apply to all websites" lists every group, explains itself and asks for confirmation', async ({ page }) => {
    const group = await su.createGroup('All sites');
    const withAccess = await su.createGroup('All sites existing');
    await su.setGroupAccess(withAccess.name, 'admin', 1);
    await openForSite(page, 1);
    await chooseAllWebsites(page);

    await expect(page.locator('.groupPermissionsAllWebsitesNote')).toContainText('changes the role of a group for every website');
    // the roles differ per website: no role is preselected, so any role (also "No access") can be chosen
    const placeholder = 'Select a role for all websites';
    const allGroups: string[] = (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).map((g: any) => g.name);
    expect((await accessTableGroups(page)).sort()).toEqual([...allGroups].sort());
    await expect(roleSelect(accessRow(page, withAccess.name))).toHaveValue(placeholder);

    const row = accessRow(page, group.name);
    await chooseOption(row, 'View');
    await expect(page.locator('.modal.open')).toContainText(`Are you sure you want to give 'View' access to the group '${group.name}' for all the websites?`);
    await screenshot(page, 'manage-access-all-websites-confirmation');

    // "No" resets the select
    await clickModalButton(page, 'No');
    await expect(roleSelect(row)).toHaveValue(placeholder);
    expect((await su.groupAccess(1))[group.name]).toBe('noaccess');

    await chooseOption(row, 'View');
    await clickModalButton(page, 'Yes');
    await waitForIdle(page);
    await expect(toast(page, `The group '${group.name}' now has the role 'View'`).first()).toBeVisible();
    // the select shows the placeholder again, so the same role can be applied again
    await expect(roleSelect(row)).toHaveValue(placeholder);
    const allSites: number[] = (await su.call('SitesManager.getAllSitesId', { filter_limit: -1 })).map(Number);
    for (const idSite of allSites) {
      expect((await su.groupAccess(idSite))[group.name]).toBe('view');
    }

    // "No access" removes the access of a group from all websites
    const existingRow = accessRow(page, withAccess.name);
    await chooseOption(existingRow, 'No access');
    await clickModalButton(page, 'Yes');
    await waitForIdle(page);
    await expect(roleSelect(existingRow)).toHaveValue(placeholder);
    for (const idSite of allSites) {
      expect((await su.groupAccess(idSite))[withAccess.name]).toBe('noaccess');
    }
  });

  test('shows an error and resets the select if the group was deleted in the meantime', async ({ page }) => {
    const idSite = await createSite('Stale Site');
    const group = await su.createGroup('Stale');
    await openForSite(page, idSite);
    const row = accessRow(page, group.name);
    await expectAccess(row, 'noaccess');

    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });
    await chooseOption(row, 'View');

    await expect(page.locator('#ajaxErrorAccessGroupMember')).toContainText('Group does not exist');
    await expectAccess(row, 'noaccess');
    await screenshot(page, 'manage-access-error');
  });

  test('without groups an empty state links to Manage Groups', async ({ page }) => {
    await page.route(/method=GroupPermissions\.getGroupPermissionsFromSite/, (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' }));
    await openForSite(page, 1);
    const empty = page.locator('.groupPermissionsAccessTable tr.groupPermissionsEmpty');
    await expect(empty).toContainText('There are no groups yet.');
    await empty.getByRole('link', { name: 'Manage Groups' }).click();
    await expect(page.locator('.groupPermissionsTabs li.active')).toHaveText('Manage Groups');
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

      // a website of the URL the user only has view access to falls back to an administered website
      await openGroupPermissions(page, 'access', '', viewSite);
      const shown = (await page.locator('.siteSelector .title').first().innerText()).trim().toUpperCase();
      expect([siteNames.get(adminSite1)!, siteNames.get(adminSite2)!].map((n) => n.toUpperCase())).toContain(shown);
      await expect(accessRow(page, group.name)).toBeVisible();

      await openGroupPermissions(page, 'access', '', adminSite1);
      await expect(page.locator('.siteSelector .title').first()).toContainText(siteNames.get(adminSite1)!, { ignoreCase: true });

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
        await setAccess(page, row, access);
        expect((await su.groupAccess(adminSite2))[group.name]).toBe(access);
      }
      expect((await su.groupAccess(adminSite1))[group.name]).toBe('noaccess');
    });
  });
});
