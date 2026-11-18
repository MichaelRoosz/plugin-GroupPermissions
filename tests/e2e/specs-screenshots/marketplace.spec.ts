import { test, expect, Page, Locator } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { MatomoApi } from '../helpers/api';
import { superUserStorageState, SUPERUSER } from '../helpers/env';
import {
  accessRow, chooseOption, groupRow, memberRow, openGroupEditor, openGroupPermissions, roleSelect, selectSite,
  switchEditorTab, waitForIdle, websiteRow,
} from '../helpers/ui';

/**
 * Screenshots for the Matomo Marketplace (the plugin's screenshots/ directory, the file name is the caption).
 * Run by bin/marketplace-screenshots.sh on a fresh instance with the demo data of bin/start.sh, which this spec
 * extends with capabilities, rules, segments, reports and directory groups.
 */
const OUT_DIR = process.env.MARKETPLACE_SCREENSHOT_DIR || path.join(__dirname, '..', 'marketplace-screenshots');
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demoPass1!';

const TAG_MANAGER_WRITE = 'tagmanager_write';
const PUBLISH = 'tagmanager_publish_live_container';

type Group = { idGroup: number; name: string };

/** Screenshot of an element with some space around it, so it does not look cut off. */
async function shoot(page: Page, target: Locator, name: string, padding = 16): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  await waitForIdle(page);
  // Matomo's system notifications (e.g. the warning about plain HTTP of the test instance)
  await page.addStyleTag({ content: '#notificationContainer { display: none !important; }' });
  const box = await target.boundingBox();
  if (!box) throw new Error(`${name}: element not visible`);
  const viewport = page.viewportSize()!;
  const x = Math.max(0, box.x - padding);
  const y = Math.max(0, box.y - padding);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    animations: 'disabled',
    fullPage: true,
    clip: {
      x,
      y: y + await page.evaluate(() => window.scrollY),
      width: Math.min(viewport.width - x, box.width + 2 * padding),
      height: box.height + 2 * padding,
    },
  });
}

/** The plugin's admin page without Matomo's header and menu. */
const pluginContent = (page: Page) => page.locator('.groupPermissions');

