const { defineConfig, devices } = require('@playwright/test')

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000'

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 120_000,
  expect: {
    timeout: 30_000
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: 'yarn dev',
        cwd: '../..',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 300_000,
        stdout: 'pipe',
        stderr: 'pipe'
      }
})
