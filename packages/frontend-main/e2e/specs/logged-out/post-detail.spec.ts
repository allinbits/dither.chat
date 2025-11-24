import { baseTest as test } from '../../fixtures/base.fixture';

test('displays post details', async ({ page }) => {
  await page.goto('/post/de5bcc63d265e235e70fbc597c48c2b7412994b80b9bfde1618c4766ecfe9a80');
  test.expect(page.getByText('Post', { exact: true }));
});
