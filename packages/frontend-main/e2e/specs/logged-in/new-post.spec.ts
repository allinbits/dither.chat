import { baseTest as test } from '../../fixtures/base.fixture';

test('opens new post dialog', async ({ connectWallet, homePage }) => {
  await connectWallet();
  await homePage.openNewPostDialog();
});
