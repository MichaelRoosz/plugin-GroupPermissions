import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { MatomoApi } from '../helpers/api';
import { DEFAULT_PASSWORD, PLUGIN_DIR, SUPERUSER } from '../helpers/env';
import { login, openGroupPermissions } from '../helpers/ui';

function read(file: string): string {
  return fs.readFileSync(path.join(PLUGIN_DIR, file), 'utf8');
}

function listFiles(dir: string, ext: RegExp, recursive = true): string[] {
  return fs.readdirSync(path.join(PLUGIN_DIR, dir), { recursive, encoding: 'utf8' })
    .filter((f) => ext.test(f))
    .map((f) => path.join(dir, f));
}

/** Translation keys registered for the client side in GroupPermissions::getClientSideTranslationKeys(). */
function clientSideKeys(): Set<string> {
  return new Set([...read('GroupPermissions.php').matchAll(/\$translations\[\] = '([A-Za-z]+_[A-Za-z0-9]+)'/g)].map((m) => m[1]));
}

/** Keys used by translate('...') / _pk_translate('...') in the Vue sources and the plugin's JavaScript. */
function usedClientKeys(): Set<string> {
  const files = [...listFiles('vue/src', /\.(vue|ts)$/), ...listFiles('javascripts', /\.js$/)];
  const keys = new Set<string>();
  for (const file of files) {
    for (const m of read(file).matchAll(/(?:\btranslate|_pk_translate)\(\s*'([A-Za-z]+_[A-Za-z0-9]+)'/g)) keys.add(m[1]);
  }
  return keys;
}

test.describe('Translations', () => {
  test('every key used in Vue/JS is registered for the client side', () => {
    const registered = clientSideKeys();
    const missing = [...usedClientKeys()].filter((k) => !registered.has(k));
    expect(missing).toEqual([]);
  });

  test('every GroupPermissions key used anywhere exists in lang/en.json', () => {
    const en = JSON.parse(read('lang/en.json')).GroupPermissions as Record<string, string>;
    const sources = [
      ...listFiles('.', /\.php$/, false), ...listFiles('Dao', /\.php$/), ...listFiles('templates', /\.twig$/),
      ...listFiles('vue/src', /\.(vue|ts)$/), ...listFiles('javascripts', /\.js$/),
    ].map(read).join('\n');
    // GroupPermissions_API is a DI container id, not a translation key
    const notTranslations = new Set(['API']);
    const used = new Set([...sources.matchAll(/GroupPermissions_([A-Za-z0-9]+)/g)].map((m) => m[1]).filter((k) => !notTranslations.has(k)));
    const missing = [...used].filter((k) => !(k in en));
    expect(missing).toEqual([]);
  });

  test('every translation file is valid JSON with only known keys and the same placeholders', () => {
    const en = JSON.parse(read('lang/en.json')).GroupPermissions as Record<string, string>;
    const placeholders = (s: string) => (s.match(/%(\d\$)?s/g) || []).sort();
    for (const file of listFiles('lang', /\.json$/)) {
      const data = JSON.parse(read(file));
      const translations = (data.GroupPermissions || {}) as Record<string, string>;
      for (const [key, value] of Object.entries(translations)) {
        expect(en, `${file}: unknown key ${key}`).toHaveProperty([key]);
        expect(placeholders(value), `${file}: placeholders of ${key}`).toEqual(placeholders(en[key]));
      }
    }
  });

  test('the admin page in German shows no untranslated keys', async ({ page }) => {
    const su = await MatomoApi.superUser();
    const germanAdmin = await su.createUser('german_su');
    await su.call('UsersManager.setSuperUserAccess', {
      userLogin: germanAdmin, hasSuperUserAccess: 1, passwordConfirmation: SUPERUSER.password,
    });
    await su.call('LanguagesManager.setLanguageForUser', { login: germanAdmin, languageCode: 'de' });

    await login(page, germanAdmin, DEFAULT_PASSWORD);
    for (const tab of ['access', 'groups'] as const) {
      await openGroupPermissions(page, tab);
      await expect(page.locator('.groupPermissionsTabs li')).toHaveText(['Rechte verwalten', 'Gruppen verwalten']);
      const text = await page.locator('#content').innerText();
      expect(text).not.toMatch(/\b[A-Z][A-Za-z]+_[A-Z][A-Za-z0-9]+\b/);
    }
  });
});
