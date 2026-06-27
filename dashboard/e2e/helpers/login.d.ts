import type { Page } from '@playwright/test';
import { TEST_USERS } from './credentials';
type TestUser = keyof typeof TEST_USERS;
export declare function signIn(page: Page, user?: TestUser): Promise<void>;
export {};
//# sourceMappingURL=login.d.ts.map