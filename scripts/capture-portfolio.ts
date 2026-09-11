import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { createGame } from '../src/game/engine';
import type { Unit } from '../src/game/types';
// A staged midgame QA fixture, not a claim that these assets document an organically played run.
const g = createGame(20260911, 'cynthia');
Object.assign(g, {
  round: 8,
  level: 6,
  xp: 12,
  gold: 38,
  hp: 82,
  charge: 3,
  wins: 6,
  losses: 1,
  serial: 30,
  inventory: ['muscle', 'amplifier'],
  wishes: ['growth'],
  message: 'Two Water. Two Psychic. Two Ghost. A constellation takes shape.',
});
const unit = (
  uid: string,
  family: string,
  star: number,
  cell: number | null,
  item?: string,
): Unit => ({ uid, family, star, cell, bond: 0, item });
g.units = [
  unit('u1', 'squirtle', 2, 23, 'vest'),
  unit('u2', 'mudkip', 2, 25),
  unit('u3', 'beldum', 2, 24),
  unit('u4', 'ralts', 2, 39, 'glasses'),
  unit('u5', 'gastly', 2, 29),
  unit('u6', 'dreepy', 2, 37),
  unit('u7', 'dreepy', 2, null),
  unit('u8', 'dreepy', 1, null),
  unit('u9', 'dreepy', 1, null),
  unit('u10', 'togepi', 1, null),
];
g.shop = ['dreepy', 'bagon', 'larvitar', 'riolu', 'magnemite'];
await mkdir('docs/portfolio', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1040 },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(
    (state) => localStorage.setItem('checkmate.galaxy.v1', JSON.stringify(state)),
    g,
  );
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173');
  await page.getByRole('button', { name: 'Select Kirlia, 2 stars', exact: true }).click();
  await page.evaluate(() =>
    Promise.all(Array.from(document.images).map((i) => i.decode().catch(() => {}))),
  );
  await page.screenshot({
    path: 'docs/portfolio/checkmate-v1-hero.jpg',
    type: 'jpeg',
    quality: 88,
    fullPage: true,
  });
  await page
    .locator('.arena-column')
    .screenshot({ path: 'docs/portfolio/checkmate-formation.jpg', type: 'jpeg', quality: 90 });
  await page
    .locator('.inspector')
    .screenshot({ path: 'docs/portfolio/checkmate-details.jpg', type: 'jpeg', quality: 90 });
  await page.getByRole('button', { name: 'Buy Dreepy for 4 gold', exact: true }).click();
  await page.getByRole('button', { name: 'Select Dragapult, 3 stars', exact: true }).click();
  await page.screenshot({
    path: 'docs/portfolio/checkmate-evolution.jpg',
    type: 'jpeg',
    quality: 88,
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Trainer power 3/3', exact: true }).click();
  await page.getByRole('button', { name: 'Enter the rift', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.battle-effects line'));
  await page
    .locator('.arena-column')
    .screenshot({ path: 'docs/portfolio/checkmate-combat.jpg', type: 'jpeg', quality: 90 });
  console.log('Saved five final V1 screenshots from the documented QA fixture.');
} finally {
  await browser.close();
}