test.describe('Marketplace screenshots', () => {
  test.use({ storageState: superUserStorageState, viewport: { width: 1280, height: 1000 } });

  let su: MatomoApi;
  let groups: Record<'Marketing' | 'Sales' | 'Web Admins', Group>;

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    const all: Group[] = await su.call('GroupPermissions.getAllGroups');
    const byName = (name: string) => {
      const group = all.find((g) => g.name === name);
      if (!group) throw new Error(`demo group ${name} missing, run bin/start.sh --fresh first`);
      return group;
    };
    groups = { Marketing: byName('Marketing'), Sales: byName('Sales'), 'Web Admins': byName('Web Admins') };

    // only seed once (KEEP_ENV): the segments are the last thing added
    const alice = await MatomoApi.forUser('alice', DEMO_PASSWORD);
    if ((await su.call('SegmentEditor.getAll', { idSite: 1 })).length) {
      return;
    }

    // capabilities (Tag Manager)
    await su.call('GroupPermissions.addGroupCapabilities', { idGroup: groups.Marketing.idGroup, capabilities: TAG_MANAGER_WRITE, idSites: '1' });
    await su.call('GroupPermissions.addGroupCapabilities', { idGroup: groups.Sales.idGroup, capabilities: PUBLISH, idSites: '2' });

    // automatic access to new websites
    await su.call('GroupPermissions.addAutoAccessRule', {
      idGroup: groups.Marketing.idGroup, matchType: 'sitegroup', pattern: 'Campaigns', access: 'view', capabilities: [TAG_MANAGER_WRITE],
    });
    await su.call('GroupPermissions.addAutoAccessRule', {
      idGroup: groups.Marketing.idGroup, matchType: 'url', pattern: '*.marketing.example.org', access: 'write',
    });

    // directory sync: erin is a member through her LDAP/SAML/OIDC group
    await su.call('UsersManager.addUser', {
      userLogin: 'erin', password: DEMO_PASSWORD, email: 'erin@example.org', passwordConfirmation: SUPERUSER.password,
    });
    await su.call('GroupPermissions.addExternalGroupMapping', {
      idGroup: groups.Marketing.idGroup, externalGroup: 'CN=Marketing,OU=Groups,DC=example,DC=org',
    });
    await su.call('GroupPermissions.addExternalGroupMapping', { idGroup: groups.Marketing.idGroup, externalGroup: 'marketing-team' });
    await su.call('GroupPermissions.syncUserGroups', { userLogin: 'erin', externalGroups: 'marketing-team' });

    // scheduled reports to copy to the group
    const report = (description: string, period: string, reports: string[]) => alice.call('ScheduledReports.addReport', {
      idSite: 1,
      description,
      period,
      hour: 7,
      reportType: 'email',
      reportFormat: 'pdf',
      reports,
      'parameters[displayFormat]': 1,
      'parameters[emailMe]': true,
      'parameters[evolutionGraph]': false,
    });
    await report('Weekly marketing KPIs', 'week', ['VisitsSummary_get', 'Referrers_getReferrerType']);
    await report('Monthly campaign report', 'month', ['Referrers_getCampaigns']);

    // segments shared with the group
    for (const [name, definition, idSite] of [
      ['Campaign visitors', 'referrerType==campaign', 1],
      ['Newsletter readers', 'referrerName==newsletter', 3],
      ['Returning visitors', 'visitorType==returning', 1],
    ] as const) {
      const idSegment = Number((await alice.call('SegmentEditor.add', { name, definition, idSite })).value);
      await su.call('GroupPermissions.shareSegmentWithGroup', { idSegment, idGroup: groups.Marketing.idGroup });
    }
  });

  test('Manage Access', async ({ page }) => {
    await openGroupPermissions(page, 'access');
    await selectSite(page, 'Site One');
    await expect(accessRow(page, 'Marketing').locator(`.chip[data-capability="${TAG_MANAGER_WRITE}"]`)).toBeVisible();
    await shoot(page, pluginContent(page), 'Manage_Access');
  });

  test('Manage Groups', async ({ page }) => {
    await openGroupPermissions(page, 'groups');
    await expect(groupRow(page, 'Marketing')).toBeVisible();
    await shoot(page, pluginContent(page), 'Manage_Groups');
  });

  test('Edit group members', async ({ page }) => {
    await openGroupEditor(page, groups.Marketing.idGroup, 'members');
    await expect(memberRow(page, 'erin').locator('.groupPermissionsSyncedBadge')).toBeVisible();
    await shoot(page, pluginContent(page), 'Edit_Group_Members');
  });

  test('Edit group website access', async ({ page }) => {
    await openGroupEditor(page, groups.Sales.idGroup, 'access');
    await expect(websiteRow(page, 'Shop').locator(`.chip[data-capability="${PUBLISH}"]`)).toBeVisible();
    await shoot(page, pluginContent(page), 'Edit_Group_Website_Access');
  });

  test('Automatic access to new websites', async ({ page }) => {
    await openGroupEditor(page, groups.Marketing.idGroup, 'autoaccess');
    await expect(page.locator('tr.groupPermissionsRuleRow')).toHaveCount(2);
    await shoot(page, pluginContent(page), 'Automatic_Access_To_New_Websites');
  });

  test('Share segments', async ({ page }) => {
    await openGroupEditor(page, groups.Marketing.idGroup, 'segments');
    await expect(page.locator('tr.groupPermissionsSegmentRow')).toHaveCount(3);
    await shoot(page, pluginContent(page), 'Share_Segments_With_A_Group');
  });

  test('Copy scheduled reports', async ({ page }) => {
    await openGroupEditor(page, groups.Marketing.idGroup, 'reports');
    await chooseOption(page.locator('.groupPermissionsCopyReport .groupPermissionsReportField'), 'Weekly marketing KPIs (Site One, alice)');
    await shoot(page, pluginContent(page), 'Copy_Scheduled_Reports_To_A_Group');
  });

  test('Directory sync', async ({ page }) => {
    await openGroupEditor(page, groups.Marketing.idGroup, 'sync');
    await expect(page.locator('tr.groupPermissionsExternalGroupRow')).toHaveCount(2);
    await shoot(page, pluginContent(page), 'Sync_Groups_From_LDAP_SAML_Or_OpenID_Connect');
  });

  test('Invite user to groups', async ({ page }) => {
    await page.goto('/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=groups#?groupView=invite');
    const form = page.locator('.groupPermissionsInviteUser');
    await expect(form).toBeVisible();
    await waitForIdle(page);
    await form.locator('input[name="groupPermissionsInviteLogin"]').fill('frank');
    await form.locator('input[name="groupPermissionsInviteEmail"]').fill('frank@example.org');
    for (const group of [groups.Marketing, groups.Sales]) {
      await form.locator('label', { has: page.locator(`input[name="groupPermissionsInviteGroup${group.idGroup}"]`) }).click();
    }
    await shoot(page, pluginContent(page), 'Invite_User_To_Groups');
  });

  test('Group access in the website editor', async ({ page }) => {
    await page.goto('/index.php?module=SitesManager&action=index&idSite=1&period=day&date=yesterday#/editsiteid=3');
    const field = page.locator('.editingSite .form-group', { hasText: 'Group access' })
      .filter({ has: page.locator('.multiPairField') }).last();
    await expect(field).toBeVisible();
    await waitForIdle(page);
    await expect(roleSelect(field.locator('.multiPairFieldTable0 .fieldUiControl1'))).toHaveValue('Marketing');
    await shoot(page, field, 'Group_Access_In_The_Website_Editor');
  });

  test('Copy dashboard to a group', async ({ page }) => {
    await page.goto('/index.php?module=CoreHome&action=index&idSite=1&period=day&date=yesterday#?idSite=1&period=day&date=yesterday&category=Dashboard_Dashboard&subcategory=1');
    await waitForIdle(page);
    await page.locator('.dashboard-manager .title').click();
    await page.locator('text="Copy dashboard to user" >> visible=true').first().click();
    const dialog = page.locator('.modal.open', { hasText: 'Copy dashboard to user' });
    await expect(dialog).toBeVisible();
    const select = dialog.locator('select[name="copyDashboardUser"]');
    await select.selectOption({ label: 'Marketing' });
    // a native dropdown cannot be captured open: show the options (users and groups) as a list instead
    await select.evaluate((el: HTMLSelectElement) => {
      el.size = el.options.length + el.querySelectorAll('optgroup').length;
      el.style.height = 'auto';
    });
    await shoot(page, dialog, 'Copy_Dashboard_To_A_Group', 0);
  });
});
