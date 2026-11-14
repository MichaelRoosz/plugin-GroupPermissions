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
  const search = selector.locator('input.websiteSearch');
  if (await search.isVisible()) {
    await search.fill(siteName);
  }
  await selector.locator('.custom_select_ul_list li a', { hasText: siteName }).first().click();
  await expect(selector.locator('.title')).toContainText(siteName);
  await waitForIdle(page);
}

/** Selects an option in a vue-multiselect component by typing its label. */
export async function multiselectPick(multiselect: Locator, label: string): Promise<void> {
  await multiselect.click();
  await multiselect.locator('input.multiselect__input').fill(label);
  await multiselect.locator('.multiselect__option', { hasText: label }).first().click();
}

// ---- Manage Access tab ----

export const ACCESS_LEVELS = ['noaccess', 'view', 'write', 'admin'] as const;
export type AccessLevel = typeof ACCESS_LEVELS[number];

/** Row of a group in the Manage Access table (columns: name | none | view | write | admin). */
export function accessRow(page: Page, groupName: string): Locator {
  return page.locator('.entityTable tbody tr', { has: page.locator('td:first-child', { hasText: new RegExp(`^\\s*${escapeRegExp(groupName)}\\s*$`) }) });
}

export function accessCell(row: Locator, access: AccessLevel): Locator {
  return row.locator('td').nth(ACCESS_LEVELS.indexOf(access) + 1);
}

/** Asserts that exactly the given access level is marked as granted in the row. */
export async function expectAccess(row: Locator, access: AccessLevel): Promise<void> {
  for (const level of ACCESS_LEVELS) {
    await expect(accessCell(row, level).locator(level === access ? 'img.accessGranted' : 'img.updateAccess')).toBeVisible();
  }
}

/** Group names in the order shown in the Manage Access table. */
export async function accessTableGroups(page: Page): Promise<string[]> {
  return (await page.locator('.entityTable tbody tr td:first-child').allInnerTexts()).map((t) => t.trim());
}

// ---- Manage Groups tab ----

export function manageGroupCard(page: Page): Locator {
  return page.locator('.card', { has: page.locator('h2', { hasText: /^Manage group$/ }) });
}

export function renameInput(page: Page): Locator {
  return manageGroupCard(page).locator('h3', { hasText: 'Rename this group' })
    .locator('xpath=following-sibling::div[1]').locator('input[type=text]');
}

/** Labels of all options of a vue-multiselect (opens and closes the dropdown). */
export async function multiselectOptions(multiselect: Locator): Promise<string[]> {
  await multiselect.click();
  const labels = (await multiselect.locator('.multiselect__element .multiselect__option > span').allInnerTexts()).map((t) => t.trim());
  await multiselect.locator('input.multiselect__input').press('Escape');
  return labels;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
