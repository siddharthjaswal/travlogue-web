import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. Assumes the dev servers are already running:
 *   - web      → http://localhost:3000
 *   - logbook  → http://localhost:8000
 *
 * `globalSetup` mints a JWT for a dev user (bypassing Google OAuth) and saves
 * an authenticated storageState to e2e/.auth/user.json.
 */
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: 'list',
    globalSetup: './e2e/global-setup.ts',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
