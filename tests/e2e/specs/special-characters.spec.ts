import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID, superUserStorageState } from '../helpers/env';
import {
  accessRow, chooseOption, clickModalButton, fillField, groupEditor, groupRow, memberRow, openGroupEditor,
  openGroupPermissions, saveButton, screenshot, selectSite, setAccess, switchEditorTab, toast, waitForIdle,
} from '../helpers/ui';

/**
 * Group names with HTML, quotes, commas and unicode must be stored as-is and rendered as text (no XSS).
 */
test.describe('Group names with special characters', () => {
  test.use({ storageState: superUserStorageState });

  // the img onerror would open an alert if the name were rendered as HTML. Matomo stores request values
  // HTML-escaped (`"` -> `&quot;`), so the name has to stay short to fit into the 64 characters name column.
  const NAME = `<img src=x onerror=alert(1)>"'&,ü ${RUN_ID.slice(-5)}`;
  let su: MatomoApi;
  let group: { idGroup: number; name: string };
  let idSite: number;
  let siteName: string;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    group = await su.call('GroupPermissions.createGroup', { groupName: NAME });
    idSite = await su.createSite('Special Site');
    siteName = (await su.call('SitesManager.getSiteFromId', { idSite })).name;
    await su.addMembers(group.idGroup, [await su.createUser('special_member')]);
  });

  let dialogs: string[] = [];

  test.beforeEach(async ({ page }) => {
    dialogs = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
  });

  test.afterEach(async () => {
    expect(dialogs, 'alert() calls, the group name was rendered as HTML').toEqual([]);
  });

  test('Manage Access works for a typical name with "&"', async ({ page }) => {
    const rnd = await su.call('GroupPermissions.createGroup', { groupName: `R&D "Team" ${RUN_ID}` });
    await openGroupPermissions(page, 'access');
    await selectSite(page, siteName);
    const row = accessRow(page, rnd.name);
    await setAccess(page, row, 'write');
    await expect(page.locator('#ajaxErrorAccessGroupMember')).toBeEmpty();
    expect((await su.groupAccess(idSite))[rnd.name]).toBe('write');
  });

  test('the API stores and returns the name unchanged', async () => {
    expect(group.name).toBe(NAME);
    expect(await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).toEqual({ idGroup: group.idGroup, name: NAME });
    await su.setGroupAccess(NAME, 'view', idSite);
    expect((await su.groupAccess(idSite))[NAME]).toBe('view');
    await su.setGroupAccess(NAME, 'noaccess', idSite);
  });

  test('Manage Access renders the name as text and can change its access', async ({ page }) => {
    await openGroupPermissions(page, 'access');
    await selectSite(page, siteName);
    const row = accessRow(page, NAME);
    await expect(row).toHaveCount(1);
    await setAccess(page, row, 'admin');
    await expect(toast(page, `The group '${NAME}' now has the role 'Admin'`).first()).toBeVisible();
    expect((await su.groupAccess(idSite))[NAME]).toBe('admin');

    // the confirmation of "all websites" contains the name as text
    const selector = page.locator('.siteSelector').first();
    await selector.locator('.title').click();
    await selector.getByText('Apply to all websites').click();
    await waitForIdle(page);
    await chooseOption(accessRow(page, NAME), 'View');
    await expect(page.locator('.modal.open')).toContainText(`to the group '${NAME}' for all the websites?`);
    await screenshot(page, 'special-characters-confirmation');
    await clickModalButton(page, 'No');
  });

  test('Manage Groups renders the name as text in the list, editor, forms and dialogs', async ({ page }) => {
    await openGroupPermissions(page, 'groups');
    await expect(groupRow(page, NAME)).toHaveCount(1);
    await groupRow(page, NAME).locator('button.delete-group').click();
    await expect(page.locator('.modal.open')).toContainText(`delete the group '${NAME}'?`);
    await clickModalButton(page, 'No');

    await openGroupEditor(page, group.idGroup, 'settings');
    await expect(groupEditor(page).locator('.card-title').first()).toHaveText(`Edit group '${NAME}'`);
    await expect(page.locator('input[name="groupPermissionsGroupName"]')).toHaveValue(NAME);

    await switchEditorTab(page, 'members');
    const member = (await su.members(group.idGroup))[0];
    await memberRow(page, member).locator('button.groupPermissionsRemoveMember').click();
    await expect(page.locator('.modal.open')).toContainText(`from group '${NAME}'?`);
    await clickModalButton(page, 'No');

    await page.locator('.groupPermissionsInviteIntoGroup').click();
    await expect(page.locator('.groupPermissionsCheckboxList label', { hasText: NAME })).toHaveCount(1);
  });

  test('renaming to and from special characters works', async ({ page }) => {
    const other = await su.createGroup('Plain');
    const newName = `${NAME} r`;
    await openGroupEditor(page, other.idGroup, 'settings');
    await fillField(page.locator('input[name="groupPermissionsGroupName"]'), newName);
    await saveButton(page.locator('.groupPermissionsRenameGroup'), 'groupPermissionsRenameGroupButton').click();
    await expect(toast(page, `The group has been renamed to '${newName}'.`).first()).toBeVisible();
    await expect(groupEditor(page).locator('.card-title').first()).toHaveText(`Edit group '${newName}'`);
    expect((await su.call('GroupPermissions.getGroupWithId', { idGroup: other.idGroup })).name).toBe(newName);
  });

  test('the copy dashboard dialog shows the name as text', async ({ page }) => {
    await page.goto('/index.php?module=CoreHome&action=index&idSite=1&period=day&date=yesterday#?idSite=1&period=day&date=yesterday&category=Dashboard_Dashboard&subcategory=1');
    await waitForIdle(page);
    await page.locator('.dashboard-manager .title').click();
    await page.locator('text="Copy dashboard to user" >> visible=true').first().click();
    const select = page.locator('.modal.open select[name="copyDashboardUser"]');
    await expect(select.locator('optgroup')).toHaveCount(2);
    const labels = await select.locator('optgroup[label="Groups"] option').allInnerTexts();
    expect(labels.filter((l) => l === NAME)).toHaveLength(1);
  });
});
