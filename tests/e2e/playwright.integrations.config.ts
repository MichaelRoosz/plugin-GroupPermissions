import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Integration tests with the login plugins LoginLdap, LoginOIDC and RebelOIDC, run by bin/integration-test.sh
 * (which installs and configures them) after the main suite.
 */
export default defineConfig({
  ...baseConfig,
  testDir: './specs-integrations',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-integrations' }]],
  outputDir: 'test-results-integrations',
});
