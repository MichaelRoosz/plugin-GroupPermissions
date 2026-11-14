import { chromium, FullConfig } from '@playwright/test';
import fs from 'node:fs';
import { SUPERUSER, AUTH_DIR, superUserStorageState } from './helpers/env';
import { login } from './helpers/ui';

/**
 * Logs the super user in once and stores the session, so the specs can start authenticated.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  await login(page, SUPERUSER.login, SUPERUSER.password);
  await page.context().storageState({ path: superUserStorageState });
  await browser.close();
}
