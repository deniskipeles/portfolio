import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	// Since the backend is not available during the test,
	// we expect the fallback title from the layout data.
	await expect(page.getByRole('heading', { name: 'My Portfolio' })).toBeVisible();
});

test.describe('mobile navigation', () => {
	test.use({ viewport: { width: 375, height: 667 } }); // iPhone 6/7/8

	test('theme toggle works correctly on mobile', async ({ page }) => {
		await page.goto('/');

		const html = page.locator('html');
		const themeToggleButton = page.locator('.md\\:hidden').getByLabel('Toggle theme');

		// Check initial theme
		await expect(html).not.toHaveClass(/dark/);

		// Toggle to dark mode
		await themeToggleButton.click();
		await expect(html).toHaveClass(/dark/);

		// Toggle back to light mode
		await themeToggleButton.click();
		await expect(html).not.toHaveClass(/dark/);
	});

	test('hamburger menu opens and closes', async ({ page }) => {
		await page.goto('/');

		const hamburgerButton = page.getByLabel('Toggle menu');
		const mobileNav = page.locator('div.md\\:hidden > ul');

		// Menu should be hidden initially
		await expect(mobileNav).toBeHidden();

		// Open the menu
		await hamburgerButton.click();
		await expect(mobileNav).toBeVisible();

		// Close the menu
		await hamburgerButton.click();
		await expect(mobileNav).toBeHidden();
	});
});
