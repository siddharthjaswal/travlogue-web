import { test, expect } from '@playwright/test';

// Unauthenticated — explicitly clear any stored auth state.
test.use({ storageState: { cookies: [], origins: [] } });

test('landing page loads', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBeLessThan(400);
    // The marketing page mentions the product name somewhere.
    await expect(page.locator('body')).toContainText(/Travlogue/i);
});

test('login page renders a sign-in affordance', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/google/i).first()).toBeVisible();
});
