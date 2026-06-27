import { test, expect } from '@playwright/test';
test.describe('Admin navigation', () => {
    test('sidebar links load the correct pages', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'My Buses' }).click();
        await expect(page).toHaveURL('/buses');
        await expect(page.getByRole('heading', { name: 'Buses' })).toBeVisible();
        await page.getByRole('link', { name: 'My Schedules' }).click();
        await expect(page).toHaveURL('/schedules');
        await expect(page.getByRole('heading', { name: 'All Schedules' })).toBeVisible();
        await page.getByRole('link', { name: 'My Bookings' }).click();
        await expect(page).toHaveURL('/bookings');
        await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
        await page.getByRole('link', { name: 'Cities' }).click();
        await expect(page).toHaveURL('/admin/cities');
        await expect(page.getByRole('heading', { name: 'Cities' })).toBeVisible();
    });
    test('logout returns to login', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page).toHaveURL('/login');
    });
});
//# sourceMappingURL=navigation.spec.js.map