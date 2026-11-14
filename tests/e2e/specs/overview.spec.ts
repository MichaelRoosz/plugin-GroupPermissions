import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { superUserStorageState } from '../helpers/env';
import { openGroupPermissions, screenshot, multiselectPick, selectSite, clickModalButton, waitForIdle } from '../helpers/ui';

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
    await expect(page.locator('.nav-pills li')).toHaveText(['Manage Access', 'Manage Groups']);
  });

  test('create, rename, add member and delete a group', async ({ page }) => {
    const suffix = Date.now().toString(36);
    const name = `UI group ${suffix}`;
    const renamed = `UI renamed ${suffix}`;
    const member = await su.createUser('ui_member');

    await openGroupPermissions(page, 'groups');

    // create
    const createCard = page.locator('.card', { hasText: 'Create a new group' });
    await createCard.locator('input[type=text]').fill(name);
    await createCard.locator('input[type=button]').click();
    await expect(createCard.locator('input[type=text]')).toHaveValue('');
    const manageCard = page.locator('.card', { hasText: 'Manage group' }).last();
    await expect(manageCard.locator('.multiselect__single')).toHaveText(name);

    // add member
    await multiselectPick(manageCard.locator('.groupPermissionsGroupAddMemberWrapper .multiselect'), member);
    await manageCard.locator('input[type=button][value="Add Member"]').click();
    await expect(manageCard.locator('td.login', { hasText: member })).toBeVisible();
    expect(await su.members((await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).find((g: any) => g.name === name).idGroup))
      .toEqual([member]);

    // rename
    const renameInput = manageCard.locator('h3', { hasText: 'Rename this group' }).locator('xpath=following-sibling::div[1]').locator('input[type=text]');
    await renameInput.fill(renamed);
    await manageCard.locator('input[type=button][value="Rename Group"]').click();
    await clickModalButton(page, 'Yes');
    await expect(manageCard.locator('.multiselect__single')).toHaveText(renamed);

    // delete
    await manageCard.locator('input[type=button][value="Delete Group"]').click();
    await clickModalButton(page, 'Yes');
    await waitForIdle(page);
    const groups = await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 });
    expect(groups.map((g: any) => g.name)).not.toContain(renamed);
  });

  test('screenshot: Manage Groups tab', async ({ page }) => {
    await openGroupPermissions(page, 'groups');
    await waitForIdle(page);
    await screenshot(page, 'manage-groups-tab');
  });

  test('screenshot: Manage Access tab and changing access of a group', async ({ page }) => {
    const group = await su.createGroup('Access UI');
    const idSite = await su.createSite('Access UI Site');
    const siteName = (await su.call('SitesManager.getSiteFromId', { idSite })).name;
    await openGroupPermissions(page, 'access');
    await selectSite(page, siteName);
    const row = page.locator('tr', { hasText: group.name });
    await expect(row).toBeVisible();

    await screenshot(page, 'manage-access-tab');

    // columns: name | none | view | write | admin
    await row.locator('td').nth(2).locator('img.updateAccess').click();
    await expect(row.locator('td').nth(2).locator('img.accessGranted')).toBeVisible();
    await waitForIdle(page);
    await expect.poll(async () => (await su.call('GroupPermissions.getGroupAccessFromSite', { idSite }))[group.name])
      .toBe('view');
  });
});
