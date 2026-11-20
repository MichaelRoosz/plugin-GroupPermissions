import { test, expect } from '@playwright/test';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, RUN_ID, SUPERUSER, superUserStorageState } from '../helpers/env';
import { waitForMessageTo } from '../helpers/mailpit';
import {
  chooseOption, openGroupEditor, saveButton, screenshot, switchEditorTab, toast, waitForIdle,
} from '../helpers/ui';

/**
 * Copying scheduled email reports to the members of a group: every member gets an independent copy of their own.
 */

type Report = {
  idreport: string | number; idsite: string | number; login: string; description: string; idsegment: string | number | null;
  period: string; reports: string[];
  parameters: { additionalEmails?: string[]; emailMe?: boolean; displayFormat?: string | number };
};
type CopyableReport = {
  idReport: number; description: string; login: string; idSite: number; siteName: string; period: string; idSegment: number;
};

test.describe('Copy scheduled reports to a group', () => {
  let su: MatomoApi;
  let idSite: number;
  let otherSite: number;
  let team: { idGroup: number; name: string };
  let owner: string;
  let member: string;
  let memberWithoutSiteAccess: string;
  let outsider: string;
  let api: Record<string, MatomoApi>;

  const reportParams = (description: string, site: number, extra: Record<string, string | number | boolean | string[]> = {}) => ({
    idSite: site,
    description,
    period: 'week',
    hour: 3,
    reportType: 'email',
    reportFormat: 'html',
    reports: ['VisitsSummary_get', 'UserCountry_getCountry'],
    'parameters[displayFormat]': 2,
    'parameters[emailMe]': false,
    'parameters[additionalEmails]': [`team-${RUN_ID}@example.org`],
    'parameters[evolutionGraph]': false,
    ...extra,
  });
  const addReport = async (as: MatomoApi, name: string, site = idSite, extra = {}): Promise<number> =>
    Number((await as.call('ScheduledReports.addReport', reportParams(`${name} ${RUN_ID}`, site, extra))).value);
  const copy = async (as: MatomoApi, idReport: number, idGroup = team.idGroup): Promise<string[]> =>
    as.call('GroupPermissions.copyReportToGroup', { idReport, idGroup });
  const reportsOf = async (login: string, description: string): Promise<Report[]> =>
    ((await su.call('ScheduledReports.getReports', { filter_limit: -1 })) as Report[])
      .filter((r) => r.login === login && r.description === description);

  test.beforeAll(async () => {
    su = await MatomoApi.superUser();
    idSite = await su.createSite('Copy Report Site');
    otherSite = await su.createSite('Copy Report Other Site');
    team = await su.createGroup('Copy Report Team');

    owner = await su.createUser('crep_owner');
    member = await su.createUser('crep_member');
    memberWithoutSiteAccess = await su.createUser('crep_nosite');
    outsider = await su.createUser('crep_outsider');

    await su.setUserAccess(owner, 'admin', idSite);
    await su.setUserAccess(outsider, 'view', idSite);
    await su.setUserAccess(memberWithoutSiteAccess, 'view', otherSite);
    // the member gets view access through the group, the owner is a member as well
    await su.addMembers(team.idGroup, [owner, member]);
    await su.setGroupAccess(team.name, 'view', idSite);

    api = {};
    for (const user of [owner, member, memberWithoutSiteAccess, outsider]) {
      api[user] = await MatomoApi.forUser(user, DEFAULT_PASSWORD);
    }
  });

  test('members with access to the website get a copy of their own, sent to them only', async () => {
    // a group without website access: members get a copy if they have access to the website in another way
    const group = await su.createGroup('Copy Report Members');
    const invited = `crep_invited_${RUN_ID}`;
    await su.addMembers(group.idGroup, [owner, member, memberWithoutSiteAccess]);
    // has access to the website through the team, but did not accept the invitation yet
    await su.call('GroupPermissions.inviteUserToGroups', {
      userLogin: invited,
      email: `${invited}@example.org`,
      idGroups: `${group.idGroup},${team.idGroup}`,
      passwordConfirmation: SUPERUSER.password,
    });

    const description = `Weekly ${RUN_ID}`;
    const idReport = await addReport(api[owner], 'Weekly');

    expect(await copy(api[owner], idReport, group.idGroup)).toEqual([member]);

    const [original] = await reportsOf(owner, description);
    expect(Number(original.idreport)).toBe(idReport);
    expect(original.parameters.additionalEmails).toEqual([`team-${RUN_ID}@example.org`]);

    const copies = await reportsOf(member, description);
    expect(copies).toHaveLength(1);
    const [memberCopy] = copies;
    expect(Number(memberCopy.idreport)).not.toBe(idReport);
    expect(Number(memberCopy.idsite)).toBe(idSite);
    expect(memberCopy.period).toBe('week');
    expect(memberCopy.reports).toEqual(['VisitsSummary_get', 'UserCountry_getCountry']);
    expect(memberCopy.parameters).toMatchObject({ emailMe: true, additionalEmails: [] });
    expect(Number(memberCopy.parameters.displayFormat)).toBe(2);

    for (const login of [memberWithoutSiteAccess, invited]) {
      expect(await reportsOf(login, description)).toEqual([]);
    }

    // copying again gives another copy
    expect(await copy(api[owner], idReport, group.idGroup)).toEqual([member]);
    expect(await reportsOf(member, description)).toHaveLength(2);
  });

  test('a copy is independent of the original and managed by its member', async () => {
    const description = `Independent ${RUN_ID}`;
    const idReport = await addReport(api[owner], 'Independent');
    expect(await copy(api[owner], idReport)).toEqual([member]);
    const idCopy = Number((await reportsOf(member, description))[0].idreport);

    // the member sees only the copy, not the original
    const visible = ((await api[member].call('ScheduledReports.getReports', { idSite })) as Report[]).map((r) => Number(r.idreport));
    expect(visible).toContain(idCopy);
    expect(visible).not.toContain(idReport);

    await api[member].call('ScheduledReports.updateReport', {
      idReport: idCopy,
      ...reportParams(`Changed by member ${RUN_ID}`, idSite, { 'parameters[emailMe]': true, 'parameters[additionalEmails]': [] }),
    });
    expect(await reportsOf(owner, description)).toHaveLength(1);

    await api[member].call('ScheduledReports.sendReport', { idReport: idCopy, force: true });
    const message = await waitForMessageTo(`${member}@example.org`);
    expect(message.HTML).toContain(`Changed by member ${RUN_ID}`);

    await api[member].call('ScheduledReports.deleteReport', { idReport: idCopy });
    expect(await reportsOf(owner, description)).toHaveLength(1);
  });

  test('reports with a segment can only be copied if the segment is shared with all users', async () => {
    const privateSegment = Number((await api[owner].call('SegmentEditor.add', {
      name: `Owner Private ${RUN_ID}`, definition: `pageUrl=@private-${RUN_ID}`, idSite,
    })).value);
    const idPrivate = await addReport(api[owner], 'Private Segment', idSite, { idSegment: privateSegment });
    await expect(api[owner].expectError('GroupPermissions.copyReportToGroup', { idReport: idPrivate, idGroup: team.idGroup }))
      .resolves.toContain('segment that is not shared with all users');
    // even if the segment is shared with the group: Matomo checks segments of reports itself
    await api[owner].call('GroupPermissions.shareSegmentWithGroup', { idSegment: privateSegment, idGroup: team.idGroup });
    await expect(api[owner].expectError('GroupPermissions.copyReportToGroup', { idReport: idPrivate, idGroup: team.idGroup }))
      .resolves.toContain('segment that is not shared with all users');
    expect(await reportsOf(member, `Private Segment ${RUN_ID}`)).toEqual([]);

    const allUsersSegment = Number((await su.call('SegmentEditor.add', {
      name: `All Users ${RUN_ID}`, definition: `pageUrl=@all-users-${RUN_ID}`, idSite, enabledAllUsers: 1,
    })).value);
    const idShared = await addReport(api[owner], 'All Users Segment', idSite, { idSegment: allUsersSegment });

    // only reports that can be copied are offered
    const copyable: CopyableReport[] = await api[owner].call('GroupPermissions.getCopyableReports', { filter_limit: -1 });
    expect(copyable.map((r) => r.idReport)).not.toContain(idPrivate);
    expect(copyable.find((r) => r.idReport === idShared)?.idSegment).toBe(allUsersSegment);

    expect(await copy(api[owner], idShared)).toEqual([member]);
    const [memberCopy] = await reportsOf(member, `All Users Segment ${RUN_ID}`);
    expect(Number(memberCopy.idsegment)).toBe(allUsersSegment);

    // the member can save and download the copy with the segment
    await api[member].call('ScheduledReports.updateReport', {
      idReport: Number(memberCopy.idreport), ...reportParams(`All Users Segment ${RUN_ID}`, idSite, { idSegment: allUsersSegment }),
    });
    const response = await api[member].fetchRaw('ScheduledReports.generateReport', {
      idReport: Number(memberCopy.idreport), date: 'yesterday', outputType: 3, format: 'html',
    });
    expect(response.ok).toBe(true);
  });

  test('super users can copy any email report, others only their own with admin access', async () => {
    const ownReport = await addReport(api[owner], 'Permission Report');
    const outsiderReport = await addReport(api[outsider], 'Outsider Report');

    // view access only
    await expect(api[outsider].expectError('GroupPermissions.copyReportToGroup', { idReport: outsiderReport, idGroup: team.idGroup }))
      .resolves.toMatch(/admin/i);
    await expect(api[outsider].expectError('GroupPermissions.getCopyableReports'))
      .resolves.toMatch(/admin/i);
    // report of another user
    await expect(api[owner].expectError('GroupPermissions.copyReportToGroup', { idReport: outsiderReport, idGroup: team.idGroup }))
      .resolves.toContain('does not exist or you are not allowed to copy it');
    await expect(api[owner].expectError('GroupPermissions.copyReportToGroup', { idReport: 999999, idGroup: team.idGroup }))
      .resolves.toContain('does not exist or you are not allowed to copy it');
    await expect(api[owner].expectError('GroupPermissions.copyReportToGroup', { idReport: ownReport, idGroup: 999999 }))
      .resolves.toContain('Group does not exist');

    const ownerReports: CopyableReport[] = await api[owner].call('GroupPermissions.getCopyableReports', { filter_limit: -1 });
    expect(ownerReports.map((r) => r.idReport)).toContain(ownReport);
    expect(ownerReports.map((r) => r.idReport)).not.toContain(outsiderReport);
    expect(ownerReports.every((r) => r.login === owner)).toBe(true);

    const allReports: CopyableReport[] = await su.call('GroupPermissions.getCopyableReports', { filter_limit: -1 });
    expect(allReports.find((r) => r.idReport === outsiderReport)).toEqual({
      idReport: outsiderReport,
      description: `Outsider Report ${RUN_ID}`,
      login: outsider,
      idSite,
      siteName: `Copy Report Site ${RUN_ID}`,
      period: 'week',
      idSegment: 0,
    });

    // super users can copy reports of other users; the owner of the original is a member and gets a copy too
    expect((await copy(su, outsiderReport)).sort()).toEqual([member, owner].sort());
    expect(await reportsOf(member, `Outsider Report ${RUN_ID}`)).toHaveLength(1);
  });

  test('reports with the All Websites dashboard show the websites of the member', async () => {
    const description = `All Websites ${RUN_ID}`;
    const idReport = await addReport(su, 'All Websites', idSite, { reports: ['MultiSites_getAll'] });
    expect(await copy(su, idReport)).toContain(member);

    const [memberCopy] = await reportsOf(member, description);
    const response = await api[member].fetchRaw('ScheduledReports.generateReport', {
      idReport: Number(memberCopy.idreport), date: 'yesterday', outputType: 3, format: 'html',
    });
    expect(response.ok).toBe(true);
    const html = await response.text();
    expect(html).toContain(`Copy Report Site ${RUN_ID}`);
    expect(html).not.toContain(`Copy Report Other Site ${RUN_ID}`);
  });

  test('losing all access to a website through groups deletes the reports of the website, like removing direct access', async () => {
    const site = await su.createSite('Report Access Loss Site');
    const keptSite = await su.createSite('Report Access Loss Kept Site');
    const [group, other, temp] = [
      await su.createGroup('Report Loss'), await su.createGroup('Report Loss Other'), await su.createGroup('Report Loss Temp'),
    ];
    const [groupOnly, direct, twoGroups, tempOnly] = [
      await su.createUser('rloss_group'), await su.createUser('rloss_direct'),
      await su.createUser('rloss_two'), await su.createUser('rloss_temp'),
    ];
    await su.addMembers(group.idGroup, [groupOnly, direct, twoGroups]);
    await su.addMembers(other.idGroup, [twoGroups]);
    await su.addMembers(temp.idGroup, [tempOnly]);
    await su.setGroupAccess(group.name, 'write', `${site},${keptSite}`);
    await su.setGroupAccess(other.name, 'view', site);
    await su.setGroupAccess(temp.name, 'view', site);
    await su.setUserAccess(direct, 'view', site);

    const description = `Access Loss ${RUN_ID}`;
    for (const login of [groupOnly, direct, twoGroups, tempOnly]) {
      await addReport(await MatomoApi.forUser(login, DEFAULT_PASSWORD), 'Access Loss', site);
    }
    await addReport(await MatomoApi.forUser(groupOnly, DEFAULT_PASSWORD), 'Access Loss', keptSite);
    const count = async (login: string, inSite: number) =>
      (await reportsOf(login, description)).filter((r) => Number(r.idsite) === inSite).length;

    // a lower role keeps the access
    await su.setGroupAccess(group.name, 'view', site);
    expect(await count(groupOnly, site)).toBe(1);

    await su.setGroupAccess(group.name, 'noaccess', site);
    expect(await count(groupOnly, site)).toBe(0);
    expect(await count(groupOnly, keptSite)).toBe(1);
    // still have access directly or through another group
    expect(await count(direct, site)).toBe(1);
    expect(await count(twoGroups, site)).toBe(1);

    await su.call('GroupPermissions.removeUserFromGroup', { idGroup: other.idGroup, login: twoGroups });
    expect(await count(twoGroups, site)).toBe(0);

    await su.call('GroupPermissions.deleteGroup', { idGroup: temp.idGroup });
    expect(await count(tempOnly, site)).toBe(0);
  });

  test.describe('UI', () => {
    test.use({ storageState: superUserStorageState });

    test('a report can be copied in the group editor', async ({ page }) => {
      const group = await su.createGroup('Copy Report UI');
      await su.addMembers(group.idGroup, [member]);
      const idReport = await addReport(api[owner], 'UI Report');
      const reportName = `UI Report ${RUN_ID}`;

      await openGroupEditor(page, group.idGroup, 'members');
      await switchEditorTab(page, 'reports');

      const form = page.locator('.groupPermissionsCopyReport');
      await chooseOption(form.locator('.groupPermissionsReportField'), `${reportName} (Copy Report Site ${RUN_ID}, ${owner})`);
      await screenshot(page.locator('.groupPermissionsEditGroup'), 'group-editor-reports');
      await saveButton(form, 'groupPermissionsCopyReportButton').click();
      await waitForIdle(page);
      await expect(toast(page, `The report '${reportName}' was copied to 1 member(s) of the group '${group.name}'.`)).toBeVisible();

      const [memberCopy] = await reportsOf(member, reportName);
      expect(Number(memberCopy.idreport)).not.toBe(idReport);

      // the URL keeps the section
      await page.reload();
      await expect(page.locator('.groupPermissionsEditGroup .listCircle li[data-tab="reports"]')).toHaveClass(/active/);
    });
  });
});
