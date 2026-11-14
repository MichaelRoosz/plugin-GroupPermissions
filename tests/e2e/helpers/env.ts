import path from 'node:path';

export const SUPERUSER = {
  login: process.env.SUPERUSER_LOGIN || 'superuser',
  password: process.env.SUPERUSER_PASSWORD || 'superUserPass1!',
};

export const MATOMO_URL = process.env.MATOMO_URL || 'http://localhost:8089';
export const MAILPIT_URL = process.env.MAILPIT_URL || 'http://localhost:8025';

export const AUTH_DIR = path.join(__dirname, '..', '.auth');
export const superUserStorageState = path.join(AUTH_DIR, 'superuser.json');

/** Directory the documentation screenshots are written to. */
export const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

/** Unique suffix so every test run works with fresh users/groups on a reused Matomo instance. */
export const RUN_ID = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;

export const DEFAULT_PASSWORD = 'secretPass1!';

/** Root of the plugin sources (mounted read-only into the Playwright container). */
export const PLUGIN_DIR = process.env.PLUGIN_DIR || path.join(__dirname, '..', '..', '..');
