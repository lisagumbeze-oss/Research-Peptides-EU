import { defineConfig, devices } from 'playwright/test';

const iphone = devices['iPhone 13'];

export default defineConfig({
  testDir: './scripts',
  testMatch: 'phase2-compliance-smoke.spec.ts',
  timeout: 120_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.PHASE2_BASE_URL || 'http://127.0.0.1:5173',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } },
      grep: /Phase 2 — desktop/,
    },
    {
      name: 'mobile',
      use: {
        browserName: 'chromium',
        ...iphone,
        defaultBrowserType: 'chromium',
      },
      grep: /Phase 2 — mobile/,
    },
  ],
});
