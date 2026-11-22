import { test, expect, Browser, Page } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { RUN_ID, SUPERUSER, superUserStorageState } from '../helpers/env';
import { login, screenshot, waitForIdle } from '../helpers/ui';

/**
 * Group sync with the real login plugins, set up by bin/integration-test.sh:
 * - LoginLdap against an OpenLDAP server (users ldapalice and ldapbob, groups "Matomo Admins" (alice) and
 *   "Matomo Editors" (alice, bob), groupOfUniqueNames with the memberOf overlay)
 * - LoginOIDC and RebelOIDC against a mock OpenID Connect provider whose login form sets the claims
 * - LoginSaml (only if a licensed copy was installed, LOGINSAML=1) against SimpleSAMLphp, users in
 *   saml/authsources.php: samlalice (groups "Matomo Admins", "Matomo Editors", Role "matomo-role-analyst") and
 *   samlbob (groups "Matomo Editors")
 */

const LOGINSAML = process.env.LOGINSAML === '1';
const SAML_PASSWORD = 'samlPass1';

const LDAP_PASSWORD = 'ldapPass1!';
const ADMINS_DN = 'cn=Matomo Admins,ou=groups,dc=example,dc=org';

type Group = { idGroup: number; name: string };

async function setSyncSettings(su: MatomoApi, values: Record<string, string | boolean>): Promise<void> {
  const params: Record<string, string> = { passwordConfirmation: SUPERUSER.password };
  Object.entries(values).forEach(([name, value], i) => {
    params[`settingValues[GroupPermissions][${i}][name]`] = name;
    params[`settingValues[GroupPermissions][${i}][value]`] = typeof value === 'boolean' ? (value ? '1' : '0') : value;
  });
  await su.call('CorePluginsAdmin.setSystemSettings', params);
}

async function newPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  return context.newPage();
}

/** Logs in through an OIDC plugin: its button on the login page, then the login form of the mock provider. */
async function oidcLogin(page: Page, plugin: string, user: string, claims: Record<string, unknown>): Promise<void> {
  await page.goto('/index.php?module=Login');
  await page.getByRole('button', { name: `${plugin} login` }).or(page.getByRole('link', { name: `${plugin} login` })).click();
  await page.locator('input[name=username]').fill(user);
  await page.locator('textarea[name=claims]').fill(JSON.stringify(claims));
  await page.locator('input[type=submit], button[type=submit]').first().click();
  await page.waitForURL((url) => url.hostname !== 'oidc' && !url.searchParams.has('action'));
  await expect(page.locator('#login_form')).toHaveCount(0);
}

/** Logs in through LoginSaml: SSO start, the login form of SimpleSAMLphp, the POST back to Matomo. */
async function samlLogin(page: Page, user: string): Promise<void> {
  await page.goto('/index.php?module=LoginSaml&action=singleSignOn');
  await page.locator('input[name=username]').fill(user);
  await page.locator('input[name=password]').fill(SAML_PASSWORD);
  await page.locator('input[name=password]').press('Enter');
  await page.waitForURL((url) => url.hostname !== 'saml' && url.searchParams.get('module') !== 'LoginSaml');
  await expect(page.locator('#login_form')).toHaveCount(0);
  await expect(page.locator('#notificationContainer .notification-error, .notification.notification-error')).toHaveCount(0);
}

