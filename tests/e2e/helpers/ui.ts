import { expect, Page, Locator } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { SCREENSHOT_DIR } from './env';

export async function login(page: Page, login: string, password: string): Promise<void> {
  await page.goto('/index.php?module=Login');
  await page.locator('#login_form_login').fill(login);
  await page.locator('#login_form_password').fill(password);
  await page.locator('#login_form_submit').click();
  await page.waitForURL((url) => !url.searchParams.has('module') || url.searchParams.get('module') !== 'Login');
  await expect(page.locator('#login_form')).toHaveCount(0);
}

/** Waits until Matomo finished all pending AJAX requests and loading indicators disappeared. */
export async function waitForIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.loadingPiwik:visible, .loading-indicator:visible')).toHaveCount(0);
}

/**
 * Saves a documentation screenshot to tests/e2e/screenshots/<name>.png.
 * Dynamic values (run ids in user/group names) are masked by the caller where necessary.
 */
export async function screenshot(target: Page | Locator, name: string, options: { mask?: Locator[] } = {}) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await target.screenshot({ path: file, animations: 'disabled', mask: options.mask });
  return file;
}

export async function openGroupPermissions(page: Page, tab: 'access' | 'groups', extra = '', idSite = 1): Promise<void> {
  await page.goto(`/index.php?module=GroupPermissions&action=index&idSite=${idSite}&period=day&date=yesterday&show=${tab}${extra}`);
  await waitForIdle(page);
}

/**
 * Clicks a button of the currently open Matomo modal (piwikHelper.modalConfirm turns
 * <input role="yes"> etc. into footer buttons).
 */
export async function clickModalButton(page: Page, label: RegExp | string): Promise<void> {
  const modal = page.locator('.modal.open').last();
  await expect(modal).toBeVisible();
  await modal.locator('.modal-footer').getByText(label instanceof RegExp ? label : new RegExp(`^\\s*${label}\\s*$`, 'i')).click();
  // not waiting for the modal to be hidden: the action may immediately open the next modal (e.g. an alert)
}

/** Confirms Matomo's password confirmation modal. */
export async function confirmPassword(page: Page, password: string): Promise<void> {
  const modal = page.locator('.confirm-password-modal.open');
  await expect(modal).toBeVisible();
  // the Field component updates its model on keyup, fill() would not enable the button
  await modal.locator('input[type=password]').pressSequentially(password);
  await modal.locator('.modal-footer .modal-close.btn').click();
  await expect(modal).toBeHidden();
}

/** Closes the dropdown of a vue-multiselect component. */
export async function multiselectClose(multiselect: Locator): Promise<void> {
  await multiselect.locator('input.multiselect__input').press('Escape');
  await expect(multiselect.locator('.multiselect__content-wrapper')).toBeHidden();
}

/** Picks a website in Matomo's site selector. */
export async function selectSite(page: Page, siteName: string): Promise<void> {
  const selector = page.locator('.siteSelector').first();
  await selector.locator('.title').click();
  // the search box is only shown when there are many websites
  const search = selector.locator('input.mtm-searchInput__input');
  if (await search.isVisible()) {
    await search.fill(siteName);
  }
  await selector.locator('.mtm-dropdownPanel__menu a.mtm-dropdownPanel__menuLink', { hasText: siteName }).first().click();
  await expect(selector.locator('.title')).toContainText(siteName);
  await waitForIdle(page);
}

/** Selects an option in a vue-multiselect component by typing its label. */
export async function multiselectPick(multiselect: Locator, label: string): Promise<void> {
  await multiselect.click();
  await multiselect.locator('input.multiselect__input').fill(label);
  await multiselect.locator('.multiselect__option', { hasText: label }).first().click();
}

// ---- Matomo form fields ----

/**
 * Fills a text input. Matomo's text Field updates its model on keydown (one key late) and on change,
 * so the change event (fired by the browser when leaving the field) is dispatched as well.
 */
export async function fillField(input: Locator, value: string): Promise<void> {
  await input.fill(value);
  await input.dispatchEvent('change');
}

/** The (materialize) select of a Matomo select Field inside the given container. */
export function roleSelect(container: Locator): Locator {
  return container.locator('input.select-dropdown').first();
}

/** Chooses an option of a Matomo select Field by its label. */
export async function chooseOption(container: Locator, label: string): Promise<void> {
  await roleSelect(container).click();
  const option = container.locator('ul.select-dropdown li', { hasText: new RegExp(`^\\s*${escapeRegExp(label)}\\s*$`) });
  await option.first().click();
}

