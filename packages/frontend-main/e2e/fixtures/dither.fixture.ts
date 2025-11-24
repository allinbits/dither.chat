import { test as base } from '@playwright/test';

import { HomePage } from '../pom/home.pom';

export const testWithDither = base.extend<{
  homePage: HomePage;
}>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
