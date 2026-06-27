import { test as setup, expect } from '@playwright/test';
import { signIn } from './helpers/login';
const adminAuthFile = 'e2e/.auth/admin.json';
const operatorAuthFile = 'e2e/.auth/operator.json';
setup('authenticate as admin', async ({ page }) => {
    await signIn(page, 'admin');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Platform Overview' })).toBeVisible();
    await page.context().storageState({ path: adminAuthFile });
});
setup('authenticate as operator', async ({ page }) => {
    await signIn(page, 'operator');
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Fleet Overview' })).toBeVisible();
    await page.context().storageState({ path: operatorAuthFile });
});
//# sourceMappingURL=auth.setup.js.map