import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	// Since the backend is not available during the test,
	// we expect the fallback title from the layout data.
	await expect(page.getByRole('heading', { name: 'My Portfolio' })).toBeVisible();
});

test('theme toggle works correctly', async ({ page }) => {
	await page.goto('/');

	const html = page.locator('html');
	const themeToggleButton = page.getByLabel('Toggle theme');

	// Check initial theme (it should default to light without system preference)
	await expect(html).not.toHaveClass(/dark/);

	// Click the toggle to switch to dark mode
	await themeToggleButton.click();
	await expect(html).toHaveClass(/dark/);

	// Click the toggle again to switch back to light mode
	await themeToggleButton.click();
	await expect(html).not.toHaveClass(/dark/);
});
