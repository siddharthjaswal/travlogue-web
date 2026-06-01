import { test, expect } from '@playwright/test';
import { AUTH_FILE } from './global-setup';

// Use the minted-JWT session. Read-only: these tests don't create/delete data.
test.use({ storageState: AUTH_FILE });

test('dashboard shows the user trips', async ({ page }) => {
    await page.goto('/dashboard/trips');
    await expect(page.getByRole('heading', { name: 'My Trips' })).toBeVisible();
    // At least one trip card renders (dev DB is seeded with trips).
    await expect(page.getByText(/Icelandic Roadtrip/i).first()).toBeVisible({ timeout: 15000 });
});

test('Iceland trip shows correct Reykjavík weather (not the 33°C bug)', async ({ page }) => {
    await page.goto('/dashboard/trips');
    await page.getByText(/Icelandic Roadtrip/i).first().click();

    // Weather panel resolves to Reykjavík with a realistic temperature.
    await expect(page.getByText(/Reykjav/i).first()).toBeVisible({ timeout: 15000 });

    // The big "now" temperature should be a cool Iceland value, not the old 33°C bug.
    const tempEl = page.getByText(/^\d{1,2}°C$/).first();
    await expect(tempEl).toBeVisible({ timeout: 15000 });
    const temp = parseInt((await tempEl.textContent())!.replace(/[^\d]/g, ''), 10);
    expect(temp).toBeLessThan(25); // Iceland, not West-Africa ocean
});

test('Add Activity dialog shows icon type chips and time presets', async ({ page }) => {
    await page.goto('/dashboard/trips');
    await page.getByText(/Icelandic Roadtrip/i).first().click();
    await page.getByRole('button', { name: /^Add$/ }).first().click();

    // The redesigned dialog: icon type chips + quick time presets.
    await expect(page.getByRole('heading', { name: 'Add Activity' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sightseeing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Transport' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Morning' })).toBeVisible();

    // Selecting Transport reveals the mode chips.
    await page.getByRole('button', { name: 'Transport' }).click();
    await expect(page.getByRole('button', { name: 'Train' })).toBeVisible();
});
