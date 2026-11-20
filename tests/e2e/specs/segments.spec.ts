import { test, expect, Browser } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, MATOMO_URL, RUN_ID, superUserStorageState } from '../helpers/env';
import {
  chooseOption, clickModalButton, login, openGroupEditor, saveButton, screenshot, switchEditorTab, toast, waitForIdle,
} from '../helpers/ui';

/**
 * Sharing stored segments (SegmentEditor) with groups: members see segments shared with their groups.
 */

type Segment = { idsegment: string | number; name: string; login: string; enable_only_idsite: string | number };
type GroupSegment = {
  idSegment: number; name: string; login: string; idSite: number; siteName: string; enabledAllUsers: boolean; isShared: boolean;
};

async function pageAs(browser: Browser, user: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, user, DEFAULT_PASSWORD);
  return page;
}

test.describe('Share segments with groups', () => {
  let su: MatomoApi;
  let idSite: number;
  let otherSite: number;
  let team: { idGroup: number; name: string };
  let owner: string;
  let member: string;
  let memberWithoutSiteAccess: string;
  let noSiteTeam: { idGroup: number; name: string };
  let outsider: string;
  let api: Record<string, MatomoApi>;

  const segmentIds = (segments: Segment[]): number[] => segments.map((s) => Number(s.idsegment));
  const addSegment = async (as: MatomoApi, name: string, site: number | false = idSite): Promise<number> =>
    Number((await as.call('SegmentEditor.add', {
      name: `${name} ${RUN_ID}`,
      definition: `pageUrl=@${encodeURIComponent(name.toLowerCase().replace(/\W+/g, '-'))}-${RUN_ID}`,
      idSite: site === false ? undefined : site,
    })).value);
  const share = (as: MatomoApi, idSegment: number, idGroup = team.idGroup) =>
    as.call('GroupPermissions.shareSegmentWithGroup', { idSegment, idGroup });
  const visibleTo = async (login: string, site?: number): Promise<number[]> =>
    segmentIds(await api[login].call('SegmentEditor.getAll', { idSite: site, filter_limit: -1 }));

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    idSite = await su.createSite('Segment Site');
    otherSite = await su.createSite('Segment Other Site');
    team = await su.createGroup('Segment Team');

    owner = await su.createUser('seg_owner');
    member = await su.createUser('seg_member');
    memberWithoutSiteAccess = await su.createUser('seg_nosite');
    outsider = await su.createUser('seg_outsider');

    await su.setUserAccess(owner, 'admin', idSite);
    await su.setUserAccess(outsider, 'view', idSite);
    await su.setUserAccess(memberWithoutSiteAccess, 'view', otherSite);
    // the member gets view access through the group
    await su.addMembers(team.idGroup, [member]);
    await su.setGroupAccess(team.name, 'view', idSite);
    // a group without access to the website of the segments
    noSiteTeam = await su.createGroup('Segment No Site Team');
    await su.addMembers(noSiteTeam.idGroup, [memberWithoutSiteAccess]);

    api = {};
    for (const login of [owner, member, memberWithoutSiteAccess, outsider]) {
      api[login] = await MatomoApi.forUser(login, DEFAULT_PASSWORD);
    }
  });

  test('members with access to the website see a shared segment, others do not', async () => {
    const idSegment = await addSegment(api[owner], 'Shared Checkout');
    expect(await visibleTo(member, idSite)).not.toContain(idSegment);

    await share(api[owner], idSegment);
    // only super users can share with a group without a role for the website of the segment
    await share(su, idSegment, noSiteTeam.idGroup);

    expect(await visibleTo(member, idSite)).toContain(idSegment);
    expect(await visibleTo(member)).toContain(idSegment);
    const segment: Segment = await api[member].call('SegmentEditor.get', { idSegment });
    expect(segment.name).toBe(`Shared Checkout ${RUN_ID}`);
    expect(segment.login).toBe(owner);

    // the owner sees it once
    expect((await visibleTo(owner, idSite)).filter((id) => id === idSegment)).toHaveLength(1);
    // not shared with the outsider's groups
    expect(await visibleTo(outsider, idSite)).not.toContain(idSegment);
    await expect(api[outsider].expectError('SegmentEditor.get', { idSegment })).resolves.toContain('You can only edit and delete');
    // member of the group, but no access to the website of the segment
    expect(await visibleTo(memberWithoutSiteAccess)).not.toContain(idSegment);
    expect(await visibleTo(memberWithoutSiteAccess, otherSite)).not.toContain(idSegment);
    // Matomo 5.1 reports the missing permission for the segment, later versions the missing website access
    await expect(api[memberWithoutSiteAccess].expectError('SegmentEditor.get', { idSegment }))
      .resolves.toMatch(/You can only edit and delete|requires 'view' access/);

    // members cannot edit or delete it
    await expect(api[member].expectError('SegmentEditor.update', {
      idSegment, name: 'Hijacked', definition: 'pageUrl=@hijacked', idSite,
    })).resolves.toContain('You can only edit and delete');
    await expect(api[member].expectError('SegmentEditor.delete', { idSegment })).resolves.toContain('You can only edit and delete');

    expect(await api[owner].call('GroupPermissions.getGroupsOfSegment', { idSegment })).toEqual(
      [noSiteTeam, team].map((g) => ({ idGroup: g.idGroup, name: g.name })),
    );

    await api[owner].call('GroupPermissions.unshareSegmentFromGroup', { idSegment, idGroup: team.idGroup });
    await api[owner].call('GroupPermissions.unshareSegmentFromGroup', { idSegment, idGroup: noSiteTeam.idGroup });
    expect(await visibleTo(member, idSite)).not.toContain(idSegment);
    expect(await api[owner].call('GroupPermissions.getGroupsOfSegment', { idSegment })).toEqual([]);
  });

  test('segments for other websites are not listed for a website', async () => {
    await su.setGroupAccess(team.name, 'view', otherSite);
    await su.setUserAccess(owner, 'view', otherSite);
    const idSegment = await addSegment(api[owner], 'Other Site Segment', otherSite);
    await share(api[owner], idSegment);

    expect(await visibleTo(member, idSite)).not.toContain(idSegment);
    expect(await visibleTo(member, otherSite)).toContain(idSegment);
    expect(await visibleTo(member)).toContain(idSegment);
    await su.setGroupAccess(team.name, 'noaccess', otherSite);
    expect(await visibleTo(member)).not.toContain(idSegment);
  });

  test('super users can share any segment, others only their own with admin access', async () => {
    const ownSegment = await addSegment(api[owner], 'Permission Segment');
    const outsiderSegment = await addSegment(api[outsider], 'Outsider Segment');

    // view access only
    await expect(api[outsider].expectError('GroupPermissions.shareSegmentWithGroup', { idSegment: outsiderSegment, idGroup: team.idGroup }))
      .resolves.toMatch(/admin/i);
    // segment of another user
    await expect(api[owner].expectError('GroupPermissions.shareSegmentWithGroup', { idSegment: outsiderSegment, idGroup: team.idGroup }))
      .resolves.toContain('does not exist or you are not allowed to share it');
    await expect(api[owner].expectError('GroupPermissions.getGroupsOfSegment', { idSegment: outsiderSegment }))
      .resolves.toContain('does not exist or you are not allowed to share it');
    await expect(api[owner].expectError('GroupPermissions.shareSegmentWithGroup', { idSegment: 999999, idGroup: team.idGroup }))
      .resolves.toContain('does not exist or you are not allowed to share it');
    await expect(api[owner].expectError('GroupPermissions.shareSegmentWithGroup', { idSegment: ownSegment, idGroup: 999999 }))
      .resolves.toContain('Group does not exist');
    await expect(api[owner].expectError('GroupPermissions.getSegmentsForGroup', { idGroup: team.idGroup }))
      .resolves.toMatch(/super ?user/i);

    // groups without a role for the website of the segment, or for a website the owner administers (segments of all
    // websites); unsharing is always possible
    await expect(api[owner].expectError('GroupPermissions.shareSegmentWithGroup', { idSegment: ownSegment, idGroup: noSiteTeam.idGroup }))
      .resolves.toContain('has no access to the website of the segment');
    await api[owner].call('GroupPermissions.unshareSegmentFromGroup', { idSegment: ownSegment, idGroup: noSiteTeam.idGroup });
    // only super users can make a segment available on all websites: Matomo keeps the creator
    const allSitesSegment = await addSegment(api[owner], 'All Sites Permission Segment');
    await su.call('SegmentEditor.update', {
      idSegment: allSitesSegment, name: `All Sites Permission Segment ${RUN_ID}`, definition: `pageUrl=@all-sites-permission-${RUN_ID}`,
    });
    expect(Number((await su.call('SegmentEditor.get', { idSegment: allSitesSegment })).enable_only_idsite)).toBe(0);
    await expect(api[owner].expectError('GroupPermissions.shareSegmentWithGroup', { idSegment: allSitesSegment, idGroup: noSiteTeam.idGroup }))
      .resolves.toContain('has no access to the website of the segment');
    await share(api[owner], allSitesSegment);
    expect(await api[owner].call('GroupPermissions.getGroupsOfSegment', { idSegment: allSitesSegment }))
      .toEqual([{ idGroup: team.idGroup, name: team.name }]);
    await share(su, allSitesSegment, noSiteTeam.idGroup);

    await share(su, outsiderSegment);
    expect(await visibleTo(member, idSite)).toContain(outsiderSegment);
    const listed: GroupSegment[] = await su.call('GroupPermissions.getSegmentsForGroup', { idGroup: team.idGroup, filter_limit: -1 });
    expect(listed.find((s) => s.idSegment === outsiderSegment)).toMatchObject({
      name: `Outsider Segment ${RUN_ID}`, login: outsider, idSite, enabledAllUsers: false, isShared: true,
    });
    expect(listed.find((s) => s.idSegment === ownSegment)).toMatchObject({ isShared: false });
  });

  test('deleting a segment or a group removes its shares', async () => {
    const idSegment = await addSegment(api[owner], 'Deleted Segment');
    await share(api[owner], idSegment);
    await api[owner].call('SegmentEditor.delete', { idSegment });
    expect(await visibleTo(member, idSite)).not.toContain(idSegment);
    const listed: GroupSegment[] = await su.call('GroupPermissions.getSegmentsForGroup', { idGroup: team.idGroup, filter_limit: -1 });
    expect(listed.map((s) => s.idSegment)).not.toContain(idSegment);

    const tempGroup = await su.createGroup('Segment Temp');
    await su.addMembers(tempGroup.idGroup, [outsider]);
    const keptSegment = await addSegment(api[owner], 'Kept Segment');
    await share(su, keptSegment, tempGroup.idGroup);
    expect(await visibleTo(outsider, idSite)).toContain(keptSegment);
    await su.call('GroupPermissions.deleteGroup', { idGroup: tempGroup.idGroup });
    expect(await visibleTo(outsider, idSite)).not.toContain(keptSegment);
    expect(await api[owner].call('GroupPermissions.getGroupsOfSegment', { idSegment: keptSegment })).toEqual([]);
  });

  test('the segment selector of a member lists the shared segment', async ({ browser }) => {
    const idSegment = await addSegment(api[owner], 'Selector Segment');
    await share(api[owner], idSegment);

    // without any visit Matomo shows the tracking code instead of the reports
    // with a browser user agent: newer Matomo versions silently drop tracking requests of bots (e.g. Node's fetch)
    const track = await fetch(`${MATOMO_URL}/matomo.php?idsite=${idSite}&rec=1&url=${encodeURIComponent('https://segments.example.org/')}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' },
    });
    expect(track.ok).toBe(true);

    const page = await pageAs(browser, member);
    await page.goto(`/index.php?module=CoreHome&action=index&idSite=${idSite}&period=day&date=yesterday#?idSite=${idSite}&period=day&date=yesterday&category=General_Visitors&subcategory=General_Overview`);
    await waitForIdle(page);
    // new users get Matomo's "What's new" popup
    const whatsNew = page.getByRole('button', { name: /remind me later/i });
    if (await whatsNew.isVisible()) {
      await whatsNew.click();
      await expect(page.locator('.ui-widget-overlay')).toHaveCount(0);
    }
    await page.locator('.segmentEditorPanel .segmentationContainer .title').first().click();
    const item = page.locator(`.segmentList li[data-idsegment="${idSegment}"]`);
    await expect(item).toBeVisible();
    await expect(item).toContainText(`Selector Segment ${RUN_ID}`);
    await page.context().close();
  });

  test('the scheduled reports form of a member does not offer group segments, which Matomo cannot save', async ({ browser }) => {
    const idGroupSegment = await addSegment(api[owner], 'Report Form Group Segment');
    await share(api[owner], idGroupSegment);
    const idAllUsersSegment = Number((await su.call('SegmentEditor.add', {
      name: `Report Form All Users ${RUN_ID}`, definition: `pageUrl=@report-form-all-${RUN_ID}`, idSite, enabledAllUsers: 1,
    })).value);

    // still listed outside of the scheduled reports UI
    expect(await visibleTo(member, idSite)).toContain(idGroupSegment);

    const page = await pageAs(browser, member);
    await page.goto(`/index.php?module=ScheduledReports&action=index&idSite=${idSite}&period=day&date=yesterday`);
    await waitForIdle(page);
    const html = await page.content();
    expect(html).toContain(`Report Form All Users ${RUN_ID}`);
    expect(html).not.toContain(`Report Form Group Segment ${RUN_ID}`);
    await page.context().close();

    await su.call('SegmentEditor.delete', { idSegment: idAllUsersSegment });
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('segments can be shared and unshared in the group editor', async ({ page }) => {
      const group = await su.createGroup('Segment UI');
      const idSegment = await addSegment(api[owner], 'UI Segment');
      const segmentName = `UI Segment ${RUN_ID}`;

      await openGroupEditor(page, group.idGroup, 'members');
      await switchEditorTab(page, 'segments');
      await expect(page.locator('.groupPermissionsSegmentsTable .groupPermissionsEmpty')).toBeVisible();

      const form = page.locator('.groupPermissionsShareSegment');
      await chooseOption(form.locator('.groupPermissionsSegmentField'), `${segmentName} (Segment Site ${RUN_ID}, ${owner})`);
      await saveButton(form, 'groupPermissionsShareSegmentButton').click();
      await waitForIdle(page);
      await expect(toast(page, `The segment '${segmentName}' is now shared with the group '${group.name}'.`)).toBeVisible();

      const row = page.locator(`tr.groupPermissionsSegmentRow[data-id-segment="${idSegment}"]`);
      await expect(row.locator('td')).toHaveText([segmentName, `Segment Site ${RUN_ID}`, owner, '']);
      expect(await su.call('GroupPermissions.getGroupsOfSegment', { idSegment })).toEqual([
        { idGroup: group.idGroup, name: group.name },
      ]);
      await screenshot(page.locator('.groupPermissionsEditGroup'), 'group-editor-segments');

      // the URL keeps the section
      await page.reload();
      await expect(page.locator('.groupPermissionsEditGroup .listCircle li[data-tab="segments"]')).toHaveClass(/active/);
      await waitForIdle(page);

      await row.locator('.groupPermissionsUnshareSegment').click();
      await clickModalButton(page, 'Yes');
      await waitForIdle(page);
      await expect(toast(page, `is no longer shared with the group '${group.name}'`)).toBeVisible();
      await expect(page.locator('.groupPermissionsSegmentsTable .groupPermissionsEmpty')).toBeVisible();
      expect(await su.call('GroupPermissions.getGroupsOfSegment', { idSegment })).toEqual([]);
    });
  });
});
