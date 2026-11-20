import { test, expect, Page } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID, SUPERUSER, superUserStorageState } from '../helpers/env';
import {
  chooseOption, clickModalButton, expectAccess, fillField, groupEditor, groupListNames, groupRow, memberLogins,
  memberRow, multiselectOptions, multiselectPick, openGroupEditor, openGroupPermissions, roleSelect, saveButton,
  screenshot, switchEditorTab, toast, waitForIdle, websiteRow,
} from '../helpers/ui';

/**
 * The "Manage Groups" tab: group list, creating groups and the group editor (members, website access, settings).
 * (Inviting users is covered by invite-user.spec.ts.)
 */
test.describe('Manage Groups tab', () => {
  test.use({ storageState: superUserStorageState });

  let su: MatomoApi;

  const allGroupNames = async (): Promise<string[]> =>
    (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 }))
      .map((g: { name: string }) => g.name)
      .sort((x: string, y: string) => x.localeCompare(y));
  const menuCount = (page: Page, tab: string) =>
    groupEditor(page).locator(`.listCircle li[data-tab="${tab}"] .groupPermissionsCount`);
  const editorTitle = (page: Page) => groupEditor(page).locator('.card-title').first();

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  // ---- navigation ----

  test('an unknown tab falls back to Manage Access', async ({ page }) => {
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=foo');
    await expect(page.locator('.groupPermissionsTabs li.active')).toHaveText('Manage Access');
    await expect(page.getByText('Decide which groups have access to your websites.')).toBeVisible();
  });

  // ---- group list ----

  test('lists all groups sorted with member and website counts', async ({ page }) => {
    const group = await su.createGroup('Counted');
    await su.addMembers(group.idGroup, [await su.createUser('counted_a'), await su.createUser('counted_b')]);
    await su.setGroupAccess(group.name, 'view', `1,${await su.createSite('Counted Site')}`);

    await openGroupPermissions(page, 'groups');
    await expect(page.locator('.groupPermissionsTabs li.active')).toHaveText('Manage Groups');
    await expect(page.getByText('Create groups, add users to them and give the groups access to websites.')).toBeVisible();
    await expect(page.locator('.groupPermissionsGroupsTable thead th')).toHaveText(['Group', 'Members', 'Websites', 'Actions']);

    expect(await groupListNames(page)).toEqual(await allGroupNames());
    const row = groupRow(page, group.name);
    await expect(row.locator('td.groupMembers')).toHaveText('2');
    await expect(row.locator('td.groupWebsites')).toHaveText('2');
  });

  test('the search filters the list', async ({ page }) => {
    const needle = await su.createGroup('Searchable');
    await openGroupPermissions(page, 'groups');
    const search = page.locator('.groupPermissionsSearch input');
    await fillField(search, needle.name.toUpperCase());
    expect(await groupListNames(page)).toEqual([needle.name]);
    await fillField(search, 'no group has this name');
    await expect(page.locator('.groupPermissionsGroupsTable tr.groupPermissionsEmpty')).toHaveText('No groups match your search.');
  });

  test('without groups an empty state is shown and inviting is disabled', async ({ page }) => {
    await page.route(/method=GroupPermissions\.getGroupsOverview/, (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' }));
    await openGroupPermissions(page, 'groups');
    await expect(page.locator('.groupPermissionsGroupsTable tr.groupPermissionsEmpty')).toContainText('There are no groups yet.');
    await expect(page.locator('.groupPermissionsInviteUserButton')).toHaveClass(/disabled/);
    await expect(page.locator('.groupPermissionsSearch')).toHaveCount(0);
    await screenshot(page, 'manage-groups-no-groups');
  });

  test('a group is opened by its name or the edit icon, the editor is kept in the URL', async ({ page }) => {
    const group = await su.createGroup('Open me');
    await openGroupPermissions(page, 'groups');

    await groupRow(page, group.name).locator('td.groupName a').click();
    await expect(editorTitle(page)).toHaveText(`Edit group '${group.name}'`);
    await expect.poll(() => page.url()).toContain(`idGroup=${group.idGroup}`);

    // reload keeps the editor
    await page.reload();
    await expect(editorTitle(page)).toHaveText(`Edit group '${group.name}'`);

    // back link returns to the list
    await groupEditor(page).locator('.groupPermissionsBackToGroups').click();
    await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
    expect(page.url()).not.toContain('idGroup=');

    // edit icon, then the browser's back button
    await groupRow(page, group.name).locator('button.edit-group').click();
    await expect(editorTitle(page)).toHaveText(`Edit group '${group.name}'`);
    await page.goBack();
    await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
  });

  test('an unknown group in the URL shows an error and the list', async ({ page }) => {
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=groups#?idGroup=999999');
    await expect(toast(page, 'Group does not exist').first()).toBeVisible();
    await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
  });

  test('the old ?idGroup= query parameter still opens the editor', async ({ page }) => {
    const group = await su.createGroup('Query param');
    await openGroupPermissions(page, 'groups', `&idGroup=${group.idGroup}`);
    await expect(editorTitle(page)).toHaveText(`Edit group '${group.name}'`);
  });

  test('deletes a group from the list after confirmation', async ({ page }) => {
    const group = await su.createGroup('Delete from list');
    await openGroupPermissions(page, 'groups');
    const row = groupRow(page, group.name);

    await row.locator('button.delete-group').click();
    await expect(page.locator('.modal.open')).toContainText(`Are you sure you want to delete the group '${group.name}'?`);
    await expect(page.locator('.modal.open')).toContainText('The users themselves are not deleted.');
    await screenshot(page, 'delete-group-confirmation');
    await clickModalButton(page, 'No');
    await expect(row).toBeVisible();

    await row.locator('button.delete-group').click();
    await clickModalButton(page, 'Yes');
    await expect(toast(page, `The group '${group.name}' has been deleted.`).first()).toBeVisible();
    await expect(row).toHaveCount(0);
    expect(await allGroupNames()).not.toContain(group.name);
  });

  // ---- create ----

  test('creates a group and opens it', async ({ page }) => {
    const name = `Created UI ${RUN_ID}`;
    await openGroupPermissions(page, 'groups');
    await page.locator('.groupPermissionsCreateGroup').click();

    const form = page.locator('.groupPermissionsCreateGroupForm');
    await expect(form.locator('.card-title')).toHaveText('Create a new group');
    const button = saveButton(form, 'groupPermissionsSaveNewGroup');
    await expect(button).toBeDisabled();
    await fillField(form.locator('input[name="groupPermissionsNewGroupName"]'), '   ');
    await expect(button).toBeDisabled();
    await fillField(form.locator('input[name="groupPermissionsNewGroupName"]'), name);
    await expect(button).toBeEnabled();
    await screenshot(page, 'create-group');
    await button.click();

    await expect(toast(page, `The group '${name}' has been created.`).first()).toBeVisible();
    await expect(editorTitle(page)).toHaveText(`Edit group '${name}'`);
    await expect(groupEditor(page).locator('.listCircle li.active')).toHaveAttribute('data-tab', 'members');
    await expect(page.locator('tr.groupPermissionsMemberRow')).toHaveCount(0);
    await expect(page.locator('.groupPermissionsMembersTable tr.groupPermissionsEmpty')).toHaveText('This group has no members yet.');
    expect(await allGroupNames()).toContain(name);

    await groupEditor(page).locator('.groupPermissionsBackToGroups').click();
    // the list is loaded after switching back
    await expect.poll(() => groupListNames(page)).toContain(name);
  });

  test('creating a group with an existing or too long name shows an error', async ({ page }) => {
    const group = await su.createGroup('Duplicate UI');
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=groups#?groupView=create');
    const form = page.locator('.groupPermissionsCreateGroupForm');
    const input = form.locator('input[name="groupPermissionsNewGroupName"]');

    await fillField(input, group.name);
    await saveButton(form, 'groupPermissionsSaveNewGroup').click();
    await expect(page.locator('#ajaxErrorCreateGroup')).toContainText('Group already exists');
    await screenshot(form, 'create-group-duplicate-error');

    // the input allows at most 64 characters, but special characters are stored escaped (13 quotes = 78 characters)
    await fillField(input, '"'.repeat(13));
    await saveButton(form, 'groupPermissionsSaveNewGroup').click();
    await expect(page.locator('#ajaxErrorCreateGroup')).toContainText('The group name is too long');
  });

  test('typing a name and pressing Enter right away creates the group with the full name', async ({ page }) => {
    const name = `Typed fast ${RUN_ID}`;
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=groups#?groupView=create');
    const input = page.locator('input[name="groupPermissionsNewGroupName"]');
    await expect(input).toBeFocused(); // autofocus
    await input.pressSequentially(name, { delay: 0 });
    await input.press('Enter');
    await expect(groupEditor(page).locator('.card-title').first()).toHaveText(`Edit group '${name}'`);
    expect(await allGroupNames()).toContain(name);
  });

  test('cancelling the create form returns to the list', async ({ page }) => {
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=groups#?groupView=create');
    await page.locator('.groupPermissionsCreateGroupForm .entityCancelLink').click();
    await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
  });

  // ---- members ----

  test('members: shows login, email and invitation status sorted by login', async ({ page }) => {
    const group = await su.createGroup('Member list');
    const [zed, amy] = [await su.createUser('mlist_zed'), await su.createUser('mlist_amy')];
    await su.addMembers(group.idGroup, [zed, amy]);
    const invited = `mlist_invited_${RUN_ID}`;
    await su.call('GroupPermissions.inviteUserToGroups', {
      userLogin: invited, email: `${invited}@example.org`, idGroups: String(group.idGroup), passwordConfirmation: SUPERUSER.password,
    });

    await openGroupEditor(page, group.idGroup);
    expect(await memberLogins(page)).toEqual([amy, invited, zed].sort((a, b) => a.localeCompare(b)));
    await expect(memberRow(page, amy).locator('td.email')).toHaveText(`${amy}@example.org`);
    await expect(memberRow(page, amy).locator('td.status')).toHaveText('Active');
    await expect(memberRow(page, invited).locator('td.status')).toHaveText('Pending');
    await expect(menuCount(page, 'members')).toHaveText('3');
    await screenshot(page, 'group-members');
  });

  test('members: the user picker lists all other users with email and adds the selected one', async ({ page }) => {
    const group = await su.createGroup('Add member');
    const [zed, amy] = [await su.createUser('add_zed'), await su.createUser('add_amy')];
    await su.addMembers(group.idGroup, [zed]);

    await openGroupEditor(page, group.idGroup);
    const picker = page.locator('.groupPermissionsUserSelect');
    const button = saveButton(page.locator('.groupPermissionsAddMember'), 'groupPermissionsAddMemberButton');
    await expect(button).toBeDisabled();

    const options = await multiselectOptions(picker);
    const users: string[] = await su.call('UsersManager.getUsersLogin', { filter_limit: -1 });
    const expected = users.filter((u) => u !== 'anonymous' && u !== zed).sort((a, b) => a.localeCompare(b));
    expect(options.map((o) => o.replace(/ \(.*\)$/, ''))).toEqual(expected);
    expect(options).toContain(`${amy} (${amy}@example.org)`);

    await multiselectPick(picker, amy);
    await expect(button).toBeEnabled();
    await button.click();
    await expect(toast(page, `'${amy}' has been added to the group.`).first()).toBeVisible();
    expect(await memberLogins(page)).toEqual([amy, zed]);
    await expect(menuCount(page, 'members')).toHaveText('2');
    await expect(button).toBeDisabled();
    expect(await su.members(group.idGroup)).toEqual([amy, zed]);
    // the new member is no longer offered
    expect(await multiselectOptions(picker)).not.toContain(`${amy} (${amy}@example.org)`);
  });

  test('members: removes a member after confirmation', async ({ page }) => {
    const group = await su.createGroup('Remove UI');
    const [keep, remove] = [await su.createUser('ui_keep'), await su.createUser('ui_remove')];
    await su.addMembers(group.idGroup, [keep, remove]);

    await openGroupEditor(page, group.idGroup);
    const row = memberRow(page, remove);
    await row.locator('button.groupPermissionsRemoveMember').click();
    await expect(page.locator('.modal.open')).toContainText(`Are you sure you want to remove user '${remove}' from group '${group.name}'?`);
    await screenshot(page, 'remove-member-confirmation');
    await clickModalButton(page, 'No');
    await expect(row).toBeVisible();

    await row.locator('button.groupPermissionsRemoveMember').click();
    await clickModalButton(page, 'Yes');
    await expect(toast(page, `'${remove}' has been removed from the group.`).first()).toBeVisible();
    await expect(row).toHaveCount(0);
    await expect(menuCount(page, 'members')).toHaveText('1');
    expect(await su.members(group.idGroup)).toEqual([keep]);
  });

  test('members: removing a member that no longer exists shows an error', async ({ page }) => {
    const group = await su.createGroup('Remove error');
    const login = await su.createUser('remove_gone');
    await su.addMembers(group.idGroup, [login]);

    await openGroupEditor(page, group.idGroup);
    await su.deleteUser(login);
    await memberRow(page, login).locator('button.groupPermissionsRemoveMember').click();
    await clickModalButton(page, 'Yes');
    await expect(page.locator('#ajaxErrorManageGroupMembers')).toContainText(/doesn't exist/);
  });

  test('members: "Invite a new user into this group" preselects the group and returns to it', async ({ page }) => {
    const group = await su.createGroup('Invite from group');
    await openGroupEditor(page, group.idGroup);
    await page.locator('.groupPermissionsInviteIntoGroup').click();

    const form = page.locator('.groupPermissionsInviteUser');
    await expect(form.locator(`input[name="groupPermissionsInviteGroup${group.idGroup}"]`)).toBeChecked();
    await form.locator('.entityCancelLink').click();
    await expect(editorTitle(page)).toHaveText(`Edit group '${group.name}'`);
  });

  // ---- website access ----

  test('website access: lists, gives, changes and removes access', async ({ page }) => {
    const group = await su.createGroup('Site access');
    const existing = await su.createSite('Existing Access');
    const added = await su.createSite('Added Access');
    const existingName = (await su.call('SitesManager.getSiteFromId', { idSite: existing })).name;
    const addedName = (await su.call('SitesManager.getSiteFromId', { idSite: added })).name;
    await su.setGroupAccess(group.name, 'write', existing);

    await openGroupEditor(page, group.idGroup, 'access');
    await expect(menuCount(page, 'access')).toHaveText('1');
    await expectAccess(websiteRow(page, existingName), 'write');

    // give access
    const form = page.locator('.groupPermissionsGiveAccess');
    const button = saveButton(form, 'groupPermissionsGiveAccessButton');
    const selector = form.locator('.siteSelector');
    await selector.locator('.title').click();
    const search = selector.locator('input.websiteSearch');
    if (await search.isVisible()) await search.fill(addedName);
    await selector.locator('.custom_select_ul_list li a', { hasText: addedName }).first().click();
    await chooseOption(form.locator('.groupPermissionsRoleField'), 'Admin');
    await button.click();
    await expect(toast(page, `The group '${group.name}' now has the role 'Admin' for '${addedName}'.`).first()).toBeVisible();
    await expectAccess(websiteRow(page, addedName), 'admin');
    await expect(menuCount(page, 'access')).toHaveText('2');
    await screenshot(page, 'group-website-access');

    // change inline
    await chooseOption(websiteRow(page, existingName), 'View');
    await waitForIdle(page);
    await expect.poll(async () => (await su.groupAccess(existing))[group.name]).toBe('view');

    // remove after confirmation
    await websiteRow(page, addedName).locator('button.groupPermissionsRemoveAccess').click();
    await expect(page.locator('.modal.open')).toContainText(`remove the access of the group '${group.name}' to '${addedName}'?`);
    await clickModalButton(page, 'No');
    await expect(websiteRow(page, addedName)).toBeVisible();
    await websiteRow(page, addedName).locator('button.groupPermissionsRemoveAccess').click();
    await clickModalButton(page, 'Yes');
    await expect(websiteRow(page, addedName)).toHaveCount(0);
    await expect(menuCount(page, 'access')).toHaveText('1');
    expect((await su.groupAccess(added))[group.name]).toBe('noaccess');

    // the row order follows the website names
    const sites = await su.call('GroupPermissions.getSitesAccessFromGroup', { idGroup: group.idGroup });
    expect(sites).toEqual([{ idSite: existing, name: existingName, access: 'view', capabilities: [] }]);
  });

  test('website access: "Apply to all websites" asks for confirmation', async ({ page }) => {
    const group = await su.createGroup('Site access all');
    await openGroupEditor(page, group.idGroup, 'access');
    await expect(page.locator('.groupPermissionsWebsitesTable tr.groupPermissionsEmpty')).toHaveText('This group has no access to any website yet.');

    const form = page.locator('.groupPermissionsGiveAccess');
    await form.locator('.siteSelector .title').click();
    await form.locator('.siteSelector').getByText('Apply to all websites').click();
    await saveButton(form, 'groupPermissionsGiveAccessButton').click();
    await expect(page.locator('.modal.open')).toContainText(`give 'View' access to the group '${group.name}' for all the websites?`);
    await clickModalButton(page, 'Yes');
    await waitForIdle(page);

    const allSites: number[] = (await su.call('SitesManager.getAllSitesId', { filter_limit: -1 })).map(Number);
    await expect(menuCount(page, 'access')).toHaveText(String(allSites.length));
    for (const idSite of allSites) {
      expect((await su.groupAccess(idSite))[group.name]).toBe('view');
    }
  });

  test('website access: the role help explains the roles', async ({ page }) => {
    const group = await su.createGroup('Role help');
    await openGroupEditor(page, group.idGroup, 'access');
    await page.locator('.groupPermissionsWebsitesTable .groupPermissionsRolesHelpToggle').click();
    await expect(page.locator('.groupPermissionsWebsitesTable tr.groupPermissionsRolesHelp')).toContainText('Admin:');
  });

  // ---- settings ----

  test('settings: renames the group', async ({ page }) => {
    const group = await su.createGroup('Rename me');
    const other = await su.createGroup('Rename other');
    const newName = `Renamed in settings ${RUN_ID}`;
    await openGroupEditor(page, group.idGroup, 'settings');

    const input = page.locator('input[name="groupPermissionsGroupName"]');
    const button = saveButton(page.locator('.groupPermissionsRenameGroup'), 'groupPermissionsRenameGroupButton');
    await expect(input).toHaveValue(group.name);
    await expect(button).toBeDisabled(); // unchanged
    await fillField(input, '  ');
    await expect(button).toBeDisabled();

    // existing name
    await fillField(input, other.name);
    await button.click();
    await expect(page.locator('#ajaxErrorRenameGroup')).toContainText('Group already exists');

    await fillField(input, newName);
    await button.click();
    await expect(toast(page, `The group has been renamed to '${newName}'.`).first()).toBeVisible();
    await expect(editorTitle(page)).toHaveText(`Edit group '${newName}'`);
    expect(await su.call('GroupPermissions.getGroupWithId', { idGroup: group.idGroup })).toEqual({ idGroup: group.idGroup, name: newName });
    await screenshot(page, 'group-settings');

    await groupEditor(page).locator('.groupPermissionsBackToGroups').click();
    // the list is loaded after switching back
    await expect.poll(() => groupListNames(page)).toContain(newName);
  });

  test('settings: deletes the group after confirmation', async ({ page }) => {
    const group = await su.createGroup('Delete in editor');
    await openGroupEditor(page, group.idGroup);
    await switchEditorTab(page, 'settings');
    await expect(page.locator('.groupPermissionsDeleteGroup')).toContainText('The users themselves are not deleted.');

    await page.locator('.groupPermissionsDeleteGroupButton').click();
    await clickModalButton(page, 'No');
    await expect(editorTitle(page)).toBeVisible();

    await page.locator('.groupPermissionsDeleteGroupButton').click();
    await clickModalButton(page, 'Yes');
    await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
    await expect(groupRow(page, group.name)).toHaveCount(0);
    expect(await allGroupNames()).not.toContain(group.name);
  });

  test('the editor tabs switch between members, website access and settings', async ({ page }) => {
    const group = await su.createGroup('Tabs');
    await openGroupEditor(page, group.idGroup);
    await expect(page.locator('.groupPermissionsMembers')).toBeVisible();
    await switchEditorTab(page, 'access');
    await expect(page.locator('.groupPermissionsWebsiteAccess')).toBeVisible();
    await expect.poll(() => page.url()).toContain('groupTab=access');
    await switchEditorTab(page, 'settings');
    await expect(page.locator('.groupPermissionsGroupSettings')).toBeVisible();
    await page.reload();
    await expect(page.locator('.groupPermissionsGroupSettings')).toBeVisible();
    await switchEditorTab(page, 'members');
    await expect(roleSelect(page.locator('.groupPermissionsMembers'))).toHaveCount(0);
  });
});
