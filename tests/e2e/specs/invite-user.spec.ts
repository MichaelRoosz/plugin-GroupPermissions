import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID, SUPERUSER, superUserStorageState, DEFAULT_PASSWORD } from '../helpers/env';
import {
  openGroupPermissions, screenshot, multiselectPick, multiselectClose, multiselectOptions, confirmPassword, clickModalButton, waitForIdle,
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

    test('invites a user into two groups via the Manage Groups tab', async ({ page }) => {
      const login = `invited_ui_${RUN_ID}`;
      const email = `${login}@example.org`;

      await openGroupPermissions(page, 'groups');
      const card = page.locator('.card', { has: page.locator('.groupPermissionsInviteUser') });
      await expect(card.locator('h2')).toHaveText('Invite a new user to groups');

      const inviteButton = card.locator('input[type=button][value="Invite User"]');
      await expect(inviteButton).toBeDisabled();
      await screenshot(card, 'invite-user-empty');

      await card.locator('label', { hasText: 'Username' }).locator('input').fill(login);
      await card.locator('label', { hasText: 'Email' }).locator('input').fill(email);
      // still disabled: no group selected
      await expect(inviteButton).toBeDisabled();

      const groupSelect = card.locator('.multiselect');
      await multiselectPick(groupSelect, marketing.name);
      await multiselectPick(groupSelect, sales.name);
      await multiselectClose(groupSelect);
      await expect(groupSelect.locator('.multiselect__tag')).toHaveCount(2);
      await expect(inviteButton).toBeEnabled();
      await screenshot(card, 'invite-user-filled');

      await inviteButton.click();
      await page.locator('.confirm-password-modal.open input[type=password]').pressSequentially(SUPERUSER.password);
      await screenshot(page, 'invite-user-password-confirmation');
      await page.locator('.confirm-password-modal.open .modal-footer .modal-close.btn').click();

      const toast = page.locator('.notification', { hasText: `The user '${login}' has been invited` });
      await expect(toast).toBeVisible();
      await screenshot(page, 'invite-user-success');

      // the form is reset
      await expect(card.locator('label', { hasText: 'Username' }).locator('input')).toHaveValue('');
      await expect(inviteButton).toBeDisabled();

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

    test('member list of the selected group is refreshed after inviting', async ({ page }) => {
      const login = `invited_refresh_${RUN_ID}`;

      await openGroupPermissions(page, 'groups', `&idGroup=${marketing.idGroup}`);
      const manageCard = page.locator('.card', { hasText: 'Manage group members' });
      await expect(manageCard.locator('td.login', { hasText: login })).toHaveCount(0);

      const card = page.locator('.card', { has: page.locator('.groupPermissionsInviteUser') });
      await card.locator('label', { hasText: 'Username' }).locator('input').fill(login);
      await card.locator('label', { hasText: 'Email' }).locator('input').fill(`${login}@example.org`);
      await multiselectPick(card.locator('.multiselect'), marketing.name);
      await multiselectClose(card.locator('.multiselect'));
      await card.locator('input[type=button][value="Invite User"]').click();

      await confirmPassword(page, SUPERUSER.password);

      await expect(manageCard.locator('td.login', { hasText: login })).toBeVisible();
      await waitForIdle(page);
      await screenshot(manageCard, 'invite-user-member-list-refreshed');
    });

    test('the invite button needs a non-blank username, an email and a group', async ({ page }) => {
      await openGroupPermissions(page, 'groups');
      const card = page.locator('.card', { has: page.locator('.groupPermissionsInviteUser') });
      const button = card.locator('input[type=button][value="Invite User"]');
      const userInput = card.locator('label', { hasText: 'Username' }).locator('input');
      const emailInput = card.locator('label', { hasText: 'Email' }).locator('input');

      await multiselectPick(card.locator('.multiselect'), sales.name);
      await multiselectClose(card.locator('.multiselect'));
      await userInput.fill('   ');
      await emailInput.fill(`blank_${RUN_ID}@example.org`);
      await expect(button).toBeDisabled();
      await userInput.fill(`blank_${RUN_ID}`);
      await expect(button).toBeEnabled();
      await emailInput.fill('  ');
      await expect(button).toBeDisabled();
    });

    test('cancelling or a wrong password does not invite anybody', async ({ page }) => {
      const login = `invited_cancel_${RUN_ID}`;
      await openGroupPermissions(page, 'groups');
      const card = page.locator('.card', { has: page.locator('.groupPermissionsInviteUser') });
      await card.locator('label', { hasText: 'Username' }).locator('input').fill(login);
      await card.locator('label', { hasText: 'Email' }).locator('input').fill(`${login}@example.org`);
      await multiselectPick(card.locator('.multiselect'), sales.name);
      await multiselectClose(card.locator('.multiselect'));

      await card.locator('input[type=button][value="Invite User"]').click();
      const modal = page.locator('.confirm-password-modal.open');
      await expect(modal).toBeVisible();
      await modal.locator('.modal-footer .modal-no').click();
      await expect(modal).toBeHidden();
      await waitForIdle(page);
      expect(await su.call('UsersManager.userExists', { userLogin: login })).toEqual({ value: false });

      await card.locator('input[type=button][value="Invite User"]').click();
      await confirmPassword(page, 'wrongPassword1!');
      await expect(page.locator('#ajaxErrorInviteUser')).toContainText(/password/i);
      expect(await su.call('UsersManager.userExists', { userLogin: login })).toEqual({ value: false });
      expect(await su.members(sales.idGroup)).not.toContain(login);
      // the form keeps its values for a retry
      await expect(card.locator('label', { hasText: 'Username' }).locator('input')).toHaveValue(login);
    });

    test('the group list of the invite form follows created, renamed and deleted groups', async ({ page }) => {
      await openGroupPermissions(page, 'groups');
      const card = page.locator('.card', { has: page.locator('.groupPermissionsInviteUser') });
      const inviteGroups = card.locator('.multiselect');

      // created
      const created = `Invite list ${RUN_ID}`;
      const createCard = page.locator('.card', { hasText: 'Create a new group' });
      await createCard.locator('input[type=text]').fill(created);
      await createCard.locator('input[type=button]').click();
      await expect(page.locator('.card', { has: page.locator('h2', { hasText: /^Manage group$/ }) }).locator('.multiselect__single')).toHaveText(created);
      expect(await multiselectOptions(inviteGroups)).toContain(created);

      // selected in the invite form, then renamed
      await multiselectPick(inviteGroups, created);
      await multiselectClose(inviteGroups);
      const renamed = `${created} renamed`;
      const manage = page.locator('.card', { has: page.locator('h2', { hasText: /^Manage group$/ }) });
      await manage.locator('h3', { hasText: 'Rename this group' }).locator('xpath=following-sibling::div[1]').locator('input[type=text]').fill(renamed);
      await manage.locator('input[type=button][value="Rename Group"]').click();
      await clickModalButton(page, 'Yes');
      await expect(manage.locator('.multiselect__single')).toHaveText(renamed);
      expect(await multiselectOptions(inviteGroups)).toContain(renamed);

      // deleted: also removed from the selection of the invite form
      await manage.locator('input[type=button][value="Delete Group"]').click();
      await clickModalButton(page, 'Yes');
      await waitForIdle(page);
      expect(await multiselectOptions(inviteGroups)).not.toContain(renamed);
      await expect(inviteGroups.locator('.multiselect__tag')).toHaveCount(0);
      await expect(card.locator('input[type=button][value="Invite User"]')).toBeDisabled();
    });

    test('shows the error of a failed invitation', async ({ page }) => {
      const existing = await su.createUser('existing_invite');

      await openGroupPermissions(page, 'groups');
      const card = page.locator('.card', { has: page.locator('.groupPermissionsInviteUser') });
      await card.locator('label', { hasText: 'Username' }).locator('input').fill(existing);
      await card.locator('label', { hasText: 'Email' }).locator('input').fill(`other_${RUN_ID}@example.org`);
      await multiselectPick(card.locator('.multiselect'), sales.name);
      await multiselectClose(card.locator('.multiselect'));
      await card.locator('input[type=button][value="Invite User"]').click();

      await confirmPassword(page, SUPERUSER.password);

      await expect(page.locator('#ajaxErrorInviteUser')).toContainText(/already exists|already in use/i);
      await screenshot(card, 'invite-user-error');
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
