import { test, expect, Page } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID, superUserStorageState } from '../helpers/env';
import {
  clickModalButton, manageGroupCard, multiselectOptions, multiselectPick, openGroupPermissions,
  renameInput, screenshot, waitForIdle,
} from '../helpers/ui';

/**
 * The "Manage Groups" tab: create, select, rename and delete groups and manage their members.
 * (Inviting users is covered by invite-user.spec.ts.)
 */
test.describe('Manage Groups tab', () => {
  test.use({ storageState: superUserStorageState });

  let su: MatomoApi;

  const createCard = (page: Page) => page.locator('.card', { hasText: 'Create a new group' });
  const groupSelect = (page: Page) => manageGroupCard(page).locator('.multiselect').first();
  const selectedGroup = (page: Page) => groupSelect(page).locator('.multiselect__single');
  const memberLogins = async (page: Page) =>
    (await manageGroupCard(page).locator('td.login').allInnerTexts()).map((t) => t.trim());
  const addMemberSelect = (page: Page) => page.locator('.groupPermissionsGroupAddMemberWrapper .multiselect');
  /** All group names, sorted like the UI sorts them. */
  const allGroupNames = async (): Promise<string[]> =>
    (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 }))
      .map((g: { name: string }) => g.name)
      .sort((x: string, y: string) => x.localeCompare(y));

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  // ---- navigation / selection ----

  test('an unknown tab falls back to Manage Access', async ({ page }) => {
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=foo');
    await expect(page.locator('.nav-pills li.active')).toHaveText('Manage Access');
    await expect(page.getByText('Decide which groups have access to your websites.')).toBeVisible();
  });

  test('shows the description and all cards', async ({ page }) => {
    await openGroupPermissions(page, 'groups');
    await expect(page.locator('.nav-pills li.active')).toHaveText('Manage Groups');
    await expect(page.getByText('Here you can take a look at the members of each group. Superusers may edit the groups.')).toBeVisible();
    await expect(page.locator('.card h2:visible')).toHaveText(['Create a new group', 'Invite a new user to groups', 'Manage group']);
  });

  test('without a group in the URL the first group is selected', async ({ page }) => {
    const groups = await allGroupNames();
    await openGroupPermissions(page, 'groups');
    await expect(selectedGroup(page)).toHaveText(groups[0]);
  });

  test('the group given in the URL is preselected', async ({ page }) => {
    const group = await su.createGroup('Preselected');
    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    await expect(selectedGroup(page)).toHaveText(group.name);
  });

  test('an unknown group in the URL shows an error', async ({ page }) => {
    await openGroupPermissions(page, 'groups', '&idGroup=999999');
    await expect(page.locator('#ajaxErrorManageGroups')).toContainText('Group does not exist');
  });

  test('without any groups only "create" and "invite" are shown', async ({ page }) => {
    await page.route(/method=GroupPermissions\.getAllGroups/, (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' }));
    await openGroupPermissions(page, 'groups');
    await expect(page.getByText('Create a new group')).toBeVisible();
    await expect(page.getByText('Invite a new user to groups')).toBeVisible();
    await expect(manageGroupCard(page).locator('.multiselect__single')).toHaveCount(0);
    await expect(page.getByText('Manage group members')).toHaveCount(0);
    await screenshot(page, 'manage-groups-no-groups');
  });

  test('the dropdown lists all groups sorted; selecting one shows its members and updates the URL', async ({ page }) => {
    const a = await su.createGroup('Select A');
    const b = await su.createGroup('Select B');
    const [m1, m2, m3] = [await su.createUser('select_zed'), await su.createUser('select_amy'), await su.createUser('select_kim')];
    await su.addMembers(a.idGroup, [m1]);
    await su.addMembers(b.idGroup, [m1, m2, m3]);

    await openGroupPermissions(page, 'groups', `&idGroup=${a.idGroup}`);
    await expect(selectedGroup(page)).toHaveText(a.name);
    expect(await memberLogins(page)).toEqual([m1]);

    const options = await multiselectOptions(groupSelect(page));
    expect(options).toEqual(await allGroupNames());

    await multiselectPick(groupSelect(page), b.name);
    await expect(selectedGroup(page)).toHaveText(b.name);
    // members are sorted
    await expect(manageGroupCard(page).locator('td.login')).toHaveText([m2, m3, m1].sort());
    await expect(renameInput(page)).toHaveValue(b.name);
    await expect.poll(() => page.url()).toContain(`idGroup=${b.idGroup}`);

    // the selection survives a reload
    await page.reload();
    await waitForIdle(page);
    await expect(selectedGroup(page)).toHaveText(b.name);
  });

  // ---- create ----

  test('creates a group: input is cleared, group is selected and sorted into the dropdown', async ({ page }) => {
    const name = `Created UI ${RUN_ID}`;
    await openGroupPermissions(page, 'groups');
    await createCard(page).locator('input[type=text]').fill(name);
    await createCard(page).locator('input[type=button][value="Create Group"]').click();

    await expect(createCard(page).locator('input[type=text]')).toHaveValue('');
    await expect(selectedGroup(page)).toHaveText(name);
    await expect(manageGroupCard(page).locator('td.login')).toHaveCount(0);
    expect(await allGroupNames()).toContain(name);

    const options = await multiselectOptions(groupSelect(page));
    expect(options).toContain(name);
    expect(options).toEqual([...options].sort((x, y) => x.localeCompare(y)));
  });

  test('creating a group with an existing name shows an error', async ({ page }) => {
    const group = await su.createGroup('Duplicate UI');
    await openGroupPermissions(page, 'groups');
    await createCard(page).locator('input[type=text]').fill(group.name);
    await createCard(page).locator('input[type=button]').click();
    await expect(page.locator('#ajaxErrorCreateGroup')).toContainText('Group already exists');
    await screenshot(createCard(page), 'create-group-duplicate-error');
  });

  test('creating a group without a name shows an error', async ({ page }) => {
    const before = await allGroupNames();
    await openGroupPermissions(page, 'groups');
    await createCard(page).locator('input[type=button]').click();
    await expect(page.locator('#ajaxErrorCreateGroup')).toContainText(/specify a value for 'groupName'/);
    expect(await allGroupNames()).toEqual(before);
  });

  // ---- members ----

  test('the user dropdown lists all users sorted and adds the selected user', async ({ page }) => {
    const group = await su.createGroup('Add member');
    const [zed, amy] = [await su.createUser('add_zed'), await su.createUser('add_amy')];
    await su.addMembers(group.idGroup, [zed]);

    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    const options = await multiselectOptions(addMemberSelect(page));
    const users: string[] = await su.call('UsersManager.getUsersLogin', { filter_limit: -1 });
    expect([...options].sort()).toEqual([...users].sort());
    expect(options).toEqual([...options].sort());

    await multiselectPick(addMemberSelect(page), amy);
    await page.locator('.groupPermissionsGroupAddMemberWrapper input[type=button][value="Add Member"]').click();
    await expect(manageGroupCard(page).locator('td.login')).toHaveText([amy, zed]);
    // the selection is reset
    await expect(addMemberSelect(page).locator('.multiselect__single')).toHaveCount(0);
    expect(await su.members(group.idGroup)).toEqual([amy, zed]);
  });

  test('adding a member twice shows an error', async ({ page }) => {
    const group = await su.createGroup('Add twice');
    const login = await su.createUser('add_twice');
    await su.addMembers(group.idGroup, [login]);

    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    await multiselectPick(addMemberSelect(page), login);
    await page.locator('.groupPermissionsGroupAddMemberWrapper input[type=button]').click();
    await expect(page.locator('#ajaxErrorAddMember')).toContainText('User is already in group');
    expect(await su.members(group.idGroup)).toEqual([login]);
  });

  test('adding without selecting a user shows an error', async ({ page }) => {
    const group = await su.createGroup('Add nobody');
    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    await page.locator('.groupPermissionsGroupAddMemberWrapper input[type=button]').click();
    await expect(page.locator('#ajaxErrorAddMember')).toContainText(/specify a value for 'login'/);
    await expect(manageGroupCard(page).locator('td.login')).toHaveCount(0);
  });

  test('removes a member after confirmation', async ({ page }) => {
    const group = await su.createGroup('Remove UI');
    const [keep, remove] = [await su.createUser('ui_keep'), await su.createUser('ui_remove')];
    await su.addMembers(group.idGroup, [keep, remove]);

    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    const row = page.locator('tr', { has: page.locator('td.login', { hasText: remove }) });
    await row.locator('button.groupPermissionsRemoveMember').click();

    const modal = page.locator('.modal.open');
    await expect(modal).toContainText(`Are you sure you want to remove user '${remove}' from group '${group.name}'?`);
    await screenshot(page, 'remove-member-confirmation');

    // "No" keeps the member
    await clickModalButton(page, 'No');
    await expect(row).toBeVisible();
    expect(await su.members(group.idGroup)).toEqual([keep, remove].sort());

    await row.locator('button.groupPermissionsRemoveMember').click();
    await clickModalButton(page, 'Yes');
    await expect(row).toHaveCount(0);
    await waitForIdle(page);
    expect(await su.members(group.idGroup)).toEqual([keep]);
  });

  test('removing a member that no longer exists shows an error', async ({ page }) => {
    const group = await su.createGroup('Remove error');
    const login = await su.createUser('remove_gone');
    await su.addMembers(group.idGroup, [login]);

    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    const row = page.locator('tr', { has: page.locator('td.login', { hasText: login }) });
    await expect(row).toBeVisible();

    await su.deleteUser(login);
    await row.locator('button.groupPermissionsRemoveMember').click();
    await clickModalButton(page, 'Yes');
    await expect(page.locator('#ajaxErrorManageGroupMembers')).toContainText(/doesn't exist/);
  });

  // ---- rename ----

  test('renames a group after confirmation and keeps the dropdown sorted', async ({ page }) => {
    const group = await su.createGroup('Rename me');
    const newName = `AAA renamed ${RUN_ID}`;
    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    await expect(renameInput(page)).toHaveValue(group.name);

    await renameInput(page).fill(newName);
    await manageGroupCard(page).locator('input[type=button][value="Rename Group"]').click();
    await expect(page.locator('.modal.open')).toContainText(`Are you sure you want to rename the group '${group.name}' to '${newName}'?`);
    await clickModalButton(page, 'Yes');

    await expect(selectedGroup(page)).toHaveText(newName);
    await waitForIdle(page);
    expect(await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).toEqual({ idGroup: group.idGroup, name: newName });

    const options = await multiselectOptions(groupSelect(page));
    expect(options).toContain(newName);
    expect(options).not.toContain(group.name);
    expect(options).toEqual([...options].sort((x, y) => x.localeCompare(y)));
  });

  test('renaming to an existing name shows an error', async ({ page }) => {
    const group = await su.createGroup('Rename UI A');
    const other = await su.createGroup('Rename UI B');
    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    await renameInput(page).fill(other.name);
    await manageGroupCard(page).locator('input[type=button][value="Rename Group"]').click();
    await clickModalButton(page, 'Yes');
    await expect(page.locator('#ajaxErrorRenameGroup')).toContainText('Group already exists');
    expect((await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).name).toBe(group.name);
  });

  // ---- delete ----

  test('cancelling rename and delete keeps the group', async ({ page }) => {
    const group = await su.createGroup('Cancel UI');
    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);

    await renameInput(page).fill(`Not applied ${RUN_ID}`);
    await manageGroupCard(page).locator('input[type=button][value="Rename Group"]').click();
    await expect(page.locator('.modal.open')).toContainText(`rename the group '${group.name}' to 'Not applied ${RUN_ID}'`);
    await clickModalButton(page, 'No');

    await manageGroupCard(page).locator('input[type=button][value="Delete Group"]').click();
    await expect(page.locator('.modal.open')).toContainText(`Are you sure you want to delete the group '${group.name}'?`);
    await screenshot(page, 'delete-group-confirmation');
    await clickModalButton(page, 'No');

    await expect(selectedGroup(page)).toHaveText(group.name);
    expect(await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).toEqual(group);
  });

  test('deleting a group removes it from the dropdown and selects the first group', async ({ page }) => {
    const group = await su.createGroup('Delete UI');
    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    await manageGroupCard(page).locator('input[type=button][value="Delete Group"]').click();
    await clickModalButton(page, 'Yes');
    await waitForIdle(page);

    const remaining = await allGroupNames();
    expect(remaining).not.toContain(group.name);
    await expect(selectedGroup(page)).toHaveText(remaining[0]);
    expect(await multiselectOptions(groupSelect(page))).not.toContain(group.name);
  });
});
