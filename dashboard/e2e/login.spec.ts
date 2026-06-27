import { test, expect } from '@playwright/test'
import { TEST_USERS } from './helpers/credentials'
import { signIn } from './helpers/login'

test.describe('Login', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/buses')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'TealTransit Operations' })).toBeVisible()
  })

  test('admin can sign in and reach overview', async ({ page }) => {
    await signIn(page, 'admin')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Platform Overview' })).toBeVisible()
  })

  test('operator can sign in and reach overview', async ({ page }) => {
    await signIn(page, 'operator')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Fleet Overview' })).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email Address').fill(TEST_USERS.admin.email)
    await page.getByLabel('Password').fill('WrongPass1')

    const loginRequest = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/login') && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Sign In' }).click()
    const response = await loginRequest

    expect(response.status()).toBe(401)
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled()
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })
})
