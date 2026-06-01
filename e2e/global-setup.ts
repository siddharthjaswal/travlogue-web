import { chromium, type FullConfig } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

const LOGBOOK_DIR = path.resolve(__dirname, '../../logbook');
const PY = path.join(LOGBOOK_DIR, 'venv', 'bin', 'python');

/**
 * Mint a JWT for a dev user via the logbook backend (no Google OAuth), then
 * persist it into localStorage as an authenticated Playwright storageState.
 */
async function globalSetup(config: FullConfig) {
    const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000';

    let token: string;
    try {
        const out = execFileSync(PY, ['scripts/mint_test_token.py'], {
            cwd: LOGBOOK_DIR,
            encoding: 'utf-8',
        });
        const m = out.match(/<<<TOKEN>>>(.+?)<<<END>>>/);
        if (!m) throw new Error(`No token in output:\n${out}`);
        token = m[1].trim();
    } catch (e) {
        throw new Error(
            `Failed to mint test token. Is the logbook venv set up and the DB seeded?\n${e}`
        );
    }

    if (!token || token.length < 20) {
        throw new Error('Minted token looks invalid');
    }

    mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(baseURL);
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.context().storageState({ path: AUTH_FILE });
    await browser.close();

    if (!existsSync(AUTH_FILE)) {
        throw new Error('Failed to write auth storageState');
    }
}

export default globalSetup;
