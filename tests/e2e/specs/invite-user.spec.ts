import { test, expect, Page } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID, SUPERUSER, superUserStorageState, DEFAULT_PASSWORD } from '../helpers/env';
import {
  confirmPassword, fillField, groupEditor, memberRow, openGroupEditor, openGroupPermissions, saveButton, screenshot,
  toast, waitForIdle,
} from '../helpers/ui';
import { waitForMessageTo } from '../helpers/mailpit';

/**
 * Invite new users directly into groups (Manage Groups tab / GroupPermissions.inviteUserToGroups).
 */
test.describe('Invite user to groups', () => {
  let su: MatomoApi;
  let idSiteMarketing: number;
  let marketing: { idGroup: number; name: string };
  let sales: { idGroup: number; name: string };
  let empty: { idGroup: number; name: string };

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    idSiteMarketing = await su.createSite('Marketing Site');
    marketing = await su.createGroup('Marketing');
    sales = await su.createGroup('Sales');
    empty = await su.createGroup('No Access');
    await su.setGroupAccess(marketing.name, 'view', idSiteMarketing);
    await su.setGroupAccess(sales.name, 'write', 1);
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    const inviteUrl = '/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=groups#?groupView=invite';
    const form = (page: Page) => page.locator('.groupPermissionsInviteUser');
    const loginInput = (page: Page) => form(page).locator('input[name="groupPermissionsInviteLogin"]');
    const emailInput = (page: Page) => form(page).locator('input[name="groupPermissionsInviteEmail"]');
    const groupCheckbox = (page: Page, idGroup: number) => form(page).locator(`input[name="groupPermissionsInviteGroup${idGroup}"]`);
    /** Toggles a group checkbox by clicking its label (materialize hides the real checkbox). */
    const toggleGroup = async (page: Page, idGroup: number, checked: boolean) => {
      await form(page).locator('label', { has: page.locator(`input[name="groupPermissionsInviteGroup${idGroup}"]`) }).click();
      await (checked ? expect(groupCheckbox(page, idGroup)).toBeChecked() : expect(groupCheckbox(page, idGroup)).not.toBeChecked());
    };
    const inviteButton = (page: Page) => saveButton(form(page), 'groupPermissionsSendInvite');

    test('invites a user into two groups from the group list', async ({ page }) => {
      const login = `invited_ui_${RUN_ID}`;
      const email = `${login}@example.org`;

      await openGroupPermissions(page, 'groups');
      await page.locator('.groupPermissionsInviteUserButton').click();
      await expect(form(page).locator('.card-title')).toHaveText('Invite a new user to groups');
      await expect(inviteButton(page)).toBeDisabled();
      await screenshot(form(page), 'invite-user-empty');

      await fillField(loginInput(page), login);
      await fillField(emailInput(page), email);
      // still disabled: no group selected
      await expect(inviteButton(page)).toBeDisabled();

      // the checkboxes list all groups sorted by name
      const labels = (await form(page).locator('.groupPermissionsCheckboxList label > span').allInnerTexts()).map((t) => t.trim());
      const allGroups: string[] = (await su.call('GroupPermissions.getAllGroups', { filter_limit: -1 })).map((g: any) => g.name);
      expect(labels).toEqual([...allGroups].sort((a, b) => a.localeCompare(b)));

      await toggleGroup(page, marketing.idGroup, true);
      await toggleGroup(page, sales.idGroup, true);
      await expect(inviteButton(page)).toBeEnabled();
      await screenshot(form(page), 'invite-user-filled');

      await inviteButton(page).click();
      await page.locator('.confirm-password-modal.open input[type=password]').pressSequentially(SUPERUSER.password);
      await screenshot(page, 'invite-user-password-confirmation');
      await page.locator('.confirm-password-modal.open .modal-footer .modal-close.btn').click();

      await expect(toast(page, `The user '${login}' has been invited`).first()).toBeVisible();
      // back to the list, the member counts are updated
      await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
      await screenshot(page, 'invite-user-success');

      // backend state
      expect(await su.members(marketing.idGroup)).toContain(login);
      expect(await su.members(sales.idGroup)).toContain(login);
      expect(await su.members(empty.idGroup)).not.toContain(login);

      const user = await su.call('UsersManager.getUser', { userLogin: login });
      expect(user.email).toBe(email);
      // pending invites report the remaining days until the invite expires (default: 7), accepted users 'active'
      expect(user.invite_status).not.toBe('active');
      expect(Number(user.invite_status)).toBeGreaterThan(0);

      // no direct website access - permissions come from the groups only
      expect(await su.call('UsersManager.getSitesAccessFromUser', { userLogin: login })).toEqual([]);

      // invitation email names the website of the first selected group
      const mail = await waitForMessageTo(email);
      expect(mail.Subject).toMatch(/invit/i);
      expect(mail.HTML).toContain(`Marketing Site ${RUN_ID}`);
    });

    test('inviting from a group preselects it and returns to its member list', async ({ page }) => {
      const login = `invited_refresh_${RUN_ID}`;
      await openGroupEditor(page, marketing.idGroup);
      await expect(memberRow(page, login)).toHaveCount(0);

      await page.locator('.groupPermissionsInviteIntoGroup').click();
      await expect(groupCheckbox(page, marketing.idGroup)).toBeChecked();
      await expect(groupCheckbox(page, sales.idGroup)).not.toBeChecked();
      await fillField(loginInput(page), login);
      await fillField(emailInput(page), `${login}@example.org`);
      await inviteButton(page).click();
      await confirmPassword(page, SUPERUSER.password);

      await expect(groupEditor(page).locator('.card-title').first()).toHaveText(`Edit group '${marketing.name}'`);
      await expect(memberRow(page, login)).toBeVisible();
      await expect(memberRow(page, login).locator('td.status')).toHaveText('Pending');
      await screenshot(groupEditor(page), 'invite-user-member-list-refreshed');
    });

    test('the invite button needs a non-blank username, an email and a group', async ({ page }) => {
      await page.goto(inviteUrl);
      await toggleGroup(page, sales.idGroup, true);
      await fillField(loginInput(page), '   ');
      await fillField(emailInput(page), `blank_${RUN_ID}@example.org`);
      await expect(inviteButton(page)).toBeDisabled();
      await fillField(loginInput(page), `blank_${RUN_ID}`);
      await expect(inviteButton(page)).toBeEnabled();
      await fillField(emailInput(page), '  ');
      await expect(inviteButton(page)).toBeDisabled();
      await fillField(emailInput(page), `blank_${RUN_ID}@example.org`);
      await toggleGroup(page, sales.idGroup, false);
      await expect(inviteButton(page)).toBeDisabled();
    });

    test('warns when none of the selected groups has access to a website', async ({ page }) => {
      await page.goto(inviteUrl);
      const warning = form(page).locator('.notification', { hasText: 'None of the selected groups has access to a website' });
      await expect(form(page)).toBeVisible();
      await expect(warning).toHaveCount(0);

      await toggleGroup(page, empty.idGroup, true);
      await expect(warning).toBeVisible();
      await screenshot(form(page), 'invite-user-no-website-warning');

      // one group with website access is enough
      await toggleGroup(page, sales.idGroup, true);
      await expect(warning).toHaveCount(0);
      await toggleGroup(page, sales.idGroup, false);
      await expect(warning).toBeVisible();
      await toggleGroup(page, empty.idGroup, false);
      await expect(warning).toHaveCount(0);
    });

    test('cancelling or a wrong password does not invite anybody', async ({ page }) => {
      const login = `invited_cancel_${RUN_ID}`;
      await page.goto(inviteUrl);
      await fillField(loginInput(page), login);
      await fillField(emailInput(page), `${login}@example.org`);
      await toggleGroup(page, sales.idGroup, true);

      await inviteButton(page).click();
      const modal = page.locator('.confirm-password-modal.open');
      await expect(modal).toBeVisible();
      await modal.locator('.modal-footer .modal-no').click();
      await expect(modal).toBeHidden();
      await waitForIdle(page);
      expect(await su.call('UsersManager.userExists', { userLogin: login })).toEqual({ value: false });

      await inviteButton(page).click();
      await confirmPassword(page, 'wrongPassword1!');
      await expect(page.locator('#ajaxErrorInviteUser')).toContainText(/password/i);
      expect(await su.call('UsersManager.userExists', { userLogin: login })).toEqual({ value: false });
      expect(await su.members(sales.idGroup)).not.toContain(login);
      // the form keeps its values for a retry
      await expect(loginInput(page)).toHaveValue(login);
    });

    test('cancel returns to the group list', async ({ page }) => {
      await page.goto(inviteUrl);
      await form(page).locator('.entityCancelLink').click();
      await expect(page.locator('.groupPermissionsGroupsTable')).toBeVisible();
    });

    test('shows the error of a failed invitation', async ({ page }) => {
      const existing = await su.createUser('existing_invite');

      await page.goto(inviteUrl);
      await fillField(loginInput(page), existing);
      await fillField(emailInput(page), `other_${RUN_ID}@example.org`);
      await toggleGroup(page, sales.idGroup, true);
      await inviteButton(page).click();
      await confirmPassword(page, SUPERUSER.password);

      await expect(page.locator('#ajaxErrorInviteUser')).toContainText(/already exists|already in use/i);
      await screenshot(form(page), 'invite-user-error');
      expect(await su.members(sales.idGroup)).not.toContain(existing);
    });
  });

  test.describe('API', () => {
    test('invited user is added to all groups without direct site access', async () => {
      const login = `invited_api_${RUN_ID}`;
      await su.call('GroupPermissions.inviteUserToGroups', {
        userLogin: login,
        email: `${login}@example.org`,
        idGroups: `${marketing.idGroup},${sales.idGroup}`,
        passwordConfirmation: SUPERUSER.password,
      });

      expect(await su.members(marketing.idGroup)).toContain(login);
      expect(await su.members(sales.idGroup)).toContain(login);
      expect(await su.call('UsersManager.getSitesAccessFromUser', { userLogin: login })).toEqual([]);
    });

    test('accepts an array of group ids and ignores duplicates', async () => {
      const login = `invited_array_${RUN_ID}`;
      await su.call('GroupPermissions.inviteUserToGroups', {
        userLogin: login,
        email: `${login}@example.org`,
        idGroups: [sales.idGroup, sales.idGroup],
        passwordConfirmation: SUPERUSER.password,
      });
      expect((await su.members(sales.idGroup)).filter((l) => l === login)).toHaveLength(1);
    });

    test('falls back to the first website if the groups have no access and removes that access again', async () => {
      const login = `invited_noaccess_${RUN_ID}`;
      const email = `${login}@example.org`;
      await su.call('GroupPermissions.inviteUserToGroups', {
        userLogin: login,
        email,
        idGroups: String(empty.idGroup),
        passwordConfirmation: SUPERUSER.password,
      });
      expect(await su.members(empty.idGroup)).toEqual([login]);
      expect(await su.call('UsersManager.getSitesAccessFromUser', { userLogin: login })).toEqual([]);
      const mail = await waitForMessageTo(email);
      expect(mail.HTML).toContain('Site One');
    });

    test('rejects invalid input', async () => {
      const base = { userLogin: `invalid_${RUN_ID}`, email: `invalid_${RUN_ID}@example.org`, passwordConfirmation: SUPERUSER.password };
      expect(await su.expectError('GroupPermissions.inviteUserToGroups', { ...base, idGroups: ',' }))
        .toMatch(/Invalid group ID/);
      expect(await su.expectError('GroupPermissions.inviteUserToGroups', { ...base, idGroups: '' }))
        .toMatch(/select at least one group|specify a value for 'idGroups'/);
      expect(await su.expectError('GroupPermissions.inviteUserToGroups', { ...base, idGroups: 'abc' }))
        .toMatch(/Invalid group ID/);
      expect(await su.expectError('GroupPermissions.inviteUserToGroups', { ...base, idGroups: '0' }))
        .toMatch(/Invalid group ID/);
      expect(await su.expectError('GroupPermissions.inviteUserToGroups', { ...base, idGroups: '999999' }))
        .toMatch(/Group does not exist/);
      // nothing was created
      expect(await su.call('UsersManager.userExists', { userLogin: base.userLogin })).toEqual({ value: false });
    });

    test('a failing invite (duplicate email) does not add anyone to the group', async () => {
      const existing = await su.createUser('dupe_email');
      const message = await su.expectError('GroupPermissions.inviteUserToGroups', {
        userLogin: `dupe_target_${RUN_ID}`,
        email: `${existing}@example.org`,
        idGroups: String(sales.idGroup),
        passwordConfirmation: SUPERUSER.password,
      });
      expect(message).toMatch(/already|in use/i);
      expect(await su.members(sales.idGroup)).not.toContain(`dupe_target_${RUN_ID}`);
    });

    test('the invited user accepts the invitation and sees exactly the websites of the groups', async ({ page }) => {
      const login = `invited_accept_${RUN_ID}`;
      const email = `${login}@example.org`;
      const password = 'acceptedPass1!';
      await su.call('GroupPermissions.inviteUserToGroups', {
        userLogin: login,
        email,
        idGroups: `${marketing.idGroup},${sales.idGroup}`,
        passwordConfirmation: SUPERUSER.password,
      });

      // the link in the email points to Matomo's configured URL, use only its token
      const mail = await waitForMessageTo(email);
      const token = /action=acceptInvitation&(?:amp;)?token=([A-Za-z0-9]+)/.exec(mail.HTML)?.[1];
      expect(token, 'invitation token in email').toBeTruthy();

      await page.goto(`/index.php?module=Login&action=acceptInvitation&token=${token}`);
      await expect(page.locator('#email')).toHaveValue(email);
      await page.locator('#password').fill(password);
      await page.locator('#password_confirm').fill(password);
      if (await page.locator('#conditionCheck').count()) {
        await page.locator('#conditionCheck').check({ force: true });
      }
      await screenshot(page, 'invite-user-accept-invitation');
      await page.locator('#login_form_submit').click();
      await page.waitForURL((url) => url.searchParams.get('action') !== 'acceptInvitation');

      const user = await su.call('UsersManager.getUser', { userLogin: login });
      expect(user.invite_status).toBe('active');

      const member = await MatomoApi.forUser(login, password);
      const ids = (await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number).sort();
      expect(ids).toEqual([1, idSiteMarketing].sort()); // sales: write on site 1, marketing: view on its site
      expect((await member.call('SitesManager.getSitesIdWithAdminAccess')).map(Number)).toEqual([]);
      // still no direct access, everything comes from the groups
      expect(await su.call('UsersManager.getSitesAccessFromUser', { userLogin: login })).toEqual([]);
    });

    test('passes expiryInDays on to the invitation', async () => {
      const login = `invited_expiry_${RUN_ID}`;
      await su.call('GroupPermissions.inviteUserToGroups', {
        userLogin: login,
        email: `${login}@example.org`,
        idGroups: String(sales.idGroup),
        expiryInDays: 2,
        passwordConfirmation: SUPERUSER.password,
      });
      const user = await su.call('UsersManager.getUser', { userLogin: login });
      expect(Number(user.invite_status)).toBeLessThanOrEqual(2);
      expect(Number(user.invite_status)).toBeGreaterThan(0);
    });

    test('an invalid email is rejected and nobody is added to the group', async () => {
      const login = `invited_bad_email_${RUN_ID}`;
      const message = await su.expectError('GroupPermissions.inviteUserToGroups', {
        userLogin: login,
        email: 'not-an-email',
        idGroups: String(sales.idGroup),
        passwordConfirmation: SUPERUSER.password,
      });
      expect(message).toMatch(/email/i);
      expect(await su.members(sales.idGroup)).not.toContain(login);
      expect(await su.call('UsersManager.userExists', { userLogin: login })).toEqual({ value: false });
    });

    test('group members see exactly the websites of their groups', async () => {
      // invited users cannot authenticate before accepting, so verify the group based Access override with a regular user
      const login = await su.createUser('member_access');
      await su.addMembers(marketing.idGroup, [login]);
      const member = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
      const ids = (await member.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number);
      expect(ids).toContain(idSiteMarketing);
      expect(ids).not.toContain(1);
    });
  });
});
