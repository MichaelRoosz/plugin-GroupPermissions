import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Screenshots for the Matomo Marketplace, run by bin/marketplace-screenshots.sh.
 */
export default defineConfig({
  ...baseConfig,
  testDir: './specs-screenshots',
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results-screenshots',
});
