import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, superUserStorageState } from '../helpers/env';
import {
  accessRow, clickModalButton, fillField, groupEditor, memberRow, multiselectPick, openGroupPermissions, saveButton,
  screenshot, selectSite, setAccess, switchEditorTab, waitForIdle, websiteRow,
} from '../helpers/ui';

/**
 * Regression tests of the existing features (group management and site access) incl. overview screenshots.
 */
test.describe('Group Permissions admin page', () => {
  test.use({ storageState: superUserStorageState });

  let su: MatomoApi;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  test('is reachable via the admin menu', async ({ page }) => {
    await page.goto('/index.php?module=CoreAdminHome&action=home&idSite=1&period=day&date=yesterday');
    await page.locator('text="System" >> visible=true').first().click();
    await page.locator('a:text-is("Group Permissions") >> visible=true').first().click();
    await expect(page.locator('h2:text-is("Group Permissions")')).toBeVisible();
    await expect(page.locator('.groupPermissionsTabs li')).toHaveText(['Manage Access', 'Manage Groups']);
  });

  test('main workflow: create a group, add a member, give access, rename and delete it', async ({ page }) => {
    const suffix = Date.now().toString(36);
    const name = `UI group ${suffix}`;
    const renamed = `UI renamed ${suffix}`;
    const member = await su.createUser('ui_member');
    const idSite = await su.createSite('Workflow Site');
    const siteName = (await su.call('SitesManager.getSiteFromId', { idSite })).name;

    // create
    await openGroupPermissions(page, 'groups');
    await page.locator('.groupPermissionsCreateGroup').click();
    await fillField(page.locator('input[name="groupPermissionsNewGroupName"]'), name);
    await saveButton(page.locator('.groupPermissionsCreateGroupForm'), 'groupPermissionsSaveNewGroup').click();
    await expect(groupEditor(page).locator('.card-title').first()).toHaveText(`Edit group '${name}'`);
    const idGroup = (await su.groupByName(name))!.idGroup;

    // add member
    await multiselectPick(page.locator('.groupPermissionsUserSelect'), member);
    await saveButton(page.locator('.groupPermissionsAddMember'), 'groupPermissionsAddMemberButton').click();
    await expect(memberRow(page, member)).toBeVisible();
    expect(await su.members(idGroup)).toEqual([member]);

    // give access
    await switchEditorTab(page, 'access');
    const form = page.locator('.groupPermissionsGiveAccess');
    await form.locator('.siteSelector .title').click();
    const search = form.locator('.siteSelector input.websiteSearch');
    if (await search.isVisible()) await search.fill(siteName);
    await form.locator('.siteSelector .custom_select_ul_list li a', { hasText: siteName }).first().click();
    await saveButton(form, 'groupPermissionsGiveAccessButton').click();
    await expect(websiteRow(page, siteName)).toBeVisible();
    expect((await su.groupAccess(idSite))[name]).toBe('view');
    const memberApi = await MatomoApi.forUser(member, DEFAULT_PASSWORD);
    expect((await memberApi.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).toEqual([idSite]);

    // rename
    await switchEditorTab(page, 'settings');
    await fillField(page.locator('input[name="groupPermissionsGroupName"]'), renamed);
    await saveButton(page.locator('.groupPermissionsRenameGroup'), 'groupPermissionsRenameGroupButton').click();
    await expect(groupEditor(page).locator('.card-title').first()).toHaveText(`Edit group '${renamed}'`);

    // delete
    await page.locator('.groupPermissionsDeleteGroupButton').click();
    await clickModalButton(page, 'Yes');
    await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
    await waitForIdle(page);
    expect(await su.groupByName(renamed)).toBeUndefined();
    expect((await memberApi.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number)).toEqual([]);
  });

  test('screenshot: Manage Groups tab', async ({ page }) => {
    await openGroupPermissions(page, 'groups');
    await waitForIdle(page);
    await screenshot(page, 'manage-groups-tab');
  });

  test('the page works on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openGroupPermissions(page, 'groups');
    await expect(page.locator('.groupPermissionsCreateGroup')).toBeVisible();
    // the plugin's content fits into the screen (Matomo's own off-canvas menu is ignored)
    for (const tab of ['groups', 'access'] as const) {
      await openGroupPermissions(page, tab);
      const [scrollWidth, clientWidth] = await page.locator('.groupPermissions').evaluate((el) => [el.scrollWidth, el.clientWidth]);
      expect(scrollWidth, `${tab}: content wider than the screen`).toBeLessThanOrEqual(clientWidth + 1);
    }
    await screenshot(page, 'manage-groups-mobile');
  });

  test('screenshot: Manage Access tab and changing access of a group', async ({ page }) => {
    const group = await su.createGroup('Access UI');
    const idSite = await su.createSite('Access UI Site');
    const siteName = (await su.call('SitesManager.getSiteFromId', { idSite })).name;
    await openGroupPermissions(page, 'access');
    await selectSite(page, siteName);
    const row = accessRow(page, group.name);
    await expect(row).toBeVisible();

    await screenshot(page, 'manage-access-tab');

    await setAccess(page, row, 'view');
    await expect.poll(async () => (await su.call('GroupPermissions.getGroupAccessFromSite', { idSite }))[group.name])
      .toBe('view');
  });
});
