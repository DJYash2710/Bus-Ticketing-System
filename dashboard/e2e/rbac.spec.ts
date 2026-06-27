import { test, expect } from '@playwright/test'

test.describe('Operator access control', () => {
  test('operator can access fleet pages', async ({ page }) => {
    await page.goto('/buses')
    await expect(page).toHaveURL('/buses')
    await expect(page.getByRole('heading', { name: 'My Buses' })).toBeVisible()
  })

  test('operator cannot access admin cities', async ({ page }) => {
    await page.goto('/admin/cities')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Fleet Overview' })).toBeVisible()
  })

  test('operator sidebar hides admin section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'My Buses' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cities' })).not.toBeVisible()
  })
})
