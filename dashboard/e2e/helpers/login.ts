import type { Page } from '@playwright/test'
import { TEST_USERS } from './credentials'

type TestUser = keyof typeof TEST_USERS

export async function signIn(page: Page, user: TestUser = 'admin') {
  const { email, password } = TEST_USERS[user]

  await page.goto('/login')
  await page.getByLabel('Email Address').fill(email)
  await page.getByLabel('Password').fill(password)

  const loginRequest = page.waitForResponse(
    (response) =>
      response.url().includes('/auth/login') && response.request().method() === 'POST',
    { timeout: 30_000 },
  )

  await page.getByRole('button', { name: 'Sign In' }).click()
  await loginRequest
  await page.waitForURL('/', { timeout: 30_000 })
}
