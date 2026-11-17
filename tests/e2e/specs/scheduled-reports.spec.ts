import { test, expect, Browser } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, RUN_ID, superUserStorageState } from '../helpers/env';
import { waitForMessageTo } from '../helpers/mailpit';
import {
  chooseOption, clickModalButton, login, openGroupEditor, saveButton, screenshot, switchEditorTab, toast, waitForIdle,
} from '../helpers/ui';

/**
 * Shared ownership of scheduled email reports: members of a group can manage the reports shared with it.
 */

type Report = {
  idreport: string | number; idsite: string | number; login: string; description: string; idsegment: string | number | null;
  parameters: { additionalEmails?: string[]; emailMe?: boolean };
};
type GroupReport = {
  idReport: number; description: string; login: string; idSite: number; siteName: string; type: string; isShared: boolean;
};

async function pageAs(browser: Browser, user: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page, user, DEFAULT_PASSWORD);
  return page;
}

test.describe('Shared ownership of scheduled reports', () => {
  let su: MatomoApi;
  let idSite: number;
  let otherSite: number;
  let team: { idGroup: number; name: string };
  let owner: string;
  let member: string;
  let memberWithoutSiteAccess: string;
  let outsider: string;
  let noSiteTeam: { idGroup: number; name: string };
  let api: Record<string, MatomoApi>;

  const reportIds = (reports: Report[]): number[] => reports.map((r) => Number(r.idreport));
  const reportParams = (description: string, site: number, extra: Record<string, string | number | boolean | string[]> = {}) => ({
    idSite: site,
    description,
    period: 'never',
    hour: 0,
    reportType: 'email',
    reportFormat: 'html',
    reports: ['VisitsSummary_get'],
    'parameters[displayFormat]': 1,
    'parameters[emailMe]': true,
    'parameters[evolutionGraph]': false,
    ...extra,
  });
  const addReport = async (as: MatomoApi, name: string, site = idSite, extra = {}): Promise<number> =>
    Number((await as.call('ScheduledReports.addReport', reportParams(`${name} ${RUN_ID}`, site, extra))).value);
  const share = (as: MatomoApi, idReport: number, idGroup = team.idGroup) =>
    as.call('GroupPermissions.shareReportWithGroup', { idReport, idGroup });
  const visibleTo = async (user: string, site?: number): Promise<number[]> =>
    reportIds(await api[user].call('ScheduledReports.getReports', { idSite: site, filter_limit: -1 }));
  const reportAsSuperUser = async (idReport: number): Promise<Report> =>
    (await su.call('ScheduledReports.getReports', { idReport }))[0];
  const addSegment = async (as: MatomoApi, name: string): Promise<number> =>
    Number((await as.call('SegmentEditor.add', {
      name: `${name} ${RUN_ID}`,
      definition: `pageUrl=@${name.toLowerCase().replace(/\W+/g, '-')}-${RUN_ID}`,
      idSite,
    })).value);

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    idSite = await su.createSite('Report Site');
    otherSite = await su.createSite('Report Other Site');
    team = await su.createGroup('Report Team');

    owner = await su.createUser('rep_owner');
    member = await su.createUser('rep_member');
    memberWithoutSiteAccess = await su.createUser('rep_nosite');
    outsider = await su.createUser('rep_outsider');

    await su.setUserAccess(owner, 'admin', idSite);
    await su.setUserAccess(outsider, 'view', idSite);
    await su.setUserAccess(memberWithoutSiteAccess, 'view', otherSite);
    // the member gets view access through the group
    await su.addMembers(team.idGroup, [member]);
    await su.setGroupAccess(team.name, 'view', idSite);
    // a group without access to the website of the reports
    noSiteTeam = await su.createGroup('Report No Site Team');
    await su.addMembers(noSiteTeam.idGroup, [memberWithoutSiteAccess]);

    api = {};
    for (const user of [owner, member, memberWithoutSiteAccess, outsider]) {
      api[user] = await MatomoApi.forUser(user, DEFAULT_PASSWORD);
    }
  });

  test('members with access to the website see a shared report, others do not', async () => {
    const idReport = await addReport(api[owner], 'Shared Weekly');
    expect(await visibleTo(member, idSite)).not.toContain(idReport);
    await expect(api[member].expectError('ScheduledReports.getReports', { idReport })).resolves.toContain("couldn't be found");

    await share(api[owner], idReport);

    expect(await visibleTo(member, idSite)).toContain(idReport);
    expect(await visibleTo(member)).toContain(idReport);
    const [report]: Report[] = await api[member].call('ScheduledReports.getReports', { idReport });
    expect(report.description).toBe(`Shared Weekly ${RUN_ID}`);
    expect(report.login).toBe(owner);
    expect(await visibleTo(member, otherSite).catch(() => [])).not.toContain(idReport);

    // the owner sees it once
    expect((await visibleTo(owner, idSite)).filter((id) => id === idReport)).toHaveLength(1);
    // not shared with the outsider's groups
    expect(await visibleTo(outsider, idSite)).not.toContain(idReport);
    await expect(api[outsider].expectError('ScheduledReports.updateReport', {
      idReport, ...reportParams('Hijacked', idSite),
    })).resolves.toContain("couldn't be found");
    await expect(api[outsider].expectError('ScheduledReports.deleteReport', { idReport })).resolves.toContain("couldn't be found");

    // member of a group the report is shared with, but no access to the website of the report
    await share(api[owner], idReport, noSiteTeam.idGroup);
    expect(await visibleTo(memberWithoutSiteAccess)).not.toContain(idReport);
    expect(await visibleTo(memberWithoutSiteAccess, otherSite)).not.toContain(idReport);
    await expect(api[memberWithoutSiteAccess].expectError('ScheduledReports.getReports', { idReport }))
      .resolves.toContain("couldn't be found");
    await expect(api[memberWithoutSiteAccess].expectError('ScheduledReports.updateReport', {
      idReport, ...reportParams('Hijacked', idSite),
    })).resolves.toMatch(/view|access/i);
    await expect(api[memberWithoutSiteAccess].expectError('ScheduledReports.sendReport', { idReport, force: true }))
      .resolves.toContain("couldn't be found");
    await expect(api[memberWithoutSiteAccess].expectError('ScheduledReports.deleteReport', { idReport }))
      .resolves.toContain("couldn't be found");

    expect(await api[owner].call('GroupPermissions.getGroupsOfReport', { idReport })).toEqual(
      [noSiteTeam, team].map((g) => ({ idGroup: g.idGroup, name: g.name })),
    );
    await api[owner].call('GroupPermissions.unshareReportFromGroup', { idReport, idGroup: team.idGroup });
    await api[owner].call('GroupPermissions.unshareReportFromGroup', { idReport, idGroup: noSiteTeam.idGroup });
    expect(await visibleTo(member, idSite)).not.toContain(idReport);
    expect(await api[owner].call('GroupPermissions.getGroupsOfReport', { idReport })).toEqual([]);
  });

  test('members can edit a shared report while the creator stays its owner', async () => {
    // the creator's private segment: members cannot load it, but can keep it
    const idSegment = await addSegment(api[owner], 'Owner Private Segment');
    const idReport = await addReport(api[owner], 'Editable', idSite, { idSegment });
    await share(api[owner], idReport);

    await api[member].call('ScheduledReports.updateReport', {
      idReport,
      ...reportParams(`Edited by member ${RUN_ID}`, idSite, {
        idSegment,
        'parameters[additionalEmails]': [`colleague-${RUN_ID}@example.org`],
        reports: ['VisitsSummary_get', 'UserCountry_getCountry'],
      }),
    });

    const report = await reportAsSuperUser(idReport);
    expect(report.description).toBe(`Edited by member ${RUN_ID}`);
    expect(report.login).toBe(owner);
    expect(Number(report.idsegment)).toBe(idSegment);
    expect(report.parameters.additionalEmails).toEqual([`colleague-${RUN_ID}@example.org`]);
    // the owner still sees and manages it
    expect(await visibleTo(owner, idSite)).toContain(idReport);

    // another segment must be visible to the member
    const otherPrivateSegment = await addSegment(api[owner], 'Other Private Segment');
    await expect(api[member].expectError('ScheduledReports.updateReport', {
      idReport, ...reportParams('x', idSite, { idSegment: otherPrivateSegment }),
    })).resolves.toContain('does not exist');
    // a segment shared with the member's group can be used
    await api[owner].call('GroupPermissions.shareSegmentWithGroup', { idSegment: otherPrivateSegment, idGroup: team.idGroup });
    await api[member].call('ScheduledReports.updateReport', {
      idReport, ...reportParams(`Edited by member ${RUN_ID}`, idSite, { idSegment: otherPrivateSegment }),
    });
    expect(Number((await reportAsSuperUser(idReport)).idsegment)).toBe(otherPrivateSegment);

    // the report cannot be moved to another website or changed to another type
    await su.setGroupAccess(team.name, 'view', otherSite);
    try {
      await expect(api[member].expectError('ScheduledReports.updateReport', {
        idReport, ...reportParams('Moved', otherSite),
      })).resolves.toContain("couldn't be found");
    } finally {
      await su.setGroupAccess(team.name, 'noaccess', otherSite);
    }
    await expect(api[member].expectError('ScheduledReports.updateReport', {
      idReport, ...reportParams('SMS', idSite, { reportType: 'mobile', reportFormat: 'sms' }),
    })).resolves.toContain('Only email reports can be shared');
    // reports that do not exist for the website are rejected as usual
    await expect(api[member].expectError('ScheduledReports.updateReport', {
      idReport, ...reportParams('Unknown', idSite, { reports: ['Nope_getNothing'] }),
    })).resolves.toContain('is unknown or not available');
    expect((await reportAsSuperUser(idReport)).description).toBe(`Edited by member ${RUN_ID}`);
  });

  test('members can send and download a shared report', async () => {
    const idSegment = await addSegment(api[owner], 'Send Segment');
    const recipient = `send-${RUN_ID}@example.org`;
    // scheduled "never" (only sent manually): Matomo 5.x core cannot send these, the plugin treats them as daily
    const idReport = await addReport(api[owner], 'Sendable', idSite, {
      idSegment, 'parameters[emailMe]': false, 'parameters[additionalEmails]': [recipient],
    });
    await share(api[owner], idReport);

    await api[member].call('ScheduledReports.sendReport', { idReport, force: true });
    const message = await waitForMessageTo(recipient);
    expect(message.HTML).toContain(`Sendable ${RUN_ID}`);

    const response = await api[member].fetchRaw('ScheduledReports.generateReport', {
      idReport, date: 'yesterday', outputType: 3, format: 'html',
    });
    expect(response.ok).toBe(true);
    expect(await response.text()).toContain(`Sendable ${RUN_ID}`);
  });

  test('members can delete a shared report, which removes its shares', async () => {
    const idReport = await addReport(api[owner], 'Deletable');
    await share(api[owner], idReport);

    await api[member].call('ScheduledReports.deleteReport', { idReport });
    expect(await visibleTo(owner, idSite)).not.toContain(idReport);
    const listed: GroupReport[] = await su.call('GroupPermissions.getReportsForGroup', { idGroup: team.idGroup, filter_limit: -1 });
    expect(listed.map((r) => r.idReport)).not.toContain(idReport);
  });

  test('loading shared reports does not reveal other reports later in the same request', async () => {
    const shared = await addReport(api[owner], 'Bulk Shared');
    const notShared = await addReport(api[outsider], 'Bulk Not Shared');
    await share(api[owner], shared);

    // a bulk request runs all calls in one PHP request, where the core caches reports
    const call = `method=ScheduledReports.getReports&idSite=${idSite}&format=json`;
    const results: Report[][] = await api[member].call('API.getBulkRequest', { urls: [call, call] });
    expect(results).toHaveLength(2);
    for (const reports of results) {
      expect(reportIds(reports)).toContain(shared);
      expect(reportIds(reports)).not.toContain(notShared);
      expect(reports.every((r) => r.login === member || r.login === owner)).toBe(true);
    }

    // a super user's own reports list (as on the "Email reports" page) is not mixed up either
    const suResults: Report[][] = await su.call('API.getBulkRequest', {
      urls: [`${call}&ifSuperUserReturnOnlySuperUserReports=1`, call],
    });
    expect(reportIds(suResults[0])).not.toContain(notShared);
    expect(reportIds(suResults[1])).toContain(notShared);
  });

  test('super users can share any email report, others only their own with admin access', async () => {
    const ownReport = await addReport(api[owner], 'Permission Report');
    const outsiderReport = await addReport(api[outsider], 'Outsider Report');

    // view access only
    await expect(api[outsider].expectError('GroupPermissions.shareReportWithGroup', { idReport: outsiderReport, idGroup: team.idGroup }))
      .resolves.toMatch(/admin/i);
    // report of another user
    await expect(api[owner].expectError('GroupPermissions.shareReportWithGroup', { idReport: outsiderReport, idGroup: team.idGroup }))
      .resolves.toContain('does not exist or you are not allowed to share it');
    await expect(api[owner].expectError('GroupPermissions.getGroupsOfReport', { idReport: outsiderReport }))
      .resolves.toContain('does not exist or you are not allowed to share it');
    await expect(api[owner].expectError('GroupPermissions.shareReportWithGroup', { idReport: 999999, idGroup: team.idGroup }))
      .resolves.toContain('does not exist or you are not allowed to share it');
    await expect(api[owner].expectError('GroupPermissions.shareReportWithGroup', { idReport: ownReport, idGroup: 999999 }))
      .resolves.toContain('Group does not exist');
    await expect(api[owner].expectError('GroupPermissions.getReportsForGroup', { idGroup: team.idGroup }))
      .resolves.toMatch(/super ?user/i);

    await share(su, outsiderReport);
    expect(await visibleTo(member, idSite)).toContain(outsiderReport);
    const listed: GroupReport[] = await su.call('GroupPermissions.getReportsForGroup', { idGroup: team.idGroup, filter_limit: -1 });
    expect(listed.find((r) => r.idReport === outsiderReport)).toMatchObject({
      description: `Outsider Report ${RUN_ID}`, login: outsider, idSite, siteName: `Report Site ${RUN_ID}`, type: 'email', isShared: true,
    });
    expect(listed.find((r) => r.idReport === ownReport)).toMatchObject({ isShared: false });
  });

  test('removing a member or deleting the group ends the shared ownership', async () => {
    const tempGroup = await su.createGroup('Report Temp');
    await su.addMembers(tempGroup.idGroup, [outsider]);
    const idReport = await addReport(api[owner], 'Temp Group Report');
    await share(api[owner], idReport, tempGroup.idGroup);
    expect(await visibleTo(outsider, idSite)).toContain(idReport);

    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: tempGroup.idGroup, login: outsider });
    expect(await visibleTo(outsider, idSite)).not.toContain(idReport);
    await su.addMembers(tempGroup.idGroup, [outsider]);
    expect(await visibleTo(outsider, idSite)).toContain(idReport);

    await su.call('GroupPermissions.deleteGroup', { idGroup: tempGroup.idGroup });
    expect(await visibleTo(outsider, idSite)).not.toContain(idReport);
    expect(await api[owner].call('GroupPermissions.getGroupsOfReport', { idReport })).toEqual([]);
  });

  test('the shared reports of a deleted user are handed over to a member with access', async () => {
    const leaver = await su.createUser('rep_leaver');
    await su.setUserAccess(leaver, 'admin', idSite);
    const leaverApi = await MatomoApi.forUser(leaver, DEFAULT_PASSWORD);

    const sharedWithTeam = await addReport(leaverApi, 'Leaver Shared');
    await share(leaverApi, sharedWithTeam);
    // only shared with a group whose member has no access to the website
    const sharedWithoutAccess = await addReport(leaverApi, 'Leaver No Access');
    await share(leaverApi, sharedWithoutAccess, noSiteTeam.idGroup);
    const notShared = await addReport(leaverApi, 'Leaver Private');

    await su.deleteUser(leaver);

    const all = reportIds(await su.call('ScheduledReports.getReports', { filter_limit: -1 }));
    expect(all).toContain(sharedWithTeam);
    expect(all).not.toContain(sharedWithoutAccess);
    expect(all).not.toContain(notShared);

    const report = await reportAsSuperUser(sharedWithTeam);
    expect(report.login).toBe(member);
    expect(report.description).toBe(`Leaver Shared ${RUN_ID}`);
    // still shared, the new owner manages it as their own report
    expect(await su.call('GroupPermissions.getGroupsOfReport', { idReport: sharedWithTeam })).toEqual([
      { idGroup: team.idGroup, name: team.name },
    ]);
    await api[member].call('ScheduledReports.updateReport', {
      idReport: sharedWithTeam, ...reportParams(`Taken over ${RUN_ID}`, idSite),
    });
    expect((await reportAsSuperUser(sharedWithTeam)).description).toBe(`Taken over ${RUN_ID}`);
  });

  test('a private segment of a deleted user goes to the new owners of their reports', async () => {
    const leaver = await su.createUser('rep_segleaver');
    await su.setUserAccess(leaver, 'admin', idSite);
    const leaverApi = await MatomoApi.forUser(leaver, DEFAULT_PASSWORD);

    // a second new owner: the only member of another group with access to the website
    const otherTeam = await su.createGroup('Report Other Team');
    const otherMember = await su.createUser('rep_othermember');
    await su.addMembers(otherTeam.idGroup, [otherMember]);
    await su.setGroupAccess(otherTeam.name, 'view', idSite);
    const otherMemberApi = await MatomoApi.forUser(otherMember, DEFAULT_PASSWORD);

    const idSegment = await addSegment(leaverApi, 'Leaver Segment');
    const toMember = await addReport(leaverApi, 'Leaver Segmented', idSite, { idSegment });
    await share(leaverApi, toMember);
    const toOtherMember = await addReport(leaverApi, 'Leaver Segmented Other', idSite, { idSegment });
    await share(leaverApi, toOtherMember, otherTeam.idGroup);

    await su.deleteUser(leaver);

    // the first new owner gets the segment itself
    const first = await reportAsSuperUser(toMember);
    expect(first.login).toBe(member);
    expect(Number(first.idsegment)).toBe(idSegment);
    const segment = await su.call('SegmentEditor.get', { idSegment });
    expect(segment.login).toBe(member);

    // the other one a copy with the same definition
    const second = await reportAsSuperUser(toOtherMember);
    expect(second.login).toBe(otherMember);
    const idCopy = Number(second.idsegment);
    expect(idCopy).not.toBe(idSegment);
    const copy = await su.call('SegmentEditor.get', { idSegment: idCopy });
    expect(copy).toMatchObject({ login: otherMember, definition: segment.definition, name: segment.name });

    // both can still save and download their report with the segment
    for (const [as, idReport, segmentId] of [
      [api[member], toMember, idSegment], [otherMemberApi, toOtherMember, idCopy],
    ] as const) {
      await as.call('ScheduledReports.updateReport', {
        idReport, ...reportParams(`Segmented taken over ${idReport} ${RUN_ID}`, idSite, { idSegment: segmentId }),
      });
      const response = await as.fetchRaw('ScheduledReports.generateReport', {
        idReport, date: 'yesterday', outputType: 3, format: 'html',
      });
      expect(response.ok).toBe(true);
      expect(await response.text()).toContain(`Segmented taken over ${idReport} ${RUN_ID}`);
    }
  });

  test('a member edits a shared report on the "Email reports" page', async ({ browser }) => {
    const idReport = await addReport(api[owner], 'UI Editable');
    await share(api[owner], idReport);

    const page = await pageAs(browser, member);
    await page.goto(`/index.php?module=ScheduledReports&action=index&idSite=${idSite}&period=day&date=yesterday`);
    await waitForIdle(page);
    const whatsNew = page.getByRole('button', { name: /remind me later/i });
    if (await whatsNew.isVisible()) {
      await whatsNew.click();
      await expect(page.locator('.ui-widget-overlay')).toHaveCount(0);
    }

    const row = page.locator('tr', { hasText: `UI Editable ${RUN_ID}` });
    await expect(row).toBeVisible();
    // "Send report to me" goes to the creator, not to the member viewing the report
    await expect(row).toContainText(`${owner}@example.org`);
    await expect(row).not.toContainText(`${member}@example.org`);
    await screenshot(page.locator('.entityTableContainer'), 'scheduled-reports-shared-with-member');

    await row.locator('button[title="Edit"]').click();
    // a textarea in Matomo 5.1, a text input ("Name") in later versions
    const description = page.locator('#addEditReport #report_description');
    await expect(description).toHaveValue(`UI Editable ${RUN_ID}`);
    await description.fill(`UI Edited ${RUN_ID}`);
    // the field listens to keydown/change events only
    await description.dispatchEvent('change');
    await page.locator('#addEditReport .matomo-save-button input').click();
    await waitForIdle(page);
    await expect(page.locator('tr', { hasText: `UI Edited ${RUN_ID}` })).toBeVisible();

    const report = await reportAsSuperUser(idReport);
    expect(report.description).toBe(`UI Edited ${RUN_ID}`);
    expect(report.login).toBe(owner);
    await page.context().close();
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('reports can be shared and unshared in the group editor', async ({ page }) => {
      const group = await su.createGroup('Report UI');
      const idReport = await addReport(api[owner], 'UI Report');
      const reportName = `UI Report ${RUN_ID}`;

      await openGroupEditor(page, group.idGroup, 'members');
      await switchEditorTab(page, 'reports');
      await expect(page.locator('.groupPermissionsReportsTable .groupPermissionsEmpty')).toBeVisible();

      const form = page.locator('.groupPermissionsShareReport');
      await chooseOption(form.locator('.groupPermissionsReportField'), `${reportName} (Report Site ${RUN_ID}, ${owner})`);
      await saveButton(form, 'groupPermissionsShareReportButton').click();
      await waitForIdle(page);
      await expect(toast(page, `The report '${reportName}' is now shared with the group '${group.name}'.`)).toBeVisible();

      const row = page.locator(`tr.groupPermissionsReportRow[data-id-report="${idReport}"]`);
      await expect(row.locator('td')).toHaveText([reportName, `Report Site ${RUN_ID}`, owner, '']);
      expect(await su.call('GroupPermissions.getGroupsOfReport', { idReport })).toEqual([
        { idGroup: group.idGroup, name: group.name },
      ]);
      await screenshot(page.locator('.groupPermissionsEditGroup'), 'group-editor-reports');

      // the URL keeps the section
      await page.reload();
      await expect(page.locator('.groupPermissionsEditGroup .listCircle li[data-tab="reports"]')).toHaveClass(/active/);
      await waitForIdle(page);

      await row.locator('.groupPermissionsUnshareReport').click();
      await clickModalButton(page, 'Yes');
      await waitForIdle(page);
      await expect(toast(page, `is no longer shared with the group '${group.name}'`)).toBeVisible();
      await expect(page.locator('.groupPermissionsReportsTable .groupPermissionsEmpty')).toBeVisible();
      expect(await su.call('GroupPermissions.getGroupsOfReport', { idReport })).toEqual([]);
    });
  });
});
