import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60_000,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'login',
      testMatch: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin',
      testIgnore: [/auth\.setup\.ts/, /login\.spec\.ts/, /rbac\.spec\.ts/],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'operator',
      testMatch: /rbac\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/operator.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:4000/health',
      cwd: repoRoot,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