test.describe('Group sync with login plugins', () => {
  let su: MatomoApi;

  const members = (group: Group) => su.members(group.idGroup);
  const createMappedGroup = async (prefix: string, externalGroup: string): Promise<Group> => {
    const group = await su.createGroup(prefix);
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: group.idGroup, externalGroup });
    return group;
  };

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  test.describe('LoginLdap', () => {
    test('memberOf: an LDAP login adds the user to the mapped groups and removes outdated synced memberships',
      async ({ browser }) => {
        const admins = await createMappedGroup('LDAP Admins', ADMINS_DN);
        // a plain name matches the first value of the DN in memberOf
        const editors = await createMappedGroup('LDAP Editors', 'Matomo Editors');
        const stale = await createMappedGroup('LDAP Stale', `stale-${RUN_ID}`);
        const manual = await su.createGroup('LDAP Manual');

        await setSyncSettings(su, { ldapGroupSyncEnabled: true, ldapGroupAttribute: 'memberOf', ldapGroupFilter: '' });

        // the first login creates the Matomo user (LoginLdap) and syncs the groups
        const page = await newPage(browser);
        await login(page, 'ldapalice', LDAP_PASSWORD);
        expect(await members(admins)).toEqual(['ldapalice']);
        expect(await members(editors)).toEqual(['ldapalice']);
        await page.context().close();

        // memberships from an earlier sync that no longer match are removed on the next login, manual ones kept
        await su.call('GroupPermissions.syncUserGroups', { userLogin: 'ldapalice', externalGroups: [`stale-${RUN_ID}`] });
        await su.addMembers(manual.idGroup, ['ldapalice']);
        expect(await members(stale)).toEqual(['ldapalice']);
        expect(await members(admins)).toEqual([]);

        const page2 = await newPage(browser);
        await login(page2, 'ldapalice', LDAP_PASSWORD);
        expect(await members(admins)).toEqual(['ldapalice']);
        expect(await members(editors)).toEqual(['ldapalice']);
        expect(await members(stale)).toEqual([]);
        expect(await members(manual)).toEqual(['ldapalice']);
        await page2.context().close();
      });

    test('group search filter: groups are found by a filter with the DN of the user', async ({ browser }) => {
      const admins = await createMappedGroup('LDAP Filter Admins', ADMINS_DN);
      const editors = await createMappedGroup('LDAP Filter Editors', 'cn=matomo editors,ou=groups,dc=example,dc=org');

      await setSyncSettings(su, {
        ldapGroupSyncEnabled: true,
        ldapGroupAttribute: '',
        ldapGroupFilter: '(&(objectClass=groupOfUniqueNames)(uniqueMember=?))',
        ldapGroupBaseDn: 'ou=groups,dc=example,dc=org',
      });

      const page = await newPage(browser);
      await login(page, 'ldapbob', LDAP_PASSWORD);
      expect(await members(editors)).toEqual(['ldapbob']);
      expect(await members(admins)).toEqual([]);
      await page.context().close();
    });

    test('disabled: an LDAP login does not change memberships', async ({ browser }) => {
      const admins = await createMappedGroup('LDAP Disabled', ADMINS_DN);
      await setSyncSettings(su, { ldapGroupSyncEnabled: false });

      const page = await newPage(browser);
      await login(page, 'ldapalice', LDAP_PASSWORD);
      expect(await members(admins)).toEqual([]);
      await page.context().close();
    });

    test.describe('settings', () => {
      test.use({ storageState: superUserStorageState });

      test('the sync settings are shown in the general settings', async ({ page }) => {
        await setSyncSettings(su, {
          ldapGroupSyncEnabled: true,
          ldapGroupAttribute: 'memberOf',
          ldapGroupFilter: '',
          oidcGroupSyncEnabled: true,
          oidcGroupsClaim: 'groups',
          ...(LOGINSAML ? { samlGroupSyncEnabled: true, samlGroupsAttribute: 'groups' } : {}),
        });
        await page.goto('/index.php?module=CoreAdminHome&action=generalSettings&idSite=1&period=day&date=yesterday');
        await waitForIdle(page);
        const section = page.locator('.card', { hasText: 'Synchronize group memberships from LDAP groups' });
        await expect(section).toBeVisible();
        await expect(section).toContainText('Synchronize group memberships from OpenID Connect groups');
        if (LOGINSAML) {
          await expect(section).toContainText('Synchronize group memberships from SAML groups');
        }
        await screenshot(section, 'general-settings-group-sync');
      });
    });
  });

  for (const plugin of ['LoginOIDC', 'RebelOIDC']) {
    test.describe(plugin, () => {
      test('the groups claim of the ID token is synced on every login', async ({ browser }) => {
        const prefix = plugin.toLowerCase();
        const analysts = await createMappedGroup(`${plugin} Analysts`, `${prefix}-analysts-${RUN_ID}`);
        const admins = await createMappedGroup(`${plugin} Admins`, `${prefix}-admins-${RUN_ID}`);
        await setSyncSettings(su, { oidcGroupSyncEnabled: true, oidcGroupsClaim: 'groups' });

        const user = `${prefix}_${RUN_ID}`;
        const email = `${user}@example.org`;
        const claims = (groups: string[]) => ({ email, preferred_username: user, groups });

        // first login: the user is created by the OIDC plugin (sign up) and added to the mapped groups
        let page = await newPage(browser);
        await oidcLogin(page, plugin, user, claims([`${prefix}-analysts-${RUN_ID}`, `${prefix}-admins-${RUN_ID}`, 'other']));
        const users: Array<{ login: string; email: string }> = await su.call('UsersManager.getUsers', { filter_limit: -1 });
        const matomoLogin = users.find((u) => u.email === email)?.login;
        expect(matomoLogin).toBeTruthy();
        expect(await members(analysts)).toEqual([matomoLogin]);
        expect(await members(admins)).toEqual([matomoLogin]);
        await page.context().close();

        // the provider no longer lists a group: the next login removes the synced membership
        page = await newPage(browser);
        await oidcLogin(page, plugin, user, claims([`${prefix}-analysts-${RUN_ID}`]));
        expect(await members(analysts)).toEqual([matomoLogin]);
        expect(await members(admins)).toEqual([]);
        await page.context().close();

        // a token without the groups claim leaves the memberships unchanged
        page = await newPage(browser);
        await oidcLogin(page, plugin, user, { email, preferred_username: user });
        expect(await members(analysts)).toEqual([matomoLogin]);
        await page.context().close();
      });

      test('a nested claim path can be configured, e.g. Keycloak realm roles', async ({ browser }) => {
        const prefix = `${plugin.toLowerCase()}_roles`;
        const group = await createMappedGroup(`${plugin} Role`, `${prefix}-matomo-${RUN_ID}`);
        await setSyncSettings(su, { oidcGroupSyncEnabled: true, oidcGroupsClaim: 'realm_access.roles' });

        const user = `${prefix}_${RUN_ID}`;
        const page = await newPage(browser);
        await oidcLogin(page, plugin, user, {
          email: `${user}@example.org`,
          preferred_username: user,
          realm_access: { roles: [`${prefix}-matomo-${RUN_ID}`, 'offline_access'] },
        });
        expect((await members(group)).length).toBe(1);
        await page.context().close();
      });
    });
  }

  test.describe('LoginSaml', () => {
    test.skip(!LOGINSAML, 'needs a licensed LoginSaml copy, see bin/integration-test.sh');

    test('a SAML login adds the user to the mapped groups and removes outdated synced memberships', async ({ browser }) => {
      const admins = await createMappedGroup('SAML Admins', 'Matomo Admins');
      const editors = await createMappedGroup('SAML Editors', 'Matomo Editors');
      // a DN mapping never matches the plain group name of the SAML attribute
      const dnMapped = await createMappedGroup('SAML DN', 'CN=Matomo Editors,OU=Groups,DC=example,DC=org');
      const stale = await createMappedGroup('SAML Stale', `saml-stale-${RUN_ID}`);
      const manual = await su.createGroup('SAML Manual');
      await setSyncSettings(su, { samlGroupSyncEnabled: true, samlGroupsAttribute: 'groups' });

      // the first login creates the Matomo user (LoginSaml just-in-time provisioning) and syncs the groups
      let page = await newPage(browser);
      await samlLogin(page, 'samlalice');
      expect(await members(admins)).toEqual(['samlalice']);
      expect(await members(editors)).toEqual(['samlalice']);
      expect(await members(dnMapped)).toEqual([]);
      await page.context().close();

      await su.call('GroupPermissions.syncUserGroups', { userLogin: 'samlalice', externalGroups: [`saml-stale-${RUN_ID}`] });
      await su.addMembers(manual.idGroup, ['samlalice']);
      expect(await members(admins)).toEqual([]);

      page = await newPage(browser);
      await samlLogin(page, 'samlalice');
      expect(await members(admins)).toEqual(['samlalice']);
      expect(await members(editors)).toEqual(['samlalice']);
      expect(await members(stale)).toEqual([]);
      expect(await members(manual)).toEqual(['samlalice']);
      await page.context().close();

      page = await newPage(browser);
      await samlLogin(page, 'samlbob');
      expect(await members(editors)).toEqual(['samlalice', 'samlbob']);
      expect(await members(admins)).toEqual(['samlalice']);
      await page.context().close();
    });

    test('the group attribute name is configurable and matched case-insensitively', async ({ browser }) => {
      const analysts = await createMappedGroup('SAML Role', 'matomo-role-analyst');
      await setSyncSettings(su, { samlGroupSyncEnabled: true, samlGroupsAttribute: 'role' });

      const page = await newPage(browser);
      await samlLogin(page, 'samlalice');
      expect(await members(analysts)).toEqual(['samlalice']);
      await page.context().close();
    });

    test('disabled: a SAML login does not change memberships', async ({ browser }) => {
      const group = await createMappedGroup('SAML Disabled', 'Matomo Editors');
      await setSyncSettings(su, { samlGroupSyncEnabled: false });

      const page = await newPage(browser);
      await samlLogin(page, 'samlbob');
      expect(await members(group)).toEqual([]);
      await page.context().close();
    });
  });
});
