import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, RUN_ID, superUserStorageState } from '../helpers/env';
import {
  chooseOption, clickModalButton, fillField, openGroupEditor, saveButton, screenshot, switchEditorTab, toast, waitForIdle,
} from '../helpers/ui';

/**
 * Automatic access on website creation: rules per group matching the website group or the URLs of new websites.
 * Rules are global, so every pattern contains the RUN_ID to not affect websites created by other specs.
 */
test.describe('Automatic access for new websites', () => {
  let su: MatomoApi;

  type Rule = { idRule: number; matchType: string; pattern: string; access: string; capabilities: string[] };
  const rules = async (idGroup: number): Promise<Rule[]> =>
    su.call('GroupPermissions.getAutoAccessRules', { idGroup, filter_limit: -1 });
  const addRule = async (idGroup: number, matchType: string, pattern: string, access: string, capabilities: string[] = []): Promise<number> =>
    Number((await su.call('GroupPermissions.addAutoAccessRule', { idGroup, matchType, pattern, access, capabilities })).value);
  const groupSite = async (idGroup: number, idSite: number) =>
    (await su.call('GroupPermissions.getSitesAccessFromGroup', { idGroup, filter_limit: -1 }))
      .find((s: { idSite: number }) => Number(s.idSite) === idSite);
  const addSite = async (name: string, urls: string[], group = ''): Promise<number> =>
    Number((await su.call('SitesManager.addSite', { siteName: `${name} ${RUN_ID}`, urls, group })).value);

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
  });

  test('a new website in a matching website group gives the group access', async () => {
    const group = await su.createGroup('Auto sitegroup');
    const siteGroup = `Shops ${RUN_ID}`;
    await addRule(group.idGroup, 'sitegroup', siteGroup.toUpperCase(), 'write');

    const matching = await addSite('Auto Shop', [`https://auto-shop-${RUN_ID}.example.org`], siteGroup);
    const other = await addSite('Auto Other', [`https://auto-other-${RUN_ID}.example.org`], `Other ${RUN_ID}`);

    expect((await su.groupAccess(matching))[group.name]).toBe('write');
    expect((await su.groupAccess(other))[group.name]).toBe('noaccess');

    // the members get the access
    const login = await su.createUser('autoaccess');
    await su.addMembers(group.idGroup, [login]);
    const user = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    const ids = (await user.call('SitesManager.getSitesIdWithAtLeastViewAccess')).map(Number);
    expect(ids).toContain(matching);
    expect(ids).not.toContain(other);
  });

  test('URL patterns match the host (and path) of the main and alias URLs', async () => {
    const group = await su.createGroup('Auto url');
    await addRule(group.idGroup, 'url', `*.brand-${RUN_ID}.example.org`, 'view');
    await addRule(group.idGroup, 'url', `https://landing-${RUN_ID}.example.org/campaign*`, 'admin');

    const subdomain = await addSite('Auto Brand', [`https://shop.brand-${RUN_ID}.example.org/`]);
    const alias = await addSite('Auto Alias', [`https://unrelated-${RUN_ID}.example.org`, `https://de.brand-${RUN_ID}.example.org`]);
    const withPath = await addSite('Auto Path', [`https://landing-${RUN_ID}.example.org/campaign/2026`]);
    const otherPath = await addSite('Auto Other Path', [`https://landing-${RUN_ID}.example.org/blog`]);
    const apex = await addSite('Auto Apex', [`https://brand-${RUN_ID}.example.org`]);

    expect((await su.groupAccess(subdomain))[group.name]).toBe('view');
    expect((await su.groupAccess(alias))[group.name]).toBe('view');
    expect((await su.groupAccess(withPath))[group.name]).toBe('admin');
    expect((await su.groupAccess(otherPath))[group.name]).toBe('noaccess');
    expect((await su.groupAccess(apex))[group.name]).toBe('noaccess');
  });

  test('the port of the URLs is only compared for patterns with a port', async () => {
    const group = await su.createGroup('Auto port');
    await addRule(group.idGroup, 'url', `port-${RUN_ID}.example.org:8080`, 'write');
    await addRule(group.idGroup, 'url', `anyport-${RUN_ID}.example.org`, 'view');

    const withPort = await addSite('Auto Port', [`https://port-${RUN_ID}.example.org:8080/`]);
    const otherPort = await addSite('Auto Other Port', [`https://port-${RUN_ID}.example.org:9090`]);
    const noPort = await addSite('Auto No Port', [`https://port-${RUN_ID}.example.org`]);
    const anyPort = await addSite('Auto Any Port', [`https://anyport-${RUN_ID}.example.org:8443`]);

    expect((await su.groupAccess(withPort))[group.name]).toBe('write');
    expect((await su.groupAccess(otherPort))[group.name]).toBe('noaccess');
    expect((await su.groupAccess(noPort))[group.name]).toBe('noaccess');
    expect((await su.groupAccess(anyPort))[group.name]).toBe('view');
  });

  test('URLs without a port have the default port of their scheme', async () => {
    const group = await su.createGroup('Auto default port');
    await addRule(group.idGroup, 'url', `https-${RUN_ID}.example.org:443`, 'view');
    await addRule(group.idGroup, 'url', `http-${RUN_ID}.example.org:80/shop*`, 'write');

    const https = await addSite('Auto Default Https', [`https://https-${RUN_ID}.example.org`]);
    const httpOnHttpsPort = await addSite('Auto Http On 443', [`http://https-${RUN_ID}.example.org`]);
    const http = await addSite('Auto Default Http', [`http://http-${RUN_ID}.example.org/shop/`]);
    const explicit = await addSite('Auto Explicit Http', [`http://http-${RUN_ID}.example.org:80/shop`]);

    expect((await su.groupAccess(https))[group.name]).toBe('view');
    expect((await su.groupAccess(httpOnHttpsPort))[group.name]).toBe('noaccess');
    expect((await su.groupAccess(http))[group.name]).toBe('write');
    expect((await su.groupAccess(explicit))[group.name]).toBe('write');
  });

  test('the highest role of all matching rules wins, existing websites are not changed', async () => {
    const group = await su.createGroup('Auto highest');
    const existing = await addSite('Auto Existing', [`https://multi-${RUN_ID}.example.org`], `Multi ${RUN_ID}`);
    await addRule(group.idGroup, 'sitegroup', `Multi ${RUN_ID}`, 'view');
    await addRule(group.idGroup, 'url', `multi-${RUN_ID}.example.org`, 'write');

    const idSite = await addSite('Auto Multi', [`https://multi-${RUN_ID}.example.org`], `Multi ${RUN_ID}`);
    expect((await su.groupAccess(idSite))[group.name]).toBe('write');
    expect((await su.groupAccess(existing))[group.name]).toBe('noaccess');
  });

  test('rules are validated, listed and removed; deleting the group removes them', async () => {
    const group = await su.createGroup('Auto validate');
    const params = { idGroup: group.idGroup, matchType: 'url', pattern: `v-${RUN_ID}.example.org`, access: 'view' };

    expect(await su.expectError('GroupPermissions.addAutoAccessRule', { ...params, matchType: 'regex' })).toMatch(/match type/i);
    expect(await su.expectError('GroupPermissions.addAutoAccessRule', { ...params, pattern: '  ' })).toMatch(/enter a website group or URL|specify a value for 'pattern'/);
    expect(await su.expectError('GroupPermissions.addAutoAccessRule', { ...params, pattern: 'x'.repeat(256) })).toMatch(/too long/);
    expect(await su.expectError('GroupPermissions.addAutoAccessRule', { ...params, access: 'noaccess' })).toMatch(/must have one of the following values/);
    expect(await su.expectError('GroupPermissions.addAutoAccessRule', { ...params, idGroup: 999999 })).toMatch(/Group does not exist/);

    const idRule = await addRule(group.idGroup, 'url', `https://V-${RUN_ID}.example.org/`, 'view');
    expect(await rules(group.idGroup)).toEqual([
      { idRule, matchType: 'url', pattern: `V-${RUN_ID}.example.org`, access: 'view', capabilities: [] },
    ]);
    expect(await su.expectError('GroupPermissions.addAutoAccessRule', params)).toMatch(/already has a rule/);

    // removing needs the right group
    const otherGroup = await su.createGroup('Auto validate other');
    expect(await su.expectError('GroupPermissions.removeAutoAccessRule', { idGroup: otherGroup.idGroup, idRule }))
      .toMatch(/rule .*does not exist|does not exist/i);
    expect(await rules(group.idGroup)).toHaveLength(1);
    await su.call('GroupPermissions.removeAutoAccessRule', { idGroup: group.idGroup, idRule });
    expect(await rules(group.idGroup)).toEqual([]);
    expect(await su.expectError('GroupPermissions.removeAutoAccessRule', { idGroup: group.idGroup, idRule }))
      .toMatch(/does not exist/i);

    // deleting the group removes its rules: a new matching website must not get a permission for the old group id
    await addRule(group.idGroup, 'url', `deleted-${RUN_ID}.example.org`, 'admin');
    await su.call('GroupPermissions.deleteGroup', { idGroup: group.idGroup });
    const idSite = await addSite('Auto Deleted', [`https://deleted-${RUN_ID}.example.org`]);
    const overview = await su.call('GroupPermissions.getGroupPermissionsFromSite', { idSite });
    expect(overview.filter((g: { access: string }) => g.access !== 'noaccess')).toEqual([]);
  });

  test('rules can give capabilities, those included in the role are not stored', async () => {
    const group = await su.createGroup('Auto caps');
    await addRule(group.idGroup, 'url', `caps-${RUN_ID}.example.org`, 'view', ['tagmanager_write', 'tagmanager_publish_live_container']);
    await addRule(group.idGroup, 'sitegroup', `Caps ${RUN_ID}`, 'admin', ['tagmanager_write']);
    expect((await rules(group.idGroup)).map((r) => r.capabilities)).toEqual([
      ['tagmanager_write', 'tagmanager_publish_live_container'],
      [],
    ]);
    expect(await su.expectError('GroupPermissions.addAutoAccessRule', {
      idGroup: group.idGroup, matchType: 'url', pattern: `other-${RUN_ID}.example.org`, access: 'view', capabilities: ['unknown'],
    })).toMatch(/must have one of the following values/);

    const viewSite = await addSite('Auto Caps', [`https://caps-${RUN_ID}.example.org`]);
    expect(await groupSite(group.idGroup, viewSite)).toMatchObject({ access: 'view' });
    expect((await groupSite(group.idGroup, viewSite)).capabilities.sort()).toEqual(['tagmanager_publish_live_container', 'tagmanager_write']);

    // both rules match: admin wins and includes the capabilities
    const adminSite = await addSite('Auto Caps Admin', [`https://caps-${RUN_ID}.example.org`], `Caps ${RUN_ID}`);
    expect(await groupSite(group.idGroup, adminSite)).toMatchObject({ access: 'admin', capabilities: [] });
  });

  test('a rule can be applied to existing websites without downgrading roles', async () => {
    const group = await su.createGroup('Auto apply');
    const matching = await addSite('Auto Apply', [`https://apply-${RUN_ID}.example.org`]);
    const higher = await addSite('Auto Apply Higher', [`https://www.apply-${RUN_ID}.example.org`]);
    const other = await addSite('Auto Apply Other', [`https://other-apply-${RUN_ID}.example.org`]);
    await su.setGroupAccess(group.name, 'admin', higher);

    const idRule = await addRule(group.idGroup, 'url', `*apply-${RUN_ID}.example.org`, 'write', ['tagmanager_publish_live_container']);
    // existing websites are not changed by adding the rule
    expect((await su.groupAccess(matching))[group.name]).toBe('noaccess');

    const otherRule = await addRule(group.idGroup, 'url', `nothing-${RUN_ID}.example.org`, 'view');
    expect(await su.call('GroupPermissions.applyAutoAccessRule', { idGroup: group.idGroup, idRule: otherRule })).toEqual([]);

    // "*apply-…" also matches "other-apply-…"
    const applied = (await su.call('GroupPermissions.applyAutoAccessRule', { idGroup: group.idGroup, idRule })).map(Number).sort((a: number, b: number) => a - b);
    expect(applied).toEqual([matching, higher, other].sort((a, b) => a - b));
    expect(await groupSite(group.idGroup, matching)).toMatchObject({ access: 'write', capabilities: ['tagmanager_publish_live_container'] });
    expect(await groupSite(group.idGroup, higher)).toMatchObject({ access: 'admin', capabilities: [] });

    expect(await su.expectError('GroupPermissions.applyAutoAccessRule', { idGroup: group.idGroup, idRule: 999999 })).toMatch(/does not exist/);
    const otherGroup = await su.createGroup('Auto apply other');
    expect(await su.expectError('GroupPermissions.applyAutoAccessRule', { idGroup: otherGroup.idGroup, idRule })).toMatch(/does not exist/);
  });

  test('only super users can manage rules', async () => {
    const group = await su.createGroup('Auto security');
    const idSite = await su.createSite('Auto Security Site');
    const login = await su.createUser('autoadmin');
    await su.setUserAccess(login, 'admin', idSite);
    const admin = await MatomoApi.forUser(login, DEFAULT_PASSWORD);

    const superUserOnly = /'?super ?user'? access/i;
    expect(await admin.expectError('GroupPermissions.getAutoAccessRules', { idGroup: group.idGroup })).toMatch(superUserOnly);
    expect(await admin.expectError('GroupPermissions.addAutoAccessRule', {
      idGroup: group.idGroup, matchType: 'url', pattern: '*', access: 'admin',
    })).toMatch(superUserOnly);
    expect(await admin.expectError('GroupPermissions.removeAutoAccessRule', { idGroup: group.idGroup, idRule: 1 })).toMatch(superUserOnly);
    expect(await admin.expectError('GroupPermissions.applyAutoAccessRule', { idGroup: group.idGroup, idRule: 1 })).toMatch(superUserOnly);
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('rules can be added and removed in the group editor', async ({ page }) => {
      const group = await su.createGroup('Auto UI');
      await openGroupEditor(page, group.idGroup, 'members');
      await switchEditorTab(page, 'autoaccess');

      const form = page.locator('.groupPermissionsAddRule');
      await expect(page.locator('.groupPermissionsRulesTable .groupPermissionsEmpty')).toBeVisible();

      await fillField(form.locator('input#groupPermissionsPattern'), `Clients ${RUN_ID}`);
      await chooseOption(form.locator('.groupPermissionsRoleField'), 'Write');
      await form.locator('.groupPermissionsRuleCapabilities label', { hasText: 'Publish Live Container' }).click();
      await saveButton(form, 'groupPermissionsAddRuleButton').click();
      await waitForIdle(page);
      await expect(toast(page, 'The rule has been added')).toBeVisible();

      await chooseOption(form.locator('.groupPermissionsMatchTypeField'), 'Website URL');
      await expect(form.locator('.groupPermissionsPatternField .inline-help')).toContainText('*.example.com');
      await fillField(form.locator('input#groupPermissionsPattern'), `*.clients-${RUN_ID}.example.org`);
      await saveButton(form, 'groupPermissionsAddRuleButton').click();
      await waitForIdle(page);

      const rows = page.locator('tr.groupPermissionsRuleRow');
      await expect(rows).toHaveCount(2);
      await expect(rows.nth(0).locator('td')).toHaveText(['Website group', `Clients ${RUN_ID}`, 'Write', /Publish Live Container/, '']);
      // the role select keeps the last role
      await expect(rows.nth(1).locator('td')).toHaveText(['Website URL', `*.clients-${RUN_ID}.example.org`, 'Write', '', '']);
      await screenshot(page.locator('.groupPermissionsEditGroup'), 'group-editor-auto-access');

      // apply the URL rule to an existing website
      const idSite = await addSite('Auto UI Existing', [`https://www.clients-${RUN_ID}.example.org`]);
      await su.call('GroupPermissions.setGroupAccess', { name: group.name, access: 'noaccess', idSites: String(idSite) });
      await rows.nth(1).locator('.groupPermissionsApplyRule').click();
      await clickModalButton(page, 'Yes');
      await waitForIdle(page);
      await expect(toast(page, 'The rule has been applied to 1 website(s).')).toBeVisible();
      expect((await su.groupAccess(idSite))[group.name]).toBe('write');

      await rows.nth(0).locator('.groupPermissionsRemoveRule').click();
      await clickModalButton(page, 'Yes');
      await waitForIdle(page);
      await expect(toast(page, 'The rule has been removed')).toBeVisible();
      await expect(rows).toHaveCount(1);
      expect((await rules(group.idGroup)).map((r) => r.matchType)).toEqual(['url']);
    });
  });
});
