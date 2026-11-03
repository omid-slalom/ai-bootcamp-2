const { defineConfig, devices } = require('@playwright/test');

const BACKEND_PORT = process.env.BACKEND_PORT || 3030;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

module.exports = defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${FRONTEND_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start:backend',
      url: `http://localhost:${BACKEND_PORT}`,
      env: { PORT: String(BACKEND_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run start:frontend',
      url: `http://localhost:${FRONTEND_PORT}`,
      env: { PORT: String(FRONTEND_PORT), BROWSER: 'none' },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