export const ROLE_LABELS = {
  noaccess: 'No access',
  view: 'View',
  write: 'Write',
  admin: 'Admin',
} as const;
export type AccessLevel = keyof typeof ROLE_LABELS;
export const ACCESS_LEVELS = Object.keys(ROLE_LABELS) as AccessLevel[];

// ---- Manage Access tab ----

/** Row of a group in the Manage Access table. */
export function accessRow(page: Page, groupName: string): Locator {
  return page.locator('tr.groupPermissionsAccessRow', {
    has: page.locator('td.groupName', { hasText: new RegExp(`^\\s*${escapeRegExp(groupName)}\\s*$`) }),
  });
}

export async function expectAccess(row: Locator, access: AccessLevel): Promise<void> {
  await expect(roleSelect(row)).toHaveValue(ROLE_LABELS[access]);
}

/** Changes the role of a group in the Manage Access table and waits until it is saved. */
export async function setAccess(page: Page, row: Locator, access: AccessLevel): Promise<void> {
  await chooseOption(row, ROLE_LABELS[access]);
  await waitForIdle(page);
  await expectAccess(row, access);
}

/** Group names in the order shown in the Manage Access table. */
export async function accessTableGroups(page: Page): Promise<string[]> {
  return (await page.locator('tr.groupPermissionsAccessRow td.groupName').allInnerTexts()).map((t) => t.trim());
}

// ---- Manage Groups tab ----

export function groupRow(page: Page, groupName: string): Locator {
  return page.locator('tr.groupPermissionsGroupRow', {
    has: page.locator('td.groupName', { hasText: new RegExp(`^\\s*${escapeRegExp(groupName)}\\s*$`) }),
  });
}

/** Group names in the order shown in the group list. */
export async function groupListNames(page: Page): Promise<string[]> {
  return (await page.locator('tr.groupPermissionsGroupRow td.groupName').allInnerTexts()).map((t) => t.trim());
}

export type EditorTab = 'members' | 'access' | 'autoaccess' | 'segments' | 'reports' | 'sync' | 'settings';

/** Opens the editor of a group directly (the view is kept in the URL hash). */
export async function openGroupEditor(page: Page, idGroup: number, tab: EditorTab = 'members'): Promise<void> {
  await page.goto(`/index.php?module=GroupPermissions&action=index&idSite=1&period=day&date=yesterday&show=groups#?idGroup=${idGroup}&groupTab=${tab}`);
  await expect(page.locator('.groupPermissionsEditGroup')).toBeVisible();
  await waitForIdle(page);
}

export function groupEditor(page: Page): Locator {
  return page.locator('.groupPermissionsEditGroup');
}

export async function switchEditorTab(page: Page, tab: EditorTab): Promise<void> {
  await groupEditor(page).locator(`.listCircle li[data-tab="${tab}"] a`).click();
  await expect(groupEditor(page).locator(`.listCircle li[data-tab="${tab}"]`)).toHaveClass(/active/);
  await waitForIdle(page);
}

export function memberRow(page: Page, login: string): Locator {
  return page.locator('tr.groupPermissionsMemberRow', {
    has: page.locator('td.login .memberLogin', { hasText: new RegExp(`^\\s*${escapeRegExp(login)}\\s*$`) }),
  });
}

export async function memberLogins(page: Page): Promise<string[]> {
  return (await page.locator('tr.groupPermissionsMemberRow td.login .memberLogin').allInnerTexts()).map((t) => t.trim());
}

export function websiteRow(page: Page, siteName: string): Locator {
  return page.locator('tr.groupPermissionsWebsiteRow', {
    has: page.locator('td.siteName', { hasText: new RegExp(`^\\s*${escapeRegExp(siteName)}\\s*$`) }),
  });
}

/** Clicks a save button (Matomo's SaveButton component renders an input inside a wrapper). */
export function saveButton(container: Locator, cssClass: string): Locator {
  return container.locator(`.${cssClass} input[type=button]`);
}

/** Labels of all options of a vue-multiselect (opens and closes the dropdown). */
export async function multiselectOptions(multiselect: Locator): Promise<string[]> {
  await multiselect.click();
  const labels = (await multiselect.locator('.multiselect__element .multiselect__option > span').allInnerTexts()).map((t) => t.trim());
  await multiselect.locator('input.multiselect__input').press('Escape');
  return labels;
}

/** Text of the success toast (Matomo notifications). */
export function toast(page: Page, text: string | RegExp): Locator {
  return page.locator('.notification', { hasText: text });
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
