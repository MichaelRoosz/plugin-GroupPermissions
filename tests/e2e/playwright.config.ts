import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  // the specs share one Matomo instance, keep them sequential so screenshots are deterministic
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  globalSetup: './global-setup.ts',
  outputDir: 'test-results',
  use: {
    baseURL: process.env.MATOMO_URL || 'http://localhost:8089',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    locale: 'en-US',
    timezoneId: 'UTC',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
