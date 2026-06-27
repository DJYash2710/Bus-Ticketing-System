import { test, expect } from '@playwright/test'

test.describe('Cities (admin)', () => {
  test('admin can open cities page and add-city modal', async ({ page }) => {
    await page.goto('/admin/cities')

    await expect(page.getByRole('heading', { name: 'Cities' })).toBeVisible()
    await expect(page.getByText('Manage cities served by the platform')).toBeVisible()

    await page.getByRole('button', { name: 'Add city' }).click()
    await expect(page.getByRole('heading', { name: 'Add city' })).toBeVisible()
    await expect(page.getByPlaceholder('City name')).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'Add city' })).not.toBeVisible()
  })
})
