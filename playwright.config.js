const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 2 : 0,
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node tests/dev-server.js',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
