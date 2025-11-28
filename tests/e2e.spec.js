const { test, expect } = require('@playwright/test');

test.describe('nginx file browser UI', () => {
  test('renders file listings and keeps the selected theme', async ({ page }) => {
    await page.goto('/index.html');

    const rootEntries = page.locator('#file-list li .file-name');
    await expect(rootEntries).toHaveCount(2);
    await expect(rootEntries.nth(0)).toHaveText('documents');
    await expect(rootEntries.nth(1)).toHaveText('readme.txt');

    await page.getByRole('link', { name: 'documents' }).click();

    const nestedEntries = page.locator('#file-list li .file-name');
    await expect(nestedEntries.nth(0)).toHaveText('..');
    await expect(nestedEntries.nth(1)).toHaveText('notes.txt');

    await page.getByLabel('dark').check();
    await expect(page.locator('body')).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator('body')).toHaveClass(/dark/);
  });
});
